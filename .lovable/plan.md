

# V4 Design System — Anthropic-Inspired Editorial Warmth

## The shift

Kill the dark-mode-with-gold-glow aesthetic entirely. Move to a **warm light background** with **black typography**, massive whitespace, and editorial confidence. The Anthropic look is: cream canvas, high-contrast black serif headings, clean sans body, zero decorative effects, depth through spacing not surfaces.

## What changes

### 1. Color system — dark to light
- Background: near-black → **warm cream** `hsl(40 30% 96%)` / `#F5F0EB`
- Text: white-at-various-opacities → **near-black** `hsl(30 10% 12%)`
- Accent: gold glow → **warm black** or subtle amber for interactive elements
- Cards: dark surfaces → **white** with barely-there borders or no borders at all
- Kill the breathing gold glow, constellation field, all ambient effects

### 2. Typography
- Keep Instrument Serif for headings — it fits the editorial vibe
- Keep DM Sans for body — clean, modern
- Kill JetBrains Mono entirely — no monospace labels, no "frame 01/12" counters
- Headings get **much larger** — Anthropic uses massive type (60-80px+)
- Body text gets more generous line-height and size

### 3. Layout — the big structural change
- **Remove DeckFrame entirely** as a visual wrapper. The deck becomes a clean horizontal scroll with no chrome whatsoever — no progress dots, no frame counter, no ESC hint, no slide labels
- Navigation: minimal dot indicators only, or remove entirely in favor of scroll
- Content areas get true full-width composition with generous margins (80-120px side padding)
- Cards lose all borders and dark surfaces — they become text blocks with whitespace separation

### 4. Component restyling
- **Pain point cards**: White cards on cream, subtle shadow on hover, no numbered badges, no mono labels
- **Confrontation table**: Clean editorial table — thin horizontal rules only, no background fills, no colored borders
- **Domain tabs**: Simple underline tabs, no background fills
- **Capability cards**: Text-only with a heading and description, no card container
- **Metrics table**: Same editorial table treatment — rules, not boxes
- **Case study grid**: Clean cards with just title + outcome, hover lift
- **CTA**: Simple black button on cream, Anthropic-style pill shape

### 5. Animation refinement
- Kill all "deck-" prefixed animations
- Keep simple fade-up on scroll-into-view
- No clip-reveal, no glow-pulse, no stagger delays beyond 200ms
- Smooth, barely-perceptible transitions

### 6. Homepage (Index.tsx)
- Cream background, black serif heading, no atmospheric layout wrapper
- Hero links become clean text with subtle hover underlines
- Sector tags become simple comma-separated text or minimal pills
- Remove ConstellationField canvas

### 7. AtmosphericLayout
- Strip to a simple cream-background wrapper — no glows, no ambient effects
- Or remove entirely and just use bare layouts

### 8. Global CSS
- All CSS variables flip to light palette
- Remove all retro keyframes, gold glow animations
- Scrollbar styling becomes subtle gray on cream

## What stays
- All content and copy (untouched)
- Horizontal scroll-snap architecture
- All interactive branching logic
- Keyboard + wheel navigation
- Case study lightbox
- SFX hooks (can stay, they're subtle)

## Files modified
- `index.html` — may adjust font imports
- `src/index.css` — full palette flip, kill all effect keyframes
- `tailwind.config.ts` — update CSS variable defaults
- `src/components/AtmosphericLayout.tsx` — strip to minimal wrapper
- `src/pages/Index.tsx` — cream + black editorial hero
- `src/pages/Deck.tsx` — full visual token overhaul, remove chrome
- `src/components/deck/DeckFrame.tsx` — simplified, no labels
- `src/components/CapabilityLayout.tsx` — light palette
- `src/components/PostCard.tsx` — light card style

## What gets removed
- Gold glow ambient effect
- Progress dots navigation
- Frame counter ("01 / 12")
- ESC hint
- Slide labels ("Self-Diagnosis", "What You're Up Against")
- All `mono()` styling for UI chrome
- Dark surface layering system
- ConstellationField (if used on deck)

## What it should feel like
A premium editorial experience — like reading a beautifully typeset proposal on cream paper. Content-forward. The design disappears. The argument lands.

