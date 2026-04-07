

# Revamp Pitch Deck — Sharper Copy, Add Timeline, Keep Mock Case Studies

## What changes and why

The current deck has 8 frames. The uploaded outline has stronger copy in several places and a "First 90 Days" timeline the user explicitly wants. The goal: maximize for client acquisition — every frame should earn the next scroll. The existing mock case studies and stat chips on the capability frames stay as-is.

## Revised frame structure (10 frames)

1. **Title** — Keep. "Van Gelder Co." + tagline.

2. **The Problem** — Rewrite with the sharper framing from the outline: "The people with the money, the people with the power, and the people with the culture are designing strategy in separate rooms." Then the three-part breakdown (philanthropy funds what it can measure / policy moves what it can legislate / culture moves what it can feel). This is tighter than the current version.

3. **What We Do** — New frame. One sentence: "We sit at the intersection of philanthropy, policy, labor, culture, and technology — and we build the connective tissue between them." Below it: a minimal triangle/three-node visual showing the three capabilities.

4. **Cultural Strategy** — Domain 001. Keep current description, mock case example, and stat chips.  Add the tagline "Culture doesn't support the strategy. Culture IS the strategy." as a pull-quote accent.

5. **Cross-Sector Intelligence** — Domain 002. Keep description, mock case example, and stat chips. Add tagline "Know first. Move first."

6. **Deep Organizing** — Domain 003. Keep description, mock case example, and stat chips. Add tagline "Not events. Not 'engagement.' Organizing."

7. **The Loop** — Replaces "How It Works Together." New visual: a circular flow diagram rendered with CSS/SVG showing Intelligence → Cultural Strategy → Deep Organizing → back to Intelligence. Headline: "Intelligence tells you where to aim. Culture tells you how to move people. Organizing makes it stick." Subtext: "It's a loop, not a menu."

8. **The Origin Story** — Rewrite with the three-gap framing: donors had money but no map, policy people had maps but no people, culture people had people but no strategy. Closes with: "We built the connective tissue."

9. **First 90 Days** — NEW frame. A beautiful vertical timeline visualization showing the onboarding journey:
   - Week 1–2: Intake (portfolio, priorities, blind spots, adversaries)
   - Week 3–4: First intelligence briefing delivered
   - Month 2: Cultural strategy scoping
   - Month 3: Organizing architecture, structure test designed
   - Ongoing: Monthly retainer, direct access, intel feed
   
   Rendered as a styled vertical timeline with red accent dots, connecting lines, and JetBrains Mono labels. This is the "what happens when you say yes" frame — critical for acquisition.

10. **Close** — Keep. "By referral only."

## Technical details

### Files modified
- `src/pages/Deck.tsx` — rewrite problem/origin frames, add 2 new frames (What We Do, First 90 Days), add pull-quote taglines to capability frames, update `TOTAL_FRAMES` to 10. New inline components: `TimelineStep` for the 90-day visualization, and SVG loop diagram for frame 7.

### No other files change
- `DeckFrame.tsx` — unchanged
- `App.tsx` — unchanged (route already exists)

