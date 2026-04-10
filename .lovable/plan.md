

## Add Network Sectors Section to Homepage

### What this does
Adds a new section between Field Notes and the "Explore Our Work" contact section. The section communicates: "When you work with Van Gelder Co., you get access to this network" — a visual grid of all the sectors VGC operates across.

### The section
- **Header**: Small red label ("The Network") + a short line like "480 members across every sector that moves policy, culture, and capital."
- **Sector grid**: Styled pills/tags in a wrapped flex layout, scroll-revealed with staggered animation. Each pill is a sector name — clean, minimal, same visual language as the hero sector pills but larger and more prominent.
- **Expanded sector list** (~16 sectors):
  - Music · Film & TV · News Media · Digital Creators · Brands & Advertising · Athletes & Sports · Gaming · Faith · Campuses · Veterans & Defense · Labor · Government & Policy · Philanthropy · Energy · Industry Groups · Technologists · National Security · Community Organizations

### Visual treatment
- Same reveal animation pattern as the rest of the homepage (intersection observer fade-up)
- Pills use the existing border + subtle background styling from the hero sector pills, but slightly larger
- Optional: a subtle connecting line or "480-member network" stat callout above the grid
- Consistent with the oxblood accent color for the section label

### Technical changes
- **`src/pages/Index.tsx`** — Add a `NETWORK_SECTORS` array with the full list, insert a new `<section>` between Field Notes and Contact sections
- Also update the hero `SECTORS` array (line 8) to stay in sync or keep it as the abbreviated version (6 highlights) with the new section showing the full set

### What stays the same
- Deck keeps its existing sector references — no changes
- All other pages untouched
- Field Notes stays as-is above this new section

