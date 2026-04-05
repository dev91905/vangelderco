

# Restore Horizontal Left-to-Right Scan Line

## What You Want
The original horizontal scan line that sweeps **left to right** across each link on hover, then disappears — not the vertical top-to-bottom sweep currently in place.

## Changes

### `src/pages/Index.tsx`
- Change the `.hero-nav-scan` span from horizontal bar (`left-0 right-0`, `height: 1px`) to a **vertical line** (`top-0 bottom-0`, `width: 1px`) that sweeps left-to-right across the link

### `src/index.css`
- Replace `@keyframes hero-scan-down` with `@keyframes hero-scan-right` — animates `left` from `0%` to `100%` instead of `top`
- Fades out at the end so it doesn't stick at the right edge
- Update `.hero-nav-link:hover .hero-nav-scan` to reference the new keyframe

```css
@keyframes hero-scan-right {
  0% { left: 0%; opacity: 1; }
  80% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}
```

The scan element becomes a 1px-wide vertical red line (full height of the link) that sweeps across left-to-right on hover, with the same red accent color and glow trail.

