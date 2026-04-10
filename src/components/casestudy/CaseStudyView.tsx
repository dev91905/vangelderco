import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import AtmosphericLayout from "@/components/AtmosphericLayout";
import ContentBlockRenderer, { ContentBlock } from "@/components/content/ContentBlockRenderer";
import StatChips from "./StatChips";
import ExpandableSection from "./ExpandableSection";
import ContentCarousel from "./ContentCarousel";
import { t } from "@/lib/theme";

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

const capabilityRoute: Record<string, string> = { "cultural-strategy": "/cultural-strategy", "cross-sector": "/cross-sector", "deep-organizing": "/deep-organizing" };
const capabilityLabel: Record<string, string> = { "cultural-strategy": "Cultural Strategy", "cross-sector": "Cross-Sector Campaigns", "deep-organizing": "Deep Organizing" };

const CaseStudyView = ({ post }: CaseStudyViewProps) => {
  const [showStats, setShowStats] = useState(true);

  const renderExtended = (block: ContentBlock, _index: number) => {
    if (block.type === "expandable") return <ExpandableSection title={block.title} blocks={block.blocks} />;
    if (block.type === "carousel") return <ContentCarousel slides={block.slides} />;
    if (block.type === "stat-grid") return <StatChips stats={block.stats} visible={true} />;
    return null;
  };

  return (
    <AtmosphericLayout>
      <Link to={capabilityRoute[post.capability] || "/"} className="fixed top-6 left-6 z-30 text-[13px] transition-colors duration-300"
        style={{ fontFamily: t.sans, color: t.ink(0.35) }}
        onMouseEnter={(e) => (e.currentTarget.style.color = t.ink(0.8))} onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.35))}>
        ← Back
      </Link>

      <div className="relative z-20 h-dvh overflow-y-auto" style={{ animation: "fade-up 0.5s ease-out both" }}>
        <div className="w-full flex flex-col items-center justify-end px-6 pb-8" style={{ minHeight: "40vh" }}>
          <div className="flex items-center gap-3 mb-5" style={{ animation: "fade-up 0.5s ease-out 0.2s both" }}>
            <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>Case Study</span>
            <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.15) }}>//</span>
            <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>{capabilityLabel[post.capability] || post.capability}</span>
          </div>

          <h1 className="text-[28px] md:text-[40px] font-bold leading-[1.15] text-center max-w-3xl mb-4" style={{ fontFamily: t.sans, color: t.ink(0.9), animation: "fade-up 0.5s ease-out 0.3s both" }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-[15px] leading-[1.7] text-center max-w-2xl mb-4" style={{ fontFamily: t.sans, color: t.ink(0.55), fontSize: "clamp(17px, 1.9vw, 19px)", lineHeight: 1.7, textAlign: "center", animation: "fade-up 0.5s ease-out 0.35s both" }}>
              {post.excerpt}
            </p>
          )}

          {post.published_at && (
            <span className="text-[13px]" style={{ fontFamily: t.sans, color: t.ink(0.3), animation: "fade-up 0.5s ease-out 0.4s both" }}>
              {format(new Date(post.published_at), "MMMM d, yyyy")}
            </span>
          )}
        </div>

        <main className="flex flex-col items-center px-6 pb-20 max-w-[720px] mx-auto gap-8">
          {post.stats && post.stats.length > 0 && (
            <div className="w-full flex flex-col gap-4" style={{ animation: "fade-up 0.5s ease-out 0.5s both" }}>
              <button onClick={() => setShowStats(!showStats)} className="flex items-center gap-2 self-start">
                <span className="w-3 h-3 flex items-center justify-center rounded-sm" style={{ border: t.border(0.2), background: showStats ? t.ink(0.1) : "transparent", transition: "background 0.15s ease" }}>
                  {showStats && <span className="block w-1.5 h-1.5 rounded-sm" style={{ background: t.ink(0.6) }} />}
                </span>
                <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>Key Metrics</span>
              </button>
              <StatChips stats={post.stats} visible={showStats} />
            </div>
          )}

          <div className="w-12" style={{ height: "1px", background: t.ink(0.08) }} />

          <article className="w-full" style={{ animation: "fade-up 0.6s ease-out 0.7s both" }}>
            {post.content_blocks ? <ContentBlockRenderer blocks={post.content_blocks} renderExtended={renderExtended} /> : (
              <p className="text-[15px] leading-[1.9]" style={{ fontFamily: t.sans, color: t.ink(0.55), lineHeight: 1.9 }}>No content available.</p>
            )}
          </article>
        </main>
      </div>
    </AtmosphericLayout>
  );
};

export default CaseStudyView;
