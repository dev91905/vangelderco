

# Fix: Fill All 6 Bento Slots

## Root cause
The curation logic enforces "one stat per source." There are only 4 sources (3 articles + 1 case study), so it returns 4 stats — not the 6 the grid expects.

## Fix in `src/hooks/useAggregatedStats.ts`

Change the algorithm to:
1. **Round 1**: Pick the best stat (lowest `sort_order`) from each source — gives 4 stats
2. **Round 2**: If under 6, pick the next-best stat from each source (round-robin by recency), until we hit 6 or run out
3. Never duplicate a stat

This guarantees the grid fills to 6 whenever the data supports it (we have 16 rows — plenty).

### Concrete logic
```
// After building bestPerSource map (round 1):
const used = new Set(curated.map(s => s.label + s.sourceId));
const remaining = all
  .filter(s => !used.has(s.label + s.sourceId))
  .sort((a, b) => a.sortOrder - b.sortOrder);

// Round 2: fill remaining slots, round-robin across sources
while (curated.length < MAX_STATS && remaining.length > 0) {
  const sourcesUsedCount = new Map<string, number>();
  for (const s of curated) {
    sourcesUsedCount.set(s.sourceId, (sourcesUsedCount.get(s.sourceId) || 0) + 1);
  }
  // Pick from the source with fewest picks so far
  remaining.sort((a, b) => {
    const aCount = sourcesUsedCount.get(a.sourceId) || 0;
    const bCount = sourcesUsedCount.get(b.sourceId) || 0;
    return aCount - bCount || a.sortOrder - b.sortOrder;
  });
  curated.push(remaining.shift()!);
}
```

No other files change. The ImpactCloud grid already handles 6 items with the hero/standard layout.

