

# Deck v2 — Premium Interactive Overhaul

## The Problem With v1

Every frame dumps its full content at once. No animation, no pacing, no interactivity. Components are bordered boxes with inline styles. The comparison "tables" look like spreadsheets. Dense frames (Hallmarks, Capabilities, Engagements) cram paragraphs into a single viewport. There's no sense of choreography — it reads like a document, not an experience.

## Design Philosophy for v2

**Cinematic pacing.** Each frame reveals its content in a choreographed sequence — headline first, then supporting elements stagger in 150-200ms apart. The user watches the argument build.

**Progressive disclosure.** Dense content (Hallmarks, Capabilities) uses expandable cards. You see the headline grid; click to reveal depth. Skimmers get the argument from titles alone. Engaged readers go deeper without leaving the frame.

**Interactive decision points.** The engagement fork (Option A/B) becomes a real interactive moment — hover/click one side and it expands while the other recedes. The comparison tables animate row-by-row on scroll entry.

**Breathing room.** Split the densest frames. Fewer words visible at any moment. Much larger type for hero statements.

## Frame-by-Frame Redesign

### Frame 1 — Title
- Title types in with a clip-reveal animation
- Subtitle and tagline stagger-fade 400ms apart
- Subtle downward scroll indicator (animated chevron or "scroll" label)

### Frame 2 — The Problem
- Headline fades in first
- Each numbered problem staggers in one by one (200ms intervals)
- Problems start collapsed (title only), auto-expand sequentially as user watches, or click to expand individually

### Frame 3 — What You're Up Against
- Headline animates in
- **Replace the HTML table** with two side-by-side card columns that animate in row by row
- Left column fades in dim (your side), right column slides in with red accent (their side) — staggered so the contrast hits viscerally
- Closing paragraphs fade in last

### Frame 4 — What Effective Portfolios Have in Common
- Three hallmark cards in a row (or stacked on mobile)
- Each shows ONLY the title initially
- Click a card → it expands smoothly to reveal the rationale + "How we help" section
- Accordion behavior — opening one can optionally close others
- Red accent line on the active/expanded card

### Frame 5 — Core Capabilities
- Six capabilities as a 2×3 grid of cards (not a vertical list)
- Each card shows bold title + first line
- Hover reveals full description with a smooth height animation
- Cards stagger-fade on frame entry

### Frame 6 — How We Measure Impact
- **Replace table** with two animated columns
- Left column items fade in dim with strikethrough or reduced opacity (vanity metrics)
- Right column items fade in bright with red accent (power indicators)
- Row-by-row animation, ~300ms stagger
- Closing quote animates in last with a red left-border accent

### Frame 7 — How Engagements Work
- Two client type cards at top (click to toggle between custom vs standard flow)
- Standard flow: animated vertical timeline with Phase 1 → Phase 2 → Fork
- Timeline nodes pulse/glow as they enter view
- **The Fork** — two cards side by side. Hovering one scales it up slightly and dims the other. Click expands it with a subtle transition. This is the "choose your path" moment.

### Frame 8 — Who We Are
- Hero statement animates in large
- Sector list staggers in as horizontal pills/tags (not a vertical list) — more modern, less document-like
- Each pill has a subtle hover state revealing the description as a tooltip or expandable

### Frame 9 — The Promise
- Single hero statement, very large type
- Typewriter or clip-reveal animation
- Supporting paragraph fades in after a beat
- This frame should feel like a pause — lots of negative space

### Frame 10 — CTA
- Minimal. Name, line, button.
- Button has a glow/pulse animation on idle

### Frame 11 — Case Studies
- Grid of cards with staggered entrance animation
- Cards with content have a red top-border; others are dimmer
- Hover lifts the card (translateY + shadow)
- Lightbox opens with a scale-in animation from the card position

### Frame 12 — Spacer (navigation padding)
- Keep as-is

## New Infrastructure

### `useFrameReveal` hook
A custom hook that uses IntersectionObserver to track when a frame enters view and returns a `isActive` boolean + a `stagger(index)` helper that returns `{ opacity, transform, transition }` for sequenced reveals. Every frame wraps its children with this — zero per-frame animation boilerplate.

### `DeckFrame` upgrade
Add an `onActive` callback and pass the reveal state down. The frame itself handles the stagger orchestration.

### Vertical progress nav
Fixed right-side dots (below frame counter). Clickable. Active dot is red, others are dim white. Animates between states.

### CSS additions to `index.css`
- `@keyframes clip-reveal` (already exists)
- `@keyframes counter-up` for number animations
- Stagger utility classes

## What stays the same
- All copy/content — identical words
- DeckFrame scroll-snap architecture
- HUD chrome (brackets, scan beam, frame counter, ESC hint)
- useGlitchSFX on frame transitions
- Arrow key + ESC navigation
- Color system (red accent, near-black bg)
- Font stack (Space Grotesk, JetBrains Mono)
- Case study lightbox content
- Dialog component for lightbox

## Technical details

### Files modified
- `src/pages/Deck.tsx` — full rewrite with animation system, interactive components, new layout patterns
- `src/components/deck/DeckFrame.tsx` — add `onActive` prop and reveal state management
- `src/index.css` — add stagger animation keyframes and utility classes

### No new dependencies. All animations are CSS transitions + IntersectionObserver.

