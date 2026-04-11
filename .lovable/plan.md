

## Fix: Mobile slide spacing — uniform header clearance across all frames

### Problem
Frames 4, 6, 7 have `marginTop: "-40px"` on their content grid, which was a desktop centering hack that pulls the title up under the header gradient on mobile. Other frames have inconsistent top spacing — some use `min-h-[60vh] justify-center`, some have no explicit top spacing at all.

### Root cause
The `paddingTop: "60px"` in `DeckFrame`'s mobile content area is the only header clearance. But individual slide content divs override this with negative margins or centering tricks meant for desktop.

### Changes

**`src/components/deck/DeckFrame.tsx`**
- Increase mobile `paddingTop` from `60px` to `72px` — gives consistent breathing room below the header gradient on all devices (phone + tablet)
- This single change establishes a uniform top position for all slide content

**`src/pages/Deck.tsx`** — make the negative margins desktop-only:
- **Frame 4 (Practices)**: Change `marginTop: "-40px"` → remove on mobile. Use a responsive approach: wrap the negative margin in a class or conditional so it only applies on `lg:` screens
- **Frame 6 (Metrics)**: Same — remove `marginTop: "-40px"` on mobile
- **Frame 7 (Working Together)**: Same — remove `marginTop: "-40px"` on mobile
- **Frame 1 (Hero)**: Remove `min-h-[60vh] justify-center` on mobile — content should start at top, not vertically center
- **Frame 2 (Self-Diagnosis)**: Remove `min-h-[70vh] justify-center` on mobile — same reason
- **Frame 3 (Quiz)**: Remove `justifyContent: "center"` on mobile
- **Frame 5 (Capabilities)**: Already uses `flex-col gap-8` with no centering — fine as-is
- **Frame 8 (Sectors)**: Already uses `w-full` with no centering — fine as-is
- **Frame 9 (Results)**: Already uses `align="left"` — fine as-is
- **Frame 10 (CTA)**: Already simple — fine as-is

Implementation approach: Since `isMobile` is already available as a prop/variable in the Deck component, I'll use it inline to conditionally apply the negative margins and min-height centering only on desktop.

### What stays the same
- Desktop layout completely unchanged — negative margins and vertical centering remain on large screens
- No changes to button styling, gradients, nav, progress bar, or any content
- `paddingBottom: "100px"` on mobile unchanged (footer clearance)
- Tablet gets the same mobile treatment (DeckFrame mobile path triggers at `< 768px` via `useIsMobile`)

