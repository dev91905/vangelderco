import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Copy, Check, FileText, Mail, ChevronLeft, RefreshCw } from "lucide-react";
import { generateDiagnosticPdf } from "@/components/admin/DiagnosticPdfDocument";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/theme";
import { getScoreLabel } from "@/lib/deckScoring";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import DiagnosticReport, { type DiagnosticData } from "@/components/admin/DiagnosticReport";

type Contact = {
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
  quiz_answers: any[] | null;
  metrics_checked: string[] | null;
  metrics_unchecked: string[] | null;
  capabilities_ranked: string[] | null;
  has_media_experience: boolean | null;
  practice_selections: number[] | null;
  sectors_not_selected: string[] | null;
  report_cache: string | null;
  report_status: string | null;
  created_at: string;
};

const useContacts = () =>
  useQuery({
    queryKey: ["deck-contacts-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_contacts" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Contact[];
    },
  });

const readinessLabel = (score: number | null) => {
  if (score === null || score === undefined) return { label: "—", hint: "", color: t.ink(0.4) };
  const info = getScoreLabel(score);
  const hints: Record<string, string> = {
    critical: "Full diagnostic needed",
    significant: "Strong engagement candidate",
    moderate: "Targeted support needed",
    advanced: "Light-touch advisory only",
  };
  return { label: info.label, hint: hints[info.severity], color: info.color };
};

const StatusPill = ({ status }: { status: string | null }) => {
  const isSent = status === "sent";
  return (
    <span
      style={{
        fontFamily: t.sans,
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        padding: "3px 10px",
        borderRadius: "999px",
        color: isSent ? "hsl(142 71% 35%)" : t.ink(0.5),
        background: isSent ? "hsl(142 71% 45% / 0.1)" : t.ink(0.04),
        border: `1px solid ${isSent ? "hsl(142 71% 45% / 0.2)" : t.ink(0.08)}`,
      }}
    >
      {isSent ? "Report sent" : "Pending review"}
    </span>
  );
};

/* ═══ LIST VIEW ═══ */
const SubmissionsList = ({ contacts, onSelect }: { contacts: Contact[]; onSelect: (c: Contact) => void }) => (
  <div className="space-y-3 p-4 md:p-6">
    {contacts.length === 0 && (
      <p style={{ fontFamily: t.sans, fontSize: "14px", color: t.ink(0.35), padding: "40px 0", textAlign: "center" }}>
        No submissions yet.
      </p>
    )}
    {contacts.map((c) => (
      <button
        key={c.id}
        onClick={() => onSelect(c)}
        className="w-full rounded-[26px] border text-left transition-all duration-200"
        style={{
          padding: "20px 22px",
          background: t.white,
          borderColor: t.ink(0.06),
          cursor: "pointer",
          boxShadow: `0 18px 40px -34px ${t.ink(0.18)}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = t.ink(0.015);
          e.currentTarget.style.borderColor = t.ink(0.12);
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `0 28px 56px -40px ${t.ink(0.18)}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = t.white;
          e.currentTarget.style.borderColor = t.ink(0.06);
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = `0 18px 40px -34px ${t.ink(0.18)}`;
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ fontFamily: t.sans, fontSize: "15px", fontWeight: 600, color: t.ink(0.82) }}>
                {c.first_name} {c.last_name}
              </span>
              {c.organization && (
                <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.42), background: t.ink(0.03), border: `1px solid ${t.ink(0.06)}` }}>
                  {c.organization}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.44) }}>{c.email}</span>
              <span style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.28) }}>
                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-[18px] px-4 py-3" style={{ background: t.ink(0.02), border: `1px solid ${t.ink(0.05)}` }}>
              <p style={{ fontFamily: t.sans, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: t.ink(0.28), textTransform: "uppercase" }}>
                Readiness
              </p>
              <p style={{ fontFamily: t.sans, fontSize: "13px", fontWeight: 600, color: readinessLabel(c.readiness_score).color, marginTop: "4px" }}>
                {c.readiness_score ?? "—"} · {readinessLabel(c.readiness_score).label}
              </p>
            </div>
            <StatusPill status={c.report_status} />
          </div>
        </div>
      </button>
    ))}
  </div>
);

/** Try to parse report_cache as structured JSON, return null if it's old markdown format */
function parseReportCache(cache: string | null): DiagnosticData | null {
  if (!cache) return null;
  try {
    const parsed = JSON.parse(cache);
    if (parsed && parsed.contact && parsed.dimensionResults) return parsed as DiagnosticData;
    return null;
  } catch {
    return null;
  }
}

