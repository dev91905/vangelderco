

# Admin Editor Design Polish — Premium WYSIWYG

## Audit Findings

### Typography mismatch
Paragraph blocks render in JetBrains Mono (monospace). A WYSIWYG editor should mirror the front-end — body text should use Space Grotesk so authors see what readers see. Monospace should only appear on meta labels and code.

### Too much block chrome
Every block has a 40px left gutter with an accent bar + grip handle + a right-side delete button. All three elements fade in/out on hover, creating a jittery, cluttered feel — especially with 10+ blocks. The accent bar (a thin red line) doesn't communicate anything useful.

### Insert points are too tall
28px between every block. With 15 blocks that's 420px of dead space. The plus button requires hover to discover — fine on desktop, invisible on mobile.

### Paragraph placeholder is noisy
"Start writing, or type / for commands..." is too long. Notion uses just "Type '/' for commands" — shorter, quieter.

### Keyboard hints overlap content
`fixed bottom-4 left-4` floats over the scroll area. On short viewports or mobile, it covers content.

### No selected/active block state
No visual indicator of which block you're currently editing. The red accent bar tries to do this but it's too subtle and appears on hover too, diluting its meaning.

### Stat chips section breaks flow
Hard border separator between stat chips and content canvas fragments the editing experience. Should feel like part of the same document flow.

---

## Changes

### `src/components/admin/BlockEditor.tsx` — Minimal block chrome
- Remove the left accent bar entirely
- Reduce left gutter from `w-10` to `w-6` — grip handle only, tighter to content
- Grip handle: invisible by default, 20% opacity on block hover (not 40%)
- Delete button: move into a small floating pill that appears on hover at top-right of block, not as a persistent right-column element
- Add a subtle `background: hsl(0 0% 100% / 0.02)` + `border-radius: 8px` on the focused block only — a gentle "selection" highlight that replaces the accent bar
- **Paragraph font**: Change from `mono` to `grotesk` with `fontSize: "14px"` — matches front-end body text
- Shorten placeholder to `"Type / for commands"`
- Heading blocks: remove the H1/H2/H3 dropdown selector from the left. Move it to a subtle inline chip that appears on hover to the right of the text

### `src/components/admin/BlockCanvas.tsx` — Tighter insert points
- Reduce insert point height from 28px to 12px
- Plus button: 12×12px, appears centered on hover at 30% opacity instead of current scale animation
- On mobile: add a persistent thin "+" bar at the bottom of the block list (always visible, no hover needed)
- Empty state: larger, warmer — centered "Start writing" with a single plus button, no secondary text

### `src/pages/AdminEditor.tsx` — Cleaner toolbar + hints
- Toolbar: reduce vertical padding from `py-2.5` to `py-2`
- Move keyboard hints from `fixed` to the bottom of the scroll container (inside the scrollable div), with generous top margin so they sit below content
- Remove the `hidden md:flex` — show hints on all viewports as a subtle reference (they're small enough)

### `src/components/admin/EditorMetaBar.tsx` — Tighter title area
- Reduce top padding from `pt-6` to `pt-4`
- Slug line: slightly more compact, reduce gap

### `src/components/admin/StatChipsEditor.tsx` — Inline with document flow
- Remove the wrapping border separator in AdminEditor (`borderBottom` on the stat chips container)
- Add a subtle label divider inline instead — just the "STAT CHIPS" label with a faint horizontal rule, same as a content section header

### `src/components/admin/BlockTypePicker.tsx` — Add search input
- Add a text input at the top of the picker that auto-focuses on open
- Filter types as user types (already supported via `filter` prop, but no visible input exists for click-to-add flow — only slash command has filtering)

**No new dependencies. No structural changes. Pure visual/UX refinement across 6 files.**

