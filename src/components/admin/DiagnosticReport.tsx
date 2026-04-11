/**
 * DiagnosticReport — PDF-only component.
 *
 * ALL styling is hardcoded inline (no CSS vars, no Tailwind, no gap, no Lucide).
 * This is the only way to guarantee html2canvas renders it correctly.
 */

export interface DiagnosticData {
  contact: {
    firstName: string;
    lastName: string;
    organization: string | null;
    email: string;
    date: string;
  };
  readinessScore: number;
  quizSummary: { advancedCount: number; total: number };
  dimensionResults: Array<{
    dimension: string;
    picked: "advanced" | "conventional";
    pickedLabel: string;
    shift: string;
    recommendation: string;
  }>;
  painPoints: string[];
  metricsTracked: string[];
  metricsMissing: string[];
  selectedPractices: string[];
  sectors: string[];
  executiveSummary: string;
  gapInsights: Record<string, string>;
  contactEmail: string;
  bookingLink: string;
}

/* ── Hardcoded colors (warm black = rgb(28,25,23), matches design tokens) ── */
const INK = (a: number) => `rgba(28, 25, 23, ${a})`;
const CREAM = "#FAF9F7";
const FONT = "'Inter', system-ui, sans-serif";
const GREEN = "hsl(142, 71%, 45%)";
const GREEN_DARK = "hsl(142, 71%, 35%)";
const ORANGE = "hsl(25, 95%, 53%)";
const ORANGE_DARK = "hsl(25, 85%, 43%)";

