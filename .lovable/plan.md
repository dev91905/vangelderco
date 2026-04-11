

## Update Quiz Score to Readiness Label + Hint Text

### What changes

Replace the `quizScore()` helper with a `readinessLabel()` function that reads `contact.readiness_score` and returns the severity label with colored text and a descriptive hint line underneath.

### File: `src/pages/AdminSubmissions.tsx`

**1. Add import** — `getScoreLabel` from `@/lib/deckScoring`

**2. Replace `quizScore` helper (lines 47–51)** with:

```typescript
const readinessLabel = (score: number | null) => {
  if (score === null || score === undefined) return { label: "—", hint: "", color: "" };
  const info = getScoreLabel(score);
  const hints: Record<string, string> = {
    critical: "Full diagnostic needed",
    significant: "Strong engagement candidate",
    moderate: "Targeted support needed",
    advanced: "Light-touch advisory only",
  };
  return { label: info.label, hint: hints[info.severity], color: info.color };
};
```

**3. Update list row (line 117–119)** — replace `quizScore(c.quiz_answers)` with the label text colored by severity:

```tsx
const rl = readinessLabel(c.readiness_score);
// Show: "Moderate" in amber, etc.
<span style={{ fontFamily: t.sans, fontSize: "11px", fontWeight: 600, color: rl.color, whiteSpace: "nowrap" }}>
  {rl.label}
</span>
```

**4. Update detail panel (lines 277–284)** — replace "Quiz Score" block with:

```tsx
<div style={{ padding: "12px 14px", borderRadius: "10px", background: t.ink(0.03), border: t.border(0.06) }}>
  <p style={{ fontFamily: t.sans, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: t.ink(0.35), textTransform: "uppercase", marginBottom: "4px" }}>
    Readiness Score
  </p>
  <p style={{ fontFamily: t.sans, fontSize: "15px", fontWeight: 700, color: readinessLabel(contact.readiness_score).color }}>
    {contact.readiness_score ?? "—"} · {readinessLabel(contact.readiness_score).label}
  </p>
  <p style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.35), marginTop: "2px" }}>
    {readinessLabel(contact.readiness_score).hint}
  </p>
</div>
```

No database changes needed — `readiness_score` is already stored.

