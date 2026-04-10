import { useState, useEffect } from "react";
import { Settings, X, Eye, EyeOff, Copy, RefreshCw, Trash2, Lock, Check } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { useIsMobile } from "@/hooks/use-mobile";
import { t } from "@/lib/theme";

const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
};

const PasswordField = ({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { if (!value) return; navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const handleGenerate = () => { onChange(generatePassword()); setShow(true); };

  return (
    <div className="space-y-2">
      <label className="text-[11px] uppercase tracking-[0.06em] flex items-center gap-1.5" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>
        <Lock className="w-3 h-3" /> Password Protection
      </label>
      <div className="rounded-xl overflow-hidden" style={{ border: t.border(0.08), background: t.white }}>
        <div className="flex items-center">
          <input type={show ? "text" : "password"} value={value || ""} onChange={(e) => onChange(e.target.value || null)} placeholder="No password set"
            className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none min-w-0" style={{ fontFamily: t.sans, color: t.ink(0.7) }} />
        </div>
        <div className="flex items-center gap-px px-1 pb-1">
          <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors" style={{ fontFamily: t.sans, color: t.ink(0.35), background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.surface.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {show ? "Hide" : "Show"}
          </button>
          <button onClick={handleGenerate} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors" style={{ fontFamily: t.sans, color: t.ink(0.35), background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.surface.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <RefreshCw className="w-3 h-3" /> Generate
          </button>
          <button onClick={handleCopy} disabled={!value} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors disabled:opacity-20" style={{ fontFamily: t.sans, color: copied ? t.success() : t.ink(0.35), background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.surface.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
          </button>
          {value && (
            <button onClick={() => { onChange(null); setShow(false); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ml-auto" style={{ fontFamily: t.sans, color: t.error(0.5), background: "transparent" }}>
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
      </div>
      {value && <span className="text-[11px] flex items-center gap-1.5" style={{ fontFamily: t.sans, color: t.ink(0.4) }}><Lock className="w-2.5 h-2.5" /> This article is password protected</span>}
    </div>
  );
};

interface EditorMetaBarProps {
  title: string; slug: string; excerpt: string; type: string; capability: string; heroImageUrl: string | null; isPublished: boolean; publishedAt: string | null; password: string | null;
  isFeatured: boolean; sectorLabel: string | null; featuredStat: string | null;
  onTitleChange: (v: string) => void; onSlugChange: (v: string) => void; onExcerptChange: (v: string) => void; onTypeChange: (v: string) => void; onCapabilityChange: (v: string) => void;
  onHeroImageChange: (v: string | null) => void; onPublishedChange: (v: boolean) => void; onPublishedAtChange: (v: string | null) => void; onPasswordChange: (v: string | null) => void;
  onFeaturedChange: (v: boolean) => void; onSectorLabelChange: (v: string | null) => void; onFeaturedStatChange: (v: string | null) => void;
}

const CAPABILITIES = [
  { value: "cultural-strategy", label: "Cultural Strategy" },
  { value: "cross-sector", label: "Cross-Sector Intelligence" },
  { value: "deep-organizing", label: "Deep Organizing" },
];

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const EditorMetaBar = (props: EditorMetaBarProps) => {
  const [slugManual, setSlugManual] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!slugManual && props.title) props.onSlugChange(slugify(props.title));
  }, [props.title, slugManual]);

  return (
    <>
      <div className="px-4 md:px-8 pt-4 pb-2">
        <input value={props.title} onChange={(e) => props.onTitleChange(e.target.value)} placeholder="Untitled"
          className="w-full bg-transparent outline-none text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: t.sans, color: t.ink(0.9) }} />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>/post/</span>
          <input value={props.slug} onChange={(e) => { setSlugManual(true); props.onSlugChange(e.target.value); }}
            className="bg-transparent outline-none text-sm flex-1" style={{ fontFamily: t.sans, color: t.ink(0.4) }} />
          <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-xl transition-colors" title="Post settings"
            onMouseEnter={(e) => (e.currentTarget.style.background = t.surface.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <Settings className="w-4 h-4" style={{ color: t.ink(0.3) }} />
          </button>
        </div>
        <div className="mt-3">
          <label className="text-[11px] uppercase tracking-[0.06em] mb-1 flex items-center gap-2" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>
            DEK
            {!props.excerpt?.trim() && props.isPublished && <span style={{ color: t.error(0.6), fontSize: "10px" }}>MISSING</span>}
          </label>
          <textarea value={props.excerpt} onChange={(e) => props.onExcerptChange(e.target.value)} placeholder="Short description shown on listing cards and below the title"
            rows={2} className="w-full bg-transparent outline-none text-sm resize-none" style={{ fontFamily: t.sans, color: t.ink(0.55), lineHeight: "1.6" }} />
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: t.ink(0.15) }} onClick={() => setDrawerOpen(false)} />
          <div className={`fixed z-50 overflow-y-auto ${isMobile ? "inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]" : "top-0 right-0 h-full w-96"}`}
            style={{ background: t.cream, borderLeft: isMobile ? undefined : t.border(0.06), borderTop: isMobile ? t.border(0.06) : undefined, boxShadow: `-8px 0 30px ${t.ink(0.06)}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: t.border(0.06) }}>
              <span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>Post Settings</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = t.surface.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <X className="w-4 h-4" style={{ color: t.ink(0.4) }} />
              </button>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Type</label>
                <div className="flex gap-1 rounded-xl overflow-hidden" style={{ border: t.border(0.08) }}>
                  {["blog-post", "case-study"].map((tp) => (
                    <button key={tp} onClick={() => props.onTypeChange(tp)} className="flex-1 px-3 py-2.5 text-[12px] transition-colors"
                      style={{ fontFamily: t.sans, background: props.type === tp ? t.ink(1) : "transparent", color: props.type === tp ? t.cream : t.ink(0.4) }}>
                      {tp === "blog-post" ? "Blog Post" : "Case Study"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Capability</label>
                <div className="space-y-1">
                  {CAPABILITIES.map((c) => (
                    <button key={c.value} onClick={() => props.onCapabilityChange(c.value)} className="w-full text-left px-3 py-2 text-sm transition-colors rounded-lg"
                      style={{ fontFamily: t.sans, background: props.capability === c.value ? t.ink(0.05) : "transparent", color: props.capability === c.value ? t.ink(0.8) : t.ink(0.4) }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Status</label>
                <button onClick={() => { const next = !props.isPublished; props.onPublishedChange(next); if (next && !props.publishedAt) props.onPublishedAtChange(new Date().toISOString()); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 transition-colors rounded-xl" style={{ border: t.border(0.08) }}>
                  <span className="text-sm" style={{ fontFamily: t.sans, color: props.isPublished ? t.ink(0.8) : t.ink(0.4) }}>{props.isPublished ? "Published" : "Draft"}</span>
                  <div className="w-9 h-5 rounded-full relative transition-colors" style={{ background: props.isPublished ? t.ink(1) : t.ink(0.12) }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full transition-transform" style={{ background: t.cream, left: "2px", transform: props.isPublished ? "translateX(16px)" : "translateX(0)" }} />
                  </div>
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Hero Image</label>
                <ImageUploader value={props.heroImageUrl} onChange={props.onHeroImageChange} label="" />
              </div>
              <PasswordField value={props.password} onChange={props.onPasswordChange} />

              {/* Featured on Homepage */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Homepage Feature</label>
                <button onClick={() => props.onFeaturedChange(!props.isFeatured)}
                  className="w-full flex items-center justify-between px-3 py-2.5 transition-colors rounded-xl" style={{ border: t.border(0.08) }}>
                  <span className="text-sm" style={{ fontFamily: t.sans, color: props.isFeatured ? t.ink(0.8) : t.ink(0.4) }}>{props.isFeatured ? "Featured" : "Not featured"}</span>
                  <div className="w-9 h-5 rounded-full relative transition-colors" style={{ background: props.isFeatured ? "hsl(var(--destructive))" : t.ink(0.12) }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full transition-transform" style={{ background: t.cream, left: "2px", transform: props.isFeatured ? "translateX(16px)" : "translateX(0)" }} />
                  </div>
                </button>
              </div>
              {props.isFeatured && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Sector Label</label>
                    <input value={props.sectorLabel || ""} onChange={(e) => props.onSectorLabelChange(e.target.value || null)} placeholder="e.g. ENERGY × LABOR"
                      className="w-full px-3 py-2.5 text-sm bg-transparent outline-none rounded-xl" style={{ fontFamily: t.sans, color: t.ink(0.7), border: t.border(0.08) }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Featured Stat</label>
                    <input value={props.featuredStat || ""} onChange={(e) => props.onFeaturedStatChange(e.target.value || null)} placeholder="e.g. $12M in coordinated capital"
                      className="w-full px-3 py-2.5 text-sm bg-transparent outline-none rounded-xl" style={{ fontFamily: t.sans, color: t.ink(0.7), border: t.border(0.08) }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default EditorMetaBar;
