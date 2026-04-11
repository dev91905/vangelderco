

# Tighten Homepage Layout — TripleTen-style Density

## The Problem

Your homepage has 7 sections. Four of them (`snap-section`) force full-viewport height (`100dvh`) even when their content only needs ~40-60% of the screen. The other three (`snap-section-scroll`) also have `min-height: 100dvh` plus large vertical padding. This creates the "lots of white space" feel.

## The Approach

Keep every component, color, animation, and visual identity. Only change spacing and section sizing so content flows continuously like a dense editorial scroll.

### 1. Remove full-viewport enforcement from most sections

- **Hero**: Keep at `100dvh` — it's the landing moment, should be full-screen
- **Altitude** ("Our Practice"): Drop from `100dvh` to auto-height with moderate padding (~10vh top, ~8vh bottom)
- **Capabilities**: Drop `min-height: 100dvh`, use comfortable padding (~8vh top/bottom)
- **Recent Impact**: Same — auto-height, ~6vh padding
- **Intake CTA**: Drop from `100dvh` to auto-height with ~8vh padding
- **Network**: Auto-height, ~6vh padding
- **Footer**: Drop from `100dvh` to a compact section (~20vh or less)

### 2. Replace snap-scroll classes with flow classes

Create two new utility classes in `index.css`:
- `.section-flow`: No min-height, responsive vertical padding (`py-[8vh]` equivalent)
- `.section-flow-tight`: Even less padding (`py-[5vh]`)

Keep `.snap-section` only for the hero.

### 3. Reduce internal spacing

- Capability cards: reduce `gap-8 md:gap-10` → `gap-5 md:gap-6`
- Section label margins: `mb-16` → `mb-8`
- Network grid: `mt-10` → `mt-6`
- Altitude section: tighten line spacing

### 4. Files changed

| File | Change |
|------|--------|
| `src/index.css` | Add `.section-flow` and `.section-flow-tight` classes |
| `src/pages/Index.tsx` | Swap section classes from snap-section to flow classes, tighten internal gaps |

No component, color, typography, or animation changes. Just density.

