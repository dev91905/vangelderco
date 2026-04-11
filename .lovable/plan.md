

# Remove Field Notes

Field notes (`type: "field-note"`) are a post type used in the admin editor, post detail page, and post list. The hook `useFieldNotes.ts` exists but is never actually imported anywhere. The homepage "FIELD NOTES" comment is misleading — that section is actually the Impact Cloud and stays.

## Changes

### 1. Delete `src/hooks/useFieldNotes.ts`
Unused file — no imports anywhere.

### 2. `src/pages/AdminEditor.tsx`
- Remove `"field-note"` from the `TYPE_OPTIONS` array (line 21)
- Remove all `type === "field-note"` conditional branches (hero image null, content_blocks empty, password null shortcuts in save handler; the field-note-specific editor section)

### 3. `src/components/admin/EditorMetaBar.tsx`
- Remove `"field-note"` from the type selector buttons (line 200)
- Remove all `isFieldNote` conditional logic (hero image hide, excerpt hide, divider hide, featured fields hide, password hide)

### 4. `src/components/admin/PostListTable.tsx`
- Remove `"field-note"` from the type label ternary (line 59) — simplify to just "Case Study" vs "Blog"

### 5. `src/components/PostCard.tsx`
- Remove `"field-note"` from the type label ternary (line 44)

### 6. `src/pages/PostDetail.tsx`
- Remove the entire `if (post.type === "field-note")` rendering branch (lines ~64-90)

### 7. `src/pages/Admin.tsx`
- Remove `"field-note"` from the type filter tabs (line 105)

### 8. `src/pages/Index.tsx`
- Clean up the misleading `/* FIELD_NOTES */` comments (lines 56, 477). The section stays — it's actually Impact Cloud.

No database migration needed — existing field-note posts remain in the table but won't be creatable or visible in the UI.

