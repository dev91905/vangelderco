

# Fix: Editor Not Scrollable

## Root Cause
`body { overflow: hidden; }` is set globally in `src/index.css` (line 51). The homepage needs this (atmospheric layout with no scroll), but the admin editor has no internal scroll wrapper — so its content gets clipped.

## Fix

### `src/pages/AdminEditor.tsx`
- Change the outer `div` from `min-h-screen` to `h-screen flex flex-col`
- Wrap the scrollable content area (metadata bar, stat chips, block canvas, keyboard hints) in a `div` with `flex-1 overflow-y-auto`
- The sticky toolbar stays outside the scroll container at the top

```text
┌──────────────────────────┐
│  Toolbar (fixed top)     │  ← not scrollable
├──────────────────────────┤
│  Scrollable area         │  ← overflow-y-auto, flex-1
│   ├ EditorMetaBar        │
│   ├ StatChipsEditor      │
│   ├ BlockCanvas          │
│   └ Keyboard hints       │
└──────────────────────────┘
```

No changes to `index.css` — keeping `overflow: hidden` on body for the homepage. The editor simply gets its own scroll context.

