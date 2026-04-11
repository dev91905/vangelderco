

## Problem

By setting `overflowY: "auto"` on mobile without scroll snap, the deck now behaves like one long continuous page. Users can scroll freely between slides with no stopping points — the deck feeling is completely gone.

## Root Cause

Line 518 in `Deck.tsx`: `scrollSnapType: "none"` applies universally. Combined with `overflowY: "auto"` on mobile, there's nothing to anchor slides. `DeckFrame.tsx` already has `scrollSnapAlign: "start"` on each frame, but it's ignored because the parent has snap disabled.

## Fix

**Single change in `src/pages/Deck.tsx`** (line 518):

```
scrollSnapType: isMobile ? "y mandatory" : "none",
```

This gives mobile the native finger-scrolling it needs while snapping to each slide, preserving the deck feel. Desktop stays unchanged (keyboard/button navigation with locked scroll).

No other files need changes — `DeckFrame` already has the correct `scrollSnapAlign: "start"` set.

