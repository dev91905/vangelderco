

## Three changes: hide constellation, slow scan beam, animate "Van Gelder Co." on scroll

### 1. Hide Constellation Field
In `src/App.tsx`, add `"/"` to the `hideConstellation` condition so ConstellationField never renders on the homepage. Actually — re-reading your request, you said "let's hide" the constellation field entirely (it's too busy). I'll hide it on all public pages by removing the `<ConstellationField>` render entirely (or setting `hideConstellation = true` always). 

**Clarification needed**: Do you want the constellation hidden on *all* pages, or just the homepage?

I'll assume **all pages** since you said it's too busy, and it can be re-enabled later.

**File**: `src/App.tsx` — set `hideConstellation = true` unconditionally (or just remove the component render).

### 2. Scan beam: longer pause between sweeps
Currently the scan beam animation is `7s linear infinite` — it sweeps top to bottom in 7s and immediately restarts.

Change the keyframes to sweep in only part of the duration, then hold at an off-screen position for a pause:

```css
@keyframes scan-beam {
  0%   { top: -2px; opacity: 1; }
  40%  { top: 100%; opacity: 1; }
  41%  { opacity: 0; }
  100% { opacity: 0; top: -2px; }
}
```

With the same `7s` duration, the beam sweeps in ~2.8s then pauses ~4.2s before restarting. Same visible speed, longer gap.

**Files**: `src/index.css` — update `@keyframes scan-beam`

### 3. "Van Gelder Co." scroll-driven reposition

**Behavior**: 
- At scroll = 0: "Van Gelder Co." is in its normal hero position (centered, part of the hero content). The fixed top-right "Van Gelder Co." is hidden.
- As user scrolls past ~200px: the hero text fades/shrinks and repositions to the top-right corner (matching the current fixed element's style — 10px, tracking, muted color).
- Scrolling back up reverses the animation.

**Implementation**:
- Remove the existing fixed top-right "Van Gelder Co." element (lines 226-237 in Index.tsx).
- Create a single "Van Gelder Co." element that uses the existing `scrollY` state to interpolate between two positions:
  - **Start state** (scrollY=0): positioned in flow within the hero, centered, `text-[11px] tracking-[0.25em]`, normal hero color.
  - **End state** (scrollY≥300): `position: fixed`, `top: 24px`, `right: 24px`, `text-[10px] tracking-[0.15em]`, muted color (`t.ink(0.3)`).
- Use CSS transforms + transitions for smooth interpolation. The element starts as `position: fixed` from the start but is positioned to match its in-flow location initially using calculated offsets, then transitions to the corner.
- Simpler approach: use a **fixed-position element** throughout, and interpolate its `top`, `right`, `transform`, `opacity`, and `fontSize` based on `scrollY` between 0–300px. At scroll=0 it sits where the hero "Van Gelder Co." would be; at scroll≥300 it's in the corner.

**File**: `src/pages/Index.tsx` — remove the fixed HUD element, add a scroll-interpolated fixed "Van Gelder Co." that starts centered above the hero links and moves to top-right on scroll.

### Technical detail

For the scroll-driven reposition, I'll use a ref on a hidden placeholder in the hero to measure where "Van Gelder Co." naturally sits, then interpolate from that position to `{top: 24, right: 24}` as scroll progresses from 0 to ~300px. This ensures pixel-perfect starting position regardless of viewport.

