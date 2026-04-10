import { useRef, useEffect, useState } from "react";
import { GripVertical, Trash2, ChevronDown, Plus, X, Image as ImageIcon } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { useIsMobile } from "@/hooks/use-mobile";
import { t } from "@/lib/theme";

interface BlockEditorProps {
  block: any;
  onChange: (b: any) => void;
  onDelete: () => void;
  onInsertAfter?: () => void;
  onDeleteEmpty?: () => void;
  onSlashCommand?: () => void;
  isCaseStudy: boolean;
  dragHandleProps?: any;
}

function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = el.scrollHeight + "px";
  }, [value]);
  return ref;
}

function AutoTextarea({ value, onChange, placeholder, className = "", style = {}, onKeyDown }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string; style?: React.CSSProperties; onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const ref = useAutoResize(value);
  return (
    <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} rows={1}
      className={`w-full bg-transparent outline-none resize-none overflow-hidden ${className}`} style={{ ...style }} />
  );
}

const BlockEditor = ({ block, onChange, onDelete, onInsertAfter, onDeleteEmpty, onSlashCommand, isCaseStudy, dragHandleProps }: BlockEditorProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isMobile = useIsMobile();
  const update = (patch: any) => onChange({ ...block, ...patch });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && (block.type === "paragraph" || block.type === "heading")) { e.preventDefault(); onInsertAfter?.(); }
    if (e.key === "Backspace" && block.text === "" && (block.type === "paragraph" || block.type === "heading")) { e.preventDefault(); onDeleteEmpty?.(); }
    if (block.type === "paragraph" && block.text === "" && e.key === "/") { e.preventDefault(); onSlashCommand?.(); }
  };

  return (
    <div
      className="group relative flex items-start gap-0 transition-all rounded-xl"
      style={{
        padding: "4px 4px 4px 0",
        background: focused ? t.ink(0.02) : "transparent",
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    >
      <div className="flex items-center w-6 flex-shrink-0 pt-1 justify-center">
        {!isMobile && (
          <div {...(dragHandleProps || {})} className="cursor-grab active:cursor-grabbing p-0.5 transition-opacity duration-200" style={{ opacity: hovered ? 0.2 : 0 }}>
            <GripVertical className="w-3 h-3" style={{ color: t.ink(0.3) }} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* ── Heading: match published sizes ── */}
        {block.type === "heading" && (
          <div className="relative">
            <AutoTextarea value={block.text || ""} onChange={(v) => update({ text: v })} onKeyDown={handleKeyDown} placeholder="Heading..."
              style={{
                fontFamily: t.sans,
                fontWeight: 700,
                color: t.ink(0.85),
                lineHeight: 1.3,
                fontSize: block.level === 1 ? "clamp(24px, 3vw, 32px)" : block.level === 3 ? "clamp(17px, 2vw, 21px)" : "clamp(20px, 2.5vw, 26px)",
              }} />
            <button
              onClick={() => update({ level: ((block.level || 2) % 3) + 1 })}
              className="absolute right-0 top-1 text-[11px] px-1.5 py-0.5 rounded-lg transition-opacity duration-200"
              style={{ fontFamily: t.sans, color: t.ink(0.25), opacity: hovered ? 1 : 0, background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.ink(0.05))}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              H{block.level || 2}
            </button>
          </div>
        )}

        {/* ── Paragraph: match published body ── */}
        {block.type === "paragraph" && (
          <AutoTextarea value={block.text || ""} onChange={(v) => update({ text: v })} onKeyDown={handleKeyDown}
            placeholder="Type / for commands" style={{ fontFamily: t.sans, color: t.ink(0.55), fontSize: "clamp(15px, 1.5vw, 16px)", lineHeight: 1.9 }} />
        )}

        {/* ── Image ── */}
        {block.type === "image" && (
          <div className="space-y-2">
            {block.src ? (
              <div className="relative group/img">
                <img src={block.src} alt={block.alt || ""} className="max-w-full rounded-xl" style={{ maxHeight: "400px", objectFit: "cover" }} />
                <button onClick={() => update({ src: "" })} className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity" style={{ background: t.ink(0.7) }}>
                  <X className="w-3 h-3" style={{ color: t.cream }} />
                </button>
              </div>
            ) : <ImageUploader value={null} onChange={(url) => update({ src: url })} label="" />}
            <input value={block.caption || ""} onChange={(e) => update({ caption: e.target.value })} placeholder="Caption (optional)"
              className="w-full bg-transparent outline-none text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.35) }} />
          </div>
        )}

        {/* ── Video ── */}
        {block.type === "video" && (
          <div className="space-y-2">
            <input value={block.src || ""} onChange={(e) => update({ src: e.target.value })} placeholder="YouTube or Vimeo URL..."
              className="w-full bg-transparent outline-none text-sm px-3 py-2 rounded-xl" style={{ fontFamily: t.sans, color: t.ink(0.6), border: t.border(0.08) }} />
            {block.src && <div className="aspect-video rounded-xl overflow-hidden" style={{ background: t.ink(0.03) }}>
              <iframe src={block.src.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} className="w-full h-full" allowFullScreen />
            </div>}
          </div>
        )}

        {/* ── Embed ── */}
        {block.type === "embed" && (
          <div className="space-y-2">
            <AutoTextarea value={block.html || ""} onChange={(v) => update({ html: v })} placeholder="Paste embed HTML or iframe..."
              style={{ fontFamily: t.sans, color: t.ink(0.5), fontSize: "12px", lineHeight: 1.7 }} />
            {block.html && <div className="rounded-xl overflow-hidden p-3" style={{ background: t.ink(0.02), border: t.border(0.06) }}>
              <div dangerouslySetInnerHTML={{ __html: block.html }} />
            </div>}
          </div>
        )}

        {/* ── Quote: match published — serif italic, left border ── */}
        {block.type === "quote" && (
          <div className="pl-4 md:pl-6 py-2" style={{ borderLeft: `2px solid ${t.ink(0.12)}` }}>
            <AutoTextarea value={block.text || ""} onChange={(v) => update({ text: v })} placeholder="Quote text..."
              style={{ fontFamily: t.serif, color: t.ink(0.86), fontSize: "clamp(15px, 1.5vw, 17px)", lineHeight: 1.7, fontStyle: "italic" }} />
            <input value={block.attribution || ""} onChange={(e) => update({ attribution: e.target.value })} placeholder="— Attribution"
              className="w-full bg-transparent outline-none text-[12px] mt-1" style={{ fontFamily: t.sans, color: t.ink(0.4) }} />
          </div>
        )}

        {/* ── Callout: match published background + border ── */}
        {block.type === "callout" && (
          <div className="px-4 py-3 md:p-5 rounded-xl" style={{ background: t.ink(0.04), border: t.border(0.08) }}>
            <AutoTextarea value={block.text || ""} onChange={(v) => update({ text: v })} placeholder="Callout text..."
              style={{ fontFamily: t.sans, color: t.ink(0.55), fontSize: "clamp(15px, 1.5vw, 16px)", lineHeight: 1.8 }} />
          </div>
        )}

        {/* ── Expandable ── */}
        {block.type === "expandable" && (
          <div className="rounded-xl" style={{ border: t.border(0.08) }}>
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: t.border(0.06) }}>
              <ChevronDown className="w-3 h-3" style={{ color: t.ink(0.3) }} />
              <input value={block.title || ""} onChange={(e) => update({ title: e.target.value })} placeholder="Section title..."
                className="flex-1 bg-transparent outline-none text-sm font-medium" style={{ fontFamily: t.sans, color: t.ink(0.7) }} />
            </div>
            <div className="p-3 pl-6 space-y-2" style={{ background: t.ink(0.02) }}>
              {(block.blocks || []).map((inner: any, idx: number) => (
                <AutoTextarea key={idx} value={inner.text || ""} onChange={(v) => {
                  const newBlocks = [...(block.blocks || [])]; newBlocks[idx] = { ...inner, text: v }; update({ blocks: newBlocks });
                }} placeholder="Content..." style={{ fontFamily: t.sans, color: t.ink(0.55), fontSize: "15px", lineHeight: 1.9 }} />
              ))}
              <button onClick={() => update({ blocks: [...(block.blocks || []), { type: "paragraph", text: "" }] })}
                className="text-[11px] flex items-center gap-1 py-1" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>
                <Plus className="w-3 h-3" /> Add paragraph
              </button>
            </div>
          </div>
        )}

        {/* ── Carousel ── */}
        {block.type === "carousel" && (
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
            {(block.slides || []).map((slide: any, idx: number) => (
              <div key={idx} className="flex-shrink-0 relative group/slide" style={{ width: "140px" }}>
                {slide.image ? (
                  <div className="relative">
                    <img src={slide.image} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <button onClick={() => { const slides = [...block.slides]; slides[idx] = { ...slide, image: "" }; update({ slides }); }}
                      className="absolute top-1 right-1 p-0.5 rounded-full opacity-0 group-hover/slide:opacity-100 transition-opacity" style={{ background: t.ink(0.7) }}>
                      <X className="w-2.5 h-2.5" style={{ color: t.cream }} />
                    </button>
                  </div>
                ) : <div className="w-full h-20 rounded-lg flex items-center justify-center" style={{ border: `1px dashed ${t.ink(0.12)}` }}>
                  <ImageIcon className="w-4 h-4" style={{ color: t.ink(0.2) }} />
                </div>}
                <input value={slide.caption || ""} onChange={(e) => { const slides = [...block.slides]; slides[idx] = { ...slide, caption: e.target.value }; update({ slides }); }}
                  placeholder="Caption" className="w-full bg-transparent outline-none text-[11px] mt-1" style={{ fontFamily: t.sans, color: t.ink(0.35) }} />
              </div>
            ))}
            <button onClick={() => update({ slides: [...(block.slides || []), { image: "", caption: "" }] })}
              className="flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center" style={{ border: `1px dashed ${t.ink(0.12)}` }}>
              <Plus className="w-4 h-4" style={{ color: t.ink(0.2) }} />
            </button>
          </div>
        )}

        {/* ── Stat Grid ── */}
        {block.type === "stat-grid" && (
          <div className="space-y-2">
            {(block.stats || []).map((stat: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input value={stat.label || ""} onChange={(e) => { const stats = [...block.stats]; stats[idx] = { ...stat, label: e.target.value }; update({ stats }); }}
                  placeholder="Label" className="bg-transparent outline-none text-sm px-2 py-1.5 flex-1 rounded-lg" style={{ fontFamily: t.sans, color: t.ink(0.7), border: t.border(0.08) }} />
                <input value={stat.description || ""} onChange={(e) => { const stats = [...block.stats]; stats[idx] = { ...stat, description: e.target.value }; update({ stats }); }}
                  placeholder="Description" className="bg-transparent outline-none text-sm px-2 py-1.5 flex-1 rounded-lg" style={{ fontFamily: t.sans, color: t.ink(0.5), border: t.border(0.08) }} />
                <button onClick={() => update({ stats: block.stats.filter((_: any, i: number) => i !== idx) })} className="p-1">
                  <X className="w-3 h-3" style={{ color: t.ink(0.3) }} />
                </button>
              </div>
            ))}
            <button onClick={() => update({ stats: [...(block.stats || []), { label: "", description: "" }] })}
              className="text-[11px] flex items-center gap-1 py-1" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>
              <Plus className="w-3 h-3" /> Add stat
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onDelete}
        className="absolute top-1 right-1 p-1.5 rounded-full transition-opacity duration-200"
        style={{
          opacity: hovered || isMobile ? 0.6 : 0,
          background: t.ink(0.05),
        }}
        title="Delete block"
      >
        <Trash2 className="w-3 h-3" style={{ color: "hsl(0 60% 45% / 0.6)" }} />
      </button>
    </div>
  );
};

export default BlockEditor;
