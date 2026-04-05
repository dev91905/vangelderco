

# Add Unlock Success SFX

## Problem
Successful password unlock uses `playChitter` — the same rapid pip sound used elsewhere. It doesn't feel like "access granted." Need a distinct, confirmational sound that evokes unlocking/opening.

## Sound design: `playUnlockSuccess`
An ascending two-tone chime — low note resolves up to a higher note with a slight overlap, like a lock releasing. Sine waves, clean, no harshness.

- **Tone 1**: 220Hz sine, 0.12s duration, moderate volume — the "click" of the lock
- **Tone 2**: 440Hz sine, starts 0.08s after tone 1, 0.15s duration, slightly louder — the "open/confirm" resolution
- Both with smooth attack/decay envelopes
- Total duration ~0.25s — short but distinctly different from the thuddy `playClickGlitch`

## Changes

### `src/hooks/useGlitchSFX.ts`
- Add `playUnlockSuccess` function with the ascending two-tone chime
- Export it from the hook return object

### `src/components/PasswordGate.tsx`
- Replace `playChitter()` on successful unlock with `playUnlockSuccess()`

## Files
- `src/hooks/useGlitchSFX.ts`
- `src/components/PasswordGate.tsx`

