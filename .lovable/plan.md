

# Restore Missing Excerpt for "Reframing Climate Through Cultural Infrastructure"

## Problem
The excerpt for this post is `NULL` in the database. All other posts have their excerpts intact. The PostCard component correctly renders excerpts when present.

## Fix
Single SQL migration to restore the excerpt:

```sql
UPDATE capability_posts
SET excerpt = 'How a network of cultural producers shifted public narrative on climate from moral crisis to economic opportunity.'
WHERE title = 'Reframing Climate Through Cultural Infrastructure';
```

One migration, no code changes.

