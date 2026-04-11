import type { CSSProperties } from "react";
import { t } from "@/lib/theme";

const f = { sans: t.sans, ink: t.ink };

export const caseStudyUi = {
  radius: "18px",
  cardSurface: f.ink(0.015),
  cardSurfaceHover: f.ink(0.03),
  cardBorder: `1px solid ${f.ink(0.08)}`,
  cardBorderColor: f.ink(0.08),
  cardBorderStrong: `1px solid ${f.ink(0.16)}`,
  cardBorderStrongColor: f.ink(0.16),
  rail: f.ink(0.08),
  railActive: f.ink(0.3),
  node: f.ink(0.16),
  nodeActive: f.ink(0.42),
  title: {
    fontFamily: f.sans,
    fontSize: "clamp(18px, 1.9vw, 24px)",
    fontWeight: 700,
    color: f.ink(0.84),
    lineHeight: 1.22,
    letterSpacing: "-0.02em",
  } as CSSProperties,
  body: {
    fontFamily: f.sans,
    fontSize: "clamp(13px, 1.1vw, 15px)",
    color: f.ink(0.42),
    lineHeight: 1.68,
  } as CSSProperties,
  meta: {
    fontFamily: f.sans,
    fontSize: "10px",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    color: f.ink(0.28),
  } as CSSProperties,
  smallMeta: {
    fontFamily: f.sans,
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    color: f.ink(0.22),
  } as CSSProperties,
  statValue: {
    fontFamily: f.sans,
    fontSize: "clamp(16px, 1.5vw, 20px)",
    fontWeight: 700,
    color: f.ink(0.84),
    lineHeight: 1,
    letterSpacing: "-0.02em",
  } as CSSProperties,
  // Outcome badge styles
  outcomeBadge: {
    fontFamily: f.sans,
    fontSize: "11px",
    fontWeight: 600,
    color: f.ink(0.45),
    lineHeight: 1.4,
  } as CSSProperties,
};
