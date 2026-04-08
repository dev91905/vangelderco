

# Slide 3: Enrich Copy + Design Polish

## The problem

The current `CONFRONTATION_ROWS` copy was over-compressed. Critical insights from the original source material were stripped out:

- **Content**: Lost "investing in digital creator economies where ideology forms in real time" and "funding investigative journalism and developing new media talent" — replaced with a generic "fund creator ecosystems"
- **Distribution**: Lost "acquiring legacy media platforms and changing the programming" — replaced with vague "acquire platforms and change the algorithms"
- **Engagement**: Lost "organizing in churches, veteran groups, and local business networks" specificity
- **Measurement**: Lost "running public polls designed to shift policy baselines"

The "your side" column also lost specificity — the original had concrete items like "fund a documentary," "place op-eds and earned media," "hire influencers," "report impressions as impact."

This slide is supposed to be the "oh shit" moment. Right now it reads like a generic comparison chart.

## What changes

### 1. Rewrite `CONFRONTATION_ROWS` copy (lines 71-79)

Beef up both columns with the insights from the original source material. Each cell gets a full, educational sentence that teaches something specific. The opposition side should feel overwhelming — they're doing things the reader hasn't even considered.

**New rows:**

| Dimension | Your side | Their side |
|-----------|-----------|------------|
| Research | Commission focus groups and test messages before launching a campaign. | Monitor what's already resonating organically across platforms and communities. |
| Content | Produce polished ads, place op-eds, and fund a documentary on a campaign calendar. | Invest in digital creator economies where ideology forms in real time — and fund investigative journalism to develop new media talent. |
| Distribution | Buy placements on platforms and hope the right audiences see them. | Acquire the platforms themselves and change the programming, algorithms, and editorial direction. |
| Engagement | Hire influencers to post scripted content for a single grant cycle. | Organize at scale through churches, veteran groups, campuses, and local business networks — building durable infrastructure. |
| Measurement | Count impressions and media mentions when the grant closes. | Run public polls designed to shift policy baselines and track what's actually moving legislation in real time. |
| Iteration | Declare success when the grant period ends and move to the next proposal. | Cut what's failing mid-cycle, pour resources into what's working, and compound gains across years. |
| Overall | Test messages in a controlled environment, then pay people to watch the winners. | Fund everything, find what catches fire organically, and supercharge it with infrastructure and capital. |

### 2. Design improvements

- **Increase font size** slightly — from `clamp(12px, 1.2vw, 14px)` to `clamp(13px, 1.3vw, 15px)` so the richer copy is readable
- **"Their side" column gets slightly bolder weight** (500 vs 400) to make the opposition feel heavier — reinforcing the asymmetry without color tricks
- **Row padding** bumped slightly to give the longer copy breathing room

## Files modified
- `src/pages/Deck.tsx` — rewrite `CONFRONTATION_ROWS` constant (lines 71-79) and minor style tweaks in the table renderer

