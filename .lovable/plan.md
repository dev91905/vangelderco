

# Fix Editor–Published Mismatch + Field Note Label Bug

## Two problems

### 1. Field note type label missing in PostListTable
`PostListTable.tsx` line 59: the type badge only has two branches — "Case Study" and "Blog". When a post is type `field-note`, it falls through to "Blog". That's why changing a post to field-note doesn't update the label.

**Fix**: Add a third condition for `field-note` → display "Field Note".

### 2. Editor title + dek not constrained to published width
The published view (`BlogPostView`, `CaseStudyView`) renders title, excerpt, and content inside `max-w-[680px] mx-auto`. But in the editor, `EditorMetaBar` renders at full width (`px-4 md:px-8` with no max-width constraint), while the `BlockCanvas` below it *is* constrained to `max-w-[680px]`. Result: the headline and dek span wider than the content blocks — doesn't match the published layout at all.

**Fix**: Wrap the EditorMetaBar's title/dek section in `max-w-[680px] mx-auto` so it aligns with the block canvas below and matches the published post layout.

## Files to change

| File | Change |
|------|--------|
| `src/components/admin/PostListTable.tsx` | Line 59: add `field-note` → "Field Note" to the type badge conditional |
| `src/components/admin/EditorMetaBar.tsx` | Line 82: add `max-w-[680px] mx-auto` to the title/dek container div |

