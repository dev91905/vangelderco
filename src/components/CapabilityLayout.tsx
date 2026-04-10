import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AtmosphericLayout from "./AtmosphericLayout";
import { useCapabilityPosts } from "@/hooks/useCapabilityPosts";
import PostCard from "./PostCard";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import TypewriterHeading from "./deck/TypewriterHeading";
import { t } from "@/lib/theme";

interface CapabilityLayoutProps {
  capability: string;
  label: string;
  title: string;
  description: string;
}

const CapabilityLayout = ({ capability, label, title, description }: CapabilityLayoutProps) => {
  const { data: posts, isLoading } = useCapabilityPosts(capability);
  const { playChitter } = useGlitchSFX();
  const [typewriterActive, setTypewriterActive] = useState(false);

  // Start typewriter after a short mount delay (matches label fade-up timing)
  useEffect(() => {
    const timer = setTimeout(() => setTypewriterActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleTypewriterStart = useCallback(() => {
    playChitter();
  }, [playChitter]);

  return (
    <AtmosphericLayout>
      <span className="fixed top-6 right-6 z-30 text-[10px] tracking-[0.15em] uppercase" style={{ color: t.ink(0.3), fontFamily: t.sans }}>
        Van Gelder Co.
      </span>

      <Link
        to="/"
        className="fixed top-6 left-6 z-30 text-[10px] tracking-[0.15em] uppercase transition-colors duration-300"
        style={{ fontFamily: t.sans, color: t.ink(0.35) }}
        onMouseEnter={(e) => (e.currentTarget.style.color = t.ink(0.8))}
        onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.35))}
      >
        ← Return
      </Link>

      <div className="relative z-20 h-dvh overflow-y-auto" style={{ animation: "fade-up 0.5s ease-out both" }}>
        <main className="flex flex-col items-center px-6 pt-20 pb-16 max-w-3xl mx-auto gap-8 md:gap-12">
          <span className="text-[11px] tracking-[0.25em] uppercase" style={{ fontFamily: t.sans, color: t.ink(0.4), animation: "fade-up 0.6s ease-out 0.3s both" }}>
            {label}
          </span>

          <TypewriterHeading
            text={title}
            active={typewriterActive}
            onStart={handleTypewriterStart}
            speed={50}
            style={{
              fontFamily: t.sans,
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 700,
              lineHeight: 1.15,
              textAlign: "center",
              color: t.ink(0.9),
            }}
          />

          <p className="text-[13px] md:text-[14px] leading-[1.8] text-center max-w-xl" style={{ fontFamily: t.sans, fontSize: "clamp(17px, 1.9vw, 19px)", color: t.ink(0.55), lineHeight: 1.8, textAlign: "center", animation: "fade-up 0.6s ease-out 0.9s both" }}>
            {description}
          </p>

          <div className="w-16" style={{ height: "1px", background: t.ink(0.1), animation: "fade-up 0.6s ease-out 1.1s both" }} />

          {isLoading ? (
            <span className="text-[10px] tracking-[0.15em] uppercase" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>Loading...</span>
          ) : posts && posts.length > 0 ? (
            <div className="w-full flex flex-col gap-3">
              <span className="text-[10px] tracking-[0.15em] uppercase mb-2" style={{ fontFamily: t.sans, color: t.ink(0.25), animation: "fade-up 0.5s ease-out 1.3s both" }}>
                Related Articles
              </span>
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <span className="text-[10px] tracking-[0.15em] uppercase" style={{ fontFamily: t.sans, color: t.ink(0.15), animation: "fade-up 0.5s ease-out 1.3s both" }}>
              No dispatches yet
            </span>
          )}
        </main>
      </div>
    </AtmosphericLayout>
  );
};

export default CapabilityLayout;
