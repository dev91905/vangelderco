import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DeckFrame from "@/components/deck/DeckFrame";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TOTAL_FRAMES = 12;

/* ─── Reusable style fragments ─── */
const styles = {
  bold: { color: "hsl(0 0% 100% / 0.9)" } as React.CSSProperties,
  lightboxHeading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(18px, 2.5vw, 26px)",
    fontWeight: 500,
    color: "hsl(0 0% 100% / 0.95)",
    lineHeight: 1.4,
  } as React.CSSProperties,
  lightboxBody: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(13px, 1.5vw, 15px)",
    color: "hsl(0 0% 100% / 0.45)",
    lineHeight: 1.7,
  } as React.CSSProperties,
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
        <p style={styles.lightboxHeading}>
          Closing the clean energy workforce gap through culture, coalitions, and deep organizing.
        </p>

        <div className="flex flex-col gap-4">
          <p style={styles.lightboxBody}>
            <strong style={styles.bold}>Issue:</strong> After major federal climate legislation, philanthropy focused on consumer adoption — heat pumps, solar, tax credits. Blind spot: not enough skilled workers to install any of it. For every electrician leaving, only one was replacing them. A bottleneck was forming that could turn into a political liability — <em>not enough workers</em> becomes <em>this policy is failing.</em>
          </p>
          <p style={styles.lightboxBody}>
            <strong style={styles.bold}>What the donors missed:</strong> Workers already in trades loved their jobs — high pay, no student debt, AI-proof, portable. The public didn't know these careers existed. The issue wasn't lack of demand. It was that nobody had organized supply.
          </p>
          <p style={styles.lightboxBody}>
            <strong style={styles.bold}>What we were asked to do:</strong> Increase interest in skilled trades. Get people into jobs. Build a constituency of workers economically benefiting from the policy. Test whether that could create durable public support that crosses party lines.
          </p>
        </div>

        <div style={{ width: "40px", height: "1px", background: "hsl(0 80% 48% / 0.3)" }} />

        <div className="flex flex-col gap-4">
          <p style={styles.lightboxBody}>
            <strong style={styles.bold}>Phase 1 — Research.</strong> Interviewed funders, industry leaders, labor organizers, existing trades workers, the general public, and cultural experts across music, digital, radio, and news.
          </p>
          <p style={styles.lightboxBody}>
            <strong style={styles.bold}>Phase 2 — Coalition & cultural strategy.</strong> Briefed senior government officials alongside talent agencies. Key finding: climate was not what motivated workers — pay, debt avoidance, and career stability were. This expanded the artist pool dramatically. Country, hip-hop, and digital creators who would never engage a climate campaign were now in. Built a working coalition across industry, labor, government, community organizations, nonprofits, and cultural sectors.
          </p>
          <p style={styles.lightboxBody}>
            <strong style={styles.bold}>Phase 3 — Pilots.</strong> Free concerts in four cities. Artists matched to each market via streaming data and voter files. Communities came to learn about careers and signed up for jobs as a form of mass action.
          </p>
        </div>

        <div style={{ width: "40px", height: "1px", background: "hsl(0 80% 48% / 0.3)" }} />

        <div className="flex flex-col gap-3">
          <p style={{ ...styles.lightboxBody, color: "hsl(0 0% 100% / 0.7)" }}>
            <strong style={styles.bold}>Every lever activated — at the same time:</strong>
          </p>
          {[
            "National artists. Local radio. Local digital creators. Targeted digital ads.",
            "Whisper campaigns leaked to artist fan bases in high schools — 25% of one event filled before it was announced.",
            "Local news, blogs, and national media covering it.",
            "Spotify push notifications to fans. Google integrating events into search results.",
          ].map((line, i) => (
            <p key={i} style={{ ...styles.lightboxBody, paddingLeft: "12px", borderLeft: "1px solid hsl(0 80% 48% / 0.2)" }}>
              {line}
            </p>
          ))}
          <p style={{ ...styles.lightboxBody, fontStyle: "italic", color: "hsl(0 0% 100% / 0.6)", marginTop: "8px" }}>
            This wasn't an op-ed and a digital ad. It was every available channel firing simultaneously — something most comms strategies never achieve because they're only working in one or two sectors.
          </p>
        </div>

        <div style={{ width: "40px", height: "1px", background: "hsl(0 80% 48% / 0.3)" }} />

        <div className="flex flex-col gap-3">
          <p style={{ ...styles.lightboxBody, color: "hsl(0 0% 100% / 0.7)" }}>
            <strong style={styles.bold}>What it produced:</strong>
          </p>
          {[
            "The White House had been trying to unite these partners for months. We did it in three weeks.",
            "Highest-paid training providers and lowest-income community organizations in the same room. An immediate pipeline between workers who needed jobs and employers who couldn't fill them.",
          ].map((line, i) => (
            <p key={i} style={{ ...styles.lightboxBody, paddingLeft: "12px", borderLeft: "1px solid hsl(0 80% 48% / 0.2)" }}>
              {line}
            </p>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-2">
          <StatChip value="40K" label="Reached" />
          <StatChip value="4,000" label="Registered" />
          <StatChip value="10–11%" label="Conversion Rate" />
          <StatChip value="$40–80" label="Cost per Lead" />
        </div>

        <p style={{ ...styles.lightboxBody, color: "hsl(0 0% 100% / 0.5)", marginTop: "4px" }}>
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

/* ─── Reusable style fragments ─── */
const styles = {
  bold: { color: "hsl(0 0% 100% / 0.9)" } as React.CSSProperties,
  lightboxHeading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(18px, 2.5vw, 26px)",
    fontWeight: 500,
    color: "hsl(0 0% 100% / 0.95)",
    lineHeight: 1.4,
  } as React.CSSProperties,
  lightboxBody: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(13px, 1.5vw, 15px)",
    color: "hsl(0 0% 100% / 0.45)",
    lineHeight: 1.7,
  } as React.CSSProperties,
};

const Deck = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const lastFrameRef = useRef(0);
  const { playHoverGlitch } = useGlitchSFX();
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

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
      if (selectedCase !== null) return; // don't navigate when lightbox open
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
          <div style={{ width: "40px", height: "1px", background: "hsl(0 80% 48% / 0.6)" }} />
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(16px, 2.2vw, 24px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.7)",
              lineHeight: 1.5,
              maxWidth: "600px",
            }}
          >
            Strategic communications for donor advisors and program officers who need <em style={{ fontStyle: "italic", color: "hsl(0 0% 100% / 0.9)" }}>more than comms.</em>
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(13px, 1.6vw, 17px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.4)",
              lineHeight: 1.55,
              maxWidth: "520px",
            }}
          >
            Advice, connections, and hands-on support to make your stratcomm strategy actually work.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 2: The Problem ─── */}
      <DeckFrame ref={setRef(1)} label="The Problem">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.6vw, 28px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.45,
            }}
          >
            Common problems for anyone overseeing a stratcomm portfolio.
          </p>
          <div className="flex flex-col gap-5">
            <NumberedProblem n={1} title="No institutional memory." desc="No record of what was funded, why, or what it produced. Grants renewed because they've always been renewed." />
            <NumberedProblem n={2} title="No decision-making framework." desc="No structure for evaluating new proposals. The default is inertia." />
            <NumberedProblem n={3} title="No access beyond the usual channels." desc="Grantees rely on comms firms, paid media, op-eds, and documentaries. Entire cultural sectors — music, digital creators, faith communities, veteran groups, campuses — sit untouched. Nobody has the relationships to reach them." />
            <NumberedProblem n={4} title="No real impact measurement." desc="Grantees report views and impressions. No framework connecting spend to policy outcomes, coalition growth, or anything durable." />
            <NumberedProblem n={5} title="No one on the team comes from media." desc="When leadership asks why the strategy isn't translating into results, it's hard to diagnose without experience inside the sectors you're trying to activate." />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 3: What You're Up Against ─── */}
      <DeckFrame ref={setRef(2)} label="What You're Up Against">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.6vw, 28px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.45,
            }}
          >
            Same goal. Completely different process.
          </p>
          <ComparisonTable
            leftTitle="Your Side"
            rightTitle="Their Side"
            rows={[
              { step: "Research", left: "Focus groups to test messages", right: "Monitor what's already resonating organically" },
              { step: "Content", left: "Polished ads, op-eds, documentaries", right: "Entire creator ecosystems, talent pipelines, and self-funded investigative journalism — content around the clock" },
              { step: "Distribution", left: "Buy placements on platforms", right: "Acquire the platforms and change the algorithms" },
              { step: "Engagement", left: "Pay handfuls of influencers to post", right: "Organize at massive scale — churches, campuses, veteran groups, local networks. Grassroots groups as distribution." },
              { step: "Measurement", left: "Count impressions and report reach", right: "Track what's shifting polls, moving legislation, growing their base" },
              { step: "Iteration", left: "Declare success and fund the next one", right: "Cut what's failing, pour resources into what's working" },
            ]}
          />
          <div className="flex flex-col gap-4 mt-2">
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                color: "hsl(0 0% 100% / 0.45)",
                lineHeight: 1.65,
              }}
            >
              You test messages in a petri dish and pay people to watch the winners. Facebook counts a <strong style={{ color: "hsl(0 0% 100% / 0.8)" }}>three-second scroll-by</strong> as a view.
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                color: "hsl(0 0% 100% / 0.45)",
                lineHeight: 1.65,
              }}
            >
              They skip the test tube — fund everything, watch what catches fire organically, and supercharge it.
            </p>
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 4: What Effective Portfolios Have in Common ─── */}
      <DeckFrame ref={setRef(3)} label="Effective Portfolios">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.6vw, 28px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.45,
            }}
          >
            Three hallmarks across portfolios that are actually producing results.
          </p>
          <div className="flex flex-col gap-6">
            <HallmarkCard
              title="They're using the full culture stack."
              rationale="Music, faith communities, digital creators, campuses, veteran groups, local media — organizing infrastructure, not comms channels. Engaging them brings unexpected partners to the same table. If a portfolio is only in news and documentary, the most powerful levers aren't being touched."
              help="Connect you to every cultural sector you're missing, map which networks reach the audiences you need, and integrate them into your strategy from the start."
            />
            <HallmarkCard
              title="They're coordinating across sectors."
              rationale="Effective strategies have a policy pathway pre-engineered — industry, labor, grassroots, and culture lined up before any content goes live. Grantees in silos can't deliver durable outcomes alone."
              help="Design multi-sector strategies where comms, policy, industry, labor, grassroots, and culture reinforce each other. We get everyone to the table and make sure every partner knows their role."
            />
            <HallmarkCard
              title="They're organizing for growth."
              rationale="Sustained base-building with trusted local leaders — not cycling the same people through the same events. That growing base is the power everyone needs to win and protect the win."
              help="Run live campaigns that engage new audiences and sustain organizing. Identify emerging leaders with built-in trust. Audit grantees for real vs. performed organizing and restructure around what's producing power."
            />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 5: Core Capabilities ─── */}
      <DeckFrame ref={setRef(4)} label="Core Capabilities">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.6vw, 28px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.45,
            }}
          >
            How people typically engage with us.
          </p>
          <div className="flex flex-col gap-0">
            <DeliverableRow title="Portfolio Audit" desc="Deep dive into your grantees, past investments, and records. We interview grantees directly. You get the institutional record that's never existed." />
            <DeliverableRow title="Strategic Framework" desc="Customized decision-making rubric for evaluating grants against strategy, not inertia. A tool your team owns and uses independently." />
            <DeliverableRow title="Impact Measurement & Reporting" desc="Co-designed around your objectives. Real indicators of power — sectors convened, policy outcomes, capital unlocked — replacing vanity metrics. Built to tell the story to leadership, board, and co-funders." />
            <DeliverableRow title="Access & Introductions" desc="Cultural operatives across music, film/TV, digital, news. Co-funders, strategic partners. A 480-member donor advisor and program officer network for confidential intel-sharing." />
            <DeliverableRow title="Program Development & Management" desc="When the work surfaces a gap, we help build what doesn't exist — coalition, campaign, cultural activation, grant competition, or fund." />
            <DeliverableRow title="Training" desc="No dependency. You learn to evaluate cultural landscapes, run multi-sector campaigns, and tell real organizing from performed organizing. Built into every engagement, not an add-on. If we do our jobs right, you won't need us forever." isLast />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 6: How We Measure Impact ─── */}
      <DeckFrame ref={setRef(5)} label="Impact Measurement">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.6vw, 28px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.45,
            }}
          >
            Most grantee reports measure activity. We measure power.
          </p>
          <ComparisonTable
            leftTitle="What Most Grantees Report"
            rightTitle="What We Track"
            rows={[
              { step: "", left: "Impressions and reach", right: "New sectors at the table" },
              { step: "", left: "Video views (3-second scroll-bys)", right: "Decision-makers convened" },
              { step: "", left: "Media mentions", right: "Coalition growth — expanding or static?" },
              { step: "", left: "Social engagement", right: "Policy outcomes — legislation, executive action, regulation" },
              { step: "", left: "Website traffic", right: "Capital unlocked from new sources" },
              { step: "", left: '"Awareness"', right: "Infrastructure that outlasts the campaign" },
            ]}
            hideStepColumn
          />
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(13px, 1.6vw, 17px)",
              fontStyle: "italic",
              color: "hsl(0 80% 48% / 0.7)",
              lineHeight: 1.55,
            }}
          >
            A campaign with 73 million views that doesn't convene a single new partner, catalyze a single policy conversation, or unlock a single dollar — that campaign failed.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 7: How Engagements Work ─── */}
      <DeckFrame ref={setRef(6)} label="How Engagements Work">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.6vw, 28px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.45,
            }}
          >
            Two types of clients come to us.
          </p>

          <div className="flex flex-col gap-4">
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(14px, 1.6vw, 17px)", color: "hsl(0 0% 100% / 0.6)", lineHeight: 1.6 }}>
              <strong style={{ color: "hsl(0 0% 100% / 0.9)" }}>Already up to speed and need capacity?</strong> Let's scope it to your specific needs.
            </p>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(14px, 1.6vw, 17px)", color: "hsl(0 0% 100% / 0.6)", lineHeight: 1.6 }}>
              <strong style={{ color: "hsl(0 0% 100% / 0.9)" }}>Starting fresh?</strong> Two phases, roughly three months:
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <PhaseBlock
              label="Phase 1: Internal Review"
              period="4–6 weeks"
              bullets={[
                "Go through everything — grantees, systems, assumptions, goals.",
                "Voice-track what's been funded, what you're trying to accomplish, where things feel stuck.",
                "Identify the gap between where you are and where you need to be.",
              ]}
              deliverable="Diagnostic — here's what we're hearing, here's the delta, here's the plan."
            />
            <PhaseBlock
              label="Phase 2: External Engagement"
              period="6–8 weeks"
              bullets={[
                "Interview existing grantees. Flag what should concern you.",
                "Introduce external partners — cultural operatives, strategic partners, potential grantees, co-funders.",
                "Training on what's available and how these industries work. Deal flow on how new partners can strengthen existing grantees.",
              ]}
              deliverable="What to scale, what to cut, what to add. A rebalanced portfolio with the rationale to brief leadership."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <OptionCard
              label="You take it from here"
              title="You own it"
              desc="Diagnostic, recommendations, introductions in hand. We stay available for light advising as you need us."
            />
            <OptionCard
              label="We build it with you"
              title="Ongoing retainer"
              desc="Full team, managed alongside you, field experience running it yourself. Direct access. No layers."
            />
          </div>
        </div>
      </DeckFrame>

      {/* ─── FRAME 8: Who We Are ─── */}
      <DeckFrame ref={setRef(7)} label="Who We Are">
        <div className="flex flex-col gap-8">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(18px, 2.6vw, 28px)",
              fontWeight: 400,
              color: "hsl(0 0% 100% / 0.85)",
              lineHeight: 1.45,
            }}
          >
            We've been in your position — responsible for making stratcomm work, evaluating grantees, trying to show leadership the money is producing something real.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "hsl(0 0% 100% / 0.55)",
              lineHeight: 1.6,
            }}
          >
            The difference is where we came from. Our team is built from careers in <strong style={{ color: "hsl(0 0% 100% / 0.85)" }}>commercial media and entertainment</strong> — the industries your grantees are trying to reach.
          </p>
          <div className="flex flex-col gap-0">
            <SectorRow name="News" desc="Local and national — how stories get placed and why" />
            <SectorRow name="Music" desc="Labels, touring, festivals, artist strategy" />
            <SectorRow name="Film & TV" desc="Production, distribution, cultural impact" />
            <SectorRow name="Digital" desc="Advertising, creator economy — where opinion forms now" />
            <SectorRow name="PR" desc="Corporate, entertainment, crisis communications" />
            <SectorRow name="Philanthropy" desc="Running organizations, managing portfolios, advising donors" isLast />
          </div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "hsl(0 0% 100% / 0.55)",
              lineHeight: 1.6,
            }}
          >
            What's holding most donor advisors and program officers back isn't effort — it's <strong style={{ color: "hsl(0 0% 100% / 0.85)" }}>access and pattern recognition</strong> across these industries. That's what we transfer.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 9: The Promise ─── */}
      <DeckFrame ref={setRef(8)} label="The Promise">
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
          <div style={{ width: "40px", height: "1px", background: "hsl(0 80% 48% / 0.3)" }} />
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

      {/* ─── FRAME 10: CTA ─── */}
      <DeckFrame ref={setRef(9)}>
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
            Let's look at your portfolio together.
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

      {/* ─── FRAME 11: The Promise (separator) ─── */}
      <DeckFrame ref={setRef(10)} label="Case Studies">
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
            Want to see it in action?
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(13px, 1.5vw, 16px)",
              color: "hsl(0 0% 100% / 0.35)",
              lineHeight: 1.5,
            }}
          >
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
              />
            ))}
          </div>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "hsl(0 0% 100% / 0.25)",
              marginTop: "4px",
            }}
          >
            Full case studies coming soon. Clean Energy Workforce available now.
          </p>
        </div>
      </DeckFrame>

      {/* ─── FRAME 12: spacer to allow last frame to snap ─── */}
      <DeckFrame ref={setRef(11)}>
        <div className="flex flex-col items-center text-center gap-6">
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "hsl(0 0% 100% / 0.15)",
            }}
          >
            ↑ Scroll up to explore case studies
          </p>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(24px, 4vw, 44px)",
              fontWeight: 500,
              color: "hsl(0 0% 100% / 0.08)",
              letterSpacing: "-0.02em",
            }}
          >
            VGC StratComm
          </h2>
        </div>
      </DeckFrame>

      {/* ─── Case Study Lightbox ─── */}
      <Dialog open={selectedCase !== null} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-y-auto"
          style={{
            background: "hsl(0 0% 4%)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            borderTop: "2px solid hsl(0 80% 48% / 0.5)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(18px, 2.5vw, 24px)",
                fontWeight: 500,
                color: "hsl(0 0% 100% / 0.9)",
              }}
            >
              {selectedCase !== null ? CASE_STUDIES[selectedCase].name : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedCase !== null && CASE_STUDIES[selectedCase].content ? (
            CASE_STUDIES[selectedCase].content
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "16px",
                  color: "hsl(0 0% 100% / 0.5)",
                }}
              >
                Full case study coming soon.
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  color: "hsl(0 0% 100% / 0.25)",
                }}
              >
                {selectedCase !== null ? CASE_STUDIES[selectedCase].outcome : ""}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Inline Components ─── */

