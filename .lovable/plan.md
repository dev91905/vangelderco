

# Fix Deep Organizing Gray Blob

## Problem

The `deep-organizing` mode compresses all 16 nodes to 72% toward center (`0.72` factor). This clusters them tightly, and since `MAX_EDGE_DIST = 0.22` connects most nearby nodes, nearly every node forms triangles with its neighbors. Those triangles (even at `0.005` opacity) stack on top of each other in the center, creating a visible gray mass behind the text.

## Fix — `src/components/ConstellationField.tsx`

Two changes:

1. **Spread the deep-organizing nodes back out**: Change the compression factor from `0.72` to `0.82` — still visibly tighter than home, but not so tight that everything overlaps into a blob.

2. **Reduce triangle fill opacity**: `0.005` → `0.003`. With nodes closer together in this mode, even a small per-triangle alpha compounds. Dropping it makes the fills imperceptible while keeping edge lines visible.

One file, two constant changes.

