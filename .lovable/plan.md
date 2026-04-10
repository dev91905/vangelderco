

# Fix: Quiz Results Not Scrollable

## Problem

The wheel event handler (lines 372-395) blocks scrolling when `viewBottom >= frameBottom - 2`. When quiz results are revealed, the frame content is much taller than the viewport — but the handler still prevents downward scrolling because the view bottom has reached the frame bottom boundary. The logic was designed to keep you *within* a frame, but it's too aggressive: it doesn't account for frames whose content exceeds the viewport height.

## Fix

In the wheel handler, only `preventDefault` when the frame content fits within the viewport (i.e., the frame isn't internally scrollable). If the frame is taller than the viewport, allow free scrolling within it — only block at the actual top and bottom edges of that frame's content.

**`src/pages/Deck.tsx` lines 376-391** — replace the handler logic:

```typescript
const handler = (e: WheelEvent) => {
  const frameEl = frameRefs.current[currentFrame];
  if (!frameEl) return;
  const frameTop = frameEl.offsetTop;
  const frameBottom = frameTop + frameEl.offsetHeight;
  const scrollTop = el.scrollTop;
  const viewBottom = scrollTop + el.clientHeight;

  const atBottom = viewBottom >= frameBottom - 2;
  const atTop = scrollTop <= frameTop + 2;

  // Scrolling down past the frame's bottom edge
  if (e.deltaY > 0 && atBottom) {
    e.preventDefault();
  }
  // Scrolling up past the frame's top edge
  if (e.deltaY < 0 && atTop) {
    e.preventDefault();
  }
};
```

Wait — this is already what it does. The real issue is likely that the frame's `offsetHeight` doesn't reflect the full content height because the DeckFrame sets `minHeight: 100dvh` but the quiz results content overflows it. Let me check: the quiz frame uses `DeckFrame` which wraps in a `<section>` with `minHeight: 100dvh`. When `quizRevealed` is true, the inner content is much taller. The section *should* expand to fit. But the wheel handler uses `frameEl.offsetHeight` which should reflect the actual rendered height.

The more likely issue: `containerRef` is the outer scroll container. If it uses `overflow: hidden` or `scroll-snap-type: y mandatory`, the snap behavior itself may be fighting the scroll. Let me check the container setup.

Actually — the simplest and most reliable fix: when the current frame's content is taller than the viewport, don't block wheel events at all. The boundary check already handles it correctly *if* the frame height is calculated properly. The bug is likely that `frameEl.offsetHeight` returns only `100dvh` (the min-height) rather than the actual content height when `quizRevealed` expands the content.

**Root cause**: DeckFrame's `<section>` has `minHeight: 100dvh` but may not be expanding to fit the quiz results content. Or the scroll snap is forcing the container to snap back.

## Changes — `src/pages/Deck.tsx`

1. **Wheel handler** (lines 376-391): Add a check — if the frame's scrollable content height exceeds the viewport, allow scrolling freely within it. Only block at the true edges:

```typescript
const handler = (e: WheelEvent) => {
  const frameEl = frameRefs.current[currentFrame];
  if (!frameEl) return;
  const frameTop = frameEl.offsetTop;
  const frameBottom = frameTop + frameEl.scrollHeight; // use scrollHeight, not offsetHeight
  const scrollTop = el.scrollTop;
  const viewBottom = scrollTop + el.clientHeight;

  if (e.deltaY > 0 && viewBottom >= frameBottom - 2) {
    e.preventDefault();
  }
  if (e.deltaY < 0 && scrollTop <= frameTop + 2) {
    e.preventDefault();
  }
};
```

2. Also ensure the scroll snap on the container doesn't force snapping back. If `scroll-snap-type: y mandatory` is set, change to `proximity` or remove snap entirely (since navigation is button-driven now).

