

# Full-Screen Pitch Deck Experience

## Concept
A new `/deck` route: a full-screen, frame-by-frame scrollable pitch deck with ~8 sticky frames. Each frame fills the viewport. Scroll snaps frame-to-frame. Left/Right arrows navigate between frames. ESC exits back to home. Same brutalist aesthetic — near-black, red accent, Space Grotesk headings, JetBrains Mono system text. SFX on frame transitions.

## Frame Structure

1. **Title** — "Van Gelder Co." + tagline: "Strategic Communications for the Sectors That Shape Power"
2. **The Problem** — "The infrastructure connecting culture, policy, and capital is broken. The people with resources and the people with reach operate in parallel — never in concert."
3. **Cultural Strategy** — Domain 001. Description + mock example: a faith-media coalition campaign that shifted narrative polling 12 points in 90 days.
4. **Cross-Sector Intelligence** — Domain 002. Description + mock example: a labor-energy-philanthropy alignment that unlocked $40M in coordinated capital.
5. **Deep Organizing** — Domain 003. Description + mock example: identifying 200+ community leaders across 6 states that traditional pipelines missed entirely.
6. **How It Works Together** — Visual showing the three domains as an interconnected system, not siloed services.
7. **Origin Story** — "We built this because we watched $500M in philanthropic capital deploy with no cultural strategy, no cross-sector coordination, and no ground infrastructure. The money moved. Nothing changed. We decided to build the connective tissue."
8. **Close** — "By referral only." Minimal. The red glow breathing. A single line.

## Technical Approach

### New files
- `src/pages/Deck.tsx` — The pitch deck page component
- `src/components/deck/DeckFrame.tsx` — Reusable full-viewport sticky frame wrapper

### Implementation
- CSS `scroll-snap-type: y mandatory` on the container, each frame is `scroll-snap-align: start` + `height: 100dvh`
- Track current frame index via `IntersectionObserver` (threshold 0.5)
- Keyboard handler: ArrowRight/ArrowDown = next frame, ArrowLeft/ArrowUp = prev frame (smooth scroll), Escape = `navigate("/")`
- Frame transition SFX: `playHoverGlitch()` on each frame entering view
- Each frame uses the atmospheric styling inline (red glow, JetBrains Mono labels, Space Grotesk headlines) — no AtmosphericLayout wrapper since we need scroll
- Corner brackets persist (fixed position)
- Film grain + scanlines from `index.css` apply automatically
- Frame counter HUD in bottom-right: `01 / 08` style, JetBrains Mono

### Route
- Add `/deck` to `App.tsx` routes
- Add to `ROUTE_MODE_MAP` as `"home"` constellation mode
- No nav link from main site (accessed by direct URL or shared link)

### Mock data
- All content is hardcoded strings in Deck.tsx — no database. This is a presentation artifact.
- Mock stat chips on capability frames (e.g., "12-PT SHIFT / 90 DAYS", "$40M UNLOCKED", "200+ LEADERS / 6 STATES")

## Files modified
- `src/App.tsx` — add `/deck` route
- `src/pages/Deck.tsx` — new
- `src/components/deck/DeckFrame.tsx` — new

