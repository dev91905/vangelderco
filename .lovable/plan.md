

# Fix SFX Not Playing on First Hover

## Root cause

When `AudioContext` is first created, it's `suspended`. The code calls `.resume()` but **doesn't wait for it to resolve** before scheduling oscillators. The oscillators get scheduled at `currentTime = 0` on a still-suspended context — by the time the context actually resumes, those scheduled sounds are in the past and get silently skipped.

The first click works because by then the context is already resumed from the earlier hover attempt, so subsequent calls find it in `running` state.

## Fix — `src/hooks/useGlitchSFX.ts`

Make `getCtx()` return a `Promise<AudioContext>` that resolves after `.resume()` completes. Make all three play functions `async` — they `await getCtx()`, then schedule oscillators using the now-accurate `ctx.currentTime`.

```typescript
const getCtx = useCallback(async () => {
  if (!ctxRef.current) {
    ctxRef.current = new AudioContext();
  }
  if (ctxRef.current.state === "suspended") {
    await ctxRef.current.resume();
  }
  return ctxRef.current;
}, []);

const playHoverGlitch = useCallback(async () => {
  const ctx = await getCtx();
  const now = ctx.currentTime;
  // ... rest unchanged
}, [getCtx]);
```

Same pattern for `playClickGlitch` and `playChitter`. The callers (`onMouseEnter`, `onClick`) don't need to change — calling an async function without `await` is fine here since we don't need the return value.

One file, minimal change — just add `async/await` to ensure the context is actually running before scheduling audio.

