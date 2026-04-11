import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Static content from the deck ───
const PAIN_POINTS: Record<string, string> = {
  history: "Just getting started — no portfolio yet.",
  evaluate: "Funding comms, no strategy — spending without clear outcomes.",
  access: "Limited channels — stuck in op-eds, paid ads, and social.",
  measurement: "Not sure what to measure — campaigns running blind.",
  expertise: "No expertise in-house — guessing when things break.",
};

const QUIZ_DIMENSIONS = [
  {
    dimension: "Strategy",
    traditional: "Start with your message. Use research to figure out how to deliver it.",
    nextgen: "Start with what's already moving. Put infrastructure and resources behind it.",
    traditionalLede: "That work still matters — but on its own, it misses what's already moving.",
    traditionalDetail: "Focus groups test messages you already believe in, with people sorted by demographics — not by the value systems that actually drive behavior. If something organic is happening that doesn't fit your framework, you miss it. The most effective operators find where energy is already forming — then put infrastructure behind it.",
    nextgenLede: "You're building on real energy — not manufacturing it.",
    nextgenDetail: "When people are already organizing around something they care about, you don't need to convince them to show up. You need to give them structure, resources, and strategy. This is how the most effective political networks operate — and how foreign adversaries exploit domestic divisions.",
  },
  {
    dimension: "Content",
    traditional: "Lead with credibility — documentaries, op-eds, explainers, paid ads.",
    nextgen: "Fund always-on participatory content and investigative journalism.",
    traditionalLede: "Credibility content still has a role — but on its own, it talks at people rather than inviting them in.",
    traditionalDetail: "The gap is participatory, investigative content — creator ecosystems and journalism running around the clock. Political identity and cultural narrative form in real time. You need to be inside those conversations, not reacting after the fact.",
    nextgenLede: "Participatory content compounds. Prestige content gets filed away.",
    nextgenDetail: "Creator ecosystems and investigative journalism running around the clock means you're inside the conversation as identity, conspiracy, and narrative form in real time. Audiences don't just consume this content — they spread it, remix it, and build identity around it.",
  },
  {
    dimension: "Distribution",
    traditional: "Buy targeted placements on major platforms. Optimize for reach and frequency.",
    nextgen: "Own or shape the platforms — the algorithms, editorial, programming.",
    traditionalLede: "Buying placements rents attention on someone else's platform, under someone else's rules.",
    traditionalDetail: "The algorithm changes, your reach disappears. The platform shifts policy, your content gets deprioritized. You have no control. The most effective operators aren't buying ads on platforms — they're buying the platforms.",
    nextgenLede: "If you own the platform, you decide what millions of people see.",
    nextgenDetail: "You shape the algorithm, the editorial direction, the programming. Buying placements is renting someone else's audience. Owning the channel means the rules are yours — and they stay yours when someone else's algorithm changes overnight.",
  },
  {
    dimension: "Engagement",
    traditional: "Partner with influencers to amplify your message to online audiences.",
    nextgen: "Organize offline — faith communities, campuses, business and legal networks.",
    traditionalLede: "Online amplification has value — but on its own, it stays exactly where the algorithm wants you.",
    traditionalDetail: "Influencer partnerships stay online — scripted posts, retweets, celebrity endorsements. That's surface-level. The gap is offline. The most effective operators fund faith communities, campuses, business associations, and legal networks.",
    nextgenLede: "Real-world networks and gathering points carry built-in trust and turnout.",
    nextgenDetail: "Faith communities, campuses, music venues, business associations, legal networks — these are massive structures where people already gather, show up, and trust each other. Offline power is what turns attention into action.",
  },
  {
    dimension: "Measurement",
    traditional: "Track reach, impressions, and awareness. Build the case it's landing.",
    nextgen: "Track who's showing up, what policy moved, what infrastructure formed.",
    traditionalLede: "Most of those 'views' are three-second scroll-bys that Meta counts as a view.",
    traditionalDetail: "Your audience saw your content while their thumb was in motion. You build a report showing millions of impressions, but impressions don't measure power. The programs that move the needle measure something different: Who showed up? What policy moved? What infrastructure exists now?",
    nextgenLede: "Tracking power, not impressions, tells you whether you're actually building something.",
    nextgenDetail: "One report says '10 million impressions.' The other says '4,000 new people, two bills advanced, three permanent coalitions.' One is noise. The other is power.",
  },
];

const PRACTICES = [
  {
    title: "They activate every cultural lever.",
    rationale:
      "They don't just push content out — they work behind the scenes so platforms across different sectors are pulling the message in. Music, faith communities, creator ecosystems, campuses, legal networks.",
    help: "We maintain a presence across the cultural ecosystem and recruit partners who carry your message before you launch.",
  },
  {
    title: "They coordinate across sectors.",
    rationale:
      "Nothing moves until multiple sectors are pushing on the same thing. The most effective programs leverage cultural engagement to bring policy, industry, labor, grassroots, and other sectors to the table.",
    help: "We leverage media and cultural distribution to bring sectors to the table and align them around shared interests.",
  },
  {
    title: "They organize for growth.",
    rationale:
      "It's not about organizing people who already agree. To win, your communications have to bring new people in — people who weren't there before.",
    help: "We run campaigns that bring in new audiences, deepen engagement, and build leadership infrastructure that wins lasting power.",
  },
];

