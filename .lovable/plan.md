

# Fix: Case Studies Auto-Saved as Blog Posts

## Root Cause

`AdminEditor.tsx` line 24 initializes `type` to `"blog-post"`. When editing a Case Study:

1. Component mounts with `type = "blog-post"` (default state)
2. The `useEffect` that loads post data from the query fires, but React state updates are async
3. Any `setDirty(true)` call during initialization (or from the `useEffect` setting state) triggers the 3-second auto-save timer
4. The auto-save fires `formData()` which reads the current state — if the post data hasn't fully populated yet, `type` is still `"blog-post"`

The `dirty` flag shouldn't be `true` until the user actually makes a change, but the `markDirty` wrapper is called by the state setters in the `useEffect` load path — wait, actually the load path uses raw setters (`setType(post.type)`), not `markDirty`. So the issue is subtler: the `hasLoadedRef` guard only prevents re-loading, but the initial render with default values could still interact with auto-save if any other effect sets dirty.

The real fix is two-fold:

1. **Don't allow auto-save until post data has loaded** — gate auto-save on `hasLoadedRef.current`
2. **Don't default `type` to `"blog-post"`** — leave it empty or use post data directly

## Changes

### `src/pages/AdminEditor.tsx`

1. In the auto-save `useEffect` (line 99), add a guard: `if (!hasLoadedRef.current && !isNew) return;` — prevents auto-save from firing before the post data has been loaded into state
2. After the data-load `useEffect` sets all fields, ensure `dirty` is explicitly set to `false` (it should already be, but add `setDirty(false)` at the end of the load block for safety)

