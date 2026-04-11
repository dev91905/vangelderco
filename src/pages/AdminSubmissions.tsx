import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, ChevronDown, ChevronUp, Copy, Check, FileText, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/theme";
import { getScoreLabel } from "@/lib/deckScoring";
import { formatDistanceToNow } from "date-fns";

/* ─── Types ─── */
interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  organization: string | null;
  email: string;
  custom_challenge: string | null;
  selected_pains: string[] | null;
  selected_domains: string[] | null;
  engagement_path: string | null;
  readiness_score: number | null;
  quiz_answers: Array<{ dimension: string; picked: string }> | null;
  metrics_checked: string[] | null;
  capabilities_ranked: string[] | null;
  has_media_experience: boolean | null;
  practice_selections: number[] | null;
  created_at: string;
}

/* ─── Constants for display ─── */
const PAIN_LABELS: Record<string, string> = {
  history: "Just getting started",
  evaluate: "Funding comms, no strategy",
  access: "Limited channels",
  measurement: "Not sure what to measure",
  expertise: "No expertise in-house",
};

const CAPABILITY_LABELS: Record<string, string> = {
  audit: "Portfolio Audit",
  framework: "Strategy Development",
  access: "Access & Introductions",
  measurement: "Impact Measurement",
  training: "Staff Training",
  program: "Program Management",
};

const ALL_METRICS = [
  "Media placements", "Audience reach", "Social engagement", "Message recall",
  "Earned media value", "Grantee output volume", "New people at the table",
  "Sectors aligned", "Narrative adoption", "Leaders developed", "Policy moved", "Capital unlocked",
];

