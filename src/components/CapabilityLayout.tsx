import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AtmosphericLayout from "./AtmosphericLayout";
import { useCapabilityPosts } from "@/hooks/useCapabilityPosts";
import PostCard from "./PostCard";
import useGlitchSFX from "@/hooks/useGlitchSFX";

interface CapabilityLayoutProps {
  capability: string;
  label: string;
  title: string;
  description: string;
}

const CapabilityLayout = ({
  capability,
  label,
  title,
  description,
}: CapabilityLayoutProps) => {
  const { data: posts, isLoading } = useCapabilityPosts(capability);
  const { playChitter, canPlayAudio } = useGlitchSFX();
  const wasLoading = useRef(true);

  useEffect(() => {
    if (wasLoading.current && !isLoading && canPlayAudio()) {
      playChitter();
    }
    wasLoading.current = isLoading;
  }, [isLoading, playChitter, canPlayAudio]);

  return (
    <AtmosphericLayout>
      {/* HUD: top-right */}
      <span
        className="fixed top-6 right-6 z-30 font-mono text-[10px] tracking-[0.2em] uppercase"
        style={{
          color: "hsl(0 0% 100% / 0.18)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Van Gelder Co.
      </span>

      {/* Back link */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-30 text-[10px] tracking-[0.2em] uppercase transition-colors duration-300"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "hsl(0 0% 100% / 0.3)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "hsl(0 80% 48% / 0.9)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "hsl(0 0% 100% / 0.3)")
        }
      >
        &lt; Return
      </Link>

      {/* Main content — scrollable */}
      <div
        className="relative z-20 h-dvh overflow-y-auto"
        style={{ animation: "fade-up 0.5s ease-out both" }}
      >
        <main className="flex flex-col items-center px-6 pt-20 pb-16 max-w-3xl mx-auto gap-8 md:gap-12">
          {/* Classification label */}
          <span
            className="text-[11px] tracking-[0.3em] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 80% 48% / 0.9)",
              animation: "fade-up 0.6s ease-out 0.3s both",
            }}
          >
            {label}
          </span>

          {/* Title */}
          <h1
            className="text-[28px] md:text-[40px] lg:text-[44px] font-medium leading-[1.15] text-center"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "hsl(0 0% 100% / 0.9)",
              animation: "clip-reveal 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both",
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            className="text-[13px] md:text-[14px] leading-[1.8] text-center max-w-xl"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 0% 100% / 0.45)",
              animation: "fade-up 0.6s ease-out 0.9s both",
            }}
          >
            {description}
          </p>

          {/* Divider */}
          <div
            className="w-16"
            style={{
              height: "1px",
              background: "hsl(0 80% 48% / 0.3)",
              animation: "fade-up 0.6s ease-out 1.1s both",
            }}
          />

          {/* Posts */}
          {isLoading ? (
            <span
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "hsl(0 0% 100% / 0.2)",
              }}
            >
              Loading...
            </span>
          ) : posts && posts.length > 0 ? (
            <div className="w-full flex flex-col gap-3">
              <span
                className="text-[10px] tracking-[0.2em] uppercase mb-2"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "hsl(0 0% 100% / 0.25)",
                  animation: "fade-up 0.5s ease-out 1.3s both",
                }}
              >
                Intelligence Feed
              </span>
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <span
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "hsl(0 0% 100% / 0.15)",
                animation: "fade-up 0.5s ease-out 1.3s both",
              }}
            >
              No dispatches yet
            </span>
          )}
        </main>
      </div>
    </AtmosphericLayout>
  );
};

export default CapabilityLayout;