const ALL_METRICS = [
  "Media placements", "Audience reach", "Social engagement", "Message recall",
  "Earned media value", "Grantee output volume", "New people at the table",
  "Sectors aligned", "Narrative adoption", "Leaders developed", "Policy moved", "Capital unlocked",
];

const ALL_SECTORS = [
  "News Media", "Music Industry", "Film & TV", "Digital Creators", "Sports & Recreation",
  "Podcasts & Streaming", "Advertising & Brands", "Tech Platforms", "Interest Groups",
];

const CAPABILITIES: Record<string, string> = {
  audit: "Portfolio Audit",
  framework: "Strategy Development",
  access: "Access & Introductions",
  measurement: "Impact Measurement",
  training: "Staff Training",
  program: "Program Management",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { contactId } = await req.json();
    if (!contactId) throw new Error("contactId required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch the contact
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: contact, error } = await supabase
      .from("deck_contacts")
      .select("*")
      .eq("id", contactId)
      .single();

    if (error || !contact) throw new Error("Contact not found");

    // Build the structured data for the AI
    const c = contact as any;

    // Section 1: Where You Are
    const engagementLabel = c.engagement_path === "fresh" ? "Starting fresh — new to strategic communications investment" : c.engagement_path === "experienced" ? "Already up to speed — has existing communications portfolio" : "Not specified";

    // Section 2: Quiz answers
    const quizAnswers = (c.quiz_answers || []) as Array<{ dimension: string; picked: string }>;
    const quizSummary = quizAnswers.map((qa) => {
      const dim = QUIZ_DIMENSIONS.find((d) => d.dimension === qa.dimension);
      if (!dim) return null;
      const isNextgen = qa.picked === "nextgen";
      return {
        dimension: qa.dimension,
        picked: isNextgen ? "Advanced" : "Conventional",
        theyChose: isNextgen ? dim.nextgen : dim.traditional,
        lede: isNextgen ? dim.nextgenLede : dim.traditionalLede,
        detail: isNextgen ? dim.nextgenDetail : dim.traditionalDetail,
      };
    }).filter(Boolean);

    const nextgenCount = quizAnswers.filter((a) => a.picked === "nextgen").length;

    // Section 3: Practices
    const practiceIndices = (c.practice_selections || []) as number[];
    const selectedPractices = practiceIndices.map((i: number) => PRACTICES[i]).filter(Boolean);

    // Section 4: Metrics
    const metricsChecked = (c.metrics_checked || []) as string[];
    const metricsNotChecked = ALL_METRICS.filter((m) => !metricsChecked.includes(m));

    // Section 5: Sectors
    const selectedSectors = (c.selected_domains || []) as string[];
    const notSelectedSectors = ALL_SECTORS.filter((s) => !selectedSectors.includes(s));

    // Section 6: Capabilities
    const capRanked = (c.capabilities_ranked || []) as string[];
    const capLabels = capRanked.map((id: string) => CAPABILITIES[id] || id);

    // Build the prompt
    const systemPrompt = `You are writing a personalized strategic communications diagnostic report for a senior philanthropic advisor. The tone is institutional, direct, and respectful — like a McKinsey engagement letter. No marketing fluff. No jargon. Short paragraphs, clear headings. Use the approved copy provided for quiz dimensions — do not invent new explanations. You may add 1-2 sentences of personalized connector notes that link one dimension's answer to another.

Output the report in clean markdown with these exact sections:
## Where You Are
## Your Strategic Read
## Practices
## Measurement Gaps
## Sectors of Interest
## Recommended Next Step

For "Your Strategic Read," present each of the 5 dimensions using the approved copy provided. Add a brief personalized observation connecting patterns across their answers.

For "Recommended Next Step," always end with: "Book a 30-minute call to walk through this together."`;

    const userPrompt = `Generate the diagnostic report for:

**Name:** ${c.first_name} ${c.last_name}
**Organization:** ${c.organization || "Not specified"}
**Score:** ${c.readiness_score ?? "N/A"} / 100

---

### Section 1: Where They Are
${engagementLabel}
${c.selected_pains && c.selected_pains.length > 0 ? `Challenges identified: ${c.selected_pains.map((p: string) => PAIN_POINTS[p] || p).join("; ")}` : "No specific challenges selected."}
${c.custom_challenge ? `Custom challenge: "${c.custom_challenge}"` : ""}

### Section 2: Quiz Answers (${nextgenCount} of 5 advanced)
${quizSummary.map((q: any) => `**${q.dimension}** — Picked: ${q.picked}
They chose: "${q.theyChose}"
Approved copy — Lede: ${q.lede}
Approved copy — Detail: ${q.detail}`).join("\n\n")}

### Section 3: Practices Selected
${selectedPractices.length > 0 ? selectedPractices.map((p: any) => `**${p.title}**
Rationale: ${p.rationale}
How we help: ${p.help}`).join("\n\n") : "None selected."}

### Section 4: Metrics
Currently measuring: ${metricsChecked.length > 0 ? metricsChecked.join(", ") : "None"}
Not yet measuring: ${metricsNotChecked.length > 0 ? metricsNotChecked.join(", ") : "All metrics tracked"}

### Section 5: Sectors
Selected: ${selectedSectors.length > 0 ? selectedSectors.join(", ") : "None"}
Not selected: ${notSelectedSectors.length > 0 ? notSelectedSectors.join(", ") : "All selected"}

### Section 6: Priority Capabilities
${capLabels.length > 0 ? capLabels.join(", ") : "None ranked"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const reportMarkdown = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ report: reportMarkdown }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-diagnostic error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
