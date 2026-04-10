

## Sharpening the Card Body Copy

Updating only the `detail` field for each of the five pain-point cards. Headlines (`short`) stay the same. Character counts stay within ±15 of originals so card heights don't shift.

### Current → New

| # | Headline | Current `detail` | New `detail` |
|---|----------|-------------------|--------------|
| 1 | I'm just getting started | "You're building a strategic communications portfolio from scratch — no track record of what's been funded or what's working." (122 chars) | "You're new to this role or building from scratch. There's no system, no process — just a mandate and a blank slate." (115 chars) |
| 2 | We don't have a strategy | "You've got a landscape but no framework. When a proposal lands, you can't tell if it fits a strategy or just sounds good." (121 chars) | "You have a portfolio but no decision-making framework. When a proposal lands, you can't tell if it's genuinely strategic or just sounds good." (141 chars) |
| 3 | Limited access to pop culture | "Your grantees recycle the same playbook — op-eds, paid media, social. The most powerful cultural channels stay untapped." (120 chars) | "Your grantees keep running the same plays — op-eds, paid media, social. The deeper cultural channels that actually move people stay untapped." (141 chars) |
| 4 | Not sure how to measure | "Grantees send views and impressions. Other donors tie funding to impossible benchmarks. You need to tell the real impact story." (125 chars) | "Grantees report views and impressions. The numbers look fine — but you don't feel real impact, and you're not sure what better looks like." (137 chars) |
| 5 | No media expertise in-house | "You're not a media expert. When something isn't working, you can't diagnose why — you've never operated in these sectors." (120 chars) | "When leadership asks what's broken or whether a pitch is worth it, you lack the operational media experience to give a real answer." (130 chars) |

### What changes and why

1. **Just getting started** — Captures "new to role OR tasked with building something new" and the feeling of no system/process/ethos. Blank slate, not just "no track record."
2. **No strategy** — Shifts from "landscape" to "portfolio" (more accurate for donors who already have one) and zeroes in on the real pain: you can't tell if something is *genuinely* strategic or just sounds good.
3. **Limited access** — Swaps "most powerful cultural channels" for "deeper cultural channels that actually move people" — gets at the user's point that nothing the grantees do is resonating.
4. **Not sure how to measure** — Removes the "other donors / impossible benchmarks" framing (too specific). Focuses on the core feeling: numbers look fine on paper but you don't feel impact and don't know what to ask for instead.
5. **No media expertise** — Reframes from "you're not an expert" (slightly condescending) to "leadership is asking you questions you can't answer" — the actual lived pain.

### Implementation

Single file edit: `src/pages/Deck.tsx`, lines 36–70, replacing the five `detail` strings.

