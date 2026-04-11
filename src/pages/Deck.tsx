import React, { useEffect, useRef, useState, useCallback, useMemo, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import DeckFrame from "@/components/deck/DeckFrame";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import TypewriterHeading from "@/components/deck/TypewriterHeading";
import { useFrameReveal } from "@/hooks/useFrameReveal";
import { t } from "@/lib/theme";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ChevronDown, RotateCcw } from "lucide-react";
import { calculateReadinessScore, getQuizGrade, type QuizAnswer } from "@/lib/deckScoring";

const TOTAL_FRAMES = 10;

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
  { id: "evaluate", short: "Funding comms, no strategy", detail: "Money goes out the door, but nothing seems to click." },
  { id: "access", short: "Limited channels", detail: "Op-eds, paid ads, social on repeat — no real reach into media or culture." },
  { id: "measurement", short: "Not sure what to measure", detail: "We need help communicating about what's working (or not) and why." },
  { id: "expertise", short: "No expertise in-house", detail: "When things break, we don't have direct insight to explain why." },
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
  "Media placements",
  "Audience reach",
  "Social engagement",
  "Event attendance",
  "Grantee output volume",
  "List growth",
  "Shifts in public opinion",
  "Movement growth",
  "Sectors aligned",
  "Leaders developed",
  "Policy moved",
  "Capital unlocked",
];

