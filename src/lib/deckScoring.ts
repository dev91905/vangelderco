/**
 * Deck Diagnostic Scoring Engine
 * 
 * Calculates a "strategic readiness" score (0–100).
 * Lower score = more gaps = hotter lead for the agency.
 * 
 * Score labels:
 *   0–25:  Critical — full diagnostic needed
 *  26–50:  Significant gaps — strong engagement candidate
 *  51–75:  Moderate — targeted support
 *  76–100: Advanced — light-touch advisory
 */

export interface QuizAnswer {
  dimension: string;
  picked: "traditional" | "nextgen";
}

export interface DeckDiagnosticInput {
  selectedPains: string[];
  hasCustomChallenge: boolean;
  quizAnswers: QuizAnswer[];
  selectedDomains: string[];
  capabilitiesRanked: string[];
  metricsChecked: string[];
  engagementPath: "fresh" | "experienced" | null;
  hasMediaExperience: boolean | null;
}

/** Vanity metrics — checking these lowers the score */
const VANITY_METRICS = [
  "Impressions and reach",
  "Video views (3-second scroll-bys)",
  "Media mentions",
  "Social engagement",
  "Website traffic",
  '"Awareness"',
];

export function calculateReadinessScore(input: DeckDiagnosticInput): number {
  let score = 100;

  // Pain points: -5 each, max -25
  score -= Math.min(input.selectedPains.length * 5, 25);

  // Custom challenge written: -5
  if (input.hasCustomChallenge) score -= 5;

  // Quiz: -8 per traditional pick (picking traditional = penalized)
  const traditionalPicks = input.quizAnswers.filter(a => a.picked === "traditional").length;
  score -= traditionalPicks * 8;

  // All three domains selected: -5
  if (input.selectedDomains.length >= 3) score -= 5;

  // Capabilities: -2 per capability ranked (they need more = worse shape)
  score -= Math.min(input.capabilitiesRanked.length * 2, 12);

  // Vanity metrics: -3 per vanity metric checked
  const vanityCount = input.metricsChecked.filter(m => VANITY_METRICS.includes(m)).length;
  score -= vanityCount * 3;

  // Engagement path "fresh": -10
  if (input.engagementPath === "fresh") score -= 10;

  // No media experience: -5
  if (input.hasMediaExperience === false) score -= 5;

  return Math.max(0, Math.min(100, score));
}

export function getScoreLabel(score: number): { label: string; color: string; severity: "critical" | "significant" | "moderate" | "advanced" } {
  if (score <= 25) return { label: "Critical", color: "hsl(0 72% 51%)", severity: "critical" };
  if (score <= 50) return { label: "Significant gaps", color: "hsl(25 95% 53%)", severity: "significant" };
  if (score <= 75) return { label: "Moderate", color: "hsl(45 93% 47%)", severity: "moderate" };
  return { label: "Advanced", color: "hsl(142 71% 45%)", severity: "advanced" };
}

/** Client-facing grade based on how many next-gen approaches were picked (0–5) */
export function getQuizGrade(nextgenCount: number, total: number): { grade: string; summary: string } {
  const ratio = nextgenCount / total;
  if (ratio >= 0.8) return {
    grade: "Ahead of the field",
    summary: "You're already thinking the way the most effective operators think. The question is whether your portfolio is executing at this level — or if there's a gap between instinct and implementation.",
  };
  if (ratio >= 0.4) return {
    grade: "Strong foundation, clear gaps",
    summary: "You've identified some of the shifts that separate effective programs from the rest. The dimensions below show exactly where conventional thinking may be leaving you exposed.",
  };
  return {
    grade: "Room to move",
    summary: "The approaches you chose are industry standard — necessary, but no longer sufficient. The operators who are winning do everything you're doing and more. The breakdown shows where.",
  };
}
