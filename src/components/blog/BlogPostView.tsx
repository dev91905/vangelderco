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

const BlogPostView = ({ post }: BlogPostViewProps) => {
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
        style={{ animation: "fade-up 0.5s ease-out both" }}
      >
        {/* Hero */}
        {post.hero_image_url ? (
          <div
            className="w-full relative"
            style={{ height: "60vh" }}
          >
            <img
              src={post.hero_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, transparent 40%, hsl(0 0% 2.5%) 100%)",
              }}
            />
          </div>
        ) : (
          <div
            className="w-full flex items-end justify-center"
            style={{
              height: "40vh",
              background: "linear-gradient(180deg, hsl(0 80% 48% / 0.06) 0%, hsl(0 0% 2.5%) 100%)",
            }}
          />
        )}

        {/* Content */}
        <main className="flex flex-col items-center px-6 pb-20 max-w-[680px] mx-auto -mt-16 relative z-10">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-6" style={{ animation: "fade-up 0.5s ease-out 0.2s both" }}>
            <span
              className="text-[10px] tracking-[0.15em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.7)" }}
            >
              Blog Post
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
            className="text-[26px] md:text-[36px] font-medium leading-[1.2] text-center mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "hsl(0 0% 100% / 0.92)",
              animation: "fade-up 0.5s ease-out 0.3s both",
            }}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p
              className="text-[13px] leading-[1.7] text-center max-w-2xl mb-4"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "hsl(0 0% 100% / 0.5)",
                animation: "fade-up 0.5s ease-out 0.35s both",
              }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Date */}
          {post.published_at && (
            <span
              className="text-[10px] tracking-[0.15em] mb-10"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "hsl(0 0% 100% / 0.25)",
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
              background: "hsl(0 80% 48% / 0.3)",
              animation: "fade-up 0.5s ease-out 0.5s both",
            }}
          />

          {/* Article body */}
          <article className="w-full" style={{ animation: "fade-up 0.6s ease-out 0.6s both" }}>
            {post.content_blocks ? (
              <ContentBlockRenderer blocks={post.content_blocks} />
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

export default BlogPostView;
