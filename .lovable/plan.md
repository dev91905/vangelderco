

# Constellation Field — Intentional, Dynamic, Alive

## Problems with current version
- Nodes are purely random scatter — no compositional intent
- Static orbit patterns — no evolution over time
- No cursor awareness — feels dead
- Sparse coverage — doesn't fill the viewport evenly
- All nodes behave identically (except north star)

## Design approach

**Intentional layout**: Place nodes on a structured grid with jitter — 6×5 grid across viewport with ~30% positional noise. Ensures even full-screen coverage while avoiding mechanical regularity. North star stays near golden-ratio center (~0.618, 0.382).

**Evolving behavior**: Nodes slowly migrate their base positions over time using low-frequency sine waves on different axes. Connections form and dissolve as distances shift. The constellation is never the same twice across a 60-second window.

**Cursor responsiveness**: Track mouse position (via `pointermove` on `window`). Nodes within a radius of the cursor gently drift away — subtle repulsion field. Lines near cursor gain a faint brightness boost. `pointer-events-none` stays on the canvas; listener goes on `window`.

**Tiered node hierarchy**: Three tiers instead of binary:
- **North star** (1): Larger, red pulse, outer glow — unchanged
- **Anchor nodes** (5): Slightly larger dots (1.6px), faintly brighter (0.10 opacity), slower drift — structural landmarks
- **Field nodes** (remaining ~30): Small (1.0px), standard opacity (0.06), faster drift

**More nodes**: Increase to ~36 for denser coverage.

**Triangle rendering**: When three mutually-connected nodes form a triangle, fill it with an extremely faint wash (`0.008` opacity) — gives depth without adding noise.

## Changes

### `src/components/ConstellationField.tsx` — Full rewrite

1. **Grid-based placement**: 6 columns × 6 rows = 36 base positions, each jittered by ±15% of cell size
2. **Mouse tracking**: `useRef` for cursor position, `pointermove` listener on `window`, repulsion force within 150px radius
3. **Evolving base drift**: Each node's `baseX`/`baseY` shifts slowly via `sin(t * drift_freq + phase)` — the whole field breathes
4. **Tiered rendering**: Anchor nodes at indices 0,7,14,21,28 — slightly larger, brighter
5. **Triangle fills**: After drawing edges, detect triangles (three mutual connections) and fill with near-invisible white
6. **Smoother edges**: Increase `MAX_EDGE_DIST` slightly to `0.25` for more connections

No other files change. Same canvas, same z-index, same integration points.

