import React, { useEffect, useRef, useState, useCallback, useMemo, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DeckFrame from "@/components/deck/DeckFrame";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import TypewriterHeading from "@/components/deck/TypewriterHeading";
import { useFrameReveal } from "@/hooks/useFrameReveal";
import { t } from "@/lib/theme";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ChevronDown } from "lucide-react";
import { calculateReadinessScore, getQuizGrade, type QuizAnswer } from "@/lib/deckScoring";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TOTAL_FRAMES = 12; // removed Frame 10 (The Promise)

/* ─── Aliases — pull from centralized theme ─── */
const f = {
  serif: t.serif,
  sans: t.sans,
  ink: t.ink,
  cream: t.cream,
  rule: t.rule,
  accent: t.accent,
};

const heading = t.heading;
const body = t.body;
const label = t.label;

/* ─── Pain points data ─── */
const PAIN_POINTS = [
  { id: "history", short: "Just getting started", detail: "No portfolio yet — still figuring out where to begin and what to fund." },
  { id: "evaluate", short: "Funding comms, no strategy", detail: "Money goes out the door, but nothing connects what we spend to outcomes." },
  { id: "access", short: "Limited channels", detail: "Op-eds, paid ads, social on repeat — no real reach into media or culture." },
  { id: "measurement", short: "Not sure what to measure", detail: "Campaigns are running, but we can't tell what's actually working or why." },
  { id: "expertise", short: "No expertise in-house", detail: "Nobody on staff has commercial media experience — when things break, we guess." },
];

/* ─── Quiz rows — 5 dimensions of strategic communications ─── */
const QUIZ_ROWS = [
  {
    dimension: "Strategy",
    traditional: "Start with your message. Use research to figure out how to deliver it.",
    nextgen: "Start with what's already moving. Put infrastructure and resources behind it.",
    traditionalLede: "That work still matters — but on its own, it misses what's already moving.",
    traditionalBullets: [
      "Focus groups test messages you already believe in, with people sorted by demographics — not by the value systems that actually drive behavior.",
      "If something organic is happening that doesn't fit your framework, you miss it or dismiss it as noise.",
      "The most effective operators do all of this and find where energy is already forming — then put infrastructure behind it.",
    ],
    nextgenLede: "You're building on real energy — not manufacturing it.",
    nextgenBullets: [
      "When people are already organizing around something they care about, you don't need to convince them to show up. You need to give them structure, resources, and strategy.",
      "This is how the most effective political networks operate. It's how foreign adversaries exploit domestic divisions — they find the anger, fund it, and shape it.",
      "The same principle works in reverse when it's used to build power for your side.",
    ],
  },
  {
    dimension: "Content",
    traditional: "Lead with credibility — documentaries, op-eds, explainers, paid ads.",
    nextgen: "Fund always-on participatory content and investigative journalism.",
    traditionalLede: "Credibility content still has a role — but on its own, it talks at people rather than inviting them in.",
    traditionalBullets: [
      "The gap is participatory, investigative content — creator ecosystems and journalism running around the clock.",
      "Political identity and cultural narrative form in real time. You need to be inside those conversations, not reacting after the fact.",
      "You need the credibility of prestige formats and the reach of always-on participatory content. Most portfolios only fund the first half.",
    ],
    nextgenLede: "Participatory content compounds. Prestige content gets filed away.",
    nextgenBullets: [
      "Creator ecosystems and investigative journalism running around the clock means you're inside the conversation as identity, conspiracy, and narrative form in real time.",
      "Audiences don't just consume this content — they spread it, remix it, and build identity around it.",
      "Prestige content still builds credibility, but participatory content builds community. You need both — the second one is where most portfolios have the gap.",
    ],
  },
  {
    dimension: "Distribution",
    traditional: "Buy targeted placements on major platforms. Optimize for reach and frequency.",
    nextgen: "Own or shape the platforms — the algorithms, editorial, programming.",
    traditionalLede: "Buying placements rents attention on someone else's platform, under someone else's rules.",
    traditionalBullets: [
      "The algorithm changes, your reach disappears. The platform shifts policy, your content gets deprioritized. You have no control.",
      "The most effective operators aren't buying ads on platforms — they're buying the platforms.",
      "When you own the infrastructure, you decide what gets seen — and that doesn't change when someone else rewrites their algorithm.",
    ],
    nextgenLede: "If you own the platform, you decide what millions of people see.",
    nextgenBullets: [
      "You shape the algorithm, the editorial direction, the programming. The most effective operators understood this early and invested accordingly.",
      "Buying placements is renting someone else's audience. Owning the channel means the rules are yours.",
      "And they stay yours when someone else's algorithm changes overnight.",
    ],
  },
  {
    dimension: "Engagement",
    traditional: "Partner with influencers to amplify your message to online audiences.",
    nextgen: "Organize offline — faith communities, campuses, business and legal networks.",
    traditionalLede: "Online amplification has value — but on its own, it stays exactly where the algorithm wants you.",
    traditionalBullets: [
      "Influencer partnerships stay online — scripted posts, retweets, celebrity endorsements. That's surface-level.",
      "The gap is offline. The most effective operators also fund faith communities, campuses, business associations, and legal networks — massive in-person infrastructure.",
      "You need online reach and offline organizing. Most portfolios only fund the first.",
    ],
    nextgenLede: "Real-world networks and gathering points carry built-in trust and turnout.",
    nextgenBullets: [
      "Faith communities, campuses, music venues, business associations, legal networks — these are massive structures where people already gather, show up, and trust each other.",
      "When you organize through them, you're building constituencies with collective power that shows up in person.",
      "Online reach matters too, but offline power is what turns attention into action. The most effective operators invest in both — the offline side is where most portfolios have the gap.",
    ],
  },
  {
    dimension: "Measurement",
    traditional: "Track reach, impressions, and awareness. Build the case it's landing.",
    nextgen: "Track who's showing up, what policy moved, what infrastructure formed.",
    traditionalLede: "Most of those \"views\" are three-second scroll-bys that Meta counts as a view.",
    traditionalBullets: [
      "Your audience saw your content while their thumb was in motion, and then it was gone. Nobody's thinking about you after that pass.",
      "You build a report showing millions of impressions, but impressions don't measure power.",
      "The programs that move the needle measure something different: Who showed up? Who's new? What policy moved? What infrastructure exists now that didn't before?",
    ],
    nextgenLede: "Tracking power, not impressions, tells you whether you're actually building something.",
    nextgenBullets: [
      "Most programs can show you reach numbers. Very few can show you who they brought into the movement and what changed because of it.",
      "One report says \"10 million impressions.\" The other says \"4,000 new people, two bills advanced, three permanent coalitions.\"",
      "One is noise. The other is power.",
    ],
  },

];

/* ─── Three domains ─── */
const DOMAINS = [
  { id: "cultural", title: "Cultural Strategy", tagline: "Use the full culture stack — not just news and documentary.", what: "Music, faith communities, digital creators, campuses, veteran groups, local media — organizing infrastructure, not comms channels.", unlocks: "Access to audiences your current grantees can't reach. Campaigns that feel organic because they are.", missed: "If a portfolio is only in news and documentary, the most powerful levers aren't being touched.", example: "We matched artists to markets using streaming data and voter files." },
  { id: "cross-sector", title: "Cross-Sector Campaigns", tagline: "Coordinate across sectors — policy pathway pre-engineered.", what: "Industry, labor, grassroots, and culture lined up before any content goes live.", unlocks: "Durable outcomes that survive the news cycle. Coalition power that compounds over time.", missed: "Grantees in silos can't deliver durable outcomes alone.", example: "We briefed senior government officials alongside talent agencies." },
  { id: "organizing", title: "Deep Organizing", tagline: "Organize for growth — not recycled engagement.", what: "Sustained base-building with trusted local leaders. Not cycling the same people through the same events.", unlocks: "A growing base that is the power everyone needs to win and protect the win.", missed: "Most campaigns reach the same audiences with the same messages.", example: "4,000 workers registered through live events in four cities." },
];

/* ─── Capabilities for ranking ─── */
const CAPABILITIES = [
  { id: "audit", title: "Portfolio Audit" },
  { id: "framework", title: "Strategy Development" },
  { id: "access", title: "Access & Introductions" },
  { id: "measurement", title: "Impact Measurement" },
  { id: "training", title: "Staff Training" },
  { id: "program", title: "Program Management" },
];

/* ─── Metrics ─── */
const ALL_METRICS = [
  "Impressions and reach",
  "Video views (3-second scroll-bys)",
  "Media mentions",
  "Social engagement",
  "Website traffic",
  '"Awareness"',
  "New sectors at the table",
  "Decision-makers convened",
  "Coalition growth",
  "Policy outcomes",
  "Capital unlocked",
  "Infrastructure outlasting the campaign",
];

