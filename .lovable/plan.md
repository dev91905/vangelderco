

# Warm Up Dark Mode — Anthropic-Style Warm Neutrals

## The problem
Dark mode uses `hsl(0, 0%, ...)` across every variable — zero saturation, zero hue. This produces a cold, sterile, "developer tools" gray that feels lifeless compared to the warm cream light mode.

## What Anthropic does
Anthropic uses warm undertones in dark contexts: their near-black backgrounds carry a hint of brown/sand (hue ~30-40, saturation 3-8%), and their light text has warmth too. It feels intentional and editorial, not like a CSS invert.

## The fix
Introduce warm hue (~30) and low saturation (3-6%) into the dark mode CSS variables. This mirrors the light mode's warm tone but at dark-mode lightness levels.

### `src/index.css` — `.dark` block

| Token | Current (cold) | New (warm) |
|-------|----------------|------------|
| `--background` | `0 0% 2.5%` | `30 6% 3%` |
| `--foreground` | `0 0% 93%` | `35 5% 93%` |
| `--card` | `0 0% 5%` | `30 5% 5.5%` |
| `--card-foreground` | `0 0% 93%` | `35 5% 93%` |
| `--popover` | `0 0% 5%` | `30 5% 5.5%` |
| `--muted` | `0 0% 8%` | `30 4% 8%` |
| `--muted-foreground` | `0 0% 50%` | `30 4% 50%` |
| `--secondary` | `0 0% 10%` | `30 4% 10%` |
| `--border` | `0 0% 12%` | `30 4% 12%` |
| `--input` | `0 0% 12%` | `30 4% 12%` |
| `--accent` | `0 0% 10%` | `30 4% 10%` |

Also update the theme bridge tokens:
| Token | Current | New |
|-------|---------|-----|
| `--ink-h` | `0` | `35` |
| `--ink-s` | `0%` | `5%` |
| `--cream-h` | `0` | `30` |
| `--cream-s` | `0%` | `6%` |
| `--card-h` | `0` | `30` |
| `--card-s` | `0%` | `5%` |
| `--accent-h` | `0` | `35` |
| `--accent-s` | `0%` | `5%` |

The gold accent (`hsl(40 50% 57%)`) from your design tokens stays available for classification labels and stat chips — this warm-neutral shift just makes the **base palette** feel alive instead of flat.

### Files touched
- `src/index.css` — dark mode variables only

