import { useEffect, useRef } from "react";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export type ConstellationMode = "home" | "cultural-strategy" | "cross-sector" | "deep-organizing";

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  targetX: number;
  targetY: number;
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

const COLS = 4;
const ROWS = 4;
const MAX_EDGE_DIST = 0.22;
const MOUSE_RADIUS = 120;
const MOUSE_FORCE = 1.5;
const ANCHOR_INDICES = new Set([0, 5, 10, 15]);
const NORTH_STAR_COL = Math.round(COLS * 0.618);
const NORTH_STAR_ROW = Math.round(ROWS * 0.382);
const NORTH_STAR_INDEX = NORTH_STAR_ROW * COLS + NORTH_STAR_COL;
const LERP_SPEED = 0.025;

function getLayoutPositions(
  mode: ConstellationMode,
  w: number,
  h: number,
  rng: () => number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const jitterX = (rng() - 0.5) * (w / COLS) * 0.3 * 2;
      const jitterY = (rng() - 0.5) * (h / ROWS) * 0.3 * 2;

      let bx: number, by: number;
      const cellW = w / COLS;
      const cellH = h / ROWS;
      const baseX = (col + 0.5) * cellW;
      const baseY = (row + 0.5) * cellH;

      switch (mode) {
        case "cultural-strategy": {
          const nx = col / (COLS - 1);
          const skewedX = Math.pow(nx, 1.3);
          bx = w * 0.06 + skewedX * w * 0.88 + jitterX;
          by = baseY + jitterY;
          break;
        }
        case "cross-sector": {
          const nx = col / (COLS - 1);
          const stretchX = 0.5 + (nx - 0.5) * 1.15;
          bx = stretchX * w + jitterX;
          by = baseY + jitterY;
          break;
        }
        case "deep-organizing": {
          const nx = (col + 0.5) / COLS - 0.5;
          const ny = (row + 0.5) / ROWS - 0.5;
          const dist = Math.sqrt(nx * nx + ny * ny);
          const pull = 0.85 + 0.15 * (1 - dist / 0.7);
          bx = w * 0.5 + nx * pull * w * 0.95 + jitterX;
          by = h * 0.5 + ny * pull * h * 0.95 + jitterY;
          break;
        }
        default: {
          bx = baseX + jitterX;
          by = baseY + jitterY;
          break;
        }
      }

      positions.push({ x: bx, y: by });
    }
  }

  return positions;
}

interface ConstellationFieldProps {
  mode?: ConstellationMode;
}

const ConstellationField = ({ mode = "home" }: ConstellationFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const modeRef = useRef<ConstellationMode>(mode);

  useEffect(() => {
    modeRef.current = mode;
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;
    const { w, h } = sizeRef.current;
    if (w === 0) return;

    const rng = seededRandom(42);
    const positions = getLayoutPositions(mode, w, h, rng);
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].targetX = positions[i].x;
      nodes[i].targetY = positions[i].y;
    }
  }, [mode]);

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
      const positions = getLayoutPositions(modeRef.current, w, h, rng);
      const rng2 = seededRandom(99);

      const nodes: Node[] = [];
      for (let i = 0; i < COLS * ROWS; i++) {
        const tier: Node["tier"] =
          i === NORTH_STAR_INDEX
            ? "northstar"
            : ANCHOR_INDICES.has(i)
            ? "anchor"
            : "field";

        nodes.push({
          x: positions[i].x,
          y: positions[i].y,
          baseX: positions[i].x,
          baseY: positions[i].y,
          targetX: positions[i].x,
          targetY: positions[i].y,
          orbitRadius: tier === "field" ? 6 + rng2() * 8 : 4 + rng2() * 4,
          orbitSpeed:
            tier === "field"
              ? 0.0003 + rng2() * 0.0004
              : 0.0001 + rng2() * 0.0002,
          orbitPhase: rng2() * Math.PI * 2,
          driftFreqX: 0.00003 + rng2() * 0.00005,
          driftFreqY: 0.00003 + rng2() * 0.00005,
          driftPhaseX: rng2() * Math.PI * 2,
          driftPhaseY: rng2() * Math.PI * 2,
          driftAmp: 15 + rng2() * 15,
          tier,
        });
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

      for (const n of nodes) {
        n.baseX += (n.targetX - n.baseX) * LERP_SPEED;
        n.baseY += (n.targetY - n.baseY) * LERP_SPEED;

        const angle = n.orbitPhase + t * n.orbitSpeed;
        const driftX = Math.sin(t * n.driftFreqX + n.driftPhaseX) * n.driftAmp;
        const driftY = Math.sin(t * n.driftFreqY + n.driftPhaseY) * n.driftAmp;

        let nx = n.baseX + driftX + Math.cos(angle) * n.orbitRadius;
        let ny = n.baseY + driftY + Math.sin(angle * 0.7) * n.orbitRadius;

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

      const connected: boolean[][] = Array.from({ length: nodes.length }, () =>
        new Array(nodes.length).fill(false)
      );

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            connected[i][j] = true;
            connected[j][i] = true;

            const edgeMidX = (nodes[i].x + nodes[j].x) / 2;
            const edgeMidY = (nodes[i].y + nodes[j].y) / 2;
            const eDist = Math.sqrt(
              (edgeMidX - mouse.x) ** 2 + (edgeMidY - mouse.y) ** 2
            );
            const boost = eDist < MOUSE_RADIUS * 1.5
              ? 0.008 * (1 - eDist / (MOUSE_RADIUS * 1.5))
              : 0;

            const alpha = 0.008 + 0.008 * (1 - dist / maxDist) + boost;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `hsla(0, 0%, 100%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

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
              ctx.fillStyle = `hsla(0, 0%, 100%, 0.002)`;
              ctx.fill();
            }
          }
        }
      }

      for (const n of nodes) {
        if (n.tier === "northstar") {
          const pulse = 0.06 + 0.04 * Math.sin(t * 0.0008);
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 80%, 48%, ${pulse})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 80%, 48%, ${pulse * 0.25})`;
          ctx.fill();
        } else if (n.tier === "anchor") {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 0%, 100%, 0.05)`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 0%, 100%, 0.03)`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => {
      initNodes();
      const rng = seededRandom(42);
      const positions = getLayoutPositions(modeRef.current, sizeRef.current.w, sizeRef.current.h, rng);
      const nodes = nodesRef.current;
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].targetX = positions[i].x;
        nodes[i].targetY = positions[i].y;
        nodes[i].baseX = positions[i].x;
        nodes[i].baseY = positions[i].y;
      }
    };
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
