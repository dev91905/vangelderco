import { useState, useRef, useEffect, useCallback } from "react";
import { Type, AlignLeft, Image, Video, Code, Quote, AlertCircle, ChevronDown, LayoutGrid, Layers } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export type BlockType = "heading" | "paragraph" | "image" | "video" | "embed" | "quote" | "callout" | "expandable" | "carousel" | "stat-grid";

interface BlockTypePickerProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  isCaseStudy: boolean;
  filter?: string;
}

const ALL_TYPES: { type: BlockType; label: string; icon: any; caseStudyOnly?: boolean }[] = [
  { type: "paragraph", label: "Paragraph", icon: AlignLeft },
  { type: "heading", label: "Heading", icon: Type },
  { type: "image", label: "Image", icon: Image },
  { type: "video", label: "Video", icon: Video },
  { type: "embed", label: "Embed", icon: Code },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "callout", label: "Callout", icon: AlertCircle },
  { type: "expandable", label: "Expandable", icon: ChevronDown, caseStudyOnly: true },
  { type: "carousel", label: "Carousel", icon: Layers, caseStudyOnly: true },
  { type: "stat-grid", label: "Stat Grid", icon: LayoutGrid, caseStudyOnly: true },
];

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

const BlockTypePicker = ({ onSelect, onClose, isCaseStudy, filter = "" }: BlockTypePickerProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const types = ALL_TYPES.filter((t) => !t.caseStudyOnly || isCaseStudy).filter((t) => !filter || t.label.toLowerCase().includes(filter.toLowerCase()));

  useEffect(() => { setSelectedIndex(0); }, [filter]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, types.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (types[selectedIndex]) onSelect(types[selectedIndex].type); }
    else if (e.key === "Escape") { onClose(); }
  }, [types, selectedIndex, onSelect, onClose]);

  useEffect(() => { document.addEventListener("keydown", handleKeyDown); return () => document.removeEventListener("keydown", handleKeyDown); }, [handleKeyDown]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const content = (
    <div className="py-1.5 space-y-0.5" style={{ maxHeight: isMobile ? "60vh" : "320px", overflowY: "auto" }}>
      {types.length === 0 && <div className="px-3 py-2 text-[10px]" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>No matching blocks</div>}
      {types.map((t, i) => (
        <button key={t.type} onClick={() => onSelect(t.type)} onMouseEnter={() => setSelectedIndex(i)}
          className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
          style={{ background: i === selectedIndex ? "hsl(0 80% 48% / 0.08)" : "transparent" }}>
          <t.icon className="w-4 h-4 flex-shrink-0" style={{ color: i === selectedIndex ? "hsl(0 80% 48% / 0.7)" : "hsl(0 0% 100% / 0.25)" }} />
          <span className="text-xs" style={{ ...mono, color: i === selectedIndex ? "hsl(0 0% 100% / 0.8)" : "hsl(0 0% 100% / 0.45)" }}>{t.label}</span>
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 z-50" style={{ background: "hsl(0 0% 0% / 0.6)" }} onClick={onClose} />
        <div ref={ref} className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl pb-safe" style={{ background: "hsl(0 0% 6%)", borderTop: "1px solid hsl(0 0% 15%)" }}>
          <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2" style={{ background: "hsl(0 0% 25%)" }} />
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>Add block</div>
          {content}
        </div>
      </>
    );
  }

  return (
    <div ref={ref} className="w-52 rounded-lg shadow-2xl overflow-hidden" style={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 15%)" }}>
      <div className="px-3 py-2 text-[10px] uppercase tracking-widest" style={{ ...mono, color: "hsl(0 0% 100% / 0.2)", borderBottom: "1px solid hsl(0 0% 12%)" }}>Add block</div>
      {content}
    </div>
  );
};

export default BlockTypePicker;
