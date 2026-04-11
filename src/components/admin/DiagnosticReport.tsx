import { t } from "@/lib/theme";
import { CheckCircle2, XCircle, ArrowRight, TrendingUp } from "lucide-react";

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

function ScoreRing({ score }: { score: number }) {
  const size = 120;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const color = score <= 25
    ? "hsl(0 72% 51%)"
    : score <= 50
    ? "hsl(25 95% 53%)"
    : score <= 75
    ? "hsl(45 93% 47%)"
    : "hsl(142 71% 45%)";

  const label = score <= 25 ? "Critical" : score <= 50 ? "Significant gaps" : score <= 75 ? "Moderate" : "Advanced";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.ink(0.06)} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, width: size, height: size,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: t.sans, fontSize: "32px", fontWeight: 800, color: t.ink(0.85), lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontFamily: t.sans, fontSize: "10px", fontWeight: 600, color, letterSpacing: "0.04em", marginTop: "4px" }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function DimensionBar({ dimension, picked }: { dimension: string; picked: "advanced" | "conventional" }) {
  const isAdvanced = picked === "advanced";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", height: "32px" }}>
      <span style={{
        fontFamily: t.sans, fontSize: "11px", fontWeight: 600,
        color: t.ink(0.6), width: "90px", textAlign: "right", flexShrink: 0,
      }}>
        {dimension}
      </span>
      <div style={{ flex: 1, position: "relative", height: "6px", borderRadius: "3px", background: t.ink(0.05) }}>
        <div
          style={{
            position: "absolute", top: 0,
            left: isAdvanced ? "50%" : "0",
            width: "50%", height: "100%", borderRadius: "3px",
            background: isAdvanced ? "hsl(142 71% 45%)" : "hsl(25 95% 53%)",
          }}
        />
        <div style={{
          position: "absolute", top: "-3px", left: "50%", transform: "translateX(-50%)",
          width: "1px", height: "12px", background: t.ink(0.15),
        }} />
      </div>
      <span style={{
        fontFamily: t.sans, fontSize: "9px", fontWeight: 600,
        color: isAdvanced ? "hsl(142 71% 35%)" : "hsl(25 85% 43%)",
        width: "80px", flexShrink: 0, letterSpacing: "0.02em",
      }}>
        {isAdvanced ? "Advanced" : "Conventional"}
      </span>
    </div>
  );
}

