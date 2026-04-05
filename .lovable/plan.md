

# Constellation Node Positioning — From Grid Jitter to Composed Layout

## Problem

Nodes are placed on a regular 4×4 (or 4×5 mobile) grid with random jitter applied uniformly. This produces visibly grid-like arrangements where some nodes clump together while others leave awkward gaps. It reads as "randomized spreadsheet" rather than a purposeful constellation.

## Approach

Replace the grid+jitter system with hand-composed normalized coordinates (0–1 range) that create an intentionally asymmetric, balanced constellation — like actual star maps. The positions are designed using golden-ratio spacing and triangular groupings that feel organic but composed.

## Changes — `src/components/ConstellationField.tsx` only

### Replace `getGridConfig` and `getLayoutPositions`

Instead of computing a grid and adding jitter, define a fixed set of 16 normalized `(nx, ny)` positions that form a pleasing asymmetric constellation:

- 1 north star placed at roughly golden-ratio position (~0.62, ~0.38)
- 4 anchors forming a loose diamond that avoids symmetry
- 11 field nodes scattered to create varied triangle densities — some tight clusters of 3, some lone outliers with long edges

The positions are designed so that:
- No two nodes are closer than ~0.12 normalized distance (prevents clumping)
- No node is closer than ~0.08 from any edge (prevents edge-hugging)
- The overall center of mass sits slightly off-center (avoids static symmetry)
- Triangles form naturally at 2–3 locations without blanketing the whole field

### Mobile adaptation

For tall mobile (w < 640, aspect > 1.5), add 4 extra field nodes in the vertical gaps to prevent the middle and bottom from feeling empty. These use the same hand-composed approach, not grid math.

### Mode variants

Each mode applies a subtle transform to the base positions:
- **Home**: Use positions as-is
- **Cultural strategy**: Shift all x-coords through a mild power curve (`pow(nx, 1.15)`) — barely perceptible leftward bias
- **Cross-sector**: Scale x-coords slightly outward from center (`(nx - 0.5) * 1.08 + 0.5`)
- **Deep organizing**: Pull all nodes ~5% toward center

Same logic as before, just applied to better base positions.

### What stays the same
- All animation code (orbit, drift, mouse repulsion, edges, triangles)
- All opacity/size constants
- The `ConstellationMode` type and transitions
- Canvas setup and resize handling

One file, replacing ~50 lines of grid math with ~50 lines of composed coordinates.

