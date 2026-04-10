

## Problem

The results layout has three issues:

1. **Header spans full width above the two-column layout.** "Your results" / "Here's what your answers tell us" / subtitle sits outside and above the left+right split. This eats ~120px of vertical space, so the right column's `maxHeight: 100dvh` doesn't account for it — the bottom cards get clipped.

2. **Left column isn't a proper sticky sidebar.** It's `height: 100%` but not `position: sticky`, so it doesn't stay pinned when the right column scrolls.

3. **Right column can't scroll far enough** because the height math is wrong and padding is insufficient.

## Fix

Restructure the results layout so the header text moves INTO the left column, making it a true sticky sidebar with all the context stacked vertically:

**Left column (sticky, ~38% width):**
- "Your results" label
- "Here's what your answers tell us." heading
- "The summary is at the top..." subtitle
- Diagnostic grade card
- Start over button
- `position: sticky; top: 0; height: 100dvh; overflow: hidden`
- Content vertically centered or top-aligned with padding

**Right column (scrollable, ~62% width):**
- Dimension breakdown cards
- `maxHeight: 100dvh; overflowY: auto; overscrollBehavior: contain`
- Generous `paddingBottom` (~120px) so the measurement card is fully reachable
- The existing wheel-trapping handler stays intact — cards scroll within this container only

**Concrete changes in `src/pages/Deck.tsx`:**

1. When `quizRevealed` is true, remove the header block above the two-column flex (lines 764–787) — move its content into the left column div (line 914 area), placed above the diagnostic card.

2. Make the left column `position: sticky; top: 0; height: 100dvh` with vertical padding and `overflow: hidden` so it never scrolls.

3. Set the right column `maxHeight: 100dvh` with `paddingBottom: "120px"` to ensure the last card is fully scrollable into view.

4. The outer container for the results block (line 911) changes from `height: 100dvh` to `min-height: 100dvh` so it can accommodate the scroll region properly.

5. The wheel-trapping fix (`data-results-scroll`, `overscrollBehavior: contain`, the dedicated wheel handler) stays exactly as-is — no changes to scroll lock behavior.

