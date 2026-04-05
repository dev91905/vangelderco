import { Type, AlignLeft, Image, Video, Code, Quote, AlertCircle, ChevronDown, Columns, BarChart3 } from "lucide-react";

export type BlockType = "heading" | "paragraph" | "image" | "video" | "embed" | "quote" | "callout" | "expandable" | "carousel" | "stat-grid";

interface BlockTypePickerProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  isCaseStudy: boolean;
  filter?: string;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode; caseStudyOnly?: boolean }[] = [
  { type: "heading", label: "Heading", icon: <Type className="w-4 h-4" /> },
  { type: "paragraph", label: "Paragraph", icon: <AlignLeft className="w-4 h-4" /> },
  { type: "image", label: "Image", icon: <Image className="w-4 h-4" /> },
  { type: "video", label: "Video", icon: <Video className="w-4 h-4" /> },
  { type: "embed", label: "Embed / iFrame", icon: <Code className="w-4 h-4" /> },
  { type: "quote", label: "Quote", icon: <Quote className="w-4 h-4" /> },
  { type: "callout", label: "Callout", icon: <AlertCircle className="w-4 h-4" /> },
  { type: "expandable", label: "Expandable Section", icon: <ChevronDown className="w-4 h-4" />, caseStudyOnly: true },
  { type: "carousel", label: "Carousel", icon: <Columns className="w-4 h-4" />, caseStudyOnly: true },
  { type: "stat-grid", label: "Stat Grid", icon: <BarChart3 className="w-4 h-4" />, caseStudyOnly: true },
];

const BlockTypePicker = ({ onSelect, onClose, isCaseStudy, filter = "" }: BlockTypePickerProps) => {
  const items = BLOCK_TYPES
    .filter((b) => isCaseStudy || !b.caseStudyOnly)
    .filter((b) => !filter || b.label.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div
      className="absolute z-50 w-56 py-1 shadow-2xl"
      style={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 15%)" }}
    >
      {items.map((b) => (
        <button
          key={b.type}
          onClick={() => { onSelect(b.type); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[hsl(0_80%_48%_/_0.1)]"
        >
          <span style={{ color: "hsl(0 80% 48% / 0.7)" }}>{b.icon}</span>
          <span className="text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.8)" }}>
            {b.label}
          </span>
          {b.caseStudyOnly && (
            <span className="ml-auto text-[8px] px-1.5 py-0.5 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.5)", border: "1px solid hsl(0 80% 48% / 0.2)" }}>
              Case Study
            </span>
          )}
        </button>
      ))}
      {items.length === 0 && (
        <div className="px-4 py-3 text-xs" style={{ color: "hsl(0 0% 100% / 0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
          No blocks match
        </div>
      )}
    </div>
  );
};

export default BlockTypePicker;
