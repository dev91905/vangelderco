

## Merge Claude's content architecture into existing VGC design system

### What changes

The Index page transforms from a centered splash (three nav links + sector pills) into a scrolling single-page that tells the VGC story, using your existing visual language.

### Page sections (top to bottom)

1. **Hero (viewport 1)** — Keep existing: constellation field, three capability lines as nav links, sector pills, "By Referral Only." No content changes here — this already works as an opening.

2. **Altitude Statement (viewport 2)** — NEW. Scroll-reveal section. Large serif text: positioning thesis ("Everyone else operates at 30,000 feet. We see it from orbit.") plus a short explanatory line. Uses your existing `t.serif` / `t.sans` tokens and `fade-up` animations.

3. **Capabilities Grid (below)** — NEW. Three cards, each with: title, punchy sub-line (red accent), and a short paragraph. Cards use your existing border/background tokens with a left-border accent on hover. These link through to the existing `/cultural-strategy`, `/cross-sector`, `/deep-organizing` subpages.

4. **Field Notes (below)** — NEW. 3-4 anonymized case fragments with sector tags, brief, and result line. Left-border accent, scroll-reveal. Content is hardcoded initially (can be wired to Supabase posts later if desired).

5. **Contact / Close (partial viewport)** — NEW. Email link + "By Referral Only" footer. Minimal.

### What stays the same

- All subpages (`/cultural-strategy`, `/cross-sector`, `/deep-organizing`, `/post/:slug`) remain unchanged
- Constellation field, CRT overlay, dark mode toggle — untouched
- Admin, deck, all backend — untouched
- Theme tokens, typography, color system — used as-is

### Technical approach

- Modify `src/pages/Index.tsx` only — add scroll sections below the existing hero
- Create a small `RevealBlock` component (intersection observer, fade-up) or reuse existing `fade-up` keyframe with a hook
- Hero gets `height: 100vh` and fades opacity on scroll (parallax feel)
- All new sections use existing `t.*` theme tokens — no new design system pieces
- Capability cards link to existing routes

### Content (editable later)

- Altitude copy, capability sub-lines, and field notes content will be pulled from Claude's mockup as starting point — you can refine the copy after seeing it in your design system

