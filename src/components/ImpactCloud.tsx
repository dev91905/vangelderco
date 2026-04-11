import { Link } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";
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
  const delay = index * 0.08;

  const capabilityPath = `/${stat.sourceCapability.replace(/\s+/g, "-").toLowerCase()}`;
  const href = stat.sourceSlug ? `${capabilityPath}/${stat.sourceSlug}` : capabilityPath;

  return (
    <div
      ref={ref}
      style={{
        opacity: hasRevealed ? 1 : 0,
        transform: hasRevealed ? "translateY(0) scale(1)" : "translateY(18px) scale(0.97)",
        transition: `opacity 0.7s ${EASE_OUT_EXPO} ${delay}s, transform 0.8s ${EASE_OUT_EXPO} ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      <Link to={href} className="group no-underline block">
        <div
          className="flex flex-col px-5 py-4 rounded-xl cursor-pointer"
          style={{
            background: "transparent",
            border: `1px solid hsl(var(--foreground) / 0.08)`,
            transition: `border-color 0.3s ${EASE_OUT_EXPO}, background 0.3s ${EASE_OUT_EXPO}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "hsl(var(--foreground) / 0.2)";
            e.currentTarget.style.background = "hsl(var(--foreground) / 0.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "hsl(var(--foreground) / 0.08)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span
            className="text-[20px] md:text-[26px] font-bold leading-tight"
            style={{ fontFamily: t.sans, color: "hsl(var(--foreground))" }}
          >
            {stat.label}
          </span>
          <span
            className="text-[10px] tracking-[0.08em] uppercase mt-1.5"
            style={{ fontFamily: t.sans, color: t.ink(0.35) }}
          >
            {stat.description}
          </span>
          <span
            className="text-[9px] tracking-[0.06em] mt-3 opacity-0 group-hover:opacity-100"
            style={{
              fontFamily: t.sans,
              color: t.ink(0.25),
              transition: `opacity 0.3s ${EASE_OUT_EXPO}`,
            }}
          >
            {stat.sourceTitle} →
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
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl animate-pulse"
            style={{
              width: `${120 + (i % 3) * 40}px`,
              height: "72px",
              background: "hsl(var(--foreground) / 0.04)",
            }}
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
    <div className="flex flex-wrap gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <StatChip key={`${stat.sourceSlug}-${stat.label}-${i}`} stat={stat} index={i} />
      ))}
    </div>
  );
}
