import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ContentBlockRenderer, { ContentBlock } from "@/components/content/ContentBlockRenderer";

interface ExpandableSectionProps {
  title: string;
  blocks: ContentBlock[];
}

const ExpandableSection = ({ title, blocks }: ExpandableSectionProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid hsl(0 0% 100% / 0.06)",
        borderLeft: open ? "2px solid hsl(0 80% 48% / 0.6)" : "2px solid hsl(0 0% 100% / 0.1)",
        transition: "border-color 0.2s ease",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 md:px-5 py-3 md:py-4 text-left group"
        style={{ background: open ? "hsl(0 0% 5%)" : "hsl(0 0% 4%)" }}
      >
        <span
          className="text-[13px] md:text-[15px] font-medium"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: open ? "hsl(0 0% 100% / 0.9)" : "hsl(0 0% 100% / 0.6)",
            transition: "color 0.2s ease",
          }}
        >
          {title}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: "hsl(0 0% 100% / 0.3)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>
      {open && (
        <div
          className="px-4 md:px-5 pb-4 md:pb-5"
          style={{
            borderTop: "1px solid hsl(0 0% 100% / 0.04)",
          }}
        >
          <div className="pt-4">
            <ContentBlockRenderer blocks={blocks} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandableSection;
