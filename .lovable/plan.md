

# Admin Panel: Collapsible Articles Section + Rename "Submissions"

## Changes

### 1. Collapsible "Articles" section in Admin.tsx
Wrap the filter chips + `PostListTable` in a collapsible accordion-style section with a clickable header labeled **"Articles"** that shows a count (e.g. "Articles (12)") and a chevron. Clicking toggles the list open/closed. Default state: open. Uses the same pattern as a simple `useState` toggle with smooth height animation.

### 2. Rename "Contacts" / "Submissions" to "Diagnostic Results"
- The nav link in the admin header bar currently says "Submissions" — rename to **"Diagnostic Results"**
- The `/admin/submissions` page heading (in `AdminSubmissions.tsx`) — rename to **"Diagnostic Results"**
- Any references to "contacts" or "submissions" in user-facing admin UI copy get updated

### Files to edit
- `src/pages/Admin.tsx` — add collapsible wrapper around articles list, rename "Submissions" link text
- `src/pages/AdminSubmissions.tsx` — rename page heading and any user-facing labels

