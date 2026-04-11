

# Overhaul: Diagnostic Report — From Wall of Text to Two-Page Visual Insights Report

## What's Wrong Now

The current report is a markdown dump: 6 numbered sections of bullet lists, repeated copy from the quiz, and a raw text blob rendered via `dangerouslySetInnerHTML`. It reads like a data export, not a deliverable. For $100M+ donors, this is embarrassing.

## The New Report: Two Sections, Two Pages

### Page 1 — "Your Strategic Position"
A visual scorecard that shows the user where they stand at a glance.

- **Header bar**: Name, org, date, readiness score as a large circular gauge (0–100) with severity color
- **5-Dimension Radar/Bar Chart**: Visual comparison showing which of the 5 dimensions (Strategy, Content, Distribution, Engagement, Measurement) they picked advanced vs. conventional — rendered as a horizontal bar chart with "conventional ← → advanced" axis, filled bars colored by pick
- **AI-Generated Executive Summary** (3-4 sentences): The connective paragraph, but upgraded — the AI now also references competitor/opponent funding patterns and suggests where the gaps create strategic exposure. Prominently placed in a styled callout box
- **Pain Points**: Compact chips/tags showing what they identified, not bullet paragraphs

### Page 2 — "Where to Move"
Actionable, concise recommendations tied to their specific gaps.

- **Priority Gaps** (only the dimensions where they picked conventional): Each gets a tight card with the dimension name, what they chose, what the shift looks like, and one concrete recommendation. No bullet walls — 2-3 lines max per card
- **Measurement Gaps**: Visual split — what they track vs. what they're missing — shown as two columns with check/x icons
- **Selected Practices**: Compact cards for what they want to work on
- **Next Steps CTA**: Clean contact block

## AI Enhancement

The edge function prompt gets a major upgrade. Instead of one connective paragraph, the AI generates:
1. **Executive Summary** (3-4 sentences) — connects patterns across dimensions, references how opponents/competitors fund in these areas, identifies the strategic exposure
2. **Per-gap recommendation** (1 sentence each) — for each conventional pick, a specific actionable insight about what competitors are doing differently

This uses the same Lovable AI gateway, just a richer prompt with structured output via tool calling.

## Visual Design (React Component)

The report renders as a styled React component within AdminSubmissions — not raw markdown. Two distinct page sections with:
- Clean card layouts with the warm sand/ivory palette
- The horizontal bar chart for dimensions rendered as pure CSS (no charting library needed)
- Readiness score as a large styled number with color-coded ring
- Generous whitespace, Inter typography, tight information density
- `print` CSS media query so Cmd+P produces clean two-page output
- The PDF export edge function will also be rewritten to match this layout

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-diagnostic/index.ts` | Rewrite to return structured JSON (not markdown). AI generates executive summary + per-gap recommendations. Richer prompt referencing competitor funding patterns |
| `src/components/admin/DiagnosticReport.tsx` | **New** — Visual two-page report component with scorecard, bar chart, gap cards, measurement split |
| `src/pages/AdminSubmissions.tsx` | Replace markdown render with `<DiagnosticReport>` component. Pass structured data |
| `supabase/functions/export-diagnostic-pdf/index.ts` | Rewrite PDF builder to match the new two-page visual layout |
| `src/lib/deckScoring.ts` | No changes needed — scoring logic stays |

## Data Flow

```text
AdminSubmissions → invoke("generate-diagnostic") 
                 → returns { sections: { executive_summary, dimension_results[], gap_recommendations[], ... } }
                 → <DiagnosticReport data={sections} contact={contact} />
                 → still cached as JSON string in report_cache column
```

The `report_cache` column already stores text — we'll store JSON.stringify'd structured data instead. No migration needed.

