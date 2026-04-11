
Root cause
- `src/pages/Deck.tsx` currently hard-locks the deck with `overflowY: "hidden"` and `overscrollBehaviorY: "none"`.
- That same file also adds a global `touchstart`/`touchend` swipe handler that hijacks vertical gestures and converts them into frame jumps.
- On mobile/tablet, that means users cannot do normal finger scrolling, and taller slides like Results and the CTA form become unreachable.
- Slide 9 is additionally cramped by the mobile/tablet `max-h-[36vh]` results panel cap.

Fix plan

1. Restore native mobile/tablet scrolling in `src/pages/Deck.tsx`
- Remove the global touch-swipe navigation on touch devices.
- Change the main deck container to allow native vertical scrolling on mobile/tablet, with momentum scrolling.
- Keep desktop keyboard/button navigation intact, and restrict wheel-lock behavior to desktop/pointer-fine only.

2. Stop forcing mobile content into a locked viewport
- Update `src/components/deck/DeckFrame.tsx` so mobile/tablet frames have enough bottom space for the fixed nav and safe area.
- Preserve the horizontal, deck-like feel on desktop while letting smaller screens behave like scrollable pages.

3. Fix the broken slides directly
- Slide 9 in `src/pages/Deck.tsx`: remove the mobile/tablet `36vh` trap so the results cards flow naturally on smaller screens; keep a constrained internal scroll only where it actually helps on desktop.
- Slide 10 in `src/pages/Deck.tsx`: make the CTA form fully reachable on tablet/mobile by reducing top spacing and stacking the name fields to one column on small screens.

4. Keep progress/navigation stable
- `scrollToFrame()` still works from Back/Continue.
- `currentFrame` continues to update from real scroll position so the progress bar stays correct while users scroll manually.
- Fixed chrome stays visible, but no longer blocks the ability to reach the bottom of a slide.

5. Cleanup while touching the deck
- Fix the invalid ref usage warnings for `TypewriterHeading` and `ContinueButton`, since they are currently throwing React warnings in the console and muddying deck behavior/debugging.

Files to update
- `src/pages/Deck.tsx`
- `src/components/deck/DeckFrame.tsx`
- `src/components/deck/TypewriterHeading.tsx` or the ref usage in `Deck.tsx`

QA after implementation
- Check `/diagnostic` at 390x844, 768x1024, and 834x1194.
- Confirm finger scrolling works on slides 2, 9, and 10.
- Confirm the results area is readable without trapping scroll.
- Confirm the CTA form is fully reachable and the fixed bottom nav does not cover the last field/button.
