

# Deck Content & Structure Overhaul — Same Visual System

## Summary
Complete content rewrite of `src/pages/Deck.tsx` from 11 frames to 12 frames (10 main + CTA + post-CTA case studies). All visual conventions preserved. New components needed: comparison table, numbered problem list, metrics table, case study grid with lightbox.

## Frame-by-frame plan

| # | Label | What changes |
|---|-------|-------------|
| 1 | — | Update subtitle to include "and program officers". Add second subtitle line: "Advice, connections, and hands-on support to make your stratcomm strategy actually work." |
| 2 | The Problem | **Full rewrite.** Replace current 2-paragraph prose with headline "Common problems for anyone overseeing a stratcomm portfolio." + 5 numbered problems. Each: bold name + 1-sentence description. Bold key terms as eye-traps. |
| 3 | What You're Up Against | **Full rewrite.** New headline: "Same goal. Completely different process." Replace current ContrastColumn list format with a **6-row comparison table** (Research, Content, Distribution, Engagement, Measurement, Iteration) — "Your side" vs "Their side". Below: two closing paragraphs about petri dish vs organic fire. New `ComparisonTable` component. |
| 4 | What Effective Portfolios Have in Common | **Replaces "The Real Discipline."** 3 hallmarks, each with rationale paragraph + "*How we help:*" paragraph. Reuses CapCard with minor tweak (add italic "How we help" subsection). |
| 5 | Core Capabilities | **Replaces "Three Capabilities."** 6 capabilities (Portfolio Audit, Strategic Framework, Impact Measurement, Access & Introductions, Program Development, Training). Each: bold name + dash + short description. Uses DeliverableRow component. |
| 6 | How We Measure Impact | **New frame.** Side-by-side metrics table: "What most grantees report" vs "What we track" (6 rows). Closing line about 73M views. New `MetricsTable` component styled like ComparisonTable. |
| 7 | How Engagements Work | **Rewrite of current "How We Work" + "First 90 Days".** Opens with two client types. Then Phase 1 (4–6 weeks) with bullets + deliverable. Phase 2 (6–8 weeks) with bullets + deliverable. Then the Option A/B fork (keeps existing OptionCard). Removes old timeline steps (replaced by phase structure). |
| 8 | Who We Are | **Replaces "Why This Exists."** Opening line about having been in reader's position. Team from commercial media. 6 sector bullets (News, Music, Film/TV, Digital, PR, Philanthropy). Closing line about access and pattern recognition. |
| 9 | The Promise | Keep as-is — copy is identical. |
| 10 | — (CTA) | Change CTA line to "Let's look at your portfolio together." Keep email button. |
| 11 | Case Studies | **New post-CTA frame.** "Want to see it in action?" + grid of 10 case study cards. Each card: name + outcome. Clicking opens a lightbox/dialog. Only "Clean Energy Workforce" has full content (from bible's TradesForce section). Others show "Full case study coming soon." New components: `CaseStudyGrid`, `CaseStudyCard`, `CaseStudyLightbox` (uses dialog). |

## New inline components

- **`ComparisonTable`** — 2-column table with JetBrains Mono headers, row borders in hsl system. "Their side" column uses red accent. Stacks on mobile (horizontal scroll or card layout).
- **`MetricsTable`** — Same style as ComparisonTable for the impact measurement slide.
- **`NumberedProblem`** — Bold number + bold title + description text. Red accent on number.
- **`CaseStudyCard`** — Bordered card with case name + short outcome. Red top-border accent. Hover state.
- **`CaseStudyLightbox`** — Full-screen dialog/overlay with the TradesForce case study content. Close on ESC or X button. Styled in our system (dark bg, red accents, Space Grotesk/JetBrains Mono).
- **`SectorBullet`** — Bold sector name + description for Who We Are slide.

## What stays exactly the same
- DeckFrame, scroll-snap, HUD chrome (brackets, scan beam, frame counter, ESC hint)
- useGlitchSFX on frame transitions
- Arrow key + ESC navigation
- StatChip, OptionCard components (reused)
- All typography families, color values, sizing patterns

## What's removed
- Old "The Real Discipline" prose (replaced by hallmarks)
- Old "Three Capabilities" cards (replaced by 6 capabilities)
- Current case study in Frame 6 (moves to post-CTA lightbox)
- TimelineStep component (replaced by phase bullet structure)
- Old "Why This Exists" origin story (replaced by "Who We Are")

## Technical details

### `TOTAL_FRAMES` → 12
(Title, Problem, Opposition, Hallmarks, Capabilities, Impact Measurement, Engagements, Who We Are, Promise, CTA, Case Studies)

### File: `src/pages/Deck.tsx`
Full rewrite of frame content. ~6 new inline components added. Case study lightbox uses React state (`useState`) for open/close + which case is selected. No external dependencies needed.

### No other files change.

