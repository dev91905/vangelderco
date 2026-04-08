

# Deck-Wide Design Audit & Fix

## Problems Found

Across all 12 frames of the deck:

1. **White-on-cream cards everywhere** — Selected states, expanded panels, phase cards, case study cards, domain detail panels all use `background: "hsl(0 0% 100%)"` (pure white). The rest of the site uses dark chips/cards (`t.ink(0.9)` bg with `t.cream` text). At least 10 instances.

2. **Headings not bold** — Every `heading()` call and manual heading uses `fontWeight: 400`. The rest of the site uses `font-bold` / `fontWeight: 700` on all sans headings. Affects frames 1 (already fixed), 2–12.

3. **Body text still sans-serif** — `body()` returns `fontFamily: serif` but the deck bypasses it: all body/description text uses `fontFamily: f.sans`. Body copy should use `t.serif` / `t.body()` per the Anthropic pattern (sans headings, serif body).

4. **StatChip in deck uses white-on-cream** — The site's `StatChips.tsx` component uses dark bg (`t.ink(0.9)`) with cream text. The deck's inline `StatChip` uses `background: f.ink(0.03)` — light on light.

5. **"+" expand icon instead of chevron** — Hallmarks section uses a `+` character. Rest of site uses `ChevronDown` from lucide-react.

6. **Inconsistent label separator** — Rest of site uses `//`. Deck doesn't use it anywhere labels are paired.

## Plan

### Single file edit: `src/pages/Deck.tsx`

**A. Kill all white backgrounds → dark cards**
Every `background: "hsl(0 0% 100%)"` and `background: isSelected/isExpanded ? "hsl(0 0% 100%)" : ...` becomes:
- Selected/active state: `background: f.ink(0.9)` with text color flipped to `f.cream` / light values
- Unselected state: `background: "transparent"` (stays the same)
- Phase cards, domain detail panel, experienced panel, case study cards with content: all get dark bg treatment
- Box shadows on white cards removed (not needed on dark cards)

**B. All headings → fontWeight: 700**
Every `fontWeight: 400` on heading-role text (h1, h2, frame titles) → `fontWeight: 700`.

**C. Body/description text → serif**
All descriptive/body paragraphs switch from `fontFamily: f.sans` to using `body()` or `fontFamily: f.serif`. Headings/labels/UI stay sans.

**D. Inline StatChip → dark style**
Match the site's `StatChips.tsx`: `background: f.ink(0.9)`, value text `color: f.cream`, label text `color: "hsl(40 30% 80%)"`.

**E. Hallmark expand icon → chevron**
Import `ChevronDown` from lucide-react, replace `+` with it, matching `ExpandableSection.tsx` pattern.

**F. Text color adjustments for dark cards**
When cards go dark, all text inside them flips: titles → `f.cream`, descriptions → `hsl(40 30% 80%)` or similar light muted tone. Borders on dark cards become `f.ink(0.8)` or removed.

## Frames affected
All 12 frames get the heading weight fix and body serif fix. Frames 2, 4, 5, 8, 11 get the dark card treatment. Frame 11 case study grid gets dark cards for items with content.

## Files modified
- `src/pages/Deck.tsx` — all changes above (single file, ~40 individual edits)

