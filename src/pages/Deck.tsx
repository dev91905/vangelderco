import { useEffect, useRef, useState, useCallback, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import DeckFrame from "@/components/deck/DeckFrame";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { useFrameReveal } from "@/hooks/useFrameReveal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TOTAL_FRAMES = 12;

/* ─── Style tokens ─── */
const f = {
  serif: "'Instrument Serif', serif",
  sans: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
  gold: "hsl(40 50% 57%)",
  white: (a: number) => `hsl(0 0% 100% / ${a})`,
  goldA: (a: number) => `hsl(40 50% 57% / ${a})`,
  surface: (pct: number) => `hsl(0 0% ${pct}%)`,
};

const heading = (size = "clamp(18px, 2.6vw, 28px)"): CSSProperties => ({
  fontFamily: f.serif,
  fontSize: size,
  fontWeight: 400,
  color: f.white(0.88),
  lineHeight: 1.4,
});

const body = (alpha = 0.45): CSSProperties => ({
  fontFamily: f.sans,
  fontSize: "clamp(13px, 1.5vw, 16px)",
  color: f.white(alpha),
  lineHeight: 1.65,
});

const mono = (size = "9px"): CSSProperties => ({
  fontFamily: f.mono,
  fontSize: size,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
});

/* ─── Pain points data ─── */
const PAIN_POINTS = [
  {
    id: "history",
    short: "No portfolio history",
    detail: "Nobody tracks what was funded, what worked, or why. Every new hire starts from scratch.",
    consequence: "You can't improve what you can't remember. Every cycle resets to zero.",
    capRelevance: "We build the institutional record that's never existed — audit everything, document what worked, create the baseline.",
  },
  {
    id: "evaluate",
    short: "No way to evaluate proposals",
    detail: "No rubric for what to fund next. The default is inertia — renew what's familiar.",
    consequence: "Without a framework, every grant is a gut call. Inertia wins by default.",
    capRelevance: "We build customized decision-making frameworks your team owns and uses independently.",
  },
  {
    id: "access",
    short: "Locked into the same channels",
    detail: "The portfolio runs on op-eds, paid media, and docs. Entire cultural sectors sit untouched.",
    consequence: "The most powerful levers — music, faith, digital creators, campuses — aren't being used.",
    capRelevance: "We connect you to every cultural sector you're missing — 480-member network across every industry.",
  },
  {
    id: "measurement",
    short: "Measuring the wrong things",
    detail: "Grantees report views and impressions — or try to claim credit for wins that aren't attributable.",
    consequence: "You're counting scroll-bys while the other side is counting converts.",
    capRelevance: "We co-design measurement around power indicators — policy outcomes, coalition growth, capital unlocked.",
  },
  {
    id: "expertise",
    short: "No media experience on staff",
    detail: "When leadership asks why the strategy isn't landing, nobody in the room has ever worked in media.",
    consequence: "You're managing a media portfolio without anyone who's ever built media.",
    capRelevance: "Our team comes from commercial media and entertainment — we transfer pattern recognition, not just advice.",
  },
];

/* ─── Confrontation rows ─── */
const CONFRONTATION_ROWS = [
  { dimension: "Research", yours: "Focus groups to test messages", theirs: "Monitor what's already resonating organically" },
  { dimension: "Content", yours: "Polished ads, op-eds, documentaries", theirs: "Entire creator ecosystems and self-funded investigative journalism — content around the clock" },
  { dimension: "Distribution", yours: "Buy placements on platforms", theirs: "Acquire the platforms and change the algorithms" },
  { dimension: "Engagement", yours: "Pay handfuls of influencers to post", theirs: "Organize at massive scale — churches, campuses, veteran groups, local networks" },
  { dimension: "Measurement", yours: "Count impressions and report reach", theirs: "Track what's shifting polls, moving legislation, growing their base" },
  { dimension: "Iteration", yours: "Declare success and fund the next one", theirs: "Cut what's failing, pour resources into what's working" },
];

/* ─── Three domains ─── */
const DOMAINS = [
  {
    id: "cultural",
    title: "Cultural Strategy",
    tagline: "Use the full culture stack — not just news and documentary.",
    what: "Music, faith communities, digital creators, campuses, veteran groups, local media — organizing infrastructure, not comms channels.",
    unlocks: "Access to audiences your current grantees can't reach. Campaigns that feel organic because they are.",
    missed: "If a portfolio is only in news and documentary, the most powerful levers aren't being touched. Culture is where opinion forms — not where it gets reported.",
    example: "We matched artists to markets using streaming data and voter files. Communities came to learn about careers and signed up as a form of mass action.",
  },
  {
    id: "cross-sector",
    title: "Cross-Sector Intelligence",
    tagline: "Coordinate across sectors — policy pathway pre-engineered.",
    what: "Industry, labor, grassroots, and culture lined up before any content goes live. Multi-sector strategies where every partner knows their role.",
    unlocks: "Durable outcomes that survive the news cycle. Coalition power that compounds over time.",
    missed: "Grantees in silos can't deliver durable outcomes alone. A comms campaign without a policy pathway is noise.",
    example: "We briefed senior government officials alongside talent agencies. The coalition spanned industry, labor, government, community organizations, and cultural sectors.",
  },
  {
    id: "organizing",
    title: "Deep Organizing",
    tagline: "Organize for growth — not recycled engagement.",
    what: "Sustained base-building with trusted local leaders. Not cycling the same people through the same events.",
    unlocks: "A growing base that is the power everyone needs to win and protect the win.",
    missed: "Most campaigns reach the same audiences with the same messages. Real organizing identifies emerging leaders and builds new constituencies.",
    example: "4,000 workers registered through live events in four cities. Whisper campaigns filled 25% of one event before it was announced.",
  },
];

/* ─── Metrics ─── */
const METRICS_ROWS = [
  { left: "Impressions and reach", right: "New sectors at the table" },
  { left: "Video views (3-second scroll-bys)", right: "Decision-makers convened" },
  { left: "Media mentions", right: "Coalition growth — expanding or static?" },
  { left: "Social engagement", right: "Policy outcomes — legislation, executive action" },
  { left: "Website traffic", right: "Capital unlocked from new sources" },
  { left: '"Awareness"', right: "Infrastructure that outlasts the campaign" },
];

/* ─── Case studies ─── */
const StatChip = ({ value, label }: { value: string; label: string }) => (
  <div
    className="flex flex-col px-4 py-3 rounded-lg"
    style={{
      background: f.surface(5),
      border: `1px solid ${f.white(0.05)}`,
    }}
  >
    <span style={{ ...mono("clamp(14px, 1.6vw, 20px)"), fontWeight: 500, color: f.goldA(0.9) }}>
      {value}
    </span>
    <span style={{ ...mono("9px"), color: f.white(0.3), marginTop: "4px" }}>
      {label}
    </span>
  </div>
);

const CASE_STUDIES: {
  name: string;
  issue: string;
  outcome: string;
  content: React.ReactNode | null;
}[] = [
  {
    name: "Clean Energy Workforce",
    issue: "Skilled trades bottleneck threatening federal climate policy",
    outcome: "40K reached, 4,000 workers registered, model now replicating nationally",
    content: (
      <div className="flex flex-col gap-6">
        <p style={{ fontFamily: f.serif, fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400, color: f.white(0.95), lineHeight: 1.4 }}>
          Closing the clean energy workforce gap through culture, coalitions, and deep organizing.
        </p>
        <div className="flex flex-col gap-4">
          {[
            { label: "Issue", text: "After major federal climate legislation, philanthropy focused on consumer adoption — heat pumps, solar, tax credits. Blind spot: not enough skilled workers to install any of it." },
            { label: "What the donors missed", text: "Workers already in trades loved their jobs — high pay, no student debt, AI-proof, portable. The public didn't know these careers existed. The issue wasn't lack of demand. It was that nobody had organized supply." },
            { label: "What we were asked to do", text: "Increase interest in skilled trades. Get people into jobs. Build a constituency of workers economically benefiting from the policy." },
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.white(0.45), lineHeight: 1.7 }}>
              <strong style={{ color: f.white(0.9) }}>{item.label}:</strong> {item.text}
            </p>
          ))}
        </div>
        <div style={{ width: "40px", height: "1px", background: f.goldA(0.25) }} />
        <div className="flex flex-col gap-4">
          {[
            { label: "Phase 1 — Research", text: "Interviewed funders, industry leaders, labor organizers, existing trades workers, the general public, and cultural experts." },
            { label: "Phase 2 — Coalition & cultural strategy", text: "Key finding: climate was not what motivated workers — pay, debt avoidance, and career stability were. This expanded the artist pool dramatically." },
            { label: "Phase 3 — Pilots", text: "Free concerts in four cities. Artists matched to each market via streaming data and voter files." },
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.white(0.45), lineHeight: 1.7 }}>
              <strong style={{ color: f.white(0.9) }}>{item.label}.</strong> {item.text}
            </p>
          ))}
        </div>
        <div style={{ width: "40px", height: "1px", background: f.goldA(0.25) }} />
        <div className="flex flex-wrap gap-3 mt-2">
          <StatChip value="40K" label="Reached" />
          <StatChip value="4,000" label="Registered" />
          <StatChip value="10–11%" label="Conversion Rate" />
          <StatChip value="$40–80" label="Cost per Lead" />
        </div>
        <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.white(0.5), marginTop: "4px" }}>
          Pilot data informed local workforce policy. Capital unlocked from community foundations and new donors. Governor's and mayor's offices engaged directly. White House held briefings on the model.
        </p>
      </div>
    ),
  },
  { name: "Facial Recognition Ban", issue: "First-ever ban on facial recognition technology", outcome: "Legislation passed — New York State", content: null },
  { name: "Faithless Electors", issue: "Constitutional vulnerability in the Electoral College", outcome: "Supreme Court decision", content: null },
  { name: "Iceland Whaling", issue: "Commercial hunting of endangered fin whales", outcome: "185 fin whales saved", content: null },
  { name: "Ireland Fracking Ban", issue: "Fracking expansion in Ireland", outcome: "National ban passed", content: null },
  { name: "Gulf of Mexico Lease Sales", issue: "Fossil fuel lease sales in federal waters", outcome: "Lease sales blocked", content: null },
  { name: "Brazil Indigenous Rights", issue: "Anti-indigenous legislation in the Brazilian legislature", outcome: "Legislation blocked", content: null },
  { name: "UN Biodiversity Targets", issue: "Weak international biodiversity framework", outcome: "Stronger targets adopted — 2022", content: null },
  { name: "Clean Energy Executive Action", issue: "Stalled federal clean energy production", outcome: "Executive action secured — national security framing", content: null },
  { name: "Presidential Cabinet", issue: "Key cabinet appointments", outcome: "Appointments influenced", content: null },
];

