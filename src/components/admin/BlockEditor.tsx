import { useState } from "react";
import { Trash2, GripVertical, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface BlockEditorProps {
  block: any;
  onChange: (block: any) => void;
  onDelete: () => void;
  isCaseStudy: boolean;
}

const BlockEditor = ({ block, onChange, onDelete, isCaseStudy }: BlockEditorProps) => {
  const [focused, setFocused] = useState(false);

  const update = (partial: any) => onChange({ ...block, ...partial });

  const renderEditor = () => {
    switch (block.type) {
      case "heading":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={block.level || 2}
                onChange={(e) => update({ level: parseInt(e.target.value) })}
                className="text-[10px] px-2 py-1 bg-transparent outline-none cursor-pointer"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.5)", border: "1px solid hsl(0 0% 20%)" }}
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
            </div>
            <input
              value={block.text || ""}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Heading text..."
              className="w-full bg-transparent outline-none font-semibold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "hsl(0 0% 100% / 0.9)",
                fontSize: block.level === 1 ? "24px" : block.level === 2 ? "20px" : "16px",
              }}
            />
          </div>
        );

      case "paragraph":
        return (
          <textarea
            value={block.text || ""}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Start writing..."
            rows={3}
            className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.8)" }}
          />
        );

      case "image":
        return (
          <div className="space-y-2">
            <ImageUploader value={block.src || null} onChange={(url) => update({ src: url || "" })} compact />
            {!block.src && (
              <input
                value={block.src || ""}
                onChange={(e) => update({ src: e.target.value })}
                placeholder="Or paste image URL..."
                className="w-full bg-transparent outline-none text-xs"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.5)", borderBottom: "1px solid hsl(0 0% 20%)", paddingBottom: "4px" }}
              />
            )}
            <input
              value={block.alt || ""}
              onChange={(e) => update({ alt: e.target.value })}
              placeholder="Alt text..."
              className="w-full bg-transparent outline-none text-xs"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.4)" }}
            />
            <input
              value={block.caption || ""}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="Caption (optional)..."
              className="w-full bg-transparent outline-none text-xs italic"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.4)" }}
            />
          </div>
        );

      case "video":
        return (
          <div className="space-y-2">
            <input
              value={block.src || ""}
              onChange={(e) => update({ src: e.target.value })}
              placeholder="YouTube or Vimeo URL..."
              className="w-full bg-transparent outline-none text-xs"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.6)", borderBottom: "1px solid hsl(0 0% 20%)", paddingBottom: "4px" }}
            />
            <select
              value={block.provider || "youtube"}
              onChange={(e) => update({ provider: e.target.value })}
              className="text-[10px] px-2 py-1 bg-transparent outline-none cursor-pointer"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.5)", border: "1px solid hsl(0 0% 20%)" }}
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
            </select>
          </div>
        );

      case "embed":
        return (
          <textarea
            value={block.html || ""}
            onChange={(e) => update({ html: e.target.value })}
            placeholder="Paste embed HTML / iFrame..."
            rows={4}
            className="w-full bg-transparent outline-none resize-none text-xs"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.6)" }}
          />
        );

      case "quote":
        return (
          <div className="space-y-2" style={{ borderLeft: "3px solid hsl(0 80% 48% / 0.5)", paddingLeft: "12px" }}>
            <textarea
              value={block.text || ""}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Quote text..."
              rows={2}
              className="w-full bg-transparent outline-none resize-none text-sm italic"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.8)" }}
            />
            <input
              value={block.attribution || ""}
              onChange={(e) => update({ attribution: e.target.value })}
              placeholder="Attribution..."
              className="w-full bg-transparent outline-none text-xs"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.4)" }}
            />
          </div>
        );

      case "callout":
        return (
          <div style={{ borderLeft: "3px solid hsl(0 80% 48%)", paddingLeft: "12px" }}>
            <textarea
              value={block.text || ""}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Callout text..."
              rows={2}
              className="w-full bg-transparent outline-none resize-none text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.85)" }}
            />
          </div>
        );

      case "expandable":
        return (
          <div className="space-y-2">
            <input
              value={block.title || ""}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Section title..."
              className="w-full bg-transparent outline-none text-sm font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.9)" }}
            />
            <div className="pl-3" style={{ borderLeft: "2px solid hsl(0 80% 48% / 0.3)" }}>
              {(block.blocks || []).map((innerBlock: any, i: number) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <textarea
                    value={innerBlock.text || ""}
                    onChange={(e) => {
                      const newBlocks = [...(block.blocks || [])];
                      newBlocks[i] = { ...innerBlock, text: e.target.value };
                      update({ blocks: newBlocks });
                    }}
                    placeholder="Content..."
                    rows={2}
                    className="flex-1 bg-transparent outline-none resize-none text-xs"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.7)" }}
                  />
                  <button onClick={() => { const nb = [...(block.blocks || [])]; nb.splice(i, 1); update({ blocks: nb }); }}>
                    <X className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => update({ blocks: [...(block.blocks || []), { type: "paragraph", text: "" }] })}
                className="text-[10px] flex items-center gap-1 mt-1 px-2 py-1 transition-colors hover:bg-[hsl(0_80%_48%_/_0.1)]"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.6)" }}
              >
                <Plus className="w-3 h-3" /> Add inner block
              </button>
            </div>
          </div>
        );

      case "carousel":
        return (
          <div className="space-y-2">
            {(block.slides || []).map((slide: any, i: number) => (
              <div key={i} className="flex items-start gap-2 p-2" style={{ background: "hsl(0 0% 4%)", border: "1px solid hsl(0 0% 12%)" }}>
                <span className="text-[10px] mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.3)" }}>{i + 1}</span>
                <div className="flex-1 space-y-1">
                  <ImageUploader value={slide.image || null} onChange={(url) => {
                    const ns = [...(block.slides || [])]; ns[i] = { ...slide, image: url || "" }; update({ slides: ns });
                  }} compact />
                  <input
                    value={slide.caption || ""}
                    onChange={(e) => { const ns = [...(block.slides || [])]; ns[i] = { ...slide, caption: e.target.value }; update({ slides: ns }); }}
                    placeholder="Slide caption..."
                    className="w-full bg-transparent outline-none text-xs"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.5)" }}
                  />
                </div>
                <button onClick={() => { const ns = [...(block.slides || [])]; ns.splice(i, 1); update({ slides: ns }); }}>
                  <X className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
                </button>
              </div>
            ))}
            <button
              onClick={() => update({ slides: [...(block.slides || []), { image: "", caption: "" }] })}
              className="text-[10px] flex items-center gap-1 px-2 py-1 transition-colors hover:bg-[hsl(0_80%_48%_/_0.1)]"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.6)" }}
            >
              <Plus className="w-3 h-3" /> Add slide
            </button>
          </div>
        );

      case "stat-grid":
        return (
          <div className="space-y-2">
            {(block.stats || []).map((stat: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={stat.label || ""}
                  onChange={(e) => { const ns = [...(block.stats || [])]; ns[i] = { ...stat, label: e.target.value }; update({ stats: ns }); }}
                  placeholder="$200M"
                  className="w-24 bg-transparent outline-none text-sm font-bold"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48%)" }}
                />
                <input
                  value={stat.description || ""}
                  onChange={(e) => { const ns = [...(block.stats || [])]; ns[i] = { ...stat, description: e.target.value }; update({ stats: ns }); }}
                  placeholder="Description..."
                  className="flex-1 bg-transparent outline-none text-xs"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.6)" }}
                />
                <button onClick={() => { const ns = [...(block.stats || [])]; ns.splice(i, 1); update({ stats: ns }); }}>
                  <X className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
                </button>
              </div>
            ))}
            <button
              onClick={() => update({ stats: [...(block.stats || []), { label: "", description: "" }] })}
              className="text-[10px] flex items-center gap-1 px-2 py-1 transition-colors hover:bg-[hsl(0_80%_48%_/_0.1)]"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.6)" }}
            >
              <Plus className="w-3 h-3" /> Add stat
            </button>
          </div>
        );

      default:
        return <div className="text-xs" style={{ color: "hsl(0 0% 100% / 0.3)" }}>Unknown block type: {block.type}</div>;
    }
  };

  const typeLabels: Record<string, string> = {
    heading: "HEADING",
    paragraph: "PARAGRAPH",
    image: "IMAGE",
    video: "VIDEO",
    embed: "EMBED",
    quote: "QUOTE",
    callout: "CALLOUT",
    expandable: "EXPANDABLE",
    carousel: "CAROUSEL",
    "stat-grid": "STAT GRID",
  };

  return (
    <div
      className="group relative transition-all"
      style={{
        background: focused ? "hsl(0 0% 6%)" : "hsl(0 0% 4%)",
        border: `1px solid ${focused ? "hsl(0 80% 48% / 0.3)" : "hsl(0 0% 12%)"}`,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
        <div className="flex items-center gap-2">
          <GripVertical className="w-3 h-3 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
          <span className="text-[9px] tracking-[0.2em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.5)" }}>
            {typeLabels[block.type] || block.type}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[hsl(0_80%_48%_/_0.1)] rounded"
        >
          <Trash2 className="w-3 h-3" style={{ color: "hsl(0 80% 48% / 0.6)" }} />
        </button>
      </div>
      <div className="p-3">
        {renderEditor()}
      </div>
    </div>
  );
};

export default BlockEditor;
