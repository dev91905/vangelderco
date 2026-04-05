

# Blog Post & Case Study Full-Page Experiences

## Summary
Transform posts from inline-expandable cards into full-page storytelling experiences. Blog posts get clean editorial layouts with hero images and embedded media. Case studies get interactive data-driven layouts with stat chips, expandable sections, and carousels. Both use a structured JSON content block system.

## Database Changes

**Migration**: Add columns to `capability_posts`:
- `slug` (text, unique) — URL-friendly identifier
- `hero_image_url` (text, nullable) — hero/cover image
- `content_blocks` (jsonb, nullable) — structured rich content array
- `stats` (jsonb, nullable) — case study stat chips (e.g. `[{"label": "$200M", "description": "Capital Deployed", "visible": true}]`)

**Data**: Update all 6 existing posts with slugs, content blocks, and stats (for case studies). Content blocks follow a typed schema:

```text
Block types:
  heading    → { type, level, text }
  paragraph  → { type, text }
  image      → { type, src, alt, caption }
  video      → { type, src, provider }
  embed      → { type, html }
  quote      → { type, text, attribution }
  callout    → { type, text }
  expandable → { type, title, blocks[] }      ← case study
  carousel   → { type, slides[] }             ← case study
  stat-grid  → { type, stats[] }              ← case study inline
```

## Routing

Add to `App.tsx`:
- `/post/:slug` → `PostDetail` page (dispatches to blog or case study renderer based on `type`)

## Components

### `src/pages/PostDetail.tsx`
- Fetches post by slug from `capability_posts`
- Renders `BlogPostView` or `CaseStudyView` based on `post.type`

### `src/components/blog/BlogPostView.tsx`
- Optional hero image (full-width, 60vh) or styled color-fill header matching site aesthetic
- Title, date, capability tag
- Content block renderer: paragraphs in Space Grotesk at comfortable reading width (~680px), images full-bleed with captions, embedded video/iframes responsive, pull quotes with red left border
- Back link to capability page

### `src/components/casestudy/CaseStudyView.tsx`
- Hero section with title and stat chip bar (toggleable on/off with a master switch)
- Stat chips: monospaced, red-accented, pill-shaped — show key metrics
- Content block renderer (same base as blog, plus):
  - **Expandable sections**: Collapsible regions with heading + chevron, CONTROL-style red bar on open state
  - **Carousels**: Horizontal scroll with dot indicators, images or content cards
  - **Stat grids**: Inline metric displays within the article body
- Back link to capability page

### `src/components/content/ContentBlockRenderer.tsx`
- Shared renderer that maps `content_blocks` JSON array to React components
- Handles: heading, paragraph, image, video, embed, quote, callout
- Case study blocks (expandable, carousel, stat-grid) handled by CaseStudyView

### `src/components/PostCard.tsx` (modify)
- Change from expandable button to a `Link` pointing to `/post/{slug}`
- Keep existing card styling, remove expand state

## Filler Content

**Blog posts** get 4-5 content blocks each (paragraphs, a quote, an image placeholder, a callout).

**Case studies** get 8-10 content blocks each including:
- 3-4 stat chips (e.g. "$200M Capital Deployed", "5 Counties", "3-Year Campaign")
- Expandable sections ("Methodology", "Key Findings")
- A carousel with 3 slides
- Paragraphs, headings, images, a quote

## Visual Design

All pages use `AtmosphericLayout` as the shell. Content areas scroll vertically (`overflow-y-auto`). Typography, colors, and spacing follow the existing brutalist system — JetBrains Mono for labels/metadata, Space Grotesk for headings and body text. Red accent (`hsl(0 80% 48%)`) for interactive elements, borders, and highlights.

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | `src/pages/PostDetail.tsx` |
| Create | `src/components/blog/BlogPostView.tsx` |
| Create | `src/components/casestudy/CaseStudyView.tsx` |
| Create | `src/components/casestudy/StatChips.tsx` |
| Create | `src/components/casestudy/ExpandableSection.tsx` |
| Create | `src/components/casestudy/ContentCarousel.tsx` |
| Create | `src/components/content/ContentBlockRenderer.tsx` |
| Modify | `src/components/PostCard.tsx` — link to `/post/:slug` |
| Modify | `src/App.tsx` — add `/post/:slug` route |
| Modify | `src/hooks/useCapabilityPosts.ts` — add slug to type |
| Create | `src/hooks/usePostBySlug.ts` — fetch single post |
| Migration | Add `slug`, `hero_image_url`, `content_blocks`, `stats` columns |
| Data | Update 6 existing posts with rich filler content |

