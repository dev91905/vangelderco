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
      className={isHero ? "col-span-2" : "col-span-1"}
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
          className={`flex flex-col justify-center h-full rounded-xl ${isHero ? "px-6 py-5" : "px-5 py-4"}`}
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
              fontSize: isHero ? "clamp(36px, 6vw, 56px)" : "clamp(22px, 3vw, 30px)",
              color: t.ink(0.85),
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`rounded animate-pulse ${i === 0 || i === 3 ? "col-span-2" : "col-span-1"}`}
            style={{ height: i === 0 || i === 3 ? "88px" : "72px", background: "hsl(var(--foreground) / 0.04)" }}
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

  // Positions 0 and 3 are hero cards (span 2 cols)
  const heroPositions = new Set([0, 3]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 md:gap-x-6 md:gap-y-4">
      {stats.map((stat, i) => (
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
