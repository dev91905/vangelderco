

## Fix PDF page breaks — section-based capture instead of image slicing

### The problem

The current approach captures the entire report as one tall image, then slices it at fixed pixel intervals. This cuts content mid-section (the measurement gaps table gets split across pages) and leaves page 2 mostly blank.

### The fix

Switch to **section-based capture**: mark logical sections with `data-pdf-section`, capture each independently with `html2canvas`, and place them on PDF pages with intelligent overflow handling — if a section doesn't fit on the current page, start a new one.

### Technical details

**`src/components/admin/DiagnosticReport.tsx`**

Add `data-pdf-section` attributes to 7 logical blocks:
1. Header + ScoreRing
2. Executive Summary
3. 5-Dimension Assessment
4. Self-Identified Challenges + Sectors (small, group together)
5. "Where to Move" heading + Gap Cards
6. Measurement Gaps (the two-column tracked/missing grid)
7. Priority Practices + CTA

**`src/pages/AdminSubmissions.tsx`** — rewrite `handleExportPdf`:

```
- Find all [data-pdf-section] elements inside the report
- For each section:
  - Capture with html2canvas at 2x scale
  - Calculate its height in mm relative to A4 width minus margins
  - If it doesn't fit on the current page, add a new page
  - Place the image, advance the Y cursor
- Save the PDF
```

This ensures no content is ever cut mid-section, and pages break at natural boundaries. The measurement gaps grid stays intact, and there's no wasted blank space.

