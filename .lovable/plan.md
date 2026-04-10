
# Fix the editor so it actually mirrors the published article views

## What’s wrong
You’re right. It still does not match.

The current editor is mixing two different things:
1. a writing canvas
2. inline metadata controls

That’s why it diverges from the published pages.

### Exact mismatches I found
- **Headline block is wrong structurally**
  - Published blog: centered title, `32px/44px`, max-width, proper spacing, meta row above, date below, divider below that.
  - Published case study: centered title, slightly different size (`28px/40px`), same centered excerpt and meta stack.
  - Editor: title input is editable, but the **slug row sits directly under it**, which does not exist on the published page and breaks the visual match.

- **Subtitle/dek is wrong structurally**
  - Published view: the excerpt sits directly under the title as part of the article header.
  - Editor: the dek is wrapped in an admin-labeled “DEK” field. That’s admin UI, not published UI.

- **Type-specific header layout is not mirrored**
  - Blog and case study published pages do **not** share the exact same top section.
  - The editor currently uses basically one generic header block for both.

- **Published meta strip is missing in-place**
  - Published pages have:
    - type label
    - capability label
    - publish date
    - divider
  - The editor doesn’t render that header exactly as the published view does.

- **Slug/URL control is in the wrong place**
  - You said it correctly: keep URL making, but **move it into Post Settings**, not into the visual article header.

## Implementation plan

### 1. Rebuild `EditorMetaBar` as a real published-style article header
Turn the visible editor header into the same layout used on live posts.

#### Visible header should include:
- type + capability row at top
- centered editable title
- centered editable excerpt/dek
- published date display beneath
- separator rule beneath the header

#### Important:
- keep title and excerpt editable
- keep the exact published spacing and widths
- branch layout by post type:
  - **blog-post** header should match `BlogPostView`
  - **case-study** header should match `CaseStudyView`

### 2. Remove slug/URL from the visible editor header
Take the `/post/[slug]` row out of the main article header completely.

Move these controls into the settings drawer:
- slug
- auto-generated-from-title behavior
- preview URL / open published page action if published

That keeps the editor visually identical to the final piece while preserving editability.

### 3. Match title + excerpt styles exactly, not approximately
Port the exact published values over from the live views.

#### Blog header
- title: `text-[32px] md:text-[44px]`
- excerpt: `clamp(17px, 1.9vw, 19px)`, centered, `t.ink(0.55)`
- date: `text-[13px]`, centered
- wrapper: same `max-w-[680px] mx-auto`

#### Case study header
- title: `text-[28px] md:text-[40px]`
- excerpt: same published case-study excerpt styling
- metrics section remains below header, matching published order

### 4. Make the editor mirror the published page hierarchy
In `AdminEditor.tsx`, reorganize the render order so the page reads like the live article:

#### Blog
```text
toolbar
published-style header
divider
content blocks
```

#### Case study
```text
toolbar
published-style header
stats section
divider
content blocks
```

That means the **stats section must stay in the same visual position it appears in the published case study**, not as an unrelated admin widget.

### 5. Keep admin-only controls out of the article surface
Anything not visible on the live post should live in the settings drawer, not in the rendered header:
- slug
- password
- publish toggle
- hero image upload
- feature toggles
- sector label / featured stat
- homepage feature settings

This is the clean separation you want:
- **article surface** = what the reader sees
- **settings drawer** = admin-only controls

### 6. Preserve editing while making it feel WYSIWYG
Use inputs/textarea only where necessary, but style them to be visually identical to the final rendered content:
- title input should look like final title text
- excerpt textarea should look like final excerpt text
- keep transparent backgrounds and no visible field chrome
- labels like “DEK” should be removed from the visible article surface

## Files to change
| File | Change |
|---|---|
| `src/components/admin/EditorMetaBar.tsx` | Rebuild as published-style article header, branch blog vs case-study, remove inline slug row, move slug editing into settings drawer |
| `src/pages/AdminEditor.tsx` | Reorder layout to mirror published hierarchy; keep stats in the same place as live case studies |
| `src/components/blog/BlogPostView.tsx` | Use as source of truth while matching editor header exactly |
| `src/components/casestudy/CaseStudyView.tsx` | Use as source of truth while matching editor header exactly |

## Technical notes
- The editor should stop being a “form at the top + content below.”
- It should become “the live article, but editable.”
- I would not duplicate random styling guesses. I’d explicitly port the published header structure and values from `BlogPostView` and `CaseStudyView`.
- If needed, the cleanest long-term move is to extract a shared `PostHeader` component used by both published pages and the editor, with an `editable` mode. That prevents this drift from happening again.

