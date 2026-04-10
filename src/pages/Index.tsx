import { Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, CSSProperties } from "react";
import AtmosphericLayout from "@/components/AtmosphericLayout";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { t } from "@/lib/theme";

/* ── Data ── */
const SECTORS = ["Energy", "Labor", "Philanthropy", "Culture", "Policy", "National Security"];

const HERO_LINKS = [
  { label: "Cultural Strategy", to: "/cultural-strategy" },
  { label: "Cross-Sector Intelligence", to: "/cross-sector" },
  { label: "Deep Organizing", to: "/deep-organizing" },
];

const CAPABILITIES = [
  {
    title: "Cultural Strategy",
    sub: "Communications is the floor. Uptake is the ceiling.",
    detail:
      "We operate across music, entertainment, news media, film, digital creators, brands, athletes, labor, faith, campuses, and veterans — turning communications into cultural moments.",
    to: "/cultural-strategy",
  },
  {
    title: "Cross-Sector Intelligence",
    sub: "Nothing moves unless multiple sectors push together.",
    detail:
      "We map the alignments that nobody in any single sector can see. Energy, labor, philanthropy, culture, policy, and national security — at the same table, moving on the same target.",
    to: "/cross-sector",
  },
  {
    title: "Deep Organizing",
    sub: "Not mobilization. Recruitment and retention.",
    detail:
      "Bringing in people who aren't already at the table — people who may disagree — and sustaining their participation over time. That's the difference between a movement that grows and one that stalls.",
    to: "/deep-organizing",
  },
];

const FIELD_NOTES = [
  {
    sector: "ENERGY × LABOR",
    brief:
      "Mapped alignment between energy transition funders and building trades unions on workforce development. Neither side knew the other was moving.",
    result: "Joint strategy deployed across three states. $12M in coordinated capital.",
  },
  {
    sector: "CULTURE × PHILANTHROPY",
    brief:
      "Built uptake network across entertainment, digital creators, and athletic talent for a national climate narrative. Turned a foundation report into a cultural moment.",
    result: "14M organic impressions. Zero paid media.",
  },
  {
    sector: "INTELLIGENCE",
    brief:
      "Mapped adversarial network funding infrastructure across four states. Identified coordination patterns between dark money vehicles and state-level policy shops.",
    result: "Intelligence product delivered to coalition of seven foundations. Shifted $8M in defensive capital allocation.",
  },
  {
    sector: "DEEP ORGANIZING",
    brief:
      "Identified organic community leaders in three metro areas being overlooked by national organizations. Connected them with philanthropic resources and cross-sector partnerships.",
    result: "Sustained local networks operating 18+ months post-engagement.",
  },
];

/* ── Premium easing curves ── */
const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";

/* ── Scroll-progress hook (0-1 within viewport) ── */
function useScrollReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(0);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const r = entry.intersectionRatio;
        setRatio(r);
        if (r > threshold) setHasRevealed(true);
      },
      { threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, ratio, hasRevealed };
}

