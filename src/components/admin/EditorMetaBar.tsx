import { useState, useEffect } from "react";
import { format } from "date-fns";
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
      <div className="rounded-xl overflow-hidden" style={{ border: t.border(0.08), background: t.ink(0.02) }}>
        <div className="flex items-center">
          <input type={show ? "text" : "password"} value={value || ""} onChange={(e) => onChange(e.target.value || null)} placeholder="No password set"
            className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none min-w-0" style={{ fontFamily: t.sans, color: t.ink(0.7) }} />
        </div>
        <div className="flex items-center gap-px px-1 pb-1">
          <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors" style={{ fontFamily: t.sans, color: t.ink(0.35), background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {show ? "Hide" : "Show"}
          </button>
          <button onClick={handleGenerate} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors" style={{ fontFamily: t.sans, color: t.ink(0.35), background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <RefreshCw className="w-3 h-3" /> Generate
          </button>
          <button onClick={handleCopy} disabled={!value} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors disabled:opacity-20" style={{ fontFamily: t.sans, color: copied ? t.success() : t.ink(0.35), background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
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

const capabilityLabel: Record<string, string> = {
  "cultural-strategy": "Cultural Strategy",
  "cross-sector": "Cross-Sector Intelligence",
  "deep-organizing": "Deep Organizing",
};

const typeLabel: Record<string, string> = {
  "blog-post": "Blog Post",
  "case-study": "Case Study",
  "field-note": "Field Note",
};

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const EditorMetaBar = (props: EditorMetaBarProps) => {
  const [slugManual, setSlugManual] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!slugManual && props.title) props.onSlugChange(slugify(props.title));
  }, [props.title, slugManual]);

  const isCaseStudy = props.type === "case-study";

  // Title sizes: blog = 32/44, case-study = 28/40
  const titleSize = isCaseStudy ? "clamp(28px, 4vw, 40px)" : "clamp(32px, 4vw, 44px)";
  const maxWidth = isCaseStudy ? "720px" : "680px";

  return (
    <>
      {/* Published-style article header */}
      <div className="w-full flex flex-col items-center px-6" style={{ minHeight: isCaseStudy ? "20vh" : (props.heroImageUrl ? undefined : "20vh"), paddingTop: isCaseStudy ? "8vh" : "6vh" }}>

        {/* Hero image for blog posts */}
        {!isCaseStudy && props.heroImageUrl && (
          <div className="w-full relative mb-8 -mx-6" style={{ height: "40vh", marginTop: "-6vh" }}>
            <img src={props.heroImageUrl} alt={props.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, hsl(var(--background)) 100%)` }} />
          </div>
        )}

        <div className="flex flex-col items-center w-full" style={{ maxWidth }}>
          {/* Meta row: type // capability */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>{typeLabel[props.type] || props.type}</span>
            <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.15) }}>//</span>
            <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>{capabilityLabel[props.capability] || props.capability}</span>
            {/* Settings gear inline */}
            <button onClick={() => setDrawerOpen(true)} className="ml-2 p-1.5 rounded-lg transition-colors opacity-40 hover:opacity-80"
              onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <Settings className="w-3.5 h-3.5" style={{ color: t.ink(0.5) }} />
            </button>
          </div>

          {/* Editable title — styled exactly like published */}
          <input
            value={props.title}
            onChange={(e) => props.onTitleChange(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent outline-none font-bold leading-[1.15] text-center"
            style={{ fontFamily: t.sans, color: t.ink(0.9), fontSize: titleSize, lineHeight: 1.15 }}
          />

          {/* Editable excerpt — styled exactly like published */}
          {props.type !== "field-note" && (
            <textarea
              value={props.excerpt}
              onChange={(e) => props.onExcerptChange(e.target.value)}
              placeholder="Short description shown below the title"
              rows={2}
              className="w-full bg-transparent outline-none resize-none text-center mt-4 max-w-2xl"
              style={{ fontFamily: t.sans, color: t.ink(0.55), fontSize: "clamp(17px, 1.9vw, 19px)", lineHeight: 1.7 }}
            />
          )}

          {/* Date */}
          {props.publishedAt && (
            <span className="text-[13px] mt-4" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>
              {format(new Date(props.publishedAt), "MMMM d, yyyy")}
            </span>
          )}
        </div>

        {/* Divider — matches published */}
        <div className="w-12 mt-8 mb-2" style={{ height: "1px", background: t.ink(0.1) }} />
      </div>

      {/* Settings Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: t.ink(0.15) }} onClick={() => setDrawerOpen(false)} />
          <div className={`fixed z-50 overflow-y-auto ${isMobile ? "inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]" : "top-0 right-0 h-full w-96"}`}
            style={{ background: t.cream, borderLeft: isMobile ? undefined : t.border(0.06), borderTop: isMobile ? t.border(0.06) : undefined, boxShadow: `-8px 0 30px ${t.ink(0.06)}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: t.border(0.06) }}>
              <span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>Post Settings</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <X className="w-4 h-4" style={{ color: t.ink(0.4) }} />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Slug / URL */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>URL Slug</label>
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: t.border(0.08) }}>
                  <span className="text-[12px] pl-3 shrink-0" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>/post/</span>
                  <input value={props.slug} onChange={(e) => { setSlugManual(true); props.onSlugChange(e.target.value); }}
                    className="flex-1 px-1 py-2.5 text-sm bg-transparent outline-none min-w-0" style={{ fontFamily: t.sans, color: t.ink(0.5) }} />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Type</label>
                <div className="flex gap-1 rounded-xl overflow-hidden" style={{ border: t.border(0.08) }}>
                  {["blog-post", "case-study", "field-note"].map((tp) => (
                    <button key={tp} onClick={() => props.onTypeChange(tp)} className="flex-1 px-3 py-2.5 text-[12px] transition-colors"
                      style={{ fontFamily: t.sans, background: props.type === tp ? t.ink(1) : "transparent", color: props.type === tp ? t.cream : t.ink(0.4) }}>
                      {tp === "blog-post" ? "Blog Post" : tp === "case-study" ? "Case Study" : "Field Note"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capability */}
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

              {/* Status */}
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

              {/* Hero Image */}
              {props.type !== "field-note" && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Hero Image</label>
                  <ImageUploader value={props.heroImageUrl} onChange={props.onHeroImageChange} label="" />
                </div>
              )}

              {/* Password */}
              {props.type !== "field-note" && (
                <PasswordField value={props.password} onChange={props.onPasswordChange} />
              )}

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
              {props.isFeatured && props.type !== "field-note" && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Slug Line</label>
                    <input value={props.sectorLabel || ""} onChange={(e) => props.onSectorLabelChange(e.target.value || null)} placeholder="e.g. INTELLIGENCE · CULTURE · ORGANIZING"
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
