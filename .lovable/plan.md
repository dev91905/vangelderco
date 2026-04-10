

# Quiz Copy Audit — Research & Content Rewrites

## Problems You Identified

### 1. Research: False dichotomy between focus groups and organic listening
The current copy frames it as either/or. In reality, focus groups are still useful for validation — the problem is relying on them *as your primary signal* without also monitoring what's already resonating organically. The deeper issue: most programs test their own messaging against demographic segments, but miss the real psychographic clusters beneath the party labels (collective action, don't-tread-on-me, tough cookie, YOLO). You need organic listening + sentiment analysis to even discover those segments before you can validate with research.

### 2. Content: "The other side isn't making documentaries" — false
They are. The real distinction isn't documentaries vs. creators. It's the *operating model*: high-polish tentpole productions on a campaign cycle vs. always-on volume across investigative journalism AND creators AND everything else. The other side does investigative journalism too — a fuckton of it — plus creators. The gap is velocity and volume, not genre.

### 3. Question framing still says "Two approaches to [dimension]"
Previous plan to rewrite this to "What's your approach to [dimension]?" wasn't implemented yet. Also still says "Quiz results" and "Question X of 6."

## Proposed Rewrites

### QUIZ_ROWS — Research
- **Traditional:** "Run focus groups and message testing to validate your strategy before launch. Ground decisions in structured research."
- **Nextgen:** "Monitor what's already resonating across platforms and communities — sentiment, sharing patterns, organic behavior — then validate with targeted research."
- **traditionalExplanation (The shift):** "Focus groups are useful for validation, but they can't tell you what you don't know to ask. The most effective programs start by listening — tracking what's already moving through culture, what language people actually use, what resonates across psychographic segments that don't map neatly to party labels. Then they validate with research. The order matters."
- **nextgenExplanation (Why this works):** "Starting with organic signals means you discover the real audience segments — not just demographics, but the underlying value systems that drive behavior. Focus groups validate. But you have to know what to test first, and that comes from listening at scale."

### QUIZ_ROWS — Content
- **Traditional:** "Invest in high-quality productions — documentaries, long-form journalism, flagship campaigns. Lead with credibility and production value."
- **Nextgen:** "Fund always-on content across creators, journalists, and digital-first formats. Prioritize volume, velocity, and constant presence alongside quality."
- **traditionalExplanation (The shift):** "The other side isn't choosing between documentaries and creators — they're doing both, all the time. Investigative journalism, creator content, short-form, long-form, around the clock. The gap isn't genre. It's operating tempo. Campaign-cycle productions leave dead air between tentpoles. Always-on presence compounds."
- **nextgenExplanation (Why this works):** "Always-on content across formats — investigative journalism, creators, short-form — keeps narratives alive between campaigns. It's not about choosing volume over quality. It's about maintaining presence at a pace that compounds, instead of going dark between flagship productions."

### Question framing (lines 676-687)
- Headline: `What's your approach to ${dimension.toLowerCase()}?`
- Sub-header: "Pick your approach."
- Results label: "Your strategy read" (not "Quiz results")
- Remove "Question X of 6" from cards

### Step label (line ~435)
- Change "Quiz" to "Strategy" in `STEP_LABELS`

### Retake button text
- Change "Retake quiz" to "Retake assessment" or just "Start over"

## Files Changed

**`src/pages/Deck.tsx`** — All changes in this single file:
- Rewrite Research and Content rows in `QUIZ_ROWS` (lines 46-47) with new options + explanations
- Update headline from "Two approaches to..." to "What's your approach to..." (line 679)
- Update sub-header to "Pick your approach." (line 685)
- Change "Quiz results" label to "Your strategy read" (line 674)
- Remove "Question X of 6" text from dimension label (line 728)
- Change step label from "Quiz" to "Strategy" in `STEP_LABELS`
- Change "Retake quiz" button text to "Start over"

