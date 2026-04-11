

# Fix: Impact Stat Links → Correct Destinations + Password Protection

## Problem

The `StatCard` link builder in `ImpactCloud.tsx` constructs URLs like `/cross-sector/building-power-in-the-permian-basin` — but no such routes exist. The app only has `/post/:slug` for articles. For deck case studies with no `link_url`, it falls back to `/diagnostic`.

## What needs to happen

### 1. Fix link generation in `ImpactCloud.tsx` (line 40-44)

Change the href logic:

- **For capability_posts** (`sourceCapability !== "deck"`): Always link to `/post/{slug}`. The `PostDetail` page already handles password gating via the `verify-post-password` edge function.
- **For deck_case_studies** (`sourceCapability === "deck"`): Link to `link_url` if set, otherwise `/diagnostic`.

```text
Before:  /cross-sector/building-power-in-the-permian-basin  → 404
After:   /post/building-power-in-the-permian-basin          → PostDetail (with password gate if needed)
```

### 2. Password protection is already wired

The backend is complete:
- `capability_posts.password` column exists
- `verify-post-password` edge function handles both post-level and global passwords
- `PostDetail` page checks `usePostHasPassword` and shows `PasswordGateWrapper`
- Admin editor (`AdminEditor.tsx`) has password field on the meta bar
- Admin panel (`Admin.tsx`) has global password management

No backend or admin changes needed — password protection works end-to-end once the links point to `/post/:slug`.

### 3. Include `sourceType` in aggregated stats

Add `sourceType` (from `capability_posts.type`) to `AggregatedStat` so future link logic can distinguish article types if needed. This is a minor data addition in `useAggregatedStats.ts`.

### Summary of file changes

| File | Change |
|------|--------|
| `src/components/ImpactCloud.tsx` | Fix href: posts → `/post/{slug}`, deck → `link_url \|\| /diagnostic` |
| `src/hooks/useAggregatedStats.ts` | Add `sourceType` field from capability_posts |

One-line fix at the core — the password gate, edge function, and admin panels are already in place.

