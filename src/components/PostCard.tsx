import { Link } from "react-router-dom";
import { CapabilityPost } from "@/hooks/useCapabilityPosts";
import { format } from "date-fns";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { t } from "@/lib/theme";

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
      style={{ animation: `fade-up 0.5s ease-out ${0.6 + index * 0.15}s both` }}
    >
      <div
        className="p-5 md:p-6 rounded-xl transition-all duration-300"
        style={{ background: t.white, border: t.border(0.06) }}
        onMouseEnter={(e) => {
          playHoverGlitch();
          const el = e.currentTarget;
          el.style.borderColor = t.ink(0.12);
          el.style.transform = "translateY(-1px)";
          el.style.boxShadow = `0 4px 20px ${t.ink(0.06)}`;
          const title = el.querySelector("[data-title]") as HTMLElement;
          if (title) title.style.color = t.ink(1);
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = t.ink(0.06);
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
          const title = el.querySelector("[data-title]") as HTMLElement;
          if (title) title.style.color = t.ink(0.8);
        }}
      >
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <span className="text-[10px] tracking-[0.12em] uppercase" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>
            {post.type === "case-study" ? "Case Study" : "Blog Post"}
          </span>
          {post.published_at && (
            <span className="text-[10px] tracking-[0.1em]" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>
              {format(new Date(post.published_at), "yyyy.MM.dd")}
            </span>
          )}
        </div>
        <h3 data-title className="text-[15px] md:text-[17px] font-medium mb-2" style={{ fontFamily: t.sans, color: t.ink(0.8), transition: "color 300ms" }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[12px] md:text-[13px] leading-relaxed" style={{ ...t.body(0.4), fontSize: "clamp(12px, 1.4vw, 13px)" }}>
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
};

export default PostCard;
