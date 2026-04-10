

# Fix Altitude Section — Implement Missing Changes

## What you asked for (message #803)
You wanted the Altitude section to:
1. Add **"Our Altitude"** as a section header
2. Add copy that actually tells the viewer **what you do** — specialists in cultural strategy, media organizing, and philanthropy helping donors get strategic communications right
3. Keep the existing poetic lines ("You're on the ground doing the work / We see the field from orbit")

## What's there now
Just the two poetic lines and the "Six sectors" subcopy. No section header, no description of services. The changes from that earlier conversation never stuck.

## Changes

### `src/pages/Index.tsx` — Altitude section (~lines 337-377)

Add before the first `RevealBlock`:
- **Section header**: `"Our Altitude"` — uppercase, tracked, `10px`, same style as the "Capabilities" header below it

After the "Six sectors" subcopy, add:
- **Services statement**: "We're specialists in cultural strategy, media organizing, and philanthropy — working across six sectors to help donors and foundations get strategic communications right." — `14px`, `max-w-2xl`, muted ink color

### Files touched
- `src/pages/Index.tsx` only

