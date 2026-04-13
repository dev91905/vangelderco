import { useState, useRef, useEffect } from "react";
import CaseStudyEditor from "@/components/admin/CaseStudyEditor";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Settings, X, Lock, Eye, EyeOff, Copy, RefreshCw, Trash2, Check, LogOut, ArrowLeft, Link as LinkIcon, Mail, ChevronDown } from "lucide-react";
import PostListTable from "@/components/admin/PostListTable";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { t } from "@/lib/theme";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { getScoreLabel } from "@/lib/diagnosticScoring";

const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
};

/* ═══ Collapsible Section ═══ */
const CollapsibleSection = ({
  title, count, open, onToggle, children,
}: { title: string; count?: number; open: boolean; onToggle: () => void; children: React.ReactNode }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(open ? undefined : 0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      const h = contentRef.current.scrollHeight;
      setHeight(h);
      const timer = setTimeout(() => setHeight(undefined), 300);
      return () => clearTimeout(timer);
    } else {
      setHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open]);

  return (
    <div className="px-4 md:px-8">
      <button
        onClick={onToggle}
        className="flex items-center gap-2.5 w-full py-5 transition-colors group"
        style={{ borderBottom: t.border(0.04) }}
      >
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-200"
          style={{ color: t.ink(0.25), transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
        <span className="text-[13px] font-semibold tracking-[0.02em]" style={{ fontFamily: t.sans, color: t.ink(0.5) }}>
          {title}
        </span>
        {count !== undefined && count > 0 && (
          <span
            className="text-[10px] font-semibold tabular-nums"
            style={{
              fontFamily: t.sans,
              color: t.ink(0.35),
              background: t.ink(0.04),
              padding: "2px 8px",
              borderRadius: "999px",
            }}
          >
            {count}
          </span>
        )}
      </button>
      <div
        ref={contentRef}
        style={{
          height: height !== undefined ? `${height}px` : "auto",
          overflow: "hidden",
          transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ═══ Settings Modal ═══ */
const SettingsModal = ({
  open, onClose, globalPw, setGlobalPw, bookingLink, setBookingLink,
  contactEmail, setContactEmail, onSave,
}: {
  open: boolean; onClose: () => void;
  globalPw: string; setGlobalPw: (v: string) => void;
  bookingLink: string; setBookingLink: (v: string) => void;
  contactEmail: string; setContactEmail: (v: string) => void;
  onSave: () => void;
}) => {
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = () => { if (!globalPw) return; navigator.clipboard.writeText(globalPw); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const handleGen = () => { setGlobalPw(generatePassword()); setShowPw(true); };

  const FieldGroup = ({ icon: Icon, label: lbl, children }: { icon: any; label: string; children: React.ReactNode }) => (
    <div className="space-y-2.5">
      <label className="text-[10px] uppercase tracking-[0.1em] flex items-center gap-2" style={{ fontFamily: t.sans, color: t.ink(0.35), fontWeight: 600 }}>
        <Icon className="w-3 h-3" /> {lbl}
      </label>
      {children}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: t.ink(0.15), backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: t.cream, border: t.border(0.06), boxShadow: `0 24px 48px -12px ${t.ink(0.12)}, 0 0 0 1px ${t.ink(0.04)}` }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: t.border(0.06) }}>
          <span className="text-[13px] font-semibold" style={{ fontFamily: t.sans, color: t.ink(0.6) }}>Site Settings</span>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <X className="w-4 h-4" style={{ color: t.ink(0.3) }} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Password */}
          <FieldGroup icon={Lock} label="Global Article Password">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: globalPw ? "hsl(142 71% 45%)" : t.ink(0.12) }} />
              <span className="text-[11px]" style={{ fontFamily: t.sans, color: globalPw ? t.ink(0.5) : t.ink(0.25) }}>
                {globalPw ? "Active" : "Not set"}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: t.border(0.06), background: t.ink(0.015) }}>
              <input
                type={showPw ? "text" : "password"} value={globalPw} onChange={(e) => setGlobalPw(e.target.value)} placeholder="No global password"
                className="w-full px-3 py-2.5 text-[13px] bg-transparent outline-none" style={{ fontFamily: t.sans, color: t.ink(0.8) }}
              />
              <div className="flex items-center gap-px px-1 pb-1">
                {[
                  { onClick: () => setShowPw(!showPw), icon: showPw ? EyeOff : Eye, label: showPw ? "Hide" : "Show" },
                  { onClick: handleGen, icon: RefreshCw, label: "Generate" },
                  { onClick: handleCopy, icon: copied ? Check : Copy, label: copied ? "Copied" : "Copy", disabled: !globalPw, color: copied ? t.success() : undefined },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.onClick} disabled={btn.disabled}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] tracking-[0.04em] transition-colors disabled:opacity-20"
                    style={{ fontFamily: t.sans, color: btn.color || t.ink(0.35), background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.04))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <btn.icon className="w-3 h-3" /> {btn.label}
                  </button>
                ))}
                {globalPw && (
                  <button onClick={() => setGlobalPw("")} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] tracking-[0.04em] transition-colors ml-auto" style={{ fontFamily: t.sans, color: t.error(0.5), background: "transparent" }}>
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
            </div>
          </FieldGroup>

          {/* Booking Link */}
          <FieldGroup icon={LinkIcon} label="Booking Link">
            <input type="url" value={bookingLink} onChange={(e) => setBookingLink(e.target.value)} placeholder="https://calendly.com/your-link"
              className="w-full px-3 py-2.5 text-[13px] bg-transparent outline-none rounded-xl" style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.06), background: t.ink(0.015) }} />
            <p className="text-[10px]" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>Used for "Schedule a Meeting" on the deck CTA page.</p>
          </FieldGroup>

          {/* Contact Email */}
          <FieldGroup icon={Mail} label="Contact Email">
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@vangelder.co"
              className="w-full px-3 py-2.5 text-[13px] bg-transparent outline-none rounded-xl" style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.06), background: t.ink(0.015) }} />
            <p className="text-[10px]" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>Used in the "Next Steps" section of diagnostic reports.</p>
          </FieldGroup>
        </div>

        {/* Single save button */}
        <div className="px-5 pb-5">
          <button onClick={onSave} className="w-full py-2.5 text-[13px] font-medium transition-all rounded-full" style={{ fontFamily: t.sans, background: t.ink(0.9), color: t.cream }}>
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
};

