

# Case Study Timeline Editor — Upgrade Plan

## What exists
The `CaseStudyEditor.tsx` already edits the `deck_case_studies` table (the horizontal timeline you just built). It works — but it's a basic accordion with plain form fields. No drag-and-drop, no starter templates, no link-to-article field, and the visual design doesn't mirror the published timeline at all.

## What to build

### 1. Database: add `link_url` column
Add `link_url text` (nullable) to `deck_case_studies`. This lets you optionally link a timeline to a full case study article.

### 2. Redesign the timeline editor to mirror the published view
Rewrite `CaseStudyEditor.tsx` as a premium editorial editor:

- **Header band**: Large editable case study name, published toggle, and an optional "Link to article" URL field
- **Meta row**: Issue and Outcome as inline-editable fields
- **Vertical timeline rail**: A thin vertical line runs down the left side with numbered nodes — mirrors the horizontal published timeline but stacked vertically for editing. Each phase is a card hanging off the rail with:
  - Drag handle (left edge)
  - Phase number (auto-updates on reorder)
  - Inline title, date, description fields
  - Optional stats as inline chip editors
  - Remove (×) button, subtle until hover
- **Drag-and-drop reordering** via HTML5 drag events — reorder phases by dragging the handle
- **"Add Phase" node** at the bottom of the rail with a `+` circle on the line

### 3. Suggested starter blocks for new case studies
When you click "Add Case Study," it pre-populates with 6 suggested phases:
- Issue / Context
- Research / Discovery  
- Strategy / Brief
- Coalition Building
- Execution / Pilots
- Results / Impact

Each has placeholder text. You can remove, rename, or reorder any of them.

### 4. "Read Full Report" link in the timeline overlay
In `CaseTimelineOverlay.tsx`, below the "Case Study / Name" breadcrumb: if `link_url` exists, render a subtle "Read the full report →" link. If no link, nothing shows.

### 5. Update Deck.tsx data mapping
Add `link_url` to `CaseStudyData` type and pass it through from DB results.

## Files changed

| File | Work |
|------|------|
| **DB migration** | `ALTER TABLE deck_case_studies ADD COLUMN link_url text;` |
| `src/components/admin/CaseStudyEditor.tsx` | Full rewrite — vertical timeline editor with drag-and-drop, starter templates, link field |
| `src/components/deck/CaseTimelineOverlay.tsx` | Add `link_url` to type, render "Read full report" link in header |
| `src/pages/Deck.tsx` | Add `link_url` to data mapping |

