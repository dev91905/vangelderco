

# Make Constellation Mode Transitions More Dramatic

## Problem

The mode transforms are extremely subtle — barely perceptible:
- **Cultural strategy**: `pow(nx, 1.15)` — shifts a node at x=0.5 to x=0.467. That's ~3% movement on a 1114px screen = ~33px. Invisible.
- **Cross-sector**: scales x by 1.08 from center — moves edge nodes ~4%. Also invisible.
- **Deep organizing**: pulls 5% toward center. Barely registers.

Before the hand-composed layout rewrite, the grid positions were different per mode (different grid configs), creating obvious repositioning. Now every mode uses the same base coordinates with near-identity transforms applied.

## Fix — `src/components/ConstellationField.tsx`

Increase the strength of each mode's transform so the constellation visibly reshapes:

| Mode | Current | Proposed |
|------|---------|----------|
| **cultural-strategy** | `pow(nx, 1.15)` | `pow(nx, 1.6)` — pulls right-side nodes leftward noticeably, compresses the field toward the left |
| **cross-sector** | `(nx-0.5)*1.08+0.5` | `(nx-0.5)*1.35+0.5` — spreads nodes outward from center, creating a wider, more dispersed pattern |
| **deep-organizing** | `*0.95` toward center | `*0.72` toward center — pulls all nodes visibly inward into a tighter cluster |

Also add **y-axis transforms** to cultural-strategy and cross-sector (currently only x changes), so the reshaping feels two-dimensional:

- **cultural-strategy**: also apply `y = 0.5 + (ny - 0.5) * 0.85` — slight vertical compression
- **cross-sector**: also apply `y = Math.pow(ny, 0.85)` — slight vertical spread toward top

The existing `LERP_SPEED = 0.025` creates a smooth ~2-second transition, so these larger movements will animate gracefully rather than jumping.

One file, one function, ~10 lines changed.

