
# Fix mobile SFX properly

## Why it’s failing on iOS

This is not a “mobile event” problem first. It’s an audio lifecycle problem.

1. `useGlitchSFX.ts` calls `sharedCtx.resume()` but does not wait for it.
2. Right after that, it creates oscillators and starts playback immediately.
3. On iOS Safari, if the audio context is still `suspended` when those nodes are scheduled, you hear nothing.
4. The sub-page loading sound is triggered from `useEffect`, which is not a user gesture, so it cannot unlock audio by itself.
5. Route navigation happens immediately after tapping a hero link, which gives the sound even less chance to start before the screen changes.

## Fix approach

### 1. Refactor `src/hooks/useGlitchSFX.ts`
Make the hook expose a real “audio ready” path instead of best-effort fire-and-pray.

Plan:
- Keep module-level `sharedCtx` / `unlocked`
- Add an async `ensureAudioReady()` function that:
  - creates `AudioContext` / `webkitAudioContext`
  - `await`s `resume()`
  - primes the context with the silent buffer
  - only marks `unlocked = true` after that succeeds
- Make `playHoverGlitch`, `playClickGlitch`, `playChitter` assume the context is already ready
- Add a safe guard so non-gesture effects do nothing unless audio has already been unlocked

This removes the current race where playback is scheduled before iOS actually allows audio.

### 2. Change hero-link interaction in `src/pages/Index.tsx`
Do not rely on the current `Link` navigation timing.

Plan:
- Use `useNavigate`
- Intercept hero-link activation
- On tap/click:
  - prevent default navigation
  - call `ensureAudioReady()`
  - play the click sound
  - navigate after a very short delay (~60–120ms)

Important:
- Keep hover sound desktop-only
- Do not add “hover on tap” back
- Preserve keyboard activation

This makes the mobile tap and desktop click use the same click sound, exactly as requested.

### 3. Tighten `src/components/CapabilityLayout.tsx`
The loading chitter should only fire after audio is already unlocked.

Plan:
- Before `playChitter()`, check the shared unlocked state (or a helper like `canPlayAudio()`)
- If audio is not unlocked yet, skip it silently

That prevents iOS from trying to play blocked audio from `useEffect`.

## Expected result

After this:
- first tap on a hero link on iPhone should unlock audio correctly
- that same tap should play the click SFX before navigation
- the loading chitter on the destination page should work only after the first interaction has unlocked audio
- no fake hover-on-tap behavior

## Files to update

- `src/hooks/useGlitchSFX.ts`
- `src/pages/Index.tsx`
- `src/components/CapabilityLayout.tsx`

## Technical note

The core bug is this line pattern in the current hook:

```ts
if (sharedCtx.state === "suspended") {
  void sharedCtx.resume();
}
```

That is the weak point. On iOS, “resume requested” is not the same as “audio is now playable.” The fix is to make unlock explicit, awaited, and tied to the hero-link tap before navigation.
