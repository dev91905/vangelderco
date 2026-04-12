import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Copy, Check, FileText, Mail, ChevronLeft } from "lucide-react";
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
  <div className="flex flex-col">
    {contacts.length === 0 && (
      <p style={{ fontFamily: t.sans, fontSize: "14px", color: t.ink(0.35), padding: "40px 0", textAlign: "center" }}>
        No submissions yet.
      </p>
    )}
    {contacts.map((c) => (
      <button
        key={c.id}
        onClick={() => onSelect(c)}
        className="text-left w-full transition-colors"
        style={{
          padding: "16px 20px",
          borderBottom: t.border(0.04),
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: "16px",
          alignItems: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.02))}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: t.sans, fontSize: "14px", fontWeight: 600, color: t.ink(0.8) }}>
              {c.first_name} {c.last_name}
            </span>
            {c.organization && (
              <span style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.35) }}>· {c.organization}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.4) }}>{c.email}</span>
            <span style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.25) }}>
              {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <span style={{ fontFamily: t.sans, fontSize: "11px", fontWeight: 600, color: readinessLabel(c.readiness_score).color, whiteSpace: "nowrap" }}>
          {readinessLabel(c.readiness_score).label}
        </span>
        <StatusPill status={c.report_status} />
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

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-3 transition-colors"
        style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.4), background: "none", border: "none", cursor: "pointer", borderBottom: t.border(0.04) }}
        onMouseEnter={(e) => (e.currentTarget.style.color = t.ink(0.7))}
        onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.4))}
      >
        <ChevronLeft className="w-3.5 h-3.5" /> All submissions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] flex-1 overflow-hidden">
        {/* LEFT: Diagnostic report */}
        <div className="overflow-y-auto p-6 lg:p-8" style={{ borderRight: t.border(0.04) }}>
          {generating ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: t.ink(0.1), borderTopColor: t.ink(0.5) }} />
              <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.4) }}>Generating diagnostic report…</p>
            </div>
          ) : reportData ? (
            <DiagnosticReport data={reportData} />
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
        <div className="p-6 flex flex-col gap-5 overflow-y-auto" style={{ background: t.ink(0.015) }}>
          {/* Contact info */}
          <div>
            <p style={{ fontFamily: t.sans, fontSize: "16px", fontWeight: 700, color: t.ink(0.85) }}>
              {contact.first_name} {contact.last_name}
            </p>
            {contact.organization && (
              <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.4), marginTop: "2px" }}>
                {contact.organization}
              </p>
            )}
            <a
              href={`mailto:${contact.email}`}
              style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.45), textDecoration: "underline", textUnderlineOffset: "2px", display: "block", marginTop: "6px" }}
            >
              {contact.email}
            </a>
            <p style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.25), marginTop: "8px" }}>
              {format(new Date(contact.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>

          {/* Readiness score card */}
          <div style={{ padding: "14px 16px", borderRadius: "12px", background: t.ink(0.025), border: t.border(0.05) }}>
            <p style={{ fontFamily: t.sans, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: t.ink(0.3), textTransform: "uppercase", marginBottom: "6px" }}>
              Readiness Score
            </p>
            <p style={{ fontFamily: t.sans, fontSize: "15px", fontWeight: 700, color: readinessLabel(contact.readiness_score).color }}>
              {contact.readiness_score ?? "—"} · {readinessLabel(contact.readiness_score).label}
            </p>
            <p style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.3), marginTop: "4px" }}>
              {readinessLabel(contact.readiness_score).hint}
            </p>
          </div>

          {/* Separator */}
          <div style={{ height: "1px", background: t.ink(0.04) }} />

          {/* Actions */}
          <div>
            <p style={{ fontFamily: t.sans, fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: t.ink(0.25), textTransform: "uppercase", marginBottom: "10px" }}>
              Actions
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleExportPdf}
                disabled={!reportData || exporting}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] font-medium transition-all disabled:opacity-40"
                style={{ fontFamily: t.sans, background: t.ink(0.85), color: t.cream, border: "none", cursor: reportData ? "pointer" : "default" }}
              >
                <FileText className="w-4 h-4" />
                {exporting ? "Exporting…" : "Export as PDF"}
              </button>

              <button
                onClick={handleCopyEmail}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] transition-all"
                style={{ fontFamily: t.sans, color: t.ink(0.5), background: "transparent", border: t.border(0.08), cursor: "pointer" }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy email"}
              </button>

              <button
                onClick={() => markAsSent.mutate()}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] transition-all"
                style={{
                  fontFamily: t.sans,
                  color: contact.report_status === "sent" ? "hsl(142 71% 35%)" : t.ink(0.5),
                  background: contact.report_status === "sent" ? "hsl(142 71% 45% / 0.06)" : "transparent",
                  border: contact.report_status === "sent" ? "1px solid hsl(142 71% 45% / 0.15)" : t.border(0.08),
                  cursor: "pointer",
                }}
              >
                <Mail className="w-4 h-4" />
                {contact.report_status === "sent" ? "Marked as sent ✓" : "Mark as sent"}
              </button>
            </div>
          </div>

          {/* Regenerate */}
          {reportData && (
            <button
              onClick={generateReport}
              disabled={generating}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-full text-[11px] transition-all mt-auto"
              style={{
                fontFamily: t.sans,
                color: t.ink(0.3),
                background: "transparent",
                border: t.border(0.06),
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.ink(0.025); e.currentTarget.style.color = t.ink(0.5); }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.ink(0.3); }}
            >
              <RefreshCw className="w-3 h-3" />
              {generating ? "Regenerating…" : "Regenerate report"}
            </button>
          )}
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
      <div className="flex items-center justify-between px-4 md:px-8 py-4" style={{ borderBottom: t.border(0.06) }}>
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.05em] transition-all rounded-full"
            style={{ fontFamily: t.sans, color: t.ink(0.4), border: t.border(0.1) }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.8); e.currentTarget.style.background = t.ink(0.05); }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.4); e.currentTarget.style.background = "transparent"; }}
          >
            <ArrowLeft className="w-3 h-3" /> Admin
          </Link>
          <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: t.sans, color: t.ink(0.85) }}>
            Diagnostic Results
          </h1>
          {contacts && (
            <span style={{ fontFamily: t.sans, fontSize: "11px", fontWeight: 600, color: t.cream, background: t.ink(0.7), padding: "1px 8px", borderRadius: "999px" }}>
              {contacts.length}
            </span>
          )}
        </div>
      </div>

      <div style={{ height: "calc(100vh - 57px)", overflow: "hidden" }}>
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
  );
};

export default AdminSubmissions;
