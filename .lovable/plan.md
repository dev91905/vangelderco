

# Stabilize Content Manager Sort Logic

## Current Behavior

Posts sort by `created_at DESC` — newest created first. Problem: `created_at` is set once at row insertion and never changes. If two posts are created in the same second (or via a batch insert like the seed data), their order is arbitrary and can shift between page loads since Postgres doesn't guarantee stable ordering on ties.

Additionally, `created_at` doesn't reflect editorial intent — a draft created months ago that gets published today still sorts by its original creation date, buried below newer drafts.

## Proposed Sort Logic

**Primary: `published_at DESC NULLS LAST`, Secondary: `created_at DESC`**

- Published posts sort by publish date (most recently published first)
- Unpublished drafts (where `published_at` is null) fall to the bottom — they're work-in-progress, not priority items in the list
- Within each group, ties break on `created_at` which is unique enough to be stable
- This matches editorial mental models: "what did I publish recently?" is the primary question when scanning the list

## Changes

### `src/components/admin/PostListTable.tsx`
- Replace `.order("created_at", { ascending: false })` with two chained `.order()` calls:
  ```ts
  .order("published_at", { ascending: false, nullsFirst: false })
  .order("created_at", { ascending: false })
  ```

One line change, one file.

