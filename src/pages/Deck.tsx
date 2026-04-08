import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DeckFrame from "@/components/deck/DeckFrame";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { useFrameReveal } from "@/hooks/useFrameReveal";
import { t } from "@/lib/theme";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TOTAL_FRAMES = 12;

/* ─── Aliases — pull from centralized theme ─── */
const f = {
  serif: t.serif,
  sans: t.sans,
  ink: t.ink,
  cream: t.cream,
  rule: t.rule,
};

const heading = t.heading;
const body = t.body;
const label = t.label;

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
const StatChip = ({ value, lbl }: { value: string; lbl: string }) => (
  <div className="flex flex-col px-4 py-3 rounded-lg" style={{ background: f.ink(0.9), border: "none" }}>
    <span style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 20px)", fontWeight: 700, color: f.cream }}>{value}</span>
    <span style={{ fontFamily: f.sans, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "4px", color: "hsl(40 30% 80%)" }}>{lbl}</span>
  </div>
);

const CASE_STUDIES: { name: string; issue: string; outcome: string; content: React.ReactNode | null }[] = [
  {
    name: "Clean Energy Workforce",
    issue: "Skilled trades bottleneck threatening federal climate policy",
    outcome: "40K reached, 4,000 workers registered, model now replicating nationally",
    content: (
      <div className="flex flex-col gap-6">
        <p style={{ fontFamily: f.sans, fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 700, color: f.ink(0.9), lineHeight: 1.4 }}>
          Closing the clean energy workforce gap through culture, coalitions, and deep organizing.
        </p>
        <div className="flex flex-col gap-4">
          {[
            { l: "Issue", text: "After major federal climate legislation, philanthropy focused on consumer adoption — heat pumps, solar, tax credits. Blind spot: not enough skilled workers to install any of it." },
            { l: "What the donors missed", text: "Workers already in trades loved their jobs — high pay, no student debt, AI-proof, portable. The public didn't know these careers existed. The issue wasn't lack of demand. It was that nobody had organized supply." },
            { l: "What we were asked to do", text: "Increase interest in skilled trades. Get people into jobs. Build a constituency of workers economically benefiting from the policy." },
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: f.serif, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.ink(0.55), lineHeight: 1.7 }}>
              <strong style={{ color: f.ink(0.85) }}>{item.l}:</strong> {item.text}
            </p>
          ))}
        </div>
        <div style={{ width: "40px", height: "1px", background: f.ink(0.1) }} />
        <div className="flex flex-col gap-4">
          {[
            { l: "Phase 1 — Research", text: "Interviewed funders, industry leaders, labor organizers, existing trades workers, the general public, and cultural experts." },
            { l: "Phase 2 — Coalition & cultural strategy", text: "Key finding: climate was not what motivated workers — pay, debt avoidance, and career stability were. This expanded the artist pool dramatically." },
            { l: "Phase 3 — Pilots", text: "Free concerts in four cities. Artists matched to each market via streaming data and voter files." },
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: f.serif, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.ink(0.55), lineHeight: 1.7 }}>
              <strong style={{ color: f.ink(0.85) }}>{item.l}.</strong> {item.text}
            </p>
          ))}
        </div>
        <div style={{ width: "40px", height: "1px", background: f.ink(0.1) }} />
        <div className="flex flex-wrap gap-3 mt-2">
          <StatChip value="40K" lbl="Reached" />
          <StatChip value="4,000" lbl="Registered" />
          <StatChip value="10–11%" lbl="Conversion Rate" />
          <StatChip value="$40–80" lbl="Cost per Lead" />
        </div>
        <p style={{ fontFamily: f.serif, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.ink(0.55), marginTop: "4px", lineHeight: 1.7 }}>
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
   DECK COMPONENT — v5 Anthropic-style audit
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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const focusDeck = () => { if (document.activeElement !== el) el.focus({ preventScroll: true }); };
    focusDeck();
    const focusTimer = window.setTimeout(focusDeck, 50);
    const handler = (e: KeyboardEvent) => {
      if (selectedCase !== null) return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT" || target?.isContentEditable) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); scrollToFrame(currentFrame + 1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); scrollToFrame(currentFrame - 1); }
      else if (e.key === "Escape") { navigate("/"); }
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("pointerdown", focusDeck);
    return () => { window.removeEventListener("keydown", handler); window.removeEventListener("pointerdown", focusDeck); window.clearTimeout(focusTimer); };
  }, [currentFrame, navigate, scrollToFrame, selectedCase]);

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
            if (nextFrame !== currentFrame) scrollToFrame(nextFrame);
          }
          accumulated = 0;
        }, 80);
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => { el.removeEventListener("wheel", handler); if (wheelTimeout) clearTimeout(wheelTimeout); };
  }, [selectedCase, currentFrame, scrollToFrame]);

  const setRef = (i: number) => (el: HTMLDivElement | null) => { frameRefs.current[i] = el; };

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

  const selectedPainDatas = PAIN_POINTS.filter((p) => selectedPains.includes(p.id));
  const activeDomainData = DOMAINS.find((d) => d.id === activeDomain);

  useEffect(() => {
    if (currentFrame !== 2) { setConfrontationStep(0); return; }
    const timer = setInterval(() => {
      setConfrontationStep((prev) => { if (prev >= CONFRONTATION_ROWS.length - 1) { clearInterval(timer); return prev; } return prev + 1; });
    }, 1800);
    return () => clearInterval(timer);
  }, [currentFrame]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label="Interactive deck"
      className="relative deck-scroll outline-none"
      style={{
        height: "100dvh",
        width: "100vw",
        overflowX: "auto",
        overflowY: "hidden",
        scrollSnapType: "x mandatory",
        display: "flex",
        flexDirection: "row",
        background: f.cream,
      }}
    >

      {/* ─── Fixed UI Chrome ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none" style={{ padding: "20px 28px" }}>
        <div className="flex items-center justify-between pointer-events-auto">
          <span style={{ fontFamily: f.sans, fontSize: "11px", letterSpacing: "0.08em", color: f.ink(0.35) }}>
            {String(currentFrame + 1).padStart(2, "0")} / {String(TOTAL_FRAMES).padStart(2, "0")}
          </span>
          <button
            onClick={() => navigate("/")}
            className="transition-colors duration-200"
            style={{ fontFamily: f.sans, fontSize: "11px", letterSpacing: "0.06em", color: f.ink(0.25), background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = f.ink(0.6))}
            onMouseLeave={(e) => (e.currentTarget.style.color = f.ink(0.25))}
          >
            ESC to exit
          </button>
        </div>
      </div>

      {/* ─── Fixed progress bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" style={{ padding: "0 0 16px 0" }}>
        <div style={{ margin: "0 28px", height: "2px", borderRadius: "1px", background: f.ink(0.06), overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${((currentFrame + 1) / TOTAL_FRAMES) * 100}%`,
              background: f.ink(0.25),
              borderRadius: "1px",
              transition: "width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 pointer-events-auto">
          <button
            onClick={() => scrollToFrame(currentFrame - 1)}
            disabled={currentFrame === 0}
            className="transition-colors duration-200"
            style={{ fontFamily: f.sans, fontSize: "11px", color: currentFrame === 0 ? f.ink(0.1) : f.ink(0.3), background: "none", border: "none", cursor: currentFrame === 0 ? "default" : "pointer" }}
            onMouseEnter={(e) => { if (currentFrame > 0) e.currentTarget.style.color = f.ink(0.6); }}
            onMouseLeave={(e) => { e.currentTarget.style.color = currentFrame === 0 ? f.ink(0.1) : f.ink(0.3); }}
          >
            ← Prev
          </button>
          <button
            onClick={() => scrollToFrame(currentFrame + 1)}
            disabled={currentFrame === TOTAL_FRAMES - 1}
            className="transition-colors duration-200"
            style={{ fontFamily: f.sans, fontSize: "11px", color: currentFrame === TOTAL_FRAMES - 1 ? f.ink(0.1) : f.ink(0.3), background: "none", border: "none", cursor: currentFrame === TOTAL_FRAMES - 1 ? "default" : "pointer" }}
            onMouseEnter={(e) => { if (currentFrame < TOTAL_FRAMES - 1) e.currentTarget.style.color = f.ink(0.6); }}
            onMouseLeave={(e) => { e.currentTarget.style.color = currentFrame === TOTAL_FRAMES - 1 ? f.ink(0.1) : f.ink(0.3); }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* ═══ FRAME 1: Hero ═══ */}
      <DeckFrame ref={setRef(0)} mode="wide">
        <div ref={r1.ref} className="flex flex-col items-start gap-12 min-h-[60vh] justify-center">
          <h1
            style={{
              ...r1.stagger(0),
              fontFamily: f.sans,
              fontSize: "clamp(36px, 5.5vw, 64px)",
              fontWeight: 700,
              color: f.ink(0.92),
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              animation: r1.isActive ? "deck-clip-reveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards" : "none",
            }}
          >
            Building a Next-Generation StratComm Portfolio
          </h1>
          <p
            style={{
              ...r1.stagger(1, 300),
              ...body(0.4),
              fontSize: "clamp(18px, 2.8vw, 32px)",
              fontWeight: 400,
              maxWidth: "700px",
              lineHeight: 1.4,
            }}
          >
            For donor advisors and program officers who know{" "}
            <em style={{ fontFamily: f.serif, fontStyle: "italic", color: f.ink(0.65) }}>your grantees could be hitting harder.</em>
          </p>
          <div
            style={{
              ...r1.stagger(2, 600),
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => scrollToFrame(1)}
              style={{
                fontFamily: f.sans,
                fontSize: "13px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: f.cream,
                background: f.ink(0.88),
                border: "none",
                padding: "16px 32px",
                borderRadius: "999px",
                transition: "transform 180ms ease, background 180ms ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = f.ink(1); }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = f.ink(0.88); }}
            >
              Start the walkthrough →
            </button>
            <span style={{ fontFamily: f.sans, fontSize: "12px", letterSpacing: "0.04em", color: f.ink(0.25) }}>
              5 min read · scroll or arrow keys
            </span>
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 2: Self-Diagnosis ═══ */}
      <DeckFrame ref={setRef(1)} mode="wide">
        <div ref={r2.ref} className="flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
            <p style={{ ...heading("clamp(28px, 4vw, 52px)"), fontWeight: 700, ...r2.stagger(0), maxWidth: "600px", flex: "0 0 auto" }}>
              What's getting in the way?
            </p>
            <p style={{ fontFamily: f.serif, fontSize: "clamp(18px, 2vw, 24px)", color: f.ink(0.85), lineHeight: 1.5, ...r2.stagger(1), maxWidth: "400px", flex: "0 0 auto" }}>
              These are the most common challenges we see in stratcomm portfolios. Select everything that resonates.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={r2.stagger(2, 100)}>
            {PAIN_POINTS.map((pain, i) => {
              const isSelected = selectedPains.includes(pain.id);
              return (
                <button
                  key={pain.id}
                  onClick={() => setSelectedPains(prev => isSelected ? prev.filter(p => p !== pain.id) : [...prev, pain.id])}
                  className="text-left"
                  style={{
                    padding: "28px 24px",
                    border: isSelected ? `1px solid ${f.ink(0.15)}` : `1px solid ${f.ink(0.06)}`,
                    background: isSelected ? f.ink(0.08) : "transparent",
                    borderRadius: "12px",
                    cursor: "pointer",
                    opacity: r2.isActive ? 1 : 0,
                    transform: r2.isActive ? "translateY(0)" : "translateY(10px)",
                    transition: `opacity 0.3s ease ${100 + i * 60}ms, transform 0.3s ease ${100 + i * 60}ms, background 0.15s ease, border 0.15s ease`,
                  }}
                >
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(15px, 1.8vw, 19px)", fontWeight: 700, color: f.ink(0.85), marginBottom: "8px" }}>
                    {pain.short}
                  </p>
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.ink(0.45), lineHeight: 1.6 }}>
                    {pain.detail}
                  </p>
                  {isSelected && (
                    <p
                      style={{
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: `1px solid ${f.ink(0.1)}`,
                        fontFamily: f.serif,
                        fontSize: "clamp(12px, 1.3vw, 14px)",
                        color: f.ink(0.5),
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
            <p style={{ ...label("9px"), ...r2.stagger(3, 800) }}>
              → or skip and keep scrolling
            </p>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 3: Confrontation ═══ */}
      <DeckFrame ref={setRef(2)} mode="full">
        <div ref={r3.ref}>
          <p style={{ ...heading("clamp(24px, 3.5vw, 40px)"), fontWeight: 700, ...r3.stagger(0), marginBottom: "48px", maxWidth: "700px" }}>
            Both sides have the same goal — shift opinion, force outcomes.{" "}
            <span style={{ color: f.ink(0.5) }}>Completely different processes.</span>
          </p>

          <div className="w-full">
            <div className="grid gap-0" style={{ gridTemplateColumns: "140px 1fr 1fr", borderBottom: `1px solid ${f.ink(0.08)}` }}>
              <div style={{ padding: "14px 20px" }} />
              <div style={{ ...label("10px"), padding: "14px 20px" }}>Your current portfolio</div>
              <div style={{ ...label("10px"), padding: "14px 20px", color: f.ink(0.6) }}>How the opposition operates</div>
            </div>

            {CONFRONTATION_ROWS.map((row, i) => {
              const isRevealed = r3.isActive && i <= confrontationStep;
              const isFocused = i === confrontationStep;
              return (
                <div
                  key={i}
                  className="grid gap-0 transition-all duration-700"
                  style={{
                    gridTemplateColumns: "140px 1fr 1fr",
                    borderBottom: i < CONFRONTATION_ROWS.length - 1 ? `1px solid ${f.ink(0.04)}` : "none",
                    opacity: isRevealed ? 1 : 0,
                    transform: isRevealed ? "translateX(0)" : "translateX(20px)",
                  }}
                >
                  <div style={{ padding: "18px 20px", fontFamily: f.sans, fontSize: "clamp(12px, 1.4vw, 15px)", fontWeight: 700, color: isFocused ? f.ink(0.8) : f.ink(0.35) }}>
                    {row.dimension}
                  </div>
                  <div style={{ padding: "18px 20px", fontFamily: f.serif, fontSize: "clamp(12px, 1.4vw, 15px)", color: f.ink(0.25), lineHeight: 1.7, textDecoration: "line-through", textDecorationColor: f.ink(0.12) }}>
                    {row.yours}
                  </div>
                  <div style={{
                    padding: "18px 20px",
                    fontFamily: f.serif,
                    fontSize: "clamp(12px, 1.4vw, 15px)",
                    color: isFocused ? f.ink(0.8) : f.ink(0.55),
                    lineHeight: 1.7,
                    transition: "all 0.5s ease",
                  }}>
                    {row.theirs}
                  </div>
                </div>
              );
            })}
          </div>

          {confrontationStep >= CONFRONTATION_ROWS.length - 1 && (
            <div className="mt-10 max-w-[600px]" style={{ opacity: 0, animation: "deck-fade-up 0.8s ease 600ms forwards" }}>
              <p style={{ ...body(0.5), paddingLeft: "16px" }}>
                You test messages in a petri dish and pay people to watch the winners.{" "}
                <span style={{ color: f.ink(0.8) }}>They skip the test tube — fund everything, watch what catches fire organically, and supercharge it.</span>
              </p>
            </div>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 4: Hallmarks ═══ */}
      <DeckFrame ref={setRef(3)} mode="wide">
        <div ref={r4.ref} className="flex flex-col lg:flex-row gap-16 w-full">
          <div className="lg:w-[35%] flex flex-col justify-center" style={r4.stagger(0)}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700 }}>
              Three hallmarks of portfolios{" "}
              <span style={{ color: f.ink(0.5) }}>actually producing results.</span>
            </p>
            {selectedPainDatas.length > 0 && (
              <p style={{ marginTop: "20px", fontFamily: f.serif, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.ink(0.45), lineHeight: 1.6, fontStyle: "italic" }}>
                You flagged: {selectedPainDatas.map(p => `"${p.short}"`).join(", ")} — each of these addresses that directly.
              </p>
            )}
          </div>

          <div className="lg:w-[65%] flex flex-col gap-4">
            {[
              { title: "They're using the full culture stack.", rationale: "Music, faith communities, digital creators, campuses, veteran groups, local media — organizing infrastructure, not comms channels.", help: "Connect you to every cultural sector you're missing, map which networks reach the audiences you need." },
              { title: "They're coordinating across sectors.", rationale: "Effective strategies have a policy pathway pre-engineered — industry, labor, grassroots, and culture lined up before any content goes live.", help: "Design multi-sector strategies where comms, policy, industry, labor, grassroots, and culture reinforce each other." },
              { title: "They're organizing for growth.", rationale: "Sustained base-building with trusted local leaders — not cycling the same people through the same events.", help: "Run live campaigns that engage new audiences. Audit grantees for real vs. performed organizing." },
            ].map((h, i) => {
              const isExpanded = expandedHallmark === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpandedHallmark(isExpanded ? null : i)}
                  className="text-left w-full transition-all duration-300"
                  style={{
                    padding: "28px 24px",
                    background: isExpanded ? f.ink(0.9) : "transparent",
                    border: isExpanded ? "none" : `1px solid ${f.ink(0.06)}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    opacity: r4.isActive ? 1 : 0,
                    transform: r4.isActive ? "translateY(0)" : "translateY(12px)",
                    transition: `all 0.5s ease ${200 + i * 150}ms`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span style={{ fontFamily: f.sans, fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 700, color: isExpanded ? "hsl(40 30% 70%)" : f.ink(0.15), minWidth: "32px" }}>{i + 1}</span>
                    <div className="flex-1">
                      <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 700, color: isExpanded ? f.cream : f.ink(0.65) }}>{h.title}</p>
                      <div style={{ maxHeight: isExpanded ? "300px" : "0", overflow: "hidden", transition: "max-height 0.5s ease, opacity 0.4s ease", opacity: isExpanded ? 1 : 0 }}>
                        <p style={{ fontFamily: f.serif, fontSize: "clamp(12px, 1.3vw, 14px)", color: "hsl(40 30% 80%)", marginTop: "12px", lineHeight: 1.7 }}>{h.rationale}</p>
                        <p style={{ marginTop: "12px", fontFamily: f.serif, fontSize: "clamp(12px, 1.3vw, 14px)", color: "hsl(40 30% 75%)", lineHeight: 1.6, fontStyle: "italic" }}>How we help: {h.help}</p>
                      </div>
                    </div>
                    <ChevronDown size={16} style={{ color: isExpanded ? f.cream : f.ink(0.2), transition: "transform 0.3s ease, color 0.3s ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", flexShrink: 0, marginTop: "4px" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 5: Three Service Domains ═══ */}
      <DeckFrame ref={setRef(4)} mode="full">
        <div ref={r5.ref} className="flex flex-col gap-0 w-full">
          <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700, ...r5.stagger(0), marginBottom: "12px" }}>
            Three domains. One integrated system.
          </p>
          <p style={{ ...body(0.4), ...r5.stagger(1), marginBottom: "40px", maxWidth: "500px" }}>
            Click any domain to explore what it means for your portfolio.
          </p>

          <div className="flex w-full gap-3 mb-1">
            {DOMAINS.map((d, i) => {
              const isActive = activeDomain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDomain(isActive ? null : d.id)}
                  className="flex-1 text-left transition-all duration-300"
                  style={{
                    padding: "24px 20px",
                    background: isActive ? f.ink(0.9) : "transparent",
                    borderBottom: isActive ? `2px solid ${f.ink(0.8)}` : `2px solid ${f.ink(0.06)}`,
                    borderRadius: "12px 12px 0 0",
                    cursor: "pointer",
                    opacity: r5.isActive ? 1 : 0,
                    transform: r5.isActive ? "translateY(0)" : "translateY(12px)",
                    transition: `all 0.5s ease ${300 + i * 150}ms`,
                  }}
                >
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 2.2vw, 24px)", fontWeight: 700, color: isActive ? f.cream : f.ink(0.45) }}>{d.title}</p>
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(11px, 1.2vw, 14px)", color: isActive ? "hsl(40 30% 75%)" : f.ink(0.3), marginTop: "4px", lineHeight: 1.5 }}>{d.tagline}</p>
                </button>
              );
            })}
          </div>

          {activeDomainData && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full overflow-hidden"
              style={{ animation: "deck-fade-up 0.5s ease forwards", background: f.ink(0.9), borderRadius: "0 0 12px 12px" }}
            >
              <div style={{ padding: "32px 28px", borderRight: `1px solid ${f.ink(0.8)}` }}>
                <span style={{ fontFamily: f.sans, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "12px", color: "hsl(40 30% 65%)" }}>What it is</span>
                <p style={{ fontFamily: f.serif, fontSize: "clamp(14px, 1.6vw, 17px)", color: "hsl(40 30% 80%)", lineHeight: 1.7 }}>{activeDomainData.what}</p>
                <span style={{ fontFamily: f.sans, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginTop: "24px", marginBottom: "12px", color: "hsl(40 30% 65%)" }}>What it unlocks</span>
                <p style={{ fontFamily: f.serif, fontSize: "clamp(14px, 1.6vw, 17px)", color: "hsl(40 30% 80%)", lineHeight: 1.7 }}>{activeDomainData.unlocks}</p>
              </div>
              <div style={{ padding: "32px 28px" }}>
                <span style={{ fontFamily: f.sans, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "12px", color: "hsl(40 30% 65%)" }}>What donor advisors usually miss</span>
                <p style={{ fontFamily: f.serif, fontSize: "clamp(14px, 1.6vw, 17px)", color: "hsl(40 30% 80%)", lineHeight: 1.7 }}>{activeDomainData.missed}</p>
                <span style={{ fontFamily: f.sans, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginTop: "24px", marginBottom: "12px", color: "hsl(40 30% 65%)" }}>Example</span>
                <p style={{ fontFamily: f.serif, fontSize: "clamp(14px, 1.6vw, 17px)", color: "hsl(40 30% 75%)", lineHeight: 1.7, fontStyle: "italic" }}>{activeDomainData.example}</p>
              </div>
            </div>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 6: Capabilities ═══ */}
      <DeckFrame ref={setRef(5)} mode="wide">
        <div ref={r6.ref} className="flex flex-col gap-8">
          <p style={{ ...heading("clamp(24px, 3vw, 40px)"), fontWeight: 700, ...r6.stagger(0) }}>
            How people typically engage with us.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="transition-all duration-300"
                style={{
                  padding: "28px 24px",
                  borderTop: `1px solid ${f.ink(0.06)}`,
                  opacity: r6.isActive ? 1 : 0,
                  transform: r6.isActive ? "translateY(0)" : "translateY(12px)",
                  transition: `all 0.5s ease ${200 + i * 100}ms`,
                }}
              >
                <p style={{ fontFamily: f.sans, fontSize: "clamp(15px, 1.8vw, 19px)", fontWeight: 700, color: f.ink(0.8), marginBottom: "8px" }}>{cap.title}</p>
                <p style={{ fontFamily: f.serif, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.ink(0.55), lineHeight: 1.8 }}>{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 7: Impact Measurement ═══ */}
      <DeckFrame ref={setRef(6)} mode="wide">
        <div ref={r7.ref} className="flex flex-col lg:flex-row gap-16 w-full">
          <div className="lg:w-[40%] flex flex-col justify-center" style={r7.stagger(0)}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700 }}>
              Most grantee reports measure activity.{" "}
              <span style={{ color: f.ink(0.4) }}>We measure power.</span>
            </p>
            <p style={{ ...r7.stagger(1, 600), marginTop: "24px", fontFamily: f.serif, fontSize: "clamp(13px, 1.6vw, 17px)", color: f.ink(0.55), fontStyle: "italic", lineHeight: 1.7 }}>
              A campaign with 73 million views that doesn't convene a single new partner, catalyze a single policy conversation, or unlock a single dollar — that campaign failed.
            </p>
          </div>

          <div className="lg:w-[60%]">
            <div className="grid grid-cols-2 gap-0" style={{ borderBottom: `1px solid ${f.ink(0.08)}` }}>
              <div style={{ ...label("10px"), padding: "14px 20px" }}>What most grantees report</div>
              <div style={{ ...label("10px"), padding: "14px 20px", color: f.ink(0.6) }}>What we track</div>
            </div>
            {METRICS_ROWS.map((row, i) => {
              const delay = 300 + i * 200;
              return (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-0"
                  style={{
                    borderBottom: i < METRICS_ROWS.length - 1 ? `1px solid ${f.ink(0.04)}` : "none",
                    opacity: r7.isActive ? 1 : 0,
                    transform: r7.isActive ? "translateX(0)" : "translateX(12px)",
                    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
                  }}
                >
                  <div style={{ padding: "16px 20px", fontFamily: f.serif, fontSize: "clamp(12px, 1.4vw, 15px)", color: f.ink(0.25), lineHeight: 1.6, textDecoration: r7.isActive ? "line-through" : "none", textDecorationColor: f.ink(0.15) }}>{row.left}</div>
                  <div style={{ padding: "16px 20px", fontFamily: f.serif, fontSize: "clamp(12px, 1.4vw, 15px)", color: f.ink(0.7), lineHeight: 1.6 }}>{row.right}</div>
                </div>
              );
            })}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 8: Working Together ═══ */}
      <DeckFrame ref={setRef(7)} mode="wide">
        <div ref={r8.ref} className="flex flex-col gap-8 w-full">
          <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700, ...r8.stagger(0) }}>How do you want to start?</p>

          <div className="flex flex-col sm:flex-row gap-4 w-full" style={r8.stagger(1, 200)}>
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
                  className="flex-1 text-left transition-all duration-300"
                  style={{
                    padding: "32px 28px",
                    border: isSelected ? "none" : `1px solid ${f.ink(0.06)}`,
                    background: isSelected ? f.ink(0.9) : "transparent",
                    borderRadius: "12px",
                    opacity: isDimmed ? 0.4 : 1,
                    cursor: "pointer",
                  }}
                >
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(17px, 2.2vw, 24px)", fontWeight: 700, color: isSelected ? f.cream : f.ink(0.55), marginBottom: "8px" }}>{path.title}</p>
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(13px, 1.5vw, 15px)", color: isSelected ? "hsl(40 30% 80%)" : f.ink(0.4), lineHeight: 1.7 }}>{path.desc}</p>
                </button>
              );
            })}
          </div>

          {engagementPath === "fresh" && (
            <div className="flex flex-col lg:flex-row gap-4 w-full" style={{ animation: "deck-fade-up 0.6s ease forwards" }}>
              {[
                { phase: "Phase 1", title: "Internal Review", time: "4–6 weeks", bullets: ["Go through everything — grantees, systems, assumptions, goals.", "Voice-track what's been funded and where things feel stuck.", "Identify the gap between where you are and where you need to be."], output: "Diagnostic — here's what we're hearing, here's the delta, here's the plan." },
                { phase: "Phase 2", title: "External Engagement", time: "6–8 weeks", bullets: ["Interview existing grantees. Flag what should concern you.", "Map cultural infrastructure you're not using.", "Introduce partners from sectors you haven't accessed."], output: "Actionable roadmap — restructured strategy, evaluation rubric, introduction list." },
              ].map((p, pi) => (
                <div key={pi} className="flex-1" style={{ padding: "28px 24px", background: f.ink(0.9), borderRadius: "12px" }}>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span style={{ fontFamily: f.sans, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(40 30% 65%)" }}>{p.phase}</span>
                    <span style={{ fontFamily: f.sans, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 700, color: f.cream }}>{p.title}</span>
                    <span style={{ fontFamily: f.sans, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(40 30% 60%)" }}>{p.time}</span>
                  </div>
                  {p.bullets.map((b, i) => (
                    <p key={i} style={{ fontFamily: f.serif, fontSize: "clamp(12px, 1.3vw, 14px)", color: "hsl(40 30% 80%)", marginBottom: "6px", paddingLeft: "12px", lineHeight: 1.7 }}>{b}</p>
                  ))}
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(12px, 1.3vw, 14px)", color: "hsl(40 30% 75%)", marginTop: "12px", lineHeight: 1.7 }}>
                    <strong style={{ color: f.cream }}>Output:</strong> {p.output}
                  </p>
                </div>
              ))}
            </div>
          )}

          {engagementPath === "experienced" && (
            <div className="w-full" style={{ animation: "deck-fade-up 0.6s ease forwards", padding: "28px 24px", background: f.ink(0.9), borderRadius: "12px" }}>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 700, color: f.cream, marginBottom: "12px" }}>Custom scope, fast start.</p>
              <p style={{ fontFamily: f.serif, fontSize: "clamp(13px, 1.5vw, 15px)", color: "hsl(40 30% 80%)", lineHeight: 1.7, maxWidth: "600px" }}>We skip the discovery and go straight to what you need — access, introductions, strategy pressure-testing, grantee evaluation, or campaign execution. Scoped to your timeline and budget.</p>
            </div>
          )}

          {engagementPath && (
            <div className="flex flex-col sm:flex-row gap-4 w-full" style={{ animation: "deck-fade-up 0.6s ease 300ms forwards", opacity: 0 }}>
              {[
                { lbl: "Option A", title: "Strategic Advisory Retainer", desc: "Ongoing partnership. We stay embedded as a sounding board, connector, and diagnostic resource. Monthly cadence, quarterly reviews, direct access." },
                { lbl: "Option B", title: "Transition to Independence", desc: "We hand over the playbook, train your team, and step back. You keep the frameworks, the network, and the knowledge." },
              ].map((opt, i) => (
                <div key={i} className="flex-1 transition-all duration-300" style={{ padding: "28px 24px", borderTop: `1px solid ${f.ink(0.06)}` }}>
                  <span style={{ ...label("10px"), color: f.ink(0.35) }}>{opt.lbl}</span>
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 700, color: f.ink(0.8), marginTop: "8px", marginBottom: "8px" }}>{opt.title}</p>
                  <p style={{ fontFamily: f.serif, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.ink(0.55), lineHeight: 1.8 }}>{opt.desc}</p>
                </div>
              ))}
            </div>
          )}

          {!engagementPath && (
            <p style={{ ...label("9px"), ...r8.stagger(2, 600) }}>↑ Choose a path to see the process</p>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 9: Who We Are ═══ */}
      <DeckFrame ref={setRef(8)} mode="wide">
        <div ref={r9.ref} className="flex flex-col lg:flex-row gap-16 w-full">
          <div className="lg:w-[45%] flex flex-col justify-center">
            <p style={{ ...r9.stagger(0), fontFamily: f.sans, fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, color: f.ink(0.9), lineHeight: 1.3 }}>
              We've been where you are.
            </p>
            <p style={{ fontFamily: f.serif, fontSize: "clamp(14px, 1.6vw, 17px)", color: f.ink(0.55), lineHeight: 1.8, ...r9.stagger(1, 300), marginTop: "20px", maxWidth: "400px" }}>
              Our team is built from careers in <strong style={{ color: f.ink(0.8) }}>commercial media and entertainment</strong> — the industries your grantees are trying to reach.
            </p>
            <p style={{ fontFamily: f.serif, fontSize: "clamp(14px, 1.6vw, 17px)", color: f.ink(0.55), lineHeight: 1.8, ...r9.stagger(2, 600), marginTop: "12px", maxWidth: "400px" }}>
              What's holding most donor advisors back isn't effort — it's <strong style={{ color: f.ink(0.8) }}>access and pattern recognition</strong> across these industries. That's what we transfer.
            </p>
          </div>

          <div className="lg:w-[55%] grid grid-cols-2 md:grid-cols-3 gap-4">
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
                className="transition-all duration-300"
                style={{
                  padding: "20px 16px",
                  borderTop: `1px solid ${f.ink(0.06)}`,
                  opacity: r9.isActive ? 1 : 0,
                  transform: r9.isActive ? "translateY(0)" : "translateY(8px)",
                  transition: `all 0.5s ease ${400 + i * 100}ms`,
                }}
              >
                <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 17px)", fontWeight: 700, color: f.ink(0.7), marginBottom: "6px" }}>{s.name}</p>
                <p style={{ fontFamily: f.serif, fontSize: "clamp(11px, 1.2vw, 13px)", color: f.ink(0.4), lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 10: The Promise ═══ */}
      <DeckFrame ref={setRef(9)} mode="narrow">
        <div ref={r10.ref} className="flex flex-col gap-8 items-center text-center">
          <p style={{ ...r10.stagger(0), fontFamily: f.sans, fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 700, color: f.ink(0.9), lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Everything we know becomes everything you know.
          </p>
          <div style={{ ...r10.stagger(1, 400), width: "40px", height: "1px", background: f.ink(0.1) }} />
          <p style={{ ...r10.stagger(2, 600), fontFamily: f.serif, fontSize: "clamp(15px, 2vw, 21px)", color: f.ink(0.55), lineHeight: 1.8, maxWidth: "560px" }}>
            Strategic communications is expansive and powerful, but it's completely learnable. If you work with us, you'll learn how to do this yourself. That's not a risk to our business — it's the entire point.
          </p>
          {selectedPainDatas.length > 0 && (
            <p style={{ ...r10.stagger(3, 900), fontFamily: f.serif, fontSize: "clamp(13px, 1.5vw, 16px)", color: f.ink(0.45), lineHeight: 1.6, fontStyle: "italic", maxWidth: "480px" }}>
              {selectedPainDatas.map(p => `"${p.short}"`).join(", ")} — we've seen it all before. We know how to fix it. And we'll show you how.
            </p>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 11: CTA + Proof ═══ */}
      <DeckFrame ref={setRef(10)} mode="wide">
        <div ref={r11.ref} className="flex flex-col lg:flex-row gap-16 w-full">
          <div className="lg:w-[40%] flex flex-col justify-center" style={r11.stagger(0)}>
            <h2 style={{ fontFamily: f.sans, fontSize: "clamp(32px, 4.5vw, 60px)", fontWeight: 700, color: f.ink(0.9), letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "16px" }}>
              VGC StratComm
            </h2>
            <p style={{ fontFamily: f.serif, fontSize: "clamp(15px, 2vw, 21px)", color: f.ink(0.55), lineHeight: 1.7, marginBottom: "28px" }}>
              Let's look at your portfolio together.
            </p>
            <a
              href="mailto:info@vgcstratcomm.com"
              className="inline-block"
              style={{
                fontFamily: f.sans,
                fontSize: "13px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: f.cream,
                background: f.ink(0.88),
                padding: "16px 36px",
                borderRadius: "999px",
                textDecoration: "none",
                textAlign: "center",
                transition: "background 300ms, transform 180ms",
                maxWidth: "200px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = f.ink(1); e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = f.ink(0.88); e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Get in touch
            </a>
          </div>

          <div className="lg:w-[60%]">
            <p style={{ ...label("10px"), marginBottom: "16px", ...r11.stagger(1, 200) }}>Selected case work</p>
            <div className="grid grid-cols-2 gap-3">
              {CASE_STUDIES.map((cs, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCase(i)}
                  className="text-left transition-all duration-300"
                  style={{
                    padding: "16px 14px",
                    background: cs.content ? f.ink(0.9) : "transparent",
                    border: cs.content ? "none" : `1px solid ${f.ink(0.06)}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    opacity: r11.isActive ? 1 : 0,
                    transform: r11.isActive ? "translateY(0)" : "translateY(8px)",
                    transition: `all 0.4s ease ${300 + i * 60}ms`,
                  }}
                  onMouseEnter={(e) => { if (!cs.content) { e.currentTarget.style.borderColor = f.ink(0.15); } }}
                  onMouseLeave={(e) => { if (!cs.content) { e.currentTarget.style.borderColor = f.ink(0.06); } }}
                >
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", fontWeight: 700, color: cs.content ? f.cream : f.ink(0.35), marginBottom: "4px" }}>{cs.name}</p>
                  <p style={{ fontFamily: f.sans, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: "1.4", color: cs.content ? "hsl(40 30% 70%)" : f.ink(0.2) }}>{cs.outcome}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 12: Spacer ═══ */}
      <DeckFrame ref={setRef(11)}>
        <div className="flex flex-col items-center text-center gap-6">
          <p style={{ ...label("10px") }}>← Scroll back to explore</p>
          <h2 style={{ fontFamily: f.sans, fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 700, color: f.ink(0.06), letterSpacing: "-0.02em" }}>VGC StratComm</h2>
        </div>
      </DeckFrame>

      {/* Case Study Lightbox */}
      <Dialog open={selectedCase !== null} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{ background: f.cream, border: `1px solid ${f.ink(0.08)}` }}
        >
          <DialogHeader>
            <DialogTitle style={{ fontFamily: f.sans, fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 700, color: f.ink(0.9) }}>
              {selectedCase !== null ? CASE_STUDIES[selectedCase].name : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedCase !== null && CASE_STUDIES[selectedCase].content ? (
            CASE_STUDIES[selectedCase].content
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p style={{ fontFamily: f.sans, fontSize: "16px", color: f.ink(0.5) }}>Full case study coming soon.</p>
              <p style={{ ...label("11px") }}>{selectedCase !== null ? CASE_STUDIES[selectedCase].outcome : ""}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deck;
