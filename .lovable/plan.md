

# Quiz Audit: Strategic Analysis + Rewrite Plan

## The Core Problem

The quiz is broken at a conceptual level. Here's the full breakdown.

---

## 1. The Scoring Logic Contradicts the Results Copy

**The bug:** Picking "theirs" (the next-gen/correct answer) *lowers* the readiness score by 8 points per pick. Lower score = "more gaps" = "hotter lead."

But the results page *celebrates* picking next-gen: "6 of 6 next-gen instincts" with copy like "You're thinking ahead of the curve."

So someone who aces the quiz gets told they're great — but their backend score says "Critical: full diagnostic needed." If you ever surface this score or use it in sales conversations, it will directly contradict what the user was shown. This is the "conflicting answers" problem you flagged.

**Fix:** Flip the scoring. Picking "theirs" (next-gen) should *raise* readiness, not lower it. Picking "yours" (traditional) should lower it. Someone who picks all traditional answers is the one with gaps.

---

## 2. The Quiz Options Are Rigged — Not a Real Assessment

Every "yours" (traditional) option is written with contempt baked in:
- "...a documentary that nobody sees"
- "...a 3-second scroll-by counts as a 'view.' No one remembers it"
- "...Declare success when the grant period ends. Say you need more money... Repeat."
- "...influencers to post scripted content that reaches audiences who already agree"

No $100M donor is going to pick these. They're written to be obviously wrong. The quiz isn't testing instinct — it's a loaded question with a pre-selected answer. That means:
- You learn nothing about the prospect's actual gaps
- The prospect feels patronized, not diagnosed
- Everyone gets roughly the same score

**Fix:** Rewrite both options as *genuinely defensible* approaches. The traditional option should sound like what a smart, well-intentioned program officer would actually say. Make it a real choice. The "next-gen" option should sound better *if you know what you're looking for* — but not obviously so.

---

## 3. The Results Use Shame Language

- "Why this was wrong"
- "Your portfolio needs work"
- "You picked the traditional answer" (as a negative badge)

For a $100M+ donor audience, this is a deal-killer. You don't tell the person writing the check that they failed a test. You educate them.

**Fix:** Remove right/wrong framing entirely. Replace with insight framing:
- "Here's what most portfolios do" vs. "Here's what's working now"
- "The gap" — a neutral description of the delta
- No badges that say "wrong" or "traditional" — frame everything as "where the field is vs. where the field is going"

---

## 4. The Question Framing Is Confused

Currently there are two modes based on `isFreshStart`:
- Fresh: "Which approach sounds more effective?"
- Experienced: "How does your current portfolio work?"

These produce fundamentally different data. One tests judgment, the other tests self-reporting. But they feed into the same scoring engine and results page. The results copy tries to paper over this with conditional text, but the underlying issue remains.

**Fix:** Use one universal framing: **"Which of these two approaches do you think is more effective?"** This works for everyone. Fresh-start people are showing their instincts. Experienced people are revealing their assumptions. Both are diagnostic. Both produce the same type of data: *what does this person believe works?*

---

## 5. Full Copy Inventory + Rewrites

### Question header (universal, all users)
**Current:** "Which approach sounds more effective?" / "How does your current portfolio work?"
**Proposed:** "Two approaches to [dimension]. Which do you think is more effective?"

### Sub-header
**Current:** "Two communications approaches to [dimension]. Pick the one you think works better."
**Proposed:** "Both are used by major funders. Pick the one you'd bet on."

### Quiz options — rewritten to be genuinely competitive

| Dimension | Traditional (rewrite) | Next-Gen (rewrite) |
|---|---|---|
| **Research** | Commission message testing, focus groups, and polling before launching. Ground your strategy in data before you spend. | Monitor what's already resonating organically across platforms and communities. Let the market tell you what works. |
| **Content** | Fund high-quality media — documentaries, explainers, investigative journalism. Invest in credibility and production value. | Fund creator economies and round-the-clock digital content. Prioritize volume, velocity, and constant presence over polish. |
| **Distribution** | Buy targeted placements on major platforms. Optimize for reach and frequency through paid media. | Invest in owning or shaping the platforms and channels themselves — editorial direction, algorithms, programming. |
| **Engagement** | Partner with trusted voices and influencers who can extend your message to aligned audiences. | Organize through institutions — faith communities, campuses, labor, veteran networks — that have built-in trust and show up offline. |
| **Measurement** | Track reach, impressions, media mentions, and awareness. Build the case that your message is getting out there. | Track who's new to the table, what policy moved, and what infrastructure outlasts the campaign. Measure power, not exposure. |
| **Iteration** | Evaluate at the end of the grant cycle. Report results, identify learnings, and apply them to the next proposal. | Cut what's failing mid-cycle. Double down on what's working. Compound gains across years, not grant periods. |

### Results header
**Current:** "Here's what your answers say."
**Proposed:** "Here's what your answers tell us."

### Results summary copy (by score band)
**Current uses "next-gen instincts" and "your portfolio needs work."**
**Proposed:**

- **5-6 next-gen picks:** "You're already thinking the way the most effective programs operate. The question is whether your portfolio is executing at this level — or whether the gap is between what you know and what you're funding."
- **3-4 next-gen picks:** "You spotted some of the shifts that are reshaping the field. The areas where you picked the traditional approach are exactly where most portfolios have blind spots — and where your opponents are operating differently."
- **0-2 next-gen picks:** "The approaches you gravitated toward are what most programs default to. They're not wrong — they're just not what's working anymore. The other side has moved on. This diagnostic will show you exactly where."

### Per-question result card
**Current:** "Why this was right" / "Why this was wrong"
**Proposed:** "Why this matters" — same explanation text, neutral framing. Show both options side by side with "You selected" highlighted, and a one-line takeaway underneath.

---

## 6. Scoring Fix

```text
CURRENT: score -= opponentPicks * 8  (picking next-gen = penalized)
FIXED:   score -= traditionalPicks * 8  (picking traditional = penalized)
```

Also rename the internal values from `"yours"` / `"theirs"` to `"traditional"` / `"nextgen"` for clarity. This cascades through `QuizAnswer`, `deckScoring.ts`, all quiz state, and the results rendering.

---

## Implementation Plan

### File 1: `src/lib/deckScoring.ts`
- Rename `"yours" | "theirs"` to `"traditional" | "nextgen"` in `QuizAnswer`
- Flip scoring: penalize `"traditional"` picks, not `"nextgen"`

### File 2: `src/pages/Deck.tsx`
- Rewrite all 6 `QUIZ_ROWS` with the balanced copy above
- Change `"yours"` / `"theirs"` references to `"traditional"` / `"nextgen"` throughout
- Update question header to universal framing
- Rewrite results summary copy (all 3 score bands, both fresh/experienced variants → single universal set)
- Replace "Why this was right/wrong" with "Why this matters"
- Remove the "You picked the traditional answer" / "You picked the next-gen answer" badge — replace with neutral "Your selection" highlight
- Remove `isFreshStart` branching in quiz question copy (keep it only where it genuinely changes the experience)

### File 3: `src/pages/Deck.tsx` (intake summary on CTA slide)
- Update the quiz result summary line from "Picked opponent's approach X / 6 times" to something like "Identified X / 6 emerging approaches"

