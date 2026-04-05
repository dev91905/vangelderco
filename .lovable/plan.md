

# Fix: SFX Already Works on Hover — No Changes Needed to the Pattern

## What's actually happening

The current code is fine. `getCtx()` lazily creates an `AudioContext` and calls `.resume()` if suspended. Chrome's autoplay policy allows `AudioContext.resume()` on `mouseenter` events in most cases — hover events on interactive elements (links, buttons) are treated as user activation in Chromium browsers.

The previous plan proposed adding a global unlock listener and bailing out if context is suspended — that would **break** hover sounds by refusing to play them until a click happens. That's the opposite of what you want.

## The fix

**Do nothing.** The current `useGlitchSFX.ts` implementation already handles hover-triggered audio correctly. The `.resume()` call inside `getCtx()` fires on every play attempt, which is the correct pattern.

If the previous plan was already implemented (adding bail-out logic), we need to **revert** those changes. But looking at the current file, it's the original working version — no bail-out logic, no global unlock listener. It should work as-is.

## What I'll verify in implementation

- Confirm no other files are intercepting or blocking the audio context
- Test that `playHoverGlitch` fires on `mouseenter` without prior click
- If there's a real browser-specific edge case, add `.resume()` directly inside each play function (it's already there via `getCtx()`, so this is a no-op confirmation)

## Files changed
None — the current code is correct. The proposed "fix" from the previous plan would have broken it.