const NumberedProblem = ({ n, title, desc }: { n: number; title: string; desc: string }) => (
  <div className="flex gap-4">
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "clamp(16px, 2vw, 22px)",
        fontWeight: 600,
        color: "hsl(0 80% 48% / 0.7)",
        lineHeight: 1.4,
        minWidth: "28px",
      }}
    >
      {n}.
    </span>
    <p
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(13px, 1.5vw, 16px)",
        color: "hsl(0 0% 100% / 0.45)",
        lineHeight: 1.65,
      }}
    >
      <strong style={{ color: "hsl(0 0% 100% / 0.85)" }}>{title}</strong>{" "}
      {desc}
    </p>
  </div>
);

const ComparisonTable = ({
  leftTitle,
  rightTitle,
  rows,
  hideStepColumn = false,
}: {
  leftTitle: string;
  rightTitle: string;
  rows: { step: string; left: string; right: string }[];
  hideStepColumn?: boolean;
}) => (
  <div className="w-full overflow-x-auto -mx-2 px-2">
    <table className="w-full border-collapse" style={{ minWidth: hideStepColumn ? "400px" : "500px" }}>
      <thead>
        <tr>
          {!hideStepColumn && <th style={{ ...thStyle, width: "100px" }} />}
          <th style={{ ...thStyle, color: "hsl(0 0% 100% / 0.3)" }}>{leftTitle}</th>
          <th style={{ ...thStyle, color: "hsl(0 80% 48% / 0.8)" }}>{rightTitle}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {!hideStepColumn && (
              <td style={{ ...tdStyle, fontWeight: 600, color: "hsl(0 0% 100% / 0.6)" }}>
                {row.step}
              </td>
            )}
            <td style={{ ...tdStyle, color: "hsl(0 0% 100% / 0.3)" }}>{row.left}</td>
            <td style={{ ...tdStyle, color: "hsl(0 0% 100% / 0.6)", borderLeft: "2px solid hsl(0 80% 48% / 0.2)" }}>{row.right}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const thStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "9px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "1px solid hsl(0 0% 100% / 0.08)",
};

