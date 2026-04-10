

# Hallmarks Slide Redesign — Self-Assessment Cards

## The Insight

You're overthinking the copy split. A universal framing works for both audiences: frame each hallmark as a statement, and let them self-assess with two simple options. Whether they're experienced or starting fresh, the mental model is the same — "Does this describe me or not?"

## Design

**Header:** "Culture Strategy" as a section label above the heading. Instruction text: "Read each hallmark and tell us where you stand."

**Each card** shows the hallmark title and rationale (as now), but instead of just expanding, each card has two toggle buttons at the bottom:

- **"We're doing this"** — signals they're covered
- **"We need this"** — signals a gap

This works universally:
- Experienced orgs read it as "yes we do this" vs "no we don't"
- Fresh-start users read it as "I get this" vs "I need help here"
- No conditional copy needed

The cards stay expanded after selection so they can read the rationale. Selected state is visually clear (accent border/background on the chosen option).

## Technical Changes

**`src/pages/Deck.tsx`:**
1. Add state: `hallmarkSelections: Record<number, "doing" | "need">` (replaces `expandedHallmark`)
2. Replace the current accordion-style cards with always-visible cards that show title + rationale + two selection buttons
3. Store selections for use downstream (e.g., the capabilities slide could reference what they flagged as gaps)
4. Add "Culture Strategy" section label above heading
5. Update instruction copy

## What Changes for the User

- Cards are always readable (no click-to-expand gate)
- Binary choice per card — zero ambiguity, fast to complete
- Selections feed forward into later slides if needed
- Works identically for fresh-start and experienced users

