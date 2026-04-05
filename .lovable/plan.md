

# Constellation Field — Dial Back to Truly Subtle

## Problems

1. **Too visible**: Node sizes, edge opacities, and triangle fills are all too prominent. This should be barely perceptible — noticed after staring, not on arrival.
2. **Odd composition on sub-pages**: The layout presets (left-weighted, three clusters, dense core) create awkward, unbalanced arrangements that look broken rather than intentional. The differences are too dramatic.
3. **Too much motion**: Drift amplitude of 20–50px and orbit radii of 6–20px create jittery, distracting movement instead of glacial drift.
4. **Too many connections**: `MAX_EDGE_DIST` at 0.25 of the diagonal creates a dense web of lines — reads as a mesh, not a constellation.

## Fix — One File

### `src/components/ConstellationField.tsx`

**Reduce opacity across the board:**
- Edge lines: `0.03–0.05` → `0.015–0.03`
- Field nodes: `0.06` → `0.03`
- Anchor nodes: `0.10` → `0.05`
- North star pulse: `0.10–0.18` → `0.06–0.10`
- North star glow: reduce accordingly
- Triangle fills: `0.008` → `0.004`

**Shrink node sizes:**
- North star: `2.5px` → `1.8px`, glow `6px` → `4px`
- Anchors: `1.6px` → `1.2px`
- Field: `1.0px` → `0.7px`

**Reduce motion:**
- Drift amplitude: `20–50` → `8–18`
- Orbit radius: field `6–20` → `3–8`, anchors `4–12` → `2–5`
- Orbit/drift speeds: halve them

**Reduce connection density:**
- `MAX_EDGE_DIST`: `0.25` → `0.18`

**Soften sub-page layouts** — make them gentle variations, not dramatic rearrangements:
- Cultural strategy: mild leftward bias (`pow(nx, 1.3)` instead of `1.8`)
- Cross-sector: slightly wider spacing, not three isolated clusters — keep the grid but stretch horizontally
- Deep organizing: gentle center-pull, not dramatic compression
- All layouts should still read as a full-screen balanced field with a subtle personality shift

**Reduce mouse interaction:**
- `MOUSE_FORCE`: `3` → `1.5`
- `MOUSE_RADIUS`: `150` → `120`
- Edge brightness boost near cursor: halve it

No other files change.