/* ═══ DETAIL VIEW ═══ */
const SubmissionDetail = ({ contact, onBack }: { contact: Contact; onBack: () => void }) => {
  const qc = useQueryClient();
  const [reportData, setReportData] = useState<DiagnosticData | null>(() => parseReportCache(contact.report_cache));
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reportData) return;
    generateReport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-diagnostic", {
        body: { contactId: contact.id },
      });
      if (error) throw error;
      const structured = data?.report;
      if (!structured) throw new Error("No report returned");
      setReportData(structured as DiagnosticData);
      // Cache it
      await supabase
        .from("deck_contacts" as any)
        .update({ report_cache: JSON.stringify(structured) } as any)
        .eq("id", contact.id);
    } catch (err: any) {
      toast.error("Failed to generate report: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const markAsSent = useMutation({
    mutationFn: async () => {
      const newStatus = contact.report_status === "sent" ? "pending" : "sent";
      await supabase
        .from("deck_contacts" as any)
        .update({ report_status: newStatus } as any)
        .eq("id", contact.id);
      return newStatus;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deck-contacts-full"] });
      toast.success("Status updated");
    },
  });

  const handleExportPdf = async () => {
    if (!reportData) return;
    setExporting(true);
    try {
      const pdf = generateDiagnosticPdf(reportData);
      pdf.save(
        `diagnostic-${contact.first_name}-${contact.last_name}.pdf`
          .toLowerCase()
          .replace(/\s+/g, "-")
      );
    } catch (err: any) {
      toast.error("PDF export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const ActionButton = ({
    onClick,
    disabled,
    icon: Icon,
    label,
    primary = false,
    active = false,
  }: {
    onClick: () => void;
    disabled?: boolean;
    icon: typeof FileText;
    label: string;
    primary?: boolean;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[13px] font-medium transition-all disabled:opacity-40"
      style={{
        fontFamily: t.sans,
        background: primary ? t.ink(0.84) : active ? t.ink(0.08) : t.white,
        color: primary ? t.cream : t.ink(0.56),
        border: `1px solid ${primary ? t.ink(0.84) : active ? t.ink(0.12) : t.ink(0.08)}`,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-4 transition-colors md:px-6"
        style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.42), background: "none", border: "none", cursor: "pointer", borderBottom: t.border(0.04) }}
        onMouseEnter={(e) => (e.currentTarget.style.color = t.ink(0.7))}
        onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.42))}
      >
        <ChevronLeft className="w-3.5 h-3.5" /> All submissions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] flex-1 overflow-hidden">
        {/* LEFT: Diagnostic report */}
        <div className="overflow-y-auto p-5 lg:p-8" style={{ borderRight: t.border(0.04), background: t.white }}>
          {generating ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: t.ink(0.1), borderTopColor: t.ink(0.5) }} />
              <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.4) }}>Generating diagnostic report…</p>
            </div>
          ) : reportData ? (
            <div className="rounded-[28px] border px-3 py-3 md:px-4 md:py-4" style={{ background: t.ink(0.01), borderColor: t.ink(0.05) }}>
              <DiagnosticReport data={reportData} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.4) }}>No report generated yet.</p>
              <button
                onClick={generateReport}
                style={{
                  fontFamily: t.sans, fontSize: "12px", padding: "8px 20px", borderRadius: "999px",
                  background: t.ink(1), color: t.cream, border: "none", cursor: "pointer",
                }}
              >
                Generate Report
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Contact info & actions */}
        <div className="overflow-y-auto p-5 md:p-6" style={{ background: t.ink(0.018) }}>
          <div className="space-y-4">
            <div className="rounded-[24px] border px-5 py-5" style={{ background: t.white, borderColor: t.ink(0.06) }}>
              <p style={{ fontFamily: t.sans, fontSize: "10px", fontWeight: 600, letterSpacing: "0.09em", color: t.ink(0.28), textTransform: "uppercase", marginBottom: "10px" }}>
                Contact
              </p>
              <p style={{ fontFamily: t.sans, fontSize: "18px", fontWeight: 700, color: t.ink(0.85) }}>
                {contact.first_name} {contact.last_name}
              </p>
              {contact.organization && (
                <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.4), marginTop: "4px" }}>
                  {contact.organization}
                </p>
              )}
              <a
                href={`mailto:${contact.email}`}
                style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.52), textDecoration: "underline", textUnderlineOffset: "2px", display: "block", marginTop: "10px" }}
              >
                {contact.email}
              </a>
              <p style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.25), marginTop: "10px" }}>
                {format(new Date(contact.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <div className="rounded-[24px] border px-5 py-5" style={{ background: t.white, borderColor: t.ink(0.06) }}>
              <p style={{ fontFamily: t.sans, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: t.ink(0.3), textTransform: "uppercase", marginBottom: "8px" }}>
                Readiness Score
              </p>
              <p style={{ fontFamily: t.sans, fontSize: "16px", fontWeight: 700, color: readinessLabel(contact.readiness_score).color }}>
                {contact.readiness_score ?? "—"} · {readinessLabel(contact.readiness_score).label}
              </p>
              <p style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.32), marginTop: "6px" }}>
                {readinessLabel(contact.readiness_score).hint}
              </p>
              <div className="mt-4 inline-flex">
                <StatusPill status={contact.report_status} />
              </div>
            </div>

            <div className="rounded-[24px] border px-5 py-5" style={{ background: t.white, borderColor: t.ink(0.06) }}>
              <p style={{ fontFamily: t.sans, fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: t.ink(0.25), textTransform: "uppercase", marginBottom: "12px" }}>
                Actions
              </p>
              <div className="flex flex-col gap-2.5">
                <ActionButton onClick={handleExportPdf} disabled={!reportData || exporting} icon={FileText} label={exporting ? "Exporting…" : "Export PDF"} primary />
                <ActionButton onClick={handleCopyEmail} icon={copied ? Check : Copy} label={copied ? "Copied" : "Copy email"} />
                <ActionButton onClick={() => markAsSent.mutate()} icon={Mail} label={contact.report_status === "sent" ? "Marked as sent" : "Mark as sent"} active={contact.report_status === "sent"} />
                {reportData && (
                  <ActionButton onClick={generateReport} disabled={generating} icon={RefreshCw} label={generating ? "Regenerating…" : "Regenerate report"} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══ MAIN PAGE ═══ */
const AdminSubmissions = () => {
  const { data: contacts, isLoading } = useContacts();
  const [selected, setSelected] = useState<Contact | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (contacts && !selected) {
      const id = searchParams.get("id");
      if (id) {
        const match = contacts.find((c) => c.id === id);
        if (match) setSelected(match);
      }
    }
  }, [contacts, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selected && contacts) {
      const updated = contacts.find((c) => c.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [contacts]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen light" data-theme="light" style={{ background: t.cream, colorScheme: "light" }}>
      <div className="sticky top-0 z-30" style={{ background: t.cream, borderBottom: t.border(0.06), boxShadow: `0 1px 3px 0 ${t.ink(0.03)}` }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] tracking-[0.05em] transition-all"
              style={{ fontFamily: t.sans, color: t.ink(0.4), border: t.border(0.1), background: t.white }}
              onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.8); e.currentTarget.style.background = t.ink(0.05); }}
              onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.4); e.currentTarget.style.background = t.white; }}
            >
              <ArrowLeft className="w-3 h-3" /> Admin
            </Link>
            <div>
              <h1 className="text-[24px] font-semibold tracking-[-0.03em]" style={{ fontFamily: t.sans, color: t.ink(0.85) }}>
                Diagnostic results
              </h1>
              <p className="text-[13px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.38) }}>
                Review each lead with the report, readiness score, and next actions in one stable workspace.
              </p>
            </div>
          </div>

          {contacts && (
            <div className="inline-flex items-center gap-3 self-start rounded-full px-4 py-2.5 lg:self-auto" style={{ background: t.white, border: `1px solid ${t.ink(0.08)}` }}>
              <span style={{ fontFamily: t.sans, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: t.ink(0.32), textTransform: "uppercase" }}>Open queue</span>
              <span style={{ fontFamily: t.sans, fontSize: "13px", fontWeight: 700, color: t.ink(0.72) }}>{contacts.length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8" style={{ height: "calc(100vh - 112px)" }}>
        <div className="h-full overflow-hidden rounded-[32px] border" style={{ background: t.white, borderColor: t.ink(0.06), boxShadow: `0 32px 84px -52px ${t.ink(0.22)}` }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: t.ink(0.1), borderTopColor: t.ink(0.5) }} />
          </div>
        ) : selected ? (
          <SubmissionDetail
            contact={selected}
            onBack={() => setSelected(null)}
          />
        ) : (
          <div className="overflow-y-auto" style={{ height: "100%" }}>
            <SubmissionsList contacts={contacts || []} onSelect={setSelected} />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubmissions;
