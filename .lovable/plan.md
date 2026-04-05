

# Standardize Back Navigation Indicators

## Current State — 4 Different Patterns

| Location | Current | Type |
|---|---|---|
| Blog post view | `< Return` (angle bracket entity) | Text |
| Case study view | `< Return` (angle bracket entity) | Text |
| Password gate | `← Go back` (Unicode left arrow) | Text |
| Admin content manager | `← Site` (Unicode left arrow) | Text |
| Admin editor toolbar | Lucide `ArrowLeft` icon | Icon button |

The carousel prev/next buttons (`ChevronLeft`/`ChevronRight`) are navigation *within* content, not "go back" — those stay as-is.

## Decision: Standardize on `← ` (Unicode left arrow)

The `< Return` pattern using an HTML angle bracket looks like broken markup. The Lucide `ArrowLeft` icon in the editor toolbar is fine for a compact icon-only button context. The inconsistency is in the **text-based back links** — three different labels and two different arrow styles.

**Standard**: All text-based back links use `←` (Unicode) as the prefix character. Labels stay contextual but consistent in format:

| Location | New text |
|---|---|
| Blog post view | `← Return` |
| Case study view | `← Return` |
| Password gate | `← Go back` (already correct) |
| Admin content manager | `← Site` (already correct) |
| Admin editor toolbar | Lucide `ArrowLeft` icon (keep — icon-only context) |

## Changes

### `src/components/blog/BlogPostView.tsx`
- Line 47: Replace `&lt; Return` with `← Return`

### `src/components/casestudy/CaseStudyView.tsx`
- Line 67: Replace `&lt; Return` with `← Return`

Two lines, two files. Password gate and admin pages are already using the correct pattern.

