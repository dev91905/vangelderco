

# Fix Global Password Not Gating Articles

## Root Causes

1. **Content loads before gate**: `usePostBySlug` fetches the full post (including `content_blocks`) in parallel with `usePostHasPassword`. The article content is in the browser before the gate renders — it flashes, and a user can read it via dev tools.

2. **Silent bypass on error**: If the edge function call fails, `usePostHasPassword` returns `requiresPassword: false` — any network hiccup disables the gate entirely.

3. **Listing pages leak content**: `useCapabilityPosts` fetches `content_blocks` for every post on the listing page. Not a gate bypass, but unnecessary data exposure.

## Changes

### 1. `src/pages/PostDetail.tsx` — Gate before content fetch

Restructure the component so the password check happens first. Don't render the article content (or even fetch it) until the gate is resolved:

- Fetch `usePostHasPassword` first
- If `requiresPassword` is true and not yet unlocked, show only the `PasswordGateWrapper` (with title and hero from a lightweight metadata-only query)
- Only call `usePostBySlug` (full content) after unlock

This means splitting into two queries: a metadata query (title, slug, capability, hero_image_url, excerpt — no content_blocks) and the full content query gated behind unlock state.

### 2. `src/hooks/usePostBySlug.ts` — Add metadata-only hook

Add `usePostMeta(slug)` that selects only: `id, title, slug, type, capability, excerpt, hero_image_url, published_at`. No `content_blocks`, no `content`, no `stats`.

Keep `usePostBySlug` as-is but add an `enabled` option so PostDetail can delay it.

### 3. `src/hooks/usePostBySlug.ts` — Fail closed on error

Change `usePostHasPassword` so that on error it returns `requiresPassword: true` instead of `false`. Gate stays up if anything goes wrong.

### 4. `src/hooks/useCapabilityPosts.ts` — Stop fetching content_blocks on listings

Remove `content_blocks, stats, content` from the select query on listing pages. Cards only need `id, title, slug, type, capability, excerpt, hero_image_url, published_at, created_at`.

### 5. `src/components/PasswordGate.tsx` — Lift unlock state

The `PasswordGateWrapper` needs to expose its unlock state so `PostDetail` can use it to enable the full content query. Add an `onUnlock` callback prop (already partially there) that PostDetail uses to set a local `unlocked` state, which then enables `usePostBySlug`.

## Technical detail

```
Page load flow (current — broken):
  usePostBySlug ──→ full content in browser ──→ render article
  usePostHasPassword ──→ requiresPassword ──→ overlay gate on top
  (content already visible in DOM/devtools)

Page load flow (fixed):
  usePostMeta ──→ title, hero only
  usePostHasPassword ──→ requiresPassword?
    YES → show PasswordGateWrapper (no content fetched)
           user enters password → onUnlock → set unlocked=true
           usePostBySlug(enabled: unlocked) → fetch content → render
    NO  → usePostBySlug(enabled: true) → fetch content → render
```

Six small edits across three files. No database or edge function changes needed.

