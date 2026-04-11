import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/*
 * Minimal PDF builder — generates a professional-quality PDF from the diagnostic report.
 * Uses raw PDF generation with Helvetica (built-in) for maximum compatibility.
 */

// PDF string escaping
function pdfEsc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

// Strip markdown formatting for plain text rendering
function stripMd(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^- /gm, "• ")
    .trim();
}

interface TextBlock {
  text: string;
  fontSize: number;
  fontKey: string; // F1=Helvetica, F2=Helvetica-Bold, F3=Helvetica-Oblique
  leading: number;
  spaceBefore: number;
  indent: number;
  color?: [number, number, number]; // RGB 0-1
}

function parseReportToBlocks(report: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  const lines = report.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // H1 — report title
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      blocks.push({ text: line.slice(2), fontSize: 20, fontKey: "F2", leading: 26, spaceBefore: 0, indent: 0 });
      continue;
    }

    // H2 — section headers
    if (line.startsWith("## ")) {
      blocks.push({ text: line.slice(3), fontSize: 14, fontKey: "F2", leading: 20, spaceBefore: 28, indent: 0, color: [0.15, 0.13, 0.12] });
      // Add a thin rule after H2
      blocks.push({ text: "___RULE___", fontSize: 0, fontKey: "F1", leading: 8, spaceBefore: 4, indent: 0 });
      continue;
    }

    // H3 — subsection headers
    if (line.startsWith("### ")) {
      blocks.push({ text: line.slice(4), fontSize: 11.5, fontKey: "F2", leading: 16, spaceBefore: 18, indent: 0 });
      continue;
    }

    // Bullet points
    if (line.startsWith("- ")) {
      const content = line.slice(2);
      // Check for bold prefix like **label:** text
      const boldMatch = content.match(/^\*\*(.+?)\*\*\s*(.*)$/);
      if (boldMatch) {
        blocks.push({ text: `• ${boldMatch[1]} ${boldMatch[2]}`, fontSize: 9.5, fontKey: "F1", leading: 14, spaceBefore: 5, indent: 18 });
      } else {
        blocks.push({ text: `• ${stripMd(content)}`, fontSize: 9.5, fontKey: "F1", leading: 14, spaceBefore: 5, indent: 18, color: [0.3, 0.28, 0.26] });
      }
      continue;
    }

    // Italic line (picked option)
    if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      blocks.push({ text: line.slice(1, -1), fontSize: 10, fontKey: "F3", leading: 15, spaceBefore: 6, indent: 12, color: [0.35, 0.33, 0.3] });
      continue;
    }

    // Bold line
    if (line.startsWith("**") && line.endsWith("**")) {
      const inner = line.slice(2, -2);
      blocks.push({ text: inner, fontSize: 10, fontKey: "F2", leading: 15, spaceBefore: 6, indent: 0 });
      continue;
    }

    // Bold prefix line like **label:** text
    const boldPrefixMatch = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
    if (boldPrefixMatch) {
      blocks.push({ text: `${boldPrefixMatch[1]} ${boldPrefixMatch[2]}`, fontSize: 10, fontKey: "F1", leading: 15, spaceBefore: 8, indent: 0 });
      continue;
    }

    // Regular text
    blocks.push({ text: stripMd(line), fontSize: 10, fontKey: "F1", leading: 15, spaceBefore: 6, indent: 0, color: [0.3, 0.28, 0.26] });
  }

  return blocks;
}

// Approximate character width for Helvetica at font size 1
function charWidth(ch: string, fontKey: string): number {
  // Simplified — Helvetica average
  const bold = fontKey === "F2";
  const avg = bold ? 0.58 : 0.52;
  if (ch === " ") return 0.25;
  if (ch === "•") return 0.35;
  if ("mwMW".includes(ch)) return bold ? 0.78 : 0.72;
  if ("ijl|".includes(ch)) return bold ? 0.28 : 0.25;
  return avg;
}

function textWidth(text: string, fontSize: number, fontKey: string): number {
  let w = 0;
  for (const ch of text) w += charWidth(ch, fontKey) * fontSize;
  return w;
}

