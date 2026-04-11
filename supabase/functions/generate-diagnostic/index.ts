import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ─── Approved copy from the deck ─── */
const PAIN_POINTS: Record<string, string> = {
  history: "Just getting started — no portfolio yet, still figuring out where to begin and what to fund.",
  evaluate: "Funding comms with no strategy — money goes out the door, but nothing connects spending to outcomes.",
  access: "Limited channels — op-eds, paid ads, social on repeat with no real reach into media or culture.",
  measurement: "Not sure what to measure — campaigns are running, but can't tell what's actually working or why.",
  expertise: "No expertise in-house — nobody on staff has commercial media experience.",
};

const PRACTICES = [
  {
    title: "They activate every cultural lever.",
    rationale: "They don't just push content out — they work behind the scenes so platforms across different sectors are pulling the message in. Music, faith communities, creator ecosystems, campuses, legal networks. Not just strategic comms.",
    help: "We maintain a presence across the cultural ecosystem and recruit partners who carry your message before you launch.",
  },
  {
    title: "They coordinate across sectors.",
    rationale: "Nothing moves until multiple sectors are pushing on the same thing. The most effective programs leverage cultural engagement to bring policy, industry, labor, grassroots, and other sectors to the table around a shared focal point.",
    help: "We leverage media and cultural distribution to bring sectors to the table and align them around shared interests.",
  },
  {
    title: "They organize for growth.",
    rationale: "It's not about organizing people who already agree. To win, your communications have to bring new people in — people who weren't there before. Only by demonstrating real persuasion can you move the people in power.",
    help: "We run campaigns that bring in new audiences, deepen engagement, and build leadership infrastructure that wins lasting power.",
  },
];

const QUIZ_DIMENSIONS = [
  {
    dimension: "Strategy",
    traditional: "Start with your message. Use research to figure out how to deliver it.",
    nextgen: "Start with what's already moving. Put infrastructure and resources behind it.",
    traditionalLabel: "The shift",
    traditionalLede: "That work still matters — but on its own, it misses what's already moving.",
    traditionalBullets: [
      "Focus groups test messages you already believe in, with people sorted by demographics — not by the value systems that actually drive behavior.",
      "If something organic is happening that doesn't fit your framework, you miss it or dismiss it as noise.",
      "The most effective operators do all of this and find where energy is already forming — then put infrastructure behind it.",
    ],
    nextgenLabel: "Why this works",
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
    traditionalLabel: "The shift",
    traditionalLede: "Credibility content still has a role — but on its own, it talks at people rather than inviting them in.",
    traditionalBullets: [
      "The gap is participatory, investigative content — creator ecosystems and journalism running around the clock.",
      "Political identity and cultural narrative form in real time. You need to be inside those conversations, not reacting after the fact.",
      "You need the credibility of prestige formats and the reach of always-on participatory content. Most portfolios only fund the first half.",
    ],
    nextgenLabel: "Why this works",
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
    traditionalLabel: "The shift",
    traditionalLede: "Buying placements rents attention on someone else's platform, under someone else's rules.",
    traditionalBullets: [
      "The algorithm changes, your reach disappears. The platform shifts policy, your content gets deprioritized. You have no control.",
      "The most effective operators aren't buying ads on platforms — they're buying the platforms.",
      "When you own the infrastructure, you decide what gets seen — and that doesn't change when someone else rewrites their algorithm.",
    ],
    nextgenLabel: "Why this works",
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
    traditionalLabel: "The shift",
    traditionalLede: "Online amplification has value — but on its own, it stays exactly where the algorithm wants you.",
    traditionalBullets: [
      "Influencer partnerships stay online — scripted posts, retweets, celebrity endorsements. That's surface-level.",
      "The gap is offline. The most effective operators also fund faith communities, campuses, business associations, and legal networks — massive in-person infrastructure.",
      "You need online reach and offline organizing. Most portfolios only fund the first.",
    ],
    nextgenLabel: "Why this works",
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
    traditionalLabel: "The shift",
    traditionalLede: 'Most of those "views" are three-second scroll-bys that Meta counts as a view.',
    traditionalBullets: [
      "Your audience saw your content while their thumb was in motion, and then it was gone. Nobody's thinking about you after that pass.",
      "You build a report showing millions of impressions, but impressions don't measure power.",
      "The programs that move the needle measure something different: Who showed up? Who's new? What policy moved? What infrastructure exists now that didn't before?",
    ],
    nextgenLabel: "Why this works",
    nextgenLede: "Tracking power, not impressions, tells you whether you're actually building something.",
    nextgenBullets: [
      "Most programs can show you reach numbers. Very few can show you who they brought into the movement and what changed because of it.",
      'One report says "10 million impressions." The other says "4,000 new people, two bills advanced, three permanent coalitions."',
      "One is noise. The other is power.",
    ],
  },
];

