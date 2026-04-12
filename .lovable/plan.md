

## Fix scroll restoration when navigating back from articles

### The problem

When you click a stat chip linking to an article (`/post/:slug`), read it, then click the back link, it navigates **forward** to `"/"` using `<Link to={backPath}>`. This mounts the homepage fresh, scroll at top. The browser's native back button would restore scroll, but the in-app back link doesn't use `history.back()`.

### The fix

Replace the `<Link to={backPath}>` back links with an `onClick` handler that calls `window.history.back()` when the referrer is the homepage. This uses the browser's native scroll restoration, which preserves exact scroll position.

**Files to change:**

1. **`src/hooks/useBackNavigation.ts`** — Add a `useGoBack()` hook that returns a click handler. If `location.state?.from` exists (meaning the user came from within the app), call `navigate(-1)` (browser back). Otherwise fall back to navigating to the fallback path.

2. **`src/components/blog/BlogPostView.tsx`** — Replace the `<Link to={backPath}>` with a `<button>` or `<a>` using the new `useGoBack()` handler.

3. **`src/components/casestudy/CaseStudyView.tsx`** — Same change.

4. **`src/components/PasswordGate.tsx`** — Same change for the back link on the password gate screen.

5. **`src/components/CapabilityLayout.tsx`** — Same change for capability page back links.

This is a small, surgical fix. The `from` state is already being passed in `ImpactCloud.tsx` and other link sources, so the plumbing is in place — the back links just need to use `navigate(-1)` instead of `navigate(backPath)`.

