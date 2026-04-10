

# Fix: Wheel scrolling escapes current frame

## Problem
When scrolling up on the quiz results page, the wheel handler allows scrolling back into the previous slide. The `getFrameBoundsAtScroll` function determines which frame you're in by probing `scrollTop + 1`. At the exact boundary between frames, this probe can land in the previous frame, causing the handler to use the wrong frame bounds — which then allows free scrolling into that previous frame.

## Fix — `src/pages/Deck.tsx`

Replace the wheel handler's frame detection with one that uses `currentFrame` state (which is already tracked) instead of guessing from scroll position. This makes the boundary rock-solid:

```typescript
const handler = (e: WheelEvent) => {
  const frameEl = frameRefs.current[currentFrame];
  if (!frameEl) return;
  const frameTop = frameEl.offsetTop;
  const frameBottom = frameTop + frameEl.scrollHeight;
  const viewHeight = el.clientHeight;
  const scrollTop = el.scrollTop;
  const maxScrollTop = Math.max(frameTop, frameBottom - viewHeight);

  if (e.deltaY > 0 && scrollTop + e.deltaY > maxScrollTop) {
    e.preventDefault();
    el.scrollTop = maxScrollTop;
  } else if (e.deltaY < 0 && scrollTop + e.deltaY < frameTop) {
    e.preventDefault();
    el.scrollTop = frameTop;
  }
};
```

The key change: use `frameRefs.current[currentFrame]` (the known active frame) instead of probing scroll position to guess which frame the user is in. This also means adding `currentFrame` to the `useEffect` dependency array so the handler always references the correct frame.

This guarantees the wheel can never escape the current frame — scrolling is physically clamped to the frame's top and bottom edges, regardless of momentum or sub-pixel rounding.

