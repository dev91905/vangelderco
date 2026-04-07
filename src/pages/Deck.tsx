import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DeckFrame from "@/components/deck/DeckFrame";
import useGlitchSFX from "@/hooks/useGlitchSFX";

const TOTAL_FRAMES = 10;

const Deck = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const lastFrameRef = useRef(0);
  const { playHoverGlitch } = useGlitchSFX();

  // Intersection observer to track current frame
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    frameRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentFrame(i);
          }
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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
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
  }, [currentFrame, navigate, scrollToFrame]);

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    frameRefs.current[i] = el;
  };

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
      {/* Breathing red glow — fixed */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 -z-0"
        style={{
          width: "min(80vw, 700px)",
          height: "min(80vh, 600px)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, hsl(0 80% 48% / 0.12) 0%, hsl(0 80% 48% / 0.06) 30%, hsl(0 80% 48% / 0.02) 55%, transparent 80%)",
          animation: "breathe 8s ease-in-out infinite",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Scan beam */}
      <div
        className="pointer-events-none fixed left-0 z-20 w-full"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.06) 20%, hsl(0 0% 100% / 0.06) 80%, transparent 100%)",
          animation: "scan-beam 7s linear infinite",
        }}
      />

      {/* Corner brackets */}
      <svg className="fixed top-4 left-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M1 8V1h7" /></svg>
      <svg className="fixed top-4 right-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M23 8V1h-7" /></svg>
      <svg className="fixed bottom-4 left-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M1 16v7h7" /></svg>
      <svg className="fixed bottom-4 right-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M23 16v7h-7" /></svg>

      {/* Frame counter HUD */}
      <div
        className="fixed bottom-8 right-8 z-30"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          letterSpacing: "0.15em",
          color: "hsl(0 0% 100% / 0.25)",
        }}
      >
        {String(currentFrame + 1).padStart(2, "0")} / {String(TOTAL_FRAMES).padStart(2, "0")}
      </div>

      {/* ESC hint */}
      <div
        className="fixed top-8 right-8 z-30"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "hsl(0 0% 100% / 0.15)",
        }}
      >
        ESC to exit
      </div>

      {/* ─── FRAME 1: Title ─── */}
      <DeckFrame ref={setRef(0)}>
        <div className="flex flex-col items-center text-center gap-6">
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 500,
              color: "hsl(0 0% 100%)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Van Gelder Co.
          </h1>
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "hsl(0 80% 48% / 0.6)",
            }}
          />
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(11px, 1.4vw, 14px)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "hsl(0 0% 100% / 0.4)",
              maxWidth: "500px",
            }}
          >
            Strategic Communications for the Sectors That Shape Power
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 2: The Problem ─── */}
      <DeckFrame ref={setRef(1)} label="The Problem">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(20px, 3vw, 34px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.9)",
              lineHeight: 1.45,
            }}
          >
            The people with the money, the people with the power, and the people with the culture are designing strategy in separate rooms.
          </p>
          <div className="flex flex-col gap-5 mt-2">
            {[
              "Philanthropy funds what it can measure — and ignores what it can't.",
              "Policy moves what it can legislate — and loses what it can't enforce.",
              "Culture moves what it can feel — and has no strategy for what comes next.",
            ].map((line, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(14px, 1.8vw, 18px)",
                  color: "hsl(0 0% 100% / 0.4)",
                  lineHeight: 1.6,
                  paddingLeft: "16px",
                  borderLeft: "1px solid hsl(0 80% 48% / 0.25)",
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 3: What We Do ─── */}
      <DeckFrame ref={setRef(2)} label="What We Do">
        <div className="flex flex-col gap-10 items-center text-center">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.6vw, 28px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.5,
              maxWidth: "700px",
            }}
          >
            We sit at the intersection of philanthropy, policy, labor, culture, and technology — and we build the connective tissue between them.
          </p>
          {/* Triangle / three-node visual */}
          <svg
            viewBox="0 0 300 260"
            width="280"
            height="240"
            style={{ marginTop: "8px" }}
          >
            {/* Connecting lines */}
            <line x1="150" y1="40" x2="50" y2="220" stroke="hsl(0 80% 48% / 0.2)" strokeWidth="1" />
            <line x1="150" y1="40" x2="250" y2="220" stroke="hsl(0 80% 48% / 0.2)" strokeWidth="1" />
            <line x1="50" y1="220" x2="250" y2="220" stroke="hsl(0 80% 48% / 0.2)" strokeWidth="1" />
            {/* Nodes */}
            <circle cx="150" cy="40" r="5" fill="hsl(0 80% 48% / 0.8)" />
            <circle cx="50" cy="220" r="5" fill="hsl(0 80% 48% / 0.8)" />
            <circle cx="250" cy="220" r="5" fill="hsl(0 80% 48% / 0.8)" />
            {/* Labels */}
            <text x="150" y="20" textAnchor="middle" fill="hsl(0 0% 100% / 0.6)" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.15em">CULTURAL STRATEGY</text>
            <text x="50" y="248" textAnchor="middle" fill="hsl(0 0% 100% / 0.6)" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.15em">CROSS-SECTOR</text>
            <text x="250" y="248" textAnchor="middle" fill="hsl(0 0% 100% / 0.6)" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.15em">DEEP ORGANIZING</text>
          </svg>
        </div>
      </DeckFrame>

      {/* ─── FRAME 4: Cultural Strategy ─── */}
      <DeckFrame ref={setRef(3)} label="Domain // 001">
        <div className="flex flex-col gap-8">
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(24px, 3.5vw, 40px)",
              fontWeight: 500,
              color: "hsl(0 0% 100%)",
              letterSpacing: "-0.01em",
            }}
          >
            Cultural Strategy
          </h2>
          {/* Pull-quote */}
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(13px, 1.5vw, 16px)",
              fontStyle: "italic",
              color: "hsl(0 80% 48% / 0.7)",
              letterSpacing: "0.02em",
            }}
          >
            Culture doesn't support the strategy. Culture IS the strategy.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.7,
            }}
          >
            We design public engagement campaigns with partners across arts, media, faith, and education — the sectors that shape the cultural conditions for policy.
          </p>
          {/* Mock example */}
          <div
            className="mt-4"
            style={{
              borderLeft: "2px solid hsl(0 80% 48% / 0.5)",
              paddingLeft: "20px",
            }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "hsl(0 80% 48% / 0.7)",
                marginBottom: "8px",
              }}
            >
              Case Example
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                color: "hsl(0 0% 100% / 0.4)",
                lineHeight: 1.65,
              }}
            >
              A faith-media coalition campaign that shifted narrative polling 12 points in 90 days — reframing a stalled policy issue into a cultural inevitability.
            </p>
          </div>
          {/* Stat chip */}
          <div className="flex gap-4 mt-2">
            <StatChip value="12-PT SHIFT" label="Narrative Polling" />
            <StatChip value="90 DAYS" label="Campaign Duration" />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 5: Cross-Sector Intelligence ─── */}
      <DeckFrame ref={setRef(4)} label="Domain // 002">
        <div className="flex flex-col gap-8">
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(24px, 3.5vw, 40px)",
              fontWeight: 500,
              color: "hsl(0 0% 100%)",
              letterSpacing: "-0.01em",
            }}
          >
            Cross-Sector Intelligence
          </h2>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(13px, 1.5vw, 16px)",
              fontStyle: "italic",
              color: "hsl(0 80% 48% / 0.7)",
              letterSpacing: "0.02em",
            }}
          >
            Know first. Move first.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.7,
            }}
          >
            We bring energy, labor, philanthropy, culture, policy, and national security leaders to the same table — and build unexpected alliances that turn shared interest into joint action.
          </p>
          <div
            className="mt-4"
            style={{
              borderLeft: "2px solid hsl(0 80% 48% / 0.5)",
              paddingLeft: "20px",
            }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "hsl(0 80% 48% / 0.7)",
                marginBottom: "8px",
              }}
            >
              Case Example
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                color: "hsl(0 0% 100% / 0.4)",
                lineHeight: 1.65,
              }}
            >
              A labor-energy-philanthropy alignment that unlocked $40M in coordinated capital — three sectors that had never shared a strategy table before.
            </p>
          </div>
          <div className="flex gap-4 mt-2">
            <StatChip value="$40M" label="Coordinated Capital" />
            <StatChip value="3 SECTORS" label="First-Time Alignment" />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 6: Deep Organizing ─── */}
      <DeckFrame ref={setRef(5)} label="Domain // 003">
        <div className="flex flex-col gap-8">
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(24px, 3.5vw, 40px)",
              fontWeight: 500,
              color: "hsl(0 0% 100%)",
              letterSpacing: "-0.01em",
            }}
          >
            Deep Organizing
          </h2>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(13px, 1.5vw, 16px)",
              fontStyle: "italic",
              color: "hsl(0 80% 48% / 0.7)",
              letterSpacing: "0.02em",
            }}
          >
            Not events. Not 'engagement.' Organizing.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.7,
            }}
          >
            We identify community leaders already earning trust and building followings, and connect them with the resources to go further — the talent that traditional funding pipelines miss.
          </p>
          <div
            className="mt-4"
            style={{
              borderLeft: "2px solid hsl(0 80% 48% / 0.5)",
              paddingLeft: "20px",
            }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "hsl(0 80% 48% / 0.7)",
                marginBottom: "8px",
              }}
            >
              Case Example
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                color: "hsl(0 0% 100% / 0.4)",
                lineHeight: 1.65,
              }}
            >
              Identifying 200+ community leaders across 6 states that traditional pipelines missed entirely — and connecting them to institutional resources within 120 days.
            </p>
          </div>
          <div className="flex gap-4 mt-2">
            <StatChip value="200+" label="Leaders Identified" />
            <StatChip value="6 STATES" label="Geographic Reach" />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 7: The Loop ─── */}
      <DeckFrame ref={setRef(6)} label="The System">
        <div className="flex flex-col gap-10 items-center text-center">
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(20px, 2.8vw, 32px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.9)",
              lineHeight: 1.45,
              maxWidth: "650px",
            }}
          >
            Intelligence tells you where to aim. Culture tells you how to move people. Organizing makes it stick.
          </h2>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.15em",
              color: "hsl(0 0% 100% / 0.3)",
            }}
          >
            It's a loop, not a menu.
          </p>
          {/* Circular flow SVG */}
          <svg viewBox="0 0 320 320" width="280" height="280" style={{ marginTop: "8px" }}>
            {/* Circle path (invisible, for reference) */}
            <circle cx="160" cy="160" r="110" fill="none" stroke="hsl(0 80% 48% / 0.12)" strokeWidth="1" strokeDasharray="4 6" />
            {/* Nodes at 12, 4, 8 o'clock */}
            <circle cx="160" cy="50" r="6" fill="hsl(0 80% 48% / 0.8)" />
            <circle cx="255" cy="215" r="6" fill="hsl(0 80% 48% / 0.8)" />
            <circle cx="65" cy="215" r="6" fill="hsl(0 80% 48% / 0.8)" />
            {/* Arrow arcs — simplified as lines with arrowheads */}
            <path d="M 175 55 Q 240 100 250 205" fill="none" stroke="hsl(0 80% 48% / 0.3)" strokeWidth="1" markerEnd="url(#arrowRed)" />
            <path d="M 245 225 Q 165 280 75 225" fill="none" stroke="hsl(0 80% 48% / 0.3)" strokeWidth="1" markerEnd="url(#arrowRed)" />
            <path d="M 55 205 Q 80 100 145 55" fill="none" stroke="hsl(0 80% 48% / 0.3)" strokeWidth="1" markerEnd="url(#arrowRed)" />
            {/* Arrowhead marker */}
            <defs>
              <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6" fill="hsl(0 80% 48% / 0.5)" />
              </marker>
            </defs>
            {/* Labels */}
            <text x="160" y="32" textAnchor="middle" fill="hsl(0 0% 100% / 0.6)" fontFamily="'JetBrains Mono', monospace" fontSize="8" letterSpacing="0.15em">INTELLIGENCE</text>
            <text x="285" y="228" textAnchor="middle" fill="hsl(0 0% 100% / 0.6)" fontFamily="'JetBrains Mono', monospace" fontSize="8" letterSpacing="0.15em">CULTURE</text>
            <text x="35" y="228" textAnchor="middle" fill="hsl(0 0% 100% / 0.6)" fontFamily="'JetBrains Mono', monospace" fontSize="8" letterSpacing="0.15em">ORGANIZING</text>
          </svg>
        </div>
      </DeckFrame>

      {/* ─── FRAME 8: Origin Story ─── */}
      <DeckFrame ref={setRef(7)} label="Why We Built This">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(20px, 2.8vw, 32px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.5,
            }}
          >
            Donors had money but no map. Policy people had maps but no people. Culture people had people but no strategy.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(16px, 2vw, 22px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.4)",
              lineHeight: 1.6,
            }}
          >
            Everyone had a piece. Nobody had the picture.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(16px, 2vw, 22px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.55)",
              lineHeight: 1.6,
            }}
          >
            We built the connective tissue.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 9: First 90 Days ─── */}
      <DeckFrame ref={setRef(8)} label="First 90 Days">
        <div className="flex flex-col gap-8">
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(22px, 3vw, 34px)",
              fontWeight: 500,
              color: "hsl(0 0% 100%)",
              letterSpacing: "-0.01em",
            }}
          >
            What happens when you say yes.
          </h2>
          <div className="flex flex-col gap-0 ml-2">
            <TimelineStep
              period="WEEK 1–2"
              title="Intake"
              desc="Portfolio review, priorities, blind spots, adversaries. We learn your landscape before we touch it."
            />
            <TimelineStep
              period="WEEK 3–4"
              title="First Intelligence Briefing"
              desc="Cross-sector map delivered. Who's moving, who's stalled, where the openings are."
            />
            <TimelineStep
              period="MONTH 2"
              title="Cultural Strategy Scoping"
              desc="Campaign architecture. Which narratives to build, which to break, which partners to activate."
            />
            <TimelineStep
              period="MONTH 3"
              title="Organizing Architecture"
              desc="Ground infrastructure design. Structure tests deployed. First cohort of leaders identified."
            />
            <TimelineStep
              period="ONGOING"
              title="Retainer"
              desc="Monthly intel feed. Direct access. Strategy adjustments in real time."
              isLast
            />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 10: Close ─── */}
      <DeckFrame ref={setRef(9)}>
        <div className="flex flex-col items-center text-center gap-8">
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(11px, 1.4vw, 14px)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "hsl(0 0% 100% / 0.3)",
            }}
          >
            By referral only
          </p>
          <div
            style={{
              width: "24px",
              height: "1px",
              background: "hsl(0 80% 48% / 0.4)",
            }}
          />
        </div>
      </DeckFrame>
    </div>
  );
};

