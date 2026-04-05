

# Add Corner Brackets to Password Gate

## Problem
The password gate renders a plain dark background. It doesn't use `AtmosphericLayout`, so it's missing the four corner bracket SVGs that appear on every other page. It also lacks the breathing glow, vignette, and scan beam — but the corner brackets are the most visually noticeable omission.

## Fix

### `src/components/PasswordGate.tsx` — `PasswordGateWrapper` return block

Add the four corner bracket SVGs (copied from `AtmosphericLayout.tsx`) inside the gate's outer `div`, alongside the existing HUD elements. Same positioning (`fixed top-4 left-4` etc.), same `z-30`, same `opacity-[0.12]`.

Optionally also add the breathing glow, vignette, and scan beam divs to fully match the atmospheric feel — these are pure decorative layers with `pointer-events-none` and won't interfere with the form.

### No other files change

One file, adding ~20 lines of SVG/decorative markup.

