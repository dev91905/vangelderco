

# Design Polish — Sitewide Refinement

After reviewing every component and page, here's what reads as janky or unfinished, and the fixes.

## Issues Found

1. **NotFound page is completely off-brand** — default light-background Tailwind styles, no atmospheric treatment, generic "Oops!" copy
2. **PasswordGate has a stale breathing glow** with the old `0.25` opacity / `70%` hard cutoff (was fixed in AtmosphericLayout but not in the PasswordGate copy)
3. **Inconsistent spacing and font weights** — `font-bold` on password gate title vs `font-medium` everywhere else
4. **PostCard hover state is crude** — background jump from `hsl(0 0% 4%)` to `hsl(0 0% 6%)` with no other feedback; the left border accent doesn't respond
5. **CRT boot animation on sub-pages is distracting** — the 0.5s flicker felt "techy" with the constellation, but without it the content just blinks awkwardly on entry
6. **Hero link clip-reveal has a 0.8s+ delay** — with no constellation animating underneath, the page feels dead for almost a full second before text appears
7. **Content body paragraphs** are slightly small and tight (`13px`) — fine on desktop, feels cramped on mobile
8. **Capability page description text** at `12-13px` mono is hard to read at length
9. **PasswordGate lock icon uses rounded-full** — conflicts with `--radius: 0rem` (everything else is sharp corners)

## Changes

### 1. `src/pages/NotFound.tsx` — Complete restyle
- Match the atmospheric brand: dark background, Space Grotesk heading, JetBrains Mono body, red accent
- Wrap in `AtmosphericLayout`
- "Signal Lost" / "Route not found" language instead of "Oops!"
- Return link styled like other back-links

### 2. `src/components/PasswordGate.tsx` — Polish
- Fix breathing glow gradient to match AtmosphericLayout's multi-stop version
- Change `font-bold` → `font-medium` on title (consistency)
- Lock icon container: `rounded-full` → remove border-radius (sharp corners to match `--radius: 0rem`)
- Tighten the button's conditional styling for cleaner transitions

### 3. `src/components/PostCard.tsx` — Refined hover
- Add left-border color transition on hover: `hsl(0 80% 48% / 0.5)` → `hsl(0 80% 48% / 0.9)`
- Add subtle `translateX(2px)` on the title on hover (mirrors the hero nav behavior)
- Add `transition` to the border-left via inline style

### 4. `src/components/CapabilityLayout.tsx` & `src/components/casestudy/CaseStudyView.tsx` & `src/components/blog/BlogPostView.tsx` — Replace crt-boot with clean fade
- Replace `crt-boot 0.5s` with a simple `fade-up 0.5s ease-out` — the flicker without the constellation just looks broken
- Slightly increase body paragraph size: `13px/14px` → `14px/15px`

### 5. `src/pages/Index.tsx` — Tighten boot timing
- Reduce hero link initial delay from `0.8s` to `0.4s` — no constellation to wait for anymore
- Reduce sector tags delay from `2.4s` to `1.6s`
- Reduce "By Referral Only" delay from `3.0s` to `2.0s`

### 6. `src/components/content/ContentBlockRenderer.tsx` — Typography bump
- Paragraphs: `13px/14px` → `14px/15px`
- Improve line-height from `1.9` to `2.0` for better readability
- Quote text size stays the same (already larger)

### 7. `src/index.css` — Minor cleanup
- Reduce CRT scanline opacity from `0.025` to `0.015` — currently visible as horizontal banding on some monitors

## Files touched
7 files, CSS/class-level changes only. No structural or data changes.

