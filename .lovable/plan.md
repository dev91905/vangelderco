

## Admin design polish — premium content manager experience

### What's wrong now

After reviewing all admin pages (`Admin.tsx`, `AdminEditor.tsx`, `AdminSubmissions.tsx`, `AdminLogin.tsx`, `PostListTable.tsx`, `EditorMetaBar.tsx`, `CaseStudyEditor.tsx`, `BlockCanvas.tsx`, `BlockEditor.tsx`):

1. **Dashboard (Admin.tsx)**: Collapsible sections use a janky `maxHeight: 9999px` animation that snaps instead of easing. Header is flat and utilitarian. Filter chips feel like an afterthought — two groups jammed together with a thin divider. The leads section rows lack the readiness score/label that the submissions page shows, so you lose context. No section counts on Articles or Case Studies.

2. **Post list rows (PostListTable.tsx)**: Rows are cramped. The type badge and capability label are tiny inline spans with no visual weight. Published/draft state is a bare eye icon with no label context. No readiness at a glance for what's published vs draft.

3. **Type selector (AdminEditor.tsx)**: Two cards in a `grid-cols-3` layout, leaving a weird empty third column. The cards themselves are plain bordered boxes.

4. **Editor toolbar (AdminEditor.tsx)**: Save status text is tiny and low-contrast. The unsaved/saved states blend into the background.

5. **Login page (AdminLogin.tsx)**: Minimal but the form feels disconnected — no visual container, floating in space.

6. **Submissions detail (AdminSubmissions.tsx)**: The sidebar action buttons stack with no visual grouping. The "Regenerate report" link at the bottom is nearly invisible.

7. **Settings modal (Admin.tsx)**: Three separate save buttons (password, booking link, contact email) — each section has its own full-width save button, which is redundant and adds visual noise.

### The redesign

**Dashboard (Admin.tsx)**
- Replace `maxHeight` animation with proper height transitions or just use CSS `details`/`summary` or a clean accordion pattern
- Add item counts to Articles and Case Studies section headers (like Leads already has)
- Redesign filter chips: unified pill bar with a subtle active indicator, not two separate chip groups with a divider
- Give the header more breathing room and a subtle bottom shadow instead of a hairline border
- Add readiness score labels to the leads rows on the dashboard

**Post list (PostListTable.tsx)**
- Increase row padding and add more breathing room
- Make the type badge more prominent — slightly larger, consistent pill sizing
- Add a subtle published/draft text label next to the eye icon
- Show the published date more prominently

**Type selector (AdminEditor.tsx)**
- Switch from `grid-cols-3` to `grid-cols-2` so the two cards fill the space properly
- Add a subtle hover lift effect

**Editor toolbar (AdminEditor.tsx)**
- Make save status more visible — use a subtle colored dot or pill instead of tiny text
- Better visual separation between left nav and right actions

**Login (AdminLogin.tsx)**
- Wrap the form in a subtle card container with soft shadow
- Add a thin divider between header and form fields

**Submissions detail (AdminSubmissions.tsx)**
- Group the action buttons with a section label ("Actions")
- Make "Regenerate report" a proper ghost button instead of a barely-visible text link
- Add visual separator between contact info and actions

**Settings modal (Admin.tsx)**
- Consolidate to a single save button at the bottom instead of one per section
- Add subtle section dividers with proper spacing

### Files to change

- `src/pages/Admin.tsx` — dashboard layout, section animations, filter bar, settings modal, leads rows
- `src/components/admin/PostListTable.tsx` — row spacing, badge sizing, published state
- `src/pages/AdminEditor.tsx` — type selector grid, toolbar status, save button states
- `src/pages/AdminLogin.tsx` — card wrapper for form
- `src/pages/AdminSubmissions.tsx` — sidebar action grouping, regenerate button, section labels

### What stays the same

- `EditorMetaBar.tsx` — the content editing experience (title, excerpt, settings drawer) is already solid
- `BlockCanvas.tsx` / `BlockEditor.tsx` — the block editing UX is clean
- `CaseStudyEditor.tsx` — functional, dense by nature, not the priority
- All theme tokens and color system — no changes to `theme.ts`

