

## Rename all "deck" references to "diagnostic"

### Summary
Full rename of every "deck" reference across the codebase — files, folders, components, query keys, DB tables, comments, and UI text.

### Database migration
Rename three tables via a single migration:
- `deck_contacts` → `diagnostic_contacts`
- `deck_case_studies` → `diagnostic_case_studies`
- `deck_submissions` → `diagnostic_submissions`

This uses `ALTER TABLE ... RENAME TO`, which preserves all data, RLS policies, and foreign key references.

### File & folder renames
| Old | New |
|-----|-----|
| `src/pages/Deck.tsx` | `src/pages/Diagnostic.tsx` |
| `src/lib/deckScoring.ts` | `src/lib/diagnosticScoring.ts` |
| `src/components/deck/` | `src/components/diagnostic/` |
| `src/components/deck/DeckFrame.tsx` | `src/components/diagnostic/DiagnosticFrame.tsx` |

### Code changes (all files)
1. **`src/App.tsx`** — Import `Diagnostic` from `./pages/Diagnostic.tsx`, update route element
2. **`src/pages/Diagnostic.tsx`** — Rename component export from `Deck` to `Diagnostic`, update import of `deckScoring` → `diagnosticScoring`, update `DeckFrame` → `DiagnosticFrame`
3. **`src/lib/diagnosticScoring.ts`** — Update type name `DeckDiagnosticInput` → `DiagnosticInput` (keep scoring logic identical)
4. **`src/components/diagnostic/DiagnosticFrame.tsx`** — Rename component and display name
5. **`src/components/diagnostic/CaseCarousel.tsx`**, **`CaseTimelineOverlay.tsx`**, **`TypewriterHeading.tsx`**, **`caseStudyUi.ts`** — Update imports only (no component renames needed)
6. **`src/pages/Admin.tsx`** — Update import path to `diagnosticScoring`, update query keys from `deck-*` to `diagnostic-*`, update table references, update UI text ("deck CTA page" → "diagnostic CTA page")
7. **`src/pages/AdminSubmissions.tsx`** — Same: import path, query keys, table references
8. **`src/pages/Work.tsx`** — Update imports from `deck/` → `diagnostic/`, query keys
9. **`src/pages/Index.tsx`** — Update imports from `deck/` → `diagnostic/`, table references
10. **`src/components/admin/CaseStudyEditor.tsx`** — Update imports and table/query key references
11. **`src/hooks/useAggregatedStats.ts`** — Update table reference and `sourceCapability: "deck"` → `"diagnostic"`
12. **`src/hooks/useImpactStats.ts`** — Update comment
13. **`src/components/ImpactCloud.tsx`** — Update `isDeck` variable name to `isDiagnostic`, check for `"diagnostic"` capability
14. **`supabase/functions/generate-diagnostic/index.ts`** — Update `deck_contacts` → `diagnostic_contacts`
15. **Edge functions redeployed** after changes

### Memory update
Update `mem://constraint/deck-horizontal-frame` to reference "diagnostic" instead of "deck".

