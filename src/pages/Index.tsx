import { Link, useSearchParams } from "react-router-dom";

import { useEffect, useState, useRef, useCallback, CSSProperties } from "react";
import AtmosphericLayout from "@/components/AtmosphericLayout";
import ImpactCloud from "@/components/ImpactCloud";
import CaseTimelineOverlay, { CaseStudyData } from "@/components/diagnostic/CaseTimelineOverlay";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { useFeaturedPosts } from "@/hooks/useFeaturedPosts";
import { supabase } from "@/integrations/supabase/client";

import { t } from "@/lib/theme";

/* ── Data ── */
const SECTORS = ["Industry", "Labor", "Philanthropy", "Culture", "Policy", "Defense"];

const NETWORK_SECTORS = [
  { name: "News", desc: "Accountability that shapes local and national opinion" },
  { name: "Music Industry", desc: "Field infrastructure no one's organizing" },
  { name: "Film & TV", desc: "Talent and stories that shift norms" },
  { name: "Digital Creators", desc: "Where culture and opinion actually form" },
  { name: "Sports & Outdoors", desc: "Captive audiences and trusted voices" },
  { name: "Podcasts & Streaming", desc: "Long-form trust built at intimate scale" },
  { name: "Advertising & Brands", desc: "Market power deployed as cultural leverage" },
  { name: "Platforms", desc: "The infrastructure that gates attention" },
  { name: "Networks", desc: "Labor, industry, faith, youth, policy, and capital" },
];

const HERO_LINKS = [
  { label: "Cultural Strategy", to: "/cultural-strategy" },
  { label: "Cross-Sector Campaigns", to: "/cross-sector" },
  { label: "Deep Organizing", to: "/deep-organizing" },
];

const CAPABILITIES = [
  {
    title: "Cultural Strategy",
    sub: "Strategic communications that become cultural moments.",
    detail:
      "Most firms get the message out. We work across music, entertainment, news media, creators, brands, athletes, faith, campuses, and more to make sure it gets taken up.",
    to: "/cultural-strategy",
  },
  {
    title: "Cross-Sector Campaigns",
    sub: "Nothing moves until every sector is pushing in the same direction.",
    detail:
      "We bring industry, labor, philanthropy, culture, policy, and national security to the same table — then build and coordinate large-scale campaigns around shared interests. That's how you win.",
    to: "/cross-sector",
  },
  {
    title: "Deep Organizing",
    sub: "Build your movement for growth, not just mobilization.",
    detail:
      "Bringing in people who aren't already at the table — people who may disagree — and sustaining their participation over time. That's the difference between a movement that grows and one that stalls.",
    to: "/deep-organizing",
  },
];



/* ── Premium easing curves ── */
const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";

/* Oxblood accent helper */
const ox = (alpha = 1) => `hsl(var(--accent-h) var(--accent-s) var(--accent-l) / ${alpha})`;

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
        background: ox(0.5),
        width: hasRevealed ? width : 0,
        transition: `width 1.2s ${EASE_OUT_EXPO} 0.3s`,
      }}
    />
  );
}

/* ── Fixed corner brand mark — fades in as hero brand fades out ── */
function FixedBrandMark({ scrollY }: { scrollY: number }) {
  // Fade in between 80-250px scroll
  const progress = Math.min(1, Math.max(0, (scrollY - 80) / 170));

  return (
    <div
      className="fixed top-6 right-6 z-30 pointer-events-none uppercase"
      style={{
        fontFamily: t.sans,
        fontSize: "10px",
        letterSpacing: "0.15em",
        color: t.ink(0.3),
        opacity: progress,
        transform: `translateY(${(1 - progress) * 8}px)`,
        transition: "opacity 0.4s ease, transform 0.4s ease",
        willChange: "opacity, transform",
      }}
    >
      Van Gelder Co.
    </div>
  );
}

/* ProofPoint removed — replaced by ImpactCloud component */

