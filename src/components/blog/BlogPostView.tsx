import { Link } from "react-router-dom";
import { format } from "date-fns";
import AtmosphericLayout from "@/components/AtmosphericLayout";
import ContentBlockRenderer, { ContentBlock } from "@/components/content/ContentBlockRenderer";

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
  "cross-sector": "Cross-Sector Intelligence",
  "deep-organizing": "Deep Organizing",
};

const label: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const serif: React.CSSProperties = { fontFamily: "'Instrument Serif', serif" };

const BlogPostView = ({ post }: BlogPostViewProps) => {
  return (
    <AtmosphericLayout>
      {/* Back */}
      <Link
        to={capabilityRoute[post.capability] || "/"}
        className="fixed top-6 left-6 z-30 text-[13px] transition-colors duration-300"
        style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(30 10% 12% / 0.8)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(30 10% 12% / 0.35)")}
      >
        ← Back
      </Link>

      <div
        className="relative z-20 h-dvh overflow-y-auto"
        style={{ animation: "fade-up 0.5s ease-out both" }}
      >
        {/* Hero */}
        {post.hero_image_url ? (
          <div className="w-full relative" style={{ height: "60vh" }}>
            <img
              src={post.hero_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, transparent 40%, hsl(40 30% 96%) 100%)",
              }}
            />
          </div>
        ) : (
          <div className="w-full" style={{ height: "20vh" }} />
        )}

        {/* Content */}
        <main className="flex flex-col items-center px-6 pb-20 max-w-[680px] mx-auto -mt-16 relative z-10">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-6" style={{ animation: "fade-up 0.5s ease-out 0.2s both" }}>
            <span className="text-[12px]" style={{ ...label, color: "hsl(30 10% 12% / 0.4)" }}>
              Blog Post
            </span>
            <span className="text-[12px]" style={{ ...label, color: "hsl(30 10% 12% / 0.15)" }}>·</span>
            <span className="text-[12px]" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>
              {capabilityLabel[post.capability] || post.capability}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-[32px] md:text-[44px] font-medium leading-[1.15] text-center mb-4"
            style={{
              ...serif,
              color: "hsl(30 10% 12% / 0.9)",
              animation: "fade-up 0.5s ease-out 0.3s both",
            }}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p
              className="text-[15px] leading-[1.7] text-center max-w-2xl mb-4"
              style={{
                ...label,
                color: "hsl(30 10% 12% / 0.5)",
                animation: "fade-up 0.5s ease-out 0.35s both",
              }}
            >
              {post.excerpt}
            </p>
          )}

          {post.published_at && (
            <span
              className="text-[13px] mb-10"
              style={{
                ...label,
                color: "hsl(30 10% 12% / 0.3)",
                animation: "fade-up 0.5s ease-out 0.4s both",
              }}
            >
              {format(new Date(post.published_at), "MMMM d, yyyy")}
            </span>
          )}

          {/* Divider */}
          <div
            className="w-12 mb-10"
            style={{
              height: "1px",
              background: "hsl(30 10% 12% / 0.1)",
              animation: "fade-up 0.5s ease-out 0.5s both",
            }}
          />

          {/* Article body */}
          <article className="w-full" style={{ animation: "fade-up 0.6s ease-out 0.6s both" }}>
            {post.content_blocks ? (
              <ContentBlockRenderer blocks={post.content_blocks} />
            ) : (
              <p className="text-[15px] leading-[1.9]" style={{ ...label, color: "hsl(30 10% 12% / 0.4)" }}>
                No content available.
              </p>
            )}
          </article>
        </main>
      </div>
    </AtmosphericLayout>
  );
};

export default BlogPostView;
