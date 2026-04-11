

# Normalized Stats System

## Problem
Stats live as JSONB blobs in two places (`capability_posts.stats` and `deck_case_studies.phases[].stats[]`). No shared identity — same stat entered in both places creates duplicates. No way to link or sync them.

## Solution: `impact_stats` Table

One table, one source of truth. Every stat chip lives here. Both articles and timelines reference the same rows.

```text
impact_stats
├── id (uuid, PK)
├── label ("$12M", "40K", "47")
├── description ("Coordinated capital", "People reached")
├── post_id (FK → capability_posts, nullable)
├── case_study_id (FK → deck_case_studies, nullable)
├── phase_title (text, nullable — e.g. "Results", "Pilots")
├── visible (boolean, default true)
├── sort_order (integer, default 0)
└── created_at (timestamptz)
```

**Key relationships:**
- A stat with only `post_id` → lives on the article
- A stat with only `case_study_id` + `phase_title` → lives on a specific timeline phase
- A stat with BOTH `post_id` AND `case_study_id` → shared between article and timeline (single row, no duplication)

## How Linking Works

When a `deck_case_study` has a `link_url` that matches a `capability_post.slug`, they're "linked." In the editor:
- Creating a stat on the article side sets `post_id`
- Creating a stat on the timeline side sets `case_study_id` + `phase_title`
- You can "share" a stat to the linked entity — this adds the missing FK to the same row
- The Impact Cloud aggregator just does `SELECT * FROM impact_stats WHERE visible = true` — one query, no dedup needed

## Implementation Steps

### 1. Create `impact_stats` table + migration
- Create table with FKs, RLS policies (public read for visible, authenticated full CRUD)
- Write a one-time data migration that extracts existing JSONB stats from both tables into the new `impact_stats` rows, setting the correct FKs

### 2. Update `useAggregatedStats` hook
- Replace the dual-query JSONB extraction with a single query: `SELECT * FROM impact_stats WHERE visible = true`
- Join to `capability_posts` and `deck_case_studies` for source titles/slugs

### 3. Update article stat editor (`StatChipsEditor`)
- Read/write from `impact_stats` table instead of the JSONB column
- When the article is linked to a timeline case study, show which stats are shared vs article-only
- Allow "pushing" a stat to the linked timeline (adds `case_study_id` + `phase_title`)

### 4. Update timeline stat editor (`CaseStudyEditor` phase stats)
- Read/write from `impact_stats` table instead of phases JSONB
- When linked to an article, show shared stats and allow pulling article stats into a phase
- New stats created here get `case_study_id` + `phase_title` set

### 5. Update display components
- `StatChips` component on case study pages reads from `impact_stats` by `post_id`
- Timeline overlay reads phase stats from `impact_stats` by `case_study_id` + `phase_title`
- `ImpactCloud` on homepage reads all visible stats (already simplified)

### 6. Clean up
- Remove `stats` JSONB reads from `capability_posts` queries
- Remove `phases[].stats` parsing from timeline rendering (phases still store title/date/description, just not stats)

## What This Gets You

- **One stat, one row.** No duplication ever.
- **Shared stats between articles and timelines.** Link once, shows in both places.
- **Phase-level assignment.** A stat knows which timeline phase it belongs to.
- **Simpler aggregation.** The homepage Impact Cloud is one SELECT query.
- **No manual sync.** Edit a stat anywhere, it updates everywhere it appears.

## Technical Details

- RLS: anon can SELECT where `visible = true`, authenticated gets full CRUD
- The JSONB `stats` columns on both tables become legacy — we migrate data out, then the columns can be ignored (no need to drop them immediately)
- Realtime can be enabled on `impact_stats` later if live updates matter

