

# Replace Link URL Field with Article Search Picker

## Problem
The current "Link to Full Article" field is a raw text input where you manually type a URL or slug. Error-prone, requires remembering slugs, and creates no real relationship between the timeline and the article.

## Solution
Replace the text input with a searchable dropdown that queries `capability_posts`. Type to filter, select to link. If the article doesn't exist, press Enter to create a new draft article with that name — zero friction.

## How It Works

1. **Search input** — As you type, a dropdown appears showing matching `capability_posts` (title, slug, published status). Debounced query, 300ms.

2. **Select to link** — Click a result to set `link_url` to `/post/{slug}`. The input shows the article title with a chip, not a raw URL.

3. **Create inline** — If no match, the dropdown shows "Create '{query}' as new article" at the bottom. Press Enter or click it to insert a new draft `capability_post` with that title, auto-generate a slug, and immediately link it.

4. **Clear** — Small X button to unlink.

## Technical Steps

### 1. Create `ArticlePicker` component
- New file: `src/components/admin/ArticlePicker.tsx`
- Props: `value` (current slug or null), `onChange` (slug | null)
- Internal state: search query, open/closed dropdown
- Query: `SELECT id, title, slug, is_published FROM capability_posts ORDER BY title` filtered client-side (the list is small enough)
- Shows selected article as a styled chip when linked
- Dropdown positioned below input, closes on outside click

### 2. Inline article creation
- When the user types a name with no match and presses Enter, insert a new `capability_post` with:
  - `title`: the search query
  - `slug`: auto-generated from title (kebab-case)
  - `type`: "case-study"
  - `capability`: inherit from the current timeline's context or default to "cultural-strategy"
  - `is_published`: false (draft)
- After creation, auto-select the new article and link it

### 3. Update `CaseStudyEditor`
- Replace the `link_url` text input (lines 427-439) with `<ArticlePicker>`
- The picker sets `link_url` to `/post/{slug}` to maintain backward compatibility with existing rendering logic

### 4. Store the `post_id` relationship (optional but recommended)
- Currently `link_url` is a string. Since we now have a real article reference, we could also store the `post_id` on `deck_case_studies` for a proper FK. But to keep this change minimal, we'll keep using `link_url` as the storage mechanism — the picker just makes it reliable.

## What Changes
- `src/components/admin/ArticlePicker.tsx` — new component
- `src/components/admin/CaseStudyEditor.tsx` — swap text input for ArticlePicker

