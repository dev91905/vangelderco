

## Constellation Field: No-crossing edges + 10% fainter

### What's happening now
The current code connects any two nodes within `MAX_EDGE_DIST` distance, which creates a dense proximity graph. Since nodes are scattered across the canvas, many edges cross each other without a node at the intersection — creating a messy web effect.

### Plan

**1. Eliminate crossing edges**

After building the candidate edge list (all pairs within `maxDist`), add a crossing-detection pass that removes edges that intersect other edges. For each pair of edges (A-B) and (C-D), use a standard segment-intersection test. When two edges cross, remove the longer one (it's less structurally important). This produces a cleaner, more planar-like graph where lines only meet at nodes.

The algorithm:
- Collect all candidate edges as an array of `{i, j, dist}`
- Sort by distance (shortest first — these are highest priority)
- Greedily add edges: for each candidate, check if it crosses any already-accepted edge. If it does, skip it. This is O(e²) but with ~16 nodes and ~20-30 candidate edges, it's negligible per frame.

**2. Reduce all opacities by 10%**

Multiply all alpha values by 0.9:
- Edge alpha: `0.018 → 0.016`, `0.015 → 0.0135`, boost `0.012 → 0.011`
- Triangle fill: `0.003 → 0.0027`
- Northstar pulse: `0.06 → 0.054`, `0.03 → 0.027`, glow multiplier `0.25 → 0.225`
- Anchor dot: `0.055 → 0.05`
- Field dot: `0.035 → 0.032`

### File changes
- `src/components/ConstellationField.tsx` — add segment intersection helper function, add edge-filtering pass in the `draw` loop between candidate collection and rendering, reduce all alpha constants by 10%

