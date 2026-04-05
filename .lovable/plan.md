

# Remove Visible Gradient Rings from Background

## What they are

In `AtmosphericLayout.tsx` there are two radial gradient overlays:

1. **Breathing red glow** (line 13-22): A `radial-gradient(ellipse at center, hsl(0 80% 48% / 0.25) 0%, transparent 70%)` — the 70% stop creates a perceptible oval edge rather than a seamless fade.
2. **Vignette** (line 25-31): A `radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.6) 100%)` — the 40% stop can create a visible ring where darkness begins.

## Fix

### `src/components/AtmosphericLayout.tsx`

**Breathing glow**: Soften the gradient with multiple stops so it feathers out gradually instead of cutting off at 70%:
```
radial-gradient(ellipse at center,
  hsl(0 80% 48% / 0.18) 0%,
  hsl(0 80% 48% / 0.10) 30%,
  hsl(0 80% 48% / 0.03) 55%,
  transparent 80%)
```

**Vignette**: Smooth the transition with intermediate stops:
```
radial-gradient(ellipse at center,
  transparent 30%,
  hsl(0 0% 0% / 0.15) 50%,
  hsl(0 0% 0% / 0.4) 75%,
  hsl(0 0% 0% / 0.6) 100%)
```

One file, two gradient edits. No other changes.