function getQuizGradeSummary(nextgenCount: number, total: number): string {
  const ratio = nextgenCount / total;
  if (ratio >= 0.8) return "You're already thinking the way the most effective operators think. The question is whether your portfolio is executing at this level — or if there's a gap between instinct and implementation.";
  if (ratio >= 0.4) return "You've identified some of the shifts that separate effective programs from the rest. The dimensions below show exactly where conventional thinking may be leaving you exposed.";
  return "The approaches you chose are industry standard — necessary, but no longer sufficient. The operators who are winning do everything you're doing and more. The breakdown shows where.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { contactId } = await req.json();
    if (!contactId) throw new Error("contactId required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Fetch contact
    const { data: contact, error: cErr } = await sb
      .from("deck_contacts")
      .select("*")
      .eq("id", contactId)
      .single();
    if (cErr || !contact) throw new Error("Contact not found");

    // Fetch site settings for email & booking link
    const { data: settings } = await sb.from("site_settings").select("*");
    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => { settingsMap[s.key] = s.value; });
    const contactEmail = settingsMap.contact_email || "info@vangelderco.com";
    const bookingLink = settingsMap.booking_link || "";

    const quizAnswers = (contact.quiz_answers || []) as Array<{ dimension: string; picked: string }>;
    const nextgenCount = quizAnswers.filter(a => a.picked === "nextgen").length;
    const dateStr = new Date(contact.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // ═══ BUILD THE REPORT DETERMINISTICALLY ═══
    let report = "";

    // Header
    report += `# Diagnostic Report — ${contact.first_name} ${contact.last_name}\n`;
    if (contact.organization) report += `**${contact.organization}**\n`;
    report += `${dateStr}\n\n`;

    // Section 1: Where You Are
    report += `## 1. Where You Are\n\n`;
    const pains = (contact.selected_pains || []) as string[];
    if (pains.length > 0) {
      pains.forEach((p: string) => {
        const desc = PAIN_POINTS[p];
        if (desc) report += `- ${desc}\n`;
        else report += `- ${p}\n`;
      });
      report += "\n";
    }
    if (contact.custom_challenge) {
      report += `Additional context: *"${contact.custom_challenge}"*\n\n`;
    }

    // Section 2: Your Strategic Read
    report += `## 2. Your Strategic Read\n\n`;
    report += `**${nextgenCount} of ${quizAnswers.length} advanced approaches identified.**\n\n`;
    report += `${getQuizGradeSummary(nextgenCount, quizAnswers.length)}\n\n`;

    // Each dimension
    for (const dim of QUIZ_DIMENSIONS) {
      const answer = quizAnswers.find(a => a.dimension === dim.dimension);
      if (!answer) continue;
      const isAdvanced = answer.picked === "nextgen";
      const pickedCopy = isAdvanced ? dim.nextgen : dim.traditional;
      const explanationLabel = isAdvanced ? dim.nextgenLabel : dim.traditionalLabel;
      const lede = isAdvanced ? dim.nextgenLede : dim.traditionalLede;
      const bullets = isAdvanced ? dim.nextgenBullets : dim.traditionalBullets;

      report += `### ${dim.dimension}\n\n`;
      report += `*${pickedCopy}*\n\n`;
      report += `**${explanationLabel}:** ${lede}\n\n`;
      bullets.forEach(b => { report += `- ${b}\n`; });
      report += "\n";
    }

    // AI-generated connective paragraph — the ONLY part the AI writes
    report += `### Cross-Dimensional Analysis\n\n`;
    const connectiveParagraph = await generateConnectiveParagraph(quizAnswers, QUIZ_DIMENSIONS);
    report += `${connectiveParagraph}\n\n`;

    // Section 3: Practices
    report += `## 3. What You Want to Work On\n\n`;
    const practiceIdxs = (contact.practice_selections || []) as number[];
    if (practiceIdxs.length > 0) {
      practiceIdxs.forEach((idx: number) => {
        const p = PRACTICES[idx];
        if (!p) return;
        report += `### ${p.title}\n\n`;
        report += `${p.rationale}\n\n`;
        report += `**How we help:** ${p.help}\n\n`;
      });
    } else {
      report += `*No practices selected — we'll discuss priorities on the call.*\n\n`;
    }

    // Section 4: Measurement Gaps
    report += `## 4. What You're Measuring — and What You're Not\n\n`;
    const unchecked = (contact.metrics_unchecked || []) as string[];
    const checked = (contact.metrics_checked || []) as string[];
    if (unchecked.length > 0) {
      report += `**Not yet measuring** — These are metrics the most effective programs track that your portfolio isn't measuring yet.\n\n`;
      unchecked.forEach((m: string) => { report += `- ${m}\n`; });
      report += "\n";
    }
    if (checked.length > 0) {
      report += `**Currently measuring:**\n\n`;
      checked.forEach((m: string) => { report += `- ${m}\n`; });
      report += "\n";
    }

    // Section 5: Sectors of Interest
    report += `## 5. Sectors of Interest\n\n`;
    const sectors = (contact.selected_domains || []) as string[];
    if (sectors.length > 0) {
      sectors.forEach((s: string) => { report += `- ${s}\n`; });
      report += "\n";
    } else {
      report += `*No sectors selected — we'll explore this on the call.*\n\n`;
    }

    // Section 6: Next Steps
    report += `## 6. Next Steps\n\n`;
    report += `- Email us at **${contactEmail}** to set up a time to talk.\n`;
    if (bookingLink) {
      report += `- Book a call directly: [Schedule a meeting](${bookingLink})\n`;
    }
    report += "\n";

    return new Response(JSON.stringify({ report }), {
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

async function generateConnectiveParagraph(
  quizAnswers: Array<{ dimension: string; picked: string }>,
  dimensions: typeof QUIZ_DIMENSIONS
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return "Unable to generate analysis — API key not configured.";

  const picks = quizAnswers.map(a => {
    const dim = dimensions.find(d => d.dimension === a.dimension);
    return `${a.dimension}: ${a.picked === "nextgen" ? "advanced" : "conventional"} — "${a.picked === "nextgen" ? dim?.nextgen : dim?.traditional}"`;
  }).join("\n");

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
            content: `You write diagnostic analysis for philanthropic executives. You are direct, concise, and grounded in the data. No flattery, no speculation. Write exactly ONE paragraph, 3-4 sentences max, connecting the patterns across their quiz answers. Note which dimensions are advanced vs conventional and what gap that creates. Use specific dimension names. Do NOT use markdown formatting — just plain text.`,
          },
          {
            role: "user",
            content: `Here are the quiz answers for a philanthropic executive:\n\n${picks}\n\nWrite a single short paragraph connecting the patterns across these answers.`,
          },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI gateway error:", resp.status, errText);
      return "Cross-dimensional analysis could not be generated at this time.";
    }

    const data = await resp.json();
    return data.choices?.[0]?.message?.content?.trim() || "Cross-dimensional analysis could not be generated.";
  } catch (err) {
    console.error("AI call failed:", err);
    return "Cross-dimensional analysis could not be generated at this time.";
  }
}
