

## Problem

Frame 4 (Hallmarks) has two issues:

1. **Content too wide** — the right column (`lg:w-[65%]` of 1400px max) extends under the fixed Continue button and other corner chrome (back button, progress bar, ESC). When hallmark cards expand, content overflows beneath these overlays.

2. **Content vertically clipped** — the expanded hallmark cards push content below the viewport, but the DeckFrame's `minHeight: 100dvh` doesn't grow enough, and the deck's wheel handler prevents normal scrolling within the frame.

This is a systemic issue — it affects any `mode="wide"` frame where content gets close to the edges. The fix should ensure all deck content stays clear of the fixed chrome.

## Fix

### 1. Add safe padding to DeckFrame for chrome clearance

Add bottom padding to account for the fixed bottom nav bar (~80px tall including its 28px bottom padding). The current `paddingBottom: clamp(120px, 16vh, 180px)` should already clear it, but the horizontal padding on `wide` mode (`lg:px-28` = 112px) may not be enough on smaller viewports when the Continue button sits at the right edge.

**In `src/components/deck/DeckFrame.tsx`:**
- Increase horizontal padding on `wide` mode from `lg:px-28` to `lg:px-32` (128px) to add more clearance from edge chrome.

### 2. Constrain the right column width on Frame 4

**In `src/pages/Deck.tsx` (Frame 4, ~line 1124):**
- Change the right column from `lg:w-[65%]` to `lg:w-[60%]` and add a `max-width` constraint so cards don't run under the Continue button.
- The left column stays at `lg:w-[35%]` → adjust to `lg:w-[38%]` for balance.

### 3. Allow Frame 4 to grow vertically when cards expand

The hallmark cards expand to show rationale + "How we help" + assessment buttons. When all three are open, this exceeds the viewport.

**In `src/pages/Deck.tsx`:**
- The DeckFrame already uses `minHeight: 100dvh` so it can grow. The issue is the deck wheel handler locks scrolling. The hallmarks section needs to work within the snap frame's visible area — the cards already use `maxHeight` transitions so they fit. No scroll change needed here; the content just needs to not overlap the chrome.

### 4. Apply consistent content inset across all wide frames

To prevent any future frame from running under corner chrome, update the `wide` mode padding in DeckFrame to provide more breathing room:

**`src/components/deck/DeckFrame.tsx`:**
```
wide: "max-w-[1280px] px-8 md:px-20 lg:px-28",
```

Reduce `max-w` from 1400px to 1280px. This pulls all wide content inward, creating ~60px more clearance on each side at full width — enough that no card edge touches the Continue or Back buttons.

### Summary of changes

| File | Change |
|------|--------|
| `src/components/deck/DeckFrame.tsx` | Reduce `wide` max-width from 1400px → 1280px |
| `src/pages/Deck.tsx` (Frame 4) | Right column `lg:w-[65%]` → `lg:w-[58%]`, left `lg:w-[35%]` → `lg:w-[40%]` |
| `src/pages/Deck.tsx` (bottom nav) | Update `maxWidth` from 1400px → 1280px to match |

This keeps all content comfortably inside the chrome safe zone without breaking any existing scroll behavior.

