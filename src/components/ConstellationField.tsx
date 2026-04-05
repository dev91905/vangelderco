import { useEffect, useRef } from "react";

// Deterministic pseudo-random
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// Box-Muller for Gaussian distribution
function gaussian(rng: () => number, mean: number, stddev: number): number {
  const u1 = rng();
  const u2 = rng();
  return mean + stddev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  orbitRadius: number;
  orbitSpeedX: number;
  orbitSpeedY: number;
  freqRatioX: number;
  freqRatioY: number;
  orbitPhase: number;
  isNorthStar: boolean;
}

interface Triangle {
  i: number;
  j: number;
  k: number;
}

const NODE_COUNT = 24;
const NORTH_STAR_INDEX = 7;

// Cluster anchors as fractions of viewport
const CLUSTERS = [
  { cx: 0.25, cy: 0.35 },
  { cx: 0.65, cy: 0.25 },
  { cx: 0.45, cy: 0.72 },
];

// Bowyer-Watson Delaunay triangulation
function delaunay(points: { x: number; y: number }[]): Triangle[] {
  const n = points.length;
  if (n < 3) return [];

  // Super-triangle that contains all points
  const minX = Math.min(...points.map(p => p.x)) - 1;
  const maxX = Math.max(...points.map(p => p.x)) + 1;
  const minY = Math.min(...points.map(p => p.y)) - 1;
  const maxY = Math.max(...points.map(p => p.y)) + 1;
  const dx = maxX - minX;
  const dy = maxY - minY;
  const dmax = Math.max(dx, dy) * 2;

  const superA = { x: minX - dmax, y: minY - 1 };
  const superB = { x: minX + dmax * 2, y: minY - 1 };
  const superC = { x: minX + dx / 2, y: maxY + dmax };

  const allPts = [...points, superA, superB, superC];
  const si = n, sj = n + 1, sk = n + 2;

  let triangles: { i: number; j: number; k: number }[] = [{ i: si, j: sj, k: sk }];

  function circumcircle(ti: number, tj: number, tk: number) {
    const ax = allPts[ti].x, ay = allPts[ti].y;
    const bx = allPts[tj].x, by = allPts[tj].y;
    const cx = allPts[tk].x, cy = allPts[tk].y;
    const D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(D) < 1e-10) return { cx: 0, cy: 0, r2: Infinity };
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / D;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / D;
    const r2 = (ax - ux) * (ax - ux) + (ay - uy) * (ay - uy);
    return { cx: ux, cy: uy, r2 };
  }

  for (let p = 0; p < n; p++) {
    const px = allPts[p].x, py = allPts[p].y;
    const bad: typeof triangles = [];
    for (const tri of triangles) {
      const cc = circumcircle(tri.i, tri.j, tri.k);
      const dist2 = (px - cc.cx) * (px - cc.cx) + (py - cc.cy) * (py - cc.cy);
      if (dist2 < cc.r2) bad.push(tri);
    }

    // Find boundary polygon
    const edges: [number, number][] = [];
    for (const tri of bad) {
      const e: [number, number][] = [[tri.i, tri.j], [tri.j, tri.k], [tri.k, tri.i]];
      for (const [a, b] of e) {
        const shared = bad.some(
          other => other !== tri &&
            ((other.i === a || other.j === a || other.k === a) &&
              (other.i === b || other.j === b || other.k === b))
        );
        if (!shared) edges.push([a, b]);
      }
    }

    triangles = triangles.filter(t => !bad.includes(t));
    for (const [a, b] of edges) {
      triangles.push({ i: a, j: b, k: p });
    }
  }

  // Remove triangles that reference super-triangle vertices
  return triangles.filter(t => t.i < n && t.j < n && t.k < n);
}

