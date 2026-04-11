

# Restore Stat Chip Containers + True Bento Grid

## What's wrong now
The current ImpactCloud cards are just text with a left border line — no containers, no rounded corners, no visual boundaries. It doesn't read as a dashboard or a bento grid. It's just floating text.

## What to build
Restore the original StatChips visual style (rounded-xl containers with `1px solid` borders) and apply it to the existing 6-slot bento grid layout.

### Layout (unchanged from current grid logic)
- 3-column grid on desktop, 2-column on mobile
- Positions 0 and 3 are **hero cards** — span 2 columns, taller, bigger numbers
- Positions 1, 2, 4, 5 are **standard cards** — span 1 column, roughly the same height as the diagnostic box

### Visual change: bring back chip containers
Each card gets the StatChips treatment:
- `rounded-xl` border radius
- `1px solid` border at `t.ink(0.15)`, brightening to `t.ink(0.25)` on hover
- Transparent background
- `px-5 py-4` padding (slightly more generous for the hero cards: `px-6 py-5`)
- Number: bold, `color: t.ink(0.85)` — hero size `clamp(36px, 6vw, 56px)`, standard size `clamp(22px, 3vw, 30px)`
- Description: `10px` uppercase tracked, `color: t.ink(0.4)`

### Files changed
- `src/components/ImpactCloud.tsx` — replace the left-border-only card style with rounded bordered containers

Curation logic in `useAggregatedStats.ts` stays exactly as-is. No other files change.