/* ─── Fallback case studies (used when DB is empty) ─── */


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
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Restore state from sessionStorage — keep it durable until submit
  const restored = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("deck-state");
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentFrame, setCurrentFrame] = useState(restored?.currentFrame ?? 0);
  const lastFrameRef = useRef(restored?.currentFrame ?? 0);
  const { playHoverGlitch } = useGlitchSFX();

  /* ─── Branching state ─── */
  const [selectedPains, setSelectedPains] = useState<string[]>(restored?.selectedPains ?? []);
  const [customOpen, setCustomOpen] = useState(restored?.customOpen ?? false);
  const [customMessage, setCustomMessage] = useState(restored?.customMessage ?? "");
  const [customSaved, setCustomSaved] = useState(restored?.customSaved ?? false);

  /* ─── Quiz state (Frame 3) ─── */
  const [quizAnswers, setQuizAnswers] = useState<(QuizAnswer | null)[]>(restored?.quizAnswers ?? Array(QUIZ_ROWS.length).fill(null));
  const [quizStep, setQuizStep] = useState(restored?.quizStep ?? 0);
  const [quizRevealed, setQuizRevealed] = useState(restored?.quizRevealed ?? false);
  const [expandedDimension, setExpandedDimension] = useState<number | null>(restored?.expandedDimension ?? null);

  // Randomize left/right placement per row (stable across re-renders)
  const quizOrderRef = useRef(restored?.quizOrder ?? QUIZ_ROWS.map(() => Math.random() > 0.5));
  const quizOrder = quizOrderRef.current;

  /* ─── Capabilities ranking (Frame 6) ─── */
  const [capabilitiesRanked, setCapabilitiesRanked] = useState<string[]>(restored?.capabilitiesRanked ?? []);

  /* ─── Metrics checklist (Frame 7) ─── */
  const [metricsChecked, setMetricsChecked] = useState<string[]>(restored?.metricsChecked ?? []);

  /* ─── Sector selections (Frame 8) ─── */
  const [selectedSectors, setSelectedSectors] = useState<string[]>(restored?.selectedSectors ?? []);

  /* ─── Media experience (Frame 9) ─── */
  const [hasMediaExperience, setHasMediaExperience] = useState<boolean | null>(restored?.hasMediaExperience ?? null);

  /* CTA form state */
  const [ctaMode, setCtaMode] = useState<"thanks" | null>(restored?.ctaMode ?? null);
  const [ctaForm, setCtaForm] = useState(restored?.ctaForm ?? { firstName: "", lastName: "", organization: "", email: "" });
  const [ctaSubmitting, setCtaSubmitting] = useState(false);

  const [engagementPath, setEngagementPath] = useState<"fresh" | "experienced" | null>(restored?.engagementPath ?? null);

  const [practiceSelections, setPracticeSelections] = useState<Record<number, boolean>>(restored?.practiceSelections ?? {});
  const [expandedPracticeIdx, setExpandedPracticeIdx] = useState<number | null>(restored?.expandedPracticeIdx ?? null);

  // Save all state to sessionStorage (called before navigating away)
  const saveDeckState = useCallback(() => {
    const state = {
      currentFrame, selectedPains, customOpen, customMessage, customSaved,
      quizAnswers, quizStep, quizRevealed, expandedDimension, quizOrder,
      capabilitiesRanked, metricsChecked, selectedSectors, hasMediaExperience,
      ctaMode, ctaForm, engagementPath, practiceSelections, expandedPracticeIdx,
    };
    sessionStorage.setItem("deck-state", JSON.stringify(state));
  }, [currentFrame, selectedPains, customOpen, customMessage, customSaved,
    quizAnswers, quizStep, quizRevealed, expandedDimension, quizOrder,
    capabilitiesRanked, metricsChecked, selectedSectors, hasMediaExperience,
    ctaMode, ctaForm, engagementPath, practiceSelections, expandedPracticeIdx]);

  // Scroll to restored frame on mount
  useEffect(() => {
    if (restored && restored.currentFrame > 0) {
      setTimeout(() => {
        frameRefs.current[restored.currentFrame]?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Booking link from settings */
  const { data: siteSettings } = useSiteSettings();
  const bookingLink = siteSettings?.booking_link || null;

  /* ─── Interaction gates ─── */
  const frameInteracted = useMemo(() => {
    const gates: Record<number, boolean> = {};
    gates[0] = true; // hero — always ok
    gates[1] = selectedPains.length > 0 || customSaved; // pain points
    gates[2] = quizAnswers.every(a => a !== null); // quiz complete
    gates[3] = true; // practices — always passable, checkbox is optional
    gates[4] = capabilitiesRanked.length >= 2; // capabilities — pick at least 2
    gates[5] = metricsChecked.length > 0; // metrics
    gates[6] = engagementPath !== null; // working together
    gates[7] = true; // sectors — always passable, selection is optional
    gates[8] = true; // preliminary results — always accessible
    gates[9] = true; // CTA — always accessible
    
    return gates;
  }, [selectedPains, customSaved, quizAnswers, capabilitiesRanked, metricsChecked, engagementPath, hasMediaExperience]);

  /* ─── Scoring ─── */
  const diagnosticScore = useMemo(() => calculateReadinessScore({
    selectedPains,
    hasCustomChallenge: customSaved && customMessage.trim().length > 0,
    quizAnswers: quizAnswers.filter((a): a is QuizAnswer => a !== null),
    capabilitiesRanked,
    metricsChecked,
    engagementPath,
    hasMediaExperience,
  }), [selectedPains, customSaved, customMessage, quizAnswers, capabilitiesRanked, metricsChecked, engagementPath, hasMediaExperience]);

  

  const ALL_SECTORS_LIST = ["News", "Music", "Film & TV", "Digital Creators", "Sports", "Podcasts & Streaming", "Advertising & Brands", "Tech & Platforms", "Organized Communities"];

  const handleCtaSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!ctaForm.firstName.trim() || !ctaForm.lastName.trim() || !ctaForm.email.trim() || ctaSubmitting) return;
    setCtaSubmitting(true);
    const metricsUnchecked = ALL_METRICS.filter(m => !metricsChecked.includes(m));
    const sectorsNotSelected = ALL_SECTORS_LIST.filter(s => !selectedSectors.includes(s));
    await supabase.from("deck_contacts" as any).insert({
      first_name: ctaForm.firstName.trim(),
      last_name: ctaForm.lastName.trim(),
      organization: ctaForm.organization.trim() || null,
      email: ctaForm.email.trim(),
      custom_challenge: customSaved ? customMessage.trim() || null : null,
      selected_pains: selectedPains.length > 0 ? selectedPains : null,
      engagement_path: engagementPath || null,
      selected_domains: selectedSectors.length > 0 ? selectedSectors : null,
      readiness_score: diagnosticScore,
      quiz_answers: quizAnswers.filter((a): a is QuizAnswer => a !== null),
      metrics_checked: metricsChecked.length > 0 ? metricsChecked : null,
      metrics_unchecked: metricsUnchecked.length > 0 ? metricsUnchecked : null,
      capabilities_ranked: capabilitiesRanked.length > 0 ? capabilitiesRanked : null,
      has_media_experience: hasMediaExperience,
      practice_selections: Object.entries(practiceSelections).filter(([, v]) => v).map(([k]) => parseInt(k)),
      sectors_not_selected: sectorsNotSelected.length > 0 ? sectorsNotSelected : null,
    } as any);
    sessionStorage.removeItem("deck-state");
    setCtaSubmitting(false);
    setCtaMode("thanks");
  };

  
  const selectedPainDatas = PAIN_POINTS.filter((p) => selectedPains.includes(p.id));

  /* ─── Navigation ─── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateCurrentFrame = () => {
      const scrollTop = el.scrollTop;
      const topAnchor = scrollTop + 24;

      let best = 0;
      frameRefs.current.forEach((frame, i) => {
        if (!frame) return;
        if (frame.offsetTop <= topAnchor) best = i;
      });
      setCurrentFrame(best);
    };

    el.addEventListener("scroll", updateCurrentFrame, { passive: true });
    updateCurrentFrame();
    return () => el.removeEventListener("scroll", updateCurrentFrame);
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
      // no-op guard removed (selectedCase moved to /work)
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
  }, [currentFrame, navigate, scrollToFrame, frameInteracted]);

  /* Wheel handler — lock deck scroll; only internal result panels may scroll */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      const resultsPanel = target?.closest("[data-results-scroll='true']") as HTMLElement | null;

      if (resultsPanel) {
        const canScroll = resultsPanel.scrollHeight > resultsPanel.clientHeight + 1;
        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;
        const atTop = resultsPanel.scrollTop <= 0;
        const atBottom = resultsPanel.scrollTop + resultsPanel.clientHeight >= resultsPanel.scrollHeight - 1;

        if (!canScroll || (scrollingDown && atBottom) || (scrollingUp && atTop)) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

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
        // Last question answered — auto-advance to next frame
        setQuizStep(QUIZ_ROWS.length);
        setQuizRevealed(true);
        setTimeout(() => scrollToFrame(3), 800);
      }
    }, 400);
  };

  const nextgenPickCount = quizAnswers.filter(a => a?.picked === "nextgen").length;
  const isFreshStart = selectedPains.includes("history");

  /* ─── Step labels for progress ─── */
  const STEP_LABELS = ["Start", "Diagnosis", "Strategy", "Practices", "Capabilities", "Metrics", "Path", "Team", "Results", "Connect"];

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
        overflowY: "hidden",
        overscrollBehaviorY: "none",
        scrollSnapType: "none",
        display: "flex",
        flexDirection: "column",
        background: "hsl(var(--background))",
      }}
    >

      {/* ─── Fixed UI Chrome — Top ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none" style={{ padding: "20px 32px" }}>
        <div className="flex items-center justify-between pointer-events-auto">
          <span style={{ fontFamily: f.sans, fontSize: "11px", letterSpacing: "0.08em", color: f.ink(0.35) }}>
            {STEP_LABELS[currentFrame] || ""} · {String(currentFrame + 1).padStart(2, "0")} / {String(TOTAL_FRAMES).padStart(2, "0")}
          </span>
          <button
            onClick={() => navigate("/")}
            className="transition-colors duration-200"
            style={{ color: f.ink(0.25), background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = f.ink(0.6))}
            onMouseLeave={(e) => (e.currentTarget.style.color = f.ink(0.25))}
            aria-label="Exit diagnostic"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Fixed UI Chrome — Bottom Nav (frames 1–10, not hero or close) ─── */}
      {currentFrame > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" style={{ padding: "16px clamp(16px, 4vw, 32px) calc(28px + env(safe-area-inset-bottom, 0px))", background: "linear-gradient(to top, hsl(var(--background)) 60%, transparent 100%)" }}>
          <div className="flex items-center justify-between pointer-events-auto" style={{ gap: "16px" }}>
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
            <div style={{ visibility: currentFrame < TOTAL_FRAMES - 1 ? "visible" : "hidden" }}>
              <ContinueButton onClick={() => scrollToFrame(currentFrame + 1)} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ FRAME 1: Hero ═══ */}
      <DeckFrame ref={setRef(0)} mode="wide">
        <div ref={r1.ref} className="flex flex-col items-start gap-12 min-h-[60vh] justify-center">
          <TypewriterHeading
            text="Find the gaps before your opponents do."
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
            A quick assessment of how your approach compares to the most effective operators in the field — and where you might be leaving leverage on the table.
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
              Get Started →
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
              Select all that apply. This helps us tailor what comes next.
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
            minHeight: "100%",
            justifyContent: "center",
            paddingBottom: "0",
          }}
        >
          {/* Header — only shown during quiz, not results */}
          {!quizRevealed && (
            <div
              style={{
                marginBottom: "clamp(24px, 4vw, 48px)",
              }}
            >
               <p style={{ ...heading("clamp(24px, 3.5vw, 44px)"), fontWeight: 700, transition: "font-size 0.4s ease" }}>
                 Which approach do you gravitate toward?
               </p>
            </div>
          )}

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
        </div>
      </DeckFrame>

      {/* ═══ FRAME 4: Practices ═══ */}
      <DeckFrame ref={setRef(3)} mode="wide">
        <div ref={r4.ref} className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.5fr)] w-full" style={{ gap: "clamp(40px, 5vw, 72px)", alignItems: "center", overflow: "hidden", minHeight: "80vh", marginTop: "-40px" }}>
          {/* Left column */}
          <div style={{ ...r4.stagger(0, 0, "blur-up") }}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700 }}>
              Effective programs do three things.
            </p>
            <p style={{ marginTop: "12px", fontFamily: f.sans, fontSize: "clamp(13px, 1.4vw, 16px)", color: f.ink(0.4), lineHeight: 1.6 }}>
              Select the ones you're most interested in.
            </p>
          </div>
          {/* Right column — accordion cards */}
          <div className="flex flex-col gap-3">
            {[
              { title: "They activate every cultural lever.", rationale: "They don't just push content out — they work behind the scenes so platforms across different sectors are pulling the message in. Music, faith communities, creator ecosystems, campuses, legal networks. Not just strategic comms.", help: "We maintain a presence across the cultural ecosystem and recruit partners who carry your message before you launch." },
              { title: "They coordinate across sectors.", rationale: "Nothing moves until multiple sectors are pushing on the same thing. The most effective programs leverage cultural engagement to bring policy, industry, labor, grassroots, and other sectors to the table around a shared focal point.", help: "We leverage media and cultural distribution to bring sectors to the table and align them around shared interests." },
              { title: "They organize for growth.", rationale: "It's not about organizing people who already agree. To win, your communications have to bring new people in — people who weren't there before. Only by demonstrating real persuasion can you move the people in power.", help: "We run campaigns that bring in new audiences, deepen engagement, and build leadership infrastructure that wins lasting power." },
            ].map((h, i) => {
              const isExpanded = expandedPracticeIdx === i;
              const isChecked = practiceSelections[i] === true;
              return (
                <div
                  key={i}
                  className="text-left w-full"
                  style={{
                    padding: isExpanded ? "24px 24px 20px" : "20px 24px",
                    background: isExpanded ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                    border: `1px solid ${isExpanded ? "hsl(var(--foreground) / var(--a-border))" : f.ink(0.06)}`,
                    borderRadius: "12px",
                    opacity: r4.isActive ? 1 : 0,
                    transform: r4.isActive ? "translateX(0) scale(1)" : "translateX(30px) scale(0.97)",
                    filter: r4.isActive ? "blur(0px)" : "blur(5px)",
                    transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 150}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 150}ms, filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 150}ms, background 0.25s ease, border-color 0.25s ease, padding 0.35s cubic-bezier(0.16, 1, 0.3, 1)`,
                  }}
                >
                  {/* Title row — number + title + checkbox + chevron */}
                  <div className="flex items-center gap-4">
                    <span style={{ fontFamily: f.sans, fontSize: "clamp(18px, 1.8vw, 24px)", fontWeight: 700, color: f.ink(0.15), minWidth: "28px", flexShrink: 0 }}>{i + 1}</span>
                    <button
                      className="flex-1 text-left"
                      onClick={() => setExpandedPracticeIdx(isExpanded ? null : i)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <p style={{ fontFamily: f.sans, fontSize: "clamp(15px, 1.8vw, 20px)", fontWeight: 700, color: isExpanded ? f.ink(0.85) : f.ink(0.65), transition: "color 0.25s ease" }}>{h.title}</p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPracticeSelections(prev => ({ ...prev, [i]: !prev[i] }));
                      }}
                      style={{
                        width: "20px", height: "20px", borderRadius: "5px", flexShrink: 0,
                        border: isChecked ? "none" : `1.5px solid ${f.ink(0.18)}`,
                        background: isChecked ? "hsl(var(--foreground) / var(--a-high))" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}
                      aria-label={`Select: ${h.title}`}
                    >
                      {isChecked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => setExpandedPracticeIdx(isExpanded ? null : i)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0 }}
                    >
                      <ChevronDown size={16} style={{ color: f.ink(0.2), transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }} />
                    </button>
                  </div>

                  {/* Expanded content */}
                  <div style={{
                    display: "grid",
                    gridTemplateRows: isExpanded ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ paddingTop: "14px" }}>
                        <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.2vw, 13px)", color: f.ink(0.55), marginLeft: "44px", lineHeight: 1.7 }}>{h.rationale}</p>
                        <div style={{ margin: "12px 0 0 44px", borderTop: `1px solid ${f.ink(0.08)}`, paddingTop: "12px" }}>
                          <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.2vw, 13px)", color: f.ink(0.5), lineHeight: 1.6 }}>
                            <span style={{ fontWeight: 700 }}>How we help:</span> {h.help}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DeckFrame>


      {/* ═══ FRAME 5: Capabilities — "Which 2 matter most?" ═══ */}
      <DeckFrame ref={setRef(4)} mode="wide">
        <div ref={r5.ref} className="flex flex-col gap-8">
          <div>
            <p style={{ ...heading("clamp(24px, 3vw, 40px)"), fontWeight: 700, ...r5.stagger(0, 0, "blur-up") }}>
              What support do you need most right now?
            </p>
            <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.4vw, 16px)", color: f.ink(0.4), marginTop: "8px", ...r5.stagger(1, 200, "blur-up") }}>
              Select at least two. This helps us prioritize what to discuss.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITIES.map((cap, i) => {
              const isSelected = capabilitiesRanked.includes(cap.id);
              const desc = [
                "A deep dive into your grantees, past investments, and institutional track record.",
                "Portfolio strategy custom-built for how your organization evaluates impact.",
                "Connections to top executives across music, film/TV, digital, and news.",
                "Co-designed around your objectives. Real indicators of power, not vanity metrics.",
                "Your team learns to evaluate, strategize, and run multi-sector campaigns on its own.",
                "Fractional or full-time capacity to help you manage specific initiatives or programs.",
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
                    opacity: r5.isActive ? 1 : 0,
                    transform: r5.isActive ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
                    filter: r5.isActive ? "blur(0px)" : "blur(5px)",
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

      {/* ═══ FRAME 6: Metrics Checklist ═══ */}
      <DeckFrame ref={setRef(5)} mode="wide">
        <div ref={r6.ref} className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.5fr)] w-full" style={{ gap: "clamp(40px, 5vw, 72px)", alignItems: "center", overflow: "hidden", minHeight: "80vh", marginTop: "-40px" }}>
          <div style={r6.stagger(0, 0, "blur-up")}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700 }}>
              How do you measure your impact?
            </p>
            <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.4vw, 16px)", color: f.ink(0.4), marginTop: "12px", lineHeight: 1.6 }}>
              Check what matters most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ALL_METRICS.map((metric, i) => {
              const isChecked = metricsChecked.includes(metric);
              
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
                    opacity: r6.isActive ? 1 : 0,
                    transform: r6.isActive ? "translateX(0)" : "translateX(20px)",
                    filter: r6.isActive ? "blur(0px)" : "blur(4px)",
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

      {/* ═══ FRAME 7: Working Together ═══ */}
      <DeckFrame ref={setRef(6)} mode="wide">
        <div ref={r7.ref} className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.5fr)] w-full" style={{ gap: "clamp(40px, 5vw, 72px)", alignItems: "center", overflow: "hidden", minHeight: "80vh", marginTop: "-40px" }}>
          {/* Left column — heading */}
          <div style={r7.stagger(0, 0, "blur-up")}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700 }}>
              How do you want to start?
            </p>
            <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.4vw, 16px)", color: f.ink(0.4), marginTop: "12px", lineHeight: 1.6 }}>
              Pick whichever fits. We'll shape the engagement from there.
            </p>
          </div>

          {/* Right column — two paths */}
          <div className="flex flex-col gap-4">
            {/* Path 1: Already up to speed */}
            <button
              onClick={() => {
                setEngagementPath("experienced");
                setTimeout(() => scrollToFrame(currentFrame + 1), 400);
              }}
              className="text-left transition-all duration-300 w-full"
              style={{
                padding: "28px 28px",
                border: engagementPath === "experienced" ? "1px solid hsl(var(--foreground) / var(--a-high))" : `1px solid ${f.ink(0.08)}`,
                background: engagementPath === "experienced" ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                borderRadius: "12px",
                cursor: "pointer",
                opacity: r7.isActive ? 1 : 0,
                transform: r7.isActive ? "translateX(0)" : "translateX(20px)",
                filter: r7.isActive ? "blur(0px)" : "blur(4px)",
                transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 300ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 300ms, filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) 300ms, background 0.2s ease, border 0.2s ease",
              }}
            >
              <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 1.8vw, 20px)", fontWeight: 700, color: f.ink(0.8), marginBottom: "6px" }}>Already up to speed</p>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.2vw, 14px)", color: f.ink(0.45), lineHeight: 1.7 }}>
                You have active programs and know the gaps. You need a pro to pressure-test, connect, and execute. Let's get on a call.
              </p>
            </button>

            {/* Path 2: Starting fresh */}
            <button
              onClick={() => {
                setEngagementPath("fresh");
                setTimeout(() => scrollToFrame(currentFrame + 1), 400);
              }}
              className="text-left transition-all duration-300 w-full"
              style={{
                padding: "28px 28px",
                border: engagementPath === "fresh" ? "1px solid hsl(var(--foreground) / var(--a-high))" : `1px solid ${f.ink(0.08)}`,
                background: engagementPath === "fresh" ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                borderRadius: "12px",
                cursor: "pointer",
                opacity: r7.isActive ? 1 : 0,
                transform: r7.isActive ? "translateX(0)" : "translateX(20px)",
                filter: r7.isActive ? "blur(0px)" : "blur(4px)",
                transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 450ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 450ms, filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) 450ms, background 0.2s ease, border 0.2s ease",
              }}
            >
              <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 1.8vw, 20px)", fontWeight: 700, color: f.ink(0.8), marginBottom: "6px" }}>Starting fresh</p>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(12px, 1.2vw, 14px)", color: f.ink(0.45), lineHeight: 1.7 }}>
                No portfolio, a scattered one, or you're early in the process. We offer free consultations to help you get started.
              </p>
            </button>
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 8: Sectors ═══ */}
      <DeckFrame ref={setRef(7)} mode="wide">
        <div ref={r8.ref} className="w-full">
          <div style={{ ...r8.stagger(0, 0, "blur-up"), marginBottom: "clamp(20px, 3vh, 36px)" }}>
            <p style={{ ...heading("clamp(26px, 3.5vw, 44px)"), fontWeight: 700 }}>
              We come from the industries your grantees need to reach.
            </p>
            <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.4vw, 16px)", color: f.ink(0.4), marginTop: "12px", lineHeight: 1.6 }}>
              Our team is built from careers in commercial media and entertainment — so we know how these sectors actually work from the inside. Select the ones you're interested in.
            </p>
          </div>

          {/* 3×3 selectable card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              { name: "News", desc: "Local and national — how stories get placed and why" },
              { name: "Music", desc: "Artists, labels, tours, festivals, venues" },
              { name: "Film & TV", desc: "Production, distribution, cultural impact" },
              { name: "Digital Creators", desc: "Creator economy — where opinion forms now" },
              { name: "Sports", desc: "Athletes, leagues, the largest captive audiences" },
              { name: "Podcasts & Streaming", desc: "Long-form audio, gaming, live streaming" },
              { name: "Advertising & Brands", desc: "Commercial partnerships at scale" },
              { name: "Tech & Platforms", desc: "The infrastructure that decides what gets seen" },
              { name: "Organized Communities", desc: "Faith, labor, campuses, veterans, defense" },
            ].map((sector, i) => {
              const isSelected = selectedSectors.includes(sector.name);
              return (
                <button
                  key={sector.name}
                  onClick={() => setSelectedSectors(prev => isSelected ? prev.filter(s => s !== sector.name) : [...prev, sector.name])}
                  className="text-left transition-all duration-200"
                  style={{
                    padding: "clamp(14px, 1.8vw, 20px)",
                    border: isSelected ? "1px solid hsl(var(--foreground) / var(--a-high))" : `1px solid ${f.ink(0.06)}`,
                    background: isSelected ? "hsl(var(--foreground) / var(--a-bg))" : "transparent",
                    borderRadius: "10px",
                    cursor: "pointer",
                    opacity: r8.isActive ? 1 : 0,
                    transform: r8.isActive ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
                    filter: r8.isActive ? "blur(0px)" : "blur(4px)",
                    transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 60}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 60}ms, filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 60}ms, background 0.15s ease, border 0.15s ease`,
                  }}
                >
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.3vw, 15px)", fontWeight: 700, color: isSelected ? f.ink(0.85) : f.ink(0.7), lineHeight: 1.3, marginBottom: "3px" }}>
                    {sector.name}
                  </p>
                  <p style={{ fontFamily: f.sans, fontSize: "clamp(10px, 1vw, 12px)", color: isSelected ? f.ink(0.5) : f.ink(0.35), lineHeight: 1.5 }}>
                    {sector.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </DeckFrame>

      {/* ═══ FRAME 9: Preliminary Results ═══ */}
      <DeckFrame ref={setRef(8)} mode="wide" align="left">
        <div ref={r9.ref} style={{ width: "100%" }}>
          {(() => {
            const grade = getQuizGrade(nextgenPickCount, QUIZ_ROWS.length);
            return (
              <div
                className="grid grid-cols-1 lg:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.4fr)]"
                style={{
                  width: "100%",
                  alignItems: "start",
                  gap: "clamp(24px, 3vw, 48px)",
                }}
              >
                {/* Left column — diagnostic card + retake + CTA */}
                <div className="flex flex-col gap-5" style={{ alignSelf: "start" }}>
                  <p style={{ ...r9.stagger(0, 0, "blur-up"), ...label("10px"), color: f.ink(0.3) }}>Preliminary results</p>

                  <div
                    style={{
                      ...r9.stagger(1, 100, "blur-scale"),
                      padding: "clamp(24px, 3vw, 36px)",
                      borderRadius: "20px",
                      background: "hsl(var(--foreground) / var(--a-bg))",
                      border: "1px solid hsl(var(--foreground) / var(--a-border-card))",
                    }}
                  >
                    <p style={{ ...label("10px"), color: f.ink(0.3), marginBottom: "16px" }}>Your diagnostic</p>
                    <p style={{ fontFamily: f.sans, fontSize: "clamp(20px, 2.4vw, 28px)", fontWeight: 700, color: f.ink(0.88), lineHeight: 1.15, marginBottom: "16px" }}>
                      {grade.grade}
                    </p>
                    <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.2vw, 15px)", color: f.ink(0.5), lineHeight: 1.7 }}>
                      {grade.summary}
                    </p>
                    <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${f.ink(0.06)}`, display: "flex", alignItems: "baseline", gap: "12px" }}>
                      <p style={{ fontFamily: f.sans, fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 700, color: f.ink(0.85), lineHeight: 1 }}>
                        {diagnosticScore}
                      </p>
                      <p style={{ fontFamily: f.sans, fontSize: "12px", color: f.ink(0.3) }}>/ 100 readiness</p>
                    </div>
                  </div>

                  <p style={{ ...r9.stagger(2, 300, "blur-up"), fontFamily: f.sans, fontSize: "clamp(12px, 1.2vw, 14px)", color: f.ink(0.35), lineHeight: 1.7 }}>
                    This is a preview. Your full diagnostic includes a detailed breakdown across every dimension — plus recommendations tailored to your portfolio.
                  </p>

                  <div style={{ ...r9.stagger(3, 450, "blur-up"), display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                    <ContinueButton onClick={() => scrollToFrame(9)} label="Get your full diagnostic →" />
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
                        fontFamily: f.sans, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600,
                        color: f.ink(0.4), background: "none", border: "none", padding: "12px 8px",
                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = f.ink(0.7); }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = f.ink(0.4); }}
                    >
                      <RotateCcw size={13} style={{ flexShrink: 0 }} />
                      Retake quiz
                    </button>
                  </div>
                </div>

                {/* Right column — dimension cards */}
                <div
                  className="flex flex-col gap-4 results-scrollbar lg:pr-3 max-h-[36vh] lg:max-h-[clamp(560px,calc(100dvh-220px),760px)]"
                  data-results-scroll="true"
                  style={{
                    ...r9.stagger(2, 200, "slide-left"),
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    paddingBottom: "80px",
                    paddingLeft: "clamp(0px, 1vw, 16px)",
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
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                          <span style={{
                            display: "inline-block", width: "8px", height: "8px", borderRadius: "50%",
                            background: pickedNextGen ? "hsl(142 50% 50%)" : f.ink(0.2), flexShrink: 0,
                          }} />
                          <p style={{ fontFamily: f.sans, fontSize: "clamp(16px, 1.5vw, 20px)", fontWeight: 700, color: f.ink(0.85), letterSpacing: "-0.01em" }}>{row.dimension}</p>
                        </div>

                        <p style={{
                          fontFamily: f.sans, fontSize: "clamp(13px, 1.15vw, 14px)", color: f.ink(0.4), lineHeight: 1.7,
                          fontStyle: "italic", paddingLeft: "20px", borderLeft: `2px solid ${f.ink(0.08)}`, marginBottom: "24px",
                        }}>
                          {selectedCopy}
                        </p>

                        <p style={{ ...label("9px"), color: f.ink(0.25), marginBottom: "8px", textTransform: "uppercase" as const }}>{explanationLabel}</p>
                        <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.2vw, 15px)", color: f.ink(0.65), lineHeight: 1.7, fontWeight: 500 }}>
                          {lede}
                        </p>

                        {/* Expandable bullets */}
                        <div style={{
                          display: "grid",
                          gridTemplateRows: isExpanded ? "1fr" : "0fr",
                          transition: "grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}>
                          <div style={{ overflow: "hidden" }}>
                            <ul style={{
                              listStyle: "none", padding: 0, margin: "20px 0 0 0",
                              display: "flex", flexDirection: "column", gap: "12px",
                              paddingTop: "20px", borderTop: `1px solid ${f.ink(0.06)}`,
                            }}>
                              {bullets.map((b, bi) => (
                                <li key={bi} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                  <span style={{ color: f.ink(0.12), fontSize: "6px", lineHeight: "24px", flexShrink: 0 }}>●</span>
                                  <span style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.1vw, 14px)", color: f.ink(0.42), lineHeight: 1.75 }}>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedDimension(isExpanded ? null : i)}
                          style={{
                            fontFamily: f.sans, fontSize: "11px", fontWeight: 600, color: f.ink(0.3),
                            background: "none", border: "none", padding: "0", marginTop: "20px",
                            cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" as const,
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
            );
          })()}
        </div>
      </DeckFrame>

      {/* ═══ FRAME 10: CTA — Get Your Diagnostic ═══ */}
      <DeckFrame ref={setRef(9)} mode="narrow">
        <div ref={r10.ref}>
          {ctaMode === "thanks" ? (
            <div className="flex flex-col items-center text-center" style={{ animation: "fade-in 0.5s ease-out" }}>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, color: f.ink(0.9), letterSpacing: "-0.02em", lineHeight: 1.1 }}>Got it.</p>
              <p style={{ fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 17px)", color: f.ink(0.45), lineHeight: 1.7, maxWidth: "420px", margin: "16px auto 0" }}>
                We're putting together your full diagnostic based on your answers. Check your inbox.
              </p>
              <a href="/" style={{
                display: "inline-block", marginTop: "32px", fontFamily: f.sans, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 500,
                color: f.ink(0.35), textDecoration: "none", transition: "color 200ms",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = f.ink(0.7); }}
                onMouseLeave={(e) => { e.currentTarget.style.color = f.ink(0.35); }}
              >Return to site</a>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center max-w-[460px] mx-auto">
              <h2 style={{ ...r10.stagger(0, 0, "blur-up"), fontFamily: f.sans, fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 700, color: f.ink(0.9), letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Let's talk.
              </h2>
              <p style={{ ...r10.stagger(1, 300, "blur-up"), fontFamily: f.sans, fontSize: "clamp(14px, 1.6vw, 17px)", color: f.ink(0.45), lineHeight: 1.7, marginTop: "12px", maxWidth: "420px" }}>
                Fill out your details and we'll send your full diagnostic — plus a link to schedule a call if you'd like to walk through it together.
              </p>

              <form onSubmit={handleCtaSubmit} className="flex flex-col gap-4 text-left w-full" style={{ ...r10.stagger(2, 500, "blur-up"), marginTop: "40px" }}>
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
                      cursor: (ctaForm.firstName.trim() && ctaForm.lastName.trim() && ctaForm.email.trim()) ? "pointer" : "default", transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => { if (ctaForm.firstName.trim() && ctaForm.email.trim()) e.currentTarget.style.background = "hsl(var(--foreground))"; }}
                    onMouseLeave={(e) => { if (ctaForm.firstName.trim() && ctaForm.email.trim()) e.currentTarget.style.background = "hsl(var(--foreground) / var(--a-high))"; }}
                  >{ctaSubmitting ? "Sending…" : "Send me my diagnostic"}</button>
                </div>
                {/* Link to case studies after form */}
                <button
                  type="button"
                  onClick={() => { saveDeckState(); navigate("/work", { state: { from: "/diagnostic" } }); }}
                  style={{
                    ...r10.stagger(3, 700, "blur-up"),
                    fontFamily: f.sans, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 500,
                    color: f.ink(0.35), background: "none", border: "none", cursor: "pointer", marginTop: "16px", transition: "color 200ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = f.ink(0.7); }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = f.ink(0.35); }}
                >
                  See our work →
                </button>
              </form>
            </div>
          )}
        </div>
      </DeckFrame>

    </div>
  );
};

export default Deck;
