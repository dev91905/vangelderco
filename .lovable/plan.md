

# Fix Deep Organizing — Spread Instead of Squeeze

## Problem
The `deep-organizing` mode compresses nodes toward center (`0.82` factor), which on a 390px mobile viewport clusters everything into a visible blob. The other modes work because they *reshape* the field (shift left, stretch wide) rather than compressing it.

## Fix — `src/components/ConstellationField.tsx`

Replace the deep-organizing transform with a **vertical stretch + slight horizontal shift** — a distinct reshaping like the other modes, not a compression:

```typescript
case "deep-organizing":
  x = 0.5 + (nx - 0.5) * 1.1;
  y = Math.pow(ny, 1.4);
  break;
```

This pushes nodes slightly wider horizontally (1.1× from center) and compresses them toward the top via the power curve — creating a "pulled upward" feel that's visually distinct from cultural-strategy (right-weighted) and cross-sector (wide-spread). Nodes near the bottom get pulled up, nodes near the top stay put. No clustering, no blob.

One file, two lines changed.

