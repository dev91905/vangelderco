

# Field Note Editor Overhaul

## Problem
- Sector Label and Featured Stat are buried in Post Settings sidebar — they only apply to Field Notes
- The "DEK" label changes to "ALERT / BRIEF" for field notes, which is confusing
- When you select Field Note type, the block editor disappears but there's a weird orphan "Impact Metric" field
- No way to link a Field Note to another post or external URL
- The editor doesn't feel like a purpose-built form for Field Notes

## What changes

### 1. Field Note gets its own dedicated inline form
When `type === "field-note"`, instead of showing the generic meta bar + block canvas, the editor shows a clean 4-field form right in the main content area:

1. **Title** (already exists at top)
2. **Sector Label** — e.g. "ENERGY x LABOR" (moved from sidebar)  
3. **Excerpt / Brief** — one to two sentences (moved inline, clearer label)
4. **Impact Stat** — e.g. "$12M mobilized" (moved from sidebar)
5. **Link (optional)** — URL field. Can be an internal post slug (`/post/clean-energy`) or external URL (`https://nytimes.com/...`). If set, the Field Note on the homepage links there instead of to `/post/{slug}`

### 2. Remove from Post Settings sidebar
When type is `field-note`:
- Remove Sector Label field from sidebar
- Remove Featured Stat field from sidebar  
- Remove Hero Image (not used for field notes)
- Remove Password Protection (not used for field notes)
- Keep: Type selector, Capability selector, Status toggle, Homepage Feature toggle

### 3. Database
- Add `link_url` column (text, nullable) to `capability_posts` for the optional link field

### 4. Homepage Field Notes rendering
- Update `CaseFragment` to use `link_url` when present — if it starts with `http`, render as `<a>` with external link; if internal, use `<Link>`
- Update `useFieldNotes` to also select `link_url`

## Files to change
- `supabase/migrations/...` — add `link_url` column
- `src/pages/AdminEditor.tsx` — replace the field-note section with a full inline form containing all 4 fields
- `src/components/admin/EditorMetaBar.tsx` — hide sector_label, featured_stat, hero image, password when type is field-note
- `src/hooks/useFieldNotes.ts` — add `link_url` to select + type
- `src/pages/Index.tsx` — update CaseFragment to support `link_url`

