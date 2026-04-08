
# V3 Design System Overhaul — Premium Modern

## The problem
The current design reads "hacker terminal from 2008": CRT scanlines, film grain overlay, scan beam, corner bracket SVGs, hard 0px border-radius, red accent everywhere, boxy grid layouts with `border: 1px solid` on everything, JetBrains Mono for body text. It's cramped, busy, and the opposite of premium.

## The target aesthetic
Think Linear, Stripe, or Apple — generous whitespace, soft surfaces, subtle gradients, restrained typography, refined motion. Dark mode done right: depth through layered surfaces, not borders.

## What changes

### 1. Kill all retro effects (index.css)
- Remove `body::before` film grain overlay
- Remove `body::after` CRT scanlines
- Remove `scan-beam` keyframe and all scan beam elements
- Remove corner bracket SVGs from AtmosphericLayout and Deck
- Remove `crt-boot` keyframe
- Keep breathing glow but shift from red to warm gold

### 2. Color system overhaul (index.css + all components)
- Accent: `hsl(0 80% 48%)` red → `hsl(40 50% 57%)` warm gold (per existing memory)
- Surfaces: introduce layered depth — `hsl(0 0% 4%)` base, `hsl(0 0% 6%)` card, `hsl(0 0% 8%)` elevated
- Borders: from `hsl(0 0% 100% / 0.06)` hard lines → `hsl(0 0% 100% / 0.04)` or gradient borders
- `--radius: 0rem` → `--radius: 0.75rem` (subtle rounding)
- CSS variables updated: `--primary`, `--accent`, `--ring` all shift to gold

### 3. Typography (all pages)
- Headings: Space Grotesk → **Instrument Serif** (elegant, editorial authority)
- Body/labels: JetBrains Mono → **DM Sans** (clean, readable)
- Keep a mono font for small system labels only (frame counter, timestamps)
- Update Google Fonts import in `index.html`
- All style token objects (`f`, `heading()`, `body()`, `mono()`) in Deck.tsx updated

### 4. Layout & spacing — breathe
- **DeckFrame**: increase padding. `wide` mode gets `px-8 md:px-20 lg:px-32`. `narrow` gets `max-w-[720px] px-10`.
- **Pain point grid**: from cramped 0-gap bordered boxes → cards with `gap-4`, subtle background surfaces, rounded corners, no hard borders
- **Confrontation table**: from bordered grid → clean rows with just bottom dividers and generous padding
- **Capability cards**: from bordered boxes → minimal cards with left accent line, more vertical space
- **Metrics table**: softer visual treatment, no harsh strikethrough
- **Case study grid**: from dense 2-col bordered grid → cards with subtle surface elevation

### 5. Component-level changes

**AtmosphericLayout.tsx**
- Remove corner bracket SVGs
- Remove scan beam div
- Shift breathing glow from red to gold
- Admin link stays but uses gold accent

**Index.tsx (homepage)**
- "VGC StratComm Advisors" label: red → gold
- Hero nav link hover: red wash/bar → gold
- Sector tags: red left border → gold left border
- Overall: same layout, color swap + typography swap

**CapabilityLayout.tsx**
- Same structure, color + typography swap
- Classification label: red → gold

**PostCard.tsx**
- Hard border box → subtle surface card with rounded corners
- Red left border → gold left border
- Typography swap

**Deck.tsx**
- All `f.red`, `f.redA()` → gold equivalents
- All `f.sg` (Space Grotesk) → Instrument Serif for headings, DM Sans for body
- All `f.jb` (JetBrains Mono) → DM Sans for labels, keep mono only for counters
- Pain point buttons: remove hard borders, use surface cards with gap
- Confrontation: clean up grid to minimal row layout
- Hallmark cards: softer expansion, no hard border-left snapping
- Domain tabs: from bordered → underline-style with generous spacing
- StatChip: soften borders, use gold accent
- CTA button: from bordered mono button → refined gold-accent button with subtle glow
- Progress dots: red → gold
- Lightbox: rounded corners, gold top accent

**index.css**
- Remove grain, scanlines, crt-boot keyframes
- Update `hero-nav-link` hover styles: red → gold
- Scrollbar thumb: red → gold
- Keep animation keyframes (fade-up, clip-reveal, breathe, deck-* animations)
- Update breathe glow to gold tones

### 6. What stays the same
- Horizontal scroll-snap architecture
- All interactive branching logic (pain select, confrontation auto-advance, domain tabs, engagement path)
- All content/copy
- ConstellationField canvas (already gold-tinted per memory)
- Frame counter, progress dots (just recolored)
- Keyboard + wheel navigation
- Case study lightbox functionality
- SFX hooks

## Files modified
- `index.html` — Google Fonts import (add Instrument Serif, DM Sans; keep Inter as fallback)
- `src/index.css` — remove retro effects, update colors, update radius
- `tailwind.config.ts` — update `--radius` default
- `src/components/AtmosphericLayout.tsx` — remove brackets/scan beam, gold glow
- `src/pages/Index.tsx` — color + typography swap
- `src/pages/Deck.tsx` — full design token overhaul + layout spacing improvements
- `src/components/deck/DeckFrame.tsx` — padding increase, label typography
- `src/components/CapabilityLayout.tsx` — color + typography swap
- `src/components/PostCard.tsx` — card redesign
- `src/components/NavLink.tsx` — if it uses red, swap to gold

## What gets removed
- Film grain `body::before`
- CRT scanlines `body::after`
- Scan beam divs
- Corner bracket SVGs (4 total, in AtmosphericLayout + Deck)
- All references to `hsl(0 80% 48%)` (replaced with gold)
- `crt-boot` keyframe
- `grain` keyframe