/* ── Index page ── */
const Index = () => {
  const { playHoverGlitch, playClickGlitch } = useGlitchSFX();
  const { data: featuredPosts } = useFeaturedPosts();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedCase, setSelectedCase] = useState<CaseStudyData | null>(null);

  // Open case from ?case= param on mount
  useEffect(() => {
    const caseId = searchParams.get("case");
    if (!caseId) return;
    supabase
      .from("diagnostic_case_studies")
      .select("id, name, issue, outcome, phases, link_url")
      .eq("id", caseId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSelectedCase(data as unknown as CaseStudyData);
        }
      });
  }, []); // only on mount

  const handleCaseClick = useCallback((caseId: string) => {
    setSearchParams({ case: caseId }, { replace: true });
    supabase
      .from("diagnostic_case_studies")
      .select("id, name, issue, outcome, phases, link_url")
      .eq("id", caseId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSelectedCase(data as unknown as CaseStudyData);
        }
      });
  }, [setSearchParams]);

  const handleCaseClose = useCallback(() => {
    setSelectedCase(null);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);
  const [scrollY, setScrollY] = useState(0);
  const [glowIndex, setGlowIndex] = useState(0);

  // Cycle glow through the 6 sector pills
  useEffect(() => {
    const id = setInterval(() => setGlowIndex((p) => (p + 1) % SECTORS.length), 2000);
    return () => clearInterval(id);
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
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
      {/* Fixed corner brand — fades in on scroll */}
      <FixedBrandMark scrollY={scrollY} />

      <div
        ref={scrollRef}
        className=""
      >

      {/* ═══ HERO ═══ */}
      <section
        className="flex items-center justify-center w-full relative z-20"
        style={{ minHeight: "100dvh" }}
      >
        <main
          className="flex flex-col items-center text-center px-6 max-w-4xl mx-auto gap-10 md:gap-14"
          style={{
            opacity: heroOpacity,
            transform: `translateY(${heroY}px) scale(${heroScale})`,
            filter: `blur(${heroBlur}px)`,
            willChange: "transform, opacity, filter",
          }}
        >
          {/* Hero brand mark — fades out as corner version fades in */}
          <div
            className="uppercase"
            style={{
              fontFamily: t.sans,
              fontSize: "11px",
              letterSpacing: "0.25em",
              color: t.ink(0.6),
              opacity: Math.max(0, 1 - scrollY / 120),
              transform: `translateY(${Math.min(scrollY * 0.15, 12)}px)`,
              transition: "opacity 0.3s ease, transform 0.3s ease",
              animation: "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
            }}
          >
            Van Gelder Co.
          </div>

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
            style={{ animation: `fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.5s both` }}
          >
            {SECTORS.map((sector, i) => {
              const isGlowing = i === glowIndex;
              return (
                <span
                  key={sector}
                  className="text-[10px] md:text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full"
                  style={{
                    fontFamily: t.sans,
                    color: isGlowing ? "hsl(var(--foreground))" : "hsl(var(--foreground) / var(--a-mid))",
                    background: isGlowing ? ox(0.12) : "hsl(var(--foreground) / var(--a-bg))",
                    border: `1px solid ${isGlowing ? ox(0.5) : "hsl(var(--foreground) / var(--a-border))"}`,
                    boxShadow: isGlowing ? `0 0 24px -4px ${ox(0.25)}` : "none",
                    transition: "all 0.6s ease",
                    animation: `fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${1.5 + i * 0.08}s both`,
                  }}
                >
                  {sector}
                </span>
              );
            })}
          </div>

          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{
              fontFamily: t.sans,
              color: "hsl(var(--foreground) / var(--a-dim))",
              animation: `fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.1s both`,
            }}
          >
            By Referral Only
          </span>

          {/* Scroll indicator */}
          <div
            className="flex flex-col items-center gap-1 mt-8"
            style={{
              animation: `fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.5s both`,
            }}
          >
            <span
              className="text-[9px] tracking-[0.2em] uppercase"
              style={{ fontFamily: t.sans, color: t.ink(0.15) }}
            >
              Scroll
            </span>
            <span
              style={{
                color: t.ink(0.15),
                fontSize: "14px",
                animation: "bounce 2s infinite",
              }}
            >
              ↓
            </span>
          </div>
        </main>
      </section>

      {/* ═══ ALTITUDE ═══ */}
      <section className="section-flow flex items-center justify-center relative z-10">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <RevealBlock>
            <p
              className="uppercase tracking-[0.25em] mb-10"
              style={{
                fontFamily: t.sans,
                fontSize: "10px",
                color: "hsl(var(--foreground))",
                letterSpacing: "0.25em",
              }}
            >
              Our Practice
            </p>
          </RevealBlock>
          <RevealBlock delay={0.15}>
            <h2
              className="font-bold"
              style={{
                fontFamily: t.sans,
                fontSize: "clamp(26px, 4vw, 42px)",
                lineHeight: 1.25,
                color: "hsl(var(--foreground))",
              }}
            >
              We build advanced strategic communications portfolios.
            </h2>
          </RevealBlock>
          <RevealBlock delay={0.3}>
            <p
              className="mt-6 italic"
              style={{
                fontFamily: t.serif,
                fontSize: "clamp(18px, 2.2vw, 24px)",
                lineHeight: 1.6,
                color: "hsl(var(--foreground))",
              }}
            >
              For donor advisors and program officers who want their work to hit harder.
            </p>
          </RevealBlock>
          <RevealBlock delay={0.5}>
            <AnimatedLine width={60} />
            <p
              className="leading-relaxed max-w-md"
              style={{ fontFamily: t.sans, fontSize: "clamp(14px, 1.4vw, 16px)", color: t.ink(0.4), lineHeight: 1.8 }}
            >
              Cultural strategy, media-based organizing, and campaign development — so your grants don't just fund content. They build power.
            </p>
          </RevealBlock>
        </div>
      </section>

      {/* ═══ CAPABILITIES ═══ */}
      <section className="section-flow relative z-10 flex items-center">
        <div className="w-full px-6 md:px-10 max-w-4xl mx-auto">
          <RevealBlock direction="left">
            <div
              className="text-[10px] tracking-[0.25em] uppercase mb-8"
              style={{ fontFamily: t.sans, color: "hsl(var(--foreground))" }}
            >
              Core Capabilities
            </div>
          </RevealBlock>

          <div className="grid gap-5 md:gap-6">
            {CAPABILITIES.map((cap, i) => (
              <RevealBlock key={cap.title} delay={0.1 + i * 0.18} direction="up">
                <Link
                  to={cap.to}
                  className="group block relative overflow-hidden rounded-2xl no-underline"
                   style={{
                    background: "hsl(var(--foreground) / var(--a-bg-subtle))",
                    border: `1px solid hsl(var(--foreground) / var(--a-border-card))`,
                    transition: `border-color 0.5s ${EASE_OUT_QUART}, transform 0.6s ${EASE_OUT_EXPO}, box-shadow 0.5s ${EASE_OUT_QUART}`,
                  }}
                   onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = ox(0.5);
                    el.style.transform = "translateY(-4px)";
                    el.style.boxShadow = `0 20px 60px -15px ${ox(0.3)}`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = "hsl(var(--foreground) / var(--a-border-card))";
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  {/* Accent gradient edge */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{
                      background: `linear-gradient(180deg, ${ox(0.9)} 0%, ${ox(0.2)} 100%)`,
                      transition: `opacity 0.4s ${EASE_OUT_QUART}`,
                    }}
                  />

                  <div className="p-8 md:p-10 pl-10 md:pl-12">
                    {/* Number + Title row */}
                    <div className="flex items-baseline gap-4 mb-4">
                      <span
                        className="text-[11px] tracking-[0.2em] uppercase"
                        style={{ fontFamily: t.sans, color: "hsl(var(--foreground) / var(--a-low))" }}
                      >
                        0{i + 1}
                      </span>
                      <h3
                        className="text-[22px] md:text-[28px] font-bold"
                        style={{ fontFamily: t.sans, color: t.ink(0.9) }}
                      >
                        {cap.title}
                      </h3>
                    </div>

                    {/* Serif tagline */}
                    <p
                      className="text-[16px] md:text-[18px] mb-5"
                      style={{
                        fontFamily: t.serif,
                        color: "hsl(var(--foreground))",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                      }}
                    >
                      {cap.sub}
                    </p>

                    {/* Detail */}
                    <p
                      className="text-[13px] md:text-[14px] leading-relaxed max-w-2xl"
                      style={{ fontFamily: t.sans, color: t.ink(0.4), lineHeight: 1.8 }}
                    >
                      {cap.detail}
                    </p>

                    {/* Arrow indicator */}
                    <div
                      className="mt-6 text-[11px] tracking-[0.15em] uppercase flex items-center gap-2"
                      style={{
                        fontFamily: t.sans,
                        color: "hsl(var(--foreground) / var(--a-low))",
                        transition: `color 0.3s ${EASE_OUT_QUART}, gap 0.4s ${EASE_OUT_EXPO}`,
                      }}
                    >
                      <span className="group-hover:text-[hsl(var(--foreground))]" style={{ transition: `color 0.3s ${EASE_OUT_QUART}` }}>Explore</span>
                      <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5" style={{ transitionTimingFunction: EASE_OUT_EXPO }}>→</span>
                    </div>
                  </div>
                </Link>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ IMPACT ═══ */}
      <section className="section-flow-tight relative z-10 flex items-center">
        <div className="px-6 md:px-10 max-w-4xl mx-auto w-full">
          <RevealBlock direction="left">
            <div
              className="text-[10px] tracking-[0.25em] uppercase mb-8"
              style={{ fontFamily: t.sans, color: "hsl(var(--foreground))" }}
            >
              Recent Impact
            </div>
          </RevealBlock>

          <ImpactCloud onCaseClick={handleCaseClick} />
        </div>
      </section>

      {/* ═══ INTAKE CTA ═══ */}
      <section className="section-flow relative z-10 flex items-center justify-center">
        <div className="w-full px-6 md:px-10 max-w-4xl mx-auto">
          <RevealBlock>
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--foreground) / 0.15)",
                minHeight: "420px",
              }}
            >
              {/* Soft gradient vignette to ease harsh contrast at edges */}
              <div
                className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
                style={{
                  background: `
                    radial-gradient(ellipse 120% 80% at 50% 100%, hsl(var(--background) / 0.08) 0%, transparent 60%),
                    linear-gradient(to top, hsl(var(--background) / 0.06) 0%, transparent 30%),
                    linear-gradient(to bottom, hsl(var(--background) / 0.04) 0%, transparent 20%)
                  `,
                }}
              />

              {/* Content */}
              <div className="relative z-10 p-10 md:p-14 lg:p-16 flex flex-col justify-center min-h-[420px]">
                <span
                  className="text-[10px] tracking-[0.25em] uppercase mb-8 inline-block"
                  style={{ fontFamily: t.sans, color: "hsl(var(--background) / 0.4)" }}
                >
                  3-Minute Diagnostic
                </span>

                <h2
                  className="text-[28px] md:text-[36px] lg:text-[44px] font-bold leading-[1.1] mb-6 max-w-lg"
                  style={{ fontFamily: t.sans, color: "hsl(var(--background))" }}
                >
                  Find the gaps before your opponents do.
                </h2>


                <p
                  className="text-[13px] md:text-[14px] leading-[1.7] max-w-sm mb-10"
                  style={{ fontFamily: t.sans, color: "hsl(var(--background) / 0.35)" }}
                >
                  A quick assessment of how your comms strategy compares to the most effective operators in the field — and where you might be leaving leverage on the table.
                </p>

                <Link
                  to="/diagnostic"
                  className="group inline-flex items-center gap-2.5 no-underline rounded-full self-start"
                  style={{
                    fontFamily: t.sans,
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase" as const,
                    color: "hsl(var(--foreground))",
                    background: "hsl(var(--background))",
                    padding: "14px 36px",
                    transition: `all 0.5s ${EASE_OUT_EXPO}`,
                    boxShadow: `0 0 0 0 hsl(var(--background) / 0)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 12px 40px -8px hsl(var(--background) / 0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 0 0 0 hsl(var(--background) / 0)`;
                  }}
                >
                  Take the Diagnostic
                  <span style={{ transition: `transform 0.3s ${EASE_OUT_EXPO}` }} className="group-hover:translate-x-1 inline-block">→</span>
                </Link>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ═══ NETWORK ═══ */}
      <section className="section-flow-tight relative z-10 flex items-center">
        <div className="px-6 md:px-10 max-w-4xl mx-auto w-full">
          <RevealBlock direction="left">
            <div
              className="text-[10px] tracking-[0.25em] uppercase mb-4"
              style={{ fontFamily: t.sans, color: "hsl(var(--foreground))" }}
            >
              Our Network
            </div>
          </RevealBlock>
          <RevealBlock delay={0.15}>
            <p
              className="text-[20px] md:text-[24px] font-bold leading-snug mb-3 max-w-lg"
              style={{ fontFamily: t.sans, color: "hsl(var(--foreground))" }}
            >
              We come from the industries your grantees need to reach.
            </p>
            <p
              className="text-[14px] md:text-[15px] leading-relaxed mb-12 max-w-lg"
              style={{ fontFamily: t.sans, color: t.ink(0.4), lineHeight: 1.7 }}
            >
              Our team is built from careers in commercial media and entertainment — so we know how these sectors actually work from the inside.
            </p>
          </RevealBlock>
          <AnimatedLine width={50} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            {NETWORK_SECTORS.map((sector, i) => (
              <RevealBlock key={sector.name} delay={0.25 + i * 0.04}>
                <div
                  className="rounded-xl px-5 py-4 cursor-default h-full"
                  style={{
                    background: "hsl(var(--foreground) / var(--a-bg-subtle))",
                    border: "1px solid hsl(var(--foreground) / var(--a-border-card))",
                    transition: `all 0.4s ${EASE_OUT_QUART}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "hsl(var(--foreground) / 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "hsl(var(--foreground) / var(--a-border-card))";
                  }}
                >
                  <p
                    className="text-[13px] md:text-[14px] font-bold mb-1"
                    style={{ fontFamily: t.sans, color: t.ink(0.8) }}
                  >
                    {sector.name}
                  </p>
                  <p
                    className="text-[11px] md:text-[12px]"
                    style={{ fontFamily: t.sans, color: t.ink(0.35), lineHeight: 1.5 }}
                  >
                    {sector.desc}
                  </p>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER — LET'S CHAT ═══ */}
      <section
        className="relative z-10 flex flex-col items-center justify-center px-6"
        style={{ minHeight: "100dvh" }}
      >
        <RevealBlock>
          <div className="flex flex-col items-center gap-6">
            <h2
              className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-center"
              style={{ fontFamily: t.sans, color: "hsl(var(--foreground))", lineHeight: 1.1 }}
            >
              Let's chat.
            </h2>
            <p
              className="text-[14px] md:text-[16px] text-center max-w-md"
              style={{ fontFamily: t.sans, color: t.ink(0.4), lineHeight: 1.6 }}
            >
              Ready to build a strategic communications portfolio that actually moves?
            </p>
            <Link
              to="/diagnostic"
              className="inline-flex items-center gap-2 no-underline text-[12px] tracking-[0.18em] uppercase mt-4 px-8 py-4 rounded-full"
              style={{
                fontFamily: t.sans,
                color: "hsl(var(--background))",
                background: "hsl(var(--foreground))",
                transition: `transform 0.4s ${EASE_OUT_EXPO}, box-shadow 0.4s ${EASE_OUT_QUART}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 12px 40px -8px hsl(var(--foreground) / 0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Take the Diagnostic
              <span>→</span>
            </Link>
          </div>
        </RevealBlock>
      </section>
      </div>

      {/* Case study overlay — opens in-place, no navigation */}
      <CaseTimelineOverlay study={selectedCase} onClose={handleCaseClose} />
    </AtmosphericLayout>
  );
};

export default Index;
