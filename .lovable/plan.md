

# Reduce Grain Jitter at Screen Edges

## Problem
The film grain overlay (`body::before`) uses `transform: translate()` with values up to 4% to animate. Since the overlay is sized exactly to the viewport (`inset: 0`), these translations shift the entire texture, exposing bare edges and creating visible jitter along the screen borders.

## Fix — `src/index.css`

Two changes:

1. **Shrink translation distances** from 2–4% down to 0.5–1% — the grain still animates but the edge movement becomes imperceptible
2. **Oversize the grain layer** by adding `inset: -5%` and `width: 110%; height: 110%` so even with translation, the texture always covers the full viewport with bleed room

```css
/* Updated grain keyframes — much smaller translations */
@keyframes grain {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-0.5%, -0.5%); }
  20% { transform: translate(0.5%, 0.3%); }
  30% { transform: translate(-0.3%, 0.5%); }
  40% { transform: translate(0.5%, -0.3%); }
  50% { transform: translate(-0.5%, 0.3%); }
  60% { transform: translate(0.3%, -0.5%); }
  70% { transform: translate(-0.5%, 0.3%); }
  80% { transform: translate(0.3%, 0.5%); }
  90% { transform: translate(0.5%, -0.3%); }
  100% { transform: translate(-0.3%, 0.5%); }
}
```

And oversize the pseudo-element:
```css
body::before {
  inset: -5%;
  width: 110%;
  height: 110%;
}
```

One file, two small edits.

