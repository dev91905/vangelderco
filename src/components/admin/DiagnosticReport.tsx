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
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.ink(0.06)} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
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
    <div className="flex items-center gap-3" style={{ height: "32px" }}>
      <span style={{
        fontFamily: t.sans, fontSize: "11px", fontWeight: 600,
        color: t.ink(0.6), width: "90px", textAlign: "right", flexShrink: 0,
      }}>
        {dimension}
      </span>
      <div className="flex-1 relative" style={{ height: "6px", borderRadius: "3px", background: t.ink(0.05) }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: isAdvanced ? "50%" : "0",
            width: "50%",
            height: "100%",
            borderRadius: "3px",
            background: isAdvanced ? "hsl(142 71% 45%)" : "hsl(25 95% 53%)",
            transition: "all 0.6s ease",
          }}
        />
        {/* Center marker */}
        <div style={{
          position: "absolute", top: "-3px", left: "50%", transform: "translateX(-50%)",
          width: "1px", height: "12px", background: t.ink(0.15),
        }} />
      </div>
      <span style={{
        fontFamily: t.sans, fontSize: "9px", fontWeight: 600,
        color: isAdvanced ? "hsl(142 71% 35%)" : "hsl(25 85% 43%)",
        width: "80px", flexShrink: 0,
        letterSpacing: "0.02em",
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
      padding: "16px 18px",
      borderRadius: "10px",
      background: t.ink(0.02),
      border: `1px solid ${t.ink(0.06)}`,
    }}>
      <div className="flex items-center gap-2 mb-2">
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
      <div className="flex items-start gap-1.5">
        <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "hsl(25 85% 43%)" }} />
        <p style={{ fontFamily: t.sans, fontSize: "12px", fontWeight: 600, color: t.ink(0.7), lineHeight: 1.5, margin: 0 }}>
          {recommendation}
        </p>
      </div>
    </div>
  );
}

