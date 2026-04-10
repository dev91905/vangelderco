

## Unify Field Notes with the Content Manager

### What this does
1. Adds a `is_featured` boolean and a `sector_label` text column to `capability_posts` so you can flag posts for homepage display and give them sector-style headings like "ENERGY × LABOR"
2. The homepage Field Notes section pulls from the database instead of the hardcoded `FIELD_NOTES` array — same visual treatment (sector headings, italic serif summary, red stats), but now each fragment links to a real post
3. Creates 4 actual posts in the database matching the current hardcoded field notes, with full content blocks so they're real readable case studies / blog posts

### Database changes
- **Migration**: Add two columns to `capability_posts`:
  - `is_featured` boolean, default `false`
  - `sector_label` text, nullable (e.g. "ENERGY × LABOR") — displayed as the heading in field notes
- The `excerpt` field already exists and maps to the italic brief
- The `stats` JSONB field already exists and can hold the red impact line (or we add a simpler `featured_stat` text column for the one-liner)
- Actually, a `featured_stat` text column is cleaner than parsing JSONB for a single string. Add that too.

### Homepage changes (`src/pages/Index.tsx`)
- Replace `FIELD_NOTES` constant with a query: `useQuery` fetching `capability_posts` where `is_featured = true`, ordered by `published_at desc`, limit 4
- `CaseFragment` component gets a `slug` prop and wraps in a `<Link to={/post/${slug}}>` so clicking navigates to the full post
- Map: `sector_label` → sector heading, `excerpt` → italic brief, `featured_stat` → red impact line
- Loading/empty states match existing patterns

### Seed data — 4 real posts
Create 4 published posts via database insert with full `content_blocks` arrays:

1. **"Energy × Labor"** — Case study on energy transition + building trades alignment. Capability: `cross-sector`. Slug: `energy-labor-alignment`.
2. **"Culture × Philanthropy"** — Case study on entertainment uptake network for climate narrative. Capability: `cultural-strategy`. Slug: `culture-philanthropy-uptake`.
3. **"Intelligence"** — Blog post on adversarial network mapping. Capability: `cross-sector`. Slug: `adversarial-network-mapping`.
4. **"Deep Organizing"** — Case study on organic community leader identification. Capability: `deep-organizing`. Slug: `community-leader-networks`.

Each gets `is_featured: true`, `is_published: true`, the sector label, excerpt (current brief text), featured stat (current result text), and 4-6 content blocks giving them real substance.

### Admin support
- Add an `is_featured` toggle to the post editor (`BlockEditor.tsx` / `EditorMetaBar.tsx`) so you can feature/unfeature posts
- Add `sector_label` and `featured_stat` fields to the editor meta bar (only shown when featured is toggled on)

### Files changed
- **Migration**: Add `is_featured`, `sector_label`, `featured_stat` columns
- **Database insert**: Seed 4 posts with content
- **`src/pages/Index.tsx`**: Replace hardcoded array with DB query, make fragments linkable
- **`src/hooks/useFeaturedPosts.ts`**: New hook for featured posts query
- **`src/components/admin/EditorMetaBar.tsx`**: Add featured toggle + sector label + stat fields
- **`src/integrations/supabase/types.ts`**: Auto-updates after migration

