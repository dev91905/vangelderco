

# Premium Password Management System

## Summary
Upgrade the password UX across both the per-post editor and global site settings with generate, copy, show/hide, and at-a-glance password status across the post list.

## Changes

### 1. `src/components/admin/EditorMetaBar.tsx` — Per-post password section overhaul
Replace the plain text input with a premium password management card:
- **Show/hide toggle** (eye icon) to reveal the password
- **Generate button** — creates a random 12-char alphanumeric password and fills the field
- **Copy button** — copies to clipboard with a brief "Copied" confirmation tooltip
- **Clear button** — removes protection
- All four actions as small icon buttons in a row next to the input
- Password input uses `type="password"` by default, toggleable to `type="text"`

### 2. `src/pages/Admin.tsx` — Global password dialog overhaul
Same premium treatment for the global password modal:
- Show/hide, generate, copy buttons alongside the input
- Current status indicator: "Active" with red dot or "Not set" with dim dot
- When a global password is active, show it (masked) with one-click copy

### 3. `src/components/admin/PostListTable.tsx` — Password indicator on post rows
- Add a small lock icon next to each post title that has a per-post password set
- Subtle, dim — just enough to see at a glance which posts are individually gated

### Password generation
Simple inline utility — `crypto.getRandomValues` to produce a 12-character string from `A-Za-z0-9`. No external dependency.

### No database or schema changes
All UI-only. The `password` column on `capability_posts` and `site_settings` table already exist.

