import { useEffect, useRef } from "react";

// Deterministic pseudo-random
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
  isNorthStar: boolean;
}

const NODE_COUNT = 24;
const MAX_EDGE_DIST = 0.22; // fraction of viewport diagonal
const NORTH_STAR_INDEX = 7;

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

    const rand = seededRandom(42);

    const initNodes = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      sizeRef.current = { w, h };

      const nodes: Node[] = [];
      const rng = seededRandom(42); // reset for determinism
      for (let i = 0; i < NODE_COUNT; i++) {
        const bx = rng() * w;
        const by = rng() * h;
        nodes.push({
          x: bx,
          y: by,
          baseX: bx,
          baseY: by,
          orbitRadius: 8 + rng() * 18,
          orbitSpeed: 0.0002 + rng() * 0.0004,
          orbitPhase: rng() * Math.PI * 2,
          isNorthStar: i === NORTH_STAR_INDEX,
        });
      }
      nodesRef.current = nodes;
    };

    initNodes();

    const draw = (t: number) => {
      const { w, h } = sizeRef.current;
      const diag = Math.sqrt(w * w + h * h);
      const maxDist = diag * MAX_EDGE_DIST;

      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;

      // Update positions
      for (const n of nodes) {
        const angle = n.orbitPhase + t * n.orbitSpeed;
        n.x = n.baseX + Math.cos(angle) * n.orbitRadius;
        n.y = n.baseY + Math.sin(angle * 0.7) * n.orbitRadius;
      }

      // Draw edges (triangular connections)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = 0.03 + 0.02 * (1 - dist / maxDist);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `hsla(0, 0%, 100%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        if (n.isNorthStar) {
          // Pulsing north star with red tint
          const pulse = 0.10 + 0.08 * Math.sin(t * 0.0008);
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 80%, 48%, ${pulse})`;
          ctx.fill();
          // Outer glow
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
