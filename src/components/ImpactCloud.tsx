import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { t } from "@/lib/theme";
import { useAggregatedStats, AggregatedStat } from "@/hooks/useAggregatedStats";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

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

function StatCard({ stat, index, isHero }: { stat: AggregatedStat; index: number; isHero: boolean }) {
  const { ref, hasRevealed } = useScrollReveal(0.1);
  const [hovered, setHovered] = useState(false);
  const delay = index * 0.07;

  const href = stat.sourceCapability === "deck"
    ? (stat.sourceSlug || "/diagnostic")
    : stat.sourceSlug
      ? `/${stat.sourceCapability.replace(/\s+/g, "-").toLowerCase()}/${stat.sourceSlug}`
      : `/${stat.sourceCapability.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div
      ref={ref}
      className={`${isHero ? "col-span-2" : "col-span-1"} h-full`}
      style={{
        opacity: hasRevealed ? 1 : 0,
        transform: hasRevealed
          ? (hovered ? "translateY(-2px)" : "translateY(0)")
          : "translateY(14px)",
        transition: `opacity 0.6s ${EASE} ${delay}s, transform 0.5s ${EASE}`,
        willChange: "opacity, transform",
      }}
    >
      <Link
        to={href}
        className="no-underline block h-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={`flex h-full flex-col justify-center rounded-xl ${isHero ? "px-6 py-5 md:px-7" : "px-5 py-4"}`}
          style={{
            background: "transparent",
            border: `1px solid ${hovered ? t.ink(0.25) : t.ink(0.15)}`,
            transition: `border-color 0.3s ${EASE}`,
          }}
        >
          <span
            className="font-bold leading-none"
            style={{
              fontFamily: t.sans,
              fontSize: isHero ? "clamp(36px, 5vw, 56px)" : "clamp(22px, 2.2vw, 30px)",
              color: t.ink(0.85),
              letterSpacing: "-0.03em",
            }}
          >
            {stat.label}
          </span>
          <span
            className="mt-1.5 max-w-[20ch]"
            style={{
              fontFamily: t.sans,
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: t.ink(0.4),
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
  const heroPositions = new Set([0, 4]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2" style={{ minHeight: "420px" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse rounded-xl ${heroPositions.has(i) ? "col-span-2" : "col-span-1"}`}
            style={{ background: "hsl(var(--foreground) / 0.04)" }}
          />
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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2" style={{ minHeight: "420px" }}>
      {stats.slice(0, 6).map((stat, i) => (
        <StatCard
          key={`${stat.sourceSlug}-${stat.label}-${i}`}
          stat={stat}
          index={i}
          isHero={heroPositions.has(i)}
        />
      ))}
    </div>
  );
}
