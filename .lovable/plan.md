

# Fix Article Editor — Match Published Article Format

Three concrete problems visible in the editor right now:

## Problem 1: Title gets cut off
The editor uses a single-line `<input>` for the article title. Long titles like "Reframing Climate Through Cultural Infrastructure" get truncated to "Reframing Climate Through Cultural I". The published view wraps correctly because it uses a block-level `<h1>`.

**Fix**: Replace the title `<input>` in `EditorMetaBar.tsx` with an auto-resizing `<textarea>` (same pattern as body text). This lets long titles wrap naturally, matching the published layout.

## Problem 2: Key Metrics don't match the public version
The `StatChipsEditor` constrains each chip to `max-w-[220px]`, which truncates descriptions like "CULTURAL INSTITUTIONS ENGAGI..." and "NARRATIVE INFRASTRUCTURE IN...". The public `StatChips` component has no max-width constraint — chips size to content.

**Fix**: Remove the `max-w-[220px]` constraint from both `StatChipsEditor.tsx` and the stat-grid block in `BlockEditor.tsx`. Let chips size naturally, matching the published `StatChips` component.

## Problem 3: Editor forces scrolling before content is reachable
The `EditorMetaBar` uses `minHeight: "20vh"` (or `"40vh"` with hero images) plus `paddingTop: "8vh"`, pushing content blocks below the fold. The user has to scroll past a large empty header area before reaching editable content.

**Fix**: Reduce the top padding in `EditorMetaBar.tsx` from `8vh`/`6vh` to `3vh`, and remove `minHeight` on the header wrapper. The header should be compact — just enough space for the meta row, title, excerpt, and date. No forced vertical whitespace that pushes blocks out of view.

## Files to edit
- `src/components/admin/EditorMetaBar.tsx` — textarea for title, reduce header spacing
- `src/components/admin/StatChipsEditor.tsx` — remove max-width constraint on chips
- `src/components/admin/BlockEditor.tsx` — remove max-width constraint on stat-grid chips

