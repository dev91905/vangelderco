

## Fix PDF rendering — replace html2canvas-hostile CSS patterns with bulletproof alternatives

### Problems identified from the PDF

Looking at the actual output:

1. **`gap` property still broken** — converting Tailwind `gap-2` to inline `gap: "8px"` changes nothing for html2canvas. It's the CSS `gap` property either way, and html2canvas handles it poorly. Pills bunch together or space unevenly.

2. **Pills use `display: inline-block`** — this doesn't vertically center text within the pill. Need `inline-flex` with `alignItems: center` and explicit `height`/`lineHeight`.

3. **CSS custom properties not resolving** — `t.ink(0.5)` returns `hsl(var(--ink-h) var(--ink-s) var(--ink-l) / 0.5)`. html2canvas has known issues resolving CSS custom properties. Colors may render incorrectly or fall back to black/transparent.

4. **Lucide React SVG icons** — `<CheckCircle2>`, `<XCircle>`, `<ArrowRight>`, `<TrendingUp>` render as complex React SVG trees. html2canvas can misposition or missize these.

5. **Score ring flex overlay** — despite the fix, the absolute-positioned flex overlay on the SVG ring can still shift in html2canvas.

### The fix — three systematic changes in `DiagnosticReport.tsx`

**1. Kill all `gap` usage — use `marginRight`/`marginBottom` on children instead**

Every `gap: "8px"` becomes explicit margin on each child element. This is the only spacing method html2canvas reliably handles.

**2. Hardcode all colors — no CSS custom properties**

Replace every `t.ink(alpha)` call with a hardcoded `rgba()` value. The PDF component renders on a warm ivory background, so we use `rgba(28, 25, 23, alpha)` (warm black matching the design tokens). Replace `t.cream`, `t.sans` etc. with literal values. This component is PDF-only — it doesn't need to respond to theme changes.

**3. Replace Lucide components with inline SVG paths**

Instead of `<CheckCircle2>` etc., use simple `<svg>` elements with hardcoded paths. This eliminates React component rendering issues in html2canvas.

**4. Pills: `inline-flex` with explicit height and centering**

```
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
height: "28px",
```

**5. Score ring: hardcoded absolute positioning with px offsets**

Instead of flex centering inside the absolute overlay, position the text with explicit `top`/`left`/`transform: translate(-50%, -50%)` which html2canvas handles more reliably than flexbox.

### No other files change

Only `src/components/admin/DiagnosticReport.tsx`. The export logic in AdminSubmissions stays as-is.

