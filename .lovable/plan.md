

# Admin Editor Deep Overhaul — Next-Gen Content Editor

## Problems with Current Editor

1. **Cluttered top bar** — metadata, type toggle, capability selector, slug, hero image all crammed into one dense region before any content appears
2. **No auto-resize on text fields** — paragraph blocks use fixed `rows={3}` textareas regardless of content length
3. **Block chrome is heavy** — every block has a visible border, header bar with type label, and explicit drag handle. Feels like editing a spreadsheet, not writing
4. **No keyboard shortcuts** — no Cmd+S, no `/` slash commands, no Enter-to-add-paragraph
5. **No auto-save** — users must manually click Save every time
6. **Mobile unfriendly** — drag handles, tiny text, fixed layouts don't work on touch
7. **Block insertion UX is clunky** — hover-to-reveal `+` button in a 24px tall gap between blocks is hard to hit
8. **No content preview** — user has to save, publish, and open a new tab to see what it looks like

## Design Direction

Notion-meets-CONTROL: clean writing surface where blocks feel invisible until interacted with. Dark, minimal, fluid.

## Changes

### 1. Auto-Expanding Textareas
Replace all fixed-row textareas with auto-resizing ones. Paragraphs grow as you type — no scroll bars inside blocks. Single `useAutoResize` hook.

### 2. Invisible Block Chrome
- Remove block header bars (the `PARAGRAPH`, `HEADING` type label strips)
- Blocks sit directly on the canvas with no visible border by default
- On hover: show a faint left border accent + ghost drag handle + delete icon
- On focus: subtle red left-border glow
- Result: the editor looks like a clean document, not a form

### 3. Slash Command Menu
- Typing `/` in any empty paragraph opens the block type picker inline (positioned below cursor)
- Keyboard navigable (arrow keys + Enter to select)
- Filters as you type after `/` (e.g. `/hea` filters to Heading)
- Replaces the current paragraph block with the selected type

### 4. Smart Block Insertion
- Pressing Enter at the end of a paragraph auto-creates a new empty paragraph below
- The between-block `+` button becomes a more visible, persistent thin line with centered `+` on hover (larger hit target, 40px tall)
- Block type picker appears as a floating popover anchored to the insertion point

### 5. Collapsible Metadata Drawer
- Title field sits at the very top of the canvas (large, clean, Notion-style — just type)
- All other metadata (type, capability, slug, hero image, publish toggle, stats) moves into a collapsible side drawer or top panel toggled via a gear icon in the toolbar
- This keeps the writing surface clean and distraction-free

### 6. Sticky Floating Toolbar
- Compact sticky toolbar at top: Back arrow | Post title (truncated) | Unsaved indicator | Preview | Save
- Save button fills red when there are unsaved changes (visual urgency)
- Cmd+S keyboard shortcut to save
- Preview opens in a slide-over panel (not a new tab)

### 7. Auto-Save with Debounce
- Auto-save 3 seconds after the user stops typing
- Small "Saved" / "Saving..." status indicator in the toolbar
- Manual save still available via button/shortcut
- Dirty state tracked but no nagging — it just saves

### 8. Mobile-First Touch Interactions
- Blocks get a long-press to reveal actions (move up/down/delete) instead of drag handles on mobile
- Block type picker becomes a bottom sheet on mobile
- Metadata drawer is a full-screen slide-up on mobile
- All touch targets minimum 44px

### 9. Better Block Editors
- **Image blocks**: Show a large drop zone with preview, remove the separate URL input (keep it as a link icon toggle)
- **Quote blocks**: Show the red left border in the editor matching the front-end preview
- **Expandable sections**: Nested content rendered with the same block canvas (recursive), with a visual indent
- **Carousel**: Horizontal scrollable thumbnails with add/remove, not a vertical stack

### 10. Keyboard Shortcuts
- `Cmd+S` — Save
- `/` — Open block picker (in empty paragraph)
- `Backspace` on empty block — Delete block, focus previous
- `Enter` at end of paragraph — New paragraph below
- `Cmd+Shift+P` — Toggle publish

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AdminEditor.tsx` | Restructure layout: floating toolbar, collapsible metadata drawer, auto-save logic, keyboard shortcuts |
| `src/components/admin/BlockEditor.tsx` | Remove block chrome (header bar, borders), add auto-resize textareas, slash command detection, Enter/Backspace handlers |
| `src/components/admin/BlockCanvas.tsx` | Improved insertion points (larger targets), Enter-to-add-paragraph propagation, mobile long-press actions |
| `src/components/admin/BlockTypePicker.tsx` | Keyboard navigation, filter-as-you-type, floating positioning, bottom-sheet on mobile |
| `src/components/admin/EditorMetaBar.tsx` | Convert to collapsible drawer/panel, gear-icon toggle, cleaner layout |
| `src/components/admin/ImageUploader.tsx` | Larger drop zone, inline preview improvements |
| `src/components/admin/StatChipsEditor.tsx` | Move inside metadata drawer, cleaner inline editing |

## No New Dependencies
All achievable with existing packages (`@dnd-kit`, React, Tailwind). Auto-resize uses a simple `useEffect` on `scrollHeight`.

