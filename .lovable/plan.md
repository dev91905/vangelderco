

# Admin Page Design Polish

## Changes

### 1. Top bar redesign — `src/pages/Admin.tsx`
- Replace `< Site` with a proper back button: `← Back to Site` using `ArrowLeft` icon from lucide, styled as a pill/button with subtle border matching the filter chips
- Better visual hierarchy: site title "Content Manager" gets slightly more weight
- Tighten spacing, add subtle hover states to all header buttons (sign out, settings, new post)

### 2. Back button specifically
Current: `< Site` — cryptic, looks like code
New: `ArrowLeft` icon + "Back to Site" label, same JetBrains Mono 10px uppercase tracking, but wrapped in a hover-interactive container with `hover:bg-[hsl(0_0%_8%)]` and red accent shift on hover — matching the existing admin aesthetic

### 3. Post list hover effects + SFX — `src/components/admin/PostListTable.tsx`
- Import `useGlitchSFX` and wire `playHoverGlitch` to `onPointerEnter` on each post row
- Wire `playClickGlitch` to `onClick` on the publish toggle button
- Add a left-border accent on hover (like the public PostCard): `2px solid transparent` → `2px solid hsl(0 80% 48% / 0.5)` on hover
- Title shifts right slightly on hover (`group-hover:translate-x-0.5`)
- Publish toggle button gets a more visible hover background

### 4. Filter chips — minor polish
- Add `playHoverGlitch` on pointer enter for filter chips
- Slight scale/brightness bump on active state

## Files
- `src/pages/Admin.tsx` — back button, header polish, SFX on filters
- `src/components/admin/PostListTable.tsx` — hover effects, SFX on post rows and publish toggle

