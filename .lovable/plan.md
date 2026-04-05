

# Make Password Gate Mobile-Responsive

## Problems

1. **Title overflows on small screens**: `text-2xl md:text-3xl` with long titles can overflow or feel cramped with only `px-6` padding
2. **Fixed corner brackets and HUD text overlap content on small viewports**: `fixed top-6 left-6` / `right-6` positioning doesn't account for narrow screens where "< Return" and "Van Gelder Co." crowd the top
3. **Content container uses `max-w-md` (28rem) with `px-6`** — fine on desktop but leaves almost no breathing room on 320px screens
4. **No viewport height awareness**: The centered flex column with `gap-8` can push the form below the fold on short mobile screens (e.g. landscape or with keyboard open)
5. **Input and button sizing** not optimized for touch — `py-3` input is okay but the unlock button at `py-2.5` is small for thumb targets

## Changes — `src/components/PasswordGate.tsx` only

### Responsive spacing
- Reduce `gap-8` to `gap-6 sm:gap-8` on the content column
- Add `py-8` to the content wrapper so it doesn't butt against screen edges vertically
- Change container to `max-w-sm sm:max-w-md` for tighter small screens

### Title sizing
- `text-xl sm:text-2xl md:text-3xl` — step down one size on mobile

### HUD elements
- Hide "Van Gelder Co." on small screens: add `hidden sm:block`
- Reduce top/left offsets on mobile: `top-4 left-4 sm:top-6 sm:left-6`

### Touch targets
- Bump button padding to `py-3` on mobile
- Input `py-3` stays (already fine)

### Scroll safety
- Wrap the content area in `overflow-y-auto` with `max-h-screen` so on very short viewports (keyboard open), the form is still reachable via scroll

One file, CSS/class adjustments only.

