

# Fix: Return to homepage after closing deep-linked case study

## Problem

User clicks a stat chip on the homepage → navigates to `/diagnostic?case=<id>` → case study timeline opens → user closes it → they're now stranded on the diagnostic page instead of back on the homepage.

## Fix

When the overlay was opened via a deep-link (the `?case=` param), closing it should navigate back to the homepage instead of just closing the overlay.

### Implementation

In `src/pages/Deck.tsx`:

1. Add a `deepLinkedCase` ref (boolean) that gets set to `true` when the `?case=` useEffect opens the overlay
2. In the `onClose` handler passed to `CaseTimelineOverlay`, check this ref — if true, call `navigate("/")` instead of just `setSelectedCase(null)`
3. Reset the ref after navigating

This way, closing the overlay after a normal deck interaction still works as before (stays on diagnostic), but deep-linked opens return you home.

| File | Change |
|------|--------|
| `src/pages/Deck.tsx` | Add `deepLinkedCase` ref; update close handler to navigate home when deep-linked |

