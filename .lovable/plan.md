

# Fix Serif-on-Headings — Missed Font Swap

## Problem
The font overhaul changed `heading()` to use `sans` (Inter) and `body()` to use `serif` (Source Serif 4). But 12 files hardcode `fontFamily: t.serif` on heading elements instead of calling `t.heading()`. So headings still render in serif.

## Fix
Every `fontFamily: t.serif` on a heading/title element → `fontFamily: t.sans`. Leave `t.serif` only where it's correctly used for body/paragraph text.

## Changes by file

| File | Element | Current | Fix |
|------|---------|---------|-----|
| `CapabilityLayout.tsx` | `<h1>` title | `t.serif` | `t.sans` |
| `CaseStudyView.tsx` | `<h1>` title | `t.serif` | `t.sans` |
| `BlogPostView.tsx` | `<h1>` title | `t.serif` | `t.sans` |
| `PostCard.tsx` | `<h3>` title | `t.serif` | `t.sans` |
| `PasswordGate.tsx` | `<h1>` title (×2) | `t.serif` | `t.sans` |
| `EditorMetaBar.tsx` | `<input>` title | `t.serif` | `t.sans` |
| `Admin.tsx` | `<h1>` "Content Manager" | `t.serif` | `t.sans` |
| `AdminLogin.tsx` | `<h1>` "Content Manager" | `t.serif` | `t.sans` |
| `NotFound.tsx` | `<h1>` "404" | `t.serif` | `t.sans` |
| `Index.tsx` | hero nav labels | `t.serif` | `t.sans` |
| `ContentBlockRenderer.tsx` | `<h1>`–`<h6>` blocks | `t.serif` | `t.sans` |

The `Deck.tsx` file likely has the same issue — will audit and fix in the same pass.

## What stays serif
- Body paragraphs, descriptions, long-form content — these correctly use `t.serif` or `t.body()`
- Blockquotes

## Files modified
~12 files, single token swap each. No logic changes.