const tdStyle: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: "clamp(11px, 1.3vw, 14px)",
  lineHeight: 1.6,
  padding: "10px 12px",
  borderBottom: "1px solid hsl(0 0% 100% / 0.04)",
  verticalAlign: "top",
};

const HallmarkCard = ({
  title,
  rationale,
  help,
}: {
  title: string;
  rationale: string;
  help: string;
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
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(15px, 1.8vw, 19px)",
        fontWeight: 500,
        color: "hsl(0 0% 100% / 0.9)",
        marginBottom: "12px",
      }}
    >
      {title}
    </p>
    <p
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(12px, 1.4vw, 15px)",
        color: "hsl(0 0% 100% / 0.45)",
        lineHeight: 1.7,
        marginBottom: "12px",
      }}
    >
      {rationale}
    </p>
    <p
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(12px, 1.4vw, 15px)",
        color: "hsl(0 0% 100% / 0.55)",
        lineHeight: 1.7,
        fontStyle: "italic",
      }}
    >
      <span style={{ color: "hsl(0 80% 48% / 0.7)", fontStyle: "normal", fontWeight: 500 }}>How we help: </span>
      {help}
    </p>
  </div>
);

const PhaseBlock = ({
  label,
  period,
  bullets,
  deliverable,
}: {
  label: string;
  period: string;
  bullets: string[];
  deliverable: string;
}) => (
  <div
    style={{
      borderLeft: "2px solid hsl(0 80% 48% / 0.3)",
      paddingLeft: "20px",
    }}
  >
    <div className="flex items-baseline gap-3 mb-3">
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(15px, 1.8vw, 19px)",
          fontWeight: 500,
          color: "hsl(0 0% 100% / 0.9)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "hsl(0 80% 48% / 0.6)",
        }}
      >
        {period}
      </span>
    </div>
    {bullets.map((b, i) => (
      <p
        key={i}
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(12px, 1.4vw, 14px)",
          color: "hsl(0 0% 100% / 0.4)",
          lineHeight: 1.65,
          marginBottom: "6px",
          paddingLeft: "12px",
        }}
      >
        {b}
      </p>
    ))}
    <p
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(12px, 1.4vw, 14px)",
        color: "hsl(0 0% 100% / 0.6)",
        lineHeight: 1.65,
        marginTop: "8px",
      }}
    >
      <strong style={{ color: "hsl(0 0% 100% / 0.8)" }}>Deliverable:</strong> {deliverable}
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