function GapCard({ dimension, shift, recommendation, insight }: {
  dimension: string; shift: string; recommendation: string; insight?: string;
}) {
  return (
    <div style={{
      padding: "16px 18px", borderRadius: "10px",
      background: t.ink(0.02), border: `1px solid ${t.ink(0.06)}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <div style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: "hsl(25 95% 53%)", flexShrink: 0,
        }} />
        <span style={{ fontFamily: t.sans, fontSize: "13px", fontWeight: 700, color: t.ink(0.8) }}>
          {dimension}
        </span>
      </div>
      <p style={{ fontFamily: t.sans, fontSize: "12.5px", color: t.ink(0.5), lineHeight: 1.6, margin: "0 0 8px" }}>
        {shift}
      </p>
      {insight && (
        <p style={{
          fontFamily: t.sans, fontSize: "12px", color: t.ink(0.65), lineHeight: 1.55,
          margin: "0 0 8px", fontStyle: "italic",
          paddingLeft: "10px", borderLeft: `2px solid hsl(25 95% 53% / 0.3)`,
        }}>
          {insight}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
        <ArrowRight style={{ width: "12px", height: "12px", marginTop: "2px", flexShrink: 0, color: "hsl(25 85% 43%)" }} />
        <p style={{ fontFamily: t.sans, fontSize: "12px", fontWeight: 600, color: t.ink(0.7), lineHeight: 1.5, margin: 0 }}>
          {recommendation}
        </p>
      </div>
    </div>
  );
}

function Pill({ children, filled = true }: { children: React.ReactNode; filled?: boolean }) {
  return (
    <span style={{
      fontFamily: t.sans, fontSize: "11px", fontWeight: filled ? 500 : 500,
      padding: "5px 12px", borderRadius: "999px",
      color: t.ink(filled ? 0.55 : 0.5),
      background: filled ? t.ink(0.04) : "transparent",
      border: `1px solid ${t.ink(filled ? 0.06 : 0.08)}`,
      display: "inline-block",
    }}>
      {children}
    </span>
  );
}

function MetricRow({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "6px" }}>
      <span style={{ flexShrink: 0, marginTop: "1px", color, width: "12px", height: "12px" }}>{icon}</span>
      <span style={{ fontSize: "11px", color: t.ink(0.5), lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

export default function DiagnosticReport({ data }: { data: DiagnosticData }) {
  const dims = data.dimensionResults || [];
  const conventionalDims = dims.filter(d => d.picked === "conventional");

  return (
    <div id="diagnostic-report-capture" className="diagnostic-report" style={{ fontFamily: t.sans, maxWidth: "800px", margin: "0 auto" }}>
      {/* ═══ PAGE 1: YOUR STRATEGIC POSITION ═══ */}
      <section style={{ marginBottom: "48px" }}>
        {/* Header + Score */}
        <div data-pdf-section style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <p style={{
              fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
              color: t.ink(0.3), marginBottom: "6px",
            }}>
              Strategic Diagnostic
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: t.ink(0.88), margin: "0 0 2px", lineHeight: 1.2 }}>
              {data.contact.firstName} {data.contact.lastName}
            </h1>
            {data.contact.organization && (
              <p style={{ fontSize: "14px", color: t.ink(0.45), margin: "2px 0 0" }}>
                {data.contact.organization}
              </p>
            )}
            <p style={{ fontSize: "11px", color: t.ink(0.3), marginTop: "6px" }}>{data.contact.date}</p>
          </div>
          <ScoreRing score={data.readinessScore} />
        </div>

        {/* Executive Summary callout */}
        {data.executiveSummary && (
          <div data-pdf-section style={{
            padding: "18px 22px", borderRadius: "12px",
            background: t.ink(0.03), border: `1px solid ${t.ink(0.06)}`,
            marginBottom: "28px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <TrendingUp style={{ width: "14px", height: "14px", color: t.ink(0.4) }} />
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.35) }}>
                Strategic Analysis
              </span>
            </div>
            <p style={{ fontSize: "13.5px", color: t.ink(0.65), lineHeight: 1.7, margin: 0 }}>
              {data.executiveSummary}
            </p>
          </div>
        )}

        {/* Dimension Bar Chart */}
        <div data-pdf-section style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3) }}>
              5-Dimension Assessment
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "9px", color: t.ink(0.3) }}>← Conventional</span>
              <span style={{ fontSize: "9px", color: t.ink(0.3) }}>Advanced →</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {dims.map(d => (
              <DimensionBar key={d.dimension} dimension={d.dimension} picked={d.picked} />
            ))}
          </div>
        </div>

        {/* Pain Points + Sectors */}
        <div data-pdf-section>
          {data.painPoints.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3), display: "block", marginBottom: "8px" }}>
                Self-Identified Challenges
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.painPoints.map((p, i) => (
                  <Pill key={i}>{p}</Pill>
                ))}
              </div>
            </div>
          )}

          {data.sectors.length > 0 && (
            <div>
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3), display: "block", marginBottom: "8px" }}>
                Sectors of Interest
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
        {/* Where to Move heading + Gap Cards */}
        <div data-pdf-section>
          <div style={{
            borderTop: `1px solid ${t.ink(0.08)}`, paddingTop: "32px", marginBottom: "24px",
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: t.ink(0.85), margin: "0 0 4px" }}>
              Where to Move
            </h2>
            <p style={{ fontSize: "12.5px", color: t.ink(0.4), margin: 0 }}>
              Actionable recommendations for your {conventionalDims.length} gap{conventionalDims.length !== 1 ? "s" : ""}
            </p>
          </div>

          {conventionalDims.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
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
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3), display: "block", marginBottom: "12px" }}>
              Measurement Gaps
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ padding: "14px 16px", borderRadius: "10px", background: "hsl(142 71% 45% / 0.04)", border: "1px solid hsl(142 71% 45% / 0.1)" }}>
                <span style={{ fontSize: "10px", fontWeight: 600, color: "hsl(142 71% 35%)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Currently tracking
                </span>
                {data.metricsTracked.map((m, i) => (
                  <MetricRow key={i} icon={<CheckCircle2 style={{ width: "12px", height: "12px" }} />} label={m} color="hsl(142 71% 45%)" />
                ))}
              </div>
              <div style={{ padding: "14px 16px", borderRadius: "10px", background: "hsl(25 95% 53% / 0.04)", border: "1px solid hsl(25 95% 53% / 0.1)" }}>
                <span style={{ fontSize: "10px", fontWeight: 600, color: "hsl(25 85% 43%)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Not yet measuring
                </span>
                {data.metricsMissing.map((m, i) => (
                  <MetricRow key={i} icon={<XCircle style={{ width: "12px", height: "12px" }} />} label={m} color="hsl(25 95% 53%)" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Priority Practices + CTA */}
        <div data-pdf-section>
          {data.selectedPractices.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3), display: "block", marginBottom: "8px" }}>
                Priority Practices
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.selectedPractices.map((p, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: t.sans, fontSize: "11px", fontWeight: 600,
                      padding: "6px 14px", borderRadius: "999px",
                      color: t.ink(0.7), background: t.ink(0.04),
                      border: `1px solid ${t.ink(0.08)}`,
                      display: "inline-block",
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
            background: t.ink(0.03), border: `1px solid ${t.ink(0.06)}`,
            textAlign: "center",
          }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: t.ink(0.75), margin: "0 0 6px" }}>
              Ready to close the gaps?
            </p>
            <p style={{ fontSize: "12.5px", color: t.ink(0.45), margin: "0 0 12px", lineHeight: 1.5 }}>
              Let's discuss how to move your portfolio from where it is to where it needs to be.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              {data.bookingLink && (
                <a
                  href={data.bookingLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontFamily: t.sans, fontSize: "12px", fontWeight: 600,
                    padding: "8px 20px", borderRadius: "999px",
                    background: t.ink(0.88), color: t.cream, textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Book a call
                </a>
              )}
              <a
                href={`mailto:${data.contactEmail}`}
                style={{
                  fontFamily: t.sans, fontSize: "12px", fontWeight: 600,
                  padding: "8px 20px", borderRadius: "999px",
                  color: t.ink(0.5), border: `1px solid ${t.ink(0.12)}`,
                  textDecoration: "none", display: "inline-block",
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
