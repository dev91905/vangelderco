

## Fix: Reset scroll position when changing slides on mobile

### Problem
When navigating between slides on mobile, the internal scrollable container (`deck-mobile-content`) retains its previous scroll position. So if you scrolled down on slide 2, then went back to slide 1, then forward to slide 2 again — it starts mid-page. More importantly, slide 2 content appears starting in the middle because the scroll container doesn't reset to top.

### Solution
Reset the scroll position of the `deck-mobile-content` div to `scrollTop = 0` whenever the visible frame changes. This ensures every slide (except slide 1, which is centered) starts at the top.

### File changes

**`src/components/deck/DeckFrame.tsx`**
- Add a `useEffect` that watches `isVisible` — when a frame becomes visible on mobile, reset the internal scrollable div's `scrollTop` to `0`.
- Add a ref to the scrollable `deck-mobile-content` div to target it for scroll reset.

This is a small, surgical fix — roughly 8 lines added. Slide 1 keeps `justify-content: center` so it stays vertically centered. All other slides start at top as expected.

