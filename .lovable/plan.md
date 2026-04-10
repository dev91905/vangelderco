

# Dark Mode: Black & White, No Red

## Direction
Strip all red/oxblood from dark mode. Pure black-and-white palette with a slight warm cast to the whites (not cool/blue) to prevent it from feeling clinical. Remove the CRT breathing red glow. Keep scan lines and scan beam as optional texture (they're white, not red), or remove them too for full clean.

## Changes

### 1. `src/index.css` — Dark mode CSS variables
Replace all red-tinted values with neutral white/black:
- `--primary`: `0 0% 90%` (light gray instead of red)
- `--primary-foreground`: `0 0% 5%` (near-black)
- `--destructive`: `0 60% 50%` (keep red only for actual errors/destructive actions — this is semantic, not brand)
- `--ring`: `0 0% 40%` (neutral gray ring)
- `--sidebar-primary`: `0 0% 90%`
- `--sidebar-ring`: `0 0% 40%`
- `--accent-h/s/l`: `0, 0%, 60%` — accent becomes a medium gray, no color

### 2. `src/components/CRTOverlay.tsx`
Remove the breathing red glow div entirely. Keep scan lines + scan beam (they're already white) as subtle texture — or remove those too if you want fully clean.

### 3. `src/index.css` — `pill-glow` keyframes
Update the `.dark` pill-glow animation to use white/gray instead of `--destructive` (red). Network section pills glow white on hover instead of red.

### 4. Update memory files
- Update `mem://design/dark-mode` to reflect the new black & white palette
- Update `mem://design/accent-opacity` to note accent is now neutral in dark mode

### What stays
- Light mode is completely unchanged (warm cream + gold)
- The dark mode background (`0 0% 2.5%`) and surface hierarchy stay the same
- `--destructive` remains red for semantic error states only (delete buttons, validation errors) — that's UX convention, not brand

### Files touched
- `src/index.css` (CSS variables + pill-glow keyframes)
- `src/components/CRTOverlay.tsx` (remove red glow)
- Memory files (2)

