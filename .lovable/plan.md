

# Hover Effect Audit & Fix

## Problems Found

1. **Caret (`>`) is mispositioned**: It's `absolute left-0` relative to the full-width link container (which spans the entire row). Since the text is centered, the caret appears at the far-left edge of the viewport area — disconnected from the text it's supposed to lead.

2. **Text shifts right, caret stays far left**: On hover, the text gets `translateX(4px)` but the caret is anchored to the container edge, not the text. The spatial relationship is broken.

3. **Scan line sweep is barely visible**: The 2px red bar sweeping left-to-right is too subtle at the current opacity and size to register as a deliberate effect.

4. **Glow is too faint**: The radial glow at `0.08` opacity is nearly invisible against the dark background.

## Fix

**Restructure the link internals** so the caret is positioned relative to the text, not the container:

- Wrap the caret + text in an `inline-flex` container so they sit next to each other naturally
- Remove `absolute` positioning from the caret — use `opacity: 0 → 1` and a small negative margin or gap instead
- Keep the link itself as `flex justify-center` so the group stays centered

**Improve the hover effects**:

- Caret: `opacity 0→0.8`, slight `translateX` from -8px to 0 (slides in from left of text)
- Text: subtle color shift to slightly warmer white (`hsl(0 0% 100% / 0.95)`) instead of translateX (shifting centered text looks off-balance)
- Glow: increase to `0.12` opacity, tighten the ellipse so it concentrates behind the text
- Scan line: widen to 3px, increase opacity to `0.8`, add a longer trailing glow (`box-shadow` spread)
- Add a faint red underline that scales in from center (`scaleX(0) → scaleX(1)`) — 1px, red at 40% opacity

**Files to modify**:
- `src/pages/Index.tsx` — restructure link markup (inline-flex wrapper for caret + text)
- `src/index.css` — rewrite `.hero-nav-link:hover` rules with corrected selectors and improved values