const SectorRow = ({
  name,
  desc,
  isLast = false,
}: {
  name: string;
  desc: string;
  isLast?: boolean;
}) => (
  <div
    className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3"
    style={{
      borderBottom: isLast ? "none" : "1px solid hsl(0 0% 100% / 0.06)",
    }}
  >
    <span
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(14px, 1.6vw, 17px)",
        fontWeight: 500,
        color: "hsl(0 0% 100% / 0.85)",
        minWidth: "120px",
      }}
    >
      {name}
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

const CaseStudyCard = ({
  name,
  outcome,
  hasContent,
  onClick,
}: {
  name: string;
  outcome: string;
  hasContent: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="text-left transition-all duration-200"
    style={{
      border: "1px solid hsl(0 0% 100% / 0.08)",
      borderTop: hasContent ? "2px solid hsl(0 80% 48% / 0.5)" : "2px solid hsl(0 0% 100% / 0.08)",
      padding: "20px",
      background: "transparent",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.15)";
      e.currentTarget.style.background = "hsl(0 0% 100% / 0.02)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.08)";
      e.currentTarget.style.background = "transparent";
    }}
  >
    <p
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(14px, 1.6vw, 17px)",
        fontWeight: 500,
        color: "hsl(0 0% 100% / 0.85)",
        marginBottom: "6px",
      }}
    >
      {name}
    </p>
    <p
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.1em",
        color: hasContent ? "hsl(0 80% 48% / 0.6)" : "hsl(0 0% 100% / 0.25)",
        lineHeight: 1.5,
      }}
    >
      {outcome}
    </p>
  </button>
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