const AdminSubmissions = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["deck-contacts-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_contacts" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Contact[];
    },
  });

  const selected = contacts?.find((c) => c.id === selectedId) || null;

  return (
    <div className="min-h-screen light" data-theme="light" style={{ background: t.cream, colorScheme: "light" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4" style={{ borderBottom: t.border(0.06) }}>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.05em] rounded-full transition-colors"
            style={{ fontFamily: t.sans, color: t.ink(0.4), border: t.border(0.1) }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.8); e.currentTarget.style.background = t.ink(0.05); }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.4); e.currentTarget.style.background = "transparent"; }}>
            <ArrowLeft className="w-3 h-3" /> Admin
          </Link>
          <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: t.sans, color: t.ink(0.85) }}>Submissions</h1>
          {contacts && <span style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.35) }}>{contacts.length} total</span>}
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }}
          className="p-2 rounded-xl transition-colors" style={{ border: t.border(0.06) }} title="Sign out"
          onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
          <LogOut className="w-4 h-4" style={{ color: t.ink(0.3) }} />
        </button>
      </div>

      <div className="flex" style={{ minHeight: "calc(100vh - 57px)" }}>
        {/* Left: List */}
        <div className="w-full max-w-[420px] overflow-y-auto" style={{ borderRight: t.border(0.06) }}>
          {isLoading && <p className="p-6" style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.3) }}>Loading…</p>}
          {contacts?.map((c) => {
            const score = c.readiness_score;
            const info = score != null ? getScoreLabel(score) : null;
            const isActive = c.id === selectedId;
            const nextgenCount = c.quiz_answers?.filter((a) => a.picked === "nextgen").length ?? 0;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="w-full text-left px-5 py-4 transition-colors"
                style={{
                  borderBottom: t.border(0.04),
                  background: isActive ? t.ink(0.04) : "transparent",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = t.ink(0.02); }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div className="flex items-center gap-2">
                  <p style={{ fontFamily: t.sans, fontSize: "14px", fontWeight: 600, color: t.ink(0.8) }}>
                    {c.first_name} {c.last_name}
                  </p>
                  {info && (
                    <span style={{
                      fontFamily: t.sans, fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "999px", marginLeft: "auto",
                      color: info.color, background: `${info.color}15`, border: `1px solid ${info.color}30`,
                    }}>
                      {score}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.organization && <span style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.4) }}>{c.organization}</span>}
                  <span style={{ fontFamily: t.sans, fontSize: "10px", color: t.ink(0.25), marginLeft: c.organization ? "0" : "0" }}>
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.35), marginTop: "2px" }}>
                  {nextgenCount}/5 advanced · {c.metrics_checked?.length ?? 0} metrics · {c.selected_domains?.length ?? 0} sectors
                </p>
              </button>
            );
          })}
        </div>

        {/* Right: Detail */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ fontFamily: t.sans, fontSize: "14px", color: t.ink(0.25) }}>Select a submission to view details</p>
            </div>
          ) : (
            <SubmissionDetail contact={selected} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Detail View ─── */
const SubmissionDetail = ({ contact }: { contact: Contact }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const c = contact;
  const score = c.readiness_score;
  const info = score != null ? getScoreLabel(score) : null;
  const nextgenCount = c.quiz_answers?.filter((a) => a.picked === "nextgen").length ?? 0;

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-diagnostic", {
        body: { contactId: c.id },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setReport(data.report);
    } catch (e: any) {
      setError(e.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(c.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExportPdf = async () => {
    if (!report) return;
    setPdfLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("export-diagnostic-pdf", {
        body: {
          contactId: c.id,
          reportMarkdown: report,
          contactName: `${c.first_name} ${c.last_name}`,
          organization: c.organization,
          score: c.readiness_score,
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      // data.pdf is base64
      const binary = atob(data.pdf);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VGC-Diagnostic-${c.first_name}-${c.last_name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("PDF export failed:", e);
      alert("PDF export failed: " + (e.message || "Unknown error"));
    } finally {
      setPdfLoading(false);
    }
  };

  const metricsChecked = c.metrics_checked || [];
  const metricsNotChecked = ALL_METRICS.filter((m) => !metricsChecked.includes(m));

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Left: Diagnostic Report */}
      <div className="flex-1 p-6 lg:p-10 max-w-[780px]">
        <div className="flex items-center gap-3 mb-6">
          <h2 style={{ fontFamily: t.sans, fontSize: "22px", fontWeight: 700, color: t.ink(0.9) }}>
            Diagnostic Report
          </h2>
          {info && (
            <span style={{
              fontFamily: t.sans, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px",
              color: info.color, background: `${info.color}15`, border: `1px solid ${info.color}30`,
            }}>
              {score} · {info.label}
            </span>
          )}
        </div>

        {!report && !loading && (
          <div className="flex flex-col items-center gap-4 py-16" style={{ border: `1px dashed ${t.ink(0.1)}`, borderRadius: "12px" }}>
            <FileText className="w-8 h-8" style={{ color: t.ink(0.15) }} />
            <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.35) }}>
              Generate a personalized diagnostic using AI
            </p>
            <button onClick={generateReport} style={{
              fontFamily: t.sans, fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em",
              padding: "10px 24px", borderRadius: "999px", cursor: "pointer",
              color: t.cream, background: t.ink(0.85), border: "none",
              transition: "background 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(1))}
              onMouseLeave={(e) => (e.currentTarget.style.background = t.ink(0.85))}
            >
              Generate Report
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 py-16 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: t.ink(0.3) }} />
            <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.35) }}>Generating diagnostic…</p>
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.error() }}>{error}</p>
            <button onClick={generateReport} style={{
              fontFamily: t.sans, fontSize: "12px", marginTop: "12px", color: t.ink(0.5), background: "none", border: t.border(0.1), padding: "8px 20px", borderRadius: "999px", cursor: "pointer",
            }}>Retry</button>
          </div>
        )}

        {report && (
          <div className="prose-report" style={{ fontFamily: t.sans }}>
            <MarkdownRenderer content={report} />
          </div>
        )}
      </div>

      {/* Right: Contact & Actions */}
      <div className="w-full lg:w-[320px] p-6 lg:p-8 lg:border-l" style={{ borderColor: t.ink(0.06) }}>
        <div className="sticky top-8">
          <p style={{ fontFamily: t.sans, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: t.ink(0.3), marginBottom: "16px" }}>Contact</p>

          <p style={{ fontFamily: t.sans, fontSize: "18px", fontWeight: 700, color: t.ink(0.85) }}>
            {c.first_name} {c.last_name}
          </p>
          {c.organization && <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.5), marginTop: "2px" }}>{c.organization}</p>}
          <a href={`mailto:${c.email}`} style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.5), textDecoration: "underline", textUnderlineOffset: "2px", display: "block", marginTop: "4px" }}>{c.email}</a>

          <p style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.25), marginTop: "8px" }}>
            Submitted {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
          </p>

          {/* Quick stats */}
          <div className="flex flex-col gap-2 mt-6 pt-6" style={{ borderTop: t.border(0.06) }}>
            <StatRow label="Quiz score" value={`${nextgenCount}/5 advanced`} />
            <StatRow label="Engagement path" value={c.engagement_path === "fresh" ? "Starting fresh" : c.engagement_path === "experienced" ? "Already active" : "—"} />
            <StatRow label="Metrics tracked" value={`${metricsChecked.length} of ${ALL_METRICS.length}`} />
            <StatRow label="Sectors selected" value={`${c.selected_domains?.length ?? 0}`} />
            <StatRow label="Practices selected" value={`${c.practice_selections?.length ?? 0} of 3`} />
            {c.capabilities_ranked && c.capabilities_ranked.length > 0 && (
              <StatRow label="Priority capabilities" value={c.capabilities_ranked.map((id) => CAPABILITY_LABELS[id] || id).join(", ")} />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-6 pt-6" style={{ borderTop: t.border(0.06) }}>
            {report && (
              <button onClick={handleExportPdf} disabled={pdfLoading} style={{
                fontFamily: t.sans, fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em",
                padding: "10px 20px", borderRadius: "999px", cursor: "pointer",
                color: t.cream, background: t.ink(0.85), border: "none",
                transition: "background 0.2s", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(1))}
                onMouseLeave={(e) => (e.currentTarget.style.background = t.ink(0.85))}
              >
                {pdfLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</> : <><FileText className="w-3.5 h-3.5" /> Export as PDF</>}
              </button>
            )}
            <button onClick={handleCopyEmail} style={{
              fontFamily: t.sans, fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em",
              padding: "10px 20px", borderRadius: "999px", cursor: "pointer",
              color: t.ink(0.6), background: "transparent", border: t.border(0.12),
              transition: "all 0.2s", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.ink(0.25); e.currentTarget.style.color = t.ink(0.8); }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.ink(0.12); e.currentTarget.style.color = t.ink(0.6); }}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy email</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Stat Row ─── */
const StatRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start gap-3">
    <p style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.4), flexShrink: 0 }}>{label}</p>
    <p style={{ fontFamily: t.sans, fontSize: "11px", fontWeight: 600, color: t.ink(0.65), textAlign: "right" }}>{value}</p>
  </div>
);

