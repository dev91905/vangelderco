
Root cause

The mobile architecture is wrong at the container level, not just the slide layouts.

Right now `src/pages/Deck.tsx` makes the outer deck itself the mobile scroller:

- `overflowY: isMobile ? "auto" : "hidden"`
- `scrollSnapType: isMobile ? "y proximity" : "none"`
- `updateCurrentFrame()` derives the active slide from `scrollTop`
- touch/swipe handling was removed, so the browser owns vertical movement

That guarantees users can drag between slides on mobile. Slide 9 was only one symptom. The whole mobile deck is still a scroll page with snap hints.

What I will change

1. Replace mobile deck navigation architecture in `src/pages/Deck.tsx`.
   - Stop using outer-container scrolling as the source of truth on mobile.
   - Make `currentFrame` the source of truth.
   - Mobile deck becomes a locked viewport: one frame visible at a time, no free vertical scrolling between frames.
   - `Continue`, `Back`, progress, and auto-advance interactions move frames programmatically only.

2. Rebuild `DeckFrame` for mobile in `src/components/deck/DeckFrame.tsx`.
   - Keep the existing visual design.
   - Make each mobile frame a true viewport-height shell.
   - Split frame content into:
     - fixed visual frame area
     - bounded internal content area
   - Only the internal content area scrolls when a slide is taller than the viewport.

3. Convert tall mobile slides to internal-scroll layouts in `src/pages/Deck.tsx`.
   - Audit every frame, not just slide 9.
   - Slides with overflow on mobile get explicit internal scroll regions instead of relying on page scroll.
   - Priority slides:
     - slide 2 pain cards
     - slide 4 practices
     - slide 5 capabilities
     - slide 6 metrics
     - slide 8 sectors
     - slide 9 results
     - slide 10 form
   - Preserve the horizontal presentation feel; do not turn core slides into long stacked pages.

4. Restore the intended navigation behavior without redesigning the UI.
   - Keep the existing back button, continue button, and progress bar styling.
   - Do not introduce new nav components or compact redesigns.
   - Ensure bottom chrome never covers mobile content by reserving proper safe-area space inside the frame shell.

5. Remove mobile dependence on snap behavior.
   - No `mandatory`.
   - No `proximity`.
   - No free mobile page scrolling between frames.
   - Mobile transitions become controlled navigation, not browser scroll behavior.

Files to update

- `src/pages/Deck.tsx`
- `src/components/deck/DeckFrame.tsx`
- `src/index.css`

Technical detail

```text
Current mobile model
[outer page scrolls]
 -> browser decides frame movement
 -> user can drag between slides
 -> tall slides depend on page scroll
 -> nav/progress fight for space

Target mobile model
[outer deck locked]
 -> currentFrame controls visible slide
 -> only Back / Continue / auto-advance can change slides
 -> tall slides scroll inside their own bounded content area
 -> nav/progress remain visually the same
```

Why this is the correct fix

Because the bug is not “snap tuning.” The bug is that mobile slide navigation is currently implemented as a scroll container. As long as that remains true, users will always be able to drag between slides. The fix is to move mobile from scroll-driven navigation to state-driven navigation, then explicitly define which parts of each slide are allowed to scroll internally.

QA after implementation

- 390x844, 375x812:
  - cannot drag between slides
  - can only advance with Continue / Back / auto-advance actions
  - tall content scrolls inside the current slide only
  - slide 9 results are immediately visible and internally scrollable
  - slide 10 form is fully reachable without content hiding under nav
- 768x1024 and 834x1194:
  - same behavior
- confirm progress bar and frame label stay in sync with `currentFrame`
- confirm no accidental regressions to existing button styling or desktop layout
