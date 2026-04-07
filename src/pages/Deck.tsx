import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DeckFrame from "@/components/deck/DeckFrame";
import useGlitchSFX from "@/hooks/useGlitchSFX";

const TOTAL_FRAMES = 8;

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
            The infrastructure connecting culture, policy, and capital is broken.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(16px, 2vw, 22px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.45)",
              lineHeight: 1.6,
            }}
          >
            The people with resources and the people with reach operate in parallel — never in concert. Philanthropic capital deploys without cultural strategy. Advocacy campaigns launch without ground infrastructure. And the leaders closest to communities remain invisible to the institutions that could amplify them.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 3: Cultural Strategy ─── */}
      <DeckFrame ref={setRef(2)} label="Domain // 001">
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

      {/* ─── FRAME 4: Cross-Sector Intelligence ─── */}
      <DeckFrame ref={setRef(3)} label="Domain // 002">
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

      {/* ─── FRAME 5: Deep Organizing ─── */}
      <DeckFrame ref={setRef(4)} label="Domain // 003">
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

      {/* ─── FRAME 6: How It Works Together ─── */}
      <DeckFrame ref={setRef(5)} label="The System">
        <div className="flex flex-col gap-10 items-center text-center">
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(22px, 3vw, 36px)",
              fontWeight: 500,
              color: "hsl(0 0% 100%)",
            }}
          >
            Three domains. One system.
          </h2>
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center w-full">
            {[
              { num: "001", name: "Cultural Strategy", desc: "Shape the narrative" },
              { num: "002", name: "Cross-Sector", desc: "Align the capital" },
              { num: "003", name: "Deep Organizing", desc: "Build the ground" },
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    color: "hsl(0 80% 48% / 0.6)",
                  }}
                >
                  {d.num}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "clamp(16px, 2vw, 20px)",
                    fontWeight: 500,
                    color: "hsl(0 0% 100% / 0.9)",
                  }}
                >
                  {d.name}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    color: "hsl(0 0% 100% / 0.35)",
                  }}
                >
                  {d.desc}
                </span>
                {i < 2 && (
                  <div
                    className="hidden md:block"
                    style={{
                      position: "absolute",
                      width: "40px",
                      height: "1px",
                      background: "hsl(0 80% 48% / 0.2)",
                      right: "-25px",
                      top: "50%",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <p
            className="mt-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(13px, 1.6vw, 17px)",
              color: "hsl(0 0% 100% / 0.35)",
              lineHeight: 1.7,
              maxWidth: "600px",
            }}
          >
            Each domain reinforces the others. Cultural conditions create political space. Cross-sector alignment directs resources. Ground infrastructure converts both into durable power.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 7: Origin Story ─── */}
      <DeckFrame ref={setRef(6)} label="Why We Built This">
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
            We built this because we watched $500M in philanthropic capital deploy with no cultural strategy, no cross-sector coordination, and no ground infrastructure.
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
            The money moved. Nothing changed.
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
            We decided to build the connective tissue.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 8: Close ─── */}
      <DeckFrame ref={setRef(7)}>
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

export default Deck;
