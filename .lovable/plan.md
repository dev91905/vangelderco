

# Site-Wide Visual Identity Overhaul — Gold + Serif

## The shift

From: Near-black brutalist with red accent, Space Grotesk headings, JetBrains Mono body, CRT scanlines, film grain, corner brackets, scan beam.

To: Clean near-black with warm gold accent (`#c9a55a`), **Instrument Serif** display headings, **DM Sans** body text, no CRT/grain overlays. Sophisticated and approachable.

## Font loading — `index.html`
- Replace current Google Fonts link: drop Space Grotesk + JetBrains Mono
- Add: `Instrument+Serif:ital@0;1` and `DM+Sans:wght@400;500;600`

## CSS foundation — `src/index.css`
- `--primary` / `--accent` / `--ring`: red → gold (`40 50% 57%`)
- Body font: `'DM Sans', system-ui, sans-serif`
- **Remove**: `body::before` (film grain), `body::after` (CRT scanlines), `@keyframes grain`, `@keyframes scan-beam`
- Update `@keyframes breathe` glow color from red to gold
- Restyle `.hero-nav-link` hover effects with gold instead of red

## AtmosphericLayout
- Breathing glow: red → gold
- **Remove**: scan beam div, corner bracket SVGs
- Admin link hover: gold

## Pages & Components (font + color find-replace)

Every instance of:
- `'Space Grotesk'` → `'Instrument Serif', serif`
- `'JetBrains Mono'` → `'DM Sans', sans-serif`
- `hsl(0 80% 48%)` → `#c9a55a` / `hsl(40 50% 57%)`

Across these files:
- `src/pages/Index.tsx`
- `src/pages/Deck.tsx` (all 11 frames + inline components)
- `src/components/deck/DeckFrame.tsx`
- `src/components/CapabilityLayout.tsx`
- `src/components/PostCard.tsx`
- `src/components/PasswordGate.tsx`
- `src/pages/NotFound.tsx`
- `src/components/casestudy/StatChips.tsx`
- `src/components/ConstellationField.tsx` — node/edge colors to gold

## What's removed
- Film grain overlay, CRT scanlines, scan beam, corner bracket SVGs

## What stays
- Near-black background, scroll-snap deck, keyboard nav, SFX, ConstellationField (recolored), all content/copy, Supabase integration, admin pages

## Memory updates
- `mem://design/tokens` and `mem://index.md` updated to reflect Instrument Serif + DM Sans + gold identity

## Files modified (~14)
`index.html`, `src/index.css`, `src/components/AtmosphericLayout.tsx`, `src/pages/Index.tsx`, `src/pages/Deck.tsx`, `src/components/deck/DeckFrame.tsx`, `src/components/CapabilityLayout.tsx`, `src/components/PostCard.tsx`, `src/components/PasswordGate.tsx`, `src/pages/NotFound.tsx`, `src/components/casestudy/StatChips.tsx`, `src/components/ConstellationField.tsx`, `mem://design/tokens`, `mem://index.md`

