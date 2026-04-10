

## Problem

The bottom nav (Back / progress / Continue) uses `maxWidth: 1280px` with `justify-between`, placing buttons at the extreme edges. The content also uses `max-w-[1280px]`. Since both share the same max-width, the Continue button sits directly on top of the right column content edge. Making content narrower just makes things look cramped while the buttons follow along.

The top chrome (step label + ESC) spans the full viewport with `padding: 20px 28px` — same issue.

This is an **architectural** problem: the chrome and the content aren't in a coordinated layout system.

## Fix

### 1. Move the fixed nav buttons inward — inset them from the content edges

The nav bar container stays at `maxWidth: 1280px`, but add horizontal padding that matches the DeckFrame's content padding (`lg:px-28` = 112px). This pushes Back/Continue well inside the content boundary:

**`src/pages/Deck.tsx` (line 574-575):**
```
// Before:
<div style={{ padding: "0 32px 28px" }}>
  <div style={{ maxWidth: "1280px", margin: "0 auto", gap: "16px" }}>

// After:
<div style={{ padding: "0 32px 28px" }}>
  <div style={{ maxWidth: "1280px", margin: "0 auto", gap: "16px", paddingLeft: "clamp(0px, 4vw, 80px)", paddingRight: "clamp(0px, 4vw, 80px)" }}>
```

This pulls the Back and Continue buttons ~80px inward on large screens, so they sit comfortably inside the content area instead of at its edges.

### 2. Same treatment for top chrome

**`src/pages/Deck.tsx` (line 555):**
```
// Before:
<div style={{ padding: "20px 28px" }}>

// After:  
<div style={{ padding: "20px 28px" }}>
  <div style={{ maxWidth: "1280px", margin: "0 auto", paddingLeft: "clamp(0px, 4vw, 80px)", paddingRight: "clamp(0px, 4vw, 80px)" }}>
```

Wrap the top chrome's flex row in a max-width container with the same inset padding, so step label and ESC align with the nav buttons below.

### 3. Restore Frame 4 column widths to breathe

Now that chrome is inset, the right column has room. Revert to wider proportions:

**`src/pages/Deck.tsx` (line 1115-1124):**
- Left column: `lg:w-[35%]`
- Right column: `lg:w-[62%]`

This gives the hallmark cards proper breathing room without overlapping any chrome.

### Summary

| File | Change |
|------|--------|
| `src/pages/Deck.tsx` (bottom nav) | Add `paddingLeft/Right: clamp(0px, 4vw, 80px)` to inner container |
| `src/pages/Deck.tsx` (top chrome) | Wrap in max-width container with same inset padding |
| `src/pages/Deck.tsx` (Frame 4) | Restore columns to 35%/62% |

The chrome now coordinates with content — buttons float inside the safe zone instead of at the edges. No more overlap regardless of viewport width.

