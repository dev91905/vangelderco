

# Fix "Field Notes" Label + Redesign Impact Display

## Changes

### 1. Rename section label
Line 485 of `Index.tsx`: change `"Field Notes"` → `"Impact"`.

### 2. Redesign ImpactCloud — compact horizontal scroll with dramatic numbers

The current flex-wrap layout sprawls vertically. Replace with a single horizontally-scrollable row of tighter, more dramatic stat cards:

- **Layout**: `overflow-x: auto` horizontal scroll, no wrapping. One row, edge-to-edge. Fade masks on left/right edges to signal scrollability.
- **Stat card redesign**:
  - Number (`label`) rendered at `clamp(32px, 5vw, 48px)`, bold, full foreground — the hero element
  - Description rendered at `10px`, uppercase tracking, muted — stays small
  - Source title hidden by default, no hover-reveal (cleaner)
  - Cards get a subtle left-edge accent line (oxblood, 2px) instead of a full border — lighter, more editorial
  - Minimum card width ~140px, no max — they size to content
- **Interaction**: Cards are still links. On hover: accent line brightens, slight lift. No background fill change.
- **Scroll behavior**: CSS `scroll-snap-type: x mandatory` with `scroll-snap-align: start` on each card. Smooth drag on mobile.
- **Result**: The entire section fits in ~120px of vertical space instead of 300+. Feels like a Bloomberg terminal ticker — dense, authoritative, scannable.

### Files changed
- `src/pages/Index.tsx` — rename label
- `src/components/ImpactCloud.tsx` — full redesign of layout and StatChip

