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
 */

/* ── Raw HSL base values (match :root in index.css) ── */
const BASE = {
  bg: "40 30% 96%",
  fg: "30 10% 12%",
  card: "40 25% 98%",       // subtle warm tint, NOT pure white
  destructive: "0 60% 45%",
  success: "150 40% 40%",
} as const;

/* ── Color helpers ── */
const ink = (alpha: number) => `hsl(${BASE.fg} / ${alpha})`;
const cream = `hsl(${BASE.bg})`;
const white = `hsl(${BASE.card})`;
const error = (alpha = 1) => `hsl(${BASE.destructive} / ${alpha})`;
const success = (alpha = 1) => `hsl(${BASE.success} / ${alpha})`;

/* ── Typography ── */
const serif = "'Instrument Serif', serif";
const sans = "'DM Sans', sans-serif";

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
  fontFamily: serif,
  fontSize: size,
  fontWeight: 400,
  color: ink(0.9),
  lineHeight: 1.4,
});

const body = (alpha = 0.5): React.CSSProperties => ({
  fontFamily: sans,
  fontSize: "clamp(13px, 1.5vw, 16px)",
  color: ink(alpha),
  lineHeight: 1.65,
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
