import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { t } from "@/lib/theme";
import { useAggregatedStats, AggregatedStat } from "@/hooks/useAggregatedStats";

const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHasRevealed(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, hasRevealed };
}

function StatChip({ stat, index }: { stat: AggregatedStat; index: number }) {
  const { ref, hasRevealed } = useScrollReveal(0.1);
  const delay = index * 0.06;
  const [hovered, setHovered] = useState(false);

  const href = stat.sourceCapability === "deck"
    ? (stat.sourceSlug || "/diagnostic")
    : stat.sourceSlug
      ? `/${stat.sourceCapability.replace(/\s+/g, "-").toLowerCase()}/${stat.sourceSlug}`
      : `/${stat.sourceCapability.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div
      ref={ref}
      className="snap-start flex-shrink-0"
      style={{
        opacity: hasRevealed ? 1 : 0,
        transform: hasRevealed ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.6s ${EASE_OUT_EXPO} ${delay}s, transform 0.7s ${EASE_OUT_EXPO} ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      <Link
        to={href}
        className="no-underline block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="flex flex-col pl-4 pr-6 py-3"
          style={{
            borderLeft: `2px solid ${hovered ? t.ink(0.35) : t.ink(0.12)}`,
            transform: hovered ? "translateY(-1px)" : "translateY(0)",
            transition: `border-color 0.3s ${EASE_OUT_EXPO}, transform 0.3s ${EASE_OUT_EXPO}`,
            minWidth: "140px",
          }}
        >
          <span
            className="font-bold leading-none"
            style={{
              fontFamily: t.sans,
              fontSize: "clamp(32px, 5vw, 48px)",
              color: "hsl(var(--foreground))",
              letterSpacing: "-0.03em",
            }}
          >
            {stat.label}
          </span>
          <span
            className="mt-1.5"
            style={{
              fontFamily: t.sans,
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: t.ink(0.35),
            }}
          >
            {stat.description}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function ImpactCloud() {
  const { data: stats, isLoading } = useAggregatedStats();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
      setCanScrollLeft(el.scrollLeft > 4);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="flex gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0" style={{ width: "160px" }}>
            <div
              className="rounded animate-pulse"
              style={{ height: "56px", background: "hsl(var(--foreground) / 0.04)" }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!stats?.length) {
    return (
      <p className="text-[14px]" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>
        Impact data publishes automatically as case studies go live.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Left fade */}
      {canScrollLeft && (
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
        />
      )}

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {stats.map((stat, i) => (
          <StatChip key={`${stat.sourceSlug}-${stat.label}-${i}`} stat={stat} index={i} />
        ))}
      </div>

      {/* Right fade */}
      {canScrollRight && (
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
        />
      )}
    </div>
  );
}
