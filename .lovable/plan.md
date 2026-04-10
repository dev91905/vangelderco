

## Fix Field Notes Sticky Header in Dark Mode

### Problem
The sticky header on line 450 uses a `linear-gradient` from `hsl(var(--background))` to transparent. In dark mode, this creates an obvious solid black rectangle floating over the CRT scanline overlay — it doesn't blend because scanlines sit behind it and the opaque gradient block is clearly visible.

### Solution
Remove the gradient background entirely from the sticky header. Instead, make it non-sticky (or use `backdrop-filter: blur()` so the scanlines bleed through naturally). The simplest fix that preserves the "Field Notes" label anchored at the top of the section:

1. **Drop `sticky top-0`** — make the label just a normal static element at the top of the section. It's a small label; it doesn't need to stick.
2. **Remove the gradient `background` style** entirely.
3. Keep the padding and layout otherwise identical.

This eliminates the floating black box completely in both modes.

### File changes
- **`src/pages/Index.tsx` line 450** — Remove `sticky top-0` classes and the `style={{ background: "linear-gradient(..." }}` prop from the Field Notes header `div`.

