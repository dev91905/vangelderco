import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DeckFrame from "@/components/deck/DeckFrame";
import useGlitchSFX from "@/hooks/useGlitchSFX";

const TOTAL_FRAMES = 13;

const Deck = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const lastFrameRef = useRef(0);
  const { playHoverGlitch } = useGlitchSFX();

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
      {/* Breathing red glow */}
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
            Strategic advisory for the people trying to move something that matters
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
            You're spending millions on paid media, op-eds, and documentaries nobody watches.
          </p>
          <div className="flex flex-col gap-5">
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(14px, 1.8vw, 19px)",
                fontWeight: 400,
                color: "hsl(0 0% 100% / 0.45)",
                lineHeight: 1.65,
              }}
            >
              Facebook counts a three-second scroll as a view. You get inflated numbers back and wonder why nothing moved. You're testing messages in a test tube, then paying people to watch them.
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(16px, 2.2vw, 24px)",
                fontWeight: 400,
                color: "hsl(0 0% 100% / 0.7)",
                lineHeight: 1.5,
              }}
            >
              The tools aren't broken. They're just the wrong tools.
            </p>
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 3: Meanwhile ─── */}
      <DeckFrame ref={setRef(2)} label="Meanwhile">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.6vw, 30px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.45,
            }}
          >
            While you run Facebook ads, the other side is buying the platforms you advertise on.
          </p>
          <div className="flex flex-col gap-4">
            {[
              "Acquiring legacy media and changing the programming",
              "Investing in investigative news and digital creator economies",
              "Running public polls that shift policy baselines",
              "Developing new media talent, then acquiring legacy platforms",
              "Building political ideology in real time — in the feeds your audience already watches",
            ].map((line, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "hsl(0 80% 48% / 0.7)",
                    flexShrink: 0,
                    marginTop: "10px",
                  }}
                />
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "clamp(13px, 1.6vw, 17px)",
                    color: "hsl(0 0% 100% / 0.45)",
                    lineHeight: 1.65,
                  }}
                >
                  {line}
                </p>
              </div>
            ))}
          </div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.8vw, 19px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.6)",
              lineHeight: 1.6,
              marginTop: "8px",
            }}
          >
            They don't test in a test tube. They throw money everywhere, see what sticks organically, and supercharge it.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 4: What We Do ─── */}
      <DeckFrame ref={setRef(3)} label="What We Do">
        <div className="flex flex-col gap-10 items-center text-center">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.8vw, 32px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.9)",
              lineHeight: 1.5,
              maxWidth: "700px",
            }}
          >
            We sit at the intersection of philanthropy, policy, labor, culture, and technology — and we build the connective tissue between them.
          </p>
          {/* Three-node triangle */}
          <svg width="200" height="180" viewBox="0 0 200 180" fill="none" className="mt-4">
            <line x1="100" y1="20" x2="30" y2="155" stroke="hsl(0 80% 48% / 0.2)" strokeWidth="1" />
            <line x1="100" y1="20" x2="170" y2="155" stroke="hsl(0 80% 48% / 0.2)" strokeWidth="1" />
            <line x1="30" y1="155" x2="170" y2="155" stroke="hsl(0 80% 48% / 0.2)" strokeWidth="1" />
            <circle cx="100" cy="20" r="4" fill="hsl(0 80% 48% / 0.8)" />
            <circle cx="30" cy="155" r="4" fill="hsl(0 80% 48% / 0.8)" />
            <circle cx="170" cy="155" r="4" fill="hsl(0 80% 48% / 0.8)" />
            <text x="100" y="10" textAnchor="middle" fill="hsl(0 0% 100% / 0.4)" fontSize="8" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em">CULTURE</text>
            <text x="18" y="175" textAnchor="middle" fill="hsl(0 0% 100% / 0.4)" fontSize="8" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em">INTELLIGENCE</text>
            <text x="182" y="175" textAnchor="middle" fill="hsl(0 0% 100% / 0.4)" fontSize="8" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em">ORGANIZING</text>
          </svg>
        </div>
      </DeckFrame>

      {/* ─── FRAME 5: Cultural Strategy ─── */}
      <DeckFrame ref={setRef(4)} label="Domain // 001">
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
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.7,
            }}
          >
            Music industry. Local and national news. Digital creators. Brands and advertisers. Social platforms. Film and TV. Faith institutions. Veterans groups. Athletes. College campuses. Anywhere people gather around an interest that has nothing to do with politics — we find where those spaces intersect with institutional power and design coordinated interventions that shift narratives and norms at scale.
          </p>
          {/* Pull-quote */}
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.6vw, 17px)",
              fontStyle: "italic",
              color: "hsl(0 80% 48% / 0.7)",
              borderLeft: "2px solid hsl(0 80% 48% / 0.3)",
              paddingLeft: "16px",
            }}
          >
            Culture doesn't support the strategy. Culture IS the strategy.
          </p>
          <div
            className="mt-2"
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
          <div className="flex gap-4 mt-2">
            <StatChip value="12-PT SHIFT" label="Narrative Polling" />
            <StatChip value="90 DAYS" label="Campaign Duration" />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 6: Cross-Sector Intelligence ─── */}
      <DeckFrame ref={setRef(5)} label="Domain // 002">
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
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.7,
            }}
          >
            Even the best donor advisors struggle with multi-sector organizing. How does a philanthropic dollar unlock community foundations, national security, public utilities, policy, other donors, culture, and labor — simultaneously? It's a lot to hold in one's head. We build the processes, coalitions, and tools that make it visible and manageable.
          </p>
          {/* Pull-quote */}
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.6vw, 17px)",
              fontStyle: "italic",
              color: "hsl(0 80% 48% / 0.7)",
              borderLeft: "2px solid hsl(0 80% 48% / 0.3)",
              paddingLeft: "16px",
            }}
          >
            Know first. Move first.
          </p>
          <div
            className="mt-2"
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

      {/* ─── FRAME 7: Deep Organizing ─── */}
      <DeckFrame ref={setRef(6)} label="Domain // 003">
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
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.7,
            }}
          >
            You're used to mass mobilization — turning out the same people over and over without growing the movement. The question every donor is asking now: am I building durable power, or funding something that fizzles in four years? We find the organic leaders who already have trust and momentum, audit and develop groups, do landscape analysis, and scale what works.
          </p>
          {/* Pull-quote */}
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.6vw, 17px)",
              fontStyle: "italic",
              color: "hsl(0 80% 48% / 0.7)",
              borderLeft: "2px solid hsl(0 80% 48% / 0.3)",
              paddingLeft: "16px",
            }}
          >
            Not events. Not 'engagement.' Organizing.
          </p>
          <div
            className="mt-2"
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

      {/* ─── FRAME 8: The Loop ─── */}
      <DeckFrame ref={setRef(7)} label="The Loop">
        <div className="flex flex-col gap-10 items-center text-center">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(17px, 2.4vw, 26px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.55,
              maxWidth: "650px",
            }}
          >
            Intelligence tells you where to aim. Culture tells you how to move people. Organizing makes it stick.
          </p>
          {/* Circular loop diagram */}
          <svg width="280" height="260" viewBox="0 0 280 260" fill="none" className="mt-2">
            {/* Circular path */}
            <circle cx="140" cy="130" r="90" stroke="hsl(0 80% 48% / 0.15)" strokeWidth="1" fill="none" />
            {/* Directional arcs */}
            <path d="M 140 40 A 90 90 0 0 1 218 175" stroke="hsl(0 80% 48% / 0.35)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <path d="M 218 175 A 90 90 0 0 1 62 175" stroke="hsl(0 80% 48% / 0.35)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <path d="M 62 175 A 90 90 0 0 1 140 40" stroke="hsl(0 80% 48% / 0.35)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            {/* Nodes */}
            <circle cx="140" cy="40" r="5" fill="hsl(0 80% 48% / 0.8)" />
            <circle cx="218" cy="175" r="5" fill="hsl(0 80% 48% / 0.8)" />
            <circle cx="62" cy="175" r="5" fill="hsl(0 80% 48% / 0.8)" />
            {/* Labels */}
            <text x="140" y="22" textAnchor="middle" fill="hsl(0 0% 100% / 0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.12em">INTELLIGENCE</text>
            <text x="248" y="185" textAnchor="middle" fill="hsl(0 0% 100% / 0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.12em">CULTURE</text>
            <text x="32" y="185" textAnchor="middle" fill="hsl(0 0% 100% / 0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.12em">ORGANIZING</text>
            {/* Arrow heads (small triangles) */}
            <polygon points="210,165 220,175 210,175" fill="hsl(0 80% 48% / 0.5)" />
            <polygon points="70,175 60,175 65,165" fill="hsl(0 80% 48% / 0.5)" />
            <polygon points="135,48 140,38 145,48" fill="hsl(0 80% 48% / 0.5)" />
          </svg>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(11px, 1.2vw, 13px)",
              color: "hsl(0 0% 100% / 0.3)",
              letterSpacing: "0.1em",
            }}
          >
            It's a loop, not a menu.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 9: What You Get ─── */}
      <DeckFrame ref={setRef(8)} label="What You Get">
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
            How we're already helping clients.
          </h2>
          <div className="flex flex-col gap-0">
            <DeliverableRow
              title="Strategy Audit"
              desc="We look at your current portfolio, analyze what's working and what's not, and identify gaps and opportunities."
            />
            <DeliverableRow
              title="Partnership Development"
              desc="Introductions to strategic partners and potential grantees your network hasn't surfaced."
            />
            <DeliverableRow
              title="Program Design & Management"
              desc="If something's missing, we build it and run it with you."
            />
            <DeliverableRow
              title="Intelligence Feed"
              desc="Ongoing cross-sector briefings so you're never operating on an incomplete map."
            />
            <DeliverableRow
              title="Comms Support"
              desc="Day-to-day material production. Internal and external communications."
              isLast
            />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 10: Origin Story ─── */}
      <DeckFrame ref={setRef(9)} label="Why We Built This">
        <div className="flex flex-col gap-6">
          {[
            "The donors had money but no map.",
            "The policy people had maps but no people.",
            "The culture people had people but no strategy.",
          ].map((line, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(18px, 2.6vw, 28px)",
                fontWeight: 400,
                color: "hsl(0 0% 100% / 0.7)",
                lineHeight: 1.5,
              }}
            >
              {line}
            </p>
          ))}
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(15px, 1.8vw, 20px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.4)",
              lineHeight: 1.6,
              marginTop: "8px",
            }}
          >
            Everyone was operating with a piece of the picture. Nobody had the whole thing.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.4vw, 26px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            We built the connective tissue.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 11: The Promise ─── */}
      <DeckFrame ref={setRef(10)} label="The Promise">
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
            You'll learn everything we know.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(15px, 2vw, 21px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.65,
            }}
          >
            This isn't some black box you'll depend on forever. Work with us and you'll understand multi-sector strategy deeply enough to run it yourself.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(16px, 2.2vw, 24px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.7)",
              lineHeight: 1.5,
            }}
          >
            We're building your capacity, not your dependency.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 12: First 90 Days ─── */}
      <DeckFrame ref={setRef(11)} label="First 90 Days">
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

      {/* ─── FRAME 13: Close ─── */}
      <DeckFrame ref={setRef(12)}>
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

const DeliverableRow = ({
  title,
  desc,
  isLast = false,
}: {
  title: string;
  desc: string;
  isLast?: boolean;
}) => (
  <div
    className="flex flex-col gap-2 py-5"
    style={{
      borderBottom: isLast ? "none" : "1px solid hsl(0 0% 100% / 0.06)",
    }}
  >
    <span
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(15px, 1.8vw, 19px)",
        fontWeight: 500,
        color: "hsl(0 0% 100% / 0.85)",
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
);

export default Deck;
