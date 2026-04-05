

# Add Subtle Glitch/Electric Sound Effects

## Approach

Generate tiny audio clips programmatically using the Web Audio API — no files to bundle, no network latency, fully deterministic. This fits the brutalist aesthetic perfectly: raw synthesized clicks and crackles rather than polished samples.

## What gets sounds

1. **Hero link hover** — short electric crackle (~50ms)
2. **Hero link click** — slightly longer signal chirp (~100ms)
3. **Loading text appearance** — faint digital chitter when "Loading..." text mounts on capability pages

## Implementation

### 1. New hook: `src/hooks/useGlitchSFX.ts`

A custom hook that creates an `AudioContext` on first interaction and exposes three functions:

- **`playHoverGlitch()`** — generates a ~50ms burst of filtered white noise with a sharp high-pass filter and rapid volume decay. Sounds like a tiny static pop.
- **`playClickGlitch()`** — a ~100ms oscillator sweep (saw wave, 800Hz→200Hz) mixed with a noise burst. Sounds like a short electronic chirp/signal.
- **`playChitter()`** — a ~200ms series of 4-5 rapid micro-pops (noise bursts at 30ms intervals). Sounds like digital data transmission.

All sounds play at very low volume (~0.06-0.1 gain) to stay subtle. AudioContext is created lazily on first user gesture to comply with browser autoplay policies.

### 2. Wire into `src/pages/Index.tsx`

- Import `useGlitchSFX`
- Add `onMouseEnter={() => playHoverGlitch()}` to each hero `<Link>`
- Add `onClick={() => playClickGlitch()}` to each hero `<Link>`

### 3. Wire into `src/components/CapabilityLayout.tsx`

- Import `useGlitchSFX`
- When `isLoading` transitions from `true` to `false` (posts loaded), call `playChitter()` via a `useEffect`

## Files
- **New**: `src/hooks/useGlitchSFX.ts`
- **Edit**: `src/pages/Index.tsx` — add hover/click handlers
- **Edit**: `src/components/CapabilityLayout.tsx` — add loading chitter

No external dependencies, no audio files, no API keys.