/* ═══════════════════════════════════════════════════════════════
   DECK COMPONENT — v3
   ═══════════════════════════════════════════════════════════════ */

const Deck = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const lastFrameRef = useRef(0);
  const { playHoverGlitch } = useGlitchSFX();

  /* ─── Branching state ─── */
  const [selectedPains, setSelectedPains] = useState<string[]>([]);
  const [confrontationStep, setConfrontationStep] = useState(0);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [engagementPath, setEngagementPath] = useState<"fresh" | "experienced" | null>(null);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [expandedHallmark, setExpandedHallmark] = useState<number | null>(null);

  // Frame observation
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    frameRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setCurrentFrame(i); },
        { threshold: 0.5 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // SFX on frame change
  useEffect(() => {
    if (currentFrame !== lastFrameRef.current) {
      playHoverGlitch();
      lastFrameRef.current = currentFrame;
    }
  }, [currentFrame, playHoverGlitch]);

  const scrollToFrame = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    frameRefs.current[clamped]?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Keyboard nav
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const focusDeck = () => {
      if (document.activeElement !== el) {
        el.focus({ preventScroll: true });
      }
    };

    focusDeck();
    const focusTimer = window.setTimeout(focusDeck, 50);

    const handler = (e: KeyboardEvent) => {
      if (selectedCase !== null) return;

      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTypingTarget) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        scrollToFrame(currentFrame + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        scrollToFrame(currentFrame - 1);
      } else if (e.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handler);
    window.addEventListener("pointerdown", focusDeck);

    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("pointerdown", focusDeck);
      window.clearTimeout(focusTimer);
    };
  }, [currentFrame, navigate, scrollToFrame, selectedCase]);

  // Mouse wheel → horizontal scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
    let accumulated = 0;
    const handler = (e: WheelEvent) => {
      if (selectedCase !== null) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        accumulated += e.deltaY;
        if (wheelTimeout) clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
          if (Math.abs(accumulated) > 30) {
            const direction = accumulated > 0 ? 1 : -1;
            const nextFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, currentFrame + direction));
            if (nextFrame !== currentFrame) {
              scrollToFrame(nextFrame);
            }
          }
          accumulated = 0;
        }, 80);
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => {
      el.removeEventListener("wheel", handler);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [selectedCase, currentFrame, scrollToFrame]);

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    frameRefs.current[i] = el;
  };

  /* ─── Per-frame reveal hooks ─── */
  const r1 = useFrameReveal();
  const r2 = useFrameReveal();
  const r3 = useFrameReveal();
  const r4 = useFrameReveal();
  const r5 = useFrameReveal();
  const r6 = useFrameReveal();
  const r7 = useFrameReveal();
  const r8 = useFrameReveal();
  const r9 = useFrameReveal();
  const r10 = useFrameReveal();
  const r11 = useFrameReveal();

  /* ─── Derived state ─── */
  const selectedPainDatas = PAIN_POINTS.filter((p) => selectedPains.includes(p.id));
  const activeDomainData = DOMAINS.find((d) => d.id === activeDomain);

  // Auto-advance confrontation on frame 3 active
  useEffect(() => {
    if (currentFrame !== 2) {
      setConfrontationStep(0);
      return;
    }
    const timer = setInterval(() => {
      setConfrontationStep((prev) => {
        if (prev >= CONFRONTATION_ROWS.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [currentFrame]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label="Interactive deck"
      className="relative bg-background deck-scroll outline-none"
      style={{
        height: "100dvh",
        width: "100vw",
        overflowX: "auto",
        overflowY: "hidden",
        scrollSnapType: "x mandatory",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Breathing gold glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 -z-0"
        style={{
          width: "min(80vw, 700px)",
          height: "min(80vh, 600px)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${f.goldA(0.08)} 0%, ${f.goldA(0.04)} 30%, ${f.goldA(0.01)} 55%, transparent 80%)`,
          animation: "breathe 8s ease-in-out infinite",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Progress dots */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-row gap-1.5" aria-label="Slide navigation">
        {Array.from({ length: TOTAL_FRAMES - 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToFrame(i)}
            className="group relative flex items-center justify-center"
            style={{ width: "20px", height: "20px" }}
            aria-label={`Go to slide ${i + 1}`}
          >
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: currentFrame === i ? "8px" : "4px",
                height: currentFrame === i ? "8px" : "4px",
                background: currentFrame === i ? f.gold : f.white(0.15),
                boxShadow: currentFrame === i ? `0 0 10px ${f.goldA(0.4)}` : "none",
              }}
            />
          </button>
        ))}
      </nav>

      {/* Frame counter */}
      <div className="fixed bottom-8 right-8 z-30" style={{ ...mono("10px"), color: f.white(0.2) }}>
        {String(currentFrame + 1).padStart(2, "0")} / {String(TOTAL_FRAMES).padStart(2, "0")}
      </div>

      {/* ESC hint */}
      <div className="fixed top-8 right-8 z-30" style={{ ...mono("9px"), color: f.white(0.12) }}>
        ESC to exit
      </div>

      {/* ═══ FRAME 1: Hero ═══ */}
      <DeckFrame ref={setRef(0)} mode="wide">
        <div ref={r1.ref} className="flex flex-col items-start gap-8 min-h-[60vh] justify-center">
          <h1
            style={{
              ...r1.stagger(0),
              fontFamily: f.serif,
              fontSize: "clamp(36px, 7vw, 80px)",
              fontWeight: 400,
              color: f.white(0.95),
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              animation: r1.isActive ? "deck-clip-reveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards" : "none",
            }}
          >
            Building a Next-Generation StratComm Portfolio
          </h1>
          <div style={{ ...r1.stagger(1), width: "60px", height: "2px", background: f.goldA(0.5), borderRadius: "1px" }} />
          <p
            style={{
              ...r1.stagger(2, 300),
              fontFamily: f.sans,
              fontSize: "clamp(18px, 2.8vw, 32px)",
              fontWeight: 400,
              color: f.white(0.5),
              lineHeight: 1.4,
              maxWidth: "700px",
            }}
          >
            For donor advisors and program officers who want a portfolio that{" "}
            <em style={{ fontFamily: f.serif, fontStyle: "italic", color: f.white(0.85) }}>hits harder.</em>
          </p>
          <div
            style={{
              ...r1.stagger(3, 600),
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <button
              type="button"
              onClick={() => scrollToFrame(1)}
              className="rounded-xl"
              style={{
                fontFamily: f.sans,
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: f.white(0.9),
                background: f.goldA(0.12),
                border: `1px solid ${f.goldA(0.3)}`,
                padding: "16px 24px",
                transition: "transform 180ms ease, background 180ms ease, border-color 180ms ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.background = f.goldA(0.2);
                e.currentTarget.style.borderColor = f.goldA(0.5);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = f.goldA(0.12);
                e.currentTarget.style.borderColor = f.goldA(0.3);
              }}
            >
              Start the walkthrough →
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <p
                style={{
                  fontFamily: f.sans,
                  fontSize: "clamp(14px, 1.6vw, 18px)",
                  color: f.white(0.3),
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                5 minutes
              </p>
              <span
                style={{
                  fontFamily: f.sans,
                  fontSize: "10px",
                  color: f.white(0.2),
                  animation: "deck-scroll-hint-h 2s ease-in-out infinite",
                  display: "block",
                }}
              >
                Use mouse wheel, trackpad, or ← → keys
              </span>
            </div>
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 2: Self-Diagnosis ═══ */}
      <DeckFrame ref={setRef(1)} label="Self-Diagnosis" mode="wide">
        <div ref={r2.ref} className="flex flex-col gap-8">
          <p
            style={{
              ...heading("clamp(24px, 4vw, 44px)"),
              ...r2.stagger(0),
              maxWidth: "700px",
            }}
          >
            What's getting in the way?
          </p>
          <p style={{ ...body(0.35), ...r2.stagger(1), maxWidth: "560px" }}>
            These are the most common challenges we see in stratcomm portfolios. Select everything that resonates.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" style={r2.stagger(2, 200)}>
            {PAIN_POINTS.map((pain, i) => {
              const isSelected = selectedPains.includes(pain.id);
              return (
                <button
                  key={pain.id}
                  onClick={() => setSelectedPains(prev => isSelected ? prev.filter(p => p !== pain.id) : [...prev, pain.id])}
                  className="text-left transition-all duration-300 rounded-xl"
                  style={{
                    padding: "28px 24px",
                    border: `1px solid ${isSelected ? f.goldA(0.35) : f.white(0.04)}`,
                    background: isSelected ? f.goldA(0.05) : f.surface(4),
                    cursor: "pointer",
                    opacity: r2.isActive ? 1 : 0,
                    transform: r2.isActive ? "translateY(0)" : "translateY(16px)",
                    transition: `all 0.5s ease ${300 + i * 120}ms`,
                  }}
                >
                  <span style={{ ...mono("9px"), color: isSelected ? f.goldA(0.8) : f.white(0.2), display: "block", marginBottom: "12px" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(15px, 1.8vw, 19px)", fontWeight: 400, color: isSelected ? f.white(1) : f.white(0.75), marginBottom: "8px" }}>
                    {pain.short}
                  </p>
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.white(0.35), lineHeight: 1.6 }}>
                    {pain.detail}
                  </p>
                  {isSelected && (
                    <p
                      style={{
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: `1px solid ${f.goldA(0.15)}`,
                        fontFamily: f.sans,
                        fontSize: "clamp(12px, 1.3vw, 14px)",
                        color: f.goldA(0.7),
                        lineHeight: 1.6,
                        fontStyle: "italic",
                      }}
                    >
                      {pain.consequence}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          {selectedPains.length === 0 && (
            <p style={{ ...mono("8px"), color: f.white(0.12), ...r2.stagger(3, 800) }}>
              → or skip and keep scrolling
            </p>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 3: The Real Delta — Confrontation ═══ */}
      <DeckFrame ref={setRef(2)} label="What You're Up Against" mode="full">
        <div ref={r3.ref}>
          <p style={{ ...heading("clamp(20px, 3vw, 32px)"), ...r3.stagger(0), marginBottom: "48px", maxWidth: "700px" }}>
            Both sides have the same goal — shift opinion, force outcomes.{" "}
            <span style={{ color: f.goldA(0.8) }}>Completely different processes.</span>
          </p>

          {/* Full-width confrontation */}
          <div className="w-full rounded-xl overflow-hidden" style={{ background: f.surface(3.5) }}>
            {/* Headers */}
            <div
              className="grid gap-0"
              style={{
                gridTemplateColumns: "140px 1fr 1fr",
                borderBottom: `1px solid ${f.white(0.06)}`,
              }}
            >
              <div style={{ padding: "14px 20px" }} />
              <div style={{ padding: "14px 20px", ...mono("10px"), color: f.white(0.25) }}>
                Your current portfolio
              </div>
              <div style={{ padding: "14px 20px", ...mono("10px"), color: f.goldA(0.7) }}>
                How the opposition operates
              </div>
            </div>

            {/* Rows */}
            {CONFRONTATION_ROWS.map((row, i) => {
              const isRevealed = r3.isActive && i <= confrontationStep;
              const isFocused = i === confrontationStep;
              return (
                <div
                  key={i}
                  className="grid gap-0 transition-all duration-700"
                  style={{
                    gridTemplateColumns: "140px 1fr 1fr",
                    borderBottom: i < CONFRONTATION_ROWS.length - 1 ? `1px solid ${f.white(0.03)}` : "none",
                    opacity: isRevealed ? 1 : 0,
                    transform: isRevealed ? "translateX(0)" : "translateX(20px)",
                    background: isFocused ? f.white(0.015) : "transparent",
                  }}
                >
                  <div style={{ padding: "18px 20px", fontFamily: f.sans, fontSize: "clamp(12px, 1.4vw, 15px)", fontWeight: 600, color: isFocused ? f.white(0.85) : f.white(0.35) }}>
                    {row.dimension}
                  </div>
                  <div style={{ padding: "18px 20px", fontFamily: f.sans, fontSize: "clamp(12px, 1.4vw, 15px)", color: f.white(0.2), lineHeight: 1.7 }}>
                    {row.yours}
                  </div>
                  <div style={{
                    padding: "18px 20px",
                    fontFamily: f.sans,
                    fontSize: "clamp(12px, 1.4vw, 15px)",
                    color: isFocused ? f.white(0.8) : f.white(0.5),
                    lineHeight: 1.7,
                    borderLeft: `2px solid ${isFocused ? f.goldA(0.5) : f.goldA(0.1)}`,
                    transition: "all 0.5s ease",
                  }}>
                    {row.theirs}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Post-confrontation insight */}
          {confrontationStep >= CONFRONTATION_ROWS.length - 1 && (
            <div
              className="mt-10 max-w-[600px]"
              style={{
                opacity: 0,
                animation: "deck-fade-up 0.8s ease 600ms forwards",
              }}
            >
              <p style={{ ...body(0.45), borderLeft: `2px solid ${f.goldA(0.3)}`, paddingLeft: "16px", borderRadius: "1px" }}>
                You test messages in a petri dish and pay people to watch the winners.{" "}
                <span style={{ color: f.white(0.75) }}>They skip the test tube — fund everything, watch what catches fire organically, and supercharge it.</span>
              </p>
            </div>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 4: Hallmarks ═══ */}
      <DeckFrame ref={setRef(3)} label="Effective Portfolios" mode="wide">
        <div ref={r4.ref} className="flex flex-col lg:flex-row gap-12 w-full">
          {/* Left: Title */}
          <div className="lg:w-[35%] flex flex-col justify-center" style={r4.stagger(0)}>
            <p style={heading("clamp(22px, 3.5vw, 38px)")}>
              Three hallmarks of portfolios{" "}
              <span style={{ color: f.goldA(0.8) }}>actually producing results.</span>
            </p>
            {selectedPainDatas.length > 0 && (
              <p
                style={{
                  marginTop: "20px",
                  fontFamily: f.sans,
                  fontSize: "clamp(12px, 1.3vw, 14px)",
                  color: f.goldA(0.55),
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  borderLeft: `2px solid ${f.goldA(0.25)}`,
                  paddingLeft: "12px",
                }}
              >
                You flagged: {selectedPainDatas.map(p => `"${p.short}"`).join(", ")} — each of these addresses that directly.
              </p>
            )}
          </div>

          {/* Right: Hallmark cards */}
          <div className="lg:w-[65%] flex flex-col gap-3">
            {[
              {
                title: "They're using the full culture stack.",
                rationale: "Music, faith communities, digital creators, campuses, veteran groups, local media — organizing infrastructure, not comms channels.",
                help: "Connect you to every cultural sector you're missing, map which networks reach the audiences you need.",
              },
              {
                title: "They're coordinating across sectors.",
                rationale: "Effective strategies have a policy pathway pre-engineered — industry, labor, grassroots, and culture lined up before any content goes live.",
                help: "Design multi-sector strategies where comms, policy, industry, labor, grassroots, and culture reinforce each other.",
              },
              {
                title: "They're organizing for growth.",
                rationale: "Sustained base-building with trusted local leaders — not cycling the same people through the same events.",
                help: "Run live campaigns that engage new audiences. Audit grantees for real vs. performed organizing.",
              },
            ].map((h, i) => {
              const isExpanded = expandedHallmark === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpandedHallmark(isExpanded ? null : i)}
                  className="text-left w-full transition-all duration-300 rounded-xl"
                  style={{
                    padding: "28px 24px",
                    background: isExpanded ? f.surface(6) : f.surface(4),
                    border: `1px solid ${isExpanded ? f.goldA(0.2) : f.white(0.04)}`,
                    cursor: "pointer",
                    opacity: r4.isActive ? 1 : 0,
                    transform: r4.isActive ? "translateY(0)" : "translateY(12px)",
                    transition: `all 0.5s ease ${200 + i * 150}ms`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span style={{ fontFamily: f.serif, fontSize: "clamp(20px, 2vw, 28px)", color: isExpanded ? f.goldA(0.7) : f.white(0.12), minWidth: "32px" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p style={{ fontFamily: f.serif, fontSize: "clamp(16px, 2vw, 22px)", color: isExpanded ? f.white(1) : f.white(0.75) }}>
                        {h.title}
                      </p>
                      <div
                        style={{
                          maxHeight: isExpanded ? "300px" : "0",
                          overflow: "hidden",
                          transition: "max-height 0.5s ease, opacity 0.4s ease",
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        <p style={{ ...body(0.45), marginTop: "12px", fontSize: "clamp(12px, 1.3vw, 14px)" }}>
                          {h.rationale}
                        </p>
                        <p style={{ marginTop: "12px", fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.goldA(0.6), lineHeight: 1.6, fontStyle: "italic" }}>
                          How we help: {h.help}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontFamily: f.sans, fontSize: "14px", color: f.white(0.2), transition: "transform 0.3s ease", transform: isExpanded ? "rotate(45deg)" : "rotate(0)" }}>
                      +
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 5: Three Service Domains ═══ */}
      <DeckFrame ref={setRef(4)} label="What We Do" mode="full">
        <div ref={r5.ref} className="flex flex-col gap-0 w-full">
          <p style={{ ...heading("clamp(22px, 3.5vw, 38px)"), ...r5.stagger(0), marginBottom: "12px" }}>
            Three domains. One integrated system.
          </p>
          <p style={{ ...body(0.35), ...r5.stagger(1), marginBottom: "32px", maxWidth: "500px" }}>
            Click any domain to explore what it means for your portfolio.
          </p>

          {/* Domain selector */}
          <div className="flex w-full gap-2 mb-1">
            {DOMAINS.map((d, i) => {
              const isActive = activeDomain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDomain(isActive ? null : d.id)}
                  className="flex-1 text-left transition-all duration-300 rounded-t-xl"
                  style={{
                    padding: "24px 20px",
                    background: isActive ? f.surface(6) : f.surface(3.5),
                    borderBottom: isActive ? `2px solid ${f.gold}` : `2px solid transparent`,
                    cursor: "pointer",
                    opacity: r5.isActive ? 1 : 0,
                    transform: r5.isActive ? "translateY(0)" : "translateY(12px)",
                    transition: `all 0.5s ease ${300 + i * 150}ms`,
                  }}
                >
                  <span style={{ ...mono("9px"), color: isActive ? f.goldA(0.7) : f.white(0.15), display: "block", marginBottom: "8px" }}>
                    0{i + 1}
                  </span>
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(16px, 2.2vw, 24px)", color: isActive ? f.white(1) : f.white(0.55) }}>
                    {d.title}
                  </p>
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(11px, 1.2vw, 14px)", color: f.white(0.25), marginTop: "4px", lineHeight: 1.5 }}>
                    {d.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Domain detail panel */}
          {activeDomainData && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full rounded-b-xl overflow-hidden"
              style={{
                animation: "deck-fade-up 0.5s ease forwards",
                background: f.surface(5),
              }}
            >
              <div style={{ padding: "32px 28px", borderRight: `1px solid ${f.white(0.03)}` }}>
                <span style={{ ...mono("9px"), color: f.goldA(0.55), display: "block", marginBottom: "12px" }}>
                  What it is
                </span>
                <p style={{ ...body(0.55), fontSize: "clamp(14px, 1.6vw, 17px)" }}>{activeDomainData.what}</p>
                <span style={{ ...mono("9px"), color: f.goldA(0.55), display: "block", marginTop: "24px", marginBottom: "12px" }}>
                  What it unlocks
                </span>
                <p style={{ ...body(0.55), fontSize: "clamp(14px, 1.6vw, 17px)" }}>{activeDomainData.unlocks}</p>
              </div>
              <div style={{ padding: "32px 28px" }}>
                <span style={{ ...mono("9px"), color: f.white(0.2), display: "block", marginBottom: "12px" }}>
                  What donor advisors usually miss
                </span>
                <p style={{ ...body(0.4), fontSize: "clamp(14px, 1.6vw, 17px)" }}>{activeDomainData.missed}</p>
                <span style={{ ...mono("9px"), color: f.white(0.2), display: "block", marginTop: "24px", marginBottom: "12px" }}>
                  In practice
                </span>
                <p style={{ ...body(0.5), fontSize: "clamp(14px, 1.6vw, 17px)", fontStyle: "italic", borderLeft: `2px solid ${f.goldA(0.2)}`, paddingLeft: "12px" }}>
                  {activeDomainData.example}
                </p>
              </div>
            </div>
          )}

          {!activeDomain && (
            <div className="flex items-center justify-center py-16 rounded-b-xl" style={{ background: f.surface(3.5) }}>
              <p style={{ ...mono("10px"), color: f.white(0.12) }}>
                ↑ Select a domain to explore
              </p>
            </div>
          )}

          {/* Connection to selected pains */}
          {selectedPainDatas.length > 0 && activeDomainData && (
            <div className="rounded-lg mt-3" style={{ padding: "20px 24px", background: f.goldA(0.03), border: `1px solid ${f.goldA(0.08)}` }}>
              {selectedPainDatas.map((painData, i) => (
                <p key={i} style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.goldA(0.6), lineHeight: 1.6, marginBottom: i < selectedPainDatas.length - 1 ? "8px" : 0 }}>
                  <span style={{ fontWeight: 600 }}>Re: "{painData.short}"</span> — {painData.capRelevance}
                </p>
              ))}
            </div>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 6: Capabilities ═══ */}
      <DeckFrame ref={setRef(5)} label="Capabilities" mode="wide">
        <div ref={r6.ref} className="flex flex-col gap-8">
          <p style={{ ...heading("clamp(20px, 3vw, 32px)"), ...r6.stagger(0) }}>
            How people typically engage with us.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { title: "Portfolio Audit", desc: "Deep dive into your grantees, past investments, and records. We interview grantees directly. You get the institutional record that's never existed." },
              { title: "Strategic Framework", desc: "Customized decision-making rubric for evaluating grants against strategy, not inertia. A tool your team owns and uses independently." },
              { title: "Impact Measurement", desc: "Co-designed around your objectives. Real indicators of power — sectors convened, policy outcomes, capital unlocked." },
              { title: "Access & Introductions", desc: "Cultural operatives across music, film/TV, digital, news. Co-funders, strategic partners. A 480-member network for confidential intel-sharing." },
              { title: "Program Development", desc: "When the work surfaces a gap, we help build what doesn't exist — coalition, campaign, cultural activation, or fund." },
              { title: "Training", desc: "No dependency. You learn to evaluate cultural landscapes, run multi-sector campaigns, and tell real organizing from performed." },
            ].map((cap, i) => (
              <div
                key={i}
                className="group transition-all duration-300 rounded-xl"
                style={{
                  padding: "28px 24px",
                  background: f.surface(4),
                  border: `1px solid ${f.white(0.04)}`,
                  opacity: r6.isActive ? 1 : 0,
                  transform: r6.isActive ? "translateY(0)" : "translateY(12px)",
                  transition: `all 0.5s ease ${200 + i * 100}ms`,
                }}
              >
                <div className="flex flex-col gap-2">
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(15px, 1.8vw, 19px)", color: f.white(0.85), marginBottom: "4px" }}>
                    {cap.title}
                  </p>
                  <p style={{ ...body(0.35), fontSize: "clamp(12px, 1.3vw, 14px)" }}>{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 7: Impact Measurement ═══ */}
      <DeckFrame ref={setRef(6)} label="Impact Measurement" mode="wide">
        <div ref={r7.ref} className="flex flex-col lg:flex-row gap-12 w-full">
          <div className="lg:w-[40%] flex flex-col justify-center" style={r7.stagger(0)}>
            <p style={heading("clamp(22px, 3.5vw, 38px)")}>
              Most grantee reports measure activity.{" "}
              <span style={{ color: f.goldA(0.8) }}>We measure power.</span>
            </p>
            <p
              style={{
                ...r7.stagger(1, 600),
                marginTop: "24px",
                fontFamily: f.sans,
                fontSize: "clamp(13px, 1.6vw, 17px)",
                fontStyle: "italic",
                color: f.goldA(0.6),
                lineHeight: 1.55,
                borderLeft: `2px solid ${f.goldA(0.3)}`,
                paddingLeft: "16px",
              }}
            >
              A campaign with 73 million views that doesn't convene a single new partner, catalyze a single policy conversation, or unlock a single dollar — that campaign failed.
            </p>
          </div>

          <div className="lg:w-[60%] rounded-xl overflow-hidden" style={{ background: f.surface(3.5) }}>
            <div className="grid grid-cols-2 gap-0" style={{ borderBottom: `1px solid ${f.white(0.05)}` }}>
              <div style={{ ...mono("9px"), padding: "14px 20px", color: f.white(0.25) }}>What most grantees report</div>
              <div style={{ ...mono("9px"), padding: "14px 20px", color: f.goldA(0.7), borderLeft: `2px solid ${f.goldA(0.1)}` }}>What we track</div>
            </div>
            {METRICS_ROWS.map((row, i) => {
              const delay = 300 + i * 200;
              return (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-0"
                  style={{
                    borderBottom: i < METRICS_ROWS.length - 1 ? `1px solid ${f.white(0.03)}` : "none",
                    opacity: r7.isActive ? 1 : 0,
                    transform: r7.isActive ? "translateX(0)" : "translateX(12px)",
                    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
                  }}
                >
                  <div style={{
                    padding: "16px 20px",
                    fontFamily: f.sans,
                    fontSize: "clamp(12px, 1.4vw, 15px)",
                    color: f.white(0.2),
                    lineHeight: 1.6,
                    textDecoration: r7.isActive ? "line-through" : "none",
                    textDecorationColor: f.goldA(0.25),
                  }}>
                    {row.left}
                  </div>
                  <div style={{
                    padding: "16px 20px",
                    fontFamily: f.sans,
                    fontSize: "clamp(12px, 1.4vw, 15px)",
                    color: f.white(0.65),
                    lineHeight: 1.6,
                    borderLeft: `2px solid ${f.goldA(0.1)}`,
                  }}>
                    {row.right}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 8: Working Together ═══ */}
      <DeckFrame ref={setRef(7)} label="Working Together" mode="wide">
        <div ref={r8.ref} className="flex flex-col gap-8 w-full">
          <p style={{ ...heading("clamp(22px, 3.5vw, 38px)"), ...r8.stagger(0) }}>
            How do you want to start?
          </p>

          {/* Path selector */}
          <div className="flex flex-col sm:flex-row gap-3 w-full" style={r8.stagger(1, 200)}>
            {([
              { id: "fresh" as const, title: "Starting fresh", desc: "You need to understand the landscape before you act." },
              { id: "experienced" as const, title: "Already up to speed", desc: "You know the gaps. You need capacity and connections." },
            ]).map((path) => {
              const isSelected = engagementPath === path.id;
              const isDimmed = engagementPath !== null && !isSelected;
              return (
                <button
                  key={path.id}
                  onClick={() => setEngagementPath(isSelected ? null : path.id)}
                  className="flex-1 text-left transition-all duration-300 rounded-xl"
                  style={{
                    padding: "32px 28px",
                    border: `1px solid ${isSelected ? f.goldA(0.35) : f.white(0.04)}`,
                    background: isSelected ? f.goldA(0.05) : f.surface(4),
                    opacity: isDimmed ? 0.4 : 1,
                    transform: isSelected ? "scale(1)" : isDimmed ? "scale(0.98)" : "scale(1)",
                    cursor: "pointer",
                  }}
                >
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(17px, 2.2vw, 24px)", color: isSelected ? f.white(1) : f.white(0.65), marginBottom: "8px" }}>
                    {path.title}
                  </p>
                  <p style={body(0.35)}>{path.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Conditional content */}
          {engagementPath === "fresh" && (
            <div
              className="flex flex-col lg:flex-row gap-3 w-full"
              style={{ animation: "deck-fade-up 0.6s ease forwards" }}
            >
              {/* Phase 1 */}
              <div className="flex-1 rounded-xl" style={{ padding: "28px 24px", background: f.surface(4.5), border: `1px solid ${f.white(0.04)}` }}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span style={{ ...mono("9px"), color: f.goldA(0.6) }}>Phase 1</span>
                  <span style={{ fontFamily: f.serif, fontSize: "clamp(16px, 2vw, 20px)", color: f.white(0.85) }}>Internal Review</span>
                  <span style={{ ...mono("9px"), color: f.white(0.2) }}>4–6 weeks</span>
                </div>
                {[
                  "Go through everything — grantees, systems, assumptions, goals.",
                  "Voice-track what's been funded and where things feel stuck.",
                  "Identify the gap between where you are and where you need to be.",
                ].map((b, i) => (
                  <p key={i} style={{ ...body(0.35), fontSize: "clamp(12px, 1.3vw, 14px)", marginBottom: "6px", paddingLeft: "12px", borderLeft: `1px solid ${f.white(0.05)}` }}>
                    {b}
                  </p>
                ))}
                <p style={{ ...body(0.5), fontSize: "clamp(12px, 1.3vw, 14px)", marginTop: "12px" }}>
                  <strong style={{ color: f.white(0.75) }}>Output:</strong> Diagnostic — here's what we're hearing, here's the delta, here's the plan.
                </p>
              </div>

              {/* Phase 2 */}
              <div className="flex-1 rounded-xl" style={{ padding: "28px 24px", background: f.surface(4.5), border: `1px solid ${f.white(0.04)}` }}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span style={{ ...mono("9px"), color: f.goldA(0.6) }}>Phase 2</span>
                  <span style={{ fontFamily: f.serif, fontSize: "clamp(16px, 2vw, 20px)", color: f.white(0.85) }}>External Engagement</span>
                  <span style={{ ...mono("9px"), color: f.white(0.2) }}>6–8 weeks</span>
                </div>
                {[
                  "Interview existing grantees. Flag what should concern you.",
                  "Map cultural infrastructure you're not using.",
                  "Introduce partners from sectors you haven't accessed.",
                ].map((b, i) => (
                  <p key={i} style={{ ...body(0.35), fontSize: "clamp(12px, 1.3vw, 14px)", marginBottom: "6px", paddingLeft: "12px", borderLeft: `1px solid ${f.white(0.05)}` }}>
                    {b}
                  </p>
                ))}
                <p style={{ ...body(0.5), fontSize: "clamp(12px, 1.3vw, 14px)", marginTop: "12px" }}>
                  <strong style={{ color: f.white(0.75) }}>Output:</strong> Actionable roadmap — restructured strategy, evaluation rubric, introduction list.
                </p>
              </div>
            </div>
          )}

          {engagementPath === "experienced" && (
            <div
              className="w-full rounded-xl"
              style={{ animation: "deck-fade-up 0.6s ease forwards", padding: "28px 24px", background: f.surface(4.5), border: `1px solid ${f.white(0.04)}` }}
            >
              <p style={{ fontFamily: f.serif, fontSize: "clamp(16px, 2vw, 20px)", color: f.white(0.85), marginBottom: "12px" }}>
                Custom scope, fast start.
              </p>
              <p style={{ ...body(0.45), maxWidth: "600px" }}>
                We skip the discovery and go straight to what you need — access, introductions, strategy pressure-testing, grantee evaluation, or campaign execution. Scoped to your timeline and budget.
              </p>
            </div>
          )}

          {/* Fork: what happens after */}
          {engagementPath && (
            <div className="flex flex-col sm:flex-row gap-3 w-full" style={{ animation: "deck-fade-up 0.6s ease 300ms forwards", opacity: 0 }}>
              {[
                { label: "Option A", title: "Strategic Advisory Retainer", desc: "Ongoing partnership. We stay embedded as a sounding board, connector, and diagnostic resource. Monthly cadence, quarterly reviews, direct access." },
                { label: "Option B", title: "Transition to Independence", desc: "We hand over the playbook, train your team, and step back. You keep the frameworks, the network, and the knowledge." },
              ].map((opt, i) => (
                <div
                  key={i}
                  className="flex-1 transition-all duration-300 rounded-xl"
                  style={{
                    padding: "28px 24px",
                    background: f.surface(4),
                    border: `1px solid ${f.white(0.04)}`,
                  }}
                >
                  <span style={{ ...mono("9px"), color: f.goldA(0.6) }}>{opt.label}</span>
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(16px, 2vw, 20px)", color: f.white(0.85), marginTop: "8px", marginBottom: "8px" }}>
                    {opt.title}
                  </p>
                  <p style={body(0.35)}>{opt.desc}</p>
                </div>
              ))}
            </div>
          )}

          {!engagementPath && (
            <p style={{ ...mono("8px"), color: f.white(0.12), ...r8.stagger(2, 600) }}>
              ↑ Choose a path to see the process
            </p>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 9: Who We Are ═══ */}
      <DeckFrame ref={setRef(8)} label="Who We Are" mode="wide">
        <div ref={r9.ref} className="flex flex-col lg:flex-row gap-12 w-full">
          <div className="lg:w-[45%] flex flex-col justify-center">
            <p
              style={{
                ...r9.stagger(0),
                fontFamily: f.serif,
                fontSize: "clamp(24px, 4vw, 44px)",
                fontWeight: 400,
                color: f.white(0.9),
                lineHeight: 1.3,
              }}
            >
              We've been where you are.
            </p>
            <p style={{ ...body(0.5), ...r9.stagger(1, 300), marginTop: "20px", maxWidth: "400px" }}>
              Our team is built from careers in{" "}
              <strong style={{ color: f.white(0.8) }}>commercial media and entertainment</strong>{" "}
              — the industries your grantees are trying to reach.
            </p>
            <p style={{ ...body(0.4), ...r9.stagger(2, 600), marginTop: "12px", maxWidth: "400px" }}>
              What's holding most donor advisors back isn't effort — it's{" "}
              <strong style={{ color: f.white(0.8) }}>access and pattern recognition</strong>{" "}
              across these industries. That's what we transfer.
            </p>
          </div>

          <div className="lg:w-[55%] grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "News", desc: "Local and national — how stories get placed and why" },
              { name: "Music", desc: "Labels, touring, festivals, artist strategy" },
              { name: "Film & TV", desc: "Production, distribution, cultural impact" },
              { name: "Digital", desc: "Advertising, creator economy — where opinion forms now" },
              { name: "PR", desc: "Corporate, entertainment, crisis communications" },
              { name: "Philanthropy", desc: "Running organizations, managing portfolios, advising donors" },
            ].map((s, i) => (
              <div
                key={i}
                className="transition-all duration-300 rounded-xl"
                style={{
                  padding: "20px 16px",
                  background: f.surface(4.5),
                  border: `1px solid ${f.white(0.04)}`,
                  opacity: r9.isActive ? 1 : 0,
                  transform: r9.isActive ? "translateY(0)" : "translateY(8px)",
                  transition: `all 0.5s ease ${400 + i * 100}ms`,
                }}
              >
                <p style={{ fontFamily: f.serif, fontSize: "clamp(14px, 1.6vw, 17px)", color: f.white(0.75), marginBottom: "6px" }}>
                  {s.name}
                </p>
                <p style={{ fontFamily: f.sans, fontSize: "clamp(11px, 1.2vw, 13px)", color: f.white(0.25), lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 10: The Promise ═══ */}
      <DeckFrame ref={setRef(9)} mode="narrow">
        <div ref={r10.ref} className="flex flex-col gap-8 items-center text-center">
          <p
            style={{
              ...r10.stagger(0),
              fontFamily: f.serif,
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 400,
              color: f.white(0.92),
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Everything we know becomes everything you know.
          </p>
          <div style={{ ...r10.stagger(1, 400), width: "40px", height: "1px", background: f.goldA(0.25), borderRadius: "1px" }} />
          <p
            style={{
              ...r10.stagger(2, 600),
              fontFamily: f.sans,
              fontSize: "clamp(15px, 2vw, 21px)",
              fontWeight: 400,
              color: f.white(0.4),
              lineHeight: 1.65,
              maxWidth: "560px",
            }}
          >
            Strategic communications is expansive and powerful, but it's completely learnable. If you work with us, you'll learn how to do this yourself. That's not a risk to our business — it's the entire point.
          </p>
          {selectedPainDatas.length > 0 && (
            <p
              style={{
                ...r10.stagger(3, 900),
                fontFamily: f.sans,
                fontSize: "clamp(13px, 1.5vw, 16px)",
                color: f.goldA(0.55),
                lineHeight: 1.6,
                fontStyle: "italic",
                maxWidth: "480px",
              }}
            >
              {selectedPainDatas.map(p => `"${p.short}"`).join(", ")} — we've seen it all before. We know how to fix it. And we'll show you how.
            </p>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 11: CTA + Proof ═══ */}
      <DeckFrame ref={setRef(10)} label="Let's Talk" mode="wide">
        <div ref={r11.ref} className="flex flex-col lg:flex-row gap-12 w-full">
          {/* Left: CTA */}
          <div className="lg:w-[40%] flex flex-col justify-center" style={r11.stagger(0)}>
            <h2
              style={{
                fontFamily: f.serif,
                fontSize: "clamp(28px, 4.5vw, 52px)",
                fontWeight: 400,
                color: f.white(0.95),
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: "16px",
              }}
            >
              VGC StratComm
            </h2>
            <p
              style={{
                fontFamily: f.sans,
                fontSize: "clamp(15px, 2vw, 21px)",
                color: f.white(0.45),
                lineHeight: 1.55,
                marginBottom: "28px",
              }}
            >
              Let's look at your portfolio together.
            </p>
            <a
              href="mailto:info@vgcstratcomm.com"
              className="deck-glow-pulse inline-block rounded-xl"
              style={{
                fontFamily: f.sans,
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: f.goldA(0.9),
                border: `1px solid ${f.goldA(0.3)}`,
                padding: "16px 36px",
                textDecoration: "none",
                textAlign: "center",
                transition: "border-color 300ms, color 300ms",
                maxWidth: "200px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = f.goldA(0.7); e.currentTarget.style.color = f.goldA(1); }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = f.goldA(0.3); e.currentTarget.style.color = f.goldA(0.9); }}
            >
              Get in touch
            </a>
          </div>

          {/* Right: Case studies */}
          <div className="lg:w-[60%]">
            <p style={{ ...mono("9px"), color: f.white(0.2), marginBottom: "16px", ...r11.stagger(1, 200) }}>
              Selected case work
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CASE_STUDIES.map((cs, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCase(i)}
                  className="text-left transition-all duration-300 rounded-lg"
                  style={{
                    padding: "16px 14px",
                    background: cs.content ? f.surface(5) : f.surface(3.5),
                    border: `1px solid ${f.white(0.04)}`,
                    cursor: "pointer",
                    opacity: r11.isActive ? 1 : 0,
                    transform: r11.isActive ? "translateY(0)" : "translateY(8px)",
                    transition: `all 0.4s ease ${300 + i * 60}ms`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = f.surface(7); e.currentTarget.style.borderColor = f.white(0.08); }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = cs.content ? f.surface(5) : f.surface(3.5); e.currentTarget.style.borderColor = f.white(0.04); }}
                >
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(12px, 1.3vw, 14px)", color: cs.content ? f.white(0.75) : f.white(0.35), marginBottom: "4px" }}>
                    {cs.name}
                  </p>
                  <p style={{ ...mono("9px"), color: cs.content ? f.goldA(0.45) : f.white(0.15), lineHeight: "1.4" }}>
                    {cs.outcome}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 12: Spacer ═══ */}
      <DeckFrame ref={setRef(11)}>
        <div className="flex flex-col items-center text-center gap-6">
          <p style={{ ...mono("10px"), color: f.white(0.12) }}>
            ← Scroll back to explore
          </p>
          <h2
            style={{
              fontFamily: f.serif,
              fontSize: "clamp(24px, 4vw, 44px)",
              fontWeight: 400,
              color: f.white(0.06),
              letterSpacing: "-0.02em",
            }}
          >
            VGC StratComm
          </h2>
        </div>
      </DeckFrame>

      {/* Case Study Lightbox */}
      <Dialog open={selectedCase !== null} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{
            background: f.surface(5),
            border: `1px solid ${f.white(0.06)}`,
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: f.serif,
                fontSize: "clamp(18px, 2.5vw, 24px)",
                fontWeight: 400,
                color: f.white(0.9),
              }}
            >
              {selectedCase !== null ? CASE_STUDIES[selectedCase].name : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedCase !== null && CASE_STUDIES[selectedCase].content ? (
            CASE_STUDIES[selectedCase].content
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p style={{ fontFamily: f.sans, fontSize: "16px", color: f.white(0.45) }}>
                Full case study coming soon.
              </p>
              <p style={{ ...mono("11px"), color: f.white(0.2) }}>
                {selectedCase !== null ? CASE_STUDIES[selectedCase].outcome : ""}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deck;
