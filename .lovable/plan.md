

# Hover Effect Redesign — CONTROL / HALO Style

## What's Wrong Now
- Glow is too bright/wide (you want it reverted)
- Scan line sweeps to `left: 100%` of the full-width container, not the text — so it overshoots on shorter labels and stops exactly at the edge on longer ones
- The overall effect feels more "cyberpunk terminal" than CONTROL/HALO

## CONTROL's Menu Language
CONTROL's UI is bureaucratic and paranormal. Menu items don't have flashy sweeps. They have:
- A quiet **red tint wash** that fills behind the selected item — like a classified document being highlighted
- A solid **red left-edge bar** (2-3px) that appears instantly
- Text brightens slightly
- Everything else stays still. The power is in the restraint.

## New Hover Effect
On hover, each link gets:
1. **Red left bar**: 2px solid red accent appears at the left edge of the text (not the container), `opacity 0→1`, no animation delay — instant like a selection indicator
2. **Background wash**: A very faint horizontal band of red (`hsl(0 80% 48% / 0.04)`) fills behind the text area — like a row being selected in a classified system
3. **Text brightens**: White goes from `0.9` to `1.0` opacity
4. **No caret, no scan line, no underline, no glow orb** — remove all of those

This is simpler, more CONTROL, and eliminates the scan-line-width inconsistency entirely.

## Files to Modify

### `src/pages/Index.tsx`
- Remove: glow span, scan-line span, caret span, underline span
- Simplify link internals to just the text with a left-border that appears on hover
- Add a background wash element (single span, `absolute inset-0`)

### `src/index.css`
- Rewrite `.hero-nav-link:hover` rules: left-border opacity, background wash, text color
- Remove all scan/glow/caret/underline hover rules

