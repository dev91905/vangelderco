

# Redesign Glitch SFX — From Noise Bursts to Tonal UI Sounds

## What's wrong

The current sounds are all **filtered white noise** — random static bursts. That's why they sound like rubber bands snapping. They have no pitch, no tone, no musicality. Real game UI sounds (Control, Halo) use **low-frequency sine/triangle tones** with gentle amplitude envelopes — soft, warm, resonant pulses that feel like the interface is alive.

## New sound design — `src/hooks/useGlitchSFX.ts`

### Hover: Soft tonal ping
- **Single sine wave** at ~220Hz (low A), very short (~80ms)
- Gentle fade-in over 10ms, slow exponential decay
- Gain: `0.03` — barely there
- Optional: layer a second sine at ~330Hz (fifth above) at half volume for harmonic richness
- No noise, no filters. Pure tone.

### Click: Deeper resonant pulse
- **Triangle wave** at ~110Hz (low, feels weighty) for ~150ms
- Layer a sine at ~165Hz at lower volume
- Slight pitch bend downward (110→90Hz) over the duration — gives it that "settling" feel like Control's menu sounds
- Gain: `0.04`
- No noise component at all

### Chitter (loading): Sequence of soft tonal pips
- 4 quick sine pips at ~300Hz, 40ms each, 50ms apart
- Each pip slightly different pitch (300, 320, 280, 340) — feels like data processing
- Very low gain: `0.02`
- Smooth envelope, no hard edges

## Key differences from current
- **No white noise anywhere** — removes all the "bright crackle" character
- **Low frequencies** (110-330Hz) instead of high-pass filtered noise (3000Hz+)
- **Sine/triangle waves** instead of random buffers — gives actual pitch/tone
- **Longer, gentler envelopes** — no sharp attack, gradual decay
- **Much lower gain** across the board

## Files
- `src/hooks/useGlitchSFX.ts` — full rewrite of the three sound functions

