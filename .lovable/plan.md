

# Van Gelder Co. — Capability Pages + Content System

## Summary
Turn the three hero lines into navigable links with video-game-inspired hover effects and transitions. Create three capability sub-pages with a brutalist-institutional design. Set up Supabase tables for case studies and blog posts.

## Architecture

```text
/                    → Landing (existing, hero lines become nav links)
/cultural-strategy   → Capability page
/cross-sector        → Capability page
/deep-organizing     → Capability page
```

## What Changes

### 1. Landing Page — Hero Lines Become Links
- Wrap each hero line in a `<Link>` to its capability route
- Add a video-game hover effect: on hover, a red scan-line sweeps across the text left-to-right, text shifts slightly right (~4px translate), and a faint red glow pulses behind it. A small `>` caret fades in at left. All via CSS transitions (~300ms).
- Cursor changes to `pointer`. No other style changes — same font, size, color, animation on load.

### 2. Three Capability Pages (new components)
Each page shares a common layout component (`CapabilityLayout`) with:
- Same atmospheric effects as landing (grain, scanlines, vignette, breathing glow)
- A "back" indicator top-left: `< RETURN` in JetBrains Mono, clicking returns to `/`
- Page entry animation: content glitches/flickers in like a CRT boot sequence (2-3 rapid opacity flickers over ~400ms, then settles)
- **Header section**: Capability name in Space Grotesk (~36px desktop), red classification label above it, one-paragraph description below in JetBrains Mono at 50% white opacity
- **Case Studies / Posts section**: Grid of cards below, each card has a red left-border accent, title, date, excerpt. Cards fade-up stagger on load. Clicking a card expands it inline (no new route) with full content.
- HUD corner brackets persist from landing page (shared layout)

Content descriptions per page:
- **Cultural Strategy**: Engaging cultural sectors around shared objectives with partners
- **Cross-Sector Intelligence**: Developing strategies and coordinating across sectors around common issues  
- **Deep Organizing**: Deeply organizing key constituencies and building durable field power

### 3. Supabase Setup — Content Tables

**Table: `capability_posts`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| capability | text | enum-like: 'cultural-strategy', 'cross-sector', 'deep-organizing' |
| type | text | 'case-study' or 'blog-post' |
| title | text | required |
| excerpt | text | short preview |
| content | text | full markdown content |
| published_at | timestamptz | display date |
| is_published | boolean | default false |
| created_at | timestamptz | default now() |

RLS: Public read for published posts (`is_published = true`). No write via client — content managed via Supabase dashboard or future admin.

### 4. Data Layer
- React Query hook `useCapabilityPosts(capability)` fetches posts filtered by capability and `is_published = true`, ordered by `published_at desc`
- Supabase client integration via `@supabase/supabase-js`

### 5. Shared Layout Refactor
Extract atmospheric effects (grain, scanlines, vignette, glow, scan beam, corner brackets) into a shared `AtmosphericLayout` wrapper used by both landing and capability pages.

### 6. New CSS
- Hover effect keyframes for hero links (scan-sweep, glow pulse)
- CRT boot-in animation for capability pages
- Card fade-up stagger animation
- Transition classes for link hover states

## Files to Create/Modify
- `src/index.css` — add hover and page-transition keyframes
- `src/pages/Index.tsx` — wrap hero lines in Links, add hover classes
- `src/components/AtmosphericLayout.tsx` — shared atmospheric wrapper
- `src/components/CapabilityLayout.tsx` — shared capability page layout
- `src/pages/CulturalStrategy.tsx` — capability page
- `src/pages/CrossSector.tsx` — capability page  
- `src/pages/DeepOrganizing.tsx` — capability page
- `src/components/PostCard.tsx` — case study/blog card component
- `src/integrations/supabase/client.ts` — Supabase client (via Lovable Cloud)
- `src/hooks/useCapabilityPosts.ts` — data fetching hook
- `src/App.tsx` — add routes
- Migration: create `capability_posts` table with RLS

