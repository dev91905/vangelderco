

## Fix: Mobile content not starting at top

### Problem
In `DeckFrame.tsx`, the mobile content area uses `justifyContent: "center"` when `align` is `"center"` (the default). This vertically centers content in the viewport shell, creating dead space above the heading on slides like the quiz, capabilities, and metrics. Content should always start near the top on mobile, with the internal scroll area handling overflow.

### Desktop title
The desktop title renders correctly on fresh load. If it disappeared, it was likely a session-restore edge case where `useFrameReveal`'s IntersectionObserver briefly fired during the 100ms before `scrollIntoView`. I'll add a guard so frame 0's TypewriterHeading always activates when `currentFrame === 0`, regardless of IntersectionObserver state.

### Changes

**`src/components/deck/DeckFrame.tsx`**
- Change mobile `justifyContent` from conditional center/flex-start to always `"flex-start"` — content always starts at the top of the scrollable area on mobile
- Keep `paddingTop: "60px"` to clear the header gradient

**`src/pages/Deck.tsx`**
- Pass `currentFrame === 0` as a fallback to the TypewriterHeading's `active` prop so it fires even if the IntersectionObserver hasn't reported yet (covers session-restore edge case)

### What stays the same
- Desktop layout unchanged (still uses `alignStyles` with center/left/split)
- All existing nav buttons, progress bar, and gradient styling untouched
- Internal scroll behavior on mobile untouched

