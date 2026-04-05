

# Constellation Field — Fewer Nodes, Subtler, More Motion

## Problems
1. **36 nodes (6×6 grid)** — too dense, especially on mobile where the viewport is small and nodes cluster visibly
2. **Triangle fills at 0.004 opacity** create visible bright patches on small screens where triangles overlap densely
3. **Drift is slow and subtle** — `driftAmp: 8-18px` with very low frequencies (`0.000015-0.00004`) makes movement barely perceptible. The original version had more visible orbital motion that gave it life.
4. **Edge opacity floor of 0.015** is too high when there are many edges

## Changes — all in `src/components/ConstellationField.tsx`

### Reduce node count
- `COLS`: 6 → 4, `ROWS`: 6 → 4 (16 nodes instead of 36)
- Recalculate `NORTH_STAR_INDEX` and `ANCHOR_INDICES` for the smaller grid
- Fewer nodes = fewer edges = fewer triangles = dramatically less visual weight

### Lower all opacities
- Field node fill: `0.03` → `0.018`
- Anchor node fill: `0.05` → `0.03`
- North star: halve the pulse range
- Edge base alpha: `0.015` → `0.008`, distance falloff: `0.015` → `0.008`
- Triangle fill: `0.004` → `0.002`
- Mouse edge boost: halve it

### Restore lively motion
- Increase `orbitRadius` — field: `3-8` → `6-14`, anchor: `2-5` → `4-8`
- Increase `orbitSpeed` — field: `0.00015-0.0004` → `0.0003-0.0007`, anchor proportionally
- Increase `driftAmp`: `8-18` → `15-30`
- Increase drift frequencies by ~2× so the breathing pattern completes in visible timeframes
- These are still slow, graceful movements — not frantic — but you'll actually *see* things shifting

### Increase MAX_EDGE_DIST slightly
- `0.18` → `0.22` — with fewer nodes, connections need a longer reach to form triangles at all

### No other files change

One file, tuning constants only. Same architecture, same layout presets, same cursor interaction.

