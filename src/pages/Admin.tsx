import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Settings, X, Lock, Eye, EyeOff, Copy, RefreshCw, Trash2, Check, LogOut, ArrowLeft, MessageSquare, ChevronDown, ChevronUp, Link as LinkIcon, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PostListTable from "@/components/admin/PostListTable";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { t } from "@/lib/theme";
import { formatDistanceToNow } from "date-fns";

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
        <div className="rounded-xl overflow-hidden" style={{ border: t.border(0.08), background: t.white }}>
          <input
            type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="No global password"
            className="w-full px-3 py-2.5 text-sm bg-transparent outline-none" style={{ fontFamily: t.sans, color: t.ink(0.8) }}
          />
          <div className="flex items-center gap-px px-1 pb-1">
            <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors" style={{ fontFamily: t.sans, color: t.ink(0.4), background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.surface.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {show ? "Hide" : "Show"}
            </button>
            <button onClick={handleGen} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors" style={{ fontFamily: t.sans, color: t.ink(0.4), background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.surface.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <RefreshCw className="w-3 h-3" /> Generate
            </button>
            <button onClick={handleCopy} disabled={!value} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors disabled:opacity-20" style={{ fontFamily: t.sans, color: copied ? t.success() : t.ink(0.4), background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.surface.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
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
  const { data: settings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const [globalPw, setGlobalPw] = useState<string>("");
  const [bookingLink, setBookingLink] = useState<string>("");
  const [pwLoaded, setPwLoaded] = useState(false);

  if (settings && !pwLoaded) { setGlobalPw(settings.global_article_password || ""); setBookingLink(settings.booking_link || ""); setPwLoaded(true); }

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
            onMouseEnter={(e) => { playHoverGlitch(); e.currentTarget.style.color = t.ink(0.8); e.currentTarget.style.background = t.white; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.4); e.currentTarget.style.background = "transparent"; }}>
            <ArrowLeft className="w-3 h-3" /> Back to Site
          </Link>
          <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: t.sans, color: t.ink(0.85) }}>Content Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }}
            className="p-2 rounded-xl transition-colors" style={{ border: t.border(0.06) }} title="Sign out"
            onMouseEnter={(e) => (e.currentTarget.style.background = t.white)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <LogOut className="w-4 h-4" style={{ color: t.ink(0.3) }} />
          </button>
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-xl relative transition-colors" style={{ border: t.border(0.06) }} title="Site settings"
            onMouseEnter={(e) => (e.currentTarget.style.background = t.white)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
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
              <button onClick={() => setSettingsOpen(false)} className="p-1.5 rounded-lg transition-colors" onMouseEnter={(e) => (e.currentTarget.style.background = t.surface.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
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
                style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.08), background: t.white }}
              />
              <p className="text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>
                Used for "Schedule a Meeting" on the deck CTA page.
              </p>
              <button
                onClick={() => {
                  updateSetting.mutate({ key: "booking_link", value: bookingLink || null });
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

      <div className="flex flex-wrap items-center gap-2 px-4 md:px-8 py-3" style={{ borderBottom: t.border(0.04) }}>
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

      <div className="px-4 md:px-8 py-2">
        <PostListTable filter={{ type: typeFilter, capability: capFilter }} />
      </div>

      <ContactsFeed />
      <SubmissionsFeed />
    </div>
  );
};

const ContactsFeed = () => {
  const [open, setOpen] = useState(true);
  const { data: contacts, isLoading } = useQuery({
    queryKey: ["deck-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_contacts" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Array<{
        id: string; first_name: string; last_name: string;
        organization: string | null; email: string;
        custom_challenge: string | null; selected_pains: string[] | null;
        created_at: string;
      }>;
    },
  });

  const count = contacts?.length ?? 0;

  return (
    <div className="px-4 md:px-8 py-4" style={{ borderTop: t.border(0.06) }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full text-left py-2"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <Mail className="w-4 h-4" style={{ color: t.ink(0.35) }} />
        <span style={{ fontFamily: t.sans, fontSize: "13px", fontWeight: 600, color: t.ink(0.6) }}>
          Deck Contacts
        </span>
        {count > 0 && (
          <span style={{
            fontFamily: t.sans, fontSize: "11px", fontWeight: 600,
            color: t.cream, background: t.ink(0.7),
            padding: "1px 8px", borderRadius: "999px",
          }}>
            {count}
          </span>
        )}
        {open ? <ChevronUp className="w-3.5 h-3.5 ml-auto" style={{ color: t.ink(0.3) }} /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" style={{ color: t.ink(0.3) }} />}
      </button>

      {open && (
        <div className="mt-3 space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {isLoading && <p style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.3) }}>Loading…</p>}
          {!isLoading && count === 0 && (
            <p style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.3), padding: "12px 0" }}>
              No contacts yet.
            </p>
          )}
          {contacts?.map((c) => (
            <div
              key={c.id}
              style={{
                padding: "16px 18px",
                borderRadius: "10px",
                border: t.border(0.06),
                background: t.white,
              }}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <p style={{ fontFamily: t.sans, fontSize: "14px", fontWeight: 600, color: t.ink(0.8) }}>
                  {c.first_name} {c.last_name}
                </p>
                {c.organization && (
                  <span style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.35) }}>
                    · {c.organization}
                  </span>
                )}
              </div>
              <a href={`mailto:${c.email}`} style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.5), textDecoration: "underline", textUnderlineOffset: "2px" }}>
                {c.email}
              </a>
              {c.custom_challenge && (
                <p style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.5), lineHeight: 1.6, marginTop: "8px", paddingTop: "8px", borderTop: t.border(0.04), fontStyle: "italic" }}>
                  "{c.custom_challenge}"
                </p>
              )}
              {c.selected_pains && c.selected_pains.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.selected_pains.map((p, i) => (
                    <span key={i} style={{ fontFamily: t.sans, fontSize: "10px", color: t.ink(0.4), background: t.ink(0.04), padding: "2px 8px", borderRadius: "999px" }}>
                      {p}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ fontFamily: t.sans, fontSize: "10px", color: t.ink(0.25), marginTop: "8px" }}>
                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const SubmissionsFeed = () => {
  const [open, setOpen] = useState(false);
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["deck-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_submissions" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Array<{ id: string; message: string; created_at: string }>;
    },
  });

  const count = submissions?.length ?? 0;

  return (
    <div className="px-4 md:px-8 py-4" style={{ borderTop: t.border(0.06) }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full text-left py-2"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <MessageSquare className="w-4 h-4" style={{ color: t.ink(0.35) }} />
        <span style={{ fontFamily: t.sans, fontSize: "13px", fontWeight: 600, color: t.ink(0.6) }}>
          Deck Submissions
        </span>
        {count > 0 && (
          <span style={{
            fontFamily: t.sans, fontSize: "11px", fontWeight: 600,
            color: t.cream, background: t.ink(0.7),
            padding: "1px 8px", borderRadius: "999px",
          }}>
            {count}
          </span>
        )}
        {open ? <ChevronUp className="w-3.5 h-3.5 ml-auto" style={{ color: t.ink(0.3) }} /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" style={{ color: t.ink(0.3) }} />}
      </button>

      {open && (
        <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {isLoading && <p style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.3) }}>Loading…</p>}
          {!isLoading && count === 0 && (
            <p style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.3), padding: "12px 0" }}>
              No submissions yet.
            </p>
          )}
          {submissions?.map((s) => (
            <div
              key={s.id}
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                border: t.border(0.06),
                background: t.white,
              }}
            >
              <p style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.75), lineHeight: 1.6 }}>
                {s.message}
              </p>
              <p style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.3), marginTop: "8px" }}>
                {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
