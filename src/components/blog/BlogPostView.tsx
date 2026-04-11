import { Link } from "react-router-dom";
import { useBackPath } from "@/hooks/useBackNavigation";
import { format } from "date-fns";
import AtmosphericLayout from "@/components/AtmosphericLayout";
import ContentBlockRenderer, { ContentBlock } from "@/components/content/ContentBlockRenderer";
import { t } from "@/lib/theme";

interface BlogPostViewProps {
  post: {
    title: string;
    excerpt: string | null;
    capability: string;
    published_at: string | null;
    hero_image_url: string | null;
    content_blocks: ContentBlock[] | null;
  };
}

const capabilityRoute: Record<string, string> = {
  "cultural-strategy": "/cultural-strategy",
  "cross-sector": "/cross-sector",
  "deep-organizing": "/deep-organizing",
};

const capabilityLabel: Record<string, string> = {
  "cultural-strategy": "Cultural Strategy",
  "cross-sector": "Cross-Sector Campaigns",
  "deep-organizing": "Deep Organizing",
};

const BlogPostView = ({ post }: BlogPostViewProps) => {
  const backPath = useBackPath(capabilityRoute[post.capability] || "/");
  return (
    <AtmosphericLayout>
      <Link to={backPath} className="fixed top-6 left-6 z-30 text-[13px] transition-colors duration-300"
        style={{ fontFamily: t.sans, color: t.ink(0.35) }}
        onMouseEnter={(e) => (e.currentTarget.style.color = t.ink(0.8))} onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.35))}>
        ← Back
      </Link>

      <div className="relative z-20 h-dvh overflow-y-auto" style={{ animation: "fade-up 0.5s ease-out both" }}>
        {post.hero_image_url ? (
          <div className="w-full relative" style={{ height: "60vh" }}>
            <img src={post.hero_image_url} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, ${t.cream} 100%)` }} />
          </div>
        ) : (
          <div className="w-full" style={{ height: "20vh" }} />
        )}

        <main className="flex flex-col items-center px-6 pb-20 max-w-[680px] mx-auto -mt-16 relative z-10">
          <div className="flex items-center gap-3 mb-6" style={{ animation: "fade-up 0.5s ease-out 0.2s both" }}>
            <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>Blog Post</span>
            <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.15) }}>//</span>
            <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>{capabilityLabel[post.capability] || post.capability}</span>
          </div>

          <h1 className="text-[32px] md:text-[44px] font-bold leading-[1.15] text-center mb-4" style={{ fontFamily: t.sans, color: t.ink(0.9), animation: "fade-up 0.5s ease-out 0.3s both" }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-[15px] leading-[1.7] text-center max-w-2xl mb-4" style={{ fontFamily: t.sans, color: t.ink(0.55), fontSize: "clamp(17px, 1.9vw, 19px)", lineHeight: 1.7, textAlign: "center", animation: "fade-up 0.5s ease-out 0.35s both" }}>
              {post.excerpt}
            </p>
          )}

          {post.published_at && (
            <span className="text-[13px] mb-10" style={{ fontFamily: t.sans, color: t.ink(0.3), animation: "fade-up 0.5s ease-out 0.4s both" }}>
              {format(new Date(post.published_at), "MMMM d, yyyy")}
            </span>
          )}

          <div className="w-12 mb-10" style={{ height: "1px", background: t.ink(0.1), animation: "fade-up 0.5s ease-out 0.5s both" }} />

          <article className="w-full" style={{ animation: "fade-up 0.6s ease-out 0.6s both" }}>
            {post.content_blocks ? <ContentBlockRenderer blocks={post.content_blocks} /> : (
              <p className="text-[15px] leading-[1.9]" style={{ fontFamily: t.sans, color: t.ink(0.55), lineHeight: 1.9 }}>No content available.</p>
            )}
          </article>
        </main>
      </div>
    </AtmosphericLayout>
  );
};

export default BlogPostView;
