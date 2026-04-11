

## Fix: Persist diagnostic answers while navigating, reset on close or submit

### Problem
State persistence has gaps:
1. **`saveDeckState` is only called manually** when navigating to `/work` — answers are NOT auto-saved as the user clicks Continue/Back through slides
2. **Close (X button / Escape) doesn't clear state** — so if there IS stale saved state, it incorrectly persists after closing
3. On submit, state is correctly cleared — that's fine

### Result
If a user answers questions, clicks back and forth, then refreshes or navigates away accidentally, their answers are lost. And if they close the diagnostic, stale state from a previous session might resurrect.

### Changes

**`src/pages/Deck.tsx`**

1. **Auto-save on every state change**: Add a `useEffect` that calls `saveDeckState()` whenever any answer state changes. This ensures clicking Continue, Back, or picking answers always persists to `sessionStorage` automatically — no explicit call needed.

```typescript
useEffect(() => {
  saveDeckState();
}, [saveDeckState]);
```

2. **Clear state on Close**: Update the X button's `onClick` and the Escape key handler to clear `sessionStorage.removeItem("deck-state")` before navigating to `/`.

   - X button: `onClick={() => { sessionStorage.removeItem("deck-state"); navigate("/"); }}`
   - Escape handler: same — `sessionStorage.removeItem("deck-state"); navigate("/");`

3. **Keep existing submit clear**: The `handleCtaSubmit` already calls `sessionStorage.removeItem("deck-state")` — no change needed there.

### What stays the same
- All existing state variables and their initialization from `restored`
- The `saveDeckState` function itself (still used by the `/work` navigation)
- Desktop scroll restoration on mount
- Submit flow and thank-you state

