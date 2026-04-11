

# Fix: Quiz Headline Flash Before Slide 4 Transition

## Problem

When the user clicks the last quiz answer, there's an 800ms window where the "Which approach do you gravitate toward?" headline is visible alone (no quiz cards beneath it) before the scroll to Slide 4 fires. 

**Root cause**: After the last answer, `quizStep` is set to `QUIZ_ROWS.length` which hides the quiz cards (`quizStep < QUIZ_ROWS.length` fails), but `quizRevealed` stays `false` so the headline remains visible. The headline sits alone for ~800ms until `scrollToFrame(3)` fires.

## Fix

In `handleQuizPick` (line 487-490 of `Deck.tsx`), hide the heading immediately when the last question is answered by also setting `quizRevealed = true` alongside `quizStep = QUIZ_ROWS.length`. Since `quizRevealed` gates the heading visibility (`!quizRevealed`), setting it to `true` at the same time will hide the headline instantly, preventing the flash.

**One-line addition** at line 489:
```typescript
setQuizStep(QUIZ_ROWS.length);
setQuizRevealed(true);  // ← add this line
setTimeout(() => scrollToFrame(3), 800);
```

This is safe because `quizRevealed` is only checked for header/card visibility on Frame 3 — and is already reset to `false` in the "retake" handler.

| File | Change |
|------|--------|
| `src/pages/Deck.tsx` | Add `setQuizRevealed(true)` after `setQuizStep(QUIZ_ROWS.length)` on line 489 |

