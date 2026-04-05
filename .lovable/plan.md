

# Match Password Gate to Standard Site Chrome

## Problem

The password gate is a completely custom full-screen layout — centered content, no site header elements. Every other page on the site has the same fixed HUD: "Van Gelder Co." top-right, "← Return" top-left. The password gate has neither — just a floating "← Go back" button wedged between the lock icon and the form. It feels like a different site.

## Fix

Give the `PasswordGateWrapper` the same top-bar chrome as BlogPostView and CaseStudyView:

- **Top-left**: `← Return` link (using `post.capability` to route back to the correct capability page, same as the article views do)
- **Top-right**: `Van Gelder Co.` HUD label

Remove the current `← Go back` button from the centered content area. The password gate content (title, lock icon, form) stays centered as-is.

## Changes

### `src/components/PasswordGate.tsx` — `PasswordGateWrapper`

1. Accept `capability` as a new prop (needed to build the correct return route)
2. Add the same fixed top-left `← Return` link that BlogPostView uses, routing to the capability page
3. Add the same fixed top-right `Van Gelder Co.` label
4. Remove the `← Go back` button from the centered content

### `src/pages/PostDetail.tsx`

Pass `capability={post.capability}` to `PasswordGateWrapper`.

### `src/components/PasswordGate.tsx` — top-level `PasswordGate` export

Same treatment if it's still used anywhere, but the `PasswordGateWrapper` is the active one.

Two files, minimal diff. The password page will now look like it belongs to the site.

