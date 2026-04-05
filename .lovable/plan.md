

# Evolve Constellation Field — Organic, Dynamic, Elegant

## Problem with Current Version
Right now nodes are scattered purely randomly across the viewport, connected by simple distance-threshold lines. The result is a uniform mesh — functional but geometrically static and predictable. It reads more like a generic particle network than an intentional constellation.

## What Changes

### 1. Organic Node Placement — Clustered, Not Uniform
Instead of `rng() * w, rng() * h`, place nodes in **3 loose clusters** (one per domain) using Gaussian-distributed offsets around 3 anchor points. This creates organic groupings with natural density variation — dense cores with trailing outlier nodes, like actual star clusters. The three clusters echo the three domains without being literal.

### 2. Curved Connections — Quadratic Bezier, Not Straight Lines
Replace `lineTo` with `quadraticCurveTo`. Each edge gets a slight arc (control point offset perpendicular to the midpoint). This single change transforms the entire feel from rigid wireframe to something organic and flowing — like tendons or mycorrhizal networks.

### 3. Varied Orbit Motion — Lissajous Figures, Not Circles
Current orbit: `cos(angle)` / `sin(angle * 0.7)` — basically an ellipse. Replace with proper Lissajous curves using per-node frequency ratios (e.g., `cos(a * 1.0)` / `sin(a * 1.3)`). Nodes trace figure-eights and complex loops instead of predictable ovals. More dynamic, more alive.

### 4. Breathing Edge Opacity — Time-Modulated Alpha
Add a slow `sin(t)` modulation to each edge's alpha so connections gently breathe in and out of visibility. Different edges phase differently. The network feels like it's alive — some connections strengthening while others fade.

### 5. Delaunay Triangulation Instead of Distance Threshold
Replace the brute-force distance check with proper Delaunay triangulation. This produces elegant, non-overlapping triangular cells that shift as nodes drift — actual geometric triangles rather than a tangled web. Draw only the triangle edges, creating clean triangular tessellation that morphs organically. This is the biggest visual upgrade.

### 6. Faint Triangle Fills
For a subset of the Delaunay triangles (every 3rd or 4th), draw an extremely faint filled triangle (`alpha ~0.008`) to add depth and suggest surfaces rather than just edges.

## Technical Approach

All changes in **one file**: `src/components/ConstellationField.tsx`

- Inline Delaunay implementation (~40 lines, Bowyer-Watson algorithm) — no external dependency
- Recalculate triangulation each frame (24 nodes = trivial, <0.1ms)
- Bezier curves use triangle circumcenters as natural control points
- Node count stays at 24, performance unchanged

## What Stays the Same
- Canvas-based, `requestAnimationFrame`, `pointer-events-none`
- North star node with red pulse
- Deterministic seeded random
- Faint opacity levels (still subliminal)
- Responsive resize handling

