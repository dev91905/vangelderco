
Problem:
The spam is coming from the admin editor autosave loop, not just a one-off bad insert.

What I found:
- The database table is `capability_posts`.
- Its `type` column has a database CHECK constraint that only allows:
  - `case-study`
  - `blog-post`
- But the admin UI also allows and actively uses:
  - `field-note`
- Files already using `field-note`:
  - `src/components/admin/EditorMetaBar.tsx`
  - `src/pages/AdminEditor.tsx`
  - `src/hooks/useFieldNotes.ts`
  - `src/pages/PostDetail.tsx`
  - `src/pages/Admin.tsx`

Why you get a million notifications:
- When a `field-note` is being created or edited, save fails at the database layer because `type = 'field-note'` violates the existing check constraint.
- In `src/pages/AdminEditor.tsx`, failed saves do not clear `dirty`.
- The autosave effect retries every 3 seconds while `dirty` stays true.
- Each retry triggers another toast from `usePostMutations.ts`.
- So the app keeps hammering the same invalid save and keeps yelling at you.

Exact fix:
1. Update the database schema so `capability_posts.type` allows `field-note`.
2. Keep the existing editor behavior, because the UI is already built around `field-note`.
3. Stop the toast storm even when a save fails:
   - gate autosave while a save is already pending
   - prevent repeated retries for the exact same invalid payload until the user changes something again
   - collapse raw database errors into one human message instead of dumping Postgres text repeatedly
4. Clean up the misleading error text:
   - message currently references `capability_post`
   - app uses `capability_posts`
   - I’ll normalize the displayed error so users see something like:
     - “This post type isn’t allowed by the database yet.”
     - or a generic single failure message if another save issue happens

Implementation plan:
1. Verify the current migrations and add a new schema migration that drops/recreates the `type` check constraint to include `field-note`.
2. Update the save flow in `src/pages/AdminEditor.tsx` so autosave does not endlessly retry the same failing state.
3. Update `src/hooks/usePostMutations.ts` to dedupe or soften repeated error toasts.
4. Do a quick pass anywhere else that assumes only two post types, to make sure labels and filtering stay consistent.
5. Test these flows:
   - create new field note
   - edit existing field note
   - trigger one failed save and confirm it does not spam notifications

Technical details:
- Current root cause is in `supabase/migrations/20260405031117_8db1479a-95a3-40c2-8560-c9c8f27fe3e0.sql`
```text
type TEXT NOT NULL CHECK (type IN ('case-study', 'blog-post'))
```

Files to touch:
- `supabase/migrations/...new migration...`
- `src/pages/AdminEditor.tsx`
- `src/hooks/usePostMutations.ts`
- possibly `src/pages/Admin.tsx` or related admin filters if I find any hardcoded 2-type assumptions during implementation

Result after fix:
- field notes save normally
- no endless retry loop
- no notification flood
- the editor fails gracefully if some other save issue happens
