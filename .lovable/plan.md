

# V4 Design Pass — Remaining Pages & Components

## What's still broken

Every file below still uses the old dark-mode tokens: near-black backgrounds (`hsl(0 0% 2.5%)`), white text at various opacities, red accents (`hsl(0 80% 48%)`), JetBrains Mono everywhere, and Space Grotesk for headings. The V4 palette is warm cream bg, near-black ink, Instrument Serif headings, DM Sans body — none of these files got updated.

## Files to update (18 files)

### Admin pages
- **`src/pages/Admin.tsx`** — dark bg, red accents, JetBrains Mono, Space Grotesk heading. Flip to cream bg, ink borders, DM Sans labels, Instrument Serif title.
- **`src/pages/AdminLogin.tsx`** — dark bg, red button, monospace inputs. Flip to cream bg, black pill button, DM Sans inputs.
- **`src/pages/AdminEditor.tsx`** — dark bg toolbar, red save button, monospace labels. Flip to cream bg, ink-colored toolbar, black pill save.

### Admin components
- **`src/components/admin/PostListTable.tsx`** — dark row backgrounds, red hover accents, JetBrains Mono. Flip to white rows on cream, ink hover, DM Sans.
- **`src/components/admin/EditorMetaBar.tsx`** — dark drawer, red toggles, JetBrains Mono/Space Grotesk. Flip to white drawer on cream, ink toggles, DM Sans.
- **`src/components/admin/BlockCanvas.tsx`** — dark insert points, red plus icons, JetBrains Mono. Flip to cream palette.
- **`src/components/admin/BlockEditor.tsx`** — dark focus bg, red borders on quotes/callouts, JetBrains Mono/Space Grotesk. Flip to cream palette.
- **`src/components/admin/BlockTypePicker.tsx`** — dark dropdown, red selection highlights, JetBrains Mono. Flip to white dropdown, ink selection.
- **`src/components/admin/ImageUploader.tsx`** — dark dashed borders, red remove buttons, JetBrains Mono. Flip to cream palette.
- **`src/components/admin/StatChipsEditor.tsx`** — dark cards, red stat values, JetBrains Mono. Flip to cream palette.

### Public content views
- **`src/components/blog/BlogPostView.tsx`** — dark bg gradient, red meta labels, JetBrains Mono, Space Grotesk headings. Flip to cream bg, ink meta, Instrument Serif headings, DM Sans body.
- **`src/components/casestudy/CaseStudyView.tsx`** — same dark treatment. Flip to cream editorial.
- **`src/components/casestudy/StatChips.tsx`** — dark cards, red values. Flip to cream cards, ink values.
- **`src/components/casestudy/ExpandableSection.tsx`** — dark bg, red left border. Flip to white/cream, ink border.
- **`src/components/casestudy/ContentCarousel.tsx`** — dark bg, red dot indicators. Flip to cream.
- **`src/components/content/ContentBlockRenderer.tsx`** — dark surfaces, red quote borders, JetBrains Mono/Space Grotesk. Flip to cream palette, Instrument Serif headings, DM Sans body.
- **`src/components/PasswordGate.tsx`** — dark bg, red glow, corner brackets, scan beam, JetBrains Mono/Space Grotesk. Strip all retro effects, flip to cream bg with clean editorial gate.

### Other pages
- **`src/pages/NotFound.tsx`** — dark bg, red "Signal Lost", Space Grotesk 404, JetBrains Mono. Flip to cream, Instrument Serif 404, DM Sans labels.
- **`src/pages/PostDetail.tsx`** — loading states use JetBrains Mono + white-on-dark. Flip to DM Sans + ink-on-cream.

## Token reference (consistent across all files)

| Token | Old | New |
|-------|-----|-----|
| Background | `hsl(0 0% 2.5%)` | `hsl(40 30% 96%)` |
| Card/surface | `hsl(0 0% 4-6%)` | `hsl(0 0% 100%)` |
| Text primary | `hsl(0 0% 100% / 0.9)` | `hsl(30 10% 12% / 0.9)` |
| Text secondary | `hsl(0 0% 100% / 0.3-0.5)` | `hsl(30 10% 12% / 0.3-0.5)` |
| Accent | `hsl(0 80% 48%)` | `hsl(30 10% 12%)` (black pill/ink) |
| Border | `hsl(0 0% 8-15%)` | `hsl(30 10% 12% / 0.06-0.1)` |
| Heading font | Space Grotesk | Instrument Serif |
| Body/label font | JetBrains Mono | DM Sans |
| Button style | Red bg | Black pill (border-radius: 999px) |

## What gets removed
- Corner bracket SVGs in PasswordGate
- Red breathing glow in PasswordGate
- Scan beam in PasswordGate
- All `'JetBrains Mono'` references
- All `'Space Grotesk'` references
- All red accent colors (`hsl(0 80% 48%)`)

## What stays the same
- All functionality, logic, and data flow
- Component structure and props
- Admin CRUD operations
- Password verification flow
- Drag-and-drop block editing