function wrapText(text: string, maxWidth: number, fontSize: number, fontKey: string): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (textWidth(test, fontSize, fontKey) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function buildPdf(report: string, contactName: string): Uint8Array {
  const PAGE_W = 612; // Letter
  const PAGE_H = 792;
  const MARGIN_L = 62;
  const MARGIN_R = 62;
  const MARGIN_T = 72;
  const MARGIN_B = 72;
  const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

  const blocks = parseReportToBlocks(report);

  // Layout pass — compute pages
  interface PageContent {
    streams: string[];
  }
  const pages: PageContent[] = [{ streams: [] }];
  let curY = PAGE_H - MARGIN_T;
  let pageIdx = 0;

  // Header on first page
  const headerText = "VAN GELDER & COMPANY";
  pages[0].streams.push(`BT /F2 8 Tf 0.45 0.42 0.4 rg ${MARGIN_L} ${PAGE_H - 40} Td (${pdfEsc(headerText)}) Tj ET`);
  // Thin rule under header
  pages[0].streams.push(`0.85 0.83 0.8 RG 0.5 w ${MARGIN_L} ${PAGE_H - 48} m ${PAGE_W - MARGIN_R} ${PAGE_H - 48} l S`);

  const addFooter = (page: PageContent, pageNum: number) => {
    const footerY = 36;
    page.streams.push(`BT /F1 7 Tf 0.6 0.58 0.55 rg ${MARGIN_L} ${footerY} Td (${pdfEsc(`Van Gelder & Company  ·  vangelderco.com  ·  Confidential`)}) Tj ET`);
    page.streams.push(`BT /F1 7 Tf 0.6 0.58 0.55 rg ${PAGE_W - MARGIN_R - 20} ${footerY} Td (${pdfEsc(`${pageNum}`)}) Tj ET`);
  };

  const newPage = () => {
    addFooter(pages[pageIdx], pageIdx + 1);
    pageIdx++;
    pages.push({ streams: [] });
    curY = PAGE_H - MARGIN_T;
  };

  for (const block of blocks) {
    if (block.text === "___RULE___") {
      // Horizontal rule
      if (curY < MARGIN_B + 20) newPage();
      curY -= block.spaceBefore;
      pages[pageIdx].streams.push(`0.88 0.86 0.83 RG 0.5 w ${MARGIN_L} ${curY} m ${PAGE_W - MARGIN_R} ${curY} l S`);
      curY -= block.leading;
      continue;
    }

    const wrappedLines = wrapText(block.text, CONTENT_W - block.indent, block.fontSize, block.fontKey);
    const totalHeight = block.spaceBefore + wrappedLines.length * block.leading;

    if (curY - totalHeight < MARGIN_B) newPage();

    curY -= block.spaceBefore;
    const [r, g, b] = block.color || [0.12, 0.11, 0.1];

    for (const wLine of wrappedLines) {
      curY -= block.leading;
      if (curY < MARGIN_B) {
        newPage();
        curY -= block.leading;
      }
      const x = MARGIN_L + block.indent;
      pages[pageIdx].streams.push(
        `BT /${block.fontKey} ${block.fontSize} Tf ${r} ${g} ${b} rg ${x} ${curY} Td (${pdfEsc(wLine)}) Tj ET`
      );
    }
  }

  // Add footer to last page
  addFooter(pages[pageIdx], pageIdx + 1);

  // ═══ Assemble PDF ═══
  const objects: string[] = [];
  let objNum = 0;
  const newObj = (content: string): number => {
    objNum++;
    objects.push(`${objNum} 0 obj\n${content}\nendobj`);
    return objNum;
  };

  // Catalog, Pages placeholder
  const catalogObj = newObj("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesObjNum = 2; // reserve
  objNum++; // skip 2 for pages

  // Fonts
  const f1 = newObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const f2 = newObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const f3 = newObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>");

  const fontDict = `<< /F1 ${f1} 0 R /F2 ${f2} 0 R /F3 ${f3} 0 R >>`;

  // Page objects
  const pageObjNums: number[] = [];
  for (const page of pages) {
    const stream = page.streams.join("\n");
    const streamBytes = new TextEncoder().encode(stream);
    const streamObj = newObj(`<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream`);
    const pageObj = newObj(
      `<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${streamObj} 0 R /Resources << /Font ${fontDict} >> >>`
    );
    pageObjNums.push(pageObj);
  }

  // Now write pages object at position 2
  const pagesContent = `<< /Type /Pages /Kids [${pageObjNums.map(n => `${n} 0 R`).join(" ")}] /Count ${pageObjNums.length} >>`;
  objects[1] = `${pagesObjNum} 0 obj\n${pagesContent}\nendobj`;

  // Build final PDF
  let pdf = "%PDF-1.4\n%âãÏÓ\n";
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objNum + 1}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 0; i < objNum; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objNum + 1} /Root ${catalogObj} 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { contact, report } = await req.json();
    if (!report) throw new Error("report required");

    const name = `${contact?.first_name || ""} ${contact?.last_name || ""}`.trim() || "Unknown";
    const pdfBytes = buildPdf(report, name);

    // Return as base64
    const base64 = btoa(String.fromCharCode(...pdfBytes));

    return new Response(JSON.stringify({ pdf: base64 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("export-diagnostic-pdf error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
