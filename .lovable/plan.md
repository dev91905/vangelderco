
Root cause

- The previous fixes only changed snap behavior. That was not enough.
- Slide 9 is still structurally wrong on mobile: the desktop two-column results view collapses into one long vertical stack (`grid-cols-1`), so the actual detailed results cards are pushed far below the fold.
- The results column only gets a bounded height at `lg`, so on phones it expands into the page instead of behaving like a visible results panel.
- The fixed bottom nav is also stealing viewport height on slides 9 and 10, making the results and CTA/form feel hidden or skipped.

Implementation

1. Keep mobile deck snapping at `y proximity` in `src/pages/Deck.tsx`.
   - Do not go back to `mandatory`.
   - Do not remove snapping entirely.

2. Rebuild slide 9 mobile layout in `src/pages/Deck.tsx`.
   - Keep the current desktop two-column layout as-is.
   - Under `lg`, stop stacking the summary block and full results list as one long page.
   - Render a compact score/grade summary first, then a bounded results panel that is visible immediately in the first viewport.
   - Give that mobile results panel an explicit height based on available viewport space and `overflowY: auto`.

3. Fix frame spacing in `src/components/deck/DeckFrame.tsx`.
   - Reduce mobile top/bottom padding.
   - Add safe bottom spacing that accounts for the fixed mobile nav so content is not hidden under it.

4. Tame the fixed bottom nav for mobile on slides 9 and 10.
   - Remove or minimize the big “continue” chrome on those frames so it stops covering content and encouraging accidental skips.
   - Keep navigation consistent, but stop wasting critical vertical space where the content is already dense.

5. QA after implementation
   - 390x844: slide 2 scrolls, slide 9 shows real results immediately, slide 10 form is fully reachable.
   - 768x1024 and 834x1194: same checks.
   - Confirm deck still snaps between frames and no longer behaves like one continuous page.

Files to update

- `src/pages/Deck.tsx`
- `src/components/deck/DeckFrame.tsx`

Technical detail

```text
Why the current version fails:

Mobile slide 9 today
[summary card]
[preview copy + CTA]
[results cards far below fold]
[fixed nav covering bottom]

What it needs to become
[compact summary]
[visible results panel]
[internal results scrolling]
[non-obstructive nav]
```

This is why the earlier snap-only fixes failed: the real problem is now mobile layout and viewport allocation on slide 9, not just scroll snapping.
