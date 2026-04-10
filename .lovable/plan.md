

# Add "Field Note" as a Third Post Type

## What It Is

Field Notes are short, structured dispatches — more like alerts than articles. Three fixed fields:

1. **Domain** — one of the three capabilities (Cultural Strategy, Cross-Sector Intelligence, Deep Organizing)
2. **Brief** — one to two sentences: what happened, what was accomplished
3. **Impact** — a standardized metrics line (e.g. "$12M mobilized across 3 foundations")

No free-form content blocks. No hero images. Just the structured data.

## What Changes

### 1. Add "field-note" as a Post Type in the Editor

**EditorMetaBar.tsx**: Add `"field-note"` to the type toggle (currently `["blog-post", "case-study"]` → `["blog-post", "case-study", "field-note"]`).

### 2. Adapt the Editor for Field Notes

**AdminEditor.tsx**: When `type === "field-note"`, hide the BlockCanvas (no free-form content blocks needed) and hide the StatChipsEditor. Instead, show a compact structured form with:
- **Domain**: Already handled by the `capability` selector in the settings drawer
- **Brief**: Already the `excerpt` field — just relabel it as "Alert / Brief" when type is field-note
- **Impact**: Use the existing `featured_stat` field — relabel it as "Impact Metric" and surface it directly in the editor (not buried in the settings drawer)

This means no new database columns are needed. The existing fields map cleanly:
- `capability` → domain
- `excerpt` → brief
- `featured_stat` → impact metric
- `type` = `"field-note"`

### 3. Update the Homepage Field Notes Section

**Index.tsx**: The `CaseFragment` component and the Field Notes query already render `sector_label`, `excerpt` (brief), and `featured_stat` (result). The `useFeaturedPosts` hook already fetches featured published posts. Field Notes will appear here automatically if marked as featured.

Optionally, create a dedicated `useFieldNotes` hook that queries `type = "field-note"` posts instead of relying on the `is_featured` flag — so Field Notes always appear in this section regardless of the featured toggle.

### 4. Update PostCard and Listing Pages

**PostCard.tsx**: Add `"field-note"` label rendering (currently shows "Case Study" or "Blog Post").

### 5. Field Note Detail View

Since field notes are short alerts with no content blocks, the detail page (`PostDetail.tsx`) should render a minimal view — just the brief and impact metric, no block canvas. Check and handle the `type === "field-note"` case.

## Technical Summary

- **No migration needed** — reuses existing columns (`type`, `capability`, `excerpt`, `featured_stat`)
- **EditorMetaBar.tsx** — add "Field Note" to type picker
- **AdminEditor.tsx** — conditional UI: hide BlockCanvas for field-notes, surface impact field inline
- **Index.tsx** — optionally switch Field Notes section to query by type instead of `is_featured`
- **PostCard.tsx** — add "Field Note" label
- **PostDetail.tsx** — minimal render for field-note type
- **useFeaturedPosts.ts** — potentially rename/refactor to `useFieldNotes` querying `type = "field-note"`

