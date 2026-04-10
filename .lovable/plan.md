

## Problem

Frame 2 (pain points / "Where are your communications right now?") and Frame 5 (domains / "Where do your communications need the most help?") are presenting overlapping content. Frame 5's domain cards also lack clear selection affordance — users don't know they can or should select anything, and there's no visual checkbox or indicator.

## Plan

### 1. Remove Frame 5 (Three Service Domains) entirely

Delete the entire `FRAME 5: Three Service Domains` DeckFrame block. This eliminates the duplicate content.

### 2. Add domain selection to Frame 2

Merge the three DOMAINS (Cultural Strategy, Cross-Sector Intelligence, Deep Organizing) into Frame 2 as a second section below the existing pain point cards. Layout:

- Keep the existing pain point cards as-is (they work well as selectable cards)
- Add a subheading below them: something like **"Which areas are most relevant?"** with instruction text "Select one or more."
- Render the three domain cards in a 3-column grid, each with:
  - A visible **checkbox indicator** (filled circle or checkmark) in the top-right corner so it's obvious they're selectable
  - The domain title + tagline
  - Selected state uses the same accent border/glow treatment as pain point cards
- The expand-on-click detail panel is removed — keep it simple. The detail content (unlocks, missed, example) can surface later in the flow or be dropped.

### 3. Update the "Something else" card position

Move it to after the domain cards, or keep it at the end of the pain points row. Either way, it stays as the freeform option.

### 4. Update navigation gate logic

- Frame 2 gate: require `selectedPains.length > 0 || customSaved` (unchanged) — domain selection is optional on this slide
- Remove the old Frame 5 gate (`selectedDomains.length > 0`)
- Renumber all subsequent frame indices (frames 6→5, 7→6, etc.)
- Update `TOTAL_FRAMES` from 12 to 11

### 5. Fix all `scrollToFrame` references

Every `NavRow` onBack/onNext call after the removed frame needs index adjustment.

### 6. Update intake summary and scoring

Both `selectedDomains` and `selectedPains` continue to exist as state — just collected on the same slide now. No changes needed to the data submission or scoring logic, only the frame numbering.

### Files changed
- `src/pages/Deck.tsx` — all changes in this single file

