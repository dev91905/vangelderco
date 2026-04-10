

# Fix Homepage: Consistent Widths + Snap Scroll

## Problems
1. **Misaligned widths** — every section uses a different `max-w`: Hero is `max-w-3xl`, Altitude is `max-w-xl`, Capabilities is `max-w-5xl`, Network is `max-w-4xl`, Field Notes is `max-w-6xl`
2. **No snap scrolling** — sections use `minHeight: 100vh` but scroll continuously with no snap behavior

## Changes

### `src/pages/Index.tsx`

**Snap scroll container**: Add `scroll-snap-type: y mandatory` to the outer scroll div (line 246). Each section gets `scroll-snap-align: start` and `height: 100dvh` (not `minHeight`).

**Normalize widths**: Set all section inner containers to `max-w-4xl mx-auto` to match the Network section:
- Hero: keep centered layout, cap at `max-w-4xl`
- Altitude: `max-w-xl` → `max-w-4xl` (content stays left-aligned within)
- Capabilities: `max-w-5xl` → `max-w-4xl`
- Intake CTA: add `max-w-4xl` wrapper
- Network: already `max-w-4xl` ✓
- Field Notes: `max-w-6xl` → `max-w-4xl`
- Footer: add `max-w-4xl` wrapper

**Each section becomes full-screen with snap**:
```
height: 100dvh
overflow: hidden (prevent content bleed)
scroll-snap-align: start
display: flex + items-center (vertically center content)
```

### `src/index.css`

Update `.snap-scroll-container` to enable mandatory snap:
```css
.snap-scroll-container {
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
}
.snap-section {
  scroll-snap-align: start;
  height: 100dvh;
  min-height: 100dvh;
}
```

### Files touched
- `src/pages/Index.tsx` — width normalization + section structure
- `src/index.css` — snap scroll CSS

