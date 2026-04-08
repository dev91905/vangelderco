
# Deck v3 — Rebuild the Experience, Not the Decorations

## What failed in v2
The current build is still a normal slide deck wearing animation. The core problems are structural:

- **Everything is trapped in a 900px column** because `DeckFrame` hard-caps content at `max-w-[900px]`.
- **Every frame still reveals a full information dump**. Stagger is cosmetic; the user still gets a dense block, just 300ms later.
- **Interactions are local, not narrative.** Hover states and accordions do not change the journey.
- **The most important moments are still tables and cards**, not experiences.
- **The page does not use the screen.** It feels timid instead of premium.

So v3 needs a **different information architecture**, not nicer transitions.

## New experience model
I’ll redesign `/deck` as a **full-bleed guided narrative** with **stateful branching** and **screen-scale composition**.

Instead of “12 stacked slides,” the user moves through **chapters**:

1. **Orientation** — who this is for
2. **Self-diagnosis** — pick the pain that feels most true
3. **Reveal** — show how the opposition actually operates
4. **Reframe** — define what effective stratcomm really is
5. **Explore** — move through the three service areas as an interactive system
6. **Engagement path** — choose how to work together
7. **Credibility + proof** — who we are and selected case work
8. **Close** — clear CTA

The deck still scrolls frame-by-frame and keeps arrow / ESC behavior, but the middle becomes a **guided app-like story**, not a stack of centered slides.

## Structural overhaul

### 1) Full-screen frame system
I will change the frame layout so each section can choose between:
- **narrative width** for hero copy
- **wide canvas** for comparisons / maps / branching layouts
- **edge-to-edge mode** for immersive moments

This means removing the fixed 900px choke point and replacing it with a frame API like:
- `narrow`
- `wide`
- `full`

### 2) Branch logic that actually changes the journey
Early in the deck, the user chooses the problem they most identify with, such as:
- No institutional memory
- No decision framework
- No access beyond the usual channels
- No real measurement
- No media fluency in-house

That selection becomes active state for the rest of the deck:
- later copy highlights the relevant consequence
- service capability cards reorder around that pain
- engagement path copy adapts slightly
- CTA echoes the selected problem

This creates a guided path without splitting into separate routes.

### 3) Replace static “comparison tables” with a narrative confrontation
The “what you’re up against” section becomes a **full-width confrontation screen**:
- one side = your current portfolio behavior
- the other = how the opposition actually operates
- the user advances row-by-row through the contrast
- each step locks focus on one dimension at a time
- the final state shows the whole system at once

This becomes the emotional pivot of the deck.

### 4) Rebuild the three service areas as an interactive system
Instead of six cramped cards, I’ll turn the core offering into a **three-domain interactive canvas**:
- Cultural Strategy
- Cross-Sector Intelligence
- Deep Organizing

Each domain opens into:
- what it is
- what it unlocks
- what donor advisors usually miss
- a practical example

The user can move between them horizontally within the frame. This is where the deck starts feeling like software, not slides.

### 5) Make “How engagements work” feel like a real decision engine
This section becomes a **choose-your-path sequence**:
- First question: “Are you already up to speed, or starting fresh?”
- If starting fresh: show the 2-phase journey
- If already up to speed: show a compressed custom-scope path
- End with a fork:
  - you take it from here
  - we build it with you

The content shown changes based on the selected path, not just hover styling.

### 6) Use the full screen for proof
Case studies become a **trophy wall / evidence room**, not a closing grid dump:
- one featured case gets immersive treatment
- the rest live as a browsable field of proof cards
- selecting one opens a more editorial side panel / lightbox
- “coming soon” cards stay visible but clearly secondary

## Revised frame sequence
1. **Hero** — strong title, full-screen composition, immediate orientation  
2. **Self-diagnosis** — interactive problem selector  
3. **The real delta** — step-by-step confrontation of both sides’ processes  
4. **What effective portfolios have in common** — three hallmarks, one at a time, not all at once  
5. **Three service areas** — interactive system map  
6. **Inside each capability** — guided deep dive driven by selected domain  
7. **How we measure impact** — vanity vs power as a focused, progressive reveal  
8. **Working together** — adaptive path based on client type  
9. **Who we are** — credibility, sector access, pattern recognition  
10. **Proof** — featured case study + expandable evidence field  
11. **CTA** — tailored close that reflects selected pain / path  
12. **Spacer / exit buffer** — keep navigation breathing room

## Interaction principles for v3
- **One primary decision per frame**
- **One red focal element at a time**
- **No centered card pileups**
- **Copy revealed in layers, not paragraphs**
- **Every major interaction changes downstream context**
- **Large compositions first, detail second**

## Files to change

### `src/components/deck/DeckFrame.tsx`
- Remove the fixed `max-w-[900px]`
- Add frame width modes (`narrow`, `wide`, `full`)
- Add alignment options so content can anchor left / split / center depending on frame
- Keep full-screen sticky/snap behavior

### `src/pages/Deck.tsx`
- Rewrite the deck around chapter/state logic
- Add persistent state for:
  - selected problem
  - selected capability
  - selected engagement path
  - selected case study
- Replace table/card-heavy sections with guided interactive sequences
- Recompose frames to use wide/full layouts

### `src/hooks/useFrameReveal.ts`
- Keep the hook, but use it for **chapter staging**, not generic fade-on-everything
- Add helpers for step-based reveal states where needed

### `src/index.css`
- Add layout utilities for full-bleed deck canvases
- Add transition primitives for chapter swapping, row stepping, panel slides, and state changes
- Keep the existing visual identity, but support bigger compositions

## What stays
- `/deck` route
- full-screen scroll-snap structure
- arrow key navigation
- ESC to exit
- existing overall visual language and typography direction
- current content strategy / subject matter, but reorganized for absorption

## What changes fundamentally
- Not a “slide deck with nicer animation”
- Not everything centered
- Not every frame showing all its content at once
- Not hover/accordion as the main idea
- Yes to branching
- Yes to full-width composition
- Yes to app-like guided storytelling

## Implementation outcome
After this overhaul, the deck should feel like a **premium narrative product demo for an advisory firm**: the user makes a few smart choices, the system responds, the argument unfolds in controlled beats, and the screen finally feels used like a modern interactive medium instead of a presentation canvas.
