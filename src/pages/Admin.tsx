import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Settings, X, Lock, Eye, EyeOff, Copy, RefreshCw, Trash2, Check, LogOut, ArrowLeft, Link as LinkIcon, Mail, ChevronDown } from "lucide-react";
import PostListTable from "@/components/admin/PostListTable";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { t } from "@/lib/theme";

const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
};

const GlobalPasswordPanel = ({ value, onChange, onSave, onRemove }: { value: string; onChange: (v: string) => void; onSave: () => void; onRemove: () => void }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { if (!value) return; navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const handleGen = () => { onChange(generatePassword()); setShow(true); };

  return (
    <div className="p-5 space-y-4">
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-[0.08em] flex items-center gap-2" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>
          <Lock className="w-3 h-3" /> Global Article Password
        </label>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: value ? t.ink(1) : t.ink(0.15) }} />
          <span className="text-[11px]" style={{ fontFamily: t.sans, color: value ? t.ink(0.7) : t.ink(0.3) }}>
            {value ? "Active" : "Not set"}
          </span>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: t.border(0.08), background: t.ink(0.02) }}>
          <input
            type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="No global password"
            className="w-full px-3 py-2.5 text-sm bg-transparent outline-none" style={{ fontFamily: t.sans, color: t.ink(0.8) }}
          />
          <div className="flex items-center gap-px px-1 pb-1">
            <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors" style={{ fontFamily: t.sans, color: t.ink(0.4), background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {show ? "Hide" : "Show"}
            </button>
            <button onClick={handleGen} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors" style={{ fontFamily: t.sans, color: t.ink(0.4), background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <RefreshCw className="w-3 h-3" /> Generate
            </button>
            <button onClick={handleCopy} disabled={!value} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors disabled:opacity-20" style={{ fontFamily: t.sans, color: copied ? t.success() : t.ink(0.4), background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
            </button>
            {value && (
              <button onClick={onRemove} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors ml-auto" style={{ fontFamily: t.sans, color: t.error(0.6), background: "transparent" }}>
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <button onClick={onSave} className="w-full px-4 py-2.5 text-sm transition-all rounded-full" style={{ fontFamily: t.sans, background: t.ink(1), color: t.cream }}>
        Save
      </button>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const { playHoverGlitch } = useGlitchSFX();
  const [typeFilter, setTypeFilter] = useState("all");
  const [capFilter, setCapFilter] = useState("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [articlesOpen, setArticlesOpen] = useState(true);
  const { data: settings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const [globalPw, setGlobalPw] = useState<string>("");
  const [bookingLink, setBookingLink] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [pwLoaded, setPwLoaded] = useState(false);

  if (settings && !pwLoaded) { setGlobalPw(settings.global_article_password || ""); setBookingLink(settings.booking_link || ""); setContactEmail(settings.contact_email || ""); setPwLoaded(true); }

  const typeChips = [
    { value: "all", label: "All" },
    { value: "blog-post", label: "Blog Posts" },
    { value: "case-study", label: "Case Studies" },
    { value: "field-note", label: "Field Notes" },
  ];

  const capChips = [
    { value: "all", label: "All" },
    { value: "cultural-strategy", label: "Cultural Strategy" },
    { value: "cross-sector", label: "Cross-Sector" },
    { value: "deep-organizing", label: "Deep Organizing" },
  ];

  return (
    <div className="min-h-screen light" data-theme="light" style={{ background: t.cream, colorScheme: "light" }}>
      <div className="flex items-center justify-between px-4 md:px-8 py-4" style={{ borderBottom: t.border(0.06) }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.05em] transition-all rounded-full"
            style={{ fontFamily: t.sans, color: t.ink(0.4), border: t.border(0.1) }}
            onMouseEnter={(e) => { playHoverGlitch(); e.currentTarget.style.color = t.ink(0.8); e.currentTarget.style.background = t.ink(0.05); }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.4); e.currentTarget.style.background = "transparent"; }}>
            <ArrowLeft className="w-3 h-3" /> Back to Site
          </Link>
          <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: t.sans, color: t.ink(0.85) }}>Content Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/submissions" className="flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-[0.05em] transition-all rounded-full"
            style={{ fontFamily: t.sans, color: t.ink(0.4), border: t.border(0.1) }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.8); e.currentTarget.style.background = t.ink(0.05); }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.4); e.currentTarget.style.background = "transparent"; }}>
            <Mail className="w-3 h-3" /> Diagnostic Results
          </Link>
          <button onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }}
            className="p-2 rounded-xl transition-colors" style={{ border: t.border(0.06) }} title="Sign out"
            onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <LogOut className="w-4 h-4" style={{ color: t.ink(0.3) }} />
          </button>
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-xl relative transition-colors" style={{ border: t.border(0.06) }} title="Site settings"
            onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <Settings className="w-4 h-4" style={{ color: t.ink(0.3) }} />
            {settings?.global_article_password && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: t.ink(1) }} />}
          </button>
          <Link to="/admin/new" className="flex items-center gap-2 px-4 py-2 text-sm transition-colors rounded-full" style={{ fontFamily: t.sans, color: t.cream, background: t.ink(1) }}>
            <Plus className="w-3 h-3" /> New Post
          </Link>
        </div>
      </div>

      {settingsOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: t.ink(0.2) }} onClick={() => setSettingsOpen(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: t.cream, border: t.border(0.08), boxShadow: `0 25px 50px -12px ${t.ink(0.15)}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: t.border(0.06) }}>
              <span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.5) }}>Site Settings</span>
              <button onClick={() => setSettingsOpen(false)} className="p-1.5 rounded-lg transition-colors" onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <X className="w-4 h-4" style={{ color: t.ink(0.4) }} />
              </button>
            </div>
            <GlobalPasswordPanel value={globalPw} onChange={setGlobalPw}
              onSave={() => { updateSetting.mutate({ key: "global_article_password", value: globalPw || null }); setSettingsOpen(false); }}
              onRemove={() => { setGlobalPw(""); updateSetting.mutate({ key: "global_article_password", value: null }); setSettingsOpen(false); }}
            />
            {/* Booking Link */}
            <div className="p-5 space-y-3" style={{ borderTop: t.border(0.06) }}>
              <label className="text-[11px] uppercase tracking-[0.08em] flex items-center gap-2" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>
                <LinkIcon className="w-3 h-3" /> Booking Link
              </label>
              <input
                type="url"
                value={bookingLink}
                onChange={(e) => setBookingLink(e.target.value)}
                placeholder="https://calendly.com/your-link"
                className="w-full px-3 py-2.5 text-sm bg-transparent outline-none rounded-xl"
                style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.08), background: t.ink(0.02) }}
              />
              <p className="text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>
                Used for "Schedule a Meeting" on the deck CTA page.
              </p>
              <button
                onClick={() => {
                  updateSetting.mutate({ key: "booking_link", value: bookingLink || null });
                }}
                className="w-full px-4 py-2.5 text-sm transition-all rounded-full"
                style={{ fontFamily: t.sans, background: t.ink(1), color: t.cream }}
              >
                Save
              </button>
            </div>
            {/* Contact Email */}
            <div className="p-5 space-y-3" style={{ borderTop: t.border(0.06) }}>
              <label className="text-[11px] uppercase tracking-[0.08em] flex items-center gap-2" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>
                <Mail className="w-3 h-3" /> Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="info@vangelderco.com"
                className="w-full px-3 py-2.5 text-sm bg-transparent outline-none rounded-xl"
                style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.08), background: t.ink(0.02) }}
              />
              <p className="text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>
                Used in the "Next Steps" section of diagnostic reports.
              </p>
              <button
                onClick={() => {
                  updateSetting.mutate({ key: "contact_email", value: contactEmail || null });
                  setSettingsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-sm transition-all rounded-full"
                style={{ fontFamily: t.sans, background: t.ink(1), color: t.cream }}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}

      {/* Collapsible Articles section */}
      <div className="px-4 md:px-8">
        <button
          onClick={() => setArticlesOpen(!articlesOpen)}
          className="flex items-center gap-2 w-full py-4 transition-colors group"
          style={{ borderBottom: t.border(0.04) }}
        >
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{
              color: t.ink(0.3),
              transform: articlesOpen ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          />
          <span className="text-[13px] font-semibold tracking-[0.02em]" style={{ fontFamily: t.sans, color: t.ink(0.6) }}>
            Articles
          </span>
        </button>

        <div
          style={{
            maxHeight: articlesOpen ? "9999px" : "0",
            overflow: "hidden",
            transition: "max-height 0.3s ease-in-out",
          }}
        >
          <div className="flex flex-wrap items-center gap-2 py-3" style={{ borderBottom: t.border(0.04) }}>
            {typeChips.map((c) => (
              <button key={c.value} onClick={() => setTypeFilter(c.value)} onPointerEnter={() => playHoverGlitch()}
                className="px-3 py-1 text-[12px] tracking-[0.02em] rounded-full transition-all"
                style={{ fontFamily: t.sans, color: typeFilter === c.value ? t.cream : t.ink(0.45), background: typeFilter === c.value ? t.ink(1) : "transparent", border: `1px solid ${typeFilter === c.value ? t.ink(1) : t.ink(0.1)}` }}>
                {c.label}
              </button>
            ))}
            <div className="w-px h-4 mx-1" style={{ background: t.ink(0.08) }} />
            {capChips.map((c) => (
              <button key={c.value} onClick={() => setCapFilter(c.value)} onPointerEnter={() => playHoverGlitch()}
                className="px-3 py-1 text-[12px] tracking-[0.02em] rounded-full transition-all"
                style={{ fontFamily: t.sans, color: capFilter === c.value ? t.ink(0.8) : t.ink(0.35), background: capFilter === c.value ? t.ink(0.06) : "transparent", border: `1px solid ${capFilter === c.value ? t.ink(0.1) : "transparent"}` }}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="py-2">
            <PostListTable filter={{ type: typeFilter, capability: capFilter }} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Admin;
