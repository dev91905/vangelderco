import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ─── Approved copy from the deck ─── */
const PAIN_LABELS: Record<string, string> = {
  history: "No portfolio yet",
  evaluate: "No strategy connecting spend to outcomes",
  access: "Limited channels and reach",
  measurement: "Can't tell what's working",
  expertise: "No in-house media expertise",
};

const PRACTICES = [
  "Activate every cultural lever",
  "Coordinate across sectors",
  "Organize for growth",
];

const QUIZ_DIMENSIONS = [
  {
    dimension: "Strategy",
    traditional: "Start with your message. Use research to figure out how to deliver it.",
    nextgen: "Start with what's already moving. Put infrastructure and resources behind it.",
    shift: "Focus groups test messages you already believe in. The most effective operators find where energy is already forming — then put infrastructure behind it.",
    recommendation: "Map the organic energy in your issue space before designing campaigns. Fund infrastructure behind what's already moving.",
  },
  {
    dimension: "Content",
    traditional: "Lead with credibility — documentaries, op-eds, explainers, paid ads.",
    nextgen: "Fund always-on participatory content and investigative journalism.",
    shift: "Prestige content gets filed away. Participatory content compounds — audiences spread it, remix it, build identity around it.",
    recommendation: "Add always-on creator ecosystems and investigative journalism to your portfolio alongside prestige formats.",
  },
  {
    dimension: "Distribution",
    traditional: "Buy targeted placements on major platforms. Optimize for reach and frequency.",
    nextgen: "Own or shape the platforms — the algorithms, editorial, programming.",
    shift: "Buying placements rents attention under someone else's rules. When the algorithm changes, your reach disappears.",
    recommendation: "Invest in owned channels and platform-level influence rather than renting attention through ad placements.",
  },
  {
    dimension: "Engagement",
    traditional: "Partner with influencers to amplify your message to online audiences.",
    nextgen: "Organize offline — faith communities, campuses, business and legal networks.",
    shift: "Influencer partnerships stay online and surface-level. Real-world networks carry built-in trust and turnout.",
    recommendation: "Fund offline organizing infrastructure — faith communities, campuses, legal networks — alongside online reach.",
  },
  {
    dimension: "Measurement",
    traditional: "Track reach, impressions, and awareness. Build the case it's landing.",
    nextgen: "Track who's showing up, what policy moved, what infrastructure formed.",
    shift: "Most 'views' are three-second scroll-bys. Impressions don't measure power.",
    recommendation: "Shift measurement to track new constituencies, policy movement, and permanent infrastructure built.",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { contactId } = await req.json();
    if (!contactId) throw new Error("contactId required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const { data: contact, error: cErr } = await sb
      .from("diagnostic_contacts")
      .select("*")
      .eq("id", contactId)
      .single();
    if (cErr || !contact) throw new Error("Contact not found");

    const { data: settings } = await sb.from("site_settings").select("*");
    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => { settingsMap[s.key] = s.value; });
    const contactEmail = settingsMap.contact_email || "info@vangelderco.com";
    const bookingLink = settingsMap.booking_link || "";

    const quizAnswers = (contact.quiz_answers || []) as Array<{ dimension: string; picked: string }>;
    const pains = (contact.selected_pains || []) as string[];
    const practiceIdxs = (contact.practice_selections || []) as number[];
    const metricsChecked = (contact.metrics_checked || []) as string[];
    const metricsUnchecked = (contact.metrics_unchecked || []) as string[];
    const sectors = (contact.selected_domains || []) as string[];

    // Build dimension results
    const dimensionResults = QUIZ_DIMENSIONS.map(dim => {
      const answer = quizAnswers.find(a => a.dimension === dim.dimension);
      const isAdvanced = answer?.picked === "nextgen";
      return {
        dimension: dim.dimension,
        picked: isAdvanced ? "advanced" as const : "conventional" as const,
        pickedLabel: isAdvanced ? dim.nextgen : dim.traditional,
        shift: dim.shift,
        recommendation: dim.recommendation,
      };
    });

    const nextgenCount = dimensionResults.filter(d => d.picked === "advanced").length;
    const conventionalDims = dimensionResults.filter(d => d.picked === "conventional");

    // Generate AI executive summary + per-gap recommendations
    const aiOutput = await generateAIInsights(quizAnswers, conventionalDims, pains, metricsUnchecked, QUIZ_DIMENSIONS);

    const structuredReport = {
      contact: {
        firstName: contact.first_name,
        lastName: contact.last_name,
        organization: contact.organization || null,
        email: contact.email,
        date: new Date(contact.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      },
      readinessScore: contact.readiness_score ?? 50,
      quizSummary: {
        advancedCount: nextgenCount,
        total: quizAnswers.length,
      },
      dimensionResults,
      painPoints: pains.map(p => PAIN_LABELS[p] || p),
      metricsTracked: metricsChecked,
      metricsMissing: metricsUnchecked,
      selectedPractices: practiceIdxs.map(i => PRACTICES[i]).filter(Boolean),
      sectors,
      executiveSummary: aiOutput.executiveSummary,
      gapInsights: aiOutput.gapInsights,
      contactEmail,
      bookingLink,
    };

    return new Response(JSON.stringify({ report: structuredReport }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-diagnostic error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateAIInsights(
  quizAnswers: Array<{ dimension: string; picked: string }>,
  conventionalDims: Array<{ dimension: string; shift: string }>,
  pains: string[],
  missingMetrics: string[],
  allDims: typeof QUIZ_DIMENSIONS,
): Promise<{ executiveSummary: string; gapInsights: Record<string, string> }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return {
      executiveSummary: "Analysis unavailable — API key not configured.",
      gapInsights: {},
    };
  }

  const picks = quizAnswers.map(a => {
    const dim = allDims.find(d => d.dimension === a.dimension);
    return `${a.dimension}: ${a.picked === "nextgen" ? "advanced" : "conventional"} — "${a.picked === "nextgen" ? dim?.nextgen : dim?.traditional}"`;
  }).join("\n");

  const gapList = conventionalDims.map(d => d.dimension).join(", ");
  const painList = pains.join(", ");

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You write strategic diagnostic analysis for philanthropic executives funding $100M+ programs. You are direct, concise, and grounded. No flattery. You understand how conservative and corporate opponents fund media, culture, and policy infrastructure — and you reference this to show where gaps create strategic exposure.`,
          },
          {
            role: "user",
            content: `Philanthropic executive diagnostic data:

Quiz answers (5 dimensions — Strategy, Content, Distribution, Engagement, Measurement):
${picks}

Conventional (gap) dimensions: ${gapList || "none"}
Self-identified pain points: ${painList || "none"}
Metrics NOT being tracked: ${missingMetrics.join(", ") || "none"}

Generate structured insights using the tool provided.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "diagnostic_insights",
              description: "Return executive summary and per-gap competitive insights.",
              parameters: {
                type: "object",
                properties: {
                  executive_summary: {
                    type: "string",
                    description: "3-4 sentences connecting patterns across dimensions. Reference how opponents/competitors fund in these areas. Identify the strategic exposure created by gaps. Be specific about which dimensions are strong vs exposed. No markdown formatting.",
                  },
                  gap_insights: {
                    type: "object",
                    description: "One insight per conventional dimension. Key = dimension name, value = 1-2 sentence insight about what competitors are doing differently in this area and the specific exposure it creates.",
                    additionalProperties: { type: "string" },
                  },
                },
                required: ["executive_summary", "gap_insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "diagnostic_insights" } },
      }),
    });

    if (!resp.ok) {
      console.error("AI gateway error:", resp.status, await resp.text());
      return { executiveSummary: "Cross-dimensional analysis could not be generated at this time.", gapInsights: {} };
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return {
        executiveSummary: parsed.executive_summary || "",
        gapInsights: parsed.gap_insights || {},
      };
    }

    return { executiveSummary: "Analysis could not be generated.", gapInsights: {} };
  } catch (err) {
    console.error("AI call failed:", err);
    return { executiveSummary: "Cross-dimensional analysis could not be generated at this time.", gapInsights: {} };
  }
}
