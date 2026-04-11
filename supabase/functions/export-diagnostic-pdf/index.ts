import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Generates a clean, professional PDF from the diagnostic report markdown.
 * Returns base64-encoded PDF.
 * 
 * Uses the Lovable AI Gateway to convert markdown → structured HTML,
 * then jsPDF for rendering.
 * 
 * Approach: Generate a clean text-based PDF using Deno's built-in capabilities.
 */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reportMarkdown, contactName, organization, score } = await req.json();
    if (!reportMarkdown) throw new Error("reportMarkdown required");

    // Use the AI to convert markdown into a structured JSON representation for the PDF
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const structurePrompt = `Convert this diagnostic report markdown into a structured JSON array of blocks for PDF generation. Each block has a "type" and relevant fields.

Block types:
- { "type": "title", "text": "..." } — document title
- { "type": "subtitle", "text": "..." } — subtitle line
- { "type": "meta", "text": "..." } — metadata line (score, date)
- { "type": "divider" }
- { "type": "heading", "text": "..." } — section heading (## level)
- { "type": "subheading", "text": "..." } — subsection heading (### level)
- { "type": "paragraph", "text": "..." } — body text. Keep bold markers like **text**.
- { "type": "bullet", "text": "..." } — list item
- { "type": "spacer" } — extra vertical space

Output ONLY the JSON array, no wrapping text. The result should create a beautifully structured document.

Add these at the start:
- title: "Strategic Communications Diagnostic" 
- subtitle: "${contactName}${organization ? ` — ${organization}` : ""}"
- meta: "Readiness Score: ${score ?? "N/A"} / 100 · Prepared by Van Gelder & Company"
- divider

Then convert the rest of the markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You convert markdown to structured JSON for PDF generation. Output only valid JSON arrays." },
          { role: "user", content: structurePrompt + "\n\n---\n\n" + reportMarkdown },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI structure error:", response.status, errText);
      throw new Error("Failed to structure report");
    }

    const structResult = await response.json();
    let rawContent = structResult.choices?.[0]?.message?.content || "[]";
    
    // Parse the blocks - handle both array and object wrapper
    let blocks: any[];
    try {
      const parsed = JSON.parse(rawContent);
      blocks = Array.isArray(parsed) ? parsed : (parsed.blocks || parsed.content || []);
    } catch {
      // Try to extract JSON array from the response
      const match = rawContent.match(/\[[\s\S]*\]/);
      blocks = match ? JSON.parse(match[0]) : [];
    }

    // Now generate a simple SVG-based PDF using text rendering
    // We'll create a clean text PDF using a minimal approach
    
    // Build a simple PDF manually (PDF 1.4 spec)
    const pdf = buildPDF(blocks, contactName, organization, score);

    return new Response(JSON.stringify({ pdf }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("export-diagnostic-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/* ─── Minimal PDF Builder ─── */
function buildPDF(blocks: any[], _name: string, _org: string | null, _score: number | null): string {
  // Page dimensions: US Letter (612 x 792 points)
  const W = 612;
  const H = 792;
  const ML = 72; // left margin
  const MR = 72; // right margin
  const MT = 72; // top margin
  const MB = 72; // bottom margin
  const CW = W - ML - MR; // content width

  // Text styles
  const STYLES: Record<string, { font: string; size: number; color: string; leading: number }> = {
    title: { font: "Helvetica-Bold", size: 22, color: "0.1 0.1 0.1", leading: 28 },
    subtitle: { font: "Helvetica", size: 12, color: "0.35 0.35 0.35", leading: 18 },
    meta: { font: "Helvetica", size: 9, color: "0.5 0.5 0.5", leading: 14 },
    heading: { font: "Helvetica-Bold", size: 14, color: "0.15 0.15 0.15", leading: 20 },
    subheading: { font: "Helvetica-Bold", size: 11, color: "0.3 0.3 0.3", leading: 16 },
    paragraph: { font: "Helvetica", size: 10, color: "0.3 0.3 0.3", leading: 16 },
    bullet: { font: "Helvetica", size: 10, color: "0.35 0.35 0.35", leading: 15 },
  };

  // Track pages and content streams
  const pages: string[] = [];
  let currentStream = "";
  let y = H - MT;

  const startPage = () => {
    y = H - MT;
    currentStream = "";
  };

  const finishPage = () => {
    pages.push(currentStream);
  };

  const needSpace = (h: number) => {
    if (y - h < MB) {
      finishPage();
      startPage();
    }
  };

  // Escape PDF string
  const esc = (s: string): string => {
    return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  };

  // Strip markdown bold markers for PDF
  const stripBold = (s: string): string => s.replace(/\*\*/g, "");

  // Word wrap text
  const wrapText = (text: string, fontSize: number, maxWidth: number, font: string): string[] => {
    // Approximate character width (Helvetica average)
    const avgCharWidth = font.includes("Bold") ? fontSize * 0.58 : fontSize * 0.52;
    const charsPerLine = Math.floor(maxWidth / avgCharWidth);
    
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";

    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (test.length > charsPerLine && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  // Render a text block
  const renderText = (text: string, type: string, indent = 0) => {
    const style = STYLES[type] || STYLES.paragraph;
    const clean = stripBold(text);
    const lines = wrapText(clean, style.size, CW - indent, style.font);
    const totalHeight = lines.length * style.leading;
    
    needSpace(totalHeight);

    for (const line of lines) {
      currentStream += `BT\n/${style.font} ${style.size} Tf\n${style.color} rg\n${ML + indent} ${y} Td\n(${esc(line)}) Tj\nET\n`;
      y -= style.leading;
    }
  };

  // Start first page
  startPage();

  for (const block of blocks) {
    switch (block.type) {
      case "title":
        renderText(block.text || "", "title");
        y -= 4;
        break;
      case "subtitle":
        renderText(block.text || "", "subtitle");
        y -= 2;
        break;
      case "meta":
        renderText(block.text || "", "meta");
        y -= 8;
        break;
      case "divider":
        needSpace(16);
        currentStream += `${ML} ${y} m ${W - MR} ${y} l 0.85 0.85 0.85 RG 0.5 w S\n`;
        y -= 16;
        break;
      case "heading":
        y -= 12; // extra space before heading
        needSpace(28);
        renderText(block.text || "", "heading");
        // Thin rule under heading
        currentStream += `${ML} ${y + 4} m ${W - MR} ${y + 4} l 0.9 0.9 0.9 RG 0.3 w S\n`;
        y -= 8;
        break;
      case "subheading":
        y -= 6;
        renderText(block.text || "", "subheading");
        y -= 2;
        break;
      case "paragraph":
        renderText(block.text || "", "paragraph");
        y -= 4;
        break;
      case "bullet":
        needSpace(16);
        // Bullet dot
        currentStream += `BT\n/Helvetica 10 Tf\n0.4 0.4 0.4 rg\n${ML + 8} ${y} Td\n(\\267) Tj\nET\n`;
        renderText(block.text || "", "bullet", 20);
        y -= 2;
        break;
      case "spacer":
        y -= 12;
        break;
    }
  }

  // Footer on each page
  finishPage();

  // Build PDF structure
  const objects: string[] = [];
  let objCount = 0;
  const offsets: number[] = [];

  const addObj = (content: string): number => {
    objCount++;
    objects.push(content);
    return objCount;
  };

  // Object 1: Catalog
  addObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Object 2: Pages (placeholder — will fill in kids)
  const pagesObjIdx = addObj(""); // placeholder

  // Font objects
  const fontHelvetica = addObj(`${objCount + 1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  const fontHelveticaBold = addObj(`${objCount + 1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  // Fix font object content
  objects[fontHelvetica - 1] = `${fontHelvetica} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  objects[fontHelveticaBold - 1] = `${fontHelveticaBold} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;

  // Resources dict
  const resources = `<< /Font << /Helvetica ${fontHelvetica} 0 R /Helvetica-Bold ${fontHelveticaBold} 0 R >> >>`;

  // Create page objects
  const pageObjIds: number[] = [];
  for (const stream of pages) {
    const streamBytes = new TextEncoder().encode(stream);
    const streamObj = addObj(`${objCount + 1} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream\nendobj\n`);
    objects[streamObj - 1] = `${streamObj} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream\nendobj\n`;

    const pageObj = addObj("");
    objects[pageObj - 1] = `${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents ${streamObj} 0 R /Resources ${resources} >>\nendobj\n`;
    pageObjIds.push(pageObj);
  }

  // Fill in Pages object
  const kids = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  objects[pagesObjIdx - 1] = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`;

  // Build the PDF file
  let pdf = "%PDF-1.4\n";
  const calculatedOffsets: number[] = [];
  for (const obj of objects) {
    calculatedOffsets.push(pdf.length);
    pdf += obj;
  }

  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${objCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of calculatedOffsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${objCount + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";

  // Convert to base64
  const encoder = new TextEncoder();
  const bytes = encoder.encode(pdf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
