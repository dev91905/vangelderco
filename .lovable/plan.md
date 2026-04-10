

# Fix Intake CTA Copy

## Problem
The current intake CTA section is generic and lifeless:
- "Five minutes" appears twice (chip + headline)
- "Five minutes. One walkthrough. See if there's a fit." — passive, says nothing about the agency or the value of doing the intake
- Timer icon + "Five minutes" chip frames this as a time commitment, not an invitation

## Copy rewrite

**Chip** (small uppercase label above headline):
- Current: `Five minutes` with timer icon
- New: `Strategic Diagnostic` (no timer icon — remove the time-cost framing entirely)

**Headline** (the big serif line):
- Current: `Five minutes. One walkthrough. See if there's a fit.`
- New: `Find out what your opponents already know about you.`

This hooks directly into the quiz reveal from the deck — the confrontation data. It's specific to this agency's value prop and creates genuine curiosity. It implies stakes.

**Subhead** (the smaller paragraph):
- Current: `A guided intake that helps us understand your situation — and shows you how we think about it.`
- New: `A short diagnostic that benchmarks your communications strategy against the opposition — and shows you exactly where the gaps are.`

This tells the prospect what they'll actually get: a benchmark, a comparison, concrete gaps identified. Not "helps us understand your situation" (which centers the agency, not the prospect).

**Button text** stays `Let's see →` — that's fine, low-commitment and confident.

## Files to change
- `src/pages/Index.tsx` — lines 519–544, three text changes + remove Timer import if unused elsewhere

