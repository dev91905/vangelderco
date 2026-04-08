

# Slide 2 Overhaul — Multi-Select Diagnosis

## What changes

### 1. Multi-select instead of single-select
Change `selectedPain` from `string | null` to `string[]`. Users can toggle multiple pain points on/off. All downstream references update accordingly — anywhere that reads `selectedPainData` will read the array instead (e.g. "You said: X, Y, Z" instead of "You said: X").

### 2. Reframed copy
- Heading: "What's getting in the way?" (shorter, more direct)
- Subhead: "These are the most common challenges we see in stratcomm portfolios. Select everything that resonates."
- Skip hint updated to "→ or skip and keep scrolling"

### 3. Rewritten pain points (uniform length, ~15-20 words each for `detail`)

| # | Current short | New short | New detail |
|---|---|---|---|
| 01 | No institutional memory | No portfolio history | Nobody tracks what was funded, what worked, or why. Every new hire starts from scratch. |
| 02 | No decision framework | No way to evaluate proposals | No rubric for what to fund next. The default is inertia — renew what's familiar. |
| 03 | No access beyond usual channels | Locked into the same channels | The portfolio runs on op-eds, paid media, and docs. Entire cultural sectors sit untouched. |
| 04 | No real measurement | Measuring the wrong things | Grantees report views and impressions — or try to claim credit for policy wins that aren't attributable. |
| 05 | No media fluency in-house | No media experience on staff | When leadership asks why the strategy isn't landing, nobody in the room has ever worked in media. |

All details land at roughly the same character count (~85-100 chars). Consequence and capRelevance strings stay but get tightened to match.

### 4. Downstream multi-select references
Everywhere the deck currently says `selectedPainData.short` or references the single selection, it'll join the array: e.g. "You flagged: No portfolio history, Measuring the wrong things" — or show nothing if empty. The branching logic (showing capRelevance per domain) will show the most relevant match from the selected set.

## Files modified
- `src/pages/Deck.tsx` — state type change, PAIN_POINTS content rewrite, slide 2 copy reframe, all downstream `selectedPain`/`selectedPainData` references updated for array

