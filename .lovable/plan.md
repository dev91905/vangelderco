
Fix the regression by making the diagnostic state durable for the full tab session and by separating “return to the diagnostic” from browser history.

What went wrong
- The deck only saves state once before leaving for `/work`, then immediately deletes it on restore (`sessionStorage.removeItem("deck-state")` in `src/pages/Deck.tsx:227-230`). That makes the restore one-time instead of session-persistent.
- Slide 10 has no bottom nav because the nav is hidden on the last frame (`currentFrame < TOTAL_FRAMES - 1`), so once you reach the CTA frame there is no visible Back button.
- `/work` currently uses router state plus a `returnLabel: "Back to diagnostic"` override, which is why the label changed.
- `/work` falls back to `navigate(-1)` when no `from` exists, which is exactly the browser-history behavior you said not to use.

Implementation plan
1. Make diagnostic progress persist for the entire tab session
- Keep the deck state in `sessionStorage` until one of two events:
  - the user successfully submits the diagnostic
  - the tab/session ends naturally
- Stop deleting `deck-state` during initial restore.
- Add a small hydration guard so the saved state is loaded once on mount without creating weird re-init behavior.

2. Restore the ability to go back from slide 10
- Show the fixed bottom nav on the CTA slide too, or add an equivalent explicit Back action there.
- Keep the CTA slide editable like every other step, so users can go back to results and earlier answers.
- Ensure `scrollToFrame(currentFrame - 1)` works from frame 9 back to frame 8.

3. Remove the “Back to diagnostic” special label
- Stop passing `returnLabel` from `/diagnostic` to `/work`.
- Revert the `/work` top-left control text to just `← Back` consistently.

4. Make `/work` back behavior explicit and not history-based
- Replace the current logic in `src/pages/Work.tsx`:
  - no `navigate(-1)`
  - no generic browser-history fallback
- Use explicit routing rules instead:
  - if `location.state?.from === "/diagnostic"` and a saved deck session exists, navigate to `/diagnostic`
  - otherwise navigate to `/`
- Apply the same rule when closing a deep-linked case overlay that originated from the diagnostic flow.

5. Only reset after successful submit
- On successful CTA submission in `handleCtaSubmit`, explicitly clear the persisted deck session state.
- Do not clear it when opening `/work`, returning from `/work`, or moving between slides.
- This preserves responses until submit or tab close, exactly as requested.

Files to update
- `src/pages/Deck.tsx`
  - stop deleting saved state on mount
  - keep session state durable
  - restore a Back path from slide 10
  - clear saved state only after successful submit
  - remove `returnLabel` from `/work` navigation
- `src/pages/Work.tsx`
  - change Back button logic to explicit route-based navigation
  - remove browser-history fallback
  - restore generic “Back” label

Expected outcome
- Users can reach slide 10 and still go back to results or earlier slides.
- Going to `/work` from the diagnostic no longer destroys progress.
- Returning from `/work` sends them back into `/diagnostic` only when there is an active saved diagnostic session.
- `/work` no longer depends on browser history and no longer says “Back to Diagnostic.”
