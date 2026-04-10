

# Dark Mode with Black & Red CRT Aesthetic

## Overview
Add a toggle in the bottom-left corner that switches between the current warm cream light mode and a dark mode using the original black background + red accent color scheme, with CRT scan lines, a sweeping scan beam animation, and a breathing red glow.

## What Changes

### 1. Dark Mode Context + Toggle
- Create `src/contexts/DarkModeContext.tsx` — a React context with `isDark` state, persisted to `localStorage`.
- Create `src/components/DarkModeToggle.tsx` — a small icon button (sun/moon) fixed to bottom-left corner, z-30.
- When toggled, add/remove class `dark` on `<html>`.

### 2. CSS Dark Mode Variables
In `src/index.css`, add a `.dark` block with the original palette:
- Background: `hsl(0 0% 2.5%)` (near-black)
- Foreground/text: white at varying opacities
- Accent: `hsl(0 80% 48%)` (red) for highlights, active states
- Card/surface: `hsl(0 0% 5%)`
- Border: white at ~8% opacity

### 3. Theme Token Awareness
Update `src/lib/theme.ts` so `ink()`, `cream`, `white`, `border()`, and `surface` read from CSS custom properties rather than hardcoded HSL values. This way the same `t.ink(0.5)` call resolves to dark ink on light backgrounds or light ink on dark backgrounds automatically — **no component changes needed**.

### 4. CRT Overlay (Dark Mode Only)
Create `src/components/CRTOverlay.tsx` — rendered only when `isDark` is true. Contains:
- **Scan lines**: repeating horizontal lines via CSS `repeating-linear-gradient` (2px pitch, ~4% opacity)
- **Scan beam**: a horizontal bar that sweeps vertically on an 8s loop (`@keyframes scan-beam`)
- **Breathing red glow**: a radial gradient centered on screen that pulses opacity on an 8s cycle

All purely CSS, `pointer-events: none`, layered at z-10.

### 5. ConstellationField Dark Adaptation
The constellation field already uses hardcoded `hsla(0, 0%, 100%, ...)` for edges/nodes and red for the northstar. In dark mode it will naturally look correct on the black background. It's currently rendered in `App.tsx` on all routes — no changes needed.

### 6. Integration
- Wrap `<App>` in `DarkModeProvider`.
- Add `<DarkModeToggle />` and `<CRTOverlay />` inside `AppRoutes`.
- The Deck page, blog pages, capability pages, and post cards all use `t.ink()` / `t.cream` — they'll automatically adapt.

### 7. Component-Specific Tweaks
Some components use hardcoded colors (e.g., `AtmosphericLayout`'s admin link, `PostCard` hover handlers). These will be updated to use theme tokens so they respond to the mode switch.

## Files Created
- `src/contexts/DarkModeContext.tsx`
- `src/components/DarkModeToggle.tsx`
- `src/components/CRTOverlay.tsx`

## Files Modified
- `src/index.css` — add `.dark` CSS variables + CRT keyframes
- `src/lib/theme.ts` — make tokens CSS-variable-aware
- `src/App.tsx` — add provider, toggle, overlay
- `src/components/AtmosphericLayout.tsx` — use theme tokens for admin link
- `src/components/PostCard.tsx` — use CSS variables for hover colors

## What Does NOT Change
- Fonts stay the same (Source Serif 4 + Inter)
- Component shapes, border-radius, spacing — untouched
- Deck horizontal frame layout — untouched
- No constellation field changes needed