/* Inline stat chip component */
const StatChip = ({ value, label }: { value: string; label: string }) => (
  <div
    className="flex flex-col px-4 py-3"
    style={{
      background: "hsl(0 0% 4%)",
      border: "1px solid hsl(0 0% 100% / 0.06)",
      borderLeft: "2px solid hsl(0 80% 48% / 0.6)",
    }}
  >
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "clamp(14px, 1.6vw, 20px)",
        fontWeight: 500,
        color: "hsl(0 80% 48% / 0.9)",
      }}
    >
      {value}
    </span>
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "9px",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "hsl(0 0% 100% / 0.35)",
        marginTop: "4px",
      }}
    >
      {label}
    </span>
  </div>
);

/* Timeline step component for First 90 Days */
const TimelineStep = ({
  period,
  title,
  desc,
  isLast = false,
}: {
  period: string;
  title: string;
  desc: string;
  isLast?: boolean;
}) => (
  <div className="flex gap-5">
    {/* Vertical line + dot */}
    <div className="flex flex-col items-center" style={{ width: "20px" }}>
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "hsl(0 80% 48% / 0.8)",
          flexShrink: 0,
          marginTop: "4px",
        }}
      />
      {!isLast && (
        <div
          style={{
            width: "1px",
            flexGrow: 1,
            background: "hsl(0 80% 48% / 0.15)",
            minHeight: "40px",
          }}
        />
      )}
    </div>
    {/* Content */}
    <div className="flex flex-col gap-1 pb-8">
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "hsl(0 80% 48% / 0.7)",
        }}
      >
        {period}
      </span>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(15px, 1.8vw, 19px)",
          fontWeight: 500,
          color: "hsl(0 0% 100% / 0.9)",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(12px, 1.4vw, 15px)",
          color: "hsl(0 0% 100% / 0.4)",
          lineHeight: 1.6,
        }}
      >
        {desc}
      </span>
    </div>
  </div>
);

export default Deck;
