

## Problem

The left column has `justifyContent: "center"` on a `height: 100dvh` flex column. This vertically centers the *group* of elements (title, subtitle, diagnostic card, start-over button), but because the group is tall, the diagnostic card gets shoved to the bottom of the viewport and the top has a huge empty gap. It looks broken.

## Fix

**`src/pages/Deck.tsx` (line 915):**

Remove `justifyContent: "center"` and replace with `justifyContent: "flex-start"` plus a `paddingTop` of `clamp(80px, 14vh, 160px)`. This anchors content from the top with breathing room, keeping the diagnostic card and start-over button visible in the natural reading flow — no wasted vertical space above the heading.

| Line | Before | After |
|------|--------|-------|
| 915 | `justifyContent: "center"` | `justifyContent: "flex-start"` |
| 912 | `paddingTop: "clamp(40px, 6vh, 72px)"` | `paddingTop: "clamp(80px, 14vh, 160px)"` |

Same `paddingTop` update on the right column (line 995) so both columns start at the same vertical position.

One file changed. Two lines each in left and right columns.