const ConstellationField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

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
      const nodes: Node[] = [];
      const nodesPerCluster = Math.floor(NODE_COUNT / CLUSTERS.length);
      const remainder = NODE_COUNT - nodesPerCluster * CLUSTERS.length;

      let idx = 0;
      for (let c = 0; c < CLUSTERS.length; c++) {
        const count = nodesPerCluster + (c < remainder ? 1 : 0);
        const anchorX = CLUSTERS[c].cx * w;
        const anchorY = CLUSTERS[c].cy * h;
        const spread = Math.min(w, h) * 0.22;

        for (let i = 0; i < count; i++) {
          const bx = gaussian(rng, anchorX, spread);
          const by = gaussian(rng, anchorY, spread);
          // Clamp to viewport with margin
          const clampedX = Math.max(20, Math.min(w - 20, bx));
          const clampedY = Math.max(20, Math.min(h - 20, by));

          nodes.push({
            x: clampedX,
            y: clampedY,
            baseX: clampedX,
            baseY: clampedY,
            orbitRadius: 6 + rng() * 20,
            orbitSpeedX: 0.00015 + rng() * 0.0003,
            orbitSpeedY: 0.00015 + rng() * 0.0003,
            freqRatioX: 0.8 + rng() * 0.6, // Lissajous frequency ratios
            freqRatioY: 1.0 + rng() * 0.6,
            orbitPhase: rng() * Math.PI * 2,
            isNorthStar: idx === NORTH_STAR_INDEX,
          });
          idx++;
        }
      }
      nodesRef.current = nodes;
    };

    initNodes();

    const draw = (t: number) => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      const nodes = nodesRef.current;

      // Update positions — Lissajous orbits
      for (const n of nodes) {
        const phase = n.orbitPhase + t;
        n.x = n.baseX + Math.cos(phase * n.orbitSpeedX * n.freqRatioX) * n.orbitRadius;
        n.y = n.baseY + Math.sin(phase * n.orbitSpeedY * n.freqRatioY) * n.orbitRadius;
      }

      // Delaunay triangulation
      const tris = delaunay(nodes);

      // Draw faint triangle fills (every 3rd)
      for (let ti = 0; ti < tris.length; ti++) {
        if (ti % 3 !== 0) continue;
        const tri = tris[ti];
        const a = nodes[tri.i], b = nodes[tri.j], c = nodes[tri.k];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = `hsla(0, 0%, 100%, 0.008)`;
        ctx.fill();
      }

      // Collect unique edges from triangulation
      const edgeSet = new Set<string>();
      const edges: [number, number][] = [];
      for (const tri of tris) {
        const pairs: [number, number][] = [
          [Math.min(tri.i, tri.j), Math.max(tri.i, tri.j)],
          [Math.min(tri.j, tri.k), Math.max(tri.j, tri.k)],
          [Math.min(tri.i, tri.k), Math.max(tri.i, tri.k)],
        ];
        for (const [a, b] of pairs) {
          const key = `${a}-${b}`;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push([a, b]);
          }
        }
      }

      // Draw curved edges with breathing opacity
      for (const [ai, bi] of edges) {
        const a = nodes[ai], b = nodes[bi];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        // Perpendicular offset for curve
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const curvature = dist * 0.08;
        // Control point perpendicular to midpoint
        const nx = -dy / dist;
        const ny = dx / dist;
        const cpx = mx + nx * curvature;
        const cpy = my + ny * curvature;

        // Breathing alpha — each edge breathes at its own phase
        const breathe = Math.sin(t * 0.0003 + ai * 1.7 + bi * 2.3);
        const alpha = 0.025 + 0.02 * (0.5 + 0.5 * breathe);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cpx, cpy, b.x, b.y);
        ctx.strokeStyle = `hsla(0, 0%, 100%, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw nodes
      for (const n of nodes) {
        if (n.isNorthStar) {
          const pulse = 0.10 + 0.08 * Math.sin(t * 0.0008);
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 80%, 48%, ${pulse})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 80%, 48%, ${pulse * 0.3})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 0%, 100%, 0.07)`;
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
