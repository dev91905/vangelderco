
Fix the actual leak in `src/pages/Deck.tsx` by stopping scroll chaining, not just clamping the parent.

What’s happening:
- The deck-level wheel handler currently does this:
  - if the event is inside `[data-results-scroll='true']`, it returns early
  - otherwise it prevents default and locks the parent deck scroll
- That means the right-hand results column is unmanaged.
- When that inner column hits its top or bottom, the browser passes the remaining wheel delta to the parent scroll container.
- That is why you can still move from slide 3 to slide 4, or back to slide 2. The leak is coming from the nested scroll area.

What I’ll change:
1. Keep the outer deck as a hard-locked container
- Continue preventing default on wheel events at the deck level.
- Clamp `containerRef` to the active frame bounds using `currentFrame` and `frameRefs.current[currentFrame]`.

2. Explicitly handle wheel events inside the results breakdown panel
- Add a dedicated wheel handler to the right-side results scroller.
- If the panel can still scroll in the wheel direction, let it scroll normally.
- If the panel is already at its top or bottom, preventDefault there too so the wheel dies instead of escaping to the parent deck.

3. Add CSS-level overscroll protection
- On the results column, add `overscrollBehavior: "contain"` to stop browser scroll chaining.
- On the outer deck container, add `overscrollBehaviorY: "none"` so momentum/trackpad overscroll cannot propagate to the page.

4. Make slide 3 a true locked frame
- Ensure the results state (`quizRevealed`) does not change the frame into a parent-scrollable layout that can extend beyond viewport expectations.
- Keep the right column as the only vertical scroll region on desktop when results are shown.

5. Verify the hard rule
- Mouse wheel on slide 3 should never move the deck to slide 2 or 4.
- Only explicit navigation controls / keyboard actions should change slides.
- The right-side results column should remain scrollable independently.

Technical details:
- File: `src/pages/Deck.tsx`
- Main bug site:
  - current wheel handler around lines 455–478
  - results scroller around lines 956–963
- Concrete implementation:
  - replace the current early-return behavior for `[data-results-scroll='true']`
  - attach a `ref` to the results scroll container
  - compute:
    - `atTop = scrollTop <= 0`
    - `atBottom = scrollTop + clientHeight >= scrollHeight - 1`
  - if `(deltaY < 0 && atTop) || (deltaY > 0 && atBottom)`, call `preventDefault()` and `stopPropagation()`
  - add `overscrollBehavior: "contain"` to the results panel
  - add `overscrollBehaviorY: "none"` to the deck container

Expected result:
- The mouse wheel cannot move between slides. Period.
- On the results slide, the wheel only scrolls the right-hand breakdown column.
- Once that inner panel reaches the end, nothing happens instead of the deck advancing.
