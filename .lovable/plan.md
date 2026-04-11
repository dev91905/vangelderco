

## The Problem

`scroll-snap-type: y mandatory` forces the browser to always snap to the nearest snap point. On any slide where content exceeds the viewport height (slide 2's pain cards, slide 9's results, slide 10's form), the snap immediately pulls you back to the top of that frame. You literally cannot scroll within a slide.

## The Fix

**One line change in `src/pages/Deck.tsx`** (line 518):

```
scrollSnapType: isMobile ? "y proximity" : "none",
```

`y proximity` snaps to a frame boundary **only when you're near one** — so swiping between slides still feels like a deck, but scrolling within a tall slide works naturally. This is the standard approach for snap containers with variable-height children.

No other files need changes. `DeckFrame` already has `scrollSnapAlign: "start"`.

## Technical Detail

| Snap mode | Between slides | Within tall slides |
|-----------|---------------|-------------------|
| `mandatory` | Snaps (good) | Locked — can't scroll (broken) |
| `proximity` | Snaps when near boundary (good) | Free scroll (good) |
| `none` | No snap — continuous scroll (bad) | Free scroll (good) |

`proximity` is the correct middle ground.

