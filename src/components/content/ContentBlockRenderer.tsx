import { t } from "@/lib/theme";

export type ContentBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | { type: "video"; src: string; provider?: string }
  | { type: "embed"; html: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "callout"; text: string }
  | { type: "expandable"; title: string; blocks: ContentBlock[] }
  | { type: "carousel"; slides: { src: string; alt?: string; caption?: string }[] }
  | { type: "stat-grid"; stats: { label: string; description: string }[] };

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
  renderExtended?: (block: ContentBlock, index: number) => React.ReactNode | null;
  compact?: boolean;
}

const ContentBlockRenderer = ({ blocks, renderExtended, compact }: ContentBlockRendererProps) => {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {blocks.map((block, i) => {
        if (renderExtended) { const extended = renderExtended(block, i); if (extended) return <div key={i}>{extended}</div>; }

        switch (block.type) {
          case "heading": {
            const Tag = `h${Math.min(block.level, 6)}` as keyof JSX.IntrinsicElements;
            const sizes: Record<number, string> = { 1: "text-[24px] md:text-[32px]", 2: "text-[20px] md:text-[26px]", 3: "text-[17px] md:text-[21px]" };
            return <Tag key={i} className={`${sizes[block.level] || sizes[3]} font-bold leading-[1.3]`} style={{ fontFamily: t.sans, color: t.ink(0.85) }}>{block.text}</Tag>;
          }
          case "paragraph":
            return <p key={i} className="text-[15px] md:text-[16px] leading-[1.9]" style={{ ...t.body(), ...(compact ? { fontSize: "clamp(15px, 1.5vw, 16px)" } : {}) }}>{block.text}</p>;
          case "image":
            return (
              <figure key={i} className="flex flex-col gap-2">
                <div className="w-full aspect-video flex items-center justify-center rounded-xl overflow-hidden" style={{ background: t.white, border: t.border(0.06) }}>
                  {block.src ? <img src={block.src} alt={block.alt || ""} className="w-full h-full object-cover" /> : <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.2) }}>{block.alt || "Image"}</span>}
                </div>
                {block.caption && <figcaption className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>{block.caption}</figcaption>}
              </figure>
            );
          case "video":
            return (
              <div key={i} className="w-full aspect-video rounded-xl overflow-hidden" style={{ background: t.ink(0.03), border: t.border(0.06) }}>
                {block.provider === "youtube" || block.src.includes("youtube") ? <iframe src={block.src} className="w-full h-full" allowFullScreen title="Video" /> : <video src={block.src} controls className="w-full h-full" />}
              </div>
            );
          case "embed":
            return <div key={i} className="w-full" dangerouslySetInnerHTML={{ __html: block.html }} />;
          case "quote":
            return (
              <blockquote key={i} className="pl-4 md:pl-6 py-2" style={{ borderLeft: `2px solid ${t.ink(0.12)}` }}>
                <p className="text-[15px] md:text-[17px] leading-[1.7] italic" style={{ fontFamily: t.serif, color: t.ink(0.86) }}>"{block.text}"</p>
                {block.attribution && <cite className="text-[12px] not-italic mt-2 block" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>— {block.attribution}</cite>}
              </blockquote>
            );
          case "callout":
            return (
              <div key={i} className="p-4 md:p-5 rounded-xl" style={{ background: t.ink(0.02), border: t.border(0.04) }}>
                <p className="text-[13px] md:text-[14px] leading-[1.8]" style={{ ...t.body(0.82), fontSize: "clamp(15px, 1.5vw, 16px)" }}>{block.text}</p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default ContentBlockRenderer;
