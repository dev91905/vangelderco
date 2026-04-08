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
  sg: "'Space Grotesk', sans-serif",
  jb: "'JetBrains Mono', monospace",
  red: "hsl(0 80% 48%)",
  white: (a: number) => `hsl(0 0% 100% / ${a})`,
  redA: (a: number) => `hsl(0 80% 48% / ${a})`,
};

const heading = (size = "clamp(18px, 2.6vw, 28px)"): CSSProperties => ({
  fontFamily: f.sg,
  fontSize: size,
  fontWeight: 400,
  color: f.white(0.85),
  lineHeight: 1.45,
});

const body = (alpha = 0.45): CSSProperties => ({
  fontFamily: f.sg,
  fontSize: "clamp(13px, 1.5vw, 16px)",
  color: f.white(alpha),
  lineHeight: 1.65,
});

const mono = (size = "9px"): CSSProperties => ({
  fontFamily: f.jb,
  fontSize: size,
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
});

/* ─── Case Study Data ─── */
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
        <p style={{ fontFamily: f.sg, fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 500, color: f.white(0.95), lineHeight: 1.4 }}>
          Closing the clean energy workforce gap through culture, coalitions, and deep organizing.
        </p>
        <div className="flex flex-col gap-4">
          {[
            { label: "Issue", text: "After major federal climate legislation, philanthropy focused on consumer adoption — heat pumps, solar, tax credits. Blind spot: not enough skilled workers to install any of it. For every electrician leaving, only one was replacing them. A bottleneck was forming that could turn into a political liability — not enough workers becomes this policy is failing." },
            { label: "What the donors missed", text: "Workers already in trades loved their jobs — high pay, no student debt, AI-proof, portable. The public didn't know these careers existed. The issue wasn't lack of demand. It was that nobody had organized supply." },
            { label: "What we were asked to do", text: "Increase interest in skilled trades. Get people into jobs. Build a constituency of workers economically benefiting from the policy. Test whether that could create durable public support that crosses party lines." },
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: f.sg, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.white(0.45), lineHeight: 1.7 }}>
              <strong style={{ color: f.white(0.9) }}>{item.label}:</strong> {item.text}
            </p>
          ))}
        </div>
        <div style={{ width: "40px", height: "1px", background: f.redA(0.3) }} />
        <div className="flex flex-col gap-4">
          {[
            { label: "Phase 1 — Research", text: "Interviewed funders, industry leaders, labor organizers, existing trades workers, the general public, and cultural experts across music, digital, radio, and news." },
            { label: "Phase 2 — Coalition & cultural strategy", text: "Briefed senior government officials alongside talent agencies. Key finding: climate was not what motivated workers — pay, debt avoidance, and career stability were. This expanded the artist pool dramatically. Country, hip-hop, and digital creators who would never engage a climate campaign were now in. Built a working coalition across industry, labor, government, community organizations, nonprofits, and cultural sectors." },
            { label: "Phase 3 — Pilots", text: "Free concerts in four cities. Artists matched to each market via streaming data and voter files. Communities came to learn about careers and signed up for jobs as a form of mass action." },
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: f.sg, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.white(0.45), lineHeight: 1.7 }}>
              <strong style={{ color: f.white(0.9) }}>{item.label}.</strong> {item.text}
            </p>
          ))}
        </div>
        <div style={{ width: "40px", height: "1px", background: f.redA(0.3) }} />
        <div className="flex flex-col gap-3">
          <p style={{ fontFamily: f.sg, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.white(0.7), lineHeight: 1.7 }}>
            <strong style={{ color: f.white(0.9) }}>Every lever activated — at the same time:</strong>
          </p>
          {[
            "National artists. Local radio. Local digital creators. Targeted digital ads.",
            "Whisper campaigns leaked to artist fan bases in high schools — 25% of one event filled before it was announced.",
            "Local news, blogs, and national media covering it.",
            "Spotify push notifications to fans. Google integrating events into search results.",
          ].map((line, i) => (
            <p key={i} style={{ fontFamily: f.sg, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.white(0.45), lineHeight: 1.7, paddingLeft: "12px", borderLeft: `1px solid ${f.redA(0.2)}` }}>
              {line}
            </p>
          ))}
          <p style={{ fontFamily: f.sg, fontSize: "clamp(13px, 1.5vw, 15px)", fontStyle: "italic", color: f.white(0.6), marginTop: "8px" }}>
            This wasn't an op-ed and a digital ad. It was every available channel firing simultaneously.
          </p>
        </div>
        <div style={{ width: "40px", height: "1px", background: f.redA(0.3) }} />
        <div className="flex flex-wrap gap-4 mt-2">
          <StatChip value="40K" label="Reached" />
          <StatChip value="4,000" label="Registered" />
          <StatChip value="10–11%" label="Conversion Rate" />
          <StatChip value="$40–80" label="Cost per Lead" />
        </div>
        <p style={{ fontFamily: f.sg, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.white(0.5), marginTop: "4px" }}>
          Pilot data informed local workforce policy. Capital unlocked from community foundations and new donors. Governor's and mayor's offices engaged directly. White House held briefings on the model. The coalition is now applying it to deep community organizing, permitting, and other issues beyond job recruitment.
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

