import { Link } from "react-router-dom";
import { Timer } from "lucide-react";
import { useEffect, useState, useRef, useCallback, CSSProperties } from "react";
import AtmosphericLayout from "@/components/AtmosphericLayout";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { useFeaturedPosts } from "@/hooks/useFeaturedPosts";
import { useFieldNotes } from "@/hooks/useFieldNotes";
import { t } from "@/lib/theme";

/* ── Data ── */
const SECTORS = ["Industry", "Labor", "Philanthropy", "Culture", "Policy", "National Security"];

const NETWORK_SECTORS = [
  "Music", "Film & TV", "News Media", "Digital Creators", "Brands & Advertising",
  "Athletes & Sports", "Gaming", "Faith", "Campuses", "Veterans & Defense",
  "Labor", "Government & Policy", "Philanthropy", "Energy", "Industry Groups",
  "Technologists", "National Security", "Community Organizations",
];

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
      "We map the alignments that nobody in any single sector can see. Industry, labor, philanthropy, culture, policy, and national security — at the same table, moving on the same target.",
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

/* FIELD_NOTES now pulled from DB via useFeaturedPosts hook */

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
        background: "hsl(var(--foreground) / var(--a-low))",
        width: hasRevealed ? width : 0,
        transition: `width 1.2s ${EASE_OUT_EXPO} 0.3s`,
      }}
    />
  );
}

/* ── Case fragment with premium motion ── */
function CaseFragment({ sector, brief, result, slug, index }: { sector: string; brief: string; result: string; slug?: string | null; index: number }) {
  const { ref, hasRevealed } = useScrollReveal(0.15);
  const [hovered, setHovered] = useState(false);

  const content = (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`mb-16 ${slug ? "cursor-pointer" : "cursor-default"}`}
      style={{
        breakInside: "avoid" as const,
        opacity: hasRevealed ? 1 : 0,
        transform: hasRevealed
          ? hovered ? "translateX(8px)" : "translateX(0)"
          : "translateX(-30px)",
        transition: `opacity 0.9s ${EASE_OUT_EXPO} ${index * 0.12}s, transform 1s ${EASE_OUT_EXPO} ${index * 0.12}s`,
        borderLeft: `2px solid ${hovered ? "hsl(var(--foreground))" : "hsl(var(--foreground) / var(--a-dim))"}`,
        paddingLeft: "24px",
        willChange: "opacity, transform",
      }}
    >
      <div
        className="text-[10px] tracking-[0.2em] uppercase mb-2"
        style={{ fontFamily: t.sans, color: "hsl(var(--foreground))" }}
      >
        {sector}
      </div>
      <div
        className="text-lg leading-relaxed mb-2 italic"
        style={{ fontFamily: t.serif, color: t.ink(0.5) }}
      >
        {brief}
      </div>
      <div
        className="text-[11px]"
        style={{
          fontFamily: t.sans,
          color: hovered ? "hsl(var(--foreground) / 0.9)" : "hsl(var(--foreground) / var(--a-mid))",
          transition: `color 0.4s ${EASE_OUT_QUART}`,
        }}
      >
        {result}
      </div>
    </div>
  );

  if (slug) {
    return <Link to={`/post/${slug}`} className="block no-underline">{content}</Link>;
  }
  return content;
}

