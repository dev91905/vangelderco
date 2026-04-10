import { useRef, useEffect, useState } from "react";
import { GripVertical, Trash2, ChevronDown, Plus, X, Image as ImageIcon } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { useIsMobile } from "@/hooks/use-mobile";

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
      className={`w-full bg-transparent outline-none resize-none overflow-hidden ${className}`} style={{ ...style, lineHeight: "1.7" }} />
  );
}

const label: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const serif: React.CSSProperties = { fontFamily: "'Instrument Serif', serif" };

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
        background: focused ? "hsl(30 10% 12% / 0.02)" : "transparent",
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    >
      <div className="flex items-center w-6 flex-shrink-0 pt-1 justify-center">
        {!isMobile && (
          <div {...(dragHandleProps || {})} className="cursor-grab active:cursor-grabbing p-0.5 transition-opacity duration-200" style={{ opacity: hovered ? 0.2 : 0 }}>
            <GripVertical className="w-3 h-3" style={{ color: "hsl(30 10% 12% / 0.3)" }} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {block.type === "heading" && (
          <div className="relative">
            <AutoTextarea value={block.text || ""} onChange={(v) => update({ text: v })} onKeyDown={handleKeyDown} placeholder="Heading..."
              className={block.level === 1 ? "text-2xl font-medium" : block.level === 3 ? "text-base font-medium" : "text-xl font-medium"}
              style={{ ...label, fontWeight: 500, fontSize: "inherit", color: "hsl(30 10% 12% / 0.85)" }} />
            <button
              onClick={() => update({ level: ((block.level || 2) % 3) + 1 })}
              className="absolute right-0 top-1 text-[11px] px-1.5 py-0.5 rounded-lg transition-opacity duration-200 hover:bg-[hsl(30_10%_12%_/_0.04)]"
              style={{ ...label, color: "hsl(30 10% 12% / 0.25)", opacity: hovered ? 1 : 0 }}
            >
              H{block.level || 2}
            </button>
          </div>
        )}

        {block.type === "paragraph" && (
          <AutoTextarea value={block.text || ""} onChange={(v) => update({ text: v })} onKeyDown={handleKeyDown}
            placeholder="Type / for commands" style={{ ...label, color: "hsl(30 10% 12% / 0.6)", fontSize: "15px" }} />
        )}

        {block.type === "image" && (
          <div className="space-y-2">
            {block.src ? (
              <div className="relative group/img">
                <img src={block.src} alt={block.alt || ""} className="max-w-full rounded-xl" style={{ maxHeight: "400px", objectFit: "cover" }} />
                <button onClick={() => update({ src: "" })} className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity" style={{ background: "hsl(30 10% 12% / 0.7)" }}>
                  <X className="w-3 h-3" style={{ color: "hsl(40 30% 96%)" }} />
                </button>
              </div>
            ) : <ImageUploader value={null} onChange={(url) => update({ src: url })} label="" />}
            <input value={block.caption || ""} onChange={(e) => update({ caption: e.target.value })} placeholder="Caption (optional)"
              className="w-full bg-transparent outline-none text-sm" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }} />
          </div>
        )}

        {block.type === "video" && (
          <div className="space-y-2">
            <input value={block.src || ""} onChange={(e) => update({ src: e.target.value })} placeholder="YouTube or Vimeo URL..."
              className="w-full bg-transparent outline-none text-sm px-3 py-2 rounded-xl" style={{ ...label, color: "hsl(30 10% 12% / 0.6)", border: "1px solid hsl(30 10% 12% / 0.08)" }} />
            {block.src && <div className="aspect-video rounded-xl overflow-hidden" style={{ background: "hsl(30 10% 12% / 0.03)" }}>
              <iframe src={block.src.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} className="w-full h-full" allowFullScreen />
            </div>}
          </div>
        )}

        {block.type === "embed" && (
          <div className="space-y-2">
            <AutoTextarea value={block.html || ""} onChange={(v) => update({ html: v })} placeholder="Paste embed HTML or iframe..."
              style={{ ...label, color: "hsl(30 10% 12% / 0.5)", fontSize: "12px" }} />
            {block.html && <div className="rounded-xl overflow-hidden p-3" style={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(30 10% 12% / 0.06)" }}>
              <div dangerouslySetInnerHTML={{ __html: block.html }} />
            </div>}
          </div>
        )}

        {block.type === "quote" && (
          <div className="pl-4">
            <AutoTextarea value={block.text || ""} onChange={(v) => update({ text: v })} placeholder="Quote text..." className="italic text-sm"
              style={{ ...serif, color: "hsl(30 10% 12% / 0.6)" }} />
            <input value={block.attribution || ""} onChange={(e) => update({ attribution: e.target.value })} placeholder="— Attribution"
              className="w-full bg-transparent outline-none text-sm mt-1" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }} />
          </div>
        )}

        {block.type === "callout" && (
          <div className="px-4 py-3 rounded-xl" style={{ background: "hsl(30 10% 12% / 0.03)", border: "1px solid hsl(30 10% 12% / 0.06)" }}>
            <AutoTextarea value={block.text || ""} onChange={(v) => update({ text: v })} placeholder="Callout text..." className="text-sm"
              style={{ ...label, color: "hsl(30 10% 12% / 0.7)" }} />
          </div>
        )}

        {block.type === "expandable" && (
          <div className="rounded-xl" style={{ border: "1px solid hsl(30 10% 12% / 0.08)" }}>
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid hsl(30 10% 12% / 0.06)" }}>
              <ChevronDown className="w-3 h-3" style={{ color: "hsl(30 10% 12% / 0.3)" }} />
              <input value={block.title || ""} onChange={(e) => update({ title: e.target.value })} placeholder="Section title..."
                className="flex-1 bg-transparent outline-none text-sm font-medium" style={{ ...label, color: "hsl(30 10% 12% / 0.7)" }} />
            </div>
            <div className="p-3 pl-6 space-y-2" style={{ background: "hsl(0 0% 100% / 0.5)" }}>
              {(block.blocks || []).map((inner: any, idx: number) => (
                <AutoTextarea key={idx} value={inner.text || ""} onChange={(v) => {
                  const newBlocks = [...(block.blocks || [])]; newBlocks[idx] = { ...inner, text: v }; update({ blocks: newBlocks });
                }} placeholder="Content..." className="text-sm" style={{ ...label, color: "hsl(30 10% 12% / 0.55)" }} />
              ))}
              <button onClick={() => update({ blocks: [...(block.blocks || []), { type: "paragraph", text: "" }] })}
                className="text-[11px] flex items-center gap-1 py-1" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>
                <Plus className="w-3 h-3" /> Add paragraph
              </button>
            </div>
          </div>
        )}

        {block.type === "carousel" && (
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
            {(block.slides || []).map((slide: any, idx: number) => (
              <div key={idx} className="flex-shrink-0 relative group/slide" style={{ width: "140px" }}>
                {slide.image ? (
                  <div className="relative">
                    <img src={slide.image} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <button onClick={() => { const slides = [...block.slides]; slides[idx] = { ...slide, image: "" }; update({ slides }); }}
                      className="absolute top-1 right-1 p-0.5 rounded-full opacity-0 group-hover/slide:opacity-100 transition-opacity" style={{ background: "hsl(30 10% 12% / 0.7)" }}>
                      <X className="w-2.5 h-2.5" style={{ color: "hsl(40 30% 96%)" }} />
                    </button>
                  </div>
                ) : <div className="w-full h-20 rounded-lg flex items-center justify-center" style={{ border: "1px dashed hsl(30 10% 12% / 0.12)" }}>
                  <ImageIcon className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.2)" }} />
                </div>}
                <input value={slide.caption || ""} onChange={(e) => { const slides = [...block.slides]; slides[idx] = { ...slide, caption: e.target.value }; update({ slides }); }}
                  placeholder="Caption" className="w-full bg-transparent outline-none text-[11px] mt-1" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }} />
              </div>
            ))}
            <button onClick={() => update({ slides: [...(block.slides || []), { image: "", caption: "" }] })}
              className="flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center" style={{ border: "1px dashed hsl(30 10% 12% / 0.12)" }}>
              <Plus className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.2)" }} />
            </button>
          </div>
        )}

        {block.type === "stat-grid" && (
          <div className="space-y-2">
            {(block.stats || []).map((stat: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input value={stat.label || ""} onChange={(e) => { const stats = [...block.stats]; stats[idx] = { ...stat, label: e.target.value }; update({ stats }); }}
                  placeholder="Label" className="bg-transparent outline-none text-sm px-2 py-1.5 flex-1 rounded-lg" style={{ ...label, color: "hsl(30 10% 12% / 0.7)", border: "1px solid hsl(30 10% 12% / 0.08)" }} />
                <input value={stat.description || ""} onChange={(e) => { const stats = [...block.stats]; stats[idx] = { ...stat, description: e.target.value }; update({ stats }); }}
                  placeholder="Description" className="bg-transparent outline-none text-sm px-2 py-1.5 flex-1 rounded-lg" style={{ ...label, color: "hsl(30 10% 12% / 0.5)", border: "1px solid hsl(30 10% 12% / 0.08)" }} />
                <button onClick={() => update({ stats: block.stats.filter((_: any, i: number) => i !== idx) })} className="p-1">
                  <X className="w-3 h-3" style={{ color: "hsl(30 10% 12% / 0.3)" }} />
                </button>
              </div>
            ))}
            <button onClick={() => update({ stats: [...(block.stats || []), { label: "", description: "" }] })}
              className="text-[11px] flex items-center gap-1 py-1" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>
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
          background: "hsl(0 0% 100%)",
        }}
        title="Delete block"
      >
        <Trash2 className="w-3 h-3" style={{ color: "hsl(0 60% 45% / 0.6)" }} />
      </button>
    </div>
  );
};

export default BlockEditor;
