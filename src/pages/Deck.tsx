import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DeckFrame from "@/components/deck/DeckFrame";
import useGlitchSFX from "@/hooks/useGlitchSFX";

const TOTAL_FRAMES = 11;

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
            VGC StratComm
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
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(16px, 2.2vw, 24px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.7)",
              lineHeight: 1.5,
              maxWidth: "560px",
            }}
          >
            Strategic communications{"\n"}for donor advisors who{"\n"}need more than comms.
          </p>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(10px, 1.2vw, 13px)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "hsl(0 0% 100% / 0.3)",
              maxWidth: "500px",
            }}
          >
            Cultural strategy. Cross-sector intelligence. Deep organizing.
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
            You've invested in paid media, comms firms, op-eds, maybe a documentary. None of it is moving the needle.
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
              Facebook counts a three-second scroll-by as a view. You're paying for impressions that aren't real engagement. Your reports say the campaign worked. Your outcomes say it didn't.
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
              Meanwhile, the opposition isn't running a better version of your playbook. They're running a fundamentally different one.
            </p>
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 3: What You're Up Against ─── */}
      <DeckFrame ref={setRef(2)} label="What You're Up Against">
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
            While you test messages in a focus group, they're acquiring the platforms you advertise on.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <ContrastColumn
              title="The Standard Playbook"
              items={[
                "Test a message in a focus group",
                "Put paid media behind it",
                "Place op-eds and earned media",
                "Fund a documentary",
                "Hire influencers",
                "Report impressions as impact",
              ]}
            />
            <ContrastColumn
              title="What the Other Side Is Doing"
              accent
              items={[
                "Acquiring legacy media platforms and changing the programming",
                "Investing in digital creator economies where ideology forms in real time",
                "Funding investigative journalism and developing new media talent",
                "Running public polls designed to shift policy baselines",
                "Organizing in churches, veteran groups, and local business networks",
                "Finding what catches fire organically — then supercharging it",
              ]}
            />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 4: The Real Discipline ─── */}
      <DeckFrame ref={setRef(3)} label="The Real Discipline">
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
            Strategic communications isn't a media buy. It's the integration of culture, coalition power, and deep public organizing — aimed at the same target, at the same time.
          </p>
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "hsl(0 80% 48% / 0.3)",
            }}
          />
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(15px, 2vw, 21px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.65,
            }}
          >
            Most donor advisors have access to one or two of these tools. Almost nobody is operating all three. That's the gap. And it's the difference between spending money and building power.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 5: Three Capabilities ─── */}
      <DeckFrame ref={setRef(4)} label="Three Capabilities">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(22px, 3vw, 34px)",
              fontWeight: 500,
              color: "hsl(0 0% 100%)",
              letterSpacing: "-0.01em",
            }}
          >
            What we do.
          </p>
          <div className="flex flex-col gap-6">
            <CapCard title="Cultural Strategy">
              Working across the music industry, film and TV, digital creators, brands, faith institutions, veteran groups, athletes, and campuses — every place where people gather around an interest that has nothing to do with politics. We organize these sectors into your strategy from the start. Not as a comms afterthought. As the infrastructure.
            </CapCard>
            <CapCard title="Cross-Sector Intelligence">
              How does a philanthropic dollar unlock community foundations, the national security community, public utilities, policy, labor, and culture — simultaneously? We already manage those relationships. We build tools to help you see the full landscape, identify where the leverage is, and run campaigns that pull every lever at once.
            </CapCard>
            <CapCard title="Deep Organizing">
              Not mass mobilization. Not turning out the same people to the same rallies. Deep organizing means identifying organic leaders who already have trust in a community, building sustained infrastructure around them, and growing the base — so you're building durable power, not spending hundreds of millions on something that fizzles in four years.
            </CapCard>
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 6: Proof of Concept ─── */}
      <DeckFrame ref={setRef(5)} label="Proof of Concept">
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
            It works when you integrate all three.
          </p>
          <div
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
                marginBottom: "12px",
              }}
            >
              Case Study
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(15px, 2vw, 20px)",
                fontWeight: 400,
                color: "hsl(0 0% 100% / 0.7)",
                lineHeight: 1.55,
                marginBottom: "16px",
              }}
            >
              A national coalition needed to recruit workers into skilled trades — $59K starting, no degree required. Every partner assumed the pitch was climate.
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(13px, 1.6vw, 17px)",
                color: "hsl(0 0% 100% / 0.45)",
                lineHeight: 1.65,
                marginBottom: "16px",
              }}
            >
              It wasn't. Across four pilot cities — progressive and conservative — climate messaging fell flat. What moved people: pay, avoiding student debt, building something in their own community.
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(13px, 1.6vw, 17px)",
                color: "hsl(0 0% 100% / 0.45)",
                lineHeight: 1.65,
                marginBottom: "16px",
              }}
            >
              We redesigned the strategy around free concerts with locally trending artists identified through streaming data and voter files. The concerts weren't a sideshow — they were the organizing mechanism. Entry required a workforce survey. Leads flowed directly to union partners and industry training programs.
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(14px, 1.8vw, 18px)",
                fontStyle: "italic",
                color: "hsl(0 80% 48% / 0.7)",
                lineHeight: 1.55,
              }}
            >
              The culture wasn't the wrapper. It was the engine. And the pilot data reshaped every subsequent donor conversation.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            <StatChip value="4 CITIES" label="Pilot Markets" />
            <StatChip value="11,400" label="Leads Generated" />
            <StatChip value="3.2×" label="Conversion vs Control" />
            <StatChip value="$59K" label="Starting Salary" />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 7: How We Work ─── */}
      <DeckFrame ref={setRef(6)} label="How We Work">
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
            What an engagement looks like.
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
              isLast
            />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 8: First 90 Days ─── */}
      <DeckFrame ref={setRef(7)} label="First 90 Days">
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
            A three-month engagement with clear deliverables at every stage.
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
              isLast
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <OptionCard
              label="Option A"
              title="Run it yourself"
              desc="You walk away with a complete strategic plan, a restructured portfolio, new partnerships in place, and the knowledge to execute independently. The engagement is done. You're equipped."
            />
            <OptionCard
              label="Option B"
              title="Ongoing retainer"
              desc="We continue working together — managing coalitions, running campaigns, delivering intelligence, and building your capacity month over month. Direct access. No layers."
            />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 9: Why This Exists ─── */}
      <DeckFrame ref={setRef(8)} label="Why This Exists">
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
            We spent a decade inside the system. We kept hitting the same wall.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="flex flex-col gap-5">
              {[
                "Donors had money but no map. They funded what their program officers surfaced — usually the same organizations everyone already knew about.",
                "Policy people had maps but no people. They could identify the right committee chair but couldn't turn out a room.",
                "Culture people had people but no strategy. They could fill a stadium but nobody knew what to do with the crowd once they had it.",
              ].map((line, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "clamp(13px, 1.6vw, 17px)",
                    color: "hsl(0 0% 100% / 0.5)",
                    lineHeight: 1.65,
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(13px, 1.6vw, 17px)",
                  color: "hsl(0 0% 100% / 0.5)",
                  lineHeight: 1.65,
                }}
              >
                And the donor advisors — the people trying to connect all of this — were stuck cycling through the same three tools: a comms firm, a paid media buy, and a hope that someone would watch the documentary.
              </p>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(13px, 1.6vw, 17px)",
                  color: "hsl(0 0% 100% / 0.45)",
                  lineHeight: 1.65,
                }}
              >
                Everyone had a piece of the picture. Nobody had the whole thing.
              </p>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(16px, 2.2vw, 22px)",
                  fontWeight: 400,
                  color: "hsl(0 0% 100% / 0.85)",
                  lineHeight: 1.5,
                }}
              >
                We built VGC StratComm to close that gap — not to replace donor advisors, but to make them dramatically more effective.
              </p>
            </div>
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 10: The Promise ─── */}
      <DeckFrame ref={setRef(9)} label="The Promise">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(22px, 3.5vw, 40px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.95)",
              lineHeight: 1.35,
            }}
          >
            Everything we know becomes everything you know.
          </p>
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "hsl(0 80% 48% / 0.3)",
            }}
          />
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(15px, 2vw, 21px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.65,
            }}
          >
            We're not building a dependency. Strategic communications is expansive and powerful, but it's completely learnable. If you work with us, you'll learn how to do this yourself. That's not a risk to our business — it's the entire point.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 11: CTA ─── */}
      <DeckFrame ref={setRef(10)}>
        <div className="flex flex-col items-center text-center gap-8">
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 500,
              color: "hsl(0 0% 100%)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            VGC StratComm
          </h2>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(15px, 2vw, 21px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.5)",
              lineHeight: 1.55,
              maxWidth: "520px",
            }}
          >
            If you're ready to stop spending on comms that don't move anyone — let's talk.
          </p>
          <a
            href="mailto:info@vgcstratcomm.com"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "hsl(0 80% 48% / 0.9)",
              border: "1px solid hsl(0 80% 48% / 0.4)",
              padding: "14px 36px",
              textDecoration: "none",
              transition: "border-color 300ms, color 300ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "hsl(0 80% 48% / 0.8)";
              e.currentTarget.style.color = "hsl(0 80% 48% / 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "hsl(0 80% 48% / 0.4)";
              e.currentTarget.style.color = "hsl(0 80% 48% / 0.9)";
            }}
          >
            Get in touch
          </a>
        </div>
      </DeckFrame>
    </div>
  );
};

