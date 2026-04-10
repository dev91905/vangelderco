

# Quiz Results Redesign — Split Panel + Simplified Cards

## Layout

Two-column layout on desktop. Left column is sticky (stays visible while scrolling). Right column scrolls independently with the detailed breakdown.

```text
┌─────────────────────────────────────────────────┐
│  STICKY LEFT (40%)      │  SCROLLABLE RIGHT (60%)│
│                         │                        │
│  "Your read"            │  ┌── Research ───────┐ │
│  4 of 6 emerging        │  │ You selected: ... │ │
│  approaches identified  │  │ What works: ...   │ │
│                         │  └──────────────────┘ │
│  [summary paragraph]    │  ┌── Content ────────┐ │
│                         │  │ You selected: ... │ │
│  [Retake quiz]          │  │ What works: ...   │ │
│                         │  └──────────────────┘ │
│                         │  ...4 more cards       │
└─────────────────────────────────────────────────┘
```

## Simplified Breakdown Cards

Each card currently has: question number label, dimension title, "Your selection" badge, "What you selected" box, conditional "Emerging approach" box, and "Why this matters" box — 4-6 elements competing for attention.

**Simplified to 3 elements max:**

1. **Dimension title** (e.g. "Research") — bold, prominent
2. **"You selected"** — their answer in a subtle quote style, one line
3. **One explanation block** — content depends on whether they picked nextgen or traditional:
   - **If traditional:** "The shift" — explains what the emerging approach is and why it's gaining traction. No shame, no "wrong." Just: here's what's changing and why.
   - **If nextgen:** "Why this works" — explains why this approach is effective and how it differs from the default.

No badge. No "Question 1" label. No two-column grid inside each card. No nested boxes. Just dimension → your pick → insight.

## Explanation Copy Rewrite

Current explanations are neutral hedging ("The most effective programs do both, but the field is shifting toward the latter"). For $100M donors, each explanation needs to land with specificity:

| Dimension | If picked traditional | If picked nextgen |
|---|---|---|
| **Research** | "The shift: The most effective programs now monitor what's already resonating across platforms — not what people say in a focus group. Real signals come from organic behavior, not controlled environments." | "Why this works: Organic monitoring catches real signals — what people actually share, repeat, and act on — rather than what they say they'd do in a controlled setting." |
| **Content** | "The shift: The other side isn't making documentaries. They're funding thousands of creators producing content around the clock. Volume and velocity are beating polish." | "Why this works: Always-on content keeps narratives alive between campaigns. Creator economies produce at a pace and scale that traditional production can't match." |
| **Distribution** | "The shift: Buying placements rents attention. The most effective operators are buying or shaping the platforms themselves — the algorithms, the editorial direction, the programming." | "Why this works: Owning infrastructure means you influence how attention flows, not just where your ad appears. It's the difference between renting and owning." |
| **Engagement** | "The shift: Influencer reach stays online and often stays inside existing audiences. Institutional organizing — faith, labor, campuses, veterans — builds constituencies that show up offline and in person." | "Why this works: Institutions carry built-in trust and built-in turnout. They don't just amplify a message — they mobilize people who act on it." |
| **Measurement** | "The shift: Reach and impressions measure exposure. The programs that move policy measure who's new to the table and what actually changed. Power, not awareness." | "Why this works: Measuring who's new and what policy moved tells you whether you're building power — not just making noise." |
| **Iteration** | "The shift: Grant-cycle evaluation waits until the money's spent. Mid-cycle iteration kills what's failing in weeks and compounds what's working across years." | "Why this works: Compounding gains across years instead of resetting every grant cycle is how the other side built structural advantages." |

## Technical Changes

### `src/pages/Deck.tsx` — Quiz results section (~lines 790-935)

- Wrap results in `flex-row` with left column `lg:w-[38%] lg:sticky lg:top-0 lg:self-start` and right column `lg:w-[62%]`
- Left column contains: summary card (score headline, paragraph, retake button)
- Right column contains: breakdown cards in a simple vertical stack
- Each card simplified to: dimension title + quoted selection + single explanation paragraph
- Add `traditionalExplanation` and `nextgenExplanation` fields to QUIZ_ROWS (replacing the single `explanation` field), with the copy from the table above
- On mobile, left column stacks above right column normally

