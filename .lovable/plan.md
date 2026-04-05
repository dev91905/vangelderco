

# Add Scan Effect to CONTROL-Style Hover

## Approach
Add a **vertical** scan line (top-to-bottom) within each link on hover — like a CRT beam scanning over the selected row. This avoids the old horizontal sweep problem (inconsistent widths) because a vertical sweep is always the same height regardless of text length.

## How It Works
- A thin horizontal red line (1px, full width of the link area) sweeps **downward** through the link over ~600ms on hover
- Faint red opacity (`0.4`), with a soft glow trail via `box-shadow`
- Plays once per hover, not looping — like the system "reading" the selection
- Layered behind the text (`z-0`), above the background wash

## Files to Modify

### `src/pages/Index.tsx`
- Add one `<span>` inside each link: `.hero-nav-scan`, positioned `absolute`, full width, 1px tall, hidden by default

### `src/index.css`
- Add `@keyframes hero-scan-down` — animates `top` from `-1px` to `100%`
- On `.hero-nav-link:hover .hero-nav-scan`: trigger the animation once (`forwards`), set opacity and glow