/* ─── Minimal Markdown Renderer ─── */
const MarkdownRenderer = ({ content }: { content: string }) => {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={key++} style={{ paddingLeft: "20px", margin: "8px 0 16px" }}>
        {listBuffer.map((item, i) => (
          <li key={i} style={{ fontFamily: t.sans, fontSize: "14px", color: t.ink(0.6), lineHeight: 1.7, marginBottom: "4px" }}>
            <InlineMarkdown text={item} />
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    // List item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listBuffer.push(trimmed.slice(2));
      continue;
    }

    flushList();

    // Headings
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={key++} style={{ fontFamily: t.sans, fontSize: "17px", fontWeight: 700, color: t.ink(0.85), marginTop: "32px", marginBottom: "12px", paddingBottom: "8px", borderBottom: t.border(0.06) }}>
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={key++} style={{ fontFamily: t.sans, fontSize: "14px", fontWeight: 700, color: t.ink(0.7), marginTop: "20px", marginBottom: "6px" }}>
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      elements.push(
        <p key={key++} style={{ fontFamily: t.sans, fontSize: "14px", fontWeight: 700, color: t.ink(0.7), marginTop: "16px", marginBottom: "4px" }}>
          {trimmed.slice(2, -2)}
        </p>
      );
    } else {
      elements.push(
        <p key={key++} style={{ fontFamily: t.sans, fontSize: "14px", color: t.ink(0.55), lineHeight: 1.75, marginBottom: "10px" }}>
          <InlineMarkdown text={trimmed} />
        </p>
      );
    }
  }
  flushList();

  return <>{elements}</>;
};

/* Inline bold/italic */
const InlineMarkdown = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} style={{ fontWeight: 700, color: t.ink(0.7) }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default AdminSubmissions;
