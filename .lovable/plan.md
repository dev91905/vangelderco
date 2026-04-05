

# Fix Hover SFX After Page Refresh

## Problem

`playHoverGlitch` calls `getReadyCtx()` which checks `unlocked === true`. But `unlocked` only becomes `true` after `ensureAudioReady()` is called — which only happens on **click**. So after a fresh page load, every hover silently no-ops because audio was never initialized.

## Fix — `src/hooks/useGlitchSFX.ts`

Change `playHoverGlitch` (and the other play functions) to self-initialize the AudioContext synchronously when called. On desktop, `mouseenter` is a valid user gesture that can create/resume an AudioContext.

Replace the `getReadyCtx` guard pattern: instead of bailing when not unlocked, have each play function call a synchronous init that creates the context, resumes it (fire-and-forget is fine on desktop), and plays the silent unlock buffer on first call. This is the same logic as `ensureAudioReady` but synchronous — which works on desktop browsers (only iOS requires the async await).

Specifically:
- Add a `syncInit()` helper that creates the context, calls `.resume()` (no await), primes with silent buffer, sets `unlocked = true`
- `playHoverGlitch`, `playClickGlitch`, `playChitter` call `syncInit()` instead of `getReadyCtx()`
- `ensureAudioReady` stays async for the iOS click path
- One file changed, ~10 lines

