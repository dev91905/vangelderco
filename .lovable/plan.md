

# Slide 3 Redesign: The Confrontation Table

## What's wrong now

1. **Staggered row animation** — rows reveal one at a time with a 900ms interval. That's 5+ seconds before the user can even see the full picture. Kills the "oh shit" moment.
2. **Washed-out colors** — "yours" column is `ink(0.4)`, dimension labels are `ink(0.3)`, borders are `ink(0.04)`. Everything looks ghosted and unreadable.
3. **Dead whitespace** — the 120px dimension label column + 40px divider column eat ~160px of horizontal space for almost no content. The grid feels hollow.
4. **No visual hierarchy between sides** — both columns use the same serif font, similar sizes. There's no visceral contrast between "what you're doing" and "what they're doing." You can't glance at this and immediately feel the gap.
5. **Kicker text hidden until animation completes** — the punchline is gated behind a 5-second wait.

## The redesign

**Kill the stagger animation entirely.** All rows appear at once when the frame enters the viewport. Instant comprehension.

**Two-column card layout instead of a grid table.** Left card = "Your portfolio" (muted, smaller). Right card = "The opposition" (dark, bold, larger). The visual weight difference IS the insight — you don't need to read the words to feel the asymmetry.

**Specifics:**

- **Left card**: translucent light background `ink(0.03)`, text at `ink(0.5)`, normal weight, smaller font. Feels anemic on purpose.
- **Right card**: dark background `ink(0.9)`, cream text, bold weight, slightly larger font. Feels aggressive and dominant.
- Each row inside both cards shares the same dimension label, stacked vertically with clean spacing.
- Dimension labels (`Research`, `Content`, etc.) sit as small sans-serif headers above each row pair.

**Remove the `confrontationStep` state and the `setInterval` timer entirely.** No animation gating. Everything shows when `r3.isActive` is true, with a single fast fade-in.

**Kicker always visible** (no conditional on `confrontationStep`), fades in with the rest.

**Heading/subheading** stay as-is (the 2-column pattern from slide 2).

## Layout structure

```text
┌──────────────────────────────────────────────────────┐
│  Heading (left 50%)    │   Subheading (right 50%)    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─── Your portfolio ───┐  ┌─── The opposition ────┐ │
│  │  RESEARCH             │  │  RESEARCH              │ │
│  │  Focus groups...      │  │  Monitor what's        │ │
│  │                       │  │  resonating...         │ │
│  │  CONTENT              │  │  CONTENT               │ │
│  │  Polished ads...      │  │  Creator ecosystems... │ │
│  │  ...                  │  │  ...                   │ │
│  └───────────────────────┘  └────────────────────────┘ │
│                                                      │
│  Kicker text                                         │
└──────────────────────────────────────────────────────┘
```

Left card: light/muted. Right card: dark/bold. The contrast does the teaching.

## Files modified
- `src/pages/Deck.tsx` — rewrite Frame 3 section (~lines 507-578), remove `confrontationStep` state and its `useEffect` timer

