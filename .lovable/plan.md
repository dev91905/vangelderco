

## Fix case study deep-link flow and scroll restoration

### Two problems

1. **Clicking a stat opens /work carousel first, then auto-opens the case** — user sees the carousel flash before the overlay appears. When the link is a direct deep-link to a specific case, the carousel page should never be visible. Skip it entirely.

2. **Closing a deep-linked case goes to "/" but scroll resets to top** — the homepage loses scroll position because `navigate("/")` triggers a fresh route mount.

### Solution

**Problem 1: Skip the /work page entirely for deep-linked cases**

Instead of navigating to `/work?case=<id>`, open the case study timeline as a modal overlay directly on the homepage. This means:

- In `ImpactCloud.tsx`: change the `href` for deck stats from `/work?case=${stat.sourceId}` to just `#`, and instead use an `onClick` handler that sets state (or dispatches an event/uses a lightweight context) to open the timeline overlay on the current page.
- Add `CaseTimelineOverlay` to `Index.tsx` (the homepage), controlled by a state variable for which case to show.
- When the overlay closes, the user is still on the homepage at their exact scroll position. No navigation happened.

**Problem 2: Scroll preservation is automatic**

Since we're no longer navigating away from the homepage, scroll position is preserved by default. No `ScrollToTop` or scroll restoration logic needed.

### Implementation details

- Create a small context or just use URL search params on the homepage itself (`/?case=<id>`) to support direct links/sharing.
- `Index.tsx` reads `?case=` param on mount, fetches the case study data, and opens the overlay if found.
- The overlay's `onClose` just clears the selected case and removes the search param. User stays on homepage, scroll untouched.
- Keep `/work` page as-is for direct browsing of the carousel — it still works independently.
- The case study data fetch can be shared via a small hook or fetched inline.

### Files to change

- `src/components/ImpactCloud.tsx` — change deck stat links from `/work?case=` to `onClick` that sets homepage overlay state
- `src/pages/Index.tsx` — add `CaseTimelineOverlay`, state for selected case, read `?case=` param on mount
- No changes to `Work.tsx` — it continues to work as a standalone page