/* ─── Inline Components ─── */

const ContrastColumn = ({
  title,
  items,
  accent = false,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) => (
  <div className="flex flex-col gap-4">
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: accent ? "hsl(0 80% 48% / 0.8)" : "hsl(0 0% 100% / 0.3)",
      }}
    >
      {title}
    </span>
    {items.map((item, i) => (
      <p
        key={i}
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(12px, 1.4vw, 15px)",
          color: accent ? "hsl(0 0% 100% / 0.6)" : "hsl(0 0% 100% / 0.3)",
          lineHeight: 1.6,
          paddingLeft: "12px",
          borderLeft: accent
            ? "2px solid hsl(0 80% 48% / 0.3)"
            : "1px solid hsl(0 0% 100% / 0.08)",
        }}
      >
        {item}
      </p>
    ))}
  </div>
);

const CapCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      border: "1px solid hsl(0 0% 100% / 0.08)",
      borderTop: "2px solid hsl(0 80% 48% / 0.5)",
      padding: "24px",
    }}
  >
    <p
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "hsl(0 80% 48% / 0.8)",
        marginBottom: "12px",
      }}
    >
      {title}
    </p>
    <p
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(13px, 1.5vw, 16px)",
        color: "hsl(0 0% 100% / 0.5)",
        lineHeight: 1.7,
      }}
    >
      {children}
    </p>
  </div>
);

const OptionCard = ({
  label,
  title,
  desc,
}: {
  label: string;
  title: string;
  desc: string;
}) => (
  <div
    style={{
      border: "1px solid hsl(0 0% 100% / 0.08)",
      padding: "24px",
    }}
  >
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "9px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "hsl(0 80% 48% / 0.7)",
      }}
    >
      {label}
    </span>
    <p
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(16px, 2vw, 20px)",
        fontWeight: 500,
        color: "hsl(0 0% 100% / 0.9)",
        marginTop: "8px",
        marginBottom: "8px",
      }}
    >
      {title}
    </p>
    <p
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(12px, 1.4vw, 15px)",
        color: "hsl(0 0% 100% / 0.4)",
        lineHeight: 1.65,
      }}
    >
      {desc}
    </p>
  </div>
);

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