/* ─── Comparison table rows ─── */
const COMPARISON_ROWS = [
  { step: "Research", left: "Focus groups to test messages", right: "Monitor what's already resonating organically" },
  { step: "Content", left: "Polished ads, op-eds, documentaries", right: "Entire creator ecosystems, talent pipelines, and self-funded investigative journalism — content around the clock" },
  { step: "Distribution", left: "Buy placements on platforms", right: "Acquire the platforms and change the algorithms" },
  { step: "Engagement", left: "Pay handfuls of influencers to post", right: "Organize at massive scale — churches, campuses, veteran groups, local networks" },
  { step: "Measurement", left: "Count impressions and report reach", right: "Track what's shifting polls, moving legislation, growing their base" },
  { step: "Iteration", left: "Declare success and fund the next one", right: "Cut what's failing, pour resources into what's working" },
];

const METRICS_ROWS = [
  { left: "Impressions and reach", right: "New sectors at the table" },
  { left: "Video views (3-second scroll-bys)", right: "Decision-makers convened" },
  { left: "Media mentions", right: "Coalition growth — expanding or static?" },
  { left: "Social engagement", right: "Policy outcomes — legislation, executive action, regulation" },
  { left: "Website traffic", right: "Capital unlocked from new sources" },
  { left: '"Awareness"', right: "Infrastructure that outlasts the campaign" },
];

