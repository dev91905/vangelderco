

# Fix: Impact Stats → Deep-Link to Case Study Timeline

## Problem

The "40K" stat card links to `/diagnostic` because the Clean Energy Workforce case study has `link_url = null` in the database. The current fallback is just `/diagnostic`, which lands on slide 1 — no connection to the actual case study.

## Fix

**1. Add query-param deep-linking to Deck.tsx**

When `/diagnostic?case=<case-study-id>` is loaded, auto-open the matching case study timeline overlay after the case studies data loads.

- Read `searchParams.get("case")` from the URL
- When `caseStudies` data is available and contains a matching ID, call `setSelectedCase(matchedStudy)` via a `useEffect`

**2. Update ImpactCloud.tsx link builder**

For deck case studies, link to `/diagnostic?case=<sourceId>` instead of falling back to `/diagnostic`.

This requires passing `sourceId` through `AggregatedStat` to the component (currently stripped before return).

**3. Update useAggregatedStats.ts**

Keep `sourceId` in the returned `AggregatedStat` interface instead of stripping it in the final `.map()`.

## Files changed

| File | Change |
|------|--------|
| `src/hooks/useAggregatedStats.ts` | Add `sourceId` to `AggregatedStat` interface; stop stripping it |
| `src/components/ImpactCloud.tsx` | For deck stats, link to `/diagnostic?case=${stat.sourceId}` |
| `src/pages/Deck.tsx` | Read `?case=` query param; auto-open matching timeline overlay on load |

