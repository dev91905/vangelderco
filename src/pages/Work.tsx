import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { t } from "@/lib/theme";
import CaseCarousel from "@/components/diagnostic/CaseCarousel";
import CaseTimelineOverlay, { type CaseStudyData } from "@/components/diagnostic/CaseTimelineOverlay";

const f = { sans: t.sans, ink: t.ink };
const heading = t.heading;

const FALLBACK_CASE_STUDIES: CaseStudyData[] = [
  { id: "fb-0", name: "Clean Energy Workforce", issue: "Skilled trades bottleneck threatening federal climate policy", outcome: "40K reached, 4,000 workers registered, model now replicating nationally", phases: null },
  { id: "fb-1", name: "Facial Recognition Ban", issue: "First-ever ban on facial recognition technology", outcome: "Legislation passed — New York State", phases: null },
  { id: "fb-2", name: "Faithless Electors", issue: "Constitutional vulnerability in the Electoral College", outcome: "Supreme Court decision", phases: null },
  { id: "fb-3", name: "Iceland Whaling", issue: "Commercial hunting of endangered fin whales", outcome: "185 fin whales saved", phases: null },
  { id: "fb-4", name: "Ireland Fracking Ban", issue: "Fracking expansion in Ireland", outcome: "National ban passed", phases: null },
  { id: "fb-5", name: "Gulf of Mexico Lease Sales", issue: "Fossil fuel lease sales in federal waters", outcome: "Lease sales blocked", phases: null },
  { id: "fb-6", name: "Brazil Indigenous Rights", issue: "Anti-indigenous legislation in the Brazilian legislature", outcome: "Legislation blocked", phases: null },
  { id: "fb-7", name: "UN Biodiversity Targets", issue: "Weak international biodiversity framework", outcome: "Stronger targets adopted — 2022", phases: null },
  { id: "fb-8", name: "Clean Energy Executive Action", issue: "Stalled federal clean energy production", outcome: "Executive action secured — national security framing", phases: null },
  { id: "fb-9", name: "Presidential Cabinet", issue: "Key cabinet appointments", outcome: "Appointments influenced", phases: null },
];

const Work: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCase, setSelectedCase] = useState<CaseStudyData | null>(null);
  const deepLinkedCase = useRef(false);
  const cameFromDiagnostic = (location.state as { from?: string })?.from === "/diagnostic";

  const { data: dbCaseStudies } = useQuery({
    queryKey: ["diagnostic-case-studies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnostic_case_studies")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        issue: row.issue,
        outcome: row.outcome,
        phases: row.phases as CaseStudyData["phases"],
        link_url: row.link_url || null,
      })) as CaseStudyData[];
    },
  });
  const caseStudies = dbCaseStudies && dbCaseStudies.length > 0 ? dbCaseStudies : FALLBACK_CASE_STUDIES;

  // Deep-link: auto-open case study from ?case=<id>
  useEffect(() => {
    const caseId = searchParams.get("case");
    if (caseId && caseStudies.length > 0) {
      const match = caseStudies.find((c) => c.id === caseId);
      if (match) {
        setSelectedCase(match);
        deepLinkedCase.current = true;
        searchParams.delete("case");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, caseStudies]);

  const handleBack = () => {
    const hasDeckSession = !!sessionStorage.getItem("deck-state");
    if (cameFromDiagnostic && hasDeckSession) {
      navigate("/diagnostic");
    } else {
      navigate("/");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100vw",
        background: "hsl(var(--background))",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{ padding: "20px clamp(16px, 4vw, 32px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <button
          onClick={handleBack}
          style={{
            fontFamily: f.sans, fontSize: "12px", letterSpacing: "0.04em",
            color: f.ink(0.3), background: "none", border: "none", cursor: "pointer",
            transition: "color 200ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = f.ink(0.6); }}
          onMouseLeave={(e) => { e.currentTarget.style.color = f.ink(0.3); }}
        >
          ← Back
        </button>
        <button
          onClick={() => navigate("/")}
          style={{ color: f.ink(0.25), background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = f.ink(0.6))}
          onMouseLeave={(e) => (e.currentTarget.style.color = f.ink(0.25))}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "clamp(28px, 4vh, 44px)",
          overflow: "hidden",
          minHeight: "min(72vh, 760px)",
        }}
      >
        <div style={{ paddingLeft: "clamp(24px, 4vw, 80px)", paddingRight: "clamp(24px, 4vw, 80px)" }}>
          <p style={{ ...heading("clamp(28px, 3.8vw, 46px)"), fontWeight: 700 }}>Selected work.</p>
          <p style={{ fontFamily: f.sans, fontSize: "clamp(13px, 1.4vw, 15px)", color: f.ink(0.38), marginTop: "10px", lineHeight: 1.6, maxWidth: "440px" }}>
            Cross-sector programs, real outcomes.
          </p>
        </div>

        <CaseCarousel
          studies={caseStudies}
          isActive={true}
          onSelect={setSelectedCase}
        />
      </div>

      {/* Case Study Timeline Overlay */}
      <CaseTimelineOverlay
        study={selectedCase}
        onClose={() => {
          if (deepLinkedCase.current) {
            deepLinkedCase.current = false;
            handleBack();
          } else {
            setSelectedCase(null);
          }
        }}
      />
    </div>
  );
};

export default Work;
