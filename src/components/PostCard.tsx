import { Link } from "react-router-dom";
import { CapabilityPost } from "@/hooks/useCapabilityPosts";
import { format } from "date-fns";
import useGlitchSFX from "@/hooks/useGlitchSFX";

interface PostCardProps {
  post: CapabilityPost;
  index: number;
}

const PostCard = ({ post, index }: PostCardProps) => {
  const { playHoverGlitch } = useGlitchSFX();

  return (
    <Link
      to={post.slug ? `/post/${post.slug}` : "#"}
      className="w-full text-left group block"
      style={{
        animation: `fade-up 0.5s ease-out ${0.6 + index * 0.15}s both`,
      }}
    >
      <div
        className="p-4 md:p-5 transition-all duration-300"
        style={{
          background: "hsl(0 0% 4%)",
          borderLeft: "2px solid hsl(40 50% 57% / 0.5)",
          borderTop: "1px solid hsl(0 0% 100% / 0.05)",
          borderRight: "1px solid hsl(0 0% 100% / 0.05)",
          borderBottom: "1px solid hsl(0 0% 100% / 0.05)",
          transition: "background 300ms, border-left-color 300ms, border-top-color 300ms, border-right-color 300ms, border-bottom-color 300ms, transform 300ms",
        }}
        onMouseEnter={(e) => {
          playHoverGlitch();
          const el = e.currentTarget;
          el.style.background = "hsl(0 0% 7%)";
          el.style.borderLeftColor = "hsl(40 50% 57% / 0.9)";
          el.style.borderTopColor = "hsl(0 0% 100% / 0.1)";
          el.style.borderRightColor = "hsl(0 0% 100% / 0.1)";
          el.style.borderBottomColor = "hsl(0 0% 100% / 0.1)";
          el.style.transform = "translateX(2px)";
          const title = el.querySelector("[data-title]") as HTMLElement;
          if (title) title.style.color = "hsl(0 0% 100% / 1)";
          const label = el.querySelector("[data-label]") as HTMLElement;
          if (label) label.style.color = "hsl(40 50% 57% / 1)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = "hsl(0 0% 4%)";
          el.style.borderLeftColor = "hsl(40 50% 57% / 0.5)";
          el.style.borderTopColor = "hsl(0 0% 100% / 0.05)";
          el.style.borderRightColor = "hsl(0 0% 100% / 0.05)";
          el.style.borderBottomColor = "hsl(0 0% 100% / 0.05)";
          el.style.transform = "translateX(0)";
          const title = el.querySelector("[data-title]") as HTMLElement;
          if (title) title.style.color = "hsl(0 0% 100% / 0.85)";
          const label = el.querySelector("[data-label]") as HTMLElement;
          if (label) label.style.color = "hsl(40 50% 57% / 0.7)";
        }}
      >
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <span
            data-label
            className="text-[10px] tracking-[0.15em] uppercase"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "hsl(40 50% 57% / 0.7)",
              transition: "color 300ms",
            }}
          >
            {post.type === "case-study" ? "Case Study" : "Blog Post"}
          </span>
          {post.published_at && (
            <span
              className="text-[10px] tracking-[0.1em]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "hsl(0 0% 100% / 0.25)",
              }}
            >
              {format(new Date(post.published_at), "yyyy.MM.dd")}
            </span>
          )}
        </div>

        <h3
          data-title
          className="text-[14px] md:text-[16px] font-medium mb-2"
          style={{
            fontFamily: "'Instrument Serif', serif",
            color: "hsl(0 0% 100% / 0.85)",
            transition: "color 300ms",
          }}
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p
            className="text-[11px] md:text-[12px] leading-relaxed"
            style={{
              fontFamily: "'DM Sans', sans-serif",
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
