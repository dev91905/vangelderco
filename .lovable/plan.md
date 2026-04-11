

# Impact Section — Auto-Aggregated Stat Cloud

## The Idea

Every case study you publish already has stat chips (e.g. "$12M coordinated capital", "14M organic impressions"). Right now those stats live only on the individual case study page. The homepage "Field Notes" section is hardcoded proof points.

The move: **make the homepage Impact section a live, auto-aggregated view of every stat chip across all published case studies.** You publish a case study, add stats, and the homepage updates itself. No manual editing.

## How It Works

1. **Backend: Edge function or direct query** — The `capability_posts` table already stores `stats` as JSONB on each case study. No new tables needed. A simple query pulls all stats from all published case studies where `visible !== false`, flattens them into one array, and returns them. This can be a direct Supabase query from the client — no edge function needed unless you want server-side sorting/deduplication logic later.

2. **New hook: `useAggregatedStats`** — Queries all published case studies, extracts and flattens their `stats` arrays into a single list. Each stat carries its parent case study title/slug for linking back if desired.

3. **Homepage section redesign** — Replace the hardcoded `PROOF_POINTS` with the live aggregated stats. The section label changes from "Field Notes" to "Impact" (or stays "Field Notes" — your call).

## Design Direction: The Stat Cloud

Instead of a vertical list of proof points, the section becomes a **floating stat field** — stat chips arranged in a loose, organic grid with staggered reveal animations. Think of it like a constellation of proof:

- Each chip is a standalone unit: bold metric on top, one-line context below (same format as case study stat chips)
- Chips are arranged in a masonry-like flex wrap with varied spacing — not a rigid grid
- On scroll, chips fade/float in with staggered timing (like the current proof points but multi-directional)
- Chips link back to their source case study on click
- As you publish more case studies, the cloud grows organically
- On mobile, chips stack into a clean single-column flow

This keeps the premium, institutional feel while making the section a living dashboard of your cumulative impact.

## Implementation Steps

1. **Create `useAggregatedStats` hook** — Query `capability_posts` where `type = 'case-study'` and `is_published = true`, extract and flatten all `stats` JSONB arrays, filter out `visible: false` entries, attach source post title/slug to each stat.

2. **Build `ImpactCloud` component** — Renders the aggregated stats as floating chips with scroll-reveal animations, flex-wrap layout with organic spacing, and optional click-through to source case study.

3. **Update `Index.tsx`** — Replace the Field Notes section content: swap `PROOF_POINTS` and `ProofPoint` for the new `ImpactCloud` component fed by `useAggregatedStats`. Update section label as desired.

4. **Remove dead code** — Clean up `PROOF_POINTS` constant and `ProofPoint` component.

## What You Get

- Publish a case study with stats → homepage updates automatically
- No manual editing of the homepage ever again
- The section grows richer over time as you accumulate proof
- Each stat links back to its full case study for depth

