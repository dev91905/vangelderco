

# Deck Structural Redesign — Vertical Snap Scroll

## The Problem

The deck currently uses **horizontal scroll** (`overflowX: auto`, `overflowY: hidden`, `scrollSnapType: x mandatory`). When content overflows a single viewport (quiz results, CTA form), a `scrollable` prop hacks in `overflowY: auto` on individual frames — creating nested scroll inside horizontal scroll. This produces three scrollbars, conflicting scroll directions, and the custom wheel handler trying to mediate between them. It's architecturally broken.

## The Fix

Switch to **vertical snap scroll** — exactly how Typeform, Tally, and every commercial-grade survey tool works. One scroll direction. Native behavior. No hacks.

```text
CURRENT (broken)                    PROPOSED (clean)
┌──────────────────────┐            ┌──────────────────────┐
│ overflowX: auto      │            │ overflowY: auto      │
│ overflowY: hidden    │            │ scrollSnapType: y    │
│                      │            │                      │
│ ┌────┐┌────┐┌────┐   │            │ ┌──────────────────┐ │
│ │ F1 ││ F2 ││ F3 │→  │            │ │ Frame 1 (100dvh) │ │
│ └────┘└────┘└────┘   │            │ ├──────────────────┤ │
│         ↕ nested     │            │ │ Frame 2 (100dvh) │ │
│         scroll       │            │ ├──────────────────┤ │
└──────────────────────┘            │ │ Frame 3 (auto)   │ │
                                    │ │ ...long content   │ │
                                    │ │ ...scrolls past   │ │
                                    │ ├──────────────────┤ │
                                    │ │ Frame 4 (100dvh) │ │
                                    └──────────────────────┘
```

## What Changes

### 1. Container (`Deck.tsx` — outer div)
- `flexDirection: "row"` → `flexDirection: "column"`
- `overflowX: "auto"` / `overflowY: "hidden"` → `overflowX: "hidden"` / `overflowY: "auto"`
- `scrollSnapType: "x mandatory"` → `scrollSnapType: "y mandatory"`

### 2. DeckFrame component
- Remove the `scrollable` prop entirely
- Each frame: `min-height: 100dvh`, `width: 100%`, `scrollSnapAlign: "start"`
- Frames with short content center vertically as before
- Frames with long content (quiz results, CTA) simply grow past 100dvh — no nested scroll, no overflow hack
- Remove `minWidth: 100vw` and horizontal sizing

### 3. Wheel handler
- Remove the entire custom wheel handler. Vertical snap scroll is native browser behavior — no interception needed. The current handler exists solely to translate vertical wheel events into horizontal scroll. With vertical layout, it's unnecessary.

### 4. Keyboard navigation
- Keep arrow keys / Enter / Escape. Just change `scrollIntoView` targets — they already work vertically.
- Remove left/right arrow mapping, use up/down + Enter instead (or keep all four mapped).

### 5. Fixed bottom nav
- Already works — it's `position: fixed`. Just ensure content-heavy frames have enough `padding-bottom` to clear it. Apply a consistent `pb-[120px]` or similar to the inner content wrapper of every frame, not just scrollable ones.

### 6. Progress bar
- Change the progress calculation to use `scrollTop / scrollHeight` for smooth analog progress, or keep the discrete frame-based calculation.

## What Stays the Same

- All copy, colors, styles, interactions, animations
- All state management (quiz, hallmarks, capabilities, etc.)
- IntersectionObserver for detecting active frame
- Fixed top chrome (step label, ESC button)
- Fixed bottom chrome (Back/Continue, progress bar)
- All reveal animations

## Files Changed

- **`src/components/deck/DeckFrame.tsx`** — Remove `scrollable` prop, switch from horizontal to vertical sizing
- **`src/pages/Deck.tsx`** — Container layout flip, remove wheel handler, minor padding adjustments
- **`src/index.css`** — Update `.deck-scroll` and `.snap-section` classes if referenced