export default function DiagnosticReport({ data }: { data: DiagnosticData }) {
  const dims = data.dimensionResults || [];
  const conventionalDims = dims.filter(d => d.picked === "conventional");

  return (
    <div className="diagnostic-report" style={{ fontFamily: t.sans, maxWidth: "800px", margin: "0 auto" }}>
      {/* ═══ PAGE 1: YOUR STRATEGIC POSITION ═══ */}
      <section style={{ marginBottom: "48px", pageBreakAfter: "always" }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
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
          <div className="relative">
            <ScoreRing score={data.readinessScore} />
          </div>
        </div>

        {/* Executive Summary callout */}
        {data.executiveSummary && (
          <div style={{
            padding: "18px 22px",
            borderRadius: "12px",
            background: t.ink(0.03),
            border: `1px solid ${t.ink(0.06)}`,
            marginBottom: "28px",
          }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: t.ink(0.4) }} />
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
        <div style={{ marginBottom: "28px" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3) }}>
              5-Dimension Assessment
            </span>
            <div className="flex items-center gap-4">
              <span style={{ fontSize: "9px", color: t.ink(0.3) }}>← Conventional</span>
              <span style={{ fontSize: "9px", color: t.ink(0.3) }}>Advanced →</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {dims.map(d => (
              <DimensionBar key={d.dimension} dimension={d.dimension} picked={d.picked} />
            ))}
          </div>
        </div>

        {/* Pain Points chips */}
        {data.painPoints.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3), display: "block", marginBottom: "8px" }}>
              Self-Identified Challenges
            </span>
            <div className="flex flex-wrap gap-2">
              {data.painPoints.map((p, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: t.sans, fontSize: "11px", fontWeight: 500,
                    padding: "5px 12px", borderRadius: "999px",
                    color: t.ink(0.55), background: t.ink(0.04),
                    border: `1px solid ${t.ink(0.06)}`,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sectors */}
        {data.sectors.length > 0 && (
          <div>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3), display: "block", marginBottom: "8px" }}>
              Sectors of Interest
            </span>
            <div className="flex flex-wrap gap-2">
              {data.sectors.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: t.sans, fontSize: "11px", fontWeight: 500,
                    padding: "5px 12px", borderRadius: "999px",
                    color: t.ink(0.5), background: "transparent",
                    border: `1px solid ${t.ink(0.08)}`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══ PAGE 2: WHERE TO MOVE ═══ */}
      <section>
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

        {/* Priority Gap Cards */}
        {conventionalDims.length > 0 && (
          <div className="flex flex-col gap-3" style={{ marginBottom: "28px" }}>
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

        {/* Measurement Split */}
        {(data.metricsTracked.length > 0 || data.metricsMissing.length > 0) && (
          <div style={{ marginBottom: "28px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3), display: "block", marginBottom: "12px" }}>
              Measurement Gaps
            </span>
            <div className="grid grid-cols-2 gap-4">
              {/* Tracked */}
              <div style={{ padding: "14px 16px", borderRadius: "10px", background: "hsl(142 71% 45% / 0.04)", border: "1px solid hsl(142 71% 45% / 0.1)" }}>
                <span style={{ fontSize: "10px", fontWeight: 600, color: "hsl(142 71% 35%)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Currently tracking
                </span>
                <div className="flex flex-col gap-1.5">
                  {data.metricsTracked.map((m, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "hsl(142 71% 45%)" }} />
                      <span style={{ fontSize: "11px", color: t.ink(0.5), lineHeight: 1.4 }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Missing */}
              <div style={{ padding: "14px 16px", borderRadius: "10px", background: "hsl(25 95% 53% / 0.04)", border: "1px solid hsl(25 95% 53% / 0.1)" }}>
                <span style={{ fontSize: "10px", fontWeight: 600, color: "hsl(25 85% 43%)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Not yet measuring
                </span>
                <div className="flex flex-col gap-1.5">
                  {data.metricsMissing.map((m, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "hsl(25 95% 53%)" }} />
                      <span style={{ fontSize: "11px", color: t.ink(0.5), lineHeight: 1.4 }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Practices */}
        {data.selectedPractices.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.3), display: "block", marginBottom: "8px" }}>
              Priority Practices
            </span>
            <div className="flex flex-wrap gap-2">
              {data.selectedPractices.map((p, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: t.sans, fontSize: "11px", fontWeight: 600,
                    padding: "6px 14px", borderRadius: "999px",
                    color: t.ink(0.7), background: t.ink(0.04),
                    border: `1px solid ${t.ink(0.08)}`,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps CTA */}
        <div style={{
          padding: "20px 24px",
          borderRadius: "12px",
          background: t.ink(0.03),
          border: `1px solid ${t.ink(0.06)}`,
          textAlign: "center",
        }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: t.ink(0.75), margin: "0 0 6px" }}>
            Ready to close the gaps?
          </p>
          <p style={{ fontSize: "12.5px", color: t.ink(0.45), margin: "0 0 12px", lineHeight: 1.5 }}>
            Let's discuss how to move your portfolio from where it is to where it needs to be.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href={data.bookingLink || `mailto:${data.contactEmail}`}
              target={data.bookingLink ? "_blank" : undefined}
              rel={data.bookingLink ? "noreferrer" : undefined}
              style={{
                fontFamily: t.sans, fontSize: "12px", fontWeight: 600,
                padding: "8px 20px", borderRadius: "999px",
                background: t.ink(0.88), color: t.cream, textDecoration: "none",
                display: "inline-block",
              }}
            >
              Get in touch
            </a>
            {data.bookingLink && (
              <a
                href={data.bookingLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: t.sans, fontSize: "12px", fontWeight: 600,
                  padding: "8px 20px", borderRadius: "999px",
                  color: t.ink(0.5), border: `1px solid ${t.ink(0.12)}`,
                  textDecoration: "none", display: "inline-block",
                }}
              >
                Book a call
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