/* ─── Case studies ─── */
const StatChip = ({ value, lbl }: { value: string; lbl: string }) => (
  <div className="flex flex-col px-4 py-3 rounded-lg" style={{ background: "hsl(var(--foreground))", border: "none" }}>
    <span style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 20px)", fontWeight: 700, color: "hsl(var(--primary-foreground))" }}>{value}</span>
    <span style={{ fontFamily: f.sans, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "4px", color: "hsl(var(--primary-foreground) / 0.7)" }}>{lbl}</span>
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
            { l: "What the donors missed", text: "Workers already in trades loved their jobs — high pay, no student debt, AI-proof, portable. The public didn't know these careers existed." },
            { l: "What we were asked to do", text: "Increase interest in skilled trades. Get people into jobs. Build a constituency of workers economically benefiting from the policy." },
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.ink(0.55), lineHeight: 1.7 }}>
              <strong style={{ color: f.ink(0.85) }}>{item.l}:</strong> {item.text}
            </p>
          ))}
        </div>
        <div style={{ width: "40px", height: "1px", background: f.ink(0.1) }} />
        <div className="flex flex-col gap-4">
          {[
            { l: "Phase 1 — Research", text: "Interviewed funders, industry leaders, labor organizers, existing trades workers, the general public, and cultural experts." },
            { l: "Phase 2 — Coalition & cultural strategy", text: "Key finding: climate was not what motivated workers — pay, debt avoidance, and career stability were." },
            { l: "Phase 3 — Pilots", text: "Free concerts in four cities. Artists matched to each market via streaming data and voter files." },
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.ink(0.55), lineHeight: 1.7 }}>
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
        <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 15px)", color: f.ink(0.55), marginTop: "4px", lineHeight: 1.7 }}>
          Pilot data informed local workforce policy. Capital unlocked from community foundations and new donors.
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


/* ─── Back button component ─── */
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: f.sans,
      fontSize: "12px",
      letterSpacing: "0.04em",
      color: f.ink(0.3),
      background: "none",
      border: "none",
      padding: "14px 12px",
      cursor: "pointer",
      transition: "color 200ms ease",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.color = f.ink(0.6); }}
    onMouseLeave={(e) => { e.currentTarget.style.color = f.ink(0.3); }}
  >
    ← Back
  </button>
);

