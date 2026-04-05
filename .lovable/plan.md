

# Add Admin Link to Bottom of Site

## What
Add a fixed-position "Admin" link at the bottom of every page, matching the exact style of the "Van Gelder Co." top-right label and "< Return" back link — JetBrains Mono, 10px, uppercase, 0.2em tracking, subtle white at 0.18–0.3 opacity, red hover.

## Where
- **`src/components/AtmosphericLayout.tsx`** — add a `<Link to="/admin">` fixed at `bottom-6 right-6`, using the same font/color/tracking as the "Van Gelder Co." span. On hover, shift color to the red accent (`hsl(0 80% 48% / 0.9)`). This puts it on every page automatically since all pages use this layout.

## Style spec
```
font-family: 'JetBrains Mono', monospace
font-size: 10px
letter-spacing: 0.2em
text-transform: uppercase
color: hsl(0 0% 100% / 0.18)
hover color: hsl(0 80% 48% / 0.9)
position: fixed bottom-6 right-6 z-30
transition: color 300ms
```

Text: `Admin` (single word, no arrows or decorators — matches the understated HUD aesthetic).

## Files
- `src/components/AtmosphericLayout.tsx` — add Link import + admin link element before `{children}`

