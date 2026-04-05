

# Restore Missing Excerpt for "The Institutional Blind Spot in Cultural Engagement"

## Problem
The PostCard component correctly renders excerpts via `{post.excerpt && ...}`. The excerpt for this post is `NULL` in the database — either the earlier restoration migration didn't match the title, or a subsequent auto-save in the editor cleared it (the editor doesn't expose an excerpt field, so any save would preserve `NULL`).

## Fix
Single SQL update to restore the excerpt:

```sql
UPDATE capability_posts
SET excerpt = 'Why most institutional cultural strategies fail to move opinion — and what a generation of political infrastructure builders got right.'
WHERE title = 'The Institutional Blind Spot in Cultural Engagement';
```

One migration, no code changes.

## Bonus: Prevent Future Loss
The admin editor currently has no excerpt field — so every save keeps excerpt as whatever it already is (which is correct). But if a post is created via the editor, it'll never get an excerpt. Consider adding an excerpt textarea to `EditorMetaBar.tsx` in a future pass.

