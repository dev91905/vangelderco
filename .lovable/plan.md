

# Van Gelder Co. — Landing Page

Single-viewport brutalist landing page. Dark, atmospheric, no scroll, no interactivity.

## Files to Create/Modify

### 1. `index.html` — Add Google Fonts
Add Space Grotesk and JetBrains Mono via Google Fonts link tags in `<head>`.

### 2. `src/index.css` — Complete Overhaul
- Set CSS custom properties for the design system (near-black bg `hsl(0 0% 2.5%)`, accent red `hsl(0 80% 48%)`)
- Define font families (Space Grotesk, JetBrains Mono)
- Film grain overlay via `body::before` with CSS noise/animation
- CRT scanlines via `body::after` with repeating-linear-gradient
- Breathing red glow keyframes (slow pulse on opacity/scale, ~8s cycle)
- Hero clip-reveal keyframes (clip-path from left)
- Fade-up keyframes for tags and closing line
- Vignette as a fixed radial gradient overlay
- All animations infinite where atmospheric, forwards fill for reveals

### 3. `src/pages/Index.tsx` — Full Replacement
Single component, no scroll (`h-dvh overflow-hidden`), everything centered with flexbox.

**Layout structure:**
```
<div class="full-viewport relative">
  <!-- Atmospheric layers (grain, scanlines, glow, vignette) -->
  <div class="breathing-glow" />  <!-- radial red gradient, pulsing -->
  <div class="vignette" />
  
  <!-- HUD: top-right -->
  <span class="fixed top-right faint mono">STRATEGIC ADVISORY</span>
  
  <!-- Center content -->
  <main class="centered-stack">
    <span class="classification-label">Van Gelder Co.</span>
    
    <h1 class="hero-lines">
      <!-- 3 lines, each with staggered clip-reveal -->
      Building coalitions that move capital and policy
      Connecting labor, energy, and culture at the seams
      Turning networks into organized power
    </h1>
    
    <div class="sector-tags">
      <!-- 6 tags: Energy, Labor, Philanthropy, Culture, Policy, National Security -->
      <!-- Each: uppercase JetBrains Mono, subtle border, red left-accent -->
    </div>
    
    <span class="access-gate">BY REFERRAL ONLY</span>
  </main>
</div>
```

**Animation timing:**
- Hero line 1: 0.8s delay, line 2: 1.2s, line 3: 1.6s (clip-path reveal)
- Sector tags: fade-up starting at ~2.2s with stagger
- Access gate: fade-in at ~3.0s
- Atmospheric effects: infinite loops from page load

### 4. `src/App.css` — Clear
Remove all default Vite styles (logo spin, card padding, etc.).

### 5. `tailwind.config.ts` — Extend
Add custom keyframes for `clip-reveal`, `breathe`, `grain`, `scanline-scroll` and corresponding animation utilities. Add font family entries for Space Grotesk and JetBrains Mono.

## Typography Scale
- Classification label: JetBrains Mono, ~11px, tracking-[0.3em], red accent color, opacity 90%
- Hero lines: Space Grotesk, ~20px mobile / ~48px desktop, white at 90% opacity, font-weight 500
- Sector tags: JetBrains Mono, ~10px mobile / ~12px desktop, uppercase, white at 50% opacity
- HUD text: JetBrains Mono, ~10px, white at 20% opacity
- Access gate: JetBrains Mono, ~10px, white at 30% opacity, tracking wide

## Responsive
- Mobile: tighter spacing, hero ~20-26px, tags in 2-col grid
- Desktop: generous whitespace, hero ~48px, tags in single row