/* ═══ Filter Pill Bar ═══ */
const FilterBar = ({
  typeFilter, setTypeFilter, capFilter, setCapFilter, playHoverGlitch,
}: {
  typeFilter: string; setTypeFilter: (v: string) => void;
  capFilter: string; setCapFilter: (v: string) => void;
  playHoverGlitch: () => void;
}) => {
  const typeChips = [
    { value: "all", label: "All" },
    { value: "blog-post", label: "Blog" },
    { value: "case-study", label: "Case Study" },
  ];
  const capChips = [
    { value: "all", label: "All Capabilities" },
    { value: "cultural-strategy", label: "Cultural Strategy" },
    { value: "cross-sector", label: "Cross-Sector" },
    { value: "deep-organizing", label: "Deep Organizing" },
  ];

  const Chip = ({ active, label, onClick, variant = "primary" }: { active: boolean; label: string; onClick: () => void; variant?: "primary" | "secondary" }) => (
    <button
      onClick={() => { onClick(); playHoverGlitch(); }}
      className="px-3 py-1.5 text-[11px] tracking-[0.02em] rounded-full transition-all duration-200"
      style={{
        fontFamily: t.sans,
        fontWeight: active ? 600 : 400,
        color: active
          ? variant === "primary" ? t.cream : t.ink(0.7)
          : t.ink(0.35),
        background: active
          ? variant === "primary" ? t.ink(0.85) : t.ink(0.06)
          : "transparent",
        border: `1px solid ${active
          ? variant === "primary" ? t.ink(0.85) : t.ink(0.1)
          : "transparent"}`,
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-3">
      {typeChips.map((c) => (
        <Chip key={c.value} active={typeFilter === c.value} label={c.label} onClick={() => setTypeFilter(c.value)} variant="primary" />
      ))}
      <div className="w-px h-3.5 mx-1" style={{ background: t.ink(0.06) }} />
      {capChips.map((c) => (
        <Chip key={c.value} active={capFilter === c.value} label={c.label} onClick={() => setCapFilter(c.value)} variant="secondary" />
      ))}
    </div>
  );
};

/* ═══ MAIN ═══ */
const Admin = () => {
  const navigate = useNavigate();
  const { playHoverGlitch } = useGlitchSFX();
  const [typeFilter, setTypeFilter] = useState("all");
  const [capFilter, setCapFilter] = useState("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [articlesOpen, setArticlesOpen] = useState(true);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(true);
  const [caseStudiesOpen, setCaseStudiesOpen] = useState(false);
  const { data: settings } = useSiteSettings();

  const { data: contacts } = useQuery({
    queryKey: ["diagnostic-contacts-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnostic_contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capability_posts").select("id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: caseStudies } = useQuery({
    queryKey: ["diagnostic-case-studies-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnostic_case_studies")
        .select("id");
      if (error) throw error;
      return data;
    },
  });

  const updateSetting = useUpdateSiteSetting();
  const [globalPw, setGlobalPw] = useState<string>("");
  const [bookingLink, setBookingLink] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [pwLoaded, setPwLoaded] = useState(false);

  if (settings && !pwLoaded) { setGlobalPw(settings.global_article_password || ""); setBookingLink(settings.booking_link || ""); setContactEmail(settings.contact_email || ""); setPwLoaded(true); }

  const handleSaveSettings = () => {
    updateSetting.mutate({ key: "global_article_password", value: globalPw || null });
    updateSetting.mutate({ key: "booking_link", value: bookingLink || null });
    updateSetting.mutate({ key: "contact_email", value: contactEmail || null });
    setSettingsOpen(false);
  };

  return (
    <div className="min-h-screen light" data-theme="light" style={{ background: t.cream, colorScheme: "light" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 md:px-8 py-4 sticky top-0 z-30"
        style={{ background: t.cream, borderBottom: t.border(0.06), boxShadow: `0 1px 3px 0 ${t.ink(0.03)}` }}
      >
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.05em] transition-all rounded-full"
            style={{ fontFamily: t.sans, color: t.ink(0.35), border: t.border(0.08) }}
            onMouseEnter={(e) => { playHoverGlitch(); e.currentTarget.style.color = t.ink(0.7); e.currentTarget.style.background = t.ink(0.03); }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.35); e.currentTarget.style.background = "transparent"; }}>
            <ArrowLeft className="w-3 h-3" /> Site
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight" style={{ fontFamily: t.sans, color: t.ink(0.8) }}>Content Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }}
            className="p-2 rounded-xl transition-colors" style={{ border: t.border(0.06) }} title="Sign out"
            onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.03))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <LogOut className="w-4 h-4" style={{ color: t.ink(0.25) }} />
          </button>
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-xl relative transition-colors" style={{ border: t.border(0.06) }} title="Site settings"
            onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.03))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <Settings className="w-4 h-4" style={{ color: t.ink(0.25) }} />
            {settings?.global_article_password && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "hsl(142 71% 45%)" }} />}
          </button>
          <Link to="/admin/new" className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-colors rounded-full" style={{ fontFamily: t.sans, color: t.cream, background: t.ink(0.85) }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(1))} onMouseLeave={(e) => (e.currentTarget.style.background = t.ink(0.85))}>
            <Plus className="w-3.5 h-3.5" /> New Post
          </Link>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        globalPw={globalPw} setGlobalPw={setGlobalPw}
        bookingLink={bookingLink} setBookingLink={setBookingLink}
        contactEmail={contactEmail} setContactEmail={setContactEmail}
        onSave={handleSaveSettings}
      />

      {/* Articles */}
      <CollapsibleSection title="Articles" count={posts?.length} open={articlesOpen} onToggle={() => setArticlesOpen(!articlesOpen)}>
        <FilterBar typeFilter={typeFilter} setTypeFilter={setTypeFilter} capFilter={capFilter} setCapFilter={setCapFilter} playHoverGlitch={playHoverGlitch} />
        <div className="pb-2">
          <PostListTable filter={{ type: typeFilter, capability: capFilter }} />
        </div>
      </CollapsibleSection>

      {/* Case Studies */}
      <CollapsibleSection title="Case Studies" count={caseStudies?.length} open={caseStudiesOpen} onToggle={() => setCaseStudiesOpen(!caseStudiesOpen)}>
        <div className="py-4">
          <CaseStudyEditor />
        </div>
      </CollapsibleSection>

      {/* Leads */}
      <CollapsibleSection title="Leads" count={contacts?.length} open={diagnosticsOpen} onToggle={() => setDiagnosticsOpen(!diagnosticsOpen)}>
        <div className="py-2">
          {!contacts || contacts.length === 0 ? (
            <p className="text-center py-10" style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.25) }}>No submissions yet.</p>
          ) : (
            contacts.map((c: any) => {
              const readiness = c.readiness_score != null ? getScoreLabel(c.readiness_score) : null;
              return (
                <Link
                  key={c.id}
                  to={`/admin/submissions?id=${c.id}`}
                  className="flex items-center gap-4 px-4 py-4 transition-all group rounded-xl"
                  style={{ background: "transparent", borderBottom: t.border(0.04) }}
                  onPointerEnter={(e) => { e.currentTarget.style.background = t.ink(0.025); }}
                  onPointerLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold truncate transition-transform duration-200 group-hover:translate-x-0.5" style={{ fontFamily: t.sans, color: t.ink(0.8) }}>
                      {c.first_name} {c.last_name}
                      {c.organization && <span className="font-normal ml-2" style={{ color: t.ink(0.3), fontSize: "12px" }}>· {c.organization}</span>}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>{c.email}</span>
                      <span className="text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.2) }}>
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  {readiness && (
                    <span className="text-[11px] font-semibold whitespace-nowrap" style={{ fontFamily: t.sans, color: readiness.color }}>
                      {readiness.label}
                    </span>
                  )}
                  <span
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{
                      fontFamily: t.sans,
                      color: c.report_status === "sent" ? "hsl(142 71% 35%)" : t.ink(0.4),
                      background: c.report_status === "sent" ? "hsl(142 71% 45% / 0.08)" : t.ink(0.03),
                      border: `1px solid ${c.report_status === "sent" ? "hsl(142 71% 45% / 0.15)" : t.ink(0.06)}`,
                    }}
                  >
                    {c.report_status === "sent" ? "Sent" : "Pending"}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </CollapsibleSection>

      {/* Footer breathing room */}
      <div className="h-16" />
    </div>
  );
};

export default Admin;
