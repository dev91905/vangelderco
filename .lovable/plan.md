
# V3 Design System Overhaul — Premium Modern

## The problem
The current design reads "hacker terminal from 2008": CRT scanlines, film grain overlay, scan beam, corner bracket SVGs, hard 0px border-radius, red accent everywhere, boxy grid layouts with `border: 1px solid` on everything, JetBrains Mono for body text. It's cramped, busy, and the opposite of premium.

## The target aesthetic
Think Linear, Stripe, or Apple — generous whitespace, soft surfaces, subtle gradients, restrained typography, refined motion. Dark mode done right: depth through layered surfaces, not borders.

## What changes

### 1. Kill all retro effects
Remove film grain overlay, CRT scanlines, scan beam, corner bracket SVGs, and all related keyframes. Keep breathing ambient glow but shift it from red to warm gold.

### 2. Color system
- Accent shifts from aggressive red `hsl(0 80% 48%)` to warm gold `hsl(40 50% 57%)`
- Surfaces get proper depth layering: base `hsl(0 0% 2.5%)`, card `hsl(0 0% 6%)`, elevated `hsl(0 0% 8%)`
- Border radius from `0rem` to `0.75rem` — subtle rounding across all components
- Borders become near-invisible separators instead of hard outlines

### 3. Typography
- Display headings: Space Grotesk → **Instrument Serif** (editorial elegance)
- Body text and labels: JetBrains Mono → **DM Sans** (clean, modern)
- Monospace reserved only for tiny system counters (frame number, timestamps)

### 4. Layout & spacing
- DeckFrame padding increases significantly — content breathes
- Pain point grid: from cramped 0-gap bordered boxes → spaced cards with soft surfaces
- Confrontation table: clean minimal rows, no grid borders
- Capability cards: generous spacing, subtle surface elevation
- Case study grid: proper card treatment with rounded corners

### 5. Every page and component updated
Homepage, Deck, Capability pages, PostCard, AtmosphericLayout — all get the new system applied consistently.

## What stays the same
- All content and copy (untouched)
- Horizontal scroll-snap deck architecture
- All interactive branching logic (pain multi-select, confrontation auto-advance, domain tabs, engagement paths)
- Keyboard + wheel navigation
- Case study lightbox functionality
- SFX hooks
- ConstellationField canvas

## Files modified
- `index.html` — Font imports
- `src/index.css` — Remove retro effects, new color system
- `tailwind.config.ts` — Border radius
- `src/components/AtmosphericLayout.tsx` — Remove brackets/beam, gold glow
- `src/pages/Index.tsx` — Color + typography
- `src/pages/Deck.tsx` — Full design token overhaul + spacing
- `src/components/deck/DeckFrame.tsx` — Padding, label style
- `src/components/CapabilityLayout.tsx` — Color + typography
- `src/components/PostCard.tsx` — Card redesign

## What gets removed
- Film grain, CRT scanlines, scan beam, corner brackets
- All red accent references (replaced with gold)
- Related keyframes (grain, crt-boot)
