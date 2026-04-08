import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Settings, X, Lock, Eye, EyeOff, Copy, RefreshCw, Trash2, Check, LogOut, ArrowLeft } from "lucide-react";
import PostListTable from "@/components/admin/PostListTable";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import useGlitchSFX from "@/hooks/useGlitchSFX";

const label: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

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
        <label className="text-[11px] uppercase tracking-[0.08em] flex items-center gap-2" style={{ ...label, color: "hsl(30 10% 12% / 0.4)" }}>
          <Lock className="w-3 h-3" /> Global Article Password
        </label>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: value ? "hsl(30 10% 12%)" : "hsl(30 10% 12% / 0.15)" }} />
          <span className="text-[11px]" style={{ ...label, color: value ? "hsl(30 10% 12% / 0.7)" : "hsl(30 10% 12% / 0.3)" }}>
            {value ? "Active" : "Not set"}
          </span>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(30 10% 12% / 0.08)", background: "hsl(0 0% 100%)" }}>
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="No global password"
            className="w-full px-3 py-2.5 text-sm bg-transparent outline-none"
            style={{ ...label, color: "hsl(30 10% 12% / 0.8)" }}
          />
          <div className="flex items-center gap-px px-1 pb-1">
            <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)]" style={{ ...label, color: "hsl(30 10% 12% / 0.4)" }}>
              {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {show ? "Hide" : "Show"}
            </button>
            <button onClick={handleGen} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)]" style={{ ...label, color: "hsl(30 10% 12% / 0.4)" }}>
              <RefreshCw className="w-3 h-3" /> Generate
            </button>
            <button onClick={handleCopy} disabled={!value} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)] disabled:opacity-20" style={{ ...label, color: copied ? "hsl(150 40% 40%)" : "hsl(30 10% 12% / 0.4)" }}>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
            </button>
            {value && (
              <button onClick={onRemove} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tracking-[0.05em] transition-colors hover:bg-[hsl(0_60%_50%_/_0.06)] ml-auto" style={{ ...label, color: "hsl(0 60% 45% / 0.6)" }}>
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <button onClick={onSave} className="w-full px-4 py-2.5 text-sm transition-all rounded-full" style={{ ...label, background: "hsl(30 10% 12%)", color: "hsl(40 30% 96%)" }}>
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
    <div className="min-h-screen" style={{ background: "hsl(40 30% 96%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4" style={{ borderBottom: "1px solid hsl(30 10% 12% / 0.06)" }}>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.05em] transition-all rounded-full"
            style={{
              ...label,
              color: "hsl(30 10% 12% / 0.4)",
              border: "1px solid hsl(30 10% 12% / 0.1)",
            }}
            onMouseEnter={(e) => {
              playHoverGlitch();
              e.currentTarget.style.color = "hsl(30 10% 12% / 0.8)";
              e.currentTarget.style.borderColor = "hsl(30 10% 12% / 0.2)";
              e.currentTarget.style.background = "hsl(0 0% 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "hsl(30 10% 12% / 0.4)";
              e.currentTarget.style.borderColor = "hsl(30 10% 12% / 0.1)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <ArrowLeft className="w-3 h-3" /> Back to Site
          </Link>
          <h1 className="text-lg font-medium tracking-tight" style={{ fontFamily: "'Instrument Serif', serif", color: "hsl(30 10% 12% / 0.85)" }}>
            Content Manager
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }}
            className="p-2 rounded-xl transition-colors hover:bg-[hsl(0_0%_100%)]"
            style={{ border: "1px solid hsl(30 10% 12% / 0.06)" }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.3)" }} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl relative transition-colors hover:bg-[hsl(0_0%_100%)]"
            style={{ border: "1px solid hsl(30 10% 12% / 0.06)" }}
            title="Site settings"
          >
            <Settings className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.3)" }} />
            {settings?.global_article_password && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "hsl(30 10% 12%)" }} />
            )}
          </button>
          <Link
            to="/admin/new"
            className="flex items-center gap-2 px-4 py-2 text-sm transition-colors rounded-full"
            style={{ ...label, color: "hsl(40 30% 96%)", background: "hsl(30 10% 12%)" }}
          >
            <Plus className="w-3 h-3" /> New Post
          </Link>
        </div>
      </div>

      {/* Site settings overlay */}
      {settingsOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: "hsl(30 10% 12% / 0.2)" }} onClick={() => setSettingsOpen(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "hsl(40 30% 96%)", border: "1px solid hsl(30 10% 12% / 0.08)", boxShadow: "0 25px 50px -12px hsl(30 10% 12% / 0.15)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid hsl(30 10% 12% / 0.06)" }}>
              <span className="text-sm" style={{ ...label, color: "hsl(30 10% 12% / 0.5)" }}>Site Settings</span>
              <button onClick={() => setSettingsOpen(false)} className="p-1.5 rounded-lg hover:bg-[hsl(30_10%_12%_/_0.04)] transition-colors">
                <X className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.4)" }} />
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
      <div className="flex flex-wrap items-center gap-2 px-4 md:px-8 py-3" style={{ borderBottom: "1px solid hsl(30 10% 12% / 0.04)" }}>
        {typeChips.map((c) => (
          <button
            key={c.value}
            onClick={() => setTypeFilter(c.value)}
            onPointerEnter={() => playHoverGlitch()}
            className="px-3 py-1 text-[12px] tracking-[0.02em] rounded-full transition-all"
            style={{
              ...label,
              color: typeFilter === c.value ? "hsl(40 30% 96%)" : "hsl(30 10% 12% / 0.45)",
              background: typeFilter === c.value ? "hsl(30 10% 12%)" : "transparent",
              border: `1px solid ${typeFilter === c.value ? "hsl(30 10% 12%)" : "hsl(30 10% 12% / 0.1)"}`,
            }}
          >
            {c.label}
          </button>
        ))}
        <div className="w-px h-4 mx-1" style={{ background: "hsl(30 10% 12% / 0.08)" }} />
        {capChips.map((c) => (
          <button
            key={c.value}
            onClick={() => setCapFilter(c.value)}
            onPointerEnter={() => playHoverGlitch()}
            className="px-3 py-1 text-[12px] tracking-[0.02em] rounded-full transition-all"
            style={{
              ...label,
              color: capFilter === c.value ? "hsl(30 10% 12% / 0.8)" : "hsl(30 10% 12% / 0.35)",
              background: capFilter === c.value ? "hsl(30 10% 12% / 0.06)" : "transparent",
              border: `1px solid ${capFilter === c.value ? "hsl(30 10% 12% / 0.1)" : "transparent"}`,
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
