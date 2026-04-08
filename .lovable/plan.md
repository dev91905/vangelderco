

# Font System Overhaul — Anthropic Pattern

## Current vs. Target

| Role | Current | Target |
|------|---------|--------|
| Headings/UI | Instrument Serif (serif) | **Inter** (sans-serif) — clean geometric sans, free Google Font closest to Styrene A |
| Body text | DM Sans (sans-serif) | **Source Serif 4** (serif) — warm, readable serif, free Google Font closest to Tiempos Text |

Styrene A and Tiempos Text are licensed commercial fonts. The closest free equivalents that nail the same vibe:
- **Inter** for Styrene A — clean, slightly humanist sans with excellent weight range. Alternative: **Söhne** isn't on Google Fonts either, so Inter is the pragmatic pick.
- **Source Serif 4** for Tiempos Text — warm, traditional serif with great readability at body sizes. It has the same "bookish but modern" character. Alternative: **Libre Baskerville** if you want something rounder.

## What changes

### 1. `index.html` — Swap Google Fonts import
Replace `Instrument+Serif` and `DM+Sans` with `Inter:wght@400;500;600;700` and `Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400`. Remove JetBrains Mono (already dead).

### 2. `src/lib/theme.ts` — Flip the token roles
```
serif = "'Source Serif 4', Georgia, serif"   // body text, quotes, long-form
sans  = "'Inter', system-ui, sans-serif"     // headings, UI labels, buttons
```

Update `heading()` to use `sans` (not serif) and `body()` to use `serif` (not sans). This is the Anthropic inversion — display type is sans, reading type is serif.

Update `label()` and `pill` to keep using `sans` (they're UI elements).

### 3. `src/index.css` — Update body font-family
Change `font-family: 'DM Sans'` to `font-family: 'Source Serif 4', Georgia, serif` as the default body font.

### 4. Every component already imports `t.serif` / `t.sans`
Because the theme system is centralized, this swap propagates automatically. No individual component edits needed — the tokens just point to different fonts now.

## Files modified
- `index.html` — font import URL
- `src/lib/theme.ts` — font family strings + heading/body role swap
- `src/index.css` — body default font

3 files total. The centralized theme system means this is a site-wide change from 3 edits.

