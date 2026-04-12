import { useState, useRef, useEffect } from "react";
import CaseStudyEditor from "@/components/admin/CaseStudyEditor";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Settings, X, Lock, Eye, EyeOff, Copy, RefreshCw, Trash2, Check, LogOut, ArrowLeft, Link as LinkIcon, Mail, ChevronDown, FileText, FolderKanban, Users, Sparkles, type LucideIcon } from "lucide-react";
import PostListTable from "@/components/admin/PostListTable";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { t } from "@/lib/theme";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { getScoreLabel } from "@/lib/deckScoring";

const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
};

const surfaceShadow = `0 32px 84px -52px ${t.ink(0.22)}`;

/* ═══ Collapsible Section ═══ */
const CollapsibleSection = ({
  title, description, count, open, onToggle, icon: Icon, children,
}: { title: string; description: string; count?: number; open: boolean; onToggle: () => void; icon: LucideIcon; children: React.ReactNode }) => {
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
    <div className="rounded-[30px] border overflow-hidden" style={{ background: t.white, borderColor: t.ink(0.06), boxShadow: `0 24px 60px -48px ${t.ink(0.16)}` }}>
      <button
        onClick={onToggle}
        className="group flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors md:px-6 md:py-6"
        style={{ borderBottom: open ? t.border(0.04) : "none" }}
      >
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px]" style={{ background: t.ink(0.04), border: `1px solid ${t.ink(0.08)}` }}>
            <Icon className="h-4.5 w-4.5" style={{ color: t.ink(0.42) }} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[18px] font-semibold tracking-[-0.02em]" style={{ fontFamily: t.sans, color: t.ink(0.78) }}>
                {title}
              </span>
              {count !== undefined && (
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.08em] tabular-nums"
                  style={{ fontFamily: t.sans, color: t.ink(0.4), background: t.ink(0.04), border: `1px solid ${t.ink(0.08)}` }}
                >
                  {count}
                </span>
              )}
            </div>
            <p className="mt-2 max-w-[700px] text-[13px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>
              {description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2" style={{ background: t.ink(0.03), border: `1px solid ${t.ink(0.06)}` }}>
          <span className="text-[10px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>
            {open ? "OPEN" : "CLOSED"}
          </span>
          <ChevronDown
            className="h-3.5 w-3.5 transition-transform duration-200"
            style={{ color: t.ink(0.28), transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
        </div>
      </button>
      <div
        ref={contentRef}
        style={{
          height: height !== undefined ? `${height}px` : "auto",
          overflow: "hidden",
          transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="px-5 pb-5 pt-1 md:px-6 md:pb-6">{children}</div>
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
    <div className="rounded-[24px] border p-4 md:p-5" style={{ background: t.ink(0.015), borderColor: t.ink(0.05) }}>
      <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em]" style={{ fontFamily: t.sans, color: t.ink(0.35), fontWeight: 600 }}>
        <Icon className="w-3 h-3" /> {lbl}
      </label>
      <div className="mt-3">{children}</div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: t.ink(0.15), backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-[560px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[30px]"
        style={{ background: t.cream, border: t.border(0.06), boxShadow: `0 36px 90px -36px ${t.ink(0.22)}, 0 0 0 1px ${t.ink(0.04)}` }}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: t.border(0.06) }}>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.09em]" style={{ fontFamily: t.sans, color: t.ink(0.32) }}>SITE SETTINGS</p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em]" style={{ fontFamily: t.sans, color: t.ink(0.78) }}>Publishing defaults</h2>
            <p className="mt-2 max-w-[360px] text-[12px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>Keep article access, booking links, and contact details in one clean control panel.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <X className="w-4 h-4" style={{ color: t.ink(0.3) }} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {/* Password */}
          <FieldGroup icon={Lock} label="Global Article Password">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: globalPw ? t.ink(0.72) : t.ink(0.12) }} />
              <span className="text-[11px]" style={{ fontFamily: t.sans, color: globalPw ? t.ink(0.5) : t.ink(0.25) }}>
                {globalPw ? "Active" : "Not set"}
              </span>
            </div>
            <div className="overflow-hidden rounded-[20px]" style={{ border: t.border(0.06), background: t.white }}>
              <input
                type={showPw ? "text" : "password"} value={globalPw} onChange={(e) => setGlobalPw(e.target.value)} placeholder="No global password"
                className="w-full bg-transparent px-4 py-3 text-[13px] outline-none" style={{ fontFamily: t.sans, color: t.ink(0.8) }}
              />
              <div className="flex items-center gap-px border-t px-2 py-2" style={{ borderColor: t.ink(0.05) }}>
                {[
                  { onClick: () => setShowPw(!showPw), icon: showPw ? EyeOff : Eye, label: showPw ? "Hide" : "Show" },
                  { onClick: handleGen, icon: RefreshCw, label: "Generate" },
                  { onClick: handleCopy, icon: copied ? Check : Copy, label: copied ? "Copied" : "Copy", disabled: !globalPw },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.onClick} disabled={btn.disabled}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] tracking-[0.04em] transition-colors disabled:opacity-20"
                    style={{ fontFamily: t.sans, color: t.ink(0.38), background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.04))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <btn.icon className="w-3 h-3" /> {btn.label}
                  </button>
                ))}
                {globalPw && (
                  <button onClick={() => setGlobalPw("")} className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] tracking-[0.04em] transition-colors" style={{ fontFamily: t.sans, color: t.ink(0.38), background: "transparent" }}>
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
            </div>
          </FieldGroup>

          {/* Booking Link */}
          <FieldGroup icon={LinkIcon} label="Booking Link">
            <input type="url" value={bookingLink} onChange={(e) => setBookingLink(e.target.value)} placeholder="https://calendly.com/your-link"
              className="w-full rounded-[18px] bg-transparent px-4 py-3 text-[13px] outline-none" style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.06), background: t.white }} />
            <p className="text-[10px]" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>Used for "Schedule a Meeting" on the deck CTA page.</p>
          </FieldGroup>

          {/* Contact Email */}
          <FieldGroup icon={Mail} label="Contact Email">
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@vangelder.co"
              className="w-full rounded-[18px] bg-transparent px-4 py-3 text-[13px] outline-none" style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.06), background: t.white }} />
            <p className="text-[10px]" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>Used in the "Next Steps" section of diagnostic reports.</p>
          </FieldGroup>
        </div>

        {/* Single save button */}
        <div className="px-6 pb-6">
          <button onClick={onSave} className="w-full rounded-full py-3 text-[13px] font-medium transition-all" style={{ fontFamily: t.sans, background: t.ink(0.9), color: t.cream }}>
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

  const hasFilters = typeFilter !== "all" || capFilter !== "all";

  const Chip = ({ active, label, onClick, variant = "primary" }: { active: boolean; label: string; onClick: () => void; variant?: "primary" | "secondary" }) => (
    <button
      onClick={() => { onClick(); playHoverGlitch(); }}
      className="rounded-full px-3 py-2 text-[11px] tracking-[0.02em] transition-all duration-200"
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
    <div className="rounded-[26px] border p-4 md:p-5" style={{ background: t.ink(0.018), borderColor: t.ink(0.05) }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.34) }}>REFINE LIBRARY</p>
          <p className="mt-1 text-[13px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>Filter by format and capability without splitting attention across multiple toolbars.</p>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setTypeFilter("all"); setCapFilter("all"); playHoverGlitch(); }}
            className="rounded-full px-3 py-2 text-[11px] font-medium transition-all"
            style={{ fontFamily: t.sans, color: t.ink(0.45), background: t.white, border: `1px solid ${t.ink(0.08)}` }}
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.28) }}>FORMAT</p>
          <div className="flex flex-wrap gap-2">
            {typeChips.map((c) => (
              <Chip key={c.value} active={typeFilter === c.value} label={c.label} onClick={() => setTypeFilter(c.value)} variant="primary" />
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.28) }}>CAPABILITY</p>
          <div className="flex flex-wrap gap-2">
            {capChips.map((c) => (
              <Chip key={c.value} active={capFilter === c.value} label={c.label} onClick={() => setCapFilter(c.value)} variant="secondary" />
            ))}
          </div>
        </div>
      </div>
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
    queryKey: ["deck-contacts-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_contacts" as any)
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
    queryKey: ["deck-case-studies-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_case_studies")
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

  useEffect(() => {
    if (!settings || pwLoaded) return;
    setGlobalPw(settings.global_article_password || "");
    setBookingLink(settings.booking_link || "");
    setContactEmail(settings.contact_email || "");
    setPwLoaded(true);
  }, [settings, pwLoaded]);

  const publishedPosts = (posts || []).filter((post: any) => post.is_published).length;
  const caseStudyCount = caseStudies?.length || 0;
  const sentReports = (contacts || []).filter((contact: any) => contact.report_status === "sent").length;

  const handleSaveSettings = () => {
    updateSetting.mutate({ key: "global_article_password", value: globalPw || null });
    updateSetting.mutate({ key: "booking_link", value: bookingLink || null });
    updateSetting.mutate({ key: "contact_email", value: contactEmail || null });
    setSettingsOpen(false);
  };

  return (
    <div className="min-h-screen light" data-theme="light" style={{ background: t.cream, colorScheme: "light" }}>
      <div className="sticky top-0 z-30" style={{ background: t.cream, borderBottom: t.border(0.06), boxShadow: `0 1px 3px 0 ${t.ink(0.03)}` }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] tracking-[0.05em] transition-all" style={{ fontFamily: t.sans, color: t.ink(0.35), border: t.border(0.08), background: t.white }} onMouseEnter={(e) => { playHoverGlitch(); e.currentTarget.style.color = t.ink(0.7); e.currentTarget.style.background = t.ink(0.03); }} onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.35); e.currentTarget.style.background = t.white; }}>
              <ArrowLeft className="w-3 h-3" /> Site
            </Link>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.09em]" style={{ fontFamily: t.sans, color: t.ink(0.32) }}>CONTENT MANAGER</p>
              <h1 className="text-[26px] font-semibold tracking-[-0.03em]" style={{ fontFamily: t.sans, color: t.ink(0.82) }}>Admin workspace</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }} className="rounded-full p-2.5 transition-colors" style={{ border: t.border(0.06), background: t.white }} title="Sign out" onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.03))} onMouseLeave={(e) => (e.currentTarget.style.background = t.white)}>
              <LogOut className="w-4 h-4" style={{ color: t.ink(0.3) }} />
            </button>
            <button onClick={() => setSettingsOpen(true)} className="relative rounded-full p-2.5 transition-colors" style={{ border: t.border(0.06), background: t.white }} title="Site settings" onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.03))} onMouseLeave={(e) => (e.currentTarget.style.background = t.white)}>
              <Settings className="w-4 h-4" style={{ color: t.ink(0.3) }} />
              {settings?.global_article_password && <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full" style={{ background: t.ink(0.8) }} />}
            </button>
            <Link to="/admin/new" className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors" style={{ fontFamily: t.sans, color: t.cream, background: t.ink(0.85) }} onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(1))} onMouseLeave={(e) => (e.currentTarget.style.background = t.ink(0.85))}>
              <Plus className="w-3.5 h-3.5" /> New Post
            </Link>
          </div>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        globalPw={globalPw} setGlobalPw={setGlobalPw}
        bookingLink={bookingLink} setBookingLink={setBookingLink}
        contactEmail={contactEmail} setContactEmail={setContactEmail}
        onSave={handleSaveSettings}
      />

      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[34px] border px-6 py-6 md:px-8 md:py-8" style={{ background: `linear-gradient(145deg, ${t.white} 0%, ${t.ink(0.03)} 100%)`, borderColor: t.ink(0.06), boxShadow: surfaceShadow }}>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.42), background: t.ink(0.04), border: `1px solid ${t.ink(0.08)}` }}>
              <Sparkles className="h-3.5 w-3.5" /> CONTROL ROOM
            </div>
            <h2 className="mt-7 max-w-[720px] text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[44px]" style={{ fontFamily: t.sans, color: t.ink(0.84) }}>
              Publishing, case studies, and lead follow-up without the usual admin sludge.
            </h2>
            <p className="mt-5 max-w-[620px] text-[15px] leading-7" style={{ fontFamily: t.sans, color: t.ink(0.42) }}>
              Everything important sits in one visual layer so you can triage, edit, and publish without hunting through dead space or tiny controls.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { icon: FileText, label: "Library", value: `${posts?.length || 0} posts`, hint: `${publishedPosts} published` },
              { icon: FolderKanban, label: "Deck case studies", value: `${caseStudyCount} entries`, hint: "Ordered and presentation-ready" },
              { icon: Users, label: "Lead diagnostics", value: `${contacts?.length || 0} submissions`, hint: `${sentReports} marked sent` },
            ].map(({ icon: Icon, label, value, hint }) => (
              <div key={label} className="rounded-[26px] border px-5 py-5" style={{ background: t.white, borderColor: t.ink(0.06), boxShadow: `0 18px 44px -40px ${t.ink(0.18)}` }}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>{label.toUpperCase()}</p>
                    <p className="mt-2 text-[22px] font-semibold tracking-[-0.03em]" style={{ fontFamily: t.sans, color: t.ink(0.8) }}>{value}</p>
                    <p className="mt-1 text-[12px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.38) }}>{hint}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px]" style={{ background: t.ink(0.04), border: `1px solid ${t.ink(0.08)}` }}>
                    <Icon className="h-4.5 w-4.5" style={{ color: t.ink(0.42) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CollapsibleSection title="Articles" description="Manage the publishing queue, protected articles, and case-study posts in one refined library view." count={posts?.length} open={articlesOpen} onToggle={() => setArticlesOpen(!articlesOpen)} icon={FileText}>
          <FilterBar typeFilter={typeFilter} setTypeFilter={setTypeFilter} capFilter={capFilter} setCapFilter={setCapFilter} playHoverGlitch={playHoverGlitch} />
          <div className="pt-4">
            <PostListTable filter={{ type: typeFilter, capability: capFilter }} />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Deck Case Studies" description="Keep the presentation deck case studies ordered, readable, and ready to drop into the client-facing flow." count={caseStudies?.length} open={caseStudiesOpen} onToggle={() => setCaseStudiesOpen(!caseStudiesOpen)} icon={FolderKanban}>
          <div className="pt-2">
            <CaseStudyEditor />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Leads" description="Review every diagnostic submission with context up front — who it is, when it came in, and how ready they are." count={contacts?.length} open={diagnosticsOpen} onToggle={() => setDiagnosticsOpen(!diagnosticsOpen)} icon={Users}>
          {!contacts || contacts.length === 0 ? (
            <div className="flex items-center justify-center rounded-[24px] border py-16" style={{ background: t.ink(0.015), borderColor: t.ink(0.05) }}>
              <p className="text-center" style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.25) }}>No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c: any) => {
                const readiness = c.readiness_score != null ? getScoreLabel(c.readiness_score) : null;
                return (
                  <Link
                    key={c.id}
                    to={`/admin/submissions?id=${c.id}`}
                    className="group block rounded-[26px] border px-5 py-5 transition-all duration-200 md:px-6"
                    style={{ background: t.white, borderColor: t.ink(0.06), boxShadow: `0 18px 40px -36px ${t.ink(0.18)}` }}
                    onPointerEnter={(e) => {
                      e.currentTarget.style.background = t.ink(0.015);
                      e.currentTarget.style.borderColor = t.ink(0.12);
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onPointerLeave={(e) => {
                      e.currentTarget.style.background = t.white;
                      e.currentTarget.style.borderColor = t.ink(0.06);
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-[16px] font-semibold tracking-[-0.02em] transition-transform duration-200 group-hover:translate-x-0.5" style={{ fontFamily: t.sans, color: t.ink(0.82) }}>
                            {c.first_name} {c.last_name}
                          </h3>
                          {c.organization && <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.42), background: t.ink(0.03), border: `1px solid ${t.ink(0.06)}` }}>{c.organization}</span>}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.42) }}>{c.email}</span>
                          <span className="text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.28) }}>
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {readiness && (
                          <div className="rounded-[18px] px-4 py-3" style={{ background: t.ink(0.02), border: `1px solid ${t.ink(0.05)}` }}>
                            <p className="text-[10px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.28) }}>READINESS</p>
                            <p className="mt-1 text-[12px] font-semibold" style={{ fontFamily: t.sans, color: readiness.color }}>
                              {c.readiness_score ?? "—"} · {readiness.label}
                            </p>
                          </div>
                        )}
                        <span
                          className="inline-flex items-center rounded-full px-3 py-2 text-[10px] font-semibold tracking-[0.08em] whitespace-nowrap"
                          style={{
                            fontFamily: t.sans,
                            color: c.report_status === "sent" ? t.cream : t.ink(0.4),
                            background: c.report_status === "sent" ? t.ink(0.82) : t.ink(0.03),
                            border: `1px solid ${c.report_status === "sent" ? t.ink(0.82) : t.ink(0.06)}`,
                          }}
                        >
                          {c.report_status === "sent" ? "SENT" : "PENDING"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default Admin;
