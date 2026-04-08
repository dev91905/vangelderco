

# Slide 1 Copy Update

## Changes

Three edits to the hero frame in `src/pages/Deck.tsx`:

1. **Add a primer line** between the subtitle and the button. Something like: *"A five-minute primer on how we think about strategic communications — and how we could work together."* This frames the experience as a knowledge transfer, not a sales pitch. Sits below the "hits harder" subtitle, above the CTA.

2. **Button text**: Change "Start the walkthrough →" to "Go →"

3. **Remove the "5 minutes" text below the button** — the primer line already covers duration. Keep the navigation hint ("Use mouse wheel, trackpad, or ← → keys").

## Proposed copy stack

```text
Building a Next-Generation StratComm Portfolio
───
For donor advisors and program officers who want a portfolio that hits harder.

Everything we know about effective strategic communications — in five minutes.
How we think, how we work, and what we'd do with your portfolio.

[ Go → ]
Use mouse wheel, trackpad, or ← → keys
```

The primer copy is two short lines: the first establishes authority ("everything we know"), the second makes it personal ("your portfolio"). Both stay under the max-width cap.

## File modified
- `src/pages/Deck.tsx` — lines ~489–549: add primer paragraph, change button text, remove "5 minutes" standalone text

