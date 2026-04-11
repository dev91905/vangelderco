

# Editor Redesign — One Premium Content Creator

## The Problems

1. **Type selector buried in a settings drawer.** You have to click a tiny gear icon, open a side panel, scroll to find a 3-button toggle. The most important decision — what kind of content you're making — is hidden behind two clicks.

2. **No visual identity per content type.** Switching between Blog Post, Case Study, and Field Note barely changes anything. The editor looks the same regardless. The published pages look beautiful and distinct — the editor should reflect that.

3. **Field note is a completely separate code path** (lines 213–261 in AdminEditor.tsx) with its own inline form, while blog/case-study share the same generic meta bar + block canvas. This creates an inconsistent, fragmented experience.

4. **Settings drawer is a junk drawer.** Type, capability, slug, status, hero image, password, featured toggle — all crammed into one panel with no hierarchy.

## The Redesign

### Type selection: front and center

When creating a new post, the first thing you see is a clean type selector at the top of the editor — three elegant cards or tabs, not buried in a drawer. Each shows the type name and a one-line description:

- **Blog Post** — Long-form narrative with hero image
- **Case Study** — Structured analysis with key metrics
- **Field Note** — Quick signal with impact stat

Clicking one immediately transforms the editor below it. For existing posts, the type shows as a subtle label in the toolbar (not editable inline — change it in settings if needed).

### Editor adapts per type

**Blog Post:** Hero image area at top (click to upload), title, excerpt, date, divider, then content blocks. Matches the published BlogPostView layout exactly.

**Case Study:** No hero image area. Title, excerpt, date, then stat chips editor, divider, then content blocks with expandable/carousel/stat-grid available. Matches CaseStudyView.

**Field Note:** Centered, minimal form — just like the current one but elevated. Title at top (same as other types for consistency), then the elegant slug line / brief / impact stat / link fields. No content blocks, no hero image. Matches the published field note view.

### Settings drawer: reorganized

Split into two sections with clear headers:
- **Publishing** — Status toggle, date, slug, capability
- **Promotion** — Featured toggle, slug line, featured stat, hero image, password

Remove the type selector from the drawer entirely (it lives in the editor header now).

### Visual polish

- Subtle background tint change per type: warm ivory (blog), slightly cooler (case study), minimal (field note) — barely perceptible but establishes identity
- Type indicator in toolbar shows current type with a small icon
- Smooth transitions when switching types (content blocks fade, fields animate in/out)
- The whole editor uses the same typography and spacing as the published views

## Files to edit

- **`src/pages/AdminEditor.tsx`** — Add prominent type selector for new posts, reorganize the layout to adapt per type, unify the field-note path with the main editor flow
- **`src/components/admin/EditorMetaBar.tsx`** — Remove type selector from settings drawer, reorganize drawer into Publishing/Promotion sections, add type-aware visual adaptations
- No changes to BlockCanvas, BlockEditor, or published views — those are fine

## What stays the same

- Auto-save, ⌘S, ⌘⇧P shortcuts — all untouched
- Block canvas with drag-and-drop, slash commands — untouched
- Content block types and their editors — untouched
- Settings drawer mechanism (slide-in panel) — kept, just reorganized
- StatChipsEditor placement — stays between meta bar and blocks for case studies