/* ── Inline SVG icons (no Lucide dependency) ── */
function CheckIcon({ size = 12, color = GREEN }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XIcon({ size = 12, color = ORANGE }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function ArrowIcon({ size = 12, color = ORANGE_DARK }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function TrendIcon({ size = 14, color = INK(0.4) }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

/* ── ScoreRing — centered with transform, not flex ── */
function ScoreRing({ score }: { score: number }) {
  const size = 120;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const color = score <= 25
    ? "hsl(0, 72%, 51%)"
    : score <= 50
    ? "hsl(25, 95%, 53%)"
    : score <= 75
    ? "hsl(45, 93%, 47%)"
    : "hsl(142, 71%, 45%)";

  const label = score <= 25 ? "Critical" : score <= 50 ? "Significant gaps" : score <= 75 ? "Moderate" : "Advanced";

  return (
    <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block", position: "absolute", top: 0, left: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={INK(0.06)} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Text centered via top/left 50% + translate */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: FONT, fontSize: "32px", fontWeight: 800, color: INK(0.85), lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color, letterSpacing: "0.04em", marginTop: "4px" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ── DimensionBar ── */
function DimensionBar({ dimension, picked }: { dimension: string; picked: "advanced" | "conventional" }) {
  const isAdvanced = picked === "advanced";
  return (
    <div style={{ display: "flex", alignItems: "center", height: "32px", marginBottom: "4px" }}>
      <span style={{
        fontFamily: FONT, fontSize: "11px", fontWeight: 600,
        color: INK(0.6), width: "90px", textAlign: "right", flexShrink: 0,
        marginRight: "12px",
      }}>
        {dimension}
      </span>
      <div style={{ flex: 1, position: "relative", height: "6px", borderRadius: "3px", background: INK(0.05) }}>
        <div
          style={{
            position: "absolute", top: 0,
            left: isAdvanced ? "50%" : "0",
            width: "50%", height: "100%", borderRadius: "3px",
            background: isAdvanced ? GREEN : ORANGE,
          }}
        />
        <div style={{
          position: "absolute", top: "-3px", left: "50%", transform: "translateX(-50%)",
          width: "1px", height: "12px", background: INK(0.15),
        }} />
      </div>
      <span style={{
        fontFamily: FONT, fontSize: "9px", fontWeight: 600,
        color: isAdvanced ? GREEN_DARK : ORANGE_DARK,
        width: "80px", flexShrink: 0, letterSpacing: "0.02em",
        marginLeft: "12px",
      }}>
        {isAdvanced ? "Advanced" : "Conventional"}
      </span>
    </div>
  );
}

/* ── GapCard ── */
function GapCard({ dimension, shift, recommendation, insight }: {
  dimension: string; shift: string; recommendation: string; insight?: string;
}) {
  return (
    <div style={{
      padding: "16px 18px", borderRadius: "10px",
      background: INK(0.02), border: `1px solid ${INK(0.06)}`,
      marginBottom: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <div style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: ORANGE, flexShrink: 0, marginRight: "8px",
        }} />
        <span style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: INK(0.8) }}>
          {dimension}
        </span>
      </div>
      <p style={{ fontFamily: FONT, fontSize: "12.5px", color: INK(0.5), lineHeight: 1.6, margin: "0 0 8px" }}>
        {shift}
      </p>
      {insight && (
        <p style={{
          fontFamily: FONT, fontSize: "12px", color: INK(0.65), lineHeight: 1.55,
          margin: "0 0 8px", fontStyle: "italic",
          paddingLeft: "10px", borderLeft: `2px solid hsla(25, 95%, 53%, 0.3)`,
        }}>
          {insight}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <span style={{ marginRight: "6px", marginTop: "2px" }}>
          <ArrowIcon />
        </span>
        <p style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 600, color: INK(0.7), lineHeight: 1.5, margin: 0 }}>
          {recommendation}
        </p>
      </div>
    </div>
  );
}

/* ── Pill — inline-flex with explicit height for vertical centering ── */
function Pill({ children, filled = true }: { children: React.ReactNode; filled?: boolean }) {
  return (
    <span style={{
      fontFamily: FONT, fontSize: "11px", fontWeight: 500,
      padding: "0 12px",
      height: "28px",
      lineHeight: "28px",
      borderRadius: "999px",
      color: INK(filled ? 0.55 : 0.5),
      background: filled ? INK(0.04) : "transparent",
      border: `1px solid ${INK(filled ? 0.06 : 0.08)}`,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "8px",
      marginBottom: "8px",
    }}>
      {children}
    </span>
  );
}

/* ── MetricRow ── */
function MetricRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "6px" }}>
      <span style={{ flexShrink: 0, marginTop: "1px", marginRight: "6px" }}>{icon}</span>
      <span style={{ fontFamily: FONT, fontSize: "11px", color: INK(0.5), lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

/* ── Main Report ── */
export default function DiagnosticReport({ data }: { data: DiagnosticData }) {
  const dims = data.dimensionResults || [];
  const conventionalDims = dims.filter(d => d.picked === "conventional");

  return (
    <div id="diagnostic-report-capture" className="diagnostic-report" style={{ fontFamily: FONT, maxWidth: "800px", margin: "0 auto" }}>
      {/* ═══ PAGE 1: YOUR STRATEGIC POSITION ═══ */}
      <section style={{ marginBottom: "48px" }}>
        {/* Header + Score */}
        <div data-pdf-section style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <p style={{
              fontFamily: FONT, fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
              color: INK(0.3), marginBottom: "6px",
            }}>
              Strategic Diagnostic
            </p>
            <h1 style={{ fontFamily: FONT, fontSize: "22px", fontWeight: 800, color: INK(0.88), margin: "0 0 2px", lineHeight: 1.2 }}>
              {data.contact.firstName} {data.contact.lastName}
            </h1>
            {data.contact.organization && (
              <p style={{ fontFamily: FONT, fontSize: "14px", color: INK(0.45), margin: "2px 0 0" }}>
                {data.contact.organization}
              </p>
            )}
            <p style={{ fontFamily: FONT, fontSize: "11px", color: INK(0.3), marginTop: "6px" }}>{data.contact.date}</p>
          </div>
          <ScoreRing score={data.readinessScore} />
        </div>

        {/* Executive Summary */}
        {data.executiveSummary && (
          <div data-pdf-section style={{
            padding: "18px 22px", borderRadius: "12px",
            background: INK(0.03), border: `1px solid ${INK(0.06)}`,
            marginBottom: "28px",
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ marginRight: "8px" }}><TrendIcon /></span>
              <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: INK(0.35) }}>
                Strategic Analysis
              </span>
            </div>
            <p style={{ fontFamily: FONT, fontSize: "13.5px", color: INK(0.65), lineHeight: 1.7, margin: 0 }}>
              {data.executiveSummary}
            </p>
          </div>
        )}

        {/* Dimension Bars */}
        <div data-pdf-section style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: INK(0.3) }}>
              5-Dimension Assessment
            </span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: FONT, fontSize: "9px", color: INK(0.3), marginRight: "16px" }}>← Conventional</span>
              <span style={{ fontFamily: FONT, fontSize: "9px", color: INK(0.3) }}>Advanced →</span>
            </div>
          </div>
          {dims.map(d => (
            <DimensionBar key={d.dimension} dimension={d.dimension} picked={d.picked} />
          ))}
        </div>

        {/* Pain Points + Sectors */}
        <div data-pdf-section>
          {data.painPoints.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: INK(0.3), display: "block", marginBottom: "8px" }}>
                Self-Identified Challenges
              </span>
              <div>
                {data.painPoints.map((p, i) => (
                  <Pill key={i}>{p}</Pill>
                ))}
              </div>
            </div>
          )}

          {data.sectors.length > 0 && (
            <div>
              <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: INK(0.3), display: "block", marginBottom: "8px" }}>
                Sectors of Interest
              </span>
              <div>
                {data.sectors.map((s, i) => (
                  <Pill key={i} filled={false}>{s}</Pill>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ PAGE 2: WHERE TO MOVE ═══ */}
      <section>
        <div data-pdf-section>
          <div style={{
            borderTop: `1px solid ${INK(0.08)}`, paddingTop: "32px", marginBottom: "24px",
          }}>
            <h2 style={{ fontFamily: FONT, fontSize: "18px", fontWeight: 800, color: INK(0.85), margin: "0 0 4px" }}>
              Where to Move
            </h2>
            <p style={{ fontFamily: FONT, fontSize: "12.5px", color: INK(0.4), margin: 0 }}>
              Actionable recommendations for your {conventionalDims.length} gap{conventionalDims.length !== 1 ? "s" : ""}
            </p>
          </div>

          {conventionalDims.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              {conventionalDims.map(d => (
                <GapCard
                  key={d.dimension}
                  dimension={d.dimension}
                  shift={d.shift}
                  recommendation={d.recommendation}
                  insight={data.gapInsights[d.dimension]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Measurement Gaps */}
        {(data.metricsTracked.length > 0 || data.metricsMissing.length > 0) && (
          <div data-pdf-section style={{ marginBottom: "28px" }}>
            <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: INK(0.3), display: "block", marginBottom: "12px" }}>
              Measurement Gaps
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "16px" }}>
              <div style={{ padding: "14px 16px", borderRadius: "10px", background: "hsla(142, 71%, 45%, 0.04)", border: "1px solid hsla(142, 71%, 45%, 0.1)" }}>
                <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: GREEN_DARK, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Currently tracking
                </span>
                {data.metricsTracked.map((m, i) => (
                  <MetricRow key={i} icon={<CheckIcon />} label={m} />
                ))}
              </div>
              <div style={{ padding: "14px 16px", borderRadius: "10px", background: "hsla(25, 95%, 53%, 0.04)", border: "1px solid hsla(25, 95%, 53%, 0.1)" }}>
                <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: ORANGE_DARK, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Not yet measuring
                </span>
                {data.metricsMissing.map((m, i) => (
                  <MetricRow key={i} icon={<XIcon />} label={m} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Priority Practices + CTA */}
        <div data-pdf-section>
          {data.selectedPractices.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: INK(0.3), display: "block", marginBottom: "8px" }}>
                Priority Practices
              </span>
              <div>
                {data.selectedPractices.map((p, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: FONT, fontSize: "11px", fontWeight: 600,
                      padding: "0 14px",
                      height: "30px",
                      lineHeight: "30px",
                      borderRadius: "999px",
                      color: INK(0.7), background: INK(0.04),
                      border: `1px solid ${INK(0.08)}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{
            padding: "20px 24px", borderRadius: "12px",
            background: INK(0.03), border: `1px solid ${INK(0.06)}`,
            textAlign: "center",
          }}>
            <p style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 700, color: INK(0.75), margin: "0 0 6px" }}>
              Ready to close the gaps?
            </p>
            <p style={{ fontFamily: FONT, fontSize: "12.5px", color: INK(0.45), margin: "0 0 12px", lineHeight: 1.5 }}>
              Let's discuss how to move your portfolio from where it is to where it needs to be.
            </p>
            <div style={{ textAlign: "center" }}>
              {data.bookingLink && (
                <a
                  href={data.bookingLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontFamily: FONT, fontSize: "12px", fontWeight: 600,
                    padding: "0 20px",
                    height: "34px",
                    lineHeight: "34px",
                    borderRadius: "999px",
                    background: INK(0.88), color: CREAM, textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  Book a call
                </a>
              )}
              <a
                href={`mailto:${data.contactEmail}`}
                style={{
                  fontFamily: FONT, fontSize: "12px", fontWeight: 600,
                  padding: "0 20px",
                  height: "34px",
                  lineHeight: "34px",
                  borderRadius: "999px",
                  color: INK(0.5), border: `1px solid ${INK(0.12)}`,
                  background: "transparent",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
