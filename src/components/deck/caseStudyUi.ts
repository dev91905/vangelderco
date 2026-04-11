import type { CSSProperties } from "react";
import { t } from "@/lib/theme";

const f = { sans: t.sans, ink: t.ink };

export const caseStudyUi = {
  radius: "18px",
  cardSurface: f.ink(0.02),
  cardSurfaceHover: f.ink(0.035),
  cardBorder: `1px solid ${f.ink(0.08)}`,
  cardBorderStrong: `1px solid ${f.ink(0.14)}`,
  rail: f.ink(0.08),
  railActive: f.ink(0.32),
  node: f.ink(0.14),
  nodeActive: f.ink(0.42),
  title: {
    fontFamily: f.sans,
    fontSize: "clamp(18px, 1.9vw, 24px)",
    fontWeight: 700,
    color: f.ink(0.84),
    lineHeight: 1.24,
    letterSpacing: "-0.02em",
  } as CSSProperties,
  body: {
    fontFamily: f.sans,
    fontSize: "clamp(13px, 1.15vw, 15px)",
    color: f.ink(0.44),
    lineHeight: 1.72,
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
    fontSize: "clamp(16px, 1.6vw, 20px)",
    fontWeight: 700,
    color: f.ink(0.84),
    letterSpacing: "-0.02em",
    lineHeight: 1,
  } as CSSProperties,
};
