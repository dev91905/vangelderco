import { Link } from "react-router-dom";
import { CapabilityPost } from "@/hooks/useCapabilityPosts";
import { format } from "date-fns";

interface PostCardProps {
  post: CapabilityPost;
  index: number;
}

const PostCard = ({ post, index }: PostCardProps) => {
  return (
    <Link
      to={post.slug ? `/post/${post.slug}` : "#"}
      className="w-full text-left group block"
      style={{
        animation: `fade-up 0.5s ease-out ${0.6 + index * 0.15}s both`,
      }}
    >
      <div
        className="p-4 md:p-5 transition-all duration-300 hover:bg-[hsl(0_0%_6%)]"
        style={{
          background: "hsl(0 0% 4%)",
          borderLeft: "2px solid hsl(0 80% 48% / 0.5)",
          borderTop: "1px solid hsl(0 0% 100% / 0.05)",
          borderRight: "1px solid hsl(0 0% 100% / 0.05)",
          borderBottom: "1px solid hsl(0 0% 100% / 0.05)",
          transition: "background 0.3s ease, border-left-color 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderLeftColor = "hsl(0 80% 48% / 0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderLeftColor = "hsl(0 80% 48% / 0.5)";
        }}
      >
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <span
            className="text-[10px] tracking-[0.15em] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 80% 48% / 0.7)",
            }}
          >
            {post.type === "case-study" ? "Case Study" : "Blog Post"}
          </span>
          {post.published_at && (
            <span
              className="text-[10px] tracking-[0.1em]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "hsl(0 0% 100% / 0.25)",
              }}
            >
              {format(new Date(post.published_at), "yyyy.MM.dd")}
            </span>
          )}
        </div>

        <h3
          className="text-[14px] md:text-[16px] font-medium mb-2 transition-transform duration-300 group-hover:translate-x-0.5"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: "hsl(0 0% 100% / 0.85)",
          }}
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p
            className="text-[11px] md:text-[12px] leading-relaxed"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 0% 100% / 0.4)",
            }}
          >
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
};

export default PostCard;
