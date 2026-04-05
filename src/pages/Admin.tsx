import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Settings, X, Lock, Eye, EyeOff, Copy, RefreshCw, Trash2, Check, LogOut, ArrowLeft } from "lucide-react";
import PostListTable from "@/components/admin/PostListTable";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import useGlitchSFX from "@/hooks/useGlitchSFX";

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

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
        <label className="text-[10px] uppercase tracking-[0.12em] flex items-center gap-2" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>
          <Lock className="w-3 h-3" /> Global Article Password
        </label>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: value ? "hsl(0 80% 48%)" : "hsl(0 0% 25%)" }} />
          <span className="text-[10px]" style={{ ...mono, color: value ? "hsl(0 80% 48% / 0.7)" : "hsl(0 0% 100% / 0.2)" }}>
            {value ? "Active" : "Not set"}
          </span>
        </div>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid hsl(0 0% 12%)", background: "hsl(0 0% 3%)" }}>
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="No global password"
            className="w-full px-3 py-2.5 text-xs bg-transparent outline-none"
            style={{ ...mono, color: "hsl(0 0% 100% / 0.7)" }}
          />
          <div className="flex items-center gap-px px-1 pb-1">
            <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[hsl(0_0%_10%)]" style={{ ...mono, color: "hsl(0 0% 100% / 0.3)" }}>
              {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {show ? "Hide" : "Show"}
            </button>
            <button onClick={handleGen} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[hsl(0_0%_10%)]" style={{ ...mono, color: "hsl(0 0% 100% / 0.3)" }}>
              <RefreshCw className="w-3 h-3" /> Generate
            </button>
            <button onClick={handleCopy} disabled={!value} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[hsl(0_0%_10%)] disabled:opacity-20" style={{ ...mono, color: copied ? "hsl(120 40% 50% / 0.7)" : "hsl(0 0% 100% / 0.3)" }}>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
            </button>
            {value && (
              <button onClick={onRemove} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[hsl(0_80%_48%_/_0.08)] ml-auto" style={{ ...mono, color: "hsl(0 80% 48% / 0.5)" }}>
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <button onClick={onSave} className="w-full px-4 py-2.5 text-xs transition-all rounded" style={{ ...mono, background: "hsl(0 80% 48%)", color: "hsl(0 0% 100%)" }}>
        Save
      </button>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const { playHoverGlitch, playClickGlitch } = useGlitchSFX();
  const [typeFilter, setTypeFilter] = useState("all");
  const [capFilter, setCapFilter] = useState("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const [globalPw, setGlobalPw] = useState<string>("");
  const [pwLoaded, setPwLoaded] = useState(false);

  // Sync global password from settings once loaded
  if (settings && !pwLoaded) {
    setGlobalPw(settings.global_article_password || "");
    setPwLoaded(true);
  }

  const typeChips = [
    { value: "all", label: "All" },
    { value: "blog-post", label: "Blog Posts" },
    { value: "case-study", label: "Case Studies" },
  ];

  const capChips = [
    { value: "all", label: "All" },
    { value: "cultural-strategy", label: "Cultural Strategy" },
    { value: "cross-sector", label: "Cross-Sector" },
    { value: "deep-organizing", label: "Deep Organizing" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "hsl(0 0% 2.5%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-all rounded-sm"
            style={{
              ...mono,
              color: "hsl(0 0% 100% / 0.35)",
              border: "1px solid hsl(0 0% 15%)",
              transition: "color 300ms, border-color 300ms, background 300ms",
            }}
            onMouseEnter={(e) => {
              playHoverGlitch();
              e.currentTarget.style.color = "hsl(0 80% 48% / 0.9)";
              e.currentTarget.style.borderColor = "hsl(0 80% 48% / 0.3)";
              e.currentTarget.style.background = "hsl(0 80% 48% / 0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "hsl(0 0% 100% / 0.35)";
              e.currentTarget.style.borderColor = "hsl(0 0% 15%)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <ArrowLeft className="w-3 h-3" /> Back to Site
          </Link>
          <h1 className="text-sm font-semibold tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.85)" }}>
            Content Manager
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }}
            className="p-2 rounded-lg"
            style={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 12%)", transition: "background 300ms, border-color 300ms" }}
            onMouseEnter={(e) => { playHoverGlitch(); e.currentTarget.style.background = "hsl(0 0% 10%)"; e.currentTarget.style.borderColor = "hsl(0 0% 18%)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "hsl(0 0% 6%)"; e.currentTarget.style.borderColor = "hsl(0 0% 12%)"; }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg relative"
            style={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 12%)", transition: "background 300ms, border-color 300ms" }}
            onMouseEnter={(e) => { playHoverGlitch(); e.currentTarget.style.background = "hsl(0 0% 10%)"; e.currentTarget.style.borderColor = "hsl(0 0% 18%)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "hsl(0 0% 6%)"; e.currentTarget.style.borderColor = "hsl(0 0% 12%)"; }}
            title="Site settings"
          >
            <Settings className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
            {settings?.global_article_password && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "hsl(0 80% 48%)" }} />
            )}
          </button>
          <Link
            to="/admin/new"
            className="flex items-center gap-2 px-4 py-2 text-xs transition-colors hover:bg-[hsl(0_80%_48%_/_0.15)]"
            style={{ ...mono, color: "hsl(0 80% 48%)", border: "1px solid hsl(0 80% 48% / 0.4)" }}
          >
            <Plus className="w-3 h-3" /> New Post
          </Link>
        </div>
      </div>

      {/* Site settings overlay */}
      {settingsOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: "hsl(0 0% 0% / 0.5)" }} onClick={() => setSettingsOpen(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-xl overflow-hidden" style={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 12%)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
              <span className="text-[10px] uppercase tracking-[0.15em]" style={{ ...mono, color: "hsl(0 0% 100% / 0.3)" }}>Site Settings</span>
              <button onClick={() => setSettingsOpen(false)} className="p-1.5 rounded hover:bg-[hsl(0_0%_10%)] transition-colors">
                <X className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.4)" }} />
              </button>
            </div>
            <GlobalPasswordPanel
              value={globalPw}
              onChange={setGlobalPw}
              onSave={() => {
                updateSetting.mutate({ key: "global_article_password", value: globalPw || null });
                setSettingsOpen(false);
              }}
              onRemove={() => {
                setGlobalPw("");
                updateSetting.mutate({ key: "global_article_password", value: null });
                setSettingsOpen(false);
              }}
            />
          </div>
        </>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 px-4 md:px-8 py-3" style={{ borderBottom: "1px solid hsl(0 0% 8%)" }}>
        {typeChips.map((c) => (
          <button
            key={c.value}
            onClick={() => setTypeFilter(c.value)}
            onPointerEnter={() => playHoverGlitch()}
            className="px-3 py-1 text-[10px] tracking-[0.1em] uppercase rounded-sm"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: typeFilter === c.value ? "hsl(0 80% 48%)" : "hsl(0 0% 100% / 0.35)",
              background: typeFilter === c.value ? "hsl(0 80% 48% / 0.1)" : "transparent",
              border: `1px solid ${typeFilter === c.value ? "hsl(0 80% 48% / 0.3)" : "hsl(0 0% 15%)"}`,
              transition: "color 300ms, background 300ms, border-color 300ms",
            }}
            onMouseEnter={(e) => {
              if (typeFilter !== c.value) {
                e.currentTarget.style.color = "hsl(0 80% 48% / 0.7)";
                e.currentTarget.style.background = "hsl(0 80% 48% / 0.05)";
                e.currentTarget.style.borderColor = "hsl(0 80% 48% / 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (typeFilter !== c.value) {
                e.currentTarget.style.color = "hsl(0 0% 100% / 0.35)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "hsl(0 0% 15%)";
              }
            }}
          >
            {c.label}
          </button>
        ))}
        <div className="w-px h-4 mx-1" style={{ background: "hsl(0 0% 15%)" }} />
        {capChips.map((c) => (
          <button
            key={c.value}
            onClick={() => setCapFilter(c.value)}
            onPointerEnter={() => playHoverGlitch()}
            className="px-3 py-1 text-[10px] tracking-[0.1em] uppercase rounded-sm"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: capFilter === c.value ? "hsl(0 0% 100% / 0.7)" : "hsl(0 0% 100% / 0.25)",
              background: capFilter === c.value ? "hsl(0 0% 10%)" : "transparent",
              border: `1px solid ${capFilter === c.value ? "hsl(0 0% 20%)" : "transparent"}`,
              transition: "color 300ms, background 300ms, border-color 300ms",
            }}
            onMouseEnter={(e) => {
              if (capFilter !== c.value) {
                e.currentTarget.style.color = "hsl(0 0% 100% / 0.55)";
                e.currentTarget.style.background = "hsl(0 0% 8%)";
                e.currentTarget.style.borderColor = "hsl(0 0% 18%)";
              }
            }}
            onMouseLeave={(e) => {
              if (capFilter !== c.value) {
                e.currentTarget.style.color = "hsl(0 0% 100% / 0.25)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="px-4 md:px-8 py-2">
        <PostListTable filter={{ type: typeFilter, capability: capFilter }} />
      </div>
    </div>
  );
};

export default Admin;