/* ═══════════════════════════════════════════════════════════════
   DECK COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const Deck = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const lastFrameRef = useRef(0);
  const { playHoverGlitch } = useGlitchSFX();
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  // Hallmark accordion state
  const [expandedHallmark, setExpandedHallmark] = useState<number | null>(null);

  // Fork hover state
  const [hoveredFork, setHoveredFork] = useState<"a" | "b" | null>(null);

  // Frame observation for currentFrame tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    frameRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setCurrentFrame(i);
        },
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
    const handler = (e: KeyboardEvent) => {
      if (selectedCase !== null) return;
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
    return () => window.removeEventListener("keydown", handler);
  }, [currentFrame, navigate, scrollToFrame, selectedCase]);

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

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-background"
      style={{
        height: "100dvh",
        overflowY: "auto",
        overflowX: "hidden",
        scrollSnapType: "y mandatory",
      }}
    >
      {/* Breathing red glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 -z-0"
        style={{
          width: "min(80vw, 700px)",
          height: "min(80vh, 600px)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${f.redA(0.12)} 0%, ${f.redA(0.06)} 30%, ${f.redA(0.02)} 55%, transparent 80%)`,
          animation: "breathe 8s ease-in-out infinite",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Scan beam */}
      <div
        className="pointer-events-none fixed left-0 z-20 w-full"
        style={{
          height: "1px",
          background: `linear-gradient(90deg, transparent 0%, ${f.white(0.06)} 20%, ${f.white(0.06)} 80%, transparent 100%)`,
          animation: "scan-beam 7s linear infinite",
        }}
      />

      {/* Corner brackets */}
      <svg className="fixed top-4 left-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M1 8V1h7" /></svg>
      <svg className="fixed top-4 right-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M23 8V1h-7" /></svg>
      <svg className="fixed bottom-4 left-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M1 16v7h7" /></svg>
      <svg className="fixed bottom-4 right-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M23 16v7h-7" /></svg>

      {/* Progress dots — right side nav */}
      <nav
        className="fixed right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2"
        aria-label="Slide navigation"
      >
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
                background: currentFrame === i ? f.red : f.white(0.2),
                boxShadow: currentFrame === i ? `0 0 8px ${f.redA(0.5)}` : "none",
              }}
            />
          </button>
        ))}
      </nav>

      {/* Frame counter HUD */}
      <div className="fixed bottom-8 right-8 z-30" style={{ ...mono("11px"), color: f.white(0.25) }}>
        {String(currentFrame + 1).padStart(2, "0")} / {String(TOTAL_FRAMES).padStart(2, "0")}
      </div>

      {/* ESC hint */}
      <div className="fixed top-8 right-8 z-30" style={{ ...mono("9px"), color: f.white(0.15) }}>
        ESC to exit
      </div>

      {/* ═══ FRAME 1: Title ═══ */}
      <DeckFrame ref={setRef(0)}>
        <div ref={r1.ref} className="flex flex-col items-center text-center gap-6">
          <h1
            style={{
              ...r1.stagger(0),
              fontFamily: f.sg,
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 500,
              color: f.white(1),
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              animation: r1.isActive ? "deck-clip-reveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards" : "none",
            }}
          >
            VGC StratComm
          </h1>
          <div style={{ ...r1.stagger(1), width: "40px", height: "1px", background: f.redA(0.6) }} />
          <p
            style={{
              ...r1.stagger(2, 200),
              fontFamily: f.sg,
              fontSize: "clamp(16px, 2.2vw, 24px)",
              fontWeight: 400,
              color: f.white(0.7),
              lineHeight: 1.5,
              maxWidth: "600px",
            }}
          >
            Strategic communications for donor advisors and program officers who need <em style={{ fontStyle: "italic", color: f.white(0.9) }}>more than comms.</em>
          </p>
          <p
            style={{
              ...r1.stagger(3, 400),
              fontFamily: f.sg,
              fontSize: "clamp(13px, 1.6vw, 17px)",
              fontWeight: 400,
              color: f.white(0.4),
              lineHeight: 1.55,
              maxWidth: "520px",
            }}
          >
            Advice, connections, and hands-on support to make your stratcomm strategy actually work.
          </p>
          {/* Scroll hint */}
          <div
            style={{
              ...r1.stagger(4, 1200),
              marginTop: "32px",
            }}
          >
            <span
              style={{
                ...mono("8px"),
                color: f.white(0.2),
                animation: "deck-scroll-hint 2s ease-in-out infinite",
                display: "block",
              }}
            >
              ↓ scroll
            </span>
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 2: The Problem ═══ */}
      <DeckFrame ref={setRef(1)} label="The Problem">
        <div ref={r2.ref} className="flex flex-col gap-8">
          <p style={{ ...heading(), ...r2.stagger(0) }}>
            Common problems for anyone overseeing a stratcomm portfolio.
          </p>
          <div className="flex flex-col gap-1">
            {[
              { n: 1, title: "No institutional memory.", desc: "No record of what was funded, why, or what it produced. Grants renewed because they've always been renewed." },
              { n: 2, title: "No decision-making framework.", desc: "No structure for evaluating new proposals. The default is inertia." },
              { n: 3, title: "No access beyond the usual channels.", desc: "Grantees rely on comms firms, paid media, op-eds, and documentaries. Entire cultural sectors — music, digital creators, faith communities, veteran groups, campuses — sit untouched." },
              { n: 4, title: "No real impact measurement.", desc: "Grantees report views and impressions. No framework connecting spend to policy outcomes, coalition growth, or anything durable." },
              { n: 5, title: "No one on the team comes from media.", desc: "When leadership asks why the strategy isn't translating into results, it's hard to diagnose without experience inside the sectors you're trying to activate." },
            ].map((p, i) => (
              <NumberedProblem key={i} n={p.n} title={p.title} desc={p.desc} style={r2.stagger(i + 1, 100)} />
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 3: What You're Up Against ═══ */}
      <DeckFrame ref={setRef(2)} label="What You're Up Against">
        <div ref={r3.ref} className="flex flex-col gap-8">
          <p style={{ ...heading(), ...r3.stagger(0) }}>
            Both sides of every issue have the same goal — shift public opinion and force policy outcomes. They're running completely different processes to get there.
          </p>
          <AnimatedComparisonRows rows={COMPARISON_ROWS} isActive={r3.isActive} />
          <div className="flex flex-col gap-4 mt-2" style={r3.stagger(8, 800)}>
            <p style={body()}>
              You test messages in a petri dish and pay people to watch the winners. Facebook counts a <strong style={{ color: f.white(0.8) }}>three-second scroll-by</strong> as a view.
            </p>
            <p style={body()}>
              They skip the test tube — fund everything, watch what catches fire organically, and supercharge it.
            </p>
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 4: What Effective Portfolios Have in Common ═══ */}
      <DeckFrame ref={setRef(3)} label="Effective Portfolios">
        <div ref={r4.ref} className="flex flex-col gap-8">
          <p style={{ ...heading(), ...r4.stagger(0) }}>
            Three hallmarks across portfolios that are actually producing results.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            {[
              {
                title: "They're using the full culture stack.",
                rationale: "Music, faith communities, digital creators, campuses, veteran groups, local media — organizing infrastructure, not comms channels. If a portfolio is only in news and documentary, the most powerful levers aren't being touched.",
                help: "Connect you to every cultural sector you're missing, map which networks reach the audiences you need, and integrate them into your strategy from the start.",
              },
              {
                title: "They're coordinating across sectors.",
                rationale: "Effective strategies have a policy pathway pre-engineered — industry, labor, grassroots, and culture lined up before any content goes live. Grantees in silos can't deliver durable outcomes alone.",
                help: "Design multi-sector strategies where comms, policy, industry, labor, grassroots, and culture reinforce each other. We get everyone to the table and make sure every partner knows their role.",
              },
              {
                title: "They're organizing for growth.",
                rationale: "Sustained base-building with trusted local leaders — not cycling the same people through the same events. That growing base is the power everyone needs to win and protect the win.",
                help: "Run live campaigns that engage new audiences. Identify emerging leaders. Audit grantees for real vs. performed organizing and restructure around what's producing power.",
              },
            ].map((h, i) => (
              <ExpandableHallmark
                key={i}
                index={i}
                title={h.title}
                rationale={h.rationale}
                help={h.help}
                isExpanded={expandedHallmark === i}
                onToggle={() => setExpandedHallmark(expandedHallmark === i ? null : i)}
                style={r4.stagger(i + 1, 100)}
              />
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 5: Core Capabilities ═══ */}
      <DeckFrame ref={setRef(4)} label="Core Capabilities">
        <div ref={r5.ref} className="flex flex-col gap-8">
          <p style={{ ...heading(), ...r5.stagger(0) }}>
            How people typically engage with us.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Portfolio Audit", desc: "Deep dive into your grantees, past investments, and records. We interview grantees directly. You get the institutional record that's never existed." },
              { title: "Strategic Framework", desc: "Customized decision-making rubric for evaluating grants against strategy, not inertia. A tool your team owns and uses independently." },
              { title: "Impact Measurement", desc: "Co-designed around your objectives. Real indicators of power — sectors convened, policy outcomes, capital unlocked — replacing vanity metrics." },
              { title: "Access & Introductions", desc: "Cultural operatives across music, film/TV, digital, news. Co-funders, strategic partners. A 480-member network for confidential intel-sharing." },
              { title: "Program Development", desc: "When the work surfaces a gap, we help build what doesn't exist — coalition, campaign, cultural activation, grant competition, or fund." },
              { title: "Training", desc: "No dependency. You learn to evaluate cultural landscapes, run multi-sector campaigns, and tell real organizing from performed. If we do our jobs right, you won't need us forever." },
            ].map((cap, i) => (
              <CapabilityCard key={i} title={cap.title} desc={cap.desc} style={r5.stagger(i + 1, 50)} />
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 6: How We Measure Impact ═══ */}
      <DeckFrame ref={setRef(5)} label="Impact Measurement">
        <div ref={r6.ref} className="flex flex-col gap-8">
          <p style={{ ...heading(), ...r6.stagger(0) }}>
            Most grantee reports measure activity. We measure power.
          </p>
          <AnimatedMetricsRows rows={METRICS_ROWS} isActive={r6.isActive} />
          <p
            style={{
              ...r6.stagger(8, 900),
              fontFamily: f.sg,
              fontSize: "clamp(13px, 1.6vw, 17px)",
              fontStyle: "italic",
              color: f.redA(0.7),
              lineHeight: 1.55,
              borderLeft: `3px solid ${f.redA(0.4)}`,
              paddingLeft: "16px",
            }}
          >
            A campaign with 73 million views that doesn't convene a single new partner, catalyze a single policy conversation, or unlock a single dollar — that campaign failed.
          </p>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 7: How Engagements Work ═══ */}
      <DeckFrame ref={setRef(6)} label="How Engagements Work">
        <div ref={r7.ref} className="flex flex-col gap-8">
          <p style={{ ...heading(), ...r7.stagger(0) }}>
            Two types of clients come to us.
          </p>
          <div className="flex flex-col gap-4" style={r7.stagger(1)}>
            <p style={body(0.6)}>
              <strong style={{ color: f.white(0.9) }}>Already up to speed and need capacity?</strong> Let's scope it to your specific needs.
            </p>
            <p style={body(0.6)}>
              <strong style={{ color: f.white(0.9) }}>Starting fresh?</strong> Two phases, roughly three months:
            </p>
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-0" style={r7.stagger(2, 200)}>
            <TimelineNode
              label="Phase 1: Internal Review"
              period="4–6 weeks"
              bullets={[
                "Go through everything — grantees, systems, assumptions, goals.",
                "Voice-track what's been funded, what you're trying to accomplish, where things feel stuck.",
                "Identify the gap between where you are and where you need to be.",
              ]}
              deliverable="Diagnostic — here's what we're hearing, here's the delta, here's the plan."
              isActive={r7.isActive}
              delay={400}
            />
            <TimelineNode
              label="Phase 2: External Engagement"
              period="6–8 weeks"
              bullets={[
                "Interview existing grantees. Flag what should concern you.",
                "Map cultural infrastructure you're not using.",
                "Introduce partners from sectors you haven't accessed.",
              ]}
              deliverable="Actionable roadmap — restructured strategy, evaluation rubric, introduction list. A system your team can run independently."
              isActive={r7.isActive}
              delay={600}
            />
          </div>

          {/* The Fork */}
          <div className="flex flex-col sm:flex-row gap-4" style={r7.stagger(3, 800)}>
            <InteractiveForkCard
              label="Option A"
              title="Strategic Advisory Retainer"
              desc="Ongoing partnership. We stay embedded as a sounding board, connector, and diagnostic resource. Monthly cadence, quarterly reviews, direct access."
              side="a"
              hoveredFork={hoveredFork}
              onHover={setHoveredFork}
            />
            <InteractiveForkCard
              label="Option B"
              title="Transition to Independence"
              desc="We hand over the playbook, train your team, and step back. You keep the frameworks, the network, and the knowledge. Check-in as needed."
              side="b"
              hoveredFork={hoveredFork}
              onHover={setHoveredFork}
            />
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 8: Who We Are ═══ */}
      <DeckFrame ref={setRef(7)} label="Who We Are">
        <div ref={r8.ref} className="flex flex-col gap-8">
          <p
            style={{
              ...r8.stagger(0),
              fontFamily: f.sg,
              fontSize: "clamp(22px, 3.2vw, 36px)",
              fontWeight: 400,
              color: f.white(0.9),
              lineHeight: 1.35,
            }}
          >
            We've been where you are.
          </p>
          <p style={{ ...body(0.55), ...r8.stagger(1) }}>
            The difference is where we came from. Our team is built from careers in <strong style={{ color: f.white(0.85) }}>commercial media and entertainment</strong> — the industries your grantees are trying to reach.
          </p>
          {/* Sector pills */}
          <div className="flex flex-wrap gap-3" style={r8.stagger(2, 200)}>
            {[
              { name: "News", desc: "Local and national — how stories get placed and why" },
              { name: "Music", desc: "Labels, touring, festivals, artist strategy" },
              { name: "Film & TV", desc: "Production, distribution, cultural impact" },
              { name: "Digital", desc: "Advertising, creator economy — where opinion forms now" },
              { name: "PR", desc: "Corporate, entertainment, crisis communications" },
              { name: "Philanthropy", desc: "Running organizations, managing portfolios, advising donors" },
            ].map((s, i) => (
              <SectorPill key={i} name={s.name} desc={s.desc} delay={i * 100} isActive={r8.isActive} />
            ))}
          </div>
          <p style={{ ...body(0.55), ...r8.stagger(3, 600) }}>
            What's holding most donor advisors and program officers back isn't effort — it's <strong style={{ color: f.white(0.85) }}>access and pattern recognition</strong> across these industries. That's what we transfer.
          </p>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 9: The Promise ═══ */}
      <DeckFrame ref={setRef(8)} label="The Promise">
        <div ref={r9.ref} className="flex flex-col gap-8 items-center text-center">
          <p
            style={{
              ...r9.stagger(0),
              fontFamily: f.sg,
              fontSize: "clamp(26px, 4vw, 48px)",
              fontWeight: 400,
              color: f.white(0.95),
              lineHeight: 1.3,
              maxWidth: "700px",
            }}
          >
            Everything we know becomes everything you know.
          </p>
          <div style={{ ...r9.stagger(1, 400), width: "40px", height: "1px", background: f.redA(0.3) }} />
          <p
            style={{
              ...r9.stagger(2, 600),
              fontFamily: f.sg,
              fontSize: "clamp(15px, 2vw, 21px)",
              fontWeight: 400,
              color: f.white(0.5),
              lineHeight: 1.65,
              maxWidth: "580px",
            }}
          >
            We're not building a dependency. Strategic communications is expansive and powerful, but it's completely learnable. If you work with us, you'll learn how to do this yourself. That's not a risk to our business — it's the entire point.
          </p>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 10: CTA ═══ */}
      <DeckFrame ref={setRef(9)}>
        <div ref={r10.ref} className="flex flex-col items-center text-center gap-8">
          <h2
            style={{
              ...r10.stagger(0),
              fontFamily: f.sg,
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 500,
              color: f.white(1),
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            VGC StratComm
          </h2>
          <p
            style={{
              ...r10.stagger(1, 300),
              fontFamily: f.sg,
              fontSize: "clamp(15px, 2vw, 21px)",
              fontWeight: 400,
              color: f.white(0.5),
              lineHeight: 1.55,
              maxWidth: "520px",
            }}
          >
            Let's look at your portfolio together.
          </p>
          <a
            href="mailto:info@vgcstratcomm.com"
            className="deck-glow-pulse"
            style={{
              ...r10.stagger(2, 600),
              ...mono("12px"),
              fontWeight: 500,
              color: f.redA(0.9),
              border: `1px solid ${f.redA(0.4)}`,
              padding: "14px 36px",
              textDecoration: "none",
              transition: "border-color 300ms, color 300ms, box-shadow 300ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = f.redA(0.8);
              e.currentTarget.style.color = f.redA(1);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = f.redA(0.4);
              e.currentTarget.style.color = f.redA(0.9);
            }}
          >
            Get in touch
          </a>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 11: Case Studies ═══ */}
      <DeckFrame ref={setRef(10)} label="Case Studies">
        <div ref={r11.ref} className="flex flex-col gap-8">
          <p style={{ ...heading("clamp(22px, 3vw, 34px)"), fontWeight: 500, ...r11.stagger(0) }}>
            Want to see it in action?
          </p>
          <p style={{ ...body(0.35), ...r11.stagger(1) }}>
            Click any case study to read the full breakdown.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CASE_STUDIES.map((cs, i) => (
              <CaseStudyCard
                key={i}
                name={cs.name}
                outcome={cs.outcome}
                hasContent={cs.content !== null}
                onClick={() => setSelectedCase(i)}
                style={r11.stagger(i + 2, 50)}
              />
            ))}
          </div>
          <p style={{ ...mono("10px"), color: f.white(0.25), marginTop: "4px", ...r11.stagger(13, 500) }}>
            Full case studies coming soon. Clean Energy Workforce available now.
          </p>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 12: Spacer ═══ */}
      <DeckFrame ref={setRef(11)}>
        <div className="flex flex-col items-center text-center gap-6">
          <p style={{ ...mono("10px"), color: f.white(0.15) }}>
            ↑ Scroll up to explore case studies
          </p>
          <h2
            style={{
              fontFamily: f.sg,
              fontSize: "clamp(24px, 4vw, 44px)",
              fontWeight: 500,
              color: f.white(0.08),
              letterSpacing: "-0.02em",
            }}
          >
            VGC StratComm
          </h2>
        </div>
      </DeckFrame>

      {/* ═══ Case Study Lightbox ═══ */}
      <Dialog open={selectedCase !== null} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-y-auto"
          style={{
            background: "hsl(0 0% 4%)",
            border: `1px solid ${f.white(0.08)}`,
            borderTop: `2px solid ${f.redA(0.5)}`,
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: f.sg,
                fontSize: "clamp(18px, 2.5vw, 24px)",
                fontWeight: 500,
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
              <p style={{ fontFamily: f.sg, fontSize: "16px", color: f.white(0.5) }}>
                Full case study coming soon.
              </p>
              <p style={{ ...mono("11px"), color: f.white(0.25) }}>
                {selectedCase !== null ? CASE_STUDIES[selectedCase].outcome : ""}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   INLINE COMPONENTS — v2 Interactive
   ═══════════════════════════════════════════════════════════════ */

/* ─── StatChip ─── */
const StatChip = ({ value, label }: { value: string; label: string }) => (
  <div
    className="flex flex-col px-4 py-3"
    style={{
      background: "hsl(0 0% 4%)",
      border: `1px solid ${f.white(0.06)}`,
      borderLeft: `2px solid ${f.redA(0.6)}`,
    }}
  >
    <span style={{ ...mono("clamp(14px, 1.6vw, 20px)"), fontWeight: 500, color: f.redA(0.9) }}>
      {value}
    </span>
    <span style={{ ...mono("9px"), color: f.white(0.35), marginTop: "4px" }}>
      {label}
    </span>
  </div>
);

/* ─── NumberedProblem — with stagger support ─── */
const NumberedProblem = ({ n, title, desc, style }: { n: number; title: string; desc: string; style?: CSSProperties }) => (
  <div
    className="flex gap-4 py-3"
    style={{
      borderBottom: `1px solid ${f.white(0.04)}`,
      ...style,
    }}
  >
    <span
      style={{
        ...mono("clamp(16px, 2vw, 22px)"),
        fontWeight: 600,
        color: f.redA(0.7),
        lineHeight: "1.4",
        minWidth: "28px",
      }}
    >
      {n}.
    </span>
    <p style={body()}>
      <strong style={{ color: f.white(0.85) }}>{title}</strong>{" "}
      {desc}
    </p>
  </div>
);

/* ─── Animated Comparison Rows (replaces table) ─── */
const AnimatedComparisonRows = ({
  rows,
  isActive,
}: {
  rows: { step: string; left: string; right: string }[];
  isActive: boolean;
}) => (
  <div className="flex flex-col gap-0">
    {/* Header */}
    <div className="grid grid-cols-[100px_1fr_1fr] gap-0" style={{ borderBottom: `1px solid ${f.white(0.08)}` }}>
      <div style={{ padding: "8px 12px" }} />
      <div style={{ ...mono("9px"), padding: "8px 12px", color: f.white(0.3) }}>Your side</div>
      <div style={{ ...mono("9px"), padding: "8px 12px", color: f.redA(0.8), borderLeft: `2px solid ${f.redA(0.15)}` }}>Their side</div>
    </div>
    {/* Rows */}
    {rows.map((row, i) => {
      const delay = 200 + i * 150;
      return (
        <div
          key={i}
          className="grid grid-cols-[100px_1fr_1fr] gap-0"
          style={{
            borderBottom: `1px solid ${f.white(0.04)}`,
            opacity: isActive ? 1 : 0,
            transform: isActive ? "translateX(0)" : "translateX(12px)",
            transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
          }}
        >
          <div style={{ padding: "10px 12px", fontFamily: f.sg, fontSize: "clamp(11px, 1.3vw, 14px)", fontWeight: 600, color: f.white(0.6) }}>
            {row.step}
          </div>
          <div style={{ padding: "10px 12px", fontFamily: f.sg, fontSize: "clamp(11px, 1.3vw, 14px)", color: f.white(0.3), lineHeight: 1.6 }}>
            {row.left}
          </div>
          <div style={{ padding: "10px 12px", fontFamily: f.sg, fontSize: "clamp(11px, 1.3vw, 14px)", color: f.white(0.6), lineHeight: 1.6, borderLeft: `2px solid ${f.redA(0.15)}` }}>
            {row.right}
          </div>
        </div>
      );
    })}
  </div>
);

/* ─── Animated Metrics Rows ─── */
const AnimatedMetricsRows = ({
  rows,
  isActive,
}: {
  rows: { left: string; right: string }[];
  isActive: boolean;
}) => (
  <div className="flex flex-col gap-0">
    <div className="grid grid-cols-2 gap-0" style={{ borderBottom: `1px solid ${f.white(0.08)}` }}>
      <div style={{ ...mono("9px"), padding: "8px 12px", color: f.white(0.3) }}>What most grantees report</div>
      <div style={{ ...mono("9px"), padding: "8px 12px", color: f.redA(0.8), borderLeft: `2px solid ${f.redA(0.15)}` }}>What we track</div>
    </div>
    {rows.map((row, i) => {
      const delay = 200 + i * 150;
      return (
        <div
          key={i}
          className="grid grid-cols-2 gap-0"
          style={{
            borderBottom: `1px solid ${f.white(0.04)}`,
            opacity: isActive ? 1 : 0,
            transform: isActive ? "translateX(0)" : "translateX(12px)",
            transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
          }}
        >
          <div style={{
            padding: "10px 12px",
            fontFamily: f.sg,
            fontSize: "clamp(11px, 1.3vw, 14px)",
            color: f.white(0.25),
            lineHeight: 1.6,
            textDecoration: isActive ? "line-through" : "none",
            textDecorationColor: f.redA(0.3),
            transition: `text-decoration 0.4s ease ${delay + 400}ms`,
          }}>
            {row.left}
          </div>
          <div style={{
            padding: "10px 12px",
            fontFamily: f.sg,
            fontSize: "clamp(11px, 1.3vw, 14px)",
            color: f.white(0.7),
            lineHeight: 1.6,
            borderLeft: `2px solid ${f.redA(0.15)}`,
          }}>
            {row.right}
          </div>
        </div>
      );
    })}
  </div>
);

/* ─── Expandable Hallmark Card ─── */
const ExpandableHallmark = ({
  index: _,
  title,
  rationale,
  help,
  isExpanded,
  onToggle,
  style,
}: {
  index: number;
  title: string;
  rationale: string;
  help: string;
  isExpanded: boolean;
  onToggle: () => void;
  style?: CSSProperties;
}) => (
  <button
    onClick={onToggle}
    className="text-left flex-1 transition-all duration-300"
    style={{
      border: `1px solid ${isExpanded ? f.white(0.15) : f.white(0.08)}`,
      borderTop: `2px solid ${isExpanded ? f.redA(0.8) : f.redA(0.3)}`,
      padding: "24px",
      background: isExpanded ? f.white(0.02) : "transparent",
      cursor: "pointer",
      ...style,
    }}
  >
    <p
      style={{
        fontFamily: f.sg,
        fontSize: "clamp(15px, 1.8vw, 19px)",
        fontWeight: 500,
        color: f.white(0.9),
        marginBottom: isExpanded ? "16px" : "0",
        transition: "margin 0.3s ease",
      }}
    >
      {title}
    </p>
    <div
      style={{
        maxHeight: isExpanded ? "400px" : "0",
        overflow: "hidden",
        opacity: isExpanded ? 1 : 0,
        transition: "max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease",
      }}
    >
      <p style={{ ...body(), marginBottom: "12px" }}>{rationale}</p>
      <p style={{ ...body(0.55), fontStyle: "italic" }}>
        <span style={{ color: f.redA(0.7), fontStyle: "normal", fontWeight: 500 }}>How we help: </span>
        {help}
      </p>
    </div>
    <span
      style={{
        display: "block",
        marginTop: isExpanded ? "0" : "8px",
        ...mono("8px"),
        color: f.redA(0.5),
        transition: "opacity 0.3s",
        opacity: isExpanded ? 0 : 1,
        height: isExpanded ? 0 : "auto",
        overflow: "hidden",
      }}
    >
      ↓ click to expand
    </span>
  </button>
);

/* ─── Capability Card (2×3 grid) ─── */
const CapabilityCard = ({
  title,
  desc,
  style,
}: {
  title: string;
  desc: string;
  style?: CSSProperties;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? f.white(0.15) : f.white(0.06)}`,
        padding: "20px",
        background: hovered ? f.white(0.02) : "transparent",
        ...style,
      }}
    >
      <p
        style={{
          fontFamily: f.sg,
          fontSize: "clamp(15px, 1.8vw, 19px)",
          fontWeight: 500,
          color: f.white(0.85),
          marginBottom: hovered ? "10px" : "4px",
          transition: "margin 0.3s ease",
        }}
      >
        {title}
      </p>
      <div
        style={{
          maxHeight: hovered ? "200px" : "0",
          overflow: "hidden",
          opacity: hovered ? 1 : 0,
          transition: "max-height 0.4s ease, opacity 0.3s ease",
        }}
      >
        <p style={body(0.4)}>{desc}</p>
      </div>
      {!hovered && (
        <div
          style={{
            width: "20px",
            height: "2px",
            background: f.redA(0.3),
            marginTop: "8px",
            transition: "opacity 0.3s",
          }}
        />
      )}
    </div>
  );
};

/* ─── Timeline Node ─── */
const TimelineNode = ({
  label,
  period,
  bullets,
  deliverable,
  isActive,
  delay,
}: {
  label: string;
  period: string;
  bullets: string[];
  deliverable: string;
  isActive: boolean;
  delay: number;
}) => (
  <div
    style={{
      borderLeft: `2px solid ${f.redA(0.3)}`,
      paddingLeft: "20px",
      paddingBottom: "24px",
      position: "relative",
      opacity: isActive ? 1 : 0,
      transform: isActive ? "translateY(0)" : "translateY(12px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}
  >
    {/* Node dot */}
    <div
      style={{
        position: "absolute",
        left: "-5px",
        top: "6px",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: isActive ? f.red : f.redA(0.3),
        boxShadow: isActive ? `0 0 12px ${f.redA(0.5)}` : "none",
        transition: `background 0.4s ease ${delay}ms, box-shadow 0.6s ease ${delay + 200}ms`,
      }}
    />
    <div className="flex items-baseline gap-3 mb-3">
      <span style={{ fontFamily: f.sg, fontSize: "clamp(15px, 1.8vw, 19px)", fontWeight: 500, color: f.white(0.9) }}>
        {label}
      </span>
      <span style={{ ...mono("9px"), color: f.redA(0.6) }}>{period}</span>
    </div>
    {bullets.map((b, i) => (
      <p key={i} style={{ ...body(0.4), fontSize: "clamp(12px, 1.4vw, 14px)", marginBottom: "6px", paddingLeft: "12px" }}>
        {b}
      </p>
    ))}
    <p style={{ ...body(0.6), fontSize: "clamp(12px, 1.4vw, 14px)", marginTop: "8px" }}>
      <strong style={{ color: f.white(0.8) }}>Deliverable:</strong> {deliverable}
    </p>
  </div>
);

/* ─── Interactive Fork Card ─── */
const InteractiveForkCard = ({
  label,
  title,
  desc,
  side,
  hoveredFork,
  onHover,
}: {
  label: string;
  title: string;
  desc: string;
  side: "a" | "b";
  hoveredFork: "a" | "b" | null;
  onHover: (v: "a" | "b" | null) => void;
}) => {
  const isHovered = hoveredFork === side;
  const isDimmed = hoveredFork !== null && hoveredFork !== side;
  return (
    <div
      className="flex-1 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => onHover(side)}
      onMouseLeave={() => onHover(null)}
      style={{
        border: `1px solid ${isHovered ? f.white(0.2) : f.white(0.08)}`,
        padding: "24px",
        transform: isHovered ? "scale(1.02)" : isDimmed ? "scale(0.98)" : "scale(1)",
        opacity: isDimmed ? 0.5 : 1,
        background: isHovered ? f.white(0.03) : "transparent",
      }}
    >
      <span style={{ ...mono("9px"), color: f.redA(0.7) }}>{label}</span>
      <p style={{ fontFamily: f.sg, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 500, color: f.white(0.9), marginTop: "8px", marginBottom: "8px" }}>
        {title}
      </p>
      <p style={body(0.4)}>{desc}</p>
    </div>
  );
};

/* ─── Sector Pill ─── */
const SectorPill = ({
  name,
  desc,
  delay,
  isActive,
}: {
  name: string;
  desc: string;
  delay: number;
  isActive: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateY(0)" : "translateY(8px)",
        transition: `opacity 0.5s ease ${300 + delay}ms, transform 0.5s ease ${300 + delay}ms`,
      }}
    >
      <span
        className="inline-block transition-all duration-200"
        style={{
          fontFamily: f.sg,
          fontSize: "clamp(12px, 1.4vw, 15px)",
          fontWeight: 500,
          color: hovered ? f.white(0.95) : f.white(0.7),
          padding: "8px 16px",
          border: `1px solid ${hovered ? f.redA(0.5) : f.white(0.1)}`,
          background: hovered ? f.redA(0.08) : "transparent",
          cursor: "default",
        }}
      >
        {name}
      </span>
      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute left-0 top-full mt-2 z-50"
          style={{
            fontFamily: f.sg,
            fontSize: "12px",
            color: f.white(0.6),
            background: "hsl(0 0% 6%)",
            border: `1px solid ${f.white(0.1)}`,
            padding: "8px 12px",
            whiteSpace: "nowrap",
            animation: "deck-fade-up 0.2s ease forwards",
          }}
        >
          {desc}
        </div>
      )}
    </div>
  );
};

/* ─── Case Study Card ─── */
const CaseStudyCard = ({
  name,
  outcome,
  hasContent,
  onClick,
  style,
}: {
  name: string;
  outcome: string;
  hasContent: boolean;
  onClick: () => void;
  style?: CSSProperties;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left transition-all duration-300"
      style={{
        border: `1px solid ${hovered ? f.white(0.15) : f.white(0.08)}`,
        borderTop: hasContent ? `2px solid ${f.redA(0.5)}` : `2px solid ${f.white(0.08)}`,
        padding: "20px",
        background: hovered ? f.white(0.02) : "transparent",
        cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 24px ${f.white(0.03)}` : "none",
        ...style,
      }}
    >
      <p style={{ fontFamily: f.sg, fontSize: "clamp(14px, 1.6vw, 17px)", fontWeight: 500, color: f.white(0.85), marginBottom: "6px" }}>
        {name}
      </p>
      <p style={{ ...mono("10px"), color: hasContent ? f.redA(0.6) : f.white(0.25), lineHeight: "1.5" }}>
        {outcome}
      </p>
    </button>
  );
};

export default Deck;
