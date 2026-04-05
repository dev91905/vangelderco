

# Full-Bleed Constellation Field with Route Transitions

## What changes

The `ConstellationField` component already exists with mode transitions — it just needs to be re-wired into `App.tsx` at the router level, with two key changes to make it "full bleed" (nodes and edges extending beyond viewport edges).

## Approach

### 1. Make the canvas oversized — `ConstellationField.tsx`

The previous version contained all nodes within `0–1` normalized space mapped to exact viewport dimensions. To go "off-screen":

- **Oversize the canvas** by 20% in each direction: canvas dimensions become `w * 1.4` by `h * 1.4`, offset by `-0.2 * w` / `-0.2 * h`
- **Extend node coordinate space**: Map normalized `0–1` positions to the oversized canvas area so nodes at edges (nx near 0 or 1) are partially or fully off-screen
- **Canvas CSS**: Use `inset: -20%` with `width: 140%; height: 140%` instead of `inset: 0` so edges and triangles naturally bleed past the viewport

This means constellation lines and triangles will visibly enter and exit the screen edges — no hard boundary.

### 2. Re-integrate into App — `App.tsx`

- Import `ConstellationField` and `useLocation`
- Create a route-to-mode map: `/` → `home`, `/cultural-strategy` → `cultural-strategy`, etc.
- Render `<ConstellationField mode={currentMode} />` once, above all routes (persistent across navigations)
- Sub-pages and post pages default to `home` mode

### 3. Slightly increase node opacity — `ConstellationField.tsx`

Previous version was tuned down to near-invisibility. Bump back up slightly so the field is actually perceptible:
- Field nodes: `0.025` → `0.035`
- Anchor nodes: `0.04` → `0.055`  
- Northstar pulse: `0.045` base → `0.06`
- Edge lines: base alpha `0.012` → `0.018`
- Triangle fills: `0.003` → `0.005`

Still extremely subtle — just not invisible.

### 4. No other files change

`AtmosphericLayout`, `CapabilityLayout`, pages — all untouched. The constellation renders as a fixed background layer behind everything.

## Files modified
- `src/App.tsx` — add ConstellationField with route-driven mode
- `src/components/ConstellationField.tsx` — oversize canvas for full bleed, bump opacities slightly