/* ── Reveal block with premium motion ── */
function RevealBlock({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const { ref, hasRevealed } = useScrollReveal(0.08);

  const hidden: CSSProperties = {
    up: { opacity: 0, transform: "translateY(40px) scale(0.98)" },
    left: { opacity: 0, transform: "translateX(-30px)" },
    right: { opacity: 0, transform: "translateX(30px)" },
    scale: { opacity: 0, transform: "scale(0.92)" },
  }[direction];

  const shown: CSSProperties = {
    opacity: 1,
    transform: "translateY(0) translateX(0) scale(1)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(hasRevealed ? shown : hidden),
        transition: `opacity 1s ${EASE_OUT_EXPO} ${delay}s, transform 1.2s ${EASE_OUT_EXPO} ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ── Animated divider line ── */
function AnimatedLine({ width = 60 }: { width?: number }) {
  const { ref, hasRevealed } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className="my-8"
      style={{
        height: 1,
        background: "hsl(var(--destructive) / 0.4)",
        width: hasRevealed ? width : 0,
        transition: `width 1.2s ${EASE_OUT_EXPO} 0.3s`,
      }}
    />
  );
}

/* ── Case fragment with premium motion ── */
function CaseFragment({ sector, brief, result, index }: { sector: string; brief: string; result: string; index: number }) {
  const { ref, hasRevealed } = useScrollReveal(0.15);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="mb-14 cursor-default"
      style={{
        opacity: hasRevealed ? 1 : 0,
        transform: hasRevealed
          ? hovered ? "translateX(8px)" : "translateX(0)"
          : "translateX(-30px)",
        transition: `opacity 0.9s ${EASE_OUT_EXPO} ${index * 0.12}s, transform 1s ${EASE_OUT_EXPO} ${index * 0.12}s`,
        borderLeft: `2px solid ${hovered ? "hsl(var(--destructive))" : "hsl(var(--destructive) / 0.3)"}`,
        paddingLeft: "24px",
        willChange: "opacity, transform",
      }}
    >
      <div
        className="text-[10px] tracking-[0.2em] uppercase mb-2"
        style={{ fontFamily: t.sans, color: "hsl(var(--destructive))" }}
      >
        {sector}
      </div>
      <div
        className="text-lg leading-relaxed mb-2"
        style={{ fontFamily: t.sans, color: t.ink(0.6) }}
      >
        {brief}
      </div>
      <div
        className="text-[11px]"
        style={{
          fontFamily: t.sans,
          color: hovered ? "hsl(var(--destructive) / 0.9)" : "hsl(var(--destructive) / 0.5)",
          transition: `color 0.4s ${EASE_OUT_QUART}`,
        }}
      >
        {result}
      </div>
    </div>
  );
}

/* ── Index page ── */
const Index = () => {
  const { playHoverGlitch, playClickGlitch } = useGlitchSFX();
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setScrollY(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Hero parallax calculations
  const heroProgress = Math.min(scrollY / 800, 1);
  const heroOpacity = Math.max(0, 1 - heroProgress * 1.5);
  const heroScale = 1 - heroProgress * 0.06;
  const heroBlur = heroProgress * 8;
  const heroY = scrollY * 0.3;

  return (
    <AtmosphericLayout>
      {/* HUD: top-right */}
      <span
        className="fixed top-6 right-6 z-30 text-[10px] tracking-[0.15em] uppercase"
        style={{
          color: t.ink(0.3),
          fontFamily: t.sans,
          transition: `opacity 0.6s ${EASE_OUT_QUART}`,
          opacity: heroProgress > 0.8 ? 0.15 : 0.3,
        }}
      >
        Van Gelder Co.
      </span>

      <div
        ref={scrollRef}
        className="snap-scroll-container h-dvh overflow-y-auto overflow-x-hidden"
        style={{ scrollBehavior: "smooth" }}
      >

      {/* ═══ HERO ═══ */}
      <section
        className="snap-section flex items-center justify-center w-full relative z-20"
        style={{ height: "100vh" }}
      >
        <main
          className="flex flex-col items-center text-center px-6 max-w-3xl gap-10 md:gap-14"
          style={{
            opacity: heroOpacity,
            transform: `translateY(${heroY}px) scale(${heroScale})`,
            filter: `blur(${heroBlur}px)`,
            willChange: "transform, opacity, filter",
          }}
        >
          <span
            className="text-[11px] tracking-[0.25em] uppercase"
            style={{
              fontFamily: t.sans,
              color: "hsl(var(--destructive) / 0.6)",
              animation: "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
            }}
          >
            Van Gelder Co.
          </span>

          <h1 className="flex flex-col gap-2 md:gap-3">
            {HERO_LINKS.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="hero-nav-link group relative flex items-center justify-center py-1.5 md:py-2 px-4 md:px-6 rounded-lg"
                onPointerEnter={() => playHoverGlitch()}
                onFocus={() => playHoverGlitch()}
                onClick={() => playClickGlitch()}
                style={{
                  animation: `clip-reveal 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${0.5 + i * 0.25}s both`,
                }}
              >
                <span
                  className="hero-nav-wash absolute inset-0 pointer-events-none rounded-lg"
                  style={{ background: "transparent", transition: `background 0.3s ${EASE_OUT_QUART}` }}
                />
                <span
                  className="hero-nav-text relative z-10 text-[22px] md:text-[44px] lg:text-[48px] font-bold leading-[1.15]"
                  style={{ fontFamily: t.sans, color: t.ink(0.8), transition: `color 0.3s ${EASE_OUT_QUART}, transform 0.4s ${EASE_OUT_EXPO}` }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </h1>

          <div
            className="flex flex-wrap justify-center gap-2 md:gap-3"
            style={{ animation: `fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.4s both` }}
          >
            {SECTORS.map((sector, i) => (
              <span
                key={sector}
                className="text-[10px] md:text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full"
                style={{
                  fontFamily: t.sans,
                  color: "hsl(var(--destructive) / 0.5)",
                  background: "hsl(var(--destructive) / 0.04)",
                  border: "1px solid hsl(var(--destructive) / 0.12)",
                  animation: `fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${1.5 + i * 0.08}s both`,
                }}
              >
                {sector}
              </span>
            ))}
          </div>

          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{
              fontFamily: t.sans,
              color: "hsl(var(--destructive) / 0.3)",
              animation: `fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.0s both`,
            }}
          >
            By Referral Only
          </span>
        </main>
      </section>

      {/* ═══ ALTITUDE ═══ */}
      <section className="snap-section flex items-center justify-center relative z-10" style={{ minHeight: "100vh" }}>
        <div className="max-w-xl px-6 md:px-10">
          <RevealBlock>
            <p
              className="italic font-light"
              style={{
                fontFamily: t.sans,
                fontSize: "clamp(26px, 4vw, 42px)",
                lineHeight: 1.4,
                color: "hsl(var(--destructive) / 0.6)",
              }}
            >
              You're on the ground doing the work.
            </p>
          </RevealBlock>
          <RevealBlock delay={0.25}>
            <p
              className="font-semibold mt-4"
              style={{
                fontFamily: t.sans,
                fontSize: "clamp(26px, 4vw, 42px)",
                lineHeight: 1.4,
                color: t.ink(0.85),
              }}
            >
              We see the field from orbit.
            </p>
          </RevealBlock>
          <RevealBlock delay={0.5}>
            <AnimatedLine width={60} />
            <p
              className="text-xs leading-relaxed max-w-md"
              style={{ fontFamily: t.sans, color: t.ink(0.35), lineHeight: 1.8 }}
            >
              Six sectors. One picture. We identify alignment that nobody in any single sector can
              see from where they sit.
            </p>
          </RevealBlock>
        </div>
      </section>

      {/* ═══ CAPABILITIES ═══ */}
      <section className="snap-section relative z-10 flex items-center" style={{ minHeight: "100vh" }}>
        <div className="w-full py-24 md:py-32 px-6 md:px-10 max-w-5xl mx-auto">
          <RevealBlock direction="left">
            <div
              className="text-[10px] tracking-[0.25em] uppercase mb-16"
              style={{ fontFamily: t.sans, color: "hsl(var(--destructive))" }}
            >
              Capabilities
            </div>
          </RevealBlock>

          <div className="grid gap-3">
            {CAPABILITIES.map((cap, i) => (
              <RevealBlock key={cap.title} delay={0.1 + i * 0.15} direction="up">
                <Link
                  to={cap.to}
                  className="group block p-5 md:p-6 rounded-xl no-underline"
                  style={{
                    background: "transparent",
                    border: `1px solid ${t.ink(0.08)}`,
                    transition: `border-color 0.4s ${EASE_OUT_QUART}, transform 0.5s ${EASE_OUT_EXPO}, box-shadow 0.4s ${EASE_OUT_QUART}`,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = t.ink(0.2);
                    el.style.transform = "translateY(-2px)";
                    el.style.boxShadow = `0 8px 30px -12px ${t.ink(0.08)}`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = t.ink(0.08);
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <h3
                    className="text-[17px] md:text-[19px] font-bold mb-2"
                    style={{ fontFamily: t.sans, color: t.ink(0.8) }}
                  >
                    {cap.title}
                  </h3>
                  <p
                    className="text-xs tracking-wide mb-3"
                    style={{ fontFamily: t.sans, color: "hsl(var(--destructive))", letterSpacing: "0.03em" }}
                  >
                    {cap.sub}
                  </p>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ fontFamily: t.sans, color: t.ink(0.4), lineHeight: 1.7 }}
                  >
                    {cap.detail}
                  </p>
                </Link>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FIELD NOTES ═══ */}
      <section className="snap-section relative z-10">
        <div className="sticky top-0 z-20 pt-16 pb-8 px-6 md:px-10 max-w-2xl mx-auto" style={{ background: "hsl(var(--background))" }}>
          <RevealBlock direction="left">
            <div
              className="text-[10px] tracking-[0.25em] uppercase"
              style={{ fontFamily: t.sans, color: "hsl(var(--destructive))" }}
            >
              Field Notes
            </div>
          </RevealBlock>
        </div>

        <div className="px-6 md:px-10 max-w-2xl mx-auto pb-32">
          {FIELD_NOTES.map((note, i) => (
            <CaseFragment key={note.sector} {...note} index={i} />
          ))}
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section
        className="snap-section relative z-10 flex flex-col items-center justify-center"
        style={{ height: "100vh" }}
      >
        <RevealBlock direction="scale">
          <Link
            to="/deck"
            className="inline-block px-6 py-3 rounded-full text-[11px] tracking-[0.15em] uppercase no-underline mb-16"
            style={{
              fontFamily: t.sans,
              color: "hsl(var(--destructive))",
              border: "1px solid hsl(var(--destructive) / 0.3)",
              background: "hsl(var(--destructive) / 0.04)",
              transition: `all 0.4s ${EASE_OUT_EXPO}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(var(--destructive) / 0.1)";
              e.currentTarget.style.borderColor = "hsl(var(--destructive) / 0.5)";
              e.currentTarget.style.transform = "scale(1.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(var(--destructive) / 0.04)";
              e.currentTarget.style.borderColor = "hsl(var(--destructive) / 0.3)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Explore Our Work
          </Link>
        </RevealBlock>
        <RevealBlock delay={0.15}>
          <div
            ref={(el) => {
              if (!el) return;
              const obs = new IntersectionObserver(([e]) => {
                if (e.isIntersecting) el.style.width = "40px";
              }, { threshold: 0.5 });
              obs.observe(el);
            }}
            className="mx-auto mb-8"
            style={{
              width: 0,
              height: 1,
              background: "hsl(var(--destructive) / 0.4)",
              transition: `width 1s ${EASE_OUT_EXPO} 0.2s`,
            }}
          />
        </RevealBlock>
        <RevealBlock delay={0.25}>
          <a
            href="mailto:hello@vangelder.co"
            className="text-[13px] tracking-[0.18em] no-underline"
            style={{
              fontFamily: t.sans,
              color: t.ink(0.45),
              transition: `color 0.4s ${EASE_OUT_QUART}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--destructive))")}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.45))}
          >
            hello@vangelder.co
          </a>
        </RevealBlock>
        <RevealBlock delay={0.35}>
          <span
            className="text-[9px] tracking-[0.3em] uppercase mt-6 block"
            style={{ fontFamily: t.sans, color: t.ink(0.15) }}
          >
            By Referral Only
          </span>
        </RevealBlock>
      </section>
      </div>
    </AtmosphericLayout>
  );
};

export default Index;
