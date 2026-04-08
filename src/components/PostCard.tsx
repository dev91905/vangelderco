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
        className="p-5 md:p-6 rounded-xl transition-all duration-300"
        style={{
          background: "hsl(0 0% 100%)",
          border: "1px solid hsl(30 10% 12% / 0.06)",
          transition: "background 300ms, border-color 300ms, transform 300ms, box-shadow 300ms",
        }}
        onMouseEnter={(e) => {
          playHoverGlitch();
          const el = e.currentTarget;
          el.style.borderColor = "hsl(30 10% 12% / 0.12)";
          el.style.transform = "translateY(-1px)";
          el.style.boxShadow = "0 4px 20px hsl(30 10% 12% / 0.06)";
          const title = el.querySelector("[data-title]") as HTMLElement;
          if (title) title.style.color = "hsl(30 10% 12% / 1)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = "hsl(30 10% 12% / 0.06)";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
          const title = el.querySelector("[data-title]") as HTMLElement;
          if (title) title.style.color = "hsl(30 10% 12% / 0.8)";
        }}
      >
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <span
            className="text-[10px] tracking-[0.12em] uppercase"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "hsl(30 10% 12% / 0.35)",
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
                color: "hsl(30 10% 12% / 0.25)",
              }}
            >
              {format(new Date(post.published_at), "yyyy.MM.dd")}
            </span>
          )}
        </div>

        <h3
          data-title
          className="text-[15px] md:text-[17px] font-medium mb-2"
          style={{
            fontFamily: "'Instrument Serif', serif",
            color: "hsl(30 10% 12% / 0.8)",
            transition: "color 300ms",
          }}
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p
            className="text-[12px] md:text-[13px] leading-relaxed"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "hsl(30 10% 12% / 0.4)",
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
