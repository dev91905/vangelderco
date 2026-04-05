

# Constellation Field — Animated Page Transitions

## Problem
Currently, each page mounts its own `AtmosphericLayout` → its own `ConstellationField`. On navigation the canvas is destroyed and recreated — no transition, no visual continuity.

## Approach

Lift `ConstellationField` above the router so it's a single persistent instance. Give it a `mode` prop (`"home" | "cultural-strategy" | "cross-sector" | "deep-organizing"`) driven by the current route. When the mode changes, nodes smoothly lerp to new target positions over ~1.5 seconds.

Each mode defines a distinct constellation personality:
- **Home**: Balanced 6×6 grid, north star at golden-ratio center — the current default
- **Cultural Strategy**: Nodes cluster toward the left third, denser connections — cultural network gravity
- **Cross-Sector**: Nodes spread into three distinct clusters (left, center-top, right) with bridging connections between them — cross-sector bridges
- **Deep Organizing**: Nodes pull tighter toward center in a dense core with sparse outer ring — deep infrastructure concentration

## Changes

### 1. `src/components/ConstellationField.tsx`
- Accept `mode` prop (default `"home"`)
- Define four layout presets — each returns target `baseX`/`baseY` for the 36 nodes using the same seeded jitter but different spatial distributions
- On mode change: store new targets, lerp each node's `baseX`/`baseY` toward target over ~90 frames (~1.5s at 60fps) using ease-out interpolation
- Animation loop already runs — just add the lerp step before the existing drift/orbit/repulsion logic

### 2. `src/App.tsx`
- Add `ConstellationField` as a sibling above `<Routes>`, outside any layout component
- Use `useLocation()` to derive the mode from the current pathname
- Pass mode as prop

### 3. `src/components/AtmosphericLayout.tsx`
- Remove `<ConstellationField />` from here (it now lives in App)
- Keep all other atmospheric layers (glow, vignette, scan beam, brackets)

### 4. `src/components/PasswordGate.tsx`
- Remove its `<ConstellationField />` import — the global instance covers it

### No other files change. No new dependencies.

## Layout Presets (spatial logic)

```text
HOME:          Even 6×6 grid
               ·  ·  ·  ·  ·  ·
               ·  ·  ·  ·  ·  ·
               ·  ·  ·  ★  ·  ·
               ·  ·  ·  ·  ·  ·
               ·  ·  ·  ·  ·  ·
               ·  ·  ·  ·  ·  ·

CULTURAL:      Left-weighted cluster
               ··· ·     ·
               ····  ·      ·
               ···★·    ·
               ····  ·
               ··· ·        ·
               ··       ·

CROSS-SECTOR:  Three bridged clusters
               ···      ···
               ···  ··  ···
                  ·★··
               ·    ··    ·
               ···      ···

DEEP-ORG:      Dense core, sparse halo
                    ·
                 ·     ·
               · ····· ·
                 ·★··
               · ····· ·
                 ·     ·
```

