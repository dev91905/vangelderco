
Replace the PDF pipeline entirely. The current export is still built on `html2canvas` screenshots of DOM sections, and that is the real reason the score ring, pills, buttons, and measurement gap blocks keep drifting. You can polish CSS forever and it will still be janky because the export is rasterizing browser layout, transforms, fonts, and subpixel spacing into images.

What I would build:

1. Stop exporting the admin DOM
- Remove the screenshot-based PDF export path from `src/pages/AdminSubmissions.tsx`.
- Do not capture `#diagnostic-report-capture` or `[data-pdf-section]` with `html2canvas` anymore.
- Generate a real PDF from structured data instead of turning HTML into images.

2. Create a dedicated PDF document component
- Add a new PDF-only component, separate from the admin preview, e.g. `src/components/admin/DiagnosticPdfDocument.tsx`.
- Build it with a real PDF renderer so layout is deterministic and vector-based.
- Keep the existing `DiagnosticReport.tsx` for on-screen preview if needed, but stop using it as the export source.

3. Rebuild the design as PDF-native primitives
- Score ring: draw it with actual SVG/circle primitives and center the score text by coordinates, not CSS transforms.
- Pills: rebuild as fixed-height pill rows with explicit padding, vertical centering, and margin-based wrapping.
- Buttons: rebuild as true PDF link buttons with exact height, padding, border radius, centered text, and live links.
- Measurement gaps: replace browser grid behavior with explicit two-column PDF layout using fixed column widths and row spacing so both cards line up perfectly every time.
- Gap cards and section headers: use consistent spacing tokens and fixed vertical rhythm across pages.

4. Make the PDF A4-first instead of browser-first
- Design to the actual PDF page size from the start.
- Set a fixed page grid, margins, column widths, and section spacing for A4.
- Use explicit page structure so nothing important splits awkwardly:
  - Page 1: header, score, strategic analysis, dimension assessment, challenges/sectors
  - Page 2: where to move + gap cards
  - Page 3: measurement gaps, priority practices, CTA
- Mark critical blocks as non-breakable so the measurement section and CTA never tear apart.

5. Embed proper typography for client-facing output
- Register the actual font family/weights used in the report instead of relying on browser-loaded Google fonts during capture.
- Use fixed font sizes, line heights, and weight mapping in the PDF renderer.
- This removes font-load timing drift and text reflow issues.

6. Preserve working links properly
- Render “Book a call” and “Get in touch” as real PDF links, not invisible overlays on screenshots.
- That keeps the links clickable while also keeping the buttons visually precise.

7. Refactor shared report data, not shared rendering
- Reuse the same `DiagnosticData` shape.
- If needed, extract small helpers for score labels/colors so the preview and PDF stay consistent.
- Do not try to share layout code between DOM and PDF components if it compromises fidelity.

Files I would change
- `src/pages/AdminSubmissions.tsx`
  - Replace screenshot export logic with true PDF generation/download logic.
- `src/components/admin/DiagnosticPdfDocument.tsx`
  - New dedicated client-facing PDF document.
- `src/components/admin/DiagnosticReport.tsx`
  - Likely keep for preview only, possibly simplify/remove PDF-specific hacks that no longer matter.
- `package.json`
  - Add the PDF renderer dependency if not already present.

Why this is the right fix
- The problem is not “more inline CSS.”
- The problem is exporting HTML screenshots and expecting print-grade alignment.
- If you want pixel-perfect, premium, client-facing output, the PDF has to be designed as a PDF, not as a screenshot of a web page.

Technical details
```text
Current pipeline:
DOM -> html2canvas -> PNG sections -> jsPDF image placement
Result: transform drift, font drift, spacing drift, blurry text, inconsistent alignment

Target pipeline:
DiagnosticData -> PDF component -> vector/text PDF
Result: exact coordinates, embedded fonts, crisp text, stable alignment, real links
```

Acceptance standard for implementation
- Score numeral and label visually centered in the ring.
- Pills vertically centered and evenly spaced.
- Buttons perfectly centered and proportioned.
- Measurement gap columns aligned to the same top edge, internal rows spaced consistently.
- No raster fuzziness from screenshot scaling.
- “Book a call” and “Get in touch” remain clickable in the final PDF.
- Final PDF reviewed page by page against the premium client-facing standard before delivery.
