

## Remove Slide 5 (Domains)

### What changes

**`src/pages/Deck.tsx`** — one file, multiple edits:

1. **Delete the DOMAINS constant** (lines ~134–139) and associated state (`selectedDomains`, `activeDomain`, `activeDomainData`)
2. **Delete Frame 5 JSX** (lines 1195–1279) — the entire `DeckFrame ref={setRef(4)}` block
3. **Remove `r5` reveal hook** (line 502) — shift r6→r5, r7→r6, r8→r7, etc. through r12→r11
4. **Renumber `setRef()` indices** — all frames after the deleted one shift down by 1 (Frame 6 becomes `setRef(4)`, Frame 7 becomes `setRef(5)`, etc.)
5. **Update interaction gates** — remove gate 4 (domains), shift gates 5–11 down to 4–10
6. **Update STEP_LABELS** — remove "Domains" from the array
7. **Update scoring input** — remove `selectedDomains` from the `useMemo` that builds the scoring object

**`src/lib/deckScoring.ts`**:

8. **Remove `selectedDomains`** from the input type and the scoring logic (the "all three domains = -5" rule)

**Database submission** (if applicable): Remove `selected_domains` from the CTA submit payload.

### Net result
12-frame deck becomes 11-frame. All numbering, refs, gates, labels, and scoring stay consistent. No domain selection anywhere.

