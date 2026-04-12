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

// Hand-composed normalized positions (0–1 range)
const BASE_NODES: { nx: number; ny: number; tier: Node["tier"] }[] = [
  { nx: 0.62, ny: 0.38, tier: "northstar" },
  { nx: 0.18, ny: 0.22, tier: "anchor" },
  { nx: 0.82, ny: 0.18, tier: "anchor" },
  { nx: 0.28, ny: 0.72, tier: "anchor" },
  { nx: 0.78, ny: 0.82, tier: "anchor" },
  { nx: 0.10, ny: 0.48, tier: "field" },
  { nx: 0.42, ny: 0.12, tier: "field" },
  { nx: 0.88, ny: 0.45, tier: "field" },
  { nx: 0.35, ny: 0.52, tier: "field" },
  { nx: 0.55, ny: 0.65, tier: "field" },
  { nx: 0.72, ny: 0.55, tier: "field" },
  { nx: 0.15, ny: 0.88, tier: "field" },
  { nx: 0.50, ny: 0.28, tier: "field" },
  { nx: 0.92, ny: 0.72, tier: "field" },
  { nx: 0.38, ny: 0.88, tier: "field" },
  { nx: 0.68, ny: 0.15, tier: "field" },
];

const MOBILE_EXTRA: { nx: number; ny: number; tier: Node["tier"] }[] = [
  { nx: 0.25, ny: 0.42, tier: "field" },
  { nx: 0.75, ny: 0.35, tier: "field" },
  { nx: 0.55, ny: 0.78, tier: "field" },
  { nx: 0.20, ny: 0.62, tier: "field" },
];

const MAX_EDGE_DIST = 0.22;
const MOUSE_RADIUS = 120;
const MOUSE_FORCE = 1.5;

// Segment intersection test (returns true if AB crosses CD)
function segmentsIntersect(
  ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, dx: number, dy: number,
): boolean {
  const dxAB = bx - ax, dyAB = by - ay;
  const dxCD = dx - cx, dyCD = dy - cy;
  const denom = dxAB * dyCD - dyAB * dxCD;
  if (Math.abs(denom) < 1e-10) return false;
  const t = ((cx - ax) * dyCD - (cy - ay) * dxCD) / denom;
  const u = ((cx - ax) * dyAB - (cy - ay) * dxAB) / denom;
  // Strict interior intersection only (not at shared endpoints)
  return t > 0.01 && t < 0.99 && u > 0.01 && u < 0.99;
}
const LERP_SPEED = 0.025;

// Oversize factor: canvas extends 20% beyond viewport in each direction
const BLEED = 0.2;
const SCALE = 1 + BLEED * 2; // 1.4

function getNodeDefs(w: number, h: number) {
  const isTallMobile = w < 640 && h / w > 1.5;
  return isTallMobile ? [...BASE_NODES, ...MOBILE_EXTRA] : BASE_NODES;
}

function getLayoutPositions(
  mode: ConstellationMode,
  w: number,
  h: number,
): { x: number; y: number; tier: Node["tier"] }[] {
  const defs = getNodeDefs(w, h);
  // Map to oversized canvas space
  const cw = w * SCALE;
  const ch = h * SCALE;

  return defs.map(({ nx, ny, tier }) => {
    let x = nx;
    let y = ny;

    switch (mode) {
      case "cultural-strategy":
        x = Math.pow(nx, 1.6);
        y = 0.5 + (ny - 0.5) * 0.85;
        break;
      case "cross-sector":
        x = (nx - 0.5) * 1.35 + 0.5;
        y = Math.pow(ny, 0.85);
        break;
      case "deep-organizing":
        x = 0.5 + (nx - 0.5) * 1.1;
        y = Math.pow(ny, 1.4);
        break;
    }

    return { x: x * cw, y: y * ch, tier };
  });
}

interface ConstellationFieldProps {
  mode?: ConstellationMode;
}

