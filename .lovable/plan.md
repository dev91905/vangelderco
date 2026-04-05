

# Add SFX + Improve Hover Effects on PostCard

## Changes — `src/components/PostCard.tsx`

1. **Import and use `useGlitchSFX`** — call `playHoverGlitch` on `mouseenter`
2. **Enhance hover effects**:
   - Border-left brightens to full red (already exists, keep)
   - Background shifts from `hsl(0 0% 4%)` → `hsl(0 0% 7%)` on hover
   - Top/right/bottom borders brighten slightly from `0.05` → `0.1` opacity
   - Title text brightens to full white on hover
   - Type label brightens on hover
   - Add a subtle `translateX(2px)` shift on the whole card inner content on hover (not just title)

All done via `onMouseEnter`/`onMouseLeave` inline style updates, matching the pattern used in `PostListTable.tsx` and the admin page.

## File
- `src/components/PostCard.tsx`

