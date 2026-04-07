

# Replace Deck Content — New Copy, Same Brutalist UI

## What changes

Replace all content in `src/pages/Deck.tsx` with the content from the pasted JSX, while keeping the existing UI system intact: DeckFrame scroll-snap, HUD chrome (corner brackets, scan beam, frame counter, ESC hint), SFX on frame change, red accent palette, Space Grotesk + JetBrains Mono typography.

The deck goes from 13 frames to 11.

## Frame-by-frame content mapping

| # | Label | Content |
|---|-------|---------|
| 1 | — | "VGC StratComm" title + "Strategic communications for donor advisors who need more than comms." + subtitle line |
| 2 | The Problem | "You've invested in paid media, comms firms, op-eds, maybe a documentary. None of it is moving the needle." + Facebook metrics critique |
| 3 | What You're Up Against | Two-column contrast grid: "The Standard Playbook" (6 items) vs "What the Other Side Is Doing" (6 items). New visual component but styled in our system (hsl colors, JetBrains Mono labels, red accent borders) |
| 4 | The Real Discipline | "Strategic communications isn't a media buy..." + "Most donor advisors have access to one or two of these tools..." |
| 5 | Three Capabilities | Three capability cards in a single frame (Cultural Strategy, Cross-Sector Intelligence, Deep Organizing) with full descriptions from the JSX. Styled as bordered cards with red accent. No case examples, no stat chips. |
| 6 | Proof of Concept | Full case study: skilled trades coalition, $59K starting, free concerts via streaming data + voter files. 4 stat chips: "4 CITIES", "11,400 LEADS", "3.2× CONVERSION", "$59K STARTING". Replaces the individual case examples. |
| 7 | How We Work | 4 service rows (Strategy Audit, Partnership Development, Program Design & Management, Intelligence Feed). Uses existing DeliverableRow component. |
| 8 | The First 90 Days | Same timeline steps + NEW Option A/B fork at the bottom: "Option A: Run it yourself" vs "Option B: Ongoing retainer". Fork styled as two side-by-side bordered cards. |
| 9 | Why This Exists | "We spent a decade inside the system..." + two-column layout: left has the three gaps (money/map/people), right has donor advisor paragraph + "We built VGC StratComm to close that gap." |
| 10 | The Promise | "Everything we know becomes everything you know." as hero text + "We're not building a dependency..." + learnable message |
| 11 | — | "VGC StratComm" + "If you're ready to stop spending on comms that don't move anyone — let's talk." + "Get in touch" email link button (styled as bordered uppercase link in our red accent) |

## New visual components (inline, same file)

- **ContrastGrid**: Two-column layout for frame 3. JetBrains Mono labels, hsl borders, red accent on "Other Side" column header.
- **CapCard**: Bordered card for frame 5. Red top-border accent, Space Grotesk title, body text.
- **OptionCard**: Small bordered card for the A/B fork in frame 8. JetBrains Mono label, Space Grotesk title/body.

## What stays exactly the same

- DeckFrame component (unchanged)
- Scroll-snap container, HUD chrome (brackets, scan beam, frame counter, ESC hint)
- useGlitchSFX on frame transitions
- Arrow key + ESC navigation
- StatChip component (reused for proof of concept)
- TimelineStep component (reused)
- DeliverableRow component (reused)
- All typography families, color values, sizing patterns

## What's removed

- "What We Do" triangle SVG frame
- "The Loop" circular SVG frame
- Individual case examples on domain frames
- Pull-quotes on domain frames
- "By referral only" close frame (replaced with CTA + email)

## Technical details

### File: `src/pages/Deck.tsx`
- `TOTAL_FRAMES` changes from 13 to 11
- All frame content rewritten with new copy
- 3 new inline components: ContrastGrid items, CapCard, OptionCard
- StatChip, TimelineStep, DeliverableRow kept as-is
- No other files change

