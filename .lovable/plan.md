

# Premium CMS & Content Editor

A Notion/Squarespace-inspired block editor at `/admin` — no auth for now. Full WYSIWYG editing for Blog Posts and Case Studies with drag-to-reorder blocks, inline editing, slash commands, and image uploads via Lovable Cloud storage.

## Architecture

```text
/admin              → Post list (all posts, filterable by capability/type)
/admin/new          → New post editor
/admin/edit/:id     → Edit existing post
```

## Database Changes

**Storage bucket**: Create a `post-images` bucket (public, for hero images and inline content images).

No schema changes needed — the existing `capability_posts` table already has all required columns (`slug`, `hero_image_url`, `content_blocks`, `stats`, etc.).

## Editor Design

### Post List (`/admin`)
- Dark theme matching the site aesthetic (near-black bg, red accents)
- Table/list of all posts with title, type badge, capability, published status, date
- Filter chips: All / Blog Post / Case Study, and by capability
- "+ New Post" button top-right
- Click any row → edit that post
- Quick-action: toggle publish/unpublish inline

### Post Editor (`/admin/new` and `/admin/edit/:id`)
Split into a top metadata bar and the main block canvas:

**Metadata Bar** (top, collapsible):
- Post type toggle: Blog Post ↔ Case Study (switches available block types and stat chips section)
- Capability selector: Cultural Strategy / Cross-Sector / Deep Organizing
- Title field: large, inline-editable, Notion-style (just type, no label)
- Slug: auto-generated from title, manually editable
- Hero image: drag-and-drop upload zone or URL input, with preview
- Publish toggle + published date picker
- Save / Delete buttons

**Block Canvas** (main area, scrollable):
- Each content block renders as an editable card
- Hover a block → shows drag handle (left) and delete button (right)
- Click between blocks → shows a "+" insertion point
- Slash command (`/`) or "+" button opens block type picker:
  - Heading (H1, H2, H3)
  - Paragraph
  - Image (upload or URL)
  - Video (YouTube/Vimeo URL)
  - Embed (raw HTML/iframe)
  - Quote (with attribution)
  - Callout
  - **Case Study only**: Expandable Section, Carousel, Stat Grid

**Stat Chips Editor** (Case Study only, below metadata):
- Add/remove/edit stat chips (label + description)
- Drag to reorder
- Toggle individual chip visibility

**Live Preview**: A "Preview" button opens the post in a new tab at `/post/:slug` (for published) or shows a modal preview.

### Block Editing UX
- **Paragraph/Heading**: Click to edit text inline. Heading level selector dropdown.
- **Image**: Click to upload or paste URL. Shows preview. Caption field below.
- **Quote**: Two fields — quote text and attribution.
- **Callout**: Single text field with red-bordered preview.
- **Expandable Section**: Title field + nested block editor for inner content.
- **Carousel**: Add/remove slides with image upload + caption per slide.
- **Stat Grid**: Inline mini stat chip editor.
- **Drag & Drop**: Blocks reorderable via drag handles using `@dnd-kit/core`.

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Admin.tsx` | Post list dashboard |
| `src/pages/AdminEditor.tsx` | New/edit post editor |
| `src/components/admin/PostListTable.tsx` | Filterable post list |
| `src/components/admin/EditorMetaBar.tsx` | Title, slug, type, capability, hero image, publish controls |
| `src/components/admin/BlockCanvas.tsx` | Block editor canvas with insertion points and drag-drop |
| `src/components/admin/BlockEditor.tsx` | Individual block editor (switches on block type) |
| `src/components/admin/BlockTypePicker.tsx` | Slash command / "+" menu for adding blocks |
| `src/components/admin/StatChipsEditor.tsx` | Editable stat chips for case studies |
| `src/components/admin/ImageUploader.tsx` | Drag-and-drop image upload component (Lovable Cloud storage) |
| `src/hooks/usePostMutations.ts` | Create, update, delete post hooks |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/admin`, `/admin/new`, `/admin/edit/:id` routes |

## Dependencies

- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop block reordering

## Visual Design

Matches the existing brutalist aesthetic — dark background, red accent borders, JetBrains Mono for labels, Space Grotesk for content. The editor itself uses slightly elevated surface colors (`hsl(0 0% 6%)`) for block cards against the near-black canvas. Block insertion points pulse with a subtle red glow. The metadata bar uses the same monospaced label style as the front-end. Buttons are minimal — outlined with red accent on hover.

