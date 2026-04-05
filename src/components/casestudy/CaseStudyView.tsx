import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import AtmosphericLayout from "@/components/AtmosphericLayout";
import ContentBlockRenderer, { ContentBlock } from "@/components/content/ContentBlockRenderer";
import StatChips from "./StatChips";
import ExpandableSection from "./ExpandableSection";
import ContentCarousel from "./ContentCarousel";

interface CaseStudyViewProps {
  post: {
    title: string;
    excerpt: string | null;
    capability: string;
    published_at: string | null;
    hero_image_url: string | null;
    content_blocks: ContentBlock[] | null;
    stats: { label: string; description: string; visible?: boolean }[] | null;
  };
}

const capabilityRoute: Record<string, string> = {
  "cultural-strategy": "/cultural-strategy",
  "cross-sector": "/cross-sector",
  "deep-organizing": "/deep-organizing",
};

const capabilityLabel: Record<string, string> = {
  "cultural-strategy": "Cultural Strategy",
  "cross-sector": "Cross-Sector Intelligence",
  "deep-organizing": "Deep Organizing",
};

const CaseStudyView = ({ post }: CaseStudyViewProps) => {
  const [showStats, setShowStats] = useState(true);

  const renderExtended = (block: ContentBlock, _index: number) => {
    if (block.type === "expandable") {
      return <ExpandableSection title={block.title} blocks={block.blocks} />;
    }
    if (block.type === "carousel") {
      return <ContentCarousel slides={block.slides} />;
    }
    if (block.type === "stat-grid") {
      return <StatChips stats={block.stats} visible={true} />;
    }
    return null;
  };

  return (
    <AtmosphericLayout>
      {/* HUD */}
      <span
        className="fixed top-6 right-6 z-30 text-[10px] tracking-[0.2em] uppercase"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.18)" }}
      >
        Van Gelder Co.
      </span>

      {/* Back */}
      <Link
        to={capabilityRoute[post.capability] || "/"}
        className="fixed top-6 left-6 z-30 text-[10px] tracking-[0.2em] uppercase transition-colors duration-300"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.3)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 80% 48% / 0.9)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 100% / 0.3)")}
      >
        &lt; Return
      </Link>

      <div
        className="relative z-20 h-dvh overflow-y-auto"
        style={{ animation: "crt-boot 0.5s ease-out both" }}
      >
        {/* Hero */}
        <div
          className="w-full flex flex-col items-center justify-end px-6 pb-8"
          style={{
            minHeight: "50vh",
            background: post.hero_image_url
              ? undefined
              : "linear-gradient(180deg, hsl(0 80% 48% / 0.08) 0%, hsl(0 0% 2.5%) 100%)",
          }}
        >
          {/* Meta */}
          <div className="flex items-center gap-3 mb-5" style={{ animation: "fade-up 0.5s ease-out 0.2s both" }}>
            <span
              className="text-[10px] tracking-[0.15em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.7)" }}
            >
              Case Study
            </span>
            <span
              className="text-[10px]"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.15)" }}
            >
              //
            </span>
            <span
              className="text-[10px] tracking-[0.1em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.3)" }}
            >
              {capabilityLabel[post.capability] || post.capability}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-[24px] md:text-[34px] font-medium leading-[1.2] text-center max-w-3xl mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "hsl(0 0% 100% / 0.92)",
              animation: "fade-up 0.5s ease-out 0.3s both",
            }}
          >
            {post.title}
          </h1>

          {post.published_at && (
            <span
              className="text-[10px] tracking-[0.15em]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "hsl(0 0% 100% / 0.25)",
                animation: "fade-up 0.5s ease-out 0.4s both",
              }}
            >
              {format(new Date(post.published_at), "MMMM d, yyyy")}
            </span>
          )}
        </div>

        {/* Content */}
        <main className="flex flex-col items-center px-6 pb-20 max-w-[720px] mx-auto gap-8">
          {/* Stat toggle + chips */}
          {post.stats && post.stats.length > 0 && (
            <div className="w-full flex flex-col gap-4" style={{ animation: "fade-up 0.5s ease-out 0.5s both" }}>
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 self-start"
              >
                <span
                  className="w-3 h-3 flex items-center justify-center"
                  style={{
                    border: "1px solid hsl(0 80% 48% / 0.5)",
                    background: showStats ? "hsl(0 80% 48% / 0.3)" : "transparent",
                    transition: "background 0.15s ease",
                  }}
                >
                  {showStats && (
                    <span className="block w-1.5 h-1.5" style={{ background: "hsl(0 80% 48% / 0.9)" }} />
                  )}
                </span>
                <span
                  className="text-[10px] tracking-[0.15em] uppercase"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "hsl(0 0% 100% / 0.35)",
                  }}
                >
                  Key Metrics
                </span>
              </button>
              <StatChips stats={post.stats} visible={showStats} />
            </div>
          )}

          {/* Divider */}
          <div className="w-12" style={{ height: "1px", background: "hsl(0 80% 48% / 0.3)" }} />

          {/* Article */}
          <article className="w-full" style={{ animation: "fade-up 0.6s ease-out 0.7s both" }}>
            {post.content_blocks ? (
              <ContentBlockRenderer blocks={post.content_blocks} renderExtended={renderExtended} />
            ) : (
              <p
                className="text-[13px] leading-[1.9]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.5)" }}
              >
                No content available.
              </p>
            )}
          </article>
        </main>
      </div>
    </AtmosphericLayout>
  );
};

export default CaseStudyView;