const ConstellationField = ({ mode = "home" }: ConstellationFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0, cw: 0, ch: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const modeRef = useRef<ConstellationMode>(mode);

  useEffect(() => {
    modeRef.current = mode;
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;
    const { w, h } = sizeRef.current;
    if (w === 0) return;

    const positions = getLayoutPositions(mode, w, h);
    for (let i = 0; i < Math.min(nodes.length, positions.length); i++) {
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
      const cw = w * SCALE;
      const ch = h * SCALE;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h, cw, ch };

      const positions = getLayoutPositions(modeRef.current, w, h);
      const rng = seededRandom(99);

      const nodes: Node[] = positions.map(({ x, y, tier }) => ({
        x,
        y,
        baseX: x,
        baseY: y,
        targetX: x,
        targetY: y,
        orbitRadius: tier === "field" ? 6 + rng() * 8 : 4 + rng() * 4,
        orbitSpeed:
          tier === "field"
            ? 0.0003 + rng() * 0.0004
            : 0.0001 + rng() * 0.0002,
        orbitPhase: rng() * Math.PI * 2,
        driftFreqX: 0.00006 + rng() * 0.0001,
        driftFreqY: 0.00006 + rng() * 0.0001,
        driftPhaseX: rng() * Math.PI * 2,
        driftPhaseY: rng() * Math.PI * 2,
        driftAmp: 15 + rng() * 30,
        tier,
      }));
      nodesRef.current = nodes;
    };

    initNodes();

    // Mouse position needs to be offset into canvas space (canvas is shifted by -BLEED)
    const onPointerMove = (e: PointerEvent) => {
      const w = sizeRef.current.w;
      const h = sizeRef.current.h;
      mouseRef.current = {
        x: e.clientX + w * BLEED,
        y: e.clientY + h * BLEED,
      };
    };
    window.addEventListener("pointermove", onPointerMove);

    const draw = (t: number) => {
      const { cw, ch } = sizeRef.current;
      const diag = Math.sqrt(cw * cw + ch * ch);
      const maxDist = diag * MAX_EDGE_DIST;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, cw, ch);
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

      // Collect candidate edges
      const candidates: { i: number; j: number; dist: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            candidates.push({ i, j, dist });
          }
        }
      }
      candidates.sort((a, b) => a.dist - b.dist);

      // Greedy non-crossing filter
      const accepted: { i: number; j: number; dist: number }[] = [];
      for (const edge of candidates) {
        let crosses = false;
        for (const kept of accepted) {
          if (edge.i === kept.i || edge.i === kept.j || edge.j === kept.i || edge.j === kept.j) continue;
          if (segmentsIntersect(
            nodes[edge.i].x, nodes[edge.i].y, nodes[edge.j].x, nodes[edge.j].y,
            nodes[kept.i].x, nodes[kept.i].y, nodes[kept.j].x, nodes[kept.j].y,
          )) {
            crosses = true;
            break;
          }
        }
        if (!crosses) accepted.push(edge);
      }

      const connected: boolean[][] = Array.from({ length: nodes.length }, () =>
        new Array(nodes.length).fill(false)
      );

      for (const edge of accepted) {
        connected[edge.i][edge.j] = true;
        connected[edge.j][edge.i] = true;

        const edgeMidX = (nodes[edge.i].x + nodes[edge.j].x) / 2;
        const edgeMidY = (nodes[edge.i].y + nodes[edge.j].y) / 2;
        const eDist = Math.sqrt(
          (edgeMidX - mouse.x) ** 2 + (edgeMidY - mouse.y) ** 2
        );
        const boost = eDist < MOUSE_RADIUS * 1.5
          ? 0.011 * (1 - eDist / (MOUSE_RADIUS * 1.5))
          : 0;

        const alpha = 0.016 + 0.0135 * (1 - edge.dist / maxDist) + boost;
        ctx.beginPath();
        ctx.moveTo(nodes[edge.i].x, nodes[edge.i].y);
        ctx.lineTo(nodes[edge.j].x, nodes[edge.j].y);
        ctx.strokeStyle = `hsla(0, 0%, 100%, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
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
              ctx.fillStyle = `hsla(0, 0%, 100%, 0.0027)`;
              ctx.fill();
            }
          }
        }
      }

      for (const n of nodes) {
        if (n.tier === "northstar") {
          const pulse = 0.054 + 0.027 * Math.sin(t * 0.0008);
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 80%, 48%, ${pulse})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 80%, 48%, ${pulse * 0.225})`;
          ctx.fill();
        } else if (n.tier === "anchor") {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 0%, 100%, 0.05)`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 0%, 100%, 0.032)`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => {
      initNodes();
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
      className="pointer-events-none fixed z-[1]"
      style={{
        top: `-${BLEED * 100}%`,
        left: `-${BLEED * 100}%`,
      }}
      aria-hidden="true"
    />
  );
};

export default ConstellationField;
