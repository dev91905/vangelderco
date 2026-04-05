import { useState } from "react";
import { CapabilityPost } from "@/hooks/useCapabilityPosts";
import { format } from "date-fns";

interface PostCardProps {
  post: CapabilityPost;
  index: number;
}

const PostCard = ({ post, index }: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left group"
      style={{
        animation: `fade-up 0.5s ease-out ${0.6 + index * 0.15}s both`,
      }}
    >
      <div
        className="p-4 md:p-5 transition-colors duration-300"
        style={{
          background: expanded ? "hsl(0 0% 6%)" : "hsl(0 0% 4%)",
          borderLeft: "2px solid hsl(0 80% 48% / 0.5)",
          borderTop: "1px solid hsl(0 0% 100% / 0.05)",
          borderRight: "1px solid hsl(0 0% 100% / 0.05)",
          borderBottom: "1px solid hsl(0 0% 100% / 0.05)",
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
          className="text-[14px] md:text-[16px] font-medium mb-2"
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

        {expanded && post.content && (
          <div
            className="mt-4 pt-4"
            style={{
              borderTop: "1px solid hsl(0 0% 100% / 0.06)",
            }}
          >
            <p
              className="text-[12px] md:text-[13px] leading-[1.8] whitespace-pre-wrap"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "hsl(0 0% 100% / 0.55)",
              }}
            >
              {post.content}
            </p>
          </div>
        )}
      </div>
    </button>
  );
};

export default PostCard;
