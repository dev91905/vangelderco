

# Fix Scan Beam — Fade Out at End

## Problem
The scan line sweeps down but stays visible at `top: 100%` after the animation ends (due to `forwards` fill mode). It should disappear after completing the sweep.

## Fix

### `src/index.css`
Update the `hero-scan-down` keyframes to fade the line's opacity to 0 at the end:

```css
@keyframes hero-scan-down {
  0% { top: -1px; opacity: 1; }
  80% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
```

The `forwards` fill mode stays — it now holds the final state of `opacity: 0`, so the line vanishes after sweeping through. No other files need changes.

