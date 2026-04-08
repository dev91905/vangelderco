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
      <label className="text-[11px] uppercase tracking-[0.06em] flex items-center gap-1.5" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>
        <Lock className="w-3 h-3" /> Password Protection
      </label>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(30 10% 12% / 0.08)", background: "hsl(0 0% 100%)" }}>
        <div className="flex items-center">
          <input
            type={show ? "text" : "password"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="No password set"
            className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none min-w-0"
            style={{ ...label, color: "hsl(30 10% 12% / 0.7)" }}
          />
        </div>
        <div className="flex items-center gap-px px-1 pb-1">
          <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)]" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {show ? "Hide" : "Show"}
          </button>
          <button onClick={handleGenerate} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)]" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>
            <RefreshCw className="w-3 h-3" /> Generate
          </button>
          <button onClick={handleCopy} disabled={!value} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)] disabled:opacity-20" style={{ ...label, color: copied ? "hsl(150 40% 40%)" : "hsl(30 10% 12% / 0.35)" }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {value && (
            <button onClick={() => { onChange(null); setShow(false); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors hover:bg-[hsl(0_60%_50%_/_0.06)] ml-auto" style={{ ...label, color: "hsl(0 60% 45% / 0.5)" }}>
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
      </div>
      {value && (
        <span className="text-[11px] flex items-center gap-1.5" style={{ ...label, color: "hsl(30 10% 12% / 0.4)" }}>
          <Lock className="w-2.5 h-2.5" /> This article is password protected
        </span>
      )}
    </div>
  );
};


interface EditorMetaBarProps {
  title: string;
  slug: string;
  excerpt: string;
  type: string;
  capability: string;
  heroImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  password: string | null;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onExcerptChange: (v: string) => void;
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

const label: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const serif: React.CSSProperties = { fontFamily: "'Instrument Serif', serif" };

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
          className="w-full bg-transparent outline-none text-3xl md:text-4xl font-medium tracking-tight"
          style={{ ...serif, color: "hsl(30 10% 12% / 0.9)" }}
        />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[12px]" style={{ ...label, color: "hsl(30 10% 12% / 0.25)" }}>/post/</span>
          <input
            value={props.slug}
            onChange={(e) => { setSlugManual(true); props.onSlugChange(e.target.value); }}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ ...label, color: "hsl(30 10% 12% / 0.4)" }}
          />
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)]"
            title="Post settings"
          >
            <Settings className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.3)" }} />
          </button>
        </div>
        {/* DEK */}
        <div className="mt-3">
          <label className="text-[11px] uppercase tracking-[0.06em] mb-1 flex items-center gap-2" style={{ ...label, color: "hsl(30 10% 12% / 0.25)" }}>
            DEK
            {!props.excerpt?.trim() && props.isPublished && (
              <span style={{ color: "hsl(0 60% 45% / 0.6)", fontSize: "10px" }}>MISSING</span>
            )}
          </label>
          <textarea
            value={props.excerpt}
            onChange={(e) => props.onExcerptChange(e.target.value)}
            placeholder="Short description shown on listing cards and below the title"
            rows={2}
            className="w-full bg-transparent outline-none text-sm resize-none"
            style={{ ...label, color: "hsl(30 10% 12% / 0.55)", lineHeight: "1.6" }}
          />
        </div>
      </div>

      {/* Settings drawer overlay */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: "hsl(30 10% 12% / 0.15)" }} onClick={() => setDrawerOpen(false)} />
          <div
            className={`fixed z-50 overflow-y-auto ${isMobile ? "inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]" : "top-0 right-0 h-full w-96"}`}
            style={{ background: "hsl(40 30% 96%)", borderLeft: isMobile ? undefined : "1px solid hsl(30 10% 12% / 0.06)", borderTop: isMobile ? "1px solid hsl(30 10% 12% / 0.06)" : undefined, boxShadow: "-8px 0 30px hsl(30 10% 12% / 0.06)" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid hsl(30 10% 12% / 0.06)" }}>
              <span className="text-sm" style={{ ...label, color: "hsl(30 10% 12% / 0.4)" }}>
                Post Settings
              </span>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-[hsl(30_10%_12%_/_0.04)] transition-colors">
                <X className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.4)" }} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Type */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>Type</label>
                <div className="flex gap-1 rounded-xl overflow-hidden" style={{ border: "1px solid hsl(30 10% 12% / 0.08)" }}>
                  {["blog-post", "case-study"].map((t) => (
                    <button
                      key={t}
                      onClick={() => props.onTypeChange(t)}
                      className="flex-1 px-3 py-2.5 text-[12px] transition-colors"
                      style={{
                        ...label,
                        background: props.type === t ? "hsl(30 10% 12%)" : "transparent",
                        color: props.type === t ? "hsl(40 30% 96%)" : "hsl(30 10% 12% / 0.4)",
                      }}
                    >
                      {t === "blog-post" ? "Blog Post" : "Case Study"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capability */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>Capability</label>
                <div className="space-y-1">
                  {CAPABILITIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => props.onCapabilityChange(c.value)}
                      className="w-full text-left px-3 py-2 text-sm transition-colors rounded-lg"
                      style={{
                        ...label,
                        background: props.capability === c.value ? "hsl(30 10% 12% / 0.05)" : "transparent",
                        color: props.capability === c.value ? "hsl(30 10% 12% / 0.8)" : "hsl(30 10% 12% / 0.4)",
                        borderLeft: props.capability === c.value ? "2px solid hsl(30 10% 12% / 0.3)" : "2px solid transparent",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Publish toggle */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>Status</label>
                <button
                  onClick={() => {
                    const next = !props.isPublished;
                    props.onPublishedChange(next);
                    if (next && !props.publishedAt) props.onPublishedAtChange(new Date().toISOString());
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 transition-colors rounded-xl"
                  style={{ border: "1px solid hsl(30 10% 12% / 0.08)" }}
                >
                  <span className="text-sm" style={{ ...label, color: props.isPublished ? "hsl(30 10% 12% / 0.8)" : "hsl(30 10% 12% / 0.4)" }}>
                    {props.isPublished ? "Published" : "Draft"}
                  </span>
                  <div
                    className="w-9 h-5 rounded-full relative transition-colors"
                    style={{ background: props.isPublished ? "hsl(30 10% 12%)" : "hsl(30 10% 12% / 0.12)" }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                      style={{
                        background: "hsl(40 30% 96%)",
                        left: "2px",
                        transform: props.isPublished ? "translateX(16px)" : "translateX(0)",
                      }}
                    />
                  </div>
                </button>
              </div>

              {/* Hero image */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>Hero Image</label>
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
