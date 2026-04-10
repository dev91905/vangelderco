

# Admin Panel Color Audit + WYSIWYG Editor

## Two problems

### 1. White-on-cream hover effect
The admin panel background is cream (`hsl(40 30% 96%)`). Hover states use `t.white` which is `hsl(40 25% 98%)` — a 2% lightness difference. Invisible. Every hover across the admin is broken:
- PostListTable row hover → `t.white`
- Settings/logout button hover → `t.white`
- EditorMetaBar settings gear hover → `t.surface.hover` (`t.ink(0.04)`)
- BlockEditor delete button bg → `hsl(0 0% 100%)`

**Fix**: Replace all admin hover backgrounds with a visible contrast. Use `t.ink(0.04)` for subtle hover (which is dark ink at 4% opacity — visible on cream), and `t.ink(0.06)` for active states. Audit every `onMouseEnter`/`onMouseLeave` and `hover:bg-` in:
- `src/pages/Admin.tsx` — button hovers, post row hovers
- `src/pages/AdminEditor.tsx` — toolbar button hovers
- `src/components/admin/EditorMetaBar.tsx` — drawer close, settings gear
- `src/components/admin/BlockCanvas.tsx` — insert point buttons, empty state
- `src/components/admin/BlockEditor.tsx` — delete button, drag handle
- `src/components/admin/PostListTable.tsx` — row hover

Specifically `t.white` and `hsl(0 0% 100%)` on hover backgrounds all become `t.ink(0.05)`.

### 2. Editor should match published view (WYSIWYG-style)
Current editor: flat text areas with raw `DM Sans` at generic sizes, no visual hierarchy, no centered layout matching the published post.

Published BlogPostView: centered at `max-w-[680px]`, proper heading sizes (`32px-44px`), body at `15-16px`, serif quotes, callouts with backgrounds, proper spacing.

**Fix**: Restyle the BlockEditor to match ContentBlockRenderer and BlogPostView typography:

- **Headings**: Match published sizes — H1 `text-[24px] md:text-[32px]`, H2 `text-[20px] md:text-[26px]`, H3 `text-[17px] md:text-[21px]`. Use `t.sans` with `font-bold` (not `font-medium`).
- **Paragraphs**: `text-[15px] md:text-[16px]`, color `t.ink(0.55)`, line-height `1.9`.
- **Quotes**: Use `t.serif` italic, left border `2px solid t.ink(0.12)`, proper padding. Match ContentBlockRenderer exactly.
- **Callouts**: Match the published callout style — `t.ink(0.04)` background, `t.border(0.08)` border.
- **Overall canvas wrapper** in AdminEditor: keep `max-w-3xl` (close to published `680px`), center it.
- **Title input** in EditorMetaBar: size it closer to the published `text-[32px] md:text-[44px]`.
- **Excerpt/dek textarea**: match published excerpt styling — `clamp(17px, 1.9vw, 19px)`, `t.ink(0.55)`.

Replace hardcoded `hsl(30 10% 12% / ...)` values in BlockEditor.tsx and BlockCanvas.tsx with `t.ink(...)` from theme — these files bypass the theme system entirely.

## Files to change
| File | What |
|------|------|
| `src/pages/Admin.tsx` | Fix hover backgrounds — replace `t.white` with `t.ink(0.05)` |
| `src/pages/AdminEditor.tsx` | Fix toolbar hover colors, use theme tokens |
| `src/components/admin/EditorMetaBar.tsx` | Fix drawer hover states, make title/excerpt match published sizes |
| `src/components/admin/BlockEditor.tsx` | Restyle all block types to match published typography (heading sizes, paragraph color/size, quote serif + border, callout bg). Replace all hardcoded HSL with `t.*` |
| `src/components/admin/BlockCanvas.tsx` | Replace hardcoded HSL with `t.*`, fix insert point hover |
| `src/components/admin/PostListTable.tsx` | Fix row hover from `t.white` to `t.ink(0.05)` |

