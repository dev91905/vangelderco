import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ContentBlockRenderer, { ContentBlock } from "@/components/content/ContentBlockRenderer";
import { t } from "@/lib/theme";

interface ExpandableSectionProps { title: string; blocks: ContentBlock[]; }

const ExpandableSection = ({ title, blocks }: ExpandableSectionProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden backdrop-blur-sm" style={{
      border: `1px solid ${t.ink(0.08)}`,
      background: open ? t.ink(0.06) : "transparent",
      transition: "background 0.2s ease, border-color 0.2s ease",
    }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 md:px-5 py-3 md:py-4 text-left group"
        style={{ transition: "background 0.2s ease" }}>
        <span className="text-[14px] md:text-[15px] font-bold" style={{ fontFamily: t.sans, color: t.ink(0.6), transition: "color 0.2s ease" }}>
          {title}
        </span>
        <ChevronDown size={16} style={{ color: t.ink(0.3), transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease, color 0.2s ease" }} />
      </button>
      {open && (
        <div className="px-4 md:px-5 pb-4 md:pb-5" style={{ borderTop: `1px solid ${t.ink(0.06)}` }}>
          <div className="pt-4"><ContentBlockRenderer blocks={blocks} compact /></div>
        </div>
      )}
    </div>
  );
};

export default ExpandableSection;
