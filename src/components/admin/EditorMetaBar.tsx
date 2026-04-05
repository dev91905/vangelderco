import { useState, useEffect } from "react";
import { Settings, X, Eye, EyeOff, Copy, RefreshCw, Trash2, Lock, Check } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { useIsMobile } from "@/hooks/use-mobile";

const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
};

const PasswordField = ({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleGenerate = () => {
    const pw = generatePassword();
    onChange(pw);
    setShow(true);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.12em] flex items-center gap-1.5" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>
        <Lock className="w-3 h-3" /> Password Protection
      </label>
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid hsl(0 0% 12%)", background: "hsl(0 0% 4%)" }}>
        <div className="flex items-center">
          <input
            type={show ? "text" : "password"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="No password set"
            className="flex-1 px-3 py-2.5 text-xs bg-transparent outline-none min-w-0"
            style={{ ...mono, color: "hsl(0 0% 100% / 0.7)" }}
          />
        </div>
        <div className="flex items-center gap-px px-1 pb-1">
          <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[hsl(0_0%_10%)]" style={{ ...mono, color: "hsl(0 0% 100% / 0.3)" }}>
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {show ? "Hide" : "Show"}
          </button>
          <button onClick={handleGenerate} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[hsl(0_0%_10%)]" style={{ ...mono, color: "hsl(0 0% 100% / 0.3)" }}>
            <RefreshCw className="w-3 h-3" /> Generate
          </button>
          <button onClick={handleCopy} disabled={!value} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[hsl(0_0%_10%)] disabled:opacity-20" style={{ ...mono, color: copied ? "hsl(120 40% 50% / 0.7)" : "hsl(0 0% 100% / 0.3)" }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {value && (
            <button onClick={() => { onChange(null); setShow(false); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[hsl(0_80%_48%_/_0.08)] ml-auto" style={{ ...mono, color: "hsl(0 80% 48% / 0.5)" }}>
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
      </div>
      {value && (
        <span className="text-[9px] flex items-center gap-1.5" style={{ ...mono, color: "hsl(0 80% 48% / 0.5)" }}>
          <Lock className="w-2.5 h-2.5" /> This article is password protected
        </span>
      )}
    </div>
  );
};

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

interface EditorMetaBarProps {
  title: string;
  slug: string;
  type: string;
  capability: string;
  heroImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  password: string | null;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onCapabilityChange: (v: string) => void;
  onHeroImageChange: (v: string | null) => void;
  onPublishedChange: (v: boolean) => void;
  onPublishedAtChange: (v: string | null) => void;
  onPasswordChange: (v: string | null) => void;
}

const CAPABILITIES = [
  { value: "cultural-strategy", label: "Cultural Strategy" },
  { value: "cross-sector", label: "Cross-Sector Intelligence" },
  { value: "deep-organizing", label: "Deep Organizing" },
];

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const grotesk: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

const EditorMetaBar = (props: EditorMetaBarProps) => {
  const [slugManual, setSlugManual] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!slugManual && props.title) {
      props.onSlugChange(slugify(props.title));
    }
  }, [props.title, slugManual]);

  return (
    <>
      {/* Title — always visible at top of canvas */}
      <div className="px-4 md:px-8 pt-4 pb-2">
        <input
          value={props.title}
          onChange={(e) => props.onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent outline-none text-3xl md:text-4xl font-bold tracking-tight"
          style={{ ...grotesk, color: "hsl(0 0% 100% / 0.95)" }}
        />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px]" style={{ ...mono, color: "hsl(0 0% 100% / 0.2)" }}>/post/</span>
          <input
            value={props.slug}
            onChange={(e) => { setSlugManual(true); props.onSlugChange(e.target.value); }}
            className="bg-transparent outline-none text-xs flex-1"
            style={{ ...mono, color: "hsl(0 0% 100% / 0.4)" }}
          />
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg transition-colors hover:bg-[hsl(0_0%_10%)]"
            title="Post settings"
          >
            <Settings className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
          </button>
        </div>
      </div>

      {/* Settings drawer overlay */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: "hsl(0 0% 0% / 0.5)" }} onClick={() => setDrawerOpen(false)} />
          <div
            className={`fixed z-50 overflow-y-auto ${isMobile ? "inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]" : "top-0 right-0 h-full w-96"}`}
            style={{ background: "hsl(0 0% 5%)", borderLeft: isMobile ? undefined : "1px solid hsl(0 0% 12%)", borderTop: isMobile ? "1px solid hsl(0 0% 12%)" : undefined }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
              <span className="text-[10px] uppercase tracking-[0.15em]" style={{ ...mono, color: "hsl(0 0% 100% / 0.3)" }}>
                Post Settings
              </span>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded hover:bg-[hsl(0_0%_10%)] transition-colors">
                <X className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.4)" }} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Type */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.12em]" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>Type</label>
                <div className="flex gap-1" style={{ border: "1px solid hsl(0 0% 15%)" }}>
                  {["blog-post", "case-study"].map((t) => (
                    <button
                      key={t}
                      onClick={() => props.onTypeChange(t)}
                      className="flex-1 px-3 py-2.5 text-[11px] tracking-[0.1em] uppercase transition-colors"
                      style={{
                        ...mono,
                        background: props.type === t ? "hsl(0 80% 48% / 0.12)" : "transparent",
                        color: props.type === t ? "hsl(0 80% 48%)" : "hsl(0 0% 100% / 0.35)",
                      }}
                    >
                      {t === "blog-post" ? "Blog Post" : "Case Study"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capability */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.12em]" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>Capability</label>
                <div className="space-y-1">
                  {CAPABILITIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => props.onCapabilityChange(c.value)}
                      className="w-full text-left px-3 py-2 text-xs transition-colors"
                      style={{
                        ...mono,
                        background: props.capability === c.value ? "hsl(0 80% 48% / 0.08)" : "transparent",
                        color: props.capability === c.value ? "hsl(0 0% 100% / 0.8)" : "hsl(0 0% 100% / 0.35)",
                        borderLeft: props.capability === c.value ? "2px solid hsl(0 80% 48% / 0.5)" : "2px solid transparent",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Publish toggle */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.12em]" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>Status</label>
                <button
                  onClick={() => {
                    const next = !props.isPublished;
                    props.onPublishedChange(next);
                    if (next && !props.publishedAt) props.onPublishedAtChange(new Date().toISOString());
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
                  style={{ border: "1px solid hsl(0 0% 15%)" }}
                >
                  <span className="text-xs" style={{ ...mono, color: props.isPublished ? "hsl(0 80% 48%)" : "hsl(0 0% 100% / 0.4)" }}>
                    {props.isPublished ? "Published" : "Draft"}
                  </span>
                  <div
                    className="w-9 h-5 rounded-full relative transition-colors"
                    style={{ background: props.isPublished ? "hsl(0 80% 48%)" : "hsl(0 0% 20%)" }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                      style={{
                        background: "hsl(0 0% 100%)",
                        left: "2px",
                        transform: props.isPublished ? "translateX(16px)" : "translateX(0)",
                      }}
                    />
                  </div>
                </button>
              </div>

              {/* Hero image */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.12em]" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>Hero Image</label>
                <ImageUploader value={props.heroImageUrl} onChange={props.onHeroImageChange} label="" />
              </div>

              {/* Password protection */}
              <PasswordField value={props.password} onChange={props.onPasswordChange} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default EditorMetaBar;
