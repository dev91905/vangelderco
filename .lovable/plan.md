

# Deck Interactive Overhaul — Typeform-Style Quiz + Diagnostic Score

## What this does
Transforms the deck from a passive reading experience into an interactive diagnostic tool. Every slide requires interaction before advancing. The confrontation section becomes a quiz where prospects pick which approach sounds more effective — then get shown they've been picking their opponents' moves. A hidden scoring engine calculates a "strategic readiness" score saved to the database and visible in your admin dashboard alongside their answers and contact info.

## Current slide map → New interactive map

```text
Frame  Current                    New interaction
─────  ─────────────────────────  ──────────────────────────────────────
 1     Hero (passive)             → "Get Started" button (keep, add pulse)
 2     Self-Diagnosis (select)    → Keep (already interactive), add "Continue →" 
 3     Confrontation (scroll)     → QUIZ: "Which sounds more effective?" per row
                                    Pick A or B, then reveal + score
 4     Hallmarks (accordion)      → Keep expand, add "Got it, next →"
 5     Three Domains (select)     → Keep (already interactive), add "Continue →"
 6     Capabilities (passive)     → Quick rank: "Which 2 matter most?" 
 7     Metrics (passive)          → "Which do you currently measure?" checklist
 8     Working Together (select)  → Keep (already interactive), add "Continue →"
 9     Who We Are (passive)       → Brief: "Have you worked with media pros before?" Y/N
10     The Promise (passive)      → Remove (fold into CTA)
11     CTA (form)                 → Keep, show score summary
12     Case Studies (passive)     → Keep as optional browse
13     Close                      → Show score + thank you
```

## The Quiz (Frame 3 overhaul)

Current: Side-by-side "Your grantees" vs "Their opponents" revealed step-by-step.

New: Each row shows two unlabeled approaches (A and B). One is "yours," one is "theirs." The prospect picks whichever sounds more effective. After all 6 rows:

- Reveal: labels appear — "That was your opponents'" on the ones they picked as more effective
- Score: how many times they picked the opponent's approach (likely most/all)
- Punch: "You picked the opposition's approach X out of 6 times. Your grantees are running the plays in the other column."

Randomize left/right placement per row so it's not obvious.

## Scoring Engine

Every interactive slide contributes points to a composite "strategic readiness" score (0–100). Lower = more gaps = hotter lead.

```text
Signal                                          Points (lower = worse shape)
───────────────────────────────────────────────  ────────────────────────────
Pain points selected (Frame 2)                  -5 per pain (max -25)
Custom challenge written                        -5
Quiz answers (Frame 3): picked opponent's       -8 per pick (max -48)
Domains selected (Frame 5): all three           -5 (they need everything)
Capabilities ranked (Frame 6): specific mix     weighted
Current metrics (Frame 7): vanity-heavy         -3 per vanity metric checked
Engagement path (Frame 8): "starting fresh"     -10
No media experience (Frame 9)                   -5

Base score starts at 100. Subtract signals.
Floor at 0. 
```

Score labels for admin:
- 0–25: **Critical** — full diagnostic needed
- 26–50: **Significant gaps** — strong engagement candidate  
- 51–75: **Moderate** — targeted support
- 76–100: **Advanced** — light-touch advisory

## Typeform-style navigation

- Hide the bottom prev/next bar (currently visible)
- Each slide gets a prominent "Continue →" button that only activates after the user interacts
- Disable scroll/swipe advancement until interaction is complete on required slides
- Show a subtle progress indicator with step names, not just numbers
- Keyboard: Enter = advance after interaction, arrow keys still work as backup

## Database changes

**New column on `deck_contacts`:**
```sql
ALTER TABLE deck_contacts ADD COLUMN readiness_score integer;
ALTER TABLE deck_contacts ADD COLUMN quiz_answers jsonb;
ALTER TABLE deck_contacts ADD COLUMN metrics_checked text[];
ALTER TABLE deck_contacts ADD COLUMN capabilities_ranked text[];
ALTER TABLE deck_contacts ADD COLUMN has_media_experience boolean;
```

`quiz_answers` stores: `[{ dimension: "Research", picked: "theirs", correct: false }, ...]`

## Admin dashboard update

The `ContactsFeed` component in `Admin.tsx` gets:
- **Score badge** next to each contact name (color-coded: red/orange/yellow/green)
- **Score label** ("Critical", "Significant gaps", etc.)
- **Expandable detail view** showing every answer: quiz picks, pain points, domains, metrics, capabilities ranked
- Sortable by score (worst first — hottest leads on top)

## Files to create/modify

| File | Change |
|------|--------|
| `supabase/migrations/...` | Add columns to `deck_contacts` |
| `src/pages/Deck.tsx` | Major rewrite: quiz logic, scoring engine, Typeform navigation, new interactive elements on passive slides |
| `src/pages/Admin.tsx` | Score badge, expandable detail view, sort by score |
| `src/lib/deckScoring.ts` | New — scoring calculation logic (shared between deck submit and admin display) |

## Execution order

1. Database migration (add columns)
2. Create `deckScoring.ts` scoring engine
3. Rewrite Frame 3 as a quiz with randomized placement + reveal
4. Add interaction gates to passive slides (6, 7, 9)
5. Implement Typeform-style navigation (Continue buttons, gate scroll)
6. Wire scoring into form submission
7. Update admin dashboard with score display
8. Remove Frame 10 (fold into CTA)

