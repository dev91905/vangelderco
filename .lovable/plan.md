

# Separate Case Studies into standalone `/work` page

## Summary
Make the diagnostic 10 slides (ending at CTA), extract the case studies carousel + timeline overlay into a standalone `/work` page, and link to it from the deck's CTA slide.

## Changes

### 1. New page: `src/pages/Work.tsx`
- Extract the case studies carousel and timeline overlay into a new standalone page
- Reuses `CaseCarousel`, `CaseTimelineOverlay`, same DB query for `deck_case_studies`, same fallback data
- Same deep-link support (`?case=<id>` opens overlay directly)
- Full-screen layout matching the deck aesthetic (same background, typography, theme tokens)
- "Selected work" heading, subtitle, carousel — identical behavior to current frame 11
- Back navigation to home or wherever they came from

### 2. Update `src/pages/Deck.tsx`
- Change `TOTAL_FRAMES` from 11 to 10
- Remove frame 11 (the case studies `DeckFrame`) and its `CaseTimelineOverlay`
- Remove `STEP_LABELS` "Cases" entry (array becomes 10 items)
- Remove the case study DB query, imports for `CaseCarousel`/`CaseTimelineOverlay`, and fallback data from this file
- On slide 10 (CTA): change "See our work →" button from `scrollToFrame(10)` to `navigate("/work")` — text stays "See our work →"
- Top-left counter now shows `XX / 10`
- Bottom nav bar condition already hides on last frame — will now hide on frame index 9 (CTA), which is correct

### 3. Update `src/App.tsx`
- Add route: `<Route path="/work" element={<Work />} />`
- Add `/work` to `hideConstellation` check (no star field on this page)

### 4. Update `ROUTE_MODE_MAP` if needed
- `/work` doesn't need a constellation mode since it's hidden

## Files

| File | Change |
|------|--------|
| `src/pages/Work.tsx` | **New** — standalone case studies page |
| `src/pages/Deck.tsx` | Remove frame 11, update TOTAL_FRAMES to 10, navigate to `/work` instead of scrolling |
| `src/App.tsx` | Add `/work` route, hide constellation on `/work` |

