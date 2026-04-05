

# Geometric Constellation Background — Animated Triangular Network

## Concept

A full-viewport SVG canvas of slowly drifting triangular constellations — faint interconnected nodes forming triangular geometries that pulse and shift. Think the Oldest House from CONTROL: barely-there geometric structures hovering in darkness, hinting at something vast and unknowable. The three-sided forms reference the three domains. Nodes connected by hair-thin lines evoke network constellations and the north star motif.

## Design

- **Geometry**: ~20–30 nodes scattered across the viewport, connected into triangular clusters by thin lines. Not a uniform grid — organic, slightly asymmetric placement that feels like a star chart.
- **Animation**: Nodes drift slowly (CSS or requestAnimationFrame), each on its own subtle orbit. Lines stretch and contract as nodes move. One node slightly brighter than the rest — the north star.
- **Opacity**: Extremely faint. Node dots at `0.06–0.10` opacity, connecting lines at `0.03–0.05`. The "north star" node pulses gently between `0.10–0.18`. Should feel subliminal — noticed after 10 seconds of looking, not on first glance.
- **Color**: White lines/dots with a very faint red tint on the north star pulse (`hsl(0 80% 48% / 0.08)`).
- **No interaction**: Pure `pointer-events-none` decoration.

## Implementation

### New component: `src/components/ConstellationField.tsx`

A self-contained canvas/SVG component:
- Generates node positions on mount (deterministic seed so it's consistent)
- Uses `requestAnimationFrame` for smooth, GPU-friendly drift animation
- Canvas-based (not DOM nodes) for performance — draws dots and lines each frame
- Responsive: fills parent container, recalculates on resize
- North star node: one designated node with a slow `sin()`-based brightness pulse

### `src/components/AtmosphericLayout.tsx`

Add `<ConstellationField />` as a new layer between the breathing glow and the vignette, at `z-[1]`, `pointer-events-none`, `fixed inset-0`.

### `src/components/PasswordGate.tsx`

Add the same `<ConstellationField />` inside the gate wrapper so the password page gets it too.

### No other changes

No new dependencies. Pure HTML Canvas + RAF. No Three.js needed for this level of subtlety.

