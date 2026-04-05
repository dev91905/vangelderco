

# Stat Chips Editor — Premium Overhaul

## What's Wrong Now

The editor is a flat list of cramped rows — two tiny inputs jammed next to icon buttons. It looks like a form table, not a WYSIWYG editor. There's no visual relationship between what you're editing and what renders on the front-end. The grip handle doesn't actually drag. The whole thing feels like an afterthought.

## Design Direction

Make the editor mirror the front-end stat chip rendering — each stat is a mini-card with a red left border, the metric value rendered large, and the description below it. Editing happens inline on the card itself, not in a spreadsheet row. The editor *is* the preview.

## Changes

### `src/components/admin/StatChipsEditor.tsx` — Full rewrite

**Layout**: Replace the row-per-stat layout with a horizontal flex-wrap grid of card-shaped editors that visually match the front-end `StatChips` component.

**Each stat card**:
- Red left border (`2px solid hsl(0 80% 48% / 0.6)`) — matches front-end exactly
- Background `hsl(0 0% 4%)`, subtle border `hsl(0 0% 100% / 0.06)`
- **Label input**: Large (`text-lg`), JetBrains Mono, red color — editable inline, no visible input border until focus
- **Description input**: Small (`text-[9px]`), uppercase, tracking-wide — same as front-end rendering
- Visibility toggle + delete as small icons in the top-right corner, 0 opacity by default, visible on card hover
- Dimmed card (50% opacity + strikethrough on label) when `visible === false`

**Empty state**: A dashed-border card with a centered "+" icon — click to add. No separate "Add" button in the header.

**Add flow**: Clicking the empty-state card or a persistent "+" card at the end of the row adds a new stat and auto-focuses the label input.

**Header**: Keep the "STAT CHIPS" label with the horizontal rule, but remove the separate "Add" button (the "+" card replaces it).

No drag-and-drop for now (the grip handle was non-functional anyway) — keeps it clean.

### No other files change

This is a self-contained component rewrite. The props interface (`stats`, `onChange`) stays identical.

