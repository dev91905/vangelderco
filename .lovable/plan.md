

# Add Excerpt/Dek Field to Admin Editor & Case Study View

## Problem
The "Reframing Climate" case study has no dek because:
1. The admin editor hardcodes `excerpt: null` on save (line 67 of `AdminEditor.tsx`)
2. There's no excerpt input field anywhere in the editor UI
3. `CaseStudyView` doesn't render an excerpt even if one existed

The `PostCard` on the capability listing page already renders `post.excerpt` — but the field is always empty because there's no way to enter it.

## Changes

### 1. `src/pages/AdminEditor.tsx`
- Add `excerpt` state (`useState("")`)
- Load it from `post.excerpt` on edit
- Include it in `formData()` instead of hardcoded `null`

### 2. `src/components/admin/EditorMetaBar.tsx`
- Add `excerpt` and `onExcerptChange` props
- Add a textarea field below the title/slug area (always visible, not buried in the settings drawer) — labeled "DEK" in mono caps
- Compact, 2-3 line textarea with placeholder "Short description shown on listing cards and below the title"

### 3. `src/components/casestudy/CaseStudyView.tsx`
- Accept `excerpt` in the post prop interface
- Render it below the title and above the date, styled as a subtitle: `text-[13px]` JetBrains Mono, `color: hsl(0 0% 100% / 0.5)`, centered, `max-w-2xl`

### 4. `src/components/blog/BlogPostView.tsx`
- Same treatment: accept `excerpt`, render below title if present

### 5. `src/pages/PostDetail.tsx`
- Pass `excerpt: post.excerpt` to both `CaseStudyView` and `BlogPostView`

Five files, small edits each. After this, you can type a dek in the editor and it'll appear on both the listing card and the article page.

