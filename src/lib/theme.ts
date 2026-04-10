/**
 * Centralized design tokens — the SINGLE SOURCE OF TRUTH for all styling.
 *
 * RULE: No component should ever hardcode color, font, or spacing values.
 * Import from here instead:
 *
 *   import { t } from "@/lib/theme";
 *   <div style={{ color: t.ink(0.5), fontFamily: t.serif }}>
 *
 * To change the entire site's look, edit ONLY this file + index.css variables.
 *
 * Colors now read from CSS custom properties so they automatically
 * adapt when the `.dark` class is present on <html>.
 */

/* ── Color helpers (CSS-variable-aware) ── */
const ink = (alpha: number) =>
  `hsl(var(--ink-h) var(--ink-s) var(--ink-l) / ${alpha})`;

const cream = "hsl(var(--cream-h) var(--cream-s) var(--cream-l))";
const white = "hsl(var(--card-h) var(--card-s) var(--card-l))";

const error = (alpha = 1) => `hsl(var(--destructive) / ${alpha})`;
const success = (alpha = 1) => `hsl(150 40% 40% / ${alpha})`;

/* ── Typography ── */
const serif = "'Source Serif 4', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

/* ── Borders & surfaces ── */
const border = (alpha = 0.08) => `1px solid ${ink(alpha)}`;
const rule = ink(0.08);
const surface = {
  cream,
  white,
  hover: ink(0.04),
  subtle: ink(0.02),
  active: ink(0.06),
};

/* ── Pre-built text styles (CSSProperties) ── */
const heading = (size = "clamp(18px, 2.6vw, 28px)"): React.CSSProperties => ({
  fontFamily: sans,
  fontSize: size,
  fontWeight: 700,
  color: ink(0.9),
  lineHeight: 1.3,
});

const body = (alpha = 0.55): React.CSSProperties => ({
  fontFamily: serif,
  fontSize: "clamp(15px, 1.5vw, 17px)",
  color: ink(alpha),
  lineHeight: 1.8,
});

const label = (size = "10px"): React.CSSProperties => ({
  fontFamily: sans,
  fontSize: size,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: ink(0.3),
});

const mono: React.CSSProperties = {
  fontFamily: sans,
};

/* ── Interactive states ── */
const pill = {
  /** Primary black pill button */
  primary: {
    fontFamily: sans,
    background: ink(0.88),
    color: cream,
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
  } as React.CSSProperties,
  /** Ghost/outline pill button */
  ghost: {
    fontFamily: sans,
    background: "transparent",
    color: ink(0.4),
    border: border(0.15),
    borderRadius: "999px",
    cursor: "pointer",
  } as React.CSSProperties,
};

/* ── Spacing presets ── */
const space = {
  pagePx: "px-4 md:px-8",
  sectionGap: "gap-6 md:gap-8",
  cardPad: "px-4 py-3",
} as const;

/* ── Radius ── */
const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  full: "999px",
} as const;

/* ── The single export ── */
export const t = {
  // Colors
  ink,
  cream,
  white,
  error,
  success,
  rule,
  surface,
  border,

  // Typography
  serif,
  sans,
  heading,
  body,
  label,
  mono,

  // Components
  pill,

  // Layout
  space,
  radius,
} as const;

export default t;
