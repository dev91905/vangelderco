import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function pdfEsc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function charWidth(ch: string, bold: boolean): number {
  const avg = bold ? 0.58 : 0.52;
  if (ch === " ") return 0.25;
  if (ch === "•") return 0.35;
  if ("mwMW".includes(ch)) return bold ? 0.78 : 0.72;
  if ("ijl|".includes(ch)) return bold ? 0.28 : 0.25;
  return avg;
}

function textWidth(text: string, fontSize: number, bold: boolean): number {
  let w = 0;
  for (const ch of text) w += charWidth(ch, bold) * fontSize;
  return w;
}

function wrapText(text: string, maxWidth: number, fontSize: number, bold: boolean): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (textWidth(test, fontSize, bold) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

const PAGE_W = 612;
const PAGE_H = 792;
const ML = 56;
const MR = 56;
const MT = 64;
const MB = 64;
const CW = PAGE_W - ML - MR;

// Colors
const INK = "0.15 0.13 0.1";
const INK_MED = "0.35 0.33 0.3";
const INK_LIGHT = "0.55 0.52 0.5";
const ORANGE = "0.85 0.37 0.2";
const GREEN = "0.27 0.55 0.35";

interface PdfBuilder {
  pages: string[][];
  curY: number;
  pageIdx: number;
}

function newPage(b: PdfBuilder) {
  addFooter(b);
  b.pageIdx++;
  b.pages.push([]);
  b.curY = PAGE_H - MT;
}

function addFooter(b: PdfBuilder) {
  const footerY = 32;
  const page = b.pages[b.pageIdx];
  page.push(`BT /F1 7 Tf 0.5 0.48 0.45 rg ${ML} ${footerY} Td (${pdfEsc("Van Gelder & Company  ·  vangelderco.com  ·  Confidential")}) Tj ET`);
  page.push(`BT /F1 7 Tf 0.5 0.48 0.45 rg ${PAGE_W - MR - 12} ${footerY} Td (${pdfEsc(`${b.pageIdx + 1}`)}) Tj ET`);
}

function ensureSpace(b: PdfBuilder, needed: number) {
  if (b.curY - needed < MB) newPage(b);
}

function drawText(b: PdfBuilder, text: string, x: number, fontSize: number, font: string, color: string, maxWidth?: number) {
  const bold = font === "F2";
  const lines = maxWidth ? wrapText(text, maxWidth, fontSize, bold) : [text];
  const leading = fontSize * 1.5;
  for (const line of lines) {
    ensureSpace(b, leading);
    b.pages[b.pageIdx].push(`BT /${font} ${fontSize} Tf ${color} rg ${x} ${b.curY} Td (${pdfEsc(line)}) Tj ET`);
    b.curY -= leading;
  }
}

function drawRule(b: PdfBuilder, color = "0.88 0.86 0.83") {
  b.pages[b.pageIdx].push(`${color} RG 0.5 w ${ML} ${b.curY} m ${PAGE_W - MR} ${b.curY} l S`);
  b.curY -= 8;
}

function drawBar(b: PdfBuilder, label: string, isAdvanced: boolean) {
  ensureSpace(b, 22);
  const y = b.curY;
  const barX = ML + 80;
  const barW = CW - 150;
  const barH = 5;
  const barY = y + 2;

  // Label
  b.pages[b.pageIdx].push(`BT /F2 9 Tf ${INK_MED} rg ${ML} ${y} Td (${pdfEsc(label)}) Tj ET`);

  // Background bar
  b.pages[b.pageIdx].push(`0.93 0.91 0.89 rg ${barX} ${barY} ${barW} ${barH} re f`);

  // Filled portion
  const fillColor = isAdvanced ? GREEN : ORANGE;
  const fillX = isAdvanced ? barX + barW / 2 : barX;
  b.pages[b.pageIdx].push(`${fillColor} rg ${fillX} ${barY} ${barW / 2} ${barH} re f`);

  // Center tick
  b.pages[b.pageIdx].push(`0.78 0.76 0.73 RG 0.5 w ${barX + barW / 2} ${barY - 2} m ${barX + barW / 2} ${barY + barH + 2} l S`);

  // Status label
  const statusX = barX + barW + 8;
  const statusColor = isAdvanced ? GREEN : ORANGE;
  const statusText = isAdvanced ? "Advanced" : "Conventional";
  b.pages[b.pageIdx].push(`BT /F2 7.5 Tf ${statusColor} rg ${statusX} ${y} Td (${pdfEsc(statusText)}) Tj ET`);

  b.curY -= 20;
}

function drawScoreCircle(b: PdfBuilder, score: number, cx: number, cy: number) {
  // Just render the score as a large number with label — true circles are complex in raw PDF
  b.pages[b.pageIdx].push(`BT /F2 28 Tf ${INK} rg ${cx - 15} ${cy - 5} Td (${pdfEsc(`${score}`)}) Tj ET`);
  const label = score <= 25 ? "Critical" : score <= 50 ? "Significant gaps" : score <= 75 ? "Moderate" : "Advanced";
  const labelColor = score <= 25 ? "0.8 0.2 0.2" : score <= 50 ? ORANGE : score <= 75 ? "0.7 0.6 0.1" : GREEN;
  b.pages[b.pageIdx].push(`BT /F2 7.5 Tf ${labelColor} rg ${cx - 22} ${cy - 20} Td (${pdfEsc(label)}) Tj ET`);
}

function buildPdf(data: any): Uint8Array {
  const b: PdfBuilder = { pages: [[]], curY: PAGE_H - MT, pageIdx: 0 };

  // ═══ PAGE 1: STRATEGIC POSITION ═══

  // Header
  b.pages[0].push(`BT /F2 7.5 Tf ${INK_LIGHT} rg ${ML} ${PAGE_H - 36} Td (${pdfEsc("VAN GELDER & COMPANY")}) Tj ET`);
  b.pages[0].push(`0.88 0.86 0.83 RG 0.5 w ${ML} ${PAGE_H - 44} m ${PAGE_W - MR} ${PAGE_H - 44} l S`);

  // Label
  drawText(b, "STRATEGIC DIAGNOSTIC", ML, 8, "F1", INK_LIGHT);
  b.curY -= 4;

  // Name + score
  const nameY = b.curY;
  drawText(b, `${data.contact.firstName} ${data.contact.lastName}`, ML, 20, "F2", INK);
  if (data.contact.organization) {
    drawText(b, data.contact.organization, ML, 11, "F1", INK_MED);
  }
  drawText(b, data.contact.date, ML, 9, "F1", INK_LIGHT);

  // Score in top right
  drawScoreCircle(b, data.readinessScore, PAGE_W - MR - 30, nameY);

  b.curY -= 12;

  // Executive Summary box
  if (data.executiveSummary) {
    drawRule(b, "0.9 0.88 0.86");
    b.curY -= 4;
    drawText(b, "STRATEGIC ANALYSIS", ML, 8, "F2", INK_LIGHT);
    b.curY -= 2;
    drawText(b, data.executiveSummary, ML, 10, "F1", INK_MED, CW);
    b.curY -= 12;
  }

  // Dimension bars
  drawRule(b);
  drawText(b, "5-DIMENSION ASSESSMENT", ML, 8, "F2", INK_LIGHT);
  b.curY -= 6;

  // Axis labels
  const barX = ML + 80;
  const barW = CW - 150;
  b.pages[b.pageIdx].push(`BT /F1 6.5 Tf ${INK_LIGHT} rg ${barX} ${b.curY + 2} Td (${pdfEsc("\u2190 Conventional")}) Tj ET`);
  b.pages[b.pageIdx].push(`BT /F1 6.5 Tf ${INK_LIGHT} rg ${barX + barW - 50} ${b.curY + 2} Td (${pdfEsc("Advanced \u2192")}) Tj ET`);
  b.curY -= 10;

  for (const dim of data.dimensionResults) {
    drawBar(b, dim.dimension, dim.picked === "advanced");
  }
  b.curY -= 8;

  // Pain points
  if (data.painPoints && data.painPoints.length > 0) {
    drawRule(b);
    drawText(b, "SELF-IDENTIFIED CHALLENGES", ML, 8, "F2", INK_LIGHT);
    b.curY -= 2;
    for (const p of data.painPoints) {
      drawText(b, `•  ${p}`, ML + 4, 9.5, "F1", INK_MED, CW - 8);
    }
    b.curY -= 6;
  }

  // Sectors
  if (data.sectors && data.sectors.length > 0) {
    drawText(b, "SECTORS OF INTEREST", ML, 8, "F2", INK_LIGHT);
    b.curY -= 2;
    drawText(b, data.sectors.join("  ·  "), ML, 9.5, "F1", INK_MED, CW);
    b.curY -= 6;
  }

  // ═══ PAGE 2: WHERE TO MOVE ═══
  newPage(b);

  // Header
  b.pages[b.pageIdx].push(`BT /F2 7.5 Tf ${INK_LIGHT} rg ${ML} ${PAGE_H - 36} Td (${pdfEsc("VAN GELDER & COMPANY")}) Tj ET`);
  b.pages[b.pageIdx].push(`0.88 0.86 0.83 RG 0.5 w ${ML} ${PAGE_H - 44} m ${PAGE_W - MR} ${PAGE_H - 44} l S`);

  drawText(b, "Where to Move", ML, 18, "F2", INK);
  b.curY -= 2;

  const conventionalDims = (data.dimensionResults || []).filter((d: any) => d.picked === "conventional");
  drawText(b, `Actionable recommendations for your ${conventionalDims.length} gap${conventionalDims.length !== 1 ? "s" : ""}`, ML, 10, "F1", INK_LIGHT);
  b.curY -= 12;

  // Gap cards
  for (const dim of conventionalDims) {
    ensureSpace(b, 60);
    // Orange dot + dimension name
    b.pages[b.pageIdx].push(`${ORANGE} rg ${ML + 2} ${b.curY + 3} 3 3 re f`);
    drawText(b, dim.dimension, ML + 10, 12, "F2", INK);
    b.curY -= 2;
    drawText(b, dim.shift, ML + 10, 9.5, "F1", INK_MED, CW - 14);

    // AI insight
    const insight = data.gapInsights?.[dim.dimension];
    if (insight) {
      b.curY -= 2;
      b.pages[b.pageIdx].push(`${ORANGE} rg ${ML + 10} ${b.curY + 10} 1.5 -${9.5 * 1.5 * wrapText(insight, CW - 30, 9, false).length + 2} re f`);
      drawText(b, insight, ML + 18, 9, "F3", INK_MED, CW - 30);
    }

    b.curY -= 2;
    drawText(b, `→  ${dim.recommendation}`, ML + 10, 9.5, "F2", INK_MED, CW - 14);
    b.curY -= 10;
  }

  // Measurement split
  if ((data.metricsTracked?.length || 0) + (data.metricsMissing?.length || 0) > 0) {
    b.curY -= 4;
    drawRule(b);
    drawText(b, "MEASUREMENT GAPS", ML, 8, "F2", INK_LIGHT);
    b.curY -= 4;

    const halfW = CW / 2 - 10;

    // Tracked column
    const colStartY = b.curY;
    drawText(b, "CURRENTLY TRACKING", ML, 7.5, "F2", GREEN);
    b.curY -= 2;
    for (const m of (data.metricsTracked || [])) {
      drawText(b, `✓  ${m}`, ML, 9, "F1", INK_MED, halfW);
    }

    // Missing column
    const missingStartY = colStartY;
    b.curY = missingStartY;
    const rightCol = ML + halfW + 20;
    drawText(b, "NOT YET MEASURING", rightCol, 7.5, "F2", ORANGE);
    b.curY -= 2;
    for (const m of (data.metricsMissing || [])) {
      drawText(b, `✗  ${m}`, rightCol, 9, "F1", INK_MED, halfW);
    }
    b.curY -= 10;
  }

  // Practices
  if (data.selectedPractices?.length > 0) {
    drawRule(b);
    drawText(b, "PRIORITY PRACTICES", ML, 8, "F2", INK_LIGHT);
    b.curY -= 2;
    for (const p of data.selectedPractices) {
      drawText(b, `•  ${p}`, ML + 4, 9.5, "F1", INK_MED, CW - 8);
    }
    b.curY -= 10;
  }

  // CTA
  ensureSpace(b, 50);
  drawRule(b);
  b.curY -= 4;
  drawText(b, "Ready to close the gaps?", ML, 13, "F2", INK);
  b.curY -= 2;
  drawText(b, `Contact us at ${data.contactEmail}`, ML, 10, "F1", INK_MED);
  if (data.bookingLink) {
    drawText(b, `Book a call: ${data.bookingLink}`, ML, 10, "F1", INK_MED);
  }

  // Final footer
  addFooter(b);

  // ═══ ASSEMBLE PDF ═══
  const objects: string[] = [];
  let objNum = 0;
  const newObj = (content: string): number => {
    objNum++;
    objects.push(`${objNum} 0 obj\n${content}\nendobj`);
    return objNum;
  };

  const catalogObj = newObj("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesObjNum = 2;
  objNum++;

  const f1 = newObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const f2 = newObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const f3 = newObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>");

  const fontDict = `<< /F1 ${f1} 0 R /F2 ${f2} 0 R /F3 ${f3} 0 R >>`;

  const pageObjNums: number[] = [];
  for (const page of b.pages) {
    const stream = page.join("\n");
    const streamBytes = new TextEncoder().encode(stream);
    const streamObj = newObj(`<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream`);
    const pageObj = newObj(
      `<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${streamObj} 0 R /Resources << /Font ${fontDict} >> >>`
    );
    pageObjNums.push(pageObj);
  }

  const pagesContent = `<< /Type /Pages /Kids [${pageObjNums.map(n => `${n} 0 R`).join(" ")}] /Count ${pageObjNums.length} >>`;
  objects[1] = `${pagesObjNum} 0 obj\n${pagesContent}\nendobj`;

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
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
    const { reportData } = await req.json();
    if (!reportData) throw new Error("reportData required");

    const pdfBytes = buildPdf(reportData);
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
