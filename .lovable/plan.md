

## Fix PDF rendering — eliminate html2canvas alignment issues

### Root causes

1. **ScoreRing misalignment**: The score number/label uses `position: absolute` but its parent container lacks explicit dimensions and positioning context. `html2canvas` interprets this differently than the browser, so the text floats off-center from the circle.

2. **Pills and buttons use Tailwind `gap` and `flex`**: `html2canvas` has known issues with CSS `gap` property and sometimes with Tailwind utility classes that resolve through CSS custom properties. The pills render with inconsistent spacing.

3. **CSS Grid for measurement gaps**: `grid grid-cols-2 gap-4` can render incorrectly in `html2canvas`.

4. **Inconsistent use of Tailwind vs inline styles**: Some layout is Tailwind classes, some is inline. `html2canvas` captures computed styles but can miss class-based layouts in edge cases.

### The fix

Convert **all layout-critical styling in DiagnosticReport.tsx to inline styles** so `html2canvas` gets unambiguous computed values. Specifically:

**`src/components/admin/DiagnosticReport.tsx`**

1. **ScoreRing** — Replace the broken absolute positioning with a single `div` using `position: relative` + `display: flex; align-items: center; justify-content: center`. Place the SVG as `position: absolute` inside, and the text as the natural flex content. This guarantees the number is dead-center in the ring regardless of renderer.

2. **All `className="flex ..."` containers** — Convert to `style={{ display: "flex", alignItems: "center", gap: "8px" }}` etc. Replace every `className` that controls layout (flex, grid, gap, margin, padding) with the equivalent inline style.

3. **All `className="grid grid-cols-2 gap-4"`** — Convert to `style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}`.

4. **All pill `flex-wrap gap-2`** — Convert to `style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}`.

5. **CTA buttons container** — Convert to inline flex with explicit gap.

6. **Remove all Tailwind utility classes** from the component — keep only inline styles. This component exists solely for the admin panel and PDF capture, so Tailwind convenience isn't needed; rendering fidelity is.

### No other files change

The export logic in `AdminSubmissions.tsx` stays as-is. This is purely a rendering fidelity fix in the report component.

