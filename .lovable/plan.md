
# Restore SFX to Simple, Immediate First-Hover Playback

## Diagnosis
The regression is in `src/hooks/useGlitchSFX.ts`, not any backend. The current version `await`s `ctx.resume()` before scheduling sound. On refresh, that stalls the hover path until the browser grants activation, which in your session is only happening after a click. That is the jank.

There’s a second structural problem: `useGlitchSFX()` is a component hook with its own ref, so the app is treating SFX like disposable component state instead of one shared sound engine.

## Fix
Rip out the promise-gated audio flow and rebuild the SFX path to be simple and immediate again:

1. **Rewrite `useGlitchSFX.ts` as a shared singleton engine**
   - One module-scoped `AudioContext`
   - One module-scoped master gain
   - No per-component audio lifecycle
   - No async play path

2. **Remove `await resume()` from playback**
   - Create/reuse the context synchronously
   - Call `resume()` opportunistically, but do not block sound scheduling on it
   - Schedule sounds a few milliseconds in the future so first-hover playback survives context startup timing

3. **Keep the darker tonal sound character, but simplify the generators**
   - Hover: short low sine ping
   - Click: deeper triangle/sine pulse
   - Load: restrained tonal pip sequence
   - No extra unlock logic, no global click hacks, no event gymnastics

4. **Tighten event wiring**
   - `src/pages/Index.tsx`: trigger hover SFX on `pointerenter` instead of relying only on `mouseenter`
   - Add `focus` support so keyboard navigation gets the same behavior
   - Keep click SFX on activation
   - `src/components/CapabilityLayout.tsx`: keep load chitter, but make sure it only fires once per completed load cycle

## Files
- `src/hooks/useGlitchSFX.ts` — full playback-path rewrite
- `src/pages/Index.tsx` — cleaner trigger events
- `src/components/CapabilityLayout.tsx` — keep load trigger disciplined

## Result
This restores the original behavior you were asking for: hover/click SFX behave like normal UI sounds again on reload, without the current async/resume bottleneck and without any fake “backend” workaround layer.

## QA
After implementation I’ll specifically verify:
- first hover on homepage after refresh
- first click after refresh
- route transition to each sub-page
- load chitter firing once, not duplicating
- repeated hovers not stuttering or stacking weirdly
