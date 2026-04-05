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
}

const ContentBlockRenderer = ({ blocks, renderExtended }: ContentBlockRendererProps) => {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {blocks.map((block, i) => {
        if (renderExtended) {
          const extended = renderExtended(block, i);
          if (extended) return <div key={i}>{extended}</div>;
        }

        switch (block.type) {
          case "heading": {
            const Tag = `h${Math.min(block.level, 6)}` as keyof JSX.IntrinsicElements;
            const sizes: Record<number, string> = {
              1: "text-[24px] md:text-[32px]",
              2: "text-[20px] md:text-[26px]",
              3: "text-[17px] md:text-[21px]",
            };
            return (
              <Tag
                key={i}
                className={`${sizes[block.level] || sizes[3]} font-medium leading-[1.3]`}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "hsl(0 0% 100% / 0.9)",
                }}
              >
                {block.text}
              </Tag>
            );
          }

          case "paragraph":
            return (
              <p
                key={i}
                className="text-[14px] md:text-[15px] leading-[2]"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "hsl(0 0% 100% / 0.6)",
                }}
              >
                {block.text}
              </p>
            );

          case "image":
            return (
              <figure key={i} className="flex flex-col gap-2">
                <div
                  className="w-full aspect-video flex items-center justify-center"
                  style={{
                    background: "hsl(0 0% 6%)",
                    border: "1px solid hsl(0 0% 100% / 0.06)",
                  }}
                >
                  {block.src ? (
                    <img
                      src={block.src}
                      alt={block.alt || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "hsl(0 0% 100% / 0.15)",
                      }}
                    >
                      {block.alt || "Image"}
                    </span>
                  )}
                </div>
                {block.caption && (
                  <figcaption
                    className="text-[10px] tracking-[0.1em]"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "hsl(0 0% 100% / 0.3)",
                    }}
                  >
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "video":
            return (
              <div
                key={i}
                className="w-full aspect-video"
                style={{
                  background: "hsl(0 0% 4%)",
                  border: "1px solid hsl(0 0% 100% / 0.06)",
                }}
              >
                {block.provider === "youtube" || block.src.includes("youtube") ? (
                  <iframe
                    src={block.src}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video"
                  />
                ) : (
                  <video src={block.src} controls className="w-full h-full" />
                )}
              </div>
            );

          case "embed":
            return (
              <div
                key={i}
                className="w-full"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            );

          case "quote":
            return (
              <blockquote
                key={i}
                className="pl-4 md:pl-6 py-2"
                style={{
                  borderLeft: "2px solid hsl(0 80% 48% / 0.6)",
                }}
              >
                <p
                  className="text-[14px] md:text-[16px] leading-[1.7] italic"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "hsl(0 0% 100% / 0.7)",
                  }}
                >
                  "{block.text}"
                </p>
                {block.attribution && (
                  <cite
                    className="text-[10px] tracking-[0.15em] uppercase not-italic mt-2 block"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "hsl(0 80% 48% / 0.6)",
                    }}
                  >
                    — {block.attribution}
                  </cite>
                )}
              </blockquote>
            );

          case "callout":
            return (
              <div
                key={i}
                className="p-4 md:p-5"
                style={{
                  background: "hsl(0 80% 48% / 0.04)",
                  borderLeft: "2px solid hsl(0 80% 48% / 0.5)",
                  border: "1px solid hsl(0 0% 100% / 0.05)",
                  borderLeftWidth: "2px",
                  borderLeftColor: "hsl(0 80% 48% / 0.5)",
                }}
              >
                <p
                  className="text-[12px] md:text-[13px] leading-[1.8]"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "hsl(0 0% 100% / 0.55)",
                  }}
                >
                  {block.text}
                </p>
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
