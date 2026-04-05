

# Premium Content Editor — No Auth

## Summary
Build a commercial-grade WYSIWYG block editor at `/admin` with no authentication. Dashboard to manage posts, full block editor with live preview, drag-and-drop reordering. Same brutalist aesthetic as the public site.

## Database Changes

**Migration**: Add RLS policies allowing anonymous insert/update/delete on `capability_posts` (temporary, until auth is added later):

```sql
CREATE POLICY "Temp: anyone can insert" ON public.capability_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Temp: anyone can update" ON public.capability_posts FOR UPDATE USING (true);
CREATE POLICY "Temp: anyone can delete" ON public.capability_posts FOR DELETE USING (true);
-- Also allow reading drafts for admin
CREATE POLICY "All posts visible for editing" ON public.capability_posts FOR SELECT USING (true);
```

## Routing

| Route | Page |
|-------|------|
| `/admin` | Dashboard — post list, filters, new post |
| `/admin/edit/:id` | Block editor for existing post |
| `/admin/new` | Block editor for new post |

## Pages & Components

### `src/pages/admin/AdminDashboard.tsx`
- Table of all posts (including drafts): title, type badge, capability, status toggle, date
- Filter by capability and type
- "New Post" button → type picker (Blog / Case Study) → navigates to `/admin/new?type=...&capability=...`
- Click row → `/admin/edit/:id`
- Delete with confirmation dialog
- Inline publish/unpublish toggle

### `src/pages/admin/AdminEditor.tsx`
- **Two-panel layout**: editor left, live preview right (collapses to tabs on mobile)
- **Top bar**: back to dashboard, save button (with auto-save every 30s + indicator), publish toggle
- **Settings panel** (collapsible drawer): title, slug (auto-gen from title, editable), capability dropdown, excerpt textarea, hero image URL with preview, published date picker
- **For Case Studies**: stat chips editor — add/remove/edit chips with label + description fields
- Save writes to `capability_posts` via Supabase client

### `src/components/admin/BlockEditor.tsx`
- Vertical stack of content blocks
- Each block: type pill, inline text editing, drag handle, hover toolbar (move up/down, duplicate, delete, change type)
- "+" button between blocks opens `BlockTypePicker`
- Blocks: heading (H1-H3), paragraph, image, video, embed, quote, callout
- Case Study extra blocks: expandable section, carousel, stat-grid
- Drag-and-drop via `@dnd-kit/core` + `@dnd-kit/sortable`

### `src/components/admin/BlockTypePicker.tsx`
- Popover grid of block types with icons
- Grouped: Text, Media, Editorial, Case Study (only shown for case study type)

### `src/components/admin/PostSettingsDrawer.tsx`
- Slide-out panel for post metadata
- Auto-slug from title (slugify on blur)
- Hero image URL input with thumbnail preview

### `src/components/admin/LivePreview.tsx`
- Renders the actual `BlogPostView` or `CaseStudyView` components with current editor state
- Updates in real-time as blocks are edited
- Scrollable, contained in right panel

### `src/components/admin/StatChipsEditor.tsx`
- For case studies: list of stat chip rows (label + description inputs)
- Add/remove/reorder chips

## Dependencies

- `@dnd-kit/core` + `@dnd-kit/sortable` — block drag-and-drop

## Files

| Action | File |
|--------|------|
| Create | `src/pages/admin/AdminDashboard.tsx` |
| Create | `src/pages/admin/AdminEditor.tsx` |
| Create | `src/components/admin/BlockEditor.tsx` |
| Create | `src/components/admin/BlockTypePicker.tsx` |
| Create | `src/components/admin/PostSettingsDrawer.tsx` |
| Create | `src/components/admin/LivePreview.tsx` |
| Create | `src/components/admin/StatChipsEditor.tsx` |
| Modify | `src/App.tsx` — add `/admin` routes |
| Migration | Temporary open RLS policies for CRUD |

## Design Notes

Same brutalist dark system as public site. Red accents on active/focused blocks. JetBrains Mono for metadata labels, Space Grotesk for content editing. Focused block gets a red left-border (CONTROL style). Auto-save timestamp in top bar as subtle monospaced text. Minimal chrome — the content is the interface.

