import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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

/* ── Scroll-reveal hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function RevealBlock({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Case fragment ── */
function CaseFragment({ sector, brief, result }: { sector: string; brief: string; result: string }) {
  const { ref, visible } = useReveal(0.2);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="mb-12 cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? "translateX(8px)" : "translateX(0)") : "translateX(-20px)",
        transition: "all 0.6s ease",
        borderLeft: `2px solid ${hovered ? "hsl(var(--destructive))" : "hsl(var(--destructive) / 0.3)"}`,
        paddingLeft: "20px",
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
        style={{ fontFamily: t.serif, color: t.ink(0.6) }}
      >
        {brief}
      </div>
      <div
        className="text-[11px]"
        style={{
          fontFamily: t.sans,
          color: hovered ? "hsl(var(--destructive) / 0.9)" : "hsl(var(--destructive) / 0.5)",
          transition: "color 0.3s ease",
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

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 600);

  return (
    <AtmosphericLayout>
      {/* HUD: top-right */}
      <span
        className="fixed top-6 right-6 z-30 text-[10px] tracking-[0.15em] uppercase"
        style={{ color: t.ink(0.3), fontFamily: t.sans }}
      >
        Van Gelder Co.
      </span>

      {/* ═══ HERO ═══ */}
      <section
        className="flex items-center justify-center w-full relative z-20"
        style={{ height: "100vh", opacity: heroOpacity }}
      >
        <main className="flex flex-col items-center text-center px-6 max-w-3xl gap-10 md:gap-14">
          {/* Classification label */}
          <span
            className="text-[11px] tracking-[0.25em] uppercase"
            style={{
              fontFamily: t.sans,
              color: t.ink(0.4),
              animation: "fade-up 0.6s ease-out 0.3s both",
            }}
          >
            VGC StratComm Advisors
          </span>

          {/* Hero lines — nav links */}
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
                  animation: `clip-reveal 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.4 + i * 0.35}s both`,
                }}
              >
                <span
                  className="hero-nav-wash absolute inset-0 pointer-events-none rounded-lg"
                  style={{ background: "transparent", transition: "background 0.15s ease" }}
                />
                <span
                  className="hero-nav-text relative z-10 text-[22px] md:text-[44px] lg:text-[48px] font-bold leading-[1.15] transition-colors duration-150"
                  style={{ fontFamily: t.sans, color: t.ink(0.8) }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </h1>

          {/* Sector tags */}
          <div
            className="flex flex-wrap justify-center gap-2 md:gap-3"
            style={{ animation: "fade-up 0.7s ease-out 1.6s both" }}
          >
            {SECTORS.map((sector) => (
              <span
                key={sector}
                className="text-[10px] md:text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full"
                style={{
                  fontFamily: t.sans,
                  color: t.ink(0.35),
                  background: t.ink(0.04),
                  border: t.border(0.08),
                }}
              >
                {sector}
              </span>
            ))}
          </div>

          {/* Access gate */}
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{
              fontFamily: t.sans,
              color: t.ink(0.25),
              animation: "fade-up 0.6s ease-out 2.0s both",
            }}
          >
            By Referral Only
          </span>
        </main>
      </section>

      {/* ═══ ALTITUDE ═══ */}
      <section className="min-h-screen flex items-center justify-center relative z-10">
        <div className="max-w-xl px-6 md:px-10">
          <RevealBlock>
            <p
              className="italic font-light"
              style={{
                fontFamily: t.serif,
                fontSize: "clamp(26px, 4vw, 42px)",
                lineHeight: 1.4,
                color: t.ink(0.55),
              }}
            >
              Everyone else operates at 30,000 feet.
            </p>
          </RevealBlock>
          <RevealBlock delay={0.2}>
            <p
              className="font-semibold mt-4"
              style={{
                fontFamily: t.serif,
                fontSize: "clamp(26px, 4vw, 42px)",
                lineHeight: 1.4,
                color: t.ink(0.85),
              }}
            >
              We see it from orbit.
            </p>
          </RevealBlock>
          <RevealBlock delay={0.4}>
            <div
              className="my-8"
              style={{ width: 60, height: 1, background: "hsl(var(--destructive) / 0.4)" }}
            />
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
      <section className="relative z-10 py-24 md:py-32 px-6 md:px-10 max-w-5xl mx-auto">
        <RevealBlock>
          <div
            className="text-[10px] tracking-[0.25em] uppercase mb-16"
            style={{ fontFamily: t.sans, color: "hsl(var(--destructive))" }}
          >
            Capabilities
          </div>
        </RevealBlock>

        <div className="grid gap-6">
          {CAPABILITIES.map((cap, i) => (
            <RevealBlock key={cap.title} delay={i * 0.12}>
              <Link to={cap.to} className="capability-card block">
                <h3
                  className="text-2xl md:text-3xl font-normal mb-3"
                  style={{ fontFamily: t.serif, color: t.ink(0.8) }}
                >
                  {cap.title}
                </h3>
                <p
                  className="text-xs tracking-wide mb-4"
                  style={{ fontFamily: t.sans, color: "hsl(var(--destructive))", letterSpacing: "0.03em" }}
                >
                  {cap.sub}
                </p>
                <p
                  className="text-[15px] leading-relaxed"
                  style={{ fontFamily: t.serif, color: t.ink(0.38) }}
                >
                  {cap.detail}
                </p>
              </Link>
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* ═══ FIELD NOTES ═══ */}
      <section className="relative z-10 py-20 md:py-28 px-6 md:px-10 max-w-2xl mx-auto">
        <RevealBlock>
          <div
            className="text-[10px] tracking-[0.25em] uppercase mb-16"
            style={{ fontFamily: t.sans, color: "hsl(var(--destructive))" }}
          >
            Field Notes
          </div>
        </RevealBlock>

        {FIELD_NOTES.map((note) => (
          <CaseFragment key={note.sector} {...note} />
        ))}
      </section>

      {/* ═══ CONTACT ═══ */}
      <section className="relative z-10 flex flex-col items-center justify-center" style={{ height: "50vh" }}>
        <RevealBlock>
          <div
            className="mx-auto mb-8"
            style={{ width: 40, height: 1, background: "hsl(var(--destructive) / 0.4)" }}
          />
        </RevealBlock>
        <RevealBlock delay={0.1}>
          <a
            href="mailto:hello@vangelder.co"
            className="text-[13px] tracking-[0.18em] no-underline transition-colors duration-300"
            style={{ fontFamily: t.sans, color: t.ink(0.45) }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--destructive))")}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.45))}
          >
            hello@vangelder.co
          </a>
        </RevealBlock>
        <RevealBlock delay={0.2}>
          <span
            className="text-[9px] tracking-[0.3em] uppercase mt-6 block"
            style={{ fontFamily: t.sans, color: t.ink(0.15) }}
          >
            By Referral Only
          </span>
        </RevealBlock>
      </section>
    </AtmosphericLayout>
  );
};

export default Index;
