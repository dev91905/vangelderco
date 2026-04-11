

# Full Submission Flow, Admin Panel, and Report Generation — Rebuild

This is a significant rebuild of 3 existing files and 2 edge functions, plus a database migration and admin settings additions.

## What exists today vs. what needs to change

The current system captures most data but is missing explicit storage of unchecked metrics and unselected sectors. The confirmation screen shows "Received ✓" with follow-up language instead of the specified copy. The admin panel has a basic submissions view but lacks status tracking ("Pending review" / "Report sent"), cached reports, and configurable contact email. The report structure doesn't match the spec (missing "The shift" / "Why this works" labels, missing verbatim quiz copy). The PDF generator builds raw PDF from scratch — fragile and ugly.

## Plan

### 1. Database migration
- Add `report_cache` (text, nullable) to `deck_contacts` — stores generated report so it doesn't regenerate every visit
- Add `report_status` (text, nullable, default `'pending'`) to `deck_contacts` — tracks "pending" vs "sent"
- Add `metrics_unchecked` (text array, nullable) to `deck_contacts` — explicitly stored unchecked metrics
- Add `sectors_not_selected` (text array, nullable) to `deck_contacts` — explicitly stored unselected sectors
- Add `contact_email` key support in `site_settings` (no schema change needed, just a new row)

### 2. User submission flow (`src/pages/Deck.tsx`)
- Update `handleCtaSubmit` to explicitly compute and store `metrics_unchecked` (ALL_METRICS minus metricsChecked) and `sectors_not_selected` (all sectors minus selectedSectors)
- Update confirmation screen: heading "Got it.", body "We're putting together a custom diagnostic based on your answers. Check your inbox.", no buttons, just a "Return to site" link pointing to `/`

### 3. Admin settings (`src/pages/Admin.tsx`)
- Add "Contact email" field to the settings modal (stored as `contact_email` in site_settings)
- Booking link and contact email are already configurable — just add the email field

### 4. Admin submissions list (`src/pages/AdminSubmissions.tsx`) — full rewrite
**List view:**
- Each row: full name, organization, email, date submitted, quiz score (e.g. "3 of 5 advanced"), status pill ("Pending review" / "Report sent")
- Sorted most recent first

**Detail view — two columns:**

Left column (Diagnostic Report):
- On first open, check `report_cache` on the contact record. If cached, display it. If not, trigger the AI generation and save result to `report_cache`
- Display the report with the markdown renderer (already exists)
- Report follows the exact 6-section structure from the spec

Right column (Contact & Actions):
- Name, org, email (mailto), submission date, quiz score
- "Export as PDF" button (calls edge function)
- "Copy email" button
- "Mark as sent" button — toggles `report_status` to `'sent'`

### 5. Edge function: `generate-diagnostic` — rewrite prompt
Update the system prompt and user prompt to match the exact report structure:
- **Header**: "Diagnostic Report — [Name] [Org] [Date]"
- **Section 1: Where You Are** — their `selected_pains` answer with framing sentence
- **Section 2: Your Strategic Read** — score display, bucket summary (verbatim), then each of 5 dimensions with: dimension name, which option picked (in italics), "The shift" (conventional) or "Why this works" (advanced) label, approved explanation copy (verbatim bullets). After all 5: ONE short AI-generated paragraph connecting patterns.
- **Section 3: Practices** — selected practice cards with title, rationale, how we help. If none: "No practices selected — we'll discuss priorities on the call."
- **Section 4: Measurement Gaps** — "Not yet measuring" first with framing sentence, then "Currently measuring"
- **Section 5: Sectors of Interest** — selected sectors. If none: "No sectors selected — we'll explore this on the call."
- **Section 6: Next Steps** — configurable email and booking link (fetched from site_settings)

The AI ONLY writes the connective paragraph in Section 2. Everything else is template-driven with approved copy injected directly. This means most of the report is built deterministically in the edge function, not by the AI.

### 6. Edge function: `export-diagnostic-pdf` — complete rewrite
Replace the fragile manual PDF builder with ReportLab (Python) or a robust approach. Since edge functions run Deno, we'll use a cleaner approach:
- Build the PDF using the AI to convert the report into structured blocks (current approach) but with dramatically improved styling
- Alternatively, generate the PDF server-side using a template-driven approach with proper font metrics, margins, and branding
- The current raw PDF builder will be replaced with a much more polished version that handles: branded header with "Van Gelder & Company", proper Helvetica typography with correct sizing hierarchy, generous margins (1 inch), section dividers, bullet formatting, footer with contact info, 2-3 page target

### 7. Remove redundant contacts feed from Admin.tsx
The `ContactsFeed` component at the bottom of the main admin page is redundant with the dedicated submissions page. Remove it to avoid confusion.

## Technical details

**Database changes**: Single migration adding 4 columns to `deck_contacts`. The `report_cache` column avoids regenerating the AI report on every view. The `report_status` column enables the "Pending review" / "Report sent" tracking. Explicit unchecked metrics and unselected sectors columns fulfill the spec requirement to store these explicitly.

**Report generation strategy**: The edge function will build ~90% of the report deterministically using template strings with the approved copy. Only the connective paragraph is AI-generated. This ensures the approved copy is always verbatim and the AI can't hallucinate explanations.

**PDF quality**: The PDF will use the existing minimal PDF builder but with significantly improved text rendering, proper page breaks, branded header/footer, and correct typography hierarchy. Given Deno's constraints, we'll stick with the manual PDF approach but make it production-quality.

**Site settings**: Booking link already exists. Contact email will be added as a new `site_settings` row. Both are fetched by the `generate-diagnostic` function to populate the Next Steps section.