/* ── Index page ── */
const Index = () => {
  const { playHoverGlitch, playClickGlitch } = useGlitchSFX();
  const { data: featuredPosts } = useFeaturedPosts();
  const { data: fieldNotes } = useFieldNotes();
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
        className="snap-scroll-container"
      >

      {/* ═══ HERO ═══ */}
      <section
        className="snap-section flex items-center justify-center w-full relative z-20"
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
          <span
            className="text-[11px] tracking-[0.25em] uppercase"
            style={{
              fontFamily: t.sans,
              color: "hsl(var(--foreground) / var(--a-high))",
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
            {SECTORS.map((sector, i) => {
              const isGlowing = i === glowIndex;
              return (
                <span
                  key={sector}
                  className="text-[10px] md:text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full"
                  style={{
                    fontFamily: t.sans,
                    color: isGlowing ? "hsl(var(--foreground))" : "hsl(var(--foreground) / var(--a-mid))",
                    background: isGlowing ? "hsl(var(--foreground) / 0.14)" : "hsl(var(--foreground) / var(--a-bg))",
                    border: `1px solid ${isGlowing ? "hsl(var(--foreground) / 0.45)" : "hsl(var(--foreground) / var(--a-border))"}`,
                    boxShadow: isGlowing ? "0 0 20px -4px hsl(var(--foreground) / 0.2)" : "none",
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
              animation: `fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.0s both`,
            }}
          >
            By Referral Only
          </span>
        </main>
      </section>

      {/* ═══ ALTITUDE ═══ */}
      <section className="snap-section flex items-center justify-center relative z-10">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <RevealBlock>
            <p
              className="uppercase tracking-[0.25em] mb-10"
              style={{
                fontFamily: t.sans,
                fontSize: "10px",
                color: t.ink(0.4),
                letterSpacing: "0.25em",
              }}
            >
              Our Altitude
            </p>
          </RevealBlock>
          <RevealBlock delay={0.15}>
            <p
             className="italic font-light"
              style={{
                fontFamily: t.serif,
                fontSize: "clamp(26px, 4vw, 42px)",
                lineHeight: 1.4,
                color: "hsl(var(--foreground) / var(--a-high))",
              }}
            >
              You're on the ground doing the work.
            </p>
          </RevealBlock>
          <RevealBlock delay={0.3}>
            <p
             className="font-semibold mt-4"
              style={{
                fontFamily: t.serif,
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
            <p
              className="mt-4 max-w-2xl"
              style={{ fontFamily: t.sans, fontSize: "14px", color: t.ink(0.45), lineHeight: 1.8 }}
            >
              We're specialists in cultural strategy, media-based organizing, and philanthropy — working across six sectors to help donors and their grantees get strategic communications right.
            </p>
          </RevealBlock>
        </div>
      </section>

      {/* ═══ CAPABILITIES ═══ */}
      <section className="snap-section relative z-10 flex items-center">
        <div className="w-full px-6 md:px-10 max-w-4xl mx-auto">
          <RevealBlock direction="left">
            <div
              className="text-[10px] tracking-[0.25em] uppercase mb-16"
              style={{ fontFamily: t.sans, color: "hsl(var(--foreground))" }}
            >
              Capabilities
            </div>
          </RevealBlock>

          <div className="grid gap-8 md:gap-10">
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
                    el.style.borderColor = "hsl(var(--foreground) / 0.45)";
                    el.style.transform = "translateY(-4px)";
                    el.style.boxShadow = `0 20px 60px -15px hsl(var(--foreground) / 0.25)`;
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
                      background: "linear-gradient(180deg, hsl(var(--foreground) / var(--a-high)) 0%, hsl(var(--foreground) / var(--a-border)) 100%)",
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

      {/* ═══ INTAKE CTA ═══ */}
      <section
        className="snap-section relative z-10 flex flex-col items-center justify-center px-6"
      >
        <RevealBlock>
          <span
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase mb-8 text-center"
            style={{ fontFamily: t.sans, color: "hsl(var(--foreground) / var(--a-mid))" }}
          >
            <Timer size={13} strokeWidth={1.5} />
            Five minutes
          </span>
        </RevealBlock>

        <RevealBlock delay={0.1}>
          <h2
            className="text-[26px] md:text-[36px] lg:text-[42px] leading-[1.15] text-center mb-5 max-w-xl"
            style={{ fontFamily: t.serif, color: t.ink(0.85), fontWeight: 400 }}
          >
            Five minutes. One walkthrough. See if there's a fit.
          </h2>
        </RevealBlock>

        <RevealBlock delay={0.2}>
          <p
            className="text-[14px] md:text-[16px] leading-[1.7] text-center max-w-sm mb-12"
            style={{ fontFamily: t.sans, color: t.ink(0.4) }}
          >
            A guided intake that helps us understand your situation — and shows you how we think about it.
          </p>
        </RevealBlock>

        <RevealBlock delay={0.35} direction="scale">
          <Link
            to="/deck"
            className="group inline-flex items-center gap-2.5 no-underline rounded-full"
            style={{
              fontFamily: t.sans,
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--foreground) / var(--a-dim))",
              background: "hsl(var(--foreground) / var(--a-bg))",
              padding: "14px 36px",
              transition: `all 0.5s ${EASE_OUT_EXPO}`,
              boxShadow: "0 0 0 0 hsl(var(--foreground) / 0)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "hsl(var(--foreground))";
              e.currentTarget.style.color = "hsl(var(--background))";
              e.currentTarget.style.borderColor = "hsl(var(--foreground))";
              e.currentTarget.style.boxShadow = "0 12px 40px -8px hsl(var(--foreground) / 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-bg))";
              e.currentTarget.style.color = "hsl(var(--foreground))";
              e.currentTarget.style.borderColor = "hsl(var(--foreground) / var(--a-dim))";
              e.currentTarget.style.boxShadow = "0 0 0 0 hsl(var(--foreground) / 0)";
            }}
          >
            Let's see
            <span style={{ transition: `transform 0.3s ${EASE_OUT_EXPO}` }} className="group-hover:translate-x-1 inline-block">→</span>
          </Link>
        </RevealBlock>
      </section>

      {/* ═══ NETWORK ═══ */}
      <section className="snap-section relative z-10 flex items-center">
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
              className="text-[15px] md:text-[17px] leading-relaxed mb-12 max-w-lg"
              style={{ fontFamily: t.sans, color: t.ink(0.4), lineHeight: 1.7 }}
            >
              We collaborate with a network of over 400 practitioners across every sector that moves policy, culture, and capital.
            </p>
          </RevealBlock>
          <AnimatedLine width={50} />
          <div className="flex flex-wrap gap-2.5 md:gap-3 mt-10">
            {NETWORK_SECTORS.map((sector, i) => (
              <RevealBlock key={sector} delay={0.25 + i * 0.04}>
                <span
                  className="inline-block text-[11px] md:text-[12px] tracking-[0.1em] uppercase px-4 py-2 rounded-full cursor-default"
                  style={{
                    fontFamily: t.sans,
                    color: "hsl(var(--foreground) / var(--a-high))",
                    background: "hsl(var(--foreground) / var(--a-bg))",
                    border: "1px solid hsl(var(--foreground) / var(--a-border))",
                    transition: `all 0.4s ${EASE_OUT_QUART}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "hsl(var(--foreground) / 0.12)";
                    e.currentTarget.style.borderColor = "hsl(var(--foreground) / 0.4)";
                    e.currentTarget.style.color = "hsl(var(--foreground))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-bg))";
                    e.currentTarget.style.borderColor = "hsl(var(--foreground) / var(--a-border))";
                    e.currentTarget.style.color = "hsl(var(--foreground) / var(--a-high))";
                  }}
                >
                  {sector}
                </span>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FIELD NOTES ═══ */}
      <section className="snap-section relative z-10 flex items-center">
        <div className="px-6 md:px-10 max-w-4xl mx-auto w-full">
          <RevealBlock direction="left">
            <div
              className="text-[10px] tracking-[0.25em] uppercase mb-16"
              style={{ fontFamily: t.sans, color: "hsl(var(--foreground))" }}
            >
              Field Notes
            </div>
          </RevealBlock>

          <div className="columns-1 md:columns-2 gap-x-16" style={{ columnFill: "balance" }}>
            {(fieldNotes || []).map((note, i) => (
              <CaseFragment
                key={note.id}
                sector={note.sector_label || note.capability}
                brief={note.excerpt || ""}
                result={note.featured_stat || ""}
                slug={note.slug}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <section className="snap-section relative z-10 flex flex-col items-center justify-center px-6">
        <RevealBlock>
          <a
            href="mailto:hello@vangelder.co"
            className="text-[13px] tracking-[0.18em] no-underline"
            style={{
              fontFamily: t.sans,
              color: t.ink(0.45),
              transition: `color 0.4s ${EASE_OUT_QUART}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.45))}
          >
            hello@vangelder.co
          </a>
        </RevealBlock>
        <RevealBlock delay={0.15}>
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