/* ─── Continue button component ─── */
const ContinueButton = ({ onClick, disabled, label: btnLabel }: { onClick: () => void; disabled?: boolean; label?: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      fontFamily: f.sans,
      fontSize: "13px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      fontWeight: 500,
      color: disabled ? f.ink(0.2) : "hsl(var(--foreground))",
      background: disabled ? f.ink(0.04) : "hsl(var(--foreground) / var(--a-bg))",
      border: `1px solid ${disabled ? f.ink(0.06) : "hsl(var(--foreground) / var(--a-border))"}`,
      padding: "14px 32px",
      borderRadius: "999px",
      cursor: disabled ? "default" : "pointer",
      transition: "all 200ms ease",
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-low))"; e.currentTarget.style.borderColor = "hsl(var(--foreground) / var(--a-high))"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
    onMouseLeave={(e) => { e.currentTarget.style.background = disabled ? f.ink(0.04) : "hsl(var(--foreground) / var(--a-bg))"; e.currentTarget.style.borderColor = disabled ? f.ink(0.06) : "hsl(var(--foreground) / var(--a-border))"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    {btnLabel || "Continue →"}
  </button>
);

/* ─── Nav row: back + continue together ─── */
const NavRow = ({ onBack, onNext, disabled, nextLabel, justifyEnd }: { onBack?: () => void; onNext: () => void; disabled?: boolean; nextLabel?: string; justifyEnd?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: justifyEnd ? "flex-end" : "flex-start", gap: "4px" }}>
    {onBack && <BackButton onClick={onBack} />}
    <ContinueButton onClick={onNext} disabled={disabled} label={nextLabel} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   DECK COMPONENT — Interactive Quiz + Diagnostic Flow
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
  const [customOpen, setCustomOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [customSaved, setCustomSaved] = useState(false);

  /* ─── Quiz state (Frame 3) ─── */
  const [quizAnswers, setQuizAnswers] = useState<(QuizAnswer | null)[]>(Array(QUIZ_ROWS.length).fill(null));
  const [quizStep, setQuizStep] = useState(0); // 0..5 = questions, 6 = reveal
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [expandedDimension, setExpandedDimension] = useState<number | null>(null);

  // Randomize left/right placement per row (stable across re-renders)
  const quizOrderRef = useRef(QUIZ_ROWS.map(() => Math.random() > 0.5));
  const quizOrder = quizOrderRef.current;

  /* ─── Capabilities ranking (Frame 6) ─── */
  const [capabilitiesRanked, setCapabilitiesRanked] = useState<string[]>([]);

  /* ─── Metrics checklist (Frame 7) ─── */
  const [metricsChecked, setMetricsChecked] = useState<string[]>([]);

  /* ─── Media experience (Frame 9) ─── */
  const [hasMediaExperience, setHasMediaExperience] = useState<boolean | null>(null);

  /* CTA form state */
  const [ctaMode, setCtaMode] = useState<"thanks" | null>(null);
  const [ctaForm, setCtaForm] = useState({ firstName: "", lastName: "", organization: "", email: "" });
  const [ctaSubmitting, setCtaSubmitting] = useState(false);

  /* ─── Domains selected ─── */
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [engagementPath, setEngagementPath] = useState<"fresh" | "experienced" | null>(null);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [hallmarkSelections, setHallmarkSelections] = useState<Record<number, "doing" | "need">>({});
  const [expandedHallmarkIdx, setExpandedHallmarkIdx] = useState<number | null>(null);

  /* Booking link from settings */
  const { data: siteSettings } = useSiteSettings();
  const bookingLink = siteSettings?.booking_link || null;

  /* ─── Interaction gates ─── */
  const frameInteracted = useMemo(() => {
    const gates: Record<number, boolean> = {};
    gates[0] = true; // hero — always ok
    gates[1] = selectedPains.length > 0 || customSaved; // pain points
    gates[2] = quizAnswers.every(a => a !== null); // quiz complete
    gates[3] = Object.keys(hallmarkSelections).length >= 1; // hallmarks — assessed at least one
    gates[4] = selectedDomains.length > 0; // domains
    gates[5] = capabilitiesRanked.length >= 2; // capabilities — pick at least 2
    gates[6] = metricsChecked.length > 0; // metrics
    gates[7] = engagementPath !== null; // working together
    gates[8] = hasMediaExperience !== null; // media experience
    gates[9] = true; // CTA — always accessible
    gates[10] = true; // case studies
    gates[11] = true; // close
    return gates;
  }, [selectedPains, customSaved, quizAnswers, hallmarkSelections, selectedDomains, capabilitiesRanked, metricsChecked, engagementPath, hasMediaExperience]);

  /* ─── Scoring ─── */
  const diagnosticScore = useMemo(() => calculateReadinessScore({
    selectedPains,
    hasCustomChallenge: customSaved && customMessage.trim().length > 0,
    quizAnswers: quizAnswers.filter((a): a is QuizAnswer => a !== null),
    selectedDomains,
    capabilitiesRanked,
    metricsChecked,
    engagementPath,
    hasMediaExperience,
  }), [selectedPains, customSaved, customMessage, quizAnswers, selectedDomains, capabilitiesRanked, metricsChecked, engagementPath, hasMediaExperience]);

  

  const handleCtaSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!ctaForm.firstName.trim() || !ctaForm.lastName.trim() || !ctaForm.email.trim() || ctaSubmitting) return;
    setCtaSubmitting(true);
    await supabase.from("deck_contacts" as any).insert({
      first_name: ctaForm.firstName.trim(),
      last_name: ctaForm.lastName.trim(),
      organization: ctaForm.organization.trim() || null,
      email: ctaForm.email.trim(),
      custom_challenge: customSaved ? customMessage.trim() || null : null,
      selected_pains: selectedPains.length > 0 ? selectedPains : null,
      engagement_path: engagementPath || null,
      selected_domains: selectedDomains.length > 0 ? selectedDomains : null,
      readiness_score: diagnosticScore,
      quiz_answers: quizAnswers.filter((a): a is QuizAnswer => a !== null),
      metrics_checked: metricsChecked.length > 0 ? metricsChecked : null,
      capabilities_ranked: capabilitiesRanked.length > 0 ? capabilitiesRanked : null,
      has_media_experience: hasMediaExperience,
    } as any);
    setCtaSubmitting(false);
    setCtaMode("thanks");
  };

  const activeDomainData = DOMAINS.find((d) => d.id === activeDomain);
  const selectedPainDatas = PAIN_POINTS.filter((p) => selectedPains.includes(p.id));

  /* ─── Navigation ─── */
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
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        if (frameInteracted[currentFrame] !== false) {
          scrollToFrame(currentFrame + 1);
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        scrollToFrame(currentFrame - 1);
      } else if (e.key === "Escape") { navigate("/"); }
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("pointerdown", focusDeck);
    return () => { window.removeEventListener("keydown", handler); window.removeEventListener("pointerdown", focusDeck); window.clearTimeout(focusTimer); };
  }, [currentFrame, navigate, scrollToFrame, selectedCase, frameInteracted]);

  /* Wheel handler — never allow mouse wheel to move between frames */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      // Check if wheel is inside the results scroll panel
      const target = e.target as HTMLElement | null;
      const resultsPanel = target?.closest("[data-results-scroll='true']") as HTMLElement | null;

      if (resultsPanel) {
        // Allow scrolling inside the panel only if it can still scroll in that direction
        const atTop = resultsPanel.scrollTop <= 0;
        const atBottom = resultsPanel.scrollTop + resultsPanel.clientHeight >= resultsPanel.scrollHeight - 1;
        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;

        if ((scrollingDown && atBottom) || (scrollingUp && atTop)) {
          // Panel hit its limit — kill the event so it doesn't chain to the deck
          e.preventDefault();
          e.stopPropagation();
        }
        // Otherwise let the panel scroll normally
        return;
      }

      // Everything else: hard-lock the deck to the current frame
      e.preventDefault();

      const frameEl = frameRefs.current[currentFrame];
      if (!frameEl) return;
      const frameTop = frameEl.offsetTop;
      const frameBottom = frameTop + frameEl.scrollHeight;
      const maxScrollTop = Math.max(frameTop, frameBottom - el.clientHeight);
      el.scrollTop = Math.min(maxScrollTop, Math.max(frameTop, el.scrollTop));
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [currentFrame]);

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
  const r12 = useFrameReveal();

  /* ─── Quiz helpers ─── */
  const handleQuizPick = (rowIndex: number, picked: "traditional" | "nextgen") => {
    setQuizAnswers(prev => {
      const next = [...prev];
      next[rowIndex] = { dimension: QUIZ_ROWS[rowIndex].dimension, picked };
      return next;
    });
    // Auto-advance to next question after a small delay
    setTimeout(() => {
      if (rowIndex < QUIZ_ROWS.length - 1) {
        setQuizStep(rowIndex + 1);
      } else {
        setQuizStep(QUIZ_ROWS.length); // go to reveal
        setTimeout(() => setQuizRevealed(true), 600);
      }
    }, 400);
  };

  const nextgenPickCount = quizAnswers.filter(a => a?.picked === "nextgen").length;
  const isFreshStart = selectedPains.includes("history");

  /* ─── Step labels for progress ─── */
  const STEP_LABELS = ["Start", "Diagnosis", "Strategy", "Hallmarks", "Domains", "Capabilities", "Metrics", "Path", "Team", "Connect", "Cases", "Close"];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label="Interactive deck"
      className="relative deck-scroll outline-none"
      style={{
        height: "100dvh",
        width: "100vw",
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehaviorY: "none",
        scrollSnapType: "none",
        display: "flex",
        flexDirection: "column",
        background: "hsl(var(--background))",
      }}
    >

      {/* ─── Fixed UI Chrome — Top ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none" style={{ padding: "20px 28px" }}>
        <div className="flex items-center justify-between pointer-events-auto">
          <span style={{ fontFamily: f.sans, fontSize: "11px", letterSpacing: "0.08em", color: f.ink(0.35) }}>
            {STEP_LABELS[currentFrame] || ""} · {String(currentFrame + 1).padStart(2, "0")} / {String(TOTAL_FRAMES).padStart(2, "0")}
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

      {/* ─── Fixed UI Chrome — Bottom Nav (frames 1–10, not hero or close) ─── */}
      {currentFrame > 0 && currentFrame < TOTAL_FRAMES - 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" style={{ padding: "0 32px 28px" }}>
          <div className="flex items-center justify-between pointer-events-auto" style={{ maxWidth: "1400px", margin: "0 auto", gap: "16px" }}>
            <BackButton onClick={() => scrollToFrame(currentFrame - 1)} />
            {/* Typeform-style thin progress bar */}
            <div style={{ flex: 1, maxWidth: "280px", height: "3px", borderRadius: "2px", background: f.ink(0.06), overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${((currentFrame + 1) / TOTAL_FRAMES) * 100}%`,
                  background: "hsl(var(--foreground) / var(--a-mid))",
                  borderRadius: "2px",
                  transition: "width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              />
            </div>
            <ContinueButton onClick={() => scrollToFrame(currentFrame + 1)} />
          </div>
        </div>
      )}

      {/* ═══ FRAME 1: Hero ═══ */}
      <DeckFrame ref={setRef(0)} mode="wide">
        <div ref={r1.ref} className="flex flex-col items-start gap-12 min-h-[60vh] justify-center">
          <TypewriterHeading
            text="Let's diagnose your communications."
            active={r1.isActive}
            style={{
              fontFamily: f.sans,
              fontSize: "clamp(36px, 5.5vw, 64px)",
              fontWeight: 700,
              color: f.ink(0.92),
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: "720px",
            }}
          />
          <p
            style={{
              ...r1.stagger(1, 800, "blur-up"),
              ...body(0.4),
              fontFamily: f.serif,
              fontSize: "clamp(18px, 2.8vw, 32px)",
              fontWeight: 400,
              maxWidth: "700px",
              lineHeight: 1.4,
            }}
          >
            A five-minute diagnostic that benchmarks your strategic communications against the other side{" "}
            <em style={{ fontStyle: "italic", color: f.ink(0.65) }}>— and shows you exactly where the gaps are.</em>
          </p>
          <div
            style={{
              ...r1.stagger(2, 1200, "blur-up"),
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => scrollToFrame(1)}
              className="animate-pulse"
              style={{
                fontFamily: f.sans,
                fontSize: "13px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: "hsl(var(--foreground))",
                background: "hsl(var(--foreground) / var(--a-bg))",
                border: "1px solid hsl(var(--foreground) / var(--a-border))",
                padding: "16px 32px",
                borderRadius: "999px",
                transition: "transform 180ms ease, background 180ms ease, border-color 180ms ease",
                cursor: "pointer",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-low))"; e.currentTarget.style.borderColor = "hsl(var(--foreground) / var(--a-high))"; e.currentTarget.style.animation = "none"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-bg))"; e.currentTarget.style.borderColor = "hsl(var(--foreground) / var(--a-border))"; }}
            >
              Get started →
            </button>
            <span style={{ fontFamily: f.sans, fontSize: "12px", letterSpacing: "0.04em", color: f.ink(0.25) }}>
              ~5 minutes
            </span>
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 2: Self-Diagnosis ═══ */}
      <DeckFrame ref={setRef(1)} mode="wide">
        <div ref={r2.ref} className="flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-24">
            <p style={{ ...heading("clamp(28px, 4vw, 52px)"), fontWeight: 700, ...r2.stagger(0, 0, "blur-up"), flex: "0 0 auto", maxWidth: "560px" }}>
              Which best describes where you are?
            </p>
            <p style={{ fontFamily: f.sans, fontSize: "clamp(15px, 1.4vw, 18px)", color: f.ink(0.55), lineHeight: 1.6, ...r2.stagger(1, 200, "blur-up"), flex: "1 1 auto", paddingBottom: "clamp(6px, 0.8vw, 12px)" }}>
              Pick the one that's closest. This helps us tailor what comes next.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={r2.stagger(2, 300, "blur-scale")}>
            {PAIN_POINTS.map((pain, i) => {
              const isSelected = selectedPains.includes(pain.id);
              return (
                <button
                  key={pain.id}
                  onClick={() => setSelectedPains(prev => isSelected ? prev.filter(p => p !== pain.id) : [...prev, pain.id])}
                  className="text-left"
                  style={{
                    display: "flex", flexDirection: "column", padding: "28px 24px",
                    border: isSelected ? `1px solid hsl(var(--foreground) / var(--a-high))` : `1px solid ${f.ink(0.1)}`,
                    background: isSelected ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                    boxShadow: isSelected ? "0 0 24px hsl(var(--foreground) / 0.15), inset 0 1px 0 hsl(var(--foreground) / 0.1)" : "none",
                    borderRadius: "12px", cursor: "pointer",
                    opacity: r2.isActive ? 1 : 0,
                    transform: r2.isActive ? "scale(1) translateY(0)" : "scale(0.95) translateY(10px)",
                    filter: r2.isActive ? "blur(0px)" : "blur(4px)",
                    transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 80}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 80}ms, filter 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 80}ms, background 0.2s ease, border 0.2s ease, box-shadow 0.3s ease`,
                    minHeight: "180px",
                  }}
                >
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(15px, 1.8vw, 19px)", fontWeight: 700, color: f.ink(0.85), marginBottom: "12px" }}>{pain.short}</p>
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.ink(0.45), lineHeight: 1.6, flex: "1 1 auto" }}>{pain.detail}</p>
                </button>
              );
            })}
            {/* 6th card — Something else */}
            <div
              style={{
                display: "flex", flexDirection: "column", padding: "28px 24px",
                border: customSaved ? `1px solid hsl(var(--foreground) / var(--a-high))` : `1px solid ${f.ink(0.1)}`,
                background: customSaved ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                boxShadow: customSaved ? "0 0 24px hsl(var(--foreground) / 0.15), inset 0 1px 0 hsl(var(--foreground) / 0.1)" : "none",
                borderRadius: "12px",
                opacity: r2.isActive ? 1 : 0,
                transform: r2.isActive ? "scale(1) translateY(0)" : "scale(0.95) translateY(10px)",
                filter: r2.isActive ? "blur(0px)" : "blur(4px)",
                transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) 700ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 700ms, filter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 700ms, background 0.2s ease, border 0.2s ease, box-shadow 0.3s ease",
                minHeight: "180px",
              }}
            >
              <p style={{ fontFamily: f.sans, fontSize: "clamp(15px, 1.8vw, 19px)", fontWeight: 700, color: f.ink(0.85), marginBottom: "12px" }}>Something else</p>
              <form onSubmit={(e) => { e.preventDefault(); if (customMessage.trim()) { setCustomSaved(true); } }} style={{ display: "flex", flexDirection: "column", flex: "1 1 auto" }}>
                <textarea
                  value={customMessage}
                  onChange={(e) => { const val = e.target.value; if (val.split("\n").length > 2 || val.length > 140) return; setCustomMessage(val); if (customSaved) setCustomSaved(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && customMessage.trim()) { e.preventDefault(); setCustomSaved(true); } }}
                  placeholder="Tell us what you're dealing with…"
                  readOnly={customSaved}
                  onClick={() => { if (customSaved) setCustomSaved(false); }}
                  rows={2}
                  style={{
                    fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: customSaved ? f.ink(0.6) : f.ink(0.8),
                    background: customSaved ? "transparent" : `${f.ink(0.03)}`,
                    border: customSaved ? `1px solid transparent` : `1px solid ${f.ink(0.08)}`,
                    borderRadius: "6px", padding: "10px 12px", resize: "none", outline: "none", width: "100%",
                    lineHeight: 1.6, minHeight: "69px", maxHeight: "69px", overflow: "hidden",
                    cursor: customSaved ? "pointer" : "text", transition: "background 0.15s ease, border 0.15s ease",
                  }}
                  onFocus={(e) => { if (!customSaved) e.currentTarget.style.borderColor = f.ink(0.15); }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = f.ink(0.08); }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", minHeight: "11px" }}>
                  <p style={{ fontFamily: f.sans, fontSize: "11px", color: f.ink(0.25), lineHeight: 1, opacity: customSaved ? 1 : customMessage.trim() ? 1 : 0, transition: "opacity 0.2s ease" }}>
                    {customSaved ? "Click to edit" : "Press ↵ to submit"}
                  </p>
                  <p style={{ fontFamily: f.sans, fontSize: "11px", color: f.ink(customMessage.length > 120 ? 0.5 : 0.2), lineHeight: 1, opacity: customMessage.length > 0 ? 1 : 0, transition: "opacity 0.2s ease, color 0.2s ease" }}>
                    {customMessage.length}/140
                  </p>
                </div>
              </form>
            </div>
          </div>
          <div style={{ minHeight: "48px" }} />
        </div>
      </DeckFrame>

      {/* ═══ FRAME 3: Quiz — "Which sounds more effective?" ═══ */}
      <DeckFrame ref={setRef(2)} mode="wide">
        <div
          ref={r3.ref}
          className="flex flex-col"
          style={{
            width: "100%",
            minHeight: quizRevealed ? "auto" : "100%",
            justifyContent: quizRevealed ? "flex-start" : "center",
            paddingBottom: quizRevealed ? "clamp(128px, 18vh, 180px)" : "0",
          }}
        >
          {/* Header */}
          <div
            style={{
              marginBottom: quizRevealed ? "clamp(24px, 3vw, 32px)" : "clamp(24px, 4vw, 48px)",
              maxWidth: quizRevealed ? "960px" : "none",
            }}
          >
             {quizRevealed && (
               <p style={{ ...label("11px"), color: f.ink(0.32), marginBottom: "10px" }}>Your results</p>
             )}
             <p style={{ ...heading(quizRevealed ? "clamp(20px, 2.4vw, 30px)" : "clamp(24px, 3.5vw, 44px)"), fontWeight: 700, transition: "font-size 0.4s ease" }}>
               {quizRevealed
                 ? "Here's what your answers tell us."
                 : isFreshStart
                   ? "Which feels more like how you'd operate?"
                   : "Which feels more like how your portfolio operates?"
               }
             </p>
             {quizRevealed && (
               <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.3vw, 16px)", color: f.ink(0.4), marginTop: "10px", lineHeight: 1.6, maxWidth: "760px" }}>
                 The summary is at the top. Scroll for the breakdown and why each one matters.
               </p>
             )}
          </div>

          {/* Quiz questions — one at a time */}
          {!quizRevealed && quizStep < QUIZ_ROWS.length && (
            <div style={{ position: "relative", minHeight: "clamp(200px, 25vw, 320px)" }}>
              {QUIZ_ROWS.map((row, i) => {
                const isCurrent = i === quizStep;
                const answered = quizAnswers[i] !== null;
                const leftIsNextgen = quizOrder[i];
                const leftText = leftIsNextgen ? row.nextgen : row.traditional;
                const rightText = leftIsNextgen ? row.traditional : row.nextgen;
                const leftValue: "traditional" | "nextgen" = leftIsNextgen ? "nextgen" : "traditional";
                const rightValue: "traditional" | "nextgen" = leftIsNextgen ? "traditional" : "nextgen";

                return (
                  <div
                    key={i}
                    style={{
                      position: i === quizStep ? "relative" : "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      opacity: isCurrent ? 1 : 0,
                      transform: isCurrent ? "translateY(0)" : i > quizStep ? "translateY(24px)" : "translateY(-24px)",
                      filter: isCurrent ? "blur(0px)" : "blur(6px)",
                      transition: "opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), filter 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                      pointerEvents: isCurrent ? "auto" : "none",
                    }}
                  >
                    {/* Dimension label — first-class section header */}
                    <p
                      style={{
                        fontFamily: f.sans,
                        fontSize: "clamp(22px, 2.8vw, 32px)",
                        fontWeight: 700,
                        color: f.ink(0.82),
                        marginBottom: "clamp(6px, 1vw, 10px)",
                      }}
                    >
                      {row.dimension}
                    </p>
                    {/* Quiz step counter */}
                    <p
                      style={{
                        fontFamily: f.sans,
                        fontSize: "10px",
                        fontWeight: 500,
                        letterSpacing: "0.1em",
                        color: f.ink(0.2),
                        marginBottom: "clamp(16px, 2vw, 28px)",
                      }}
                    >
                      {i + 1} of {QUIZ_ROWS.length}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "clamp(16px, 3vw, 32px)" }}>
                      <button
                        onClick={() => handleQuizPick(i, leftValue)}
                        disabled={answered}
                        style={{
                          textAlign: "left",
                          padding: "clamp(16px, 2vw, 28px)",
                          borderRadius: "12px",
                          background: answered && quizAnswers[i]?.picked === leftValue ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                          border: answered && quizAnswers[i]?.picked === leftValue ? "1px solid hsl(var(--foreground) / var(--a-high))" : `1px solid ${f.ink(0.1)}`,
                          cursor: answered ? "default" : "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!answered) {
                            e.currentTarget.style.borderColor = f.ink(0.3);
                            e.currentTarget.style.background = f.ink(0.03);
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!answered) {
                            e.currentTarget.style.borderColor = f.ink(0.1);
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        <p style={{ ...label("9px"), color: f.ink(0.3), marginBottom: "10px" }}>Option A</p>
                        <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.5vw, 18px)", color: f.ink(0.7), lineHeight: 1.65 }}>{leftText}</p>
                      </button>

                      <button
                        onClick={() => handleQuizPick(i, rightValue)}
                        disabled={answered}
                        style={{
                          textAlign: "left",
                          padding: "clamp(16px, 2vw, 28px)",
                          borderRadius: "12px",
                          background: answered && quizAnswers[i]?.picked === rightValue ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                          border: answered && quizAnswers[i]?.picked === rightValue ? "1px solid hsl(var(--foreground) / var(--a-high))" : `1px solid ${f.ink(0.1)}`,
                          cursor: answered ? "default" : "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!answered) {
                            e.currentTarget.style.borderColor = f.ink(0.3);
                            e.currentTarget.style.background = f.ink(0.03);
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!answered) {
                            e.currentTarget.style.borderColor = f.ink(0.1);
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        <p style={{ ...label("9px"), color: f.ink(0.3), marginBottom: "10px" }}>Option B</p>
                        <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.5vw, 18px)", color: f.ink(0.7), lineHeight: 1.65 }}>{rightText}</p>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}


          {quizRevealed && (() => {
            const grade = getQuizGrade(nextgenPickCount, QUIZ_ROWS.length);
            return (
            <div style={{ width: "100%", maxWidth: "1100px", animation: "fade-up 0.5s ease-out" }}>
              <div className="flex flex-col lg:flex-row gap-8" style={{ alignItems: "flex-start" }}>
                {/* ── Sticky left: diagnostic grade ── */}
                <div className="lg:w-[38%] lg:sticky lg:top-8 lg:self-start flex flex-col gap-6">
                  <div
                    style={{
                      padding: "clamp(28px, 4vw, 40px)",
                      borderRadius: "20px",
                      background: "hsl(var(--foreground) / var(--a-bg))",
                      border: "1px solid hsl(var(--foreground) / var(--a-border-card))",
                    }}
                  >
                    <p style={{ ...label("10px"), color: f.ink(0.3), marginBottom: "16px" }}>Your diagnostic</p>
                    <p style={{ fontFamily: f.sans, fontSize: "clamp(22px, 2.8vw, 32px)", fontWeight: 700, color: f.ink(0.88), lineHeight: 1.15, marginBottom: "16px" }}>
                      {grade.grade}
                    </p>
                    <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.3vw, 16px)", color: f.ink(0.5), lineHeight: 1.7 }}>
                      {grade.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      containerRef.current?.scrollTo({ top: frameRefs.current[2]?.offsetTop || 0, behavior: "smooth" });
                      setTimeout(() => {
                        setQuizAnswers(Array(QUIZ_ROWS.length).fill(null));
                        setQuizStep(0);
                        setQuizRevealed(false);
                        setExpandedDimension(null);
                      }, 400);
                    }}
                    style={{
                      fontFamily: f.sans,
                      fontSize: "12px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: f.ink(0.72),
                      background: "hsl(var(--background))",
                      border: `1px solid ${f.ink(0.1)}`,
                      padding: "12px 18px",
                      borderRadius: "999px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      alignSelf: "flex-start",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = f.ink(0.24);
                      e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-bg-subtle))";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = f.ink(0.1);
                      e.currentTarget.style.background = "hsl(var(--background))";
                    }}
                  >
                    Start over
                  </button>
                </div>

                {/* ── Scrollable right: dimension breakdown ── */}
                <div
                  className="lg:w-[62%] flex flex-col gap-4 results-scrollbar"
                  data-results-scroll="true"
                  style={{
                    maxHeight: "calc(100dvh - 80px)",
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    paddingRight: "8px",
                    paddingBottom: "40px",
                  }}
                >
                  {QUIZ_ROWS.map((row, i) => {
                    const answer = quizAnswers[i];
                    const pickedNextGen = answer?.picked === "nextgen";
                    const selectedCopy = pickedNextGen ? row.nextgen : row.traditional;
                    const lede = pickedNextGen ? row.nextgenLede : row.traditionalLede;
                    const bullets = pickedNextGen ? row.nextgenBullets : row.traditionalBullets;
                    const explanationLabel = pickedNextGen ? "Why this works" : "The shift";
                    const isExpanded = expandedDimension === i;

                    return (
                      <div
                        key={i}
                        style={{
                          padding: "clamp(24px, 3vw, 36px)",
                          borderRadius: "16px",
                          background: "hsl(var(--foreground) / var(--a-bg-subtle))",
                          border: `1px solid ${f.ink(0.06)}`,
                        }}
                      >
                        {/* ── Header row: dot + dimension title ── */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                          <span style={{
                            display: "inline-block",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: pickedNextGen ? "hsl(142 50% 50%)" : f.ink(0.2),
                            flexShrink: 0,
                          }} />
                          <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 1.5vw, 20px)", fontWeight: 700, color: f.ink(0.85), letterSpacing: "-0.01em" }}>{row.dimension}</p>
                        </div>

                        {/* ── Selected approach quote ── */}
                        <p style={{
                          fontFamily: f.sans,
                          fontSize: "clamp(13px, 1.15vw, 14px)",
                          color: f.ink(0.4),
                          lineHeight: 1.7,
                          fontStyle: "italic",
                          paddingLeft: "20px",
                          borderLeft: `2px solid ${f.ink(0.08)}`,
                          marginBottom: "24px",
                        }}>
                          {selectedCopy}
                        </p>

                        {/* ── Explanation section ── */}
                        <p style={{ ...label("9px"), color: f.ink(0.25), marginBottom: "8px", textTransform: "uppercase" as const }}>{explanationLabel}</p>
                        <p style={{
                          fontFamily: f.sans,
                          fontSize: "clamp(13px, 1.2vw, 15px)",
                          color: f.ink(0.65),
                          lineHeight: 1.7,
                          fontWeight: 500,
                        }}>
                          {lede}
                        </p>

                        {/* ── Expandable bullets ── */}
                        {isExpanded && (
                          <ul style={{
                            listStyle: "none",
                            padding: 0,
                            margin: "20px 0 0 0",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            paddingTop: "20px",
                            borderTop: `1px solid ${f.ink(0.06)}`,
                            animation: "fade-up 0.3s ease-out",
                          }}>
                            {bullets.map((b, bi) => (
                              <li key={bi} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                <span style={{ color: f.ink(0.12), fontSize: "6px", lineHeight: "24px", flexShrink: 0 }}>●</span>
                                <span style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.1vw, 14px)", color: f.ink(0.42), lineHeight: 1.75 }}>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* ── Toggle ── */}
                        <button
                          onClick={() => setExpandedDimension(isExpanded ? null : i)}
                          style={{
                            fontFamily: f.sans,
                            fontSize: "11px",
                            fontWeight: 600,
                            color: f.ink(0.3),
                            background: "none",
                            border: "none",
                            padding: "0",
                            marginTop: "20px",
                            cursor: "pointer",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase" as const,
                            transition: "color 0.15s ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = f.ink(0.6); }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = f.ink(0.3); }}
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            );
          })()}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 4: Hallmarks ═══ */}
      <DeckFrame ref={setRef(3)} mode="wide">
        <div ref={r4.ref} className="flex flex-col lg:flex-row gap-16 w-full">
          <div className="lg:w-[35%] flex flex-col justify-center" style={r4.stagger(0, 0, "blur-up")}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700 }}>
              We've studied hundreds of organizations. The effective ones do three things.
            </p>
            <p style={{ marginTop: "20px", fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.ink(0.4), lineHeight: 1.7 }}>
              A campaign that gets 73 million views but doesn't do these three things is a failed campaign — and a waste of your money.
            </p>
          </div>
          <div className="lg:w-[65%] flex flex-col gap-4">
            {[
              { title: "They engage the full culture stack.", rationale: "They don't just push content out — they work behind the scenes so distribution platforms across different sectors are pulling the message up. Music, faith communities, creator economies, campuses, veteran networks. Not just strategic comms.", help: "We map every cultural sector relevant to your issues and connect you to partners already embedded in those spaces." },
              { title: "They coordinate across sectors.", rationale: "Communications becomes the organizing infrastructure — the scaffolding that brings different sectors together around a focal point and gives them the cover and momentum to push for policy together. Without multiple sectors engaged, policy doesn't move.", help: "We design integrated strategies where comms, policy, industry, labor, grassroots, and culture all reinforce each other." },
              { title: "They organize for growth.", rationale: "It's not about organizing people who already agree. To win, you have to demonstrate that your communications are bringing new people in — people who weren't there before. Only by demonstrating real persuasion can you persuade the people in power.", help: "We run live campaigns that bring in new audiences and build the local leadership infrastructure that turns engagement into lasting power." },
            ].map((h, i) => {
              const isExpanded = hallmarkSelections[i] !== undefined || expandedHallmarkIdx === i;
              const selection = hallmarkSelections[i];
              return (
                <button
                  key={i}
                  onClick={() => setExpandedHallmarkIdx(isExpanded && expandedHallmarkIdx === i ? null : i)}
                  className="text-left w-full transition-all duration-300"
                  style={{
                    padding: "28px 24px",
                    background: isExpanded ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                    border: `1px solid ${isExpanded ? "hsl(var(--foreground) / var(--a-border))" : f.ink(0.06)}`,
                    borderRadius: "12px", cursor: "pointer",
                    opacity: r4.isActive ? 1 : 0,
                    transform: r4.isActive ? "translateX(0) scale(1)" : "translateX(30px) scale(0.97)",
                    filter: r4.isActive ? "blur(0px)" : "blur(5px)",
                    transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 150}ms`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span style={{ fontFamily: f.sans, fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 700, color: f.ink(0.15), minWidth: "32px", flexShrink: 0 }}>{i + 1}</span>
                    <p className="flex-1" style={{ fontFamily: f.sans, fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 700, color: f.ink(0.65) }}>{h.title}</p>
                    {selection && (
                      <span style={{ fontFamily: f.sans, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "999px", color: f.ink(0.5), background: "hsl(var(--foreground) / 0.06)", flexShrink: 0 }}>
                        {selection === "doing" ? "Doing ✓" : "Need help"}
                      </span>
                    )}
                    <ChevronDown size={16} style={{ color: f.ink(0.2), transition: "transform 0.3s ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }} />
                  </div>
                  <div style={{ maxHeight: isExpanded ? "500px" : "0", overflow: "hidden", transition: "max-height 0.5s ease, opacity 0.4s ease", opacity: isExpanded ? 1 : 0 }}>
                    <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.ink(0.55), marginTop: "16px", marginLeft: "48px", lineHeight: 1.7 }}>{h.rationale}</p>
                    <div style={{ margin: "16px 0 0 48px", borderTop: `1px solid ${f.ink(0.08)}`, paddingTop: "14px" }}>
                      <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.ink(0.5), lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 700 }}>How we help:</span> {h.help}
                      </p>
                    </div>
                    {/* Self-assessment buttons */}
                    <div className="flex gap-3" style={{ marginTop: "18px", marginLeft: "48px" }} onClick={(e) => e.stopPropagation()}>
                      {([
                        { value: "doing" as const, lbl: "We're doing this" },
                        { value: "need" as const, lbl: "We need this" },
                      ]).map(opt => {
                        const isSelected = selection === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              setHallmarkSelections(prev => {
                                if (prev[i] === opt.value) {
                                  const next = { ...prev };
                                  delete next[i];
                                  return next;
                                }
                                return { ...prev, [i]: opt.value };
                              });
                            }}
                            style={{
                              fontFamily: f.sans,
                              fontSize: "clamp(11px, 1.1vw, 13px)",
                              fontWeight: isSelected ? 700 : 500,
                              padding: "8px 18px",
                              borderRadius: "8px",
                              border: `1px solid ${isSelected ? "hsl(var(--foreground) / 0.25)" : f.ink(0.1)}`,
                              background: isSelected ? "hsl(var(--foreground) / 0.08)" : "transparent",
                              color: isSelected ? f.ink(0.8) : f.ink(0.35),
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {opt.lbl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 5: Three Service Domains ═══ */}
      <DeckFrame ref={setRef(4)} mode="wide">
        <div ref={r5.ref} className="flex flex-col w-full" style={{ justifyContent: "center" }}>
          <div style={{ transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)", transform: activeDomain ? "translateY(-20px)" : "translateY(0)" }}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700, ...r5.stagger(0, 0, "blur-up"), marginBottom: "12px" }}>
              Where do your communications need the most help?
            </p>
            <p style={{ ...body(0.4), ...r5.stagger(1, 200, "blur-up"), marginBottom: activeDomain ? "24px" : "48px", maxWidth: "500px", transition: "margin 0.4s ease" }}>
              Select the domains most relevant to your situation.
            </p>

            <div
              className="overflow-hidden rounded-[28px] border"
              style={{ ...r5.stagger(2, 400, "blur-scale"), background: "hsl(var(--foreground) / var(--a-bg-subtle))", borderColor: "hsl(var(--foreground) / var(--a-border-card))" }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {DOMAINS.map((d, i) => {
                  const isActive = activeDomain === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        setActiveDomain(isActive ? null : d.id);
                        setSelectedDomains(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id]);
                      }}
                      className={`text-left w-full hover:bg-background/20 transition-colors ${i < DOMAINS.length - 1 ? "border-b lg:border-b-0 lg:border-r" : ""}`}
                      style={{
                        padding: "26px 26px 24px",
                        background: isActive ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                        borderColor: isActive ? "hsl(var(--foreground) / var(--a-border))" : "hsl(var(--border))",
                        boxShadow: isActive ? "inset 0 0 0 1px hsl(var(--foreground) / var(--a-border))" : "none",
                        transition: "background 0.2s ease, box-shadow 0.2s ease", cursor: "pointer",
                      }}
                    >
                      <div className="flex h-full flex-col gap-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 1.8vw, 20px)", fontWeight: 700, color: isActive ? "hsl(var(--foreground))" : f.ink(0.82), lineHeight: 1.2, marginBottom: "8px" }}>{d.title}</p>
                            <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.2vw, 15px)", color: f.ink(0.42), lineHeight: 1.55, maxWidth: "30ch" }}>{d.tagline}</p>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isActive ? "hsl(var(--foreground))" : f.ink(0.28)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isActive ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0, marginTop: "2px" }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                        <div style={{ paddingTop: "18px", borderTop: `1px solid ${isActive ? "hsl(var(--foreground) / var(--a-border))" : f.ink(0.08)}` }}>
                          <span style={{ ...label("9px"), color: isActive ? "hsl(var(--foreground) / var(--a-mid))" : f.ink(0.28), display: "block", marginBottom: "8px" }}>What it is</span>
                          <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.2vw, 15px)", color: f.ink(0.58), lineHeight: 1.65 }}>{d.what}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{
                maxHeight: activeDomainData ? "520px" : "0px", opacity: activeDomainData ? 1 : 0, overflow: "hidden",
                borderTop: activeDomainData ? "1px solid hsl(var(--foreground) / var(--a-border-card))" : "1px solid transparent",
                background: activeDomainData ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                transition: "max-height 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.35s ease, border-color 0.2s ease",
              }}>
                {activeDomainData && (
                  <div key={activeDomain} className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr_1fr] gap-8" style={{ padding: "28px 30px 32px" }}>
                    <div>
                      <span style={{ ...label("9px"), color: "hsl(var(--foreground) / var(--a-mid))", display: "block", marginBottom: "10px" }}>Selected focus</span>
                      <p style={{ fontFamily: f.sans, fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, color: f.ink(0.9), lineHeight: 1.2, marginBottom: "10px" }}>{activeDomainData.title}</p>
                      <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.3vw, 16px)", color: f.ink(0.48), lineHeight: 1.65 }}>{activeDomainData.tagline}</p>
                    </div>
                    <div>
                      <span style={{ ...label("9px"), color: "hsl(var(--foreground) / var(--a-mid))", display: "block", marginBottom: "10px" }}>What it unlocks</span>
                      <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.2vw, 15px)", color: f.ink(0.58), lineHeight: 1.65 }}>{activeDomainData.unlocks}</p>
                    </div>
                    <div>
                      <span style={{ ...label("9px"), color: "hsl(var(--foreground) / var(--a-mid))", display: "block", marginBottom: "10px" }}>What most advisors miss</span>
                      <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.2vw, 15px)", color: f.ink(0.58), lineHeight: 1.65, marginBottom: "18px" }}>{activeDomainData.missed}</p>
                      <span style={{ ...label("9px"), color: "hsl(var(--foreground) / var(--a-mid))", display: "block", marginBottom: "10px" }}>Example</span>
                      <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.2vw, 15px)", color: f.ink(0.46), lineHeight: 1.65, fontStyle: "italic" }}>{activeDomainData.example}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 6: Capabilities — "Which 2 matter most?" ═══ */}
      <DeckFrame ref={setRef(5)} mode="wide">
        <div ref={r6.ref} className="flex flex-col gap-8">
          <div>
            <p style={{ ...heading("clamp(24px, 3vw, 40px)"), fontWeight: 700, ...r6.stagger(0, 0, "blur-up") }}>
              Which capabilities matter most to you right now?
            </p>
            <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.4vw, 16px)", color: f.ink(0.4), marginTop: "8px", ...r6.stagger(1, 200, "blur-up") }}>
              Select at least two. This helps us prioritize what to discuss.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITIES.map((cap, i) => {
              const isSelected = capabilitiesRanked.includes(cap.id);
              const desc = [
                "Deep dive into your grantees, past investments, and institutional record.",
                "Customized decision-making frameworks for evaluating and directing grants.",
                "Cultural operatives across music, film/TV, digital, news. A 480-member network.",
                "Co-designed around your objectives. Real indicators of power, not vanity metrics.",
                "Your team learns to evaluate, strategize, and run multi-sector campaigns independently.",
                "When the work surfaces a gap, we help build the infrastructure that doesn't exist yet.",
              ][i];
              return (
                <button
                  key={cap.id}
                  onClick={() => setCapabilitiesRanked(prev => isSelected ? prev.filter(c => c !== cap.id) : [...prev, cap.id])}
                  className="text-left transition-all duration-300"
                  style={{
                    padding: "28px 24px",
                    borderTop: isSelected ? "none" : `1px solid ${f.ink(0.06)}`,
                    border: isSelected ? "1px solid hsl(var(--foreground) / var(--a-high))" : `1px solid ${f.ink(0.06)}`,
                    background: isSelected ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                    boxShadow: isSelected ? "0 0 20px hsl(var(--foreground) / 0.12)" : "none",
                    borderRadius: "12px", cursor: "pointer",
                    opacity: r6.isActive ? 1 : 0,
                    transform: r6.isActive ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
                    filter: r6.isActive ? "blur(0px)" : "blur(5px)",
                    transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 100}ms`,
                  }}
                >
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(15px, 1.8vw, 19px)", fontWeight: 700, color: f.ink(0.8), marginBottom: "8px" }}>{cap.title}</p>
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: f.ink(0.55), lineHeight: 1.8 }}>{desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 7: Metrics Checklist ═══ */}
      <DeckFrame ref={setRef(6)} mode="wide">
        <div ref={r7.ref} className="flex flex-col lg:flex-row gap-16 w-full">
          <div className="lg:w-[40%] flex flex-col justify-center" style={r7.stagger(0, 0, "blur-up")}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700 }}>
              How do you measure your communications today?
            </p>
            <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.4vw, 16px)", color: f.ink(0.4), marginTop: "12px", lineHeight: 1.6 }}>
              Check everything your grantees report on today. Be honest — there are no wrong answers.
            </p>
          </div>

          <div className="lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-3">
            {ALL_METRICS.map((metric, i) => {
              const isChecked = metricsChecked.includes(metric);
              const isVanity = i < 6; // first 6 are vanity
              const delay = 400 + i * 60;
              return (
                <button
                  key={metric}
                  onClick={() => setMetricsChecked(prev => isChecked ? prev.filter(m => m !== metric) : [...prev, metric])}
                  className="text-left transition-all duration-200"
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "14px 16px", borderRadius: "10px",
                    border: isChecked ? "1px solid hsl(var(--foreground) / var(--a-high))" : `1px solid ${f.ink(0.08)}`,
                    background: isChecked ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                    cursor: "pointer",
                    opacity: r7.isActive ? 1 : 0,
                    transform: r7.isActive ? "translateX(0)" : "translateX(20px)",
                    filter: r7.isActive ? "blur(0px)" : "blur(4px)",
                    transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, background 0.15s ease, border 0.15s ease`,
                  }}
                >
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0,
                    border: isChecked ? "none" : `1.5px solid ${f.ink(0.15)}`,
                    background: isChecked ? "hsl(var(--foreground) / var(--a-high))" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}>
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontFamily: f.sans, fontSize: "clamp(13px, 1.3vw, 15px)",
                    color: isChecked ? f.ink(0.8) : f.ink(0.55), lineHeight: 1.4,
                  }}>{metric}</span>
                </button>
              );
            })}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 8: Working Together ═══ */}
      <DeckFrame ref={setRef(7)} mode="wide">
        <div ref={r8.ref} className="flex flex-col gap-8 w-full">
          <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700, ...r8.stagger(0, 0, "blur-up") }}>How do you want to start working on your communications?</p>

          <div className="flex flex-col sm:flex-row gap-4 w-full" style={r8.stagger(1, 300, "blur-scale")}>
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
                    background: isSelected ? "hsl(var(--foreground) / var(--a-high))" : "transparent",
                    borderRadius: "12px", opacity: isDimmed ? 0.4 : 1, cursor: "pointer",
                  }}
                >
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(17px, 2.2vw, 24px)", fontWeight: 700, color: isSelected ? "hsl(var(--primary-foreground))" : f.ink(0.55), marginBottom: "8px" }}>{path.title}</p>
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 15px)", color: isSelected ? "hsl(var(--primary-foreground) / 0.8)" : f.ink(0.4), lineHeight: 1.7 }}>{path.desc}</p>
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
                <div key={pi} className="flex-1" style={{ padding: "28px 24px", background: "hsl(var(--foreground) / var(--a-high))", borderRadius: "12px" }}>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span style={{ fontFamily: f.sans, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--primary-foreground) / 0.6)" }}>{p.phase}</span>
                    <span style={{ fontFamily: f.sans, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 700, color: "hsl(var(--primary-foreground))" }}>{p.title}</span>
                    <span style={{ fontFamily: f.sans, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--primary-foreground) / 0.5)" }}>{p.time}</span>
                  </div>
                  {p.bullets.map((b, i) => (
                    <p key={i} style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: "hsl(var(--primary-foreground) / 0.8)", marginBottom: "6px", paddingLeft: "12px", lineHeight: 1.7 }}>{b}</p>
                  ))}
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.3vw, 14px)", color: "hsl(var(--primary-foreground) / 0.75)", marginTop: "12px", lineHeight: 1.7 }}>
                    <strong style={{ color: "hsl(var(--primary-foreground))" }}>Output:</strong> {p.output}
                  </p>
                </div>
              ))}
            </div>
          )}

          {engagementPath === "experienced" && (
            <div className="w-full" style={{ animation: "deck-fade-up 0.6s ease forwards", padding: "28px 24px", background: "hsl(var(--foreground) / var(--a-high))", borderRadius: "12px" }}>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 700, color: "hsl(var(--primary-foreground))", marginBottom: "12px" }}>Custom scope, fast start.</p>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 15px)", color: "hsl(var(--primary-foreground) / 0.8)", lineHeight: 1.7, maxWidth: "600px" }}>We skip the discovery and go straight to what you need — access, introductions, strategy pressure-testing, grantee evaluation, or campaign execution.</p>
            </div>
          )}


          {!engagementPath && (
            <p style={{ ...label("9px"), ...r8.stagger(2, 600, "blur-up") }}>↑ Choose a path to continue</p>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 9: Who We Are + Media Experience ═══ */}
      <DeckFrame ref={setRef(8)} mode="wide">
        <div ref={r9.ref} className="flex flex-col lg:flex-row gap-16 w-full">
          <div className="lg:w-[45%] flex flex-col justify-center">
            <p style={{ ...r9.stagger(0, 0, "blur-up"), fontFamily: f.sans, fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, color: f.ink(0.9), lineHeight: 1.3 }}>
              We've built the communications you're trying to buy.
            </p>
            <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 17px)", color: f.ink(0.55), lineHeight: 1.8, ...r9.stagger(1, 300, "blur-up"), marginTop: "20px", maxWidth: "400px" }}>
              Our team is built from careers in <strong style={{ color: f.ink(0.8) }}>commercial media and entertainment</strong> — the industries your grantees are trying to reach.
            </p>

            {/* Media experience question */}
            <div style={{ ...r9.stagger(2, 600, "blur-up"), marginTop: "32px" }}>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 17px)", fontWeight: 600, color: f.ink(0.7), marginBottom: "16px" }}>
                Have you worked with media professionals before?
              </p>
              <div className="flex gap-3">
                {([
                  { val: true, lbl: "Yes" },
                  { val: false, lbl: "No" },
                ] as const).map((opt) => (
                  <button
                    key={String(opt.val)}
                    onClick={() => setHasMediaExperience(opt.val)}
                    style={{
                      fontFamily: f.sans, fontSize: "13px", fontWeight: 600,
                      padding: "12px 32px", borderRadius: "999px",
                      color: hasMediaExperience === opt.val ? "hsl(var(--primary-foreground))" : f.ink(0.5),
                      background: hasMediaExperience === opt.val ? "hsl(var(--foreground) / var(--a-high))" : "transparent",
                      border: hasMediaExperience === opt.val ? "none" : `1px solid ${f.ink(0.1)}`,
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}
                  >
                    {opt.lbl}
                  </button>
                ))}
              </div>
            </div>
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
              <div key={i} className="transition-all duration-300" style={{
                padding: "20px 16px", borderTop: `1px solid ${f.ink(0.06)}`,
                opacity: r9.isActive ? 1 : 0,
                transform: r9.isActive ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
                filter: r9.isActive ? "blur(0px)" : "blur(4px)",
                transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${500 + i * 100}ms`,
              }}>
                <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 17px)", fontWeight: 700, color: f.ink(0.7), marginBottom: "6px" }}>{s.name}</p>
                <p style={{ fontFamily: f.sans, fontSize: "clamp(11px, 1.2vw, 13px)", color: f.ink(0.4), lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 10: CTA — What's Next ═══ */}
      <DeckFrame ref={setRef(9)} mode="wide">
        <div ref={r10.ref}>
          {ctaMode === "thanks" ? (
            <div className="flex flex-col items-center text-center" style={{ animation: "fade-in 0.5s ease-out" }}>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 700, color: f.ink(0.85), marginBottom: "12px" }}>Received ✓</p>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 17px)", color: f.ink(0.5), lineHeight: 1.7, maxWidth: "440px", margin: "0 auto" }}>
                We're reviewing your intake now. A team member will follow up within two business days.
              </p>
              {bookingLink && (
                <a href={bookingLink} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-block", marginTop: "24px", fontFamily: f.sans, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600,
                  color: f.ink(0.6), border: `1px solid ${f.ink(0.15)}`, padding: "12px 28px", borderRadius: "999px", textDecoration: "none", transition: "all 200ms",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = f.ink(0.3); e.currentTarget.style.color = f.ink(0.9); }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = f.ink(0.15); e.currentTarget.style.color = f.ink(0.6); }}
                >Or book a call now →</a>
              )}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
              {/* Left column — heading + intake summary */}
              <div className="flex-1 min-w-0">
                <h2 style={{ ...r10.stagger(0, 0, "blur-up"), fontFamily: f.sans, fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 700, color: f.ink(0.9), letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                  We've got a picture of your communications. Let's talk.
                </h2>
                <p style={{ ...r10.stagger(1, 300, "blur-up"), fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 18px)", color: f.ink(0.5), lineHeight: 1.7, marginTop: "16px", maxWidth: "480px" }}>
                  Leave your details and we'll send your diagnostic. Or book a call and walk through it together.
                </p>

                {/* Intake Summary */}
                {(selectedPains.length > 0 || customSaved || engagementPath || selectedDomains.length > 0 || quizRevealed) && (
                  <div style={{
                    ...r10.stagger(1, 400, "blur-up"),
                    marginTop: "28px", padding: "20px 24px", borderRadius: "12px",
                    background: "hsl(var(--foreground) / var(--a-bg))", border: "1px solid hsl(var(--foreground) / var(--a-border-card))", textAlign: "left",
                  }}>
                    <p style={{ ...label("9px"), color: "hsl(var(--foreground) / var(--a-mid))", marginBottom: "12px" }}>Your intake summary</p>
                    {selectedPains.length > 0 && (
                      <div style={{ marginBottom: "10px" }}>
                        <p style={{ fontFamily: f.sans, fontSize: "11px", fontWeight: 600, color: f.ink(0.5), marginBottom: "4px" }}>Challenges</p>
                        <p style={{ fontFamily: f.sans, fontSize: "13px", color: f.ink(0.7), lineHeight: 1.5 }}>{selectedPainDatas.map(p => p.short).join(" · ")}</p>
                      </div>
                    )}
                    {quizRevealed && (
                      <div style={{ marginBottom: "10px" }}>
                        <p style={{ fontFamily: f.sans, fontSize: "11px", fontWeight: 600, color: f.ink(0.5), marginBottom: "4px" }}>Quiz result</p>
                        <p style={{ fontFamily: f.sans, fontSize: "13px", color: f.ink(0.7), lineHeight: 1.5 }}>{getQuizGrade(nextgenPickCount, QUIZ_ROWS.length).grade}</p>
                      </div>
                    )}
                    {selectedDomains.length > 0 && (
                      <div style={{ marginBottom: "10px" }}>
                        <p style={{ fontFamily: f.sans, fontSize: "11px", fontWeight: 600, color: f.ink(0.5), marginBottom: "4px" }}>Domains of interest</p>
                        <p style={{ fontFamily: f.sans, fontSize: "13px", color: f.ink(0.7), lineHeight: 1.5 }}>{DOMAINS.filter(d => selectedDomains.includes(d.id)).map(d => d.title).join(" · ")}</p>
                      </div>
                    )}
                    {capabilitiesRanked.length > 0 && (
                      <div style={{ marginBottom: "10px" }}>
                        <p style={{ fontFamily: f.sans, fontSize: "11px", fontWeight: 600, color: f.ink(0.5), marginBottom: "4px" }}>Priority capabilities</p>
                        <p style={{ fontFamily: f.sans, fontSize: "13px", color: f.ink(0.7), lineHeight: 1.5 }}>{CAPABILITIES.filter(c => capabilitiesRanked.includes(c.id)).map(c => c.title).join(" · ")}</p>
                      </div>
                    )}
                    {engagementPath && (
                      <div>
                        <p style={{ fontFamily: f.sans, fontSize: "11px", fontWeight: 600, color: f.ink(0.5), marginBottom: "4px" }}>Engagement path</p>
                        <p style={{ fontFamily: f.sans, fontSize: "13px", color: f.ink(0.7), lineHeight: 1.5 }}>{engagementPath === "fresh" ? "Starting fresh" : "Already up to speed"}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right column — form */}
              <div className="w-full lg:w-[400px] flex-shrink-0">
                <form onSubmit={handleCtaSubmit} className="flex flex-col gap-4 text-left" style={r10.stagger(2, 500, "blur-up")}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ ...label("9px"), display: "block", marginBottom: "6px" }}>First name *</label>
                      <input type="text" required value={ctaForm.firstName} onChange={(e) => setCtaForm(p => ({ ...p, firstName: e.target.value }))}
                        style={{ width: "100%", fontFamily: f.sans, fontSize: "14px", color: f.ink(0.8), background: "hsl(var(--card))", border: `1px solid ${f.ink(0.1)}`, borderRadius: "8px", padding: "12px", outline: "none" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = f.ink(0.2))} onBlur={(e) => (e.currentTarget.style.borderColor = f.ink(0.1))} />
                    </div>
                    <div>
                      <label style={{ ...label("9px"), display: "block", marginBottom: "6px" }}>Last name *</label>
                      <input type="text" required value={ctaForm.lastName} onChange={(e) => setCtaForm(p => ({ ...p, lastName: e.target.value }))}
                        style={{ width: "100%", fontFamily: f.sans, fontSize: "14px", color: f.ink(0.8), background: "hsl(var(--card))", border: `1px solid ${f.ink(0.1)}`, borderRadius: "8px", padding: "12px", outline: "none" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = f.ink(0.2))} onBlur={(e) => (e.currentTarget.style.borderColor = f.ink(0.1))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...label("9px"), display: "block", marginBottom: "6px" }}>Organization</label>
                    <input type="text" value={ctaForm.organization} onChange={(e) => setCtaForm(p => ({ ...p, organization: e.target.value }))}
                      style={{ width: "100%", fontFamily: f.sans, fontSize: "14px", color: f.ink(0.8), background: "hsl(var(--card))", border: `1px solid ${f.ink(0.1)}`, borderRadius: "8px", padding: "12px", outline: "none" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = f.ink(0.2))} onBlur={(e) => (e.currentTarget.style.borderColor = f.ink(0.1))} />
                  </div>
                  <div>
                    <label style={{ ...label("9px"), display: "block", marginBottom: "6px" }}>Email *</label>
                    <input type="email" required value={ctaForm.email} onChange={(e) => setCtaForm(p => ({ ...p, email: e.target.value }))}
                      style={{ width: "100%", fontFamily: f.sans, fontSize: "14px", color: f.ink(0.8), background: "hsl(var(--card))", border: `1px solid ${f.ink(0.1)}`, borderRadius: "8px", padding: "12px", outline: "none" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = f.ink(0.2))} onBlur={(e) => (e.currentTarget.style.borderColor = f.ink(0.1))} />
                  </div>
                  <div className="flex flex-col gap-3 mt-2">
                    <button type="submit" disabled={ctaSubmitting || !ctaForm.firstName.trim() || !ctaForm.lastName.trim() || !ctaForm.email.trim()}
                      style={{
                        fontFamily: f.sans, fontSize: "13px", letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase" as const,
                        color: "hsl(var(--primary-foreground))",
                        background: (ctaForm.firstName.trim() && ctaForm.lastName.trim() && ctaForm.email.trim()) ? "hsl(var(--foreground) / var(--a-high))" : f.ink(0.2),
                        border: "none", padding: "14px 28px", borderRadius: "999px",
                        cursor: (ctaForm.firstName.trim() && ctaForm.email.trim()) ? "pointer" : "default", transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => { if (ctaForm.firstName.trim() && ctaForm.email.trim()) e.currentTarget.style.background = "hsl(var(--foreground))"; }}
                      onMouseLeave={(e) => { if (ctaForm.firstName.trim() && ctaForm.email.trim()) e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-high))"; }}
                    >{ctaSubmitting ? "Sending…" : "Submit & get your diagnostic"}</button>
                    {bookingLink && (
                      <button type="button" onClick={() => { handleCtaSubmit(); window.open(bookingLink, "_blank"); }}
                        disabled={ctaSubmitting || !ctaForm.firstName.trim() || !ctaForm.lastName.trim() || !ctaForm.email.trim()}
                        style={{
                          fontFamily: f.sans, fontSize: "13px", letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase" as const,
                          color: f.ink(0.7), background: "transparent",
                          border: `1px solid ${f.ink(0.15)}`, padding: "14px 28px", borderRadius: "999px",
                          cursor: (ctaForm.firstName.trim() && ctaForm.email.trim()) ? "pointer" : "default", transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = f.ink(0.3); e.currentTarget.style.color = f.ink(0.9); }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = f.ink(0.15); e.currentTarget.style.color = f.ink(0.7); }}
                      >Book a call instead</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 11: Case Studies ═══ */}
      <DeckFrame ref={setRef(10)} mode="wide">
        <div ref={r11.ref} className="flex flex-col gap-8 w-full">
          <div style={r11.stagger(0, 0, "blur-up")}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700 }}>Selected communications work.</p>
            <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 16px)", color: f.ink(0.4), marginTop: "8px", lineHeight: 1.6 }}>Click any case to read the full story.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style={r11.stagger(1, 300, "blur-scale")}>
            {CASE_STUDIES.map((cs, i) => (
              <button key={i} onClick={() => setSelectedCase(i)} className="text-left transition-all duration-300"
                style={{
                  padding: "20px 16px",
                  background: cs.content ? "hsl(var(--foreground) / var(--a-high))" : "transparent",
                  border: cs.content ? "none" : `1px solid ${f.ink(0.06)}`,
                  borderRadius: "10px", cursor: "pointer",
                  opacity: r11.isActive ? 1 : 0,
                  transform: r11.isActive ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
                  filter: r11.isActive ? "blur(0px)" : "blur(5px)",
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 60}ms`,
                }}
                onMouseEnter={(e) => { if (!cs.content) { e.currentTarget.style.borderColor = f.ink(0.15); } else { e.currentTarget.style.transform = "translateY(-2px)"; } }}
                onMouseLeave={(e) => { if (!cs.content) { e.currentTarget.style.borderColor = f.ink(0.06); } else { e.currentTarget.style.transform = "translateY(0)"; } }}
              >
                <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.4vw, 15px)", fontWeight: 700, color: cs.content ? "hsl(var(--primary-foreground))" : f.ink(0.5), marginBottom: "6px" }}>{cs.name}</p>
                <p style={{ fontFamily: f.sans, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: "1.4", color: cs.content ? "hsl(var(--primary-foreground) / 0.7)" : f.ink(0.25) }}>{cs.outcome}</p>
              </button>
            ))}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 12: Close ═══ */}
      <DeckFrame ref={setRef(11)}>
        <div ref={r12.ref} className="flex flex-col items-center text-center gap-6">
          {ctaMode === "thanks" ? (
            <>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 700, color: f.ink(0.85) }}>Thank you.</p>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.5vw, 16px)", color: f.ink(0.45), lineHeight: 1.7, maxWidth: "400px" }}>
                We're reviewing your intake and will be in touch shortly.
              </p>
            </>
          ) : (
            <>
              <p style={{ ...label("10px") }}>← Ready to connect?</p>
              <button
                onClick={() => scrollToFrame(9)}
                style={{
                  fontFamily: f.sans, fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 500,
                  color: "hsl(var(--foreground))", background: "hsl(var(--foreground) / var(--a-bg))",
                  border: "1px solid hsl(var(--foreground) / var(--a-border))", padding: "14px 28px", borderRadius: "999px", cursor: "pointer", transition: "all 200ms ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-low))"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-bg))"; }}
              >
                Send your communications intake →
              </button>
            </>
          )}
        </div>
      </DeckFrame>

      {/* Case Study Lightbox */}
      <Dialog open={selectedCase !== null} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl" style={{ background: "hsl(var(--background))", border: `1px solid ${f.ink(0.08)}` }}>
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
