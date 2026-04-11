

# Fix Swapped Stat Labels — Data Patch

## What's Wrong
The original migration mapped timeline JSONB fields backwards:
- **Currently:** label = "Reached", description = "40K"
- **Should be:** label = "40K", description = "Reached"

All 4 affected rows are deck-originated stats (have `case_study_id`, no `post_id`).

## Fix
Run a single UPDATE via the insert tool to swap `label` and `description` on the affected rows:

```sql
UPDATE public.impact_stats
SET label = description, description = label
WHERE case_study_id IS NOT NULL
  AND post_id IS NULL;
```

No code changes needed — the editor save logic already maps correctly for future entries.

