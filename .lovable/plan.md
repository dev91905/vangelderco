

## Mobile/Tablet Responsive Audit — Issues Found & Fix Plan

### Issues Identified

**1. Diagnostic Slide 2 — Bottom nav overlaps card content on mobile (375px)**
The fixed bottom nav bar (with Continue button) sits on top of the last pain-point cards. The `DeckFrame` has `paddingBottom: clamp(120px, 16vh, 180px)` but on short mobile screens, the cards extend below the fold and the fixed nav covers them. The extra spacer `<div style={{ minHeight: "48px" }} />` on slide 2 isn't enough.

**2. Work page carousel — cards too wide for mobile**
`CaseCarousel` card width is `clamp(320px, 28vw, 420px)`. On a 375px screen with `clamp(24px, 4vw, 80px)` padding on each side, the card is 320px but the container is ~327px. Cards are nearly full-width with no peek of the next card, making it unclear the carousel is swipeable.

**3. Diagnostic bottom nav padding too tight on mobile**
Bottom nav uses `padding: "0 32px 28px"`. On small phones, 32px side padding is fine, but `28px` bottom doesn't account for iOS safe area (home indicator). Should use `env(safe-area-inset-bottom)`.

**4. Results slide (Frame 9) — dimension cards column stacks poorly on mobile**
The results grid is `grid-cols-1 lg:grid-cols-[...]`. On mobile, the right column (dimension cards) gets a `maxHeight: clamp(560px, calc(100dvh - 220px), 760px)` scroll container. On a 375×812 screen, the left diagnostic card + description takes up most of the viewport, pushing the scrollable dimension cards below the fold with a cramped scroll area.

**5. DeckFrame padding on mobile could be tighter**
`DeckFrame` narrow mode has `px-8 md:px-16` (32px on mobile). Combined with the fixed nav's 32px padding, it's consistent but leaves limited content width on small screens. The wide mode `px-8 md:px-20 lg:px-28` is fine.

**6. CaseTimelineOverlay — horizontal scroll phases not obvious on mobile**
The overlay uses wheel-to-horizontal-scroll, which doesn't work on touch devices. Need to verify touch scrolling works and add a swipe hint for mobile.

### Plan

**File: `src/components/deck/DeckFrame.tsx`**
- Reduce mobile padding from `px-8` to `px-5` for both narrow and wide modes
- This gives more breathing room for content on 375px screens

**File: `src/pages/Deck.tsx`**
- Bottom nav: add `paddingBottom: calc(28px + env(safe-area-inset-bottom, 0px))` for iOS safe area
- Reduce bottom nav side padding from 32px to `clamp(16px, 4vw, 32px)` on mobile
- Frame 9 (Results): on mobile, reduce the max-height of the dimension cards scroll area and add more padding below the left column so users can scroll to the cards
- Frame 2 (Pain points): increase the bottom spacer to account for the fixed nav height

**File: `src/components/deck/CaseCarousel.tsx`**
- Change card width from `clamp(320px, 28vw, 420px)` to `clamp(280px, 75vw, 420px)` so on mobile the card is ~280px, leaving a visible peek of the next card
- This makes it clear the carousel is swipeable

**File: `src/pages/Work.tsx`**
- Reduce top bar padding from `20px 32px` to `20px clamp(16px, 4vw, 32px)` to match mobile spacing

**File: `src/components/deck/CaseTimelineOverlay.tsx`**
- Ensure the horizontal scroll container has `overflow-x: auto` and `-webkit-overflow-scrolling: touch` for mobile swipe support
- Already uses horizontal scroll, just verify touch works (likely fine with native scroll)

### Summary of Changes
- 5 files touched
- All changes are CSS/spacing adjustments — no logic changes
- Fixes: bottom nav overlap, carousel card width, iOS safe area, results slide mobile layout, consistent mobile padding
