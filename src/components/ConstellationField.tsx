import { useEffect, useRef } from "react";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
  driftFreqX: number;
  driftFreqY: number;
  driftPhaseX: number;
  driftPhaseY: number;
  driftAmp: number;
  tier: "northstar" | "anchor" | "field";
}

const COLS = 6;
const ROWS = 6;
const NODE_COUNT = COLS * ROWS;
const MAX_EDGE_DIST = 0.25;
const MOUSE_RADIUS = 150;
const MOUSE_FORCE = 3;
const ANCHOR_INDICES = new Set([0, 7, 14, 21, 28]);
const NORTH_STAR_COL = Math.round(COLS * 0.618);
const NORTH_STAR_ROW = Math.round(ROWS * 0.382);
const NORTH_STAR_INDEX = NORTH_STAR_ROW * COLS + NORTH_STAR_COL;

const ConstellationField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initNodes = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      sizeRef.current = { w, h };

      const rng = seededRandom(42);
      const cellW = w / COLS;
      const cellH = h / ROWS;
      const jitterX = cellW * 0.3;
      const jitterY = cellH * 0.3;

      const nodes: Node[] = [];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const i = row * COLS + col;
          const bx = (col + 0.5) * cellW + (rng() - 0.5) * jitterX * 2;
          const by = (row + 0.5) * cellH + (rng() - 0.5) * jitterY * 2;
          const tier: Node["tier"] =
            i === NORTH_STAR_INDEX
              ? "northstar"
              : ANCHOR_INDICES.has(i)
              ? "anchor"
              : "field";

          nodes.push({
            x: bx,
            y: by,
            baseX: bx,
            baseY: by,
            orbitRadius: tier === "field" ? 6 + rng() * 14 : 4 + rng() * 8,
            orbitSpeed:
              tier === "field"
                ? 0.0003 + rng() * 0.0005
                : 0.0001 + rng() * 0.0002,
            orbitPhase: rng() * Math.PI * 2,
            driftFreqX: 0.00003 + rng() * 0.00005,
            driftFreqY: 0.00003 + rng() * 0.00005,
            driftPhaseX: rng() * Math.PI * 2,
            driftPhaseY: rng() * Math.PI * 2,
            driftAmp: 20 + rng() * 30,
            tier,
          });
        }
      }
      nodesRef.current = nodes;
    };

    initNodes();

    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onPointerMove);

    const draw = (t: number) => {
      const { w, h } = sizeRef.current;
      const diag = Math.sqrt(w * w + h * h);
      const maxDist = diag * MAX_EDGE_DIST;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);
      const nodes = nodesRef.current;

      // Update positions — evolving drift + orbit + mouse repulsion
      for (const n of nodes) {
        const angle = n.orbitPhase + t * n.orbitSpeed;
        const driftX = Math.sin(t * n.driftFreqX + n.driftPhaseX) * n.driftAmp;
        const driftY = Math.sin(t * n.driftFreqY + n.driftPhaseY) * n.driftAmp;

        let nx = n.baseX + driftX + Math.cos(angle) * n.orbitRadius;
        let ny = n.baseY + driftY + Math.sin(angle * 0.7) * n.orbitRadius;

        // Mouse repulsion
        const mdx = nx - mouse.x;
        const mdy = ny - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < MOUSE_RADIUS && mDist > 0) {
          const force = ((MOUSE_RADIUS - mDist) / MOUSE_RADIUS) * MOUSE_FORCE;
          nx += (mdx / mDist) * force;
          ny += (mdy / mDist) * force;
        }

        n.x = nx;
        n.y = ny;
      }

      // Build adjacency for triangle detection
      const connected: boolean[][] = Array.from({ length: nodes.length }, () =>
        new Array(nodes.length).fill(false)
      );

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            connected[i][j] = true;
            connected[j][i] = true;

            // Brightness boost near cursor
            const edgeMidX = (nodes[i].x + nodes[j].x) / 2;
            const edgeMidY = (nodes[i].y + nodes[j].y) / 2;
            const eDist = Math.sqrt(
              (edgeMidX - mouse.x) ** 2 + (edgeMidY - mouse.y) ** 2
            );
            const boost = eDist < MOUSE_RADIUS * 1.5
              ? 0.03 * (1 - eDist / (MOUSE_RADIUS * 1.5))
              : 0;

            const alpha = 0.03 + 0.02 * (1 - dist / maxDist) + boost;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `hsla(0, 0%, 100%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw triangle fills
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (!connected[i][j]) continue;
          for (let k = j + 1; k < nodes.length; k++) {
            if (connected[i][k] && connected[j][k]) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.lineTo(nodes[k].x, nodes[k].y);
              ctx.closePath();
              ctx.fillStyle = `hsla(0, 0%, 100%, 0.008)`;
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        if (n.tier === "northstar") {
          const pulse = 0.10 + 0.08 * Math.sin(t * 0.0008);
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 80%, 48%, ${pulse})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 80%, 48%, ${pulse * 0.3})`;
          ctx.fill();
        } else if (n.tier === "anchor") {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 0%, 100%, 0.10)`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.0, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 0%, 100%, 0.06)`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => initNodes();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
    />
  );
};

export default ConstellationField;
