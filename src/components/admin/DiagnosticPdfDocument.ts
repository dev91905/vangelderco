/**
 * DiagnosticPdfDocument — Vector-based PDF generator.
 *
 * Builds the diagnostic report directly with jsPDF drawing primitives.
 * No html2canvas, no DOM capture, no CSS variables, no rasterization.
 * Every element is positioned with exact mm coordinates on an A4 page.
 */

import { jsPDF } from "jspdf";
import type { DiagnosticData } from "./DiagnosticReport";

/* ── A4 layout constants (mm) ── */
const PW = 210, PH = 297, M = 20, CW = PW - 2 * M;

/* ── Color system ── */
// All colors pre-blended against cream background (#FAF9F7 = 250,249,247)
// so we never need alpha — jsPDF gets exact RGB values.
const BG: [number, number, number] = [250, 249, 247];

const blend = (fg: number[], a: number): [number, number, number] => [
  Math.round(a * fg[0] + (1 - a) * BG[0]),
  Math.round(a * fg[1] + (1 - a) * BG[1]),
  Math.round(a * fg[2] + (1 - a) * BG[2]),
];

const INK = [28, 25, 23];
const C = {
  cream: BG,
  ink88: blend(INK, 0.88), ink85: blend(INK, 0.85), ink80: blend(INK, 0.80),
  ink75: blend(INK, 0.75), ink70: blend(INK, 0.70), ink65: blend(INK, 0.65),
  ink60: blend(INK, 0.60), ink55: blend(INK, 0.55), ink50: blend(INK, 0.50),
  ink45: blend(INK, 0.45), ink40: blend(INK, 0.40), ink35: blend(INK, 0.35),
  ink30: blend(INK, 0.30), ink15: blend(INK, 0.15), ink12: blend(INK, 0.12),
  ink08: blend(INK, 0.08), ink06: blend(INK, 0.06), ink05: blend(INK, 0.05),
  ink04: blend(INK, 0.04), ink03: blend(INK, 0.03), ink02: blend(INK, 0.02),
  green: [34, 197, 94] as [number, number, number],
  greenDk: [22, 163, 74] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  orangeDk: [194, 65, 12] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  yellow: [234, 179, 8] as [number, number, number],
  greenBg: blend([34, 197, 94], 0.04),
  greenBorder: blend([34, 197, 94], 0.12),
  orangeBg: blend([249, 115, 22], 0.04),
  orangeBorder: blend([249, 115, 22], 0.12),
  orangeLight: blend([249, 115, 22], 0.3),
};

function scoreColor(s: number): [number, number, number] {
  if (s <= 25) return C.red;
  if (s <= 50) return C.orange;
  if (s <= 75) return C.yellow;
  return C.green;
}
function scoreLabel(s: number): string {
  if (s <= 25) return "Critical";
  if (s <= 50) return "Significant gaps";
  if (s <= 75) return "Moderate";
  return "Advanced";
}

/* ── Page helpers ── */
function fillPage(pdf: jsPDF) {
  pdf.setFillColor(...BG);
  pdf.rect(0, 0, PW, PH, "F");
}
function newPage(pdf: jsPDF): number {
  pdf.addPage();
  fillPage(pdf);
  return M;
}
function ensureSpace(pdf: jsPDF, y: number, need: number): number {
  if (y + need > PH - M) return newPage(pdf);
  return y;
}

/* ── Typography helpers ── */
function setLabel(pdf: jsPDF) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...C.ink35);
}
function drawSectionLabel(pdf: jsPDF, text: string, x: number, y: number) {
  setLabel(pdf);
  pdf.text(text.toUpperCase(), x, y);
}

/* ── Score ring via canvas (only raster element — small, high-res) ── */
function createRingImage(score: number, color: [number, number, number]): string {
  const canvas = document.createElement("canvas");
  const px = 480;
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d")!;
  const cx = px / 2, cy = px / 2, r = px / 2 - 30, lw = 30;

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(28,25,23,0.06)";
  ctx.lineWidth = lw;
  ctx.stroke();

  // Progress arc
  if (score > 0) {
    const start = -Math.PI / 2;
    const end = start + (score / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  return canvas.toDataURL("image/png");
}

/* ── Pills renderer ── */
function drawPills(pdf: jsPDF, pills: string[], startY: number, filled: boolean): number {
  const pillH = 6.5, padX = 4, gapX = 2.5, gapY = 2.5;
  let x = M, y = startY;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);

  for (const text of pills) {
    const tw = pdf.getTextWidth(text);
    const pillW = tw + padX * 2;

    if (x + pillW > M + CW && x > M) {
      x = M;
      y += pillH + gapY;
    }

    if (filled) {
      pdf.setFillColor(...C.ink04);
      pdf.setDrawColor(...C.ink06);
    } else {
      pdf.setFillColor(...C.cream);
      pdf.setDrawColor(...C.ink08);
    }
    pdf.setLineWidth(0.25);
    pdf.roundedRect(x, y, pillW, pillH, 3, 3, "FD");

    pdf.setTextColor(...C.ink55);
    pdf.text(text, x + padX, y + pillH * 0.67);

    x += pillW + gapX;
  }
  return y + pillH;
}

/* ── Gap card ── */
function drawGapCard(
  pdf: jsPDF,
  dim: { dimension: string; shift: string; recommendation: string },
  insight: string | undefined,
  startY: number,
): number {
  const px = 5, py = 4, tw = CW - px * 2;
  const lh = 3.8;

  // Pre-compute heights
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
  const shiftLines = pdf.splitTextToSize(dim.shift, tw);

  let insightLines: string[] = [];
  if (insight) {
    pdf.setFont("helvetica", "italic"); pdf.setFontSize(8.5);
    insightLines = pdf.splitTextToSize(insight, tw - 8);
  }

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5);
  const recLines = pdf.splitTextToSize(dim.recommendation, tw - 8);

  let cardH = py * 2 + 7; // header
  cardH += shiftLines.length * lh + 3;
  if (insightLines.length) cardH += insightLines.length * lh + 5;
  cardH += recLines.length * lh + 2;

  let y = ensureSpace(pdf, startY, cardH + 4);

  // Background
  pdf.setFillColor(...C.ink02);
  pdf.setDrawColor(...C.ink06);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(M, y, CW, cardH, 2.5, 2.5, "FD");

  let iy = y + py;

  // Dot + dimension name
  pdf.setFillColor(...C.orange);
  pdf.circle(M + px + 1.5, iy + 2.5, 1, "F");
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5);
  pdf.setTextColor(...C.ink80);
  pdf.text(dim.dimension, M + px + 5, iy + 3.5);
  iy += 7;

  // Shift
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
  pdf.setTextColor(...C.ink50);
  pdf.text(shiftLines, M + px, iy + 3);
  iy += shiftLines.length * lh + 3;

  // Insight
  if (insightLines.length) {
    pdf.setDrawColor(...C.orangeLight);
    pdf.setLineWidth(0.6);
    pdf.line(M + px + 3, iy, M + px + 3, iy + insightLines.length * lh + 2);

    pdf.setFont("helvetica", "italic"); pdf.setFontSize(8.5);
    pdf.setTextColor(...C.ink65);
    pdf.text(insightLines, M + px + 6, iy + 3);
    iy += insightLines.length * lh + 5;
  }

  // Recommendation
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
  pdf.setTextColor(...C.orangeDk);
  pdf.text("\u2192", M + px, iy + 3);

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5);
  pdf.setTextColor(...C.ink70);
  pdf.text(recLines, M + px + 6, iy + 3);

  return y + cardH + 4;
}

/* ── Measurement columns ── */
function drawMetricColumns(
  pdf: jsPDF, tracked: string[], missing: string[], startY: number,
): number {
  const colW = (CW - 5) / 2;
  const px = 4, py = 4, rowH = 5;

  // Compute row heights for each column (some text may wrap)
  const computeRows = (items: string[]) => {
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5);
    return items.map(m => {
      const lines = pdf.splitTextToSize(m, colW - px * 2 - 6);
      return { text: m, lines, h: lines.length * (rowH - 0.5) };
    });
  };
  const leftRows = computeRows(tracked);
  const rightRows = computeRows(missing);

  const leftContentH = leftRows.reduce((s, r) => s + r.h, 0);
  const rightContentH = rightRows.reduce((s, r) => s + r.h, 0);
  const headerH = 7;
  const colH = Math.max(leftContentH, rightContentH) + py * 2 + headerH;

  let y = ensureSpace(pdf, startY, colH + 4);

  // Left column
  pdf.setFillColor(...C.greenBg);
  pdf.setDrawColor(...C.greenBorder);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(M, y, colW, colH, 2.5, 2.5, "FD");

  let iy = y + py;
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(7);
  pdf.setTextColor(...C.greenDk);
  pdf.text("CURRENTLY TRACKING", M + px, iy + 3);
  iy += headerH;

  pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5);
  pdf.setTextColor(...C.ink50);
  for (const row of leftRows) {
    pdf.setFillColor(...C.green);
    pdf.circle(M + px + 1.5, iy + 1.8, 1, "F");
    pdf.setTextColor(...C.ink50);
    pdf.text(row.lines, M + px + 5, iy + 2.8);
    iy += row.h;
  }

  // Right column
  const rx = M + colW + 5;
  pdf.setFillColor(...C.orangeBg);
  pdf.setDrawColor(...C.orangeBorder);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(rx, y, colW, colH, 2.5, 2.5, "FD");

  iy = y + py;
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(7);
  pdf.setTextColor(...C.orangeDk);
  pdf.text("NOT YET MEASURING", rx + px, iy + 3);
  iy += headerH;

  pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5);
  for (const row of rightRows) {
    pdf.setFillColor(...C.orange);
    pdf.circle(rx + px + 1.5, iy + 1.8, 1, "F");
    pdf.setTextColor(...C.ink50);
    pdf.text(row.lines, rx + px + 5, iy + 2.8);
    iy += row.h;
  }

  return y + colH;
}

/* ── CTA block ── */
function drawCta(pdf: jsPDF, data: DiagnosticData, startY: number): number {
  const boxH = 32;
  const y = ensureSpace(pdf, startY, boxH);

  pdf.setFillColor(...C.ink03);
  pdf.setDrawColor(...C.ink06);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(M, y, CW, boxH, 3, 3, "FD");

  const cx = M + CW / 2;

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(11);
  pdf.setTextColor(...C.ink75);
  pdf.text("Ready to close the gaps?", cx, y + 9, { align: "center" });

  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5);
  pdf.setTextColor(...C.ink45);
  const subLines = pdf.splitTextToSize(
    "Let\u2019s discuss how to move your portfolio from where it is to where it needs to be.",
    CW - 20,
  );
  pdf.text(subLines, cx, y + 14, { align: "center" });

  // Buttons
  const btnH = 7, btnPad = 6;
  const btnY = y + 22;

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5);

  if (data.bookingLink) {
    const bookText = "Book a call";
    const bookW = pdf.getTextWidth(bookText) + btnPad * 2;
    const touchText = "Get in touch";
    const touchW = pdf.getTextWidth(touchText) + btnPad * 2;
    const totalW = bookW + 4 + touchW;
    const startX = cx - totalW / 2;

    // "Book a call" — filled
    pdf.setFillColor(...C.ink88);
    pdf.roundedRect(startX, btnY, bookW, btnH, 3, 3, "F");
    pdf.setTextColor(...C.cream);
    pdf.text(bookText, startX + bookW / 2, btnY + btnH * 0.65, { align: "center" });
    pdf.link(startX, btnY, bookW, btnH, { url: data.bookingLink });

    // "Get in touch" — outline
    const touchX = startX + bookW + 4;
    pdf.setFillColor(...C.cream);
    pdf.setDrawColor(...C.ink12);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(touchX, btnY, touchW, btnH, 3, 3, "FD");
    pdf.setTextColor(...C.ink50);
    pdf.text(touchText, touchX + touchW / 2, btnY + btnH * 0.65, { align: "center" });
    pdf.link(touchX, btnY, touchW, btnH, { url: `mailto:${data.contactEmail}` });
  } else {
    const touchText = "Get in touch";
    const touchW = pdf.getTextWidth(touchText) + btnPad * 2;
    const touchX = cx - touchW / 2;
    pdf.setFillColor(...C.ink88);
    pdf.roundedRect(touchX, btnY, touchW, btnH, 3, 3, "F");
    pdf.setTextColor(...C.cream);
    pdf.text(touchText, cx, btnY + btnH * 0.65, { align: "center" });
    pdf.link(touchX, btnY, touchW, btnH, { url: `mailto:${data.contactEmail}` });
  }

  return y + boxH;
}

/* ══════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════ */
export function generateDiagnosticPdf(data: DiagnosticData): jsPDF {
  const pdf = new jsPDF("p", "mm", "a4");
  fillPage(pdf);

  let y = M;

  /* ── PAGE 1: STRATEGIC POSITION ── */

  // Header
  drawSectionLabel(pdf, "Strategic Diagnostic", M, y + 3);
  y += 8;

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(18);
  pdf.setTextColor(...C.ink88);
  pdf.text(`${data.contact.firstName} ${data.contact.lastName}`, M, y + 5);
  let ty = y + 5;

  if (data.contact.organization) {
    ty += 6;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(11);
    pdf.setTextColor(...C.ink45);
    pdf.text(data.contact.organization, M, ty);
  }
  ty += 5;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
  pdf.setTextColor(...C.ink30);
  pdf.text(data.contact.date, M, ty);

  // Score ring (right-aligned)
  const ringSize = 30;
  const ringX = M + CW - ringSize;
  const ringY = y - 5;
  const sColor = scoreColor(data.readinessScore);
  const ringImg = createRingImage(data.readinessScore, sColor);
  pdf.addImage(ringImg, "PNG", ringX, ringY, ringSize, ringSize);

  // Score text centered in ring
  const rcx = ringX + ringSize / 2;
  const rcy = ringY + ringSize / 2;
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(20);
  pdf.setTextColor(...C.ink85);
  pdf.text(String(data.readinessScore), rcx, rcy - 1, { align: "center" });
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.5);
  pdf.setTextColor(sColor[0], sColor[1], sColor[2]);
  pdf.text(scoreLabel(data.readinessScore), rcx, rcy + 5, { align: "center" });

  y = Math.max(ty + 8, ringY + ringSize + 5);

  // Executive Summary
  if (data.executiveSummary) {
    y = ensureSpace(pdf, y, 30);
    const bpx = 6, bpy = 5;
    const maxTw = CW - bpx * 2;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5);
    const lines = pdf.splitTextToSize(data.executiveSummary, maxTw);
    const lineH = 4.2;
    const textH = lines.length * lineH;
    const boxH = textH + bpy * 2 + 8;

    pdf.setFillColor(...C.ink03);
    pdf.setDrawColor(...C.ink06);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(M, y, CW, boxH, 3, 3, "FD");

    let iy = y + bpy;
    drawSectionLabel(pdf, "Strategic Analysis", M + bpx, iy + 3);
    iy += 8;

    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5);
    pdf.setTextColor(...C.ink65);
    pdf.text(lines, M + bpx, iy + 3);

    y += boxH + 8;
  }

  // Dimension Bars
  const dims = data.dimensionResults || [];
  if (dims.length > 0) {
    y = ensureSpace(pdf, y, 12 + dims.length * 8);
    drawSectionLabel(pdf, "5-Dimension Assessment", M, y + 3);

    pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.5);
    pdf.setTextColor(...C.ink30);
    pdf.text("\u2190 Conventional", M + CW - 58, y + 3);
    pdf.text("Advanced \u2192", M + CW, y + 3, { align: "right" });
    y += 8;

    const labelW = 28, statusW = 22, barGap = 3;
    const barX = M + labelW + barGap;
    const barW = CW - labelW - statusW - barGap * 2;
    const barH = 2, rowH = 8;

    for (const d of dims) {
      const isAdv = d.picked === "advanced";
      const midY = y + rowH / 2;

      pdf.setFont("helvetica", "bold"); pdf.setFontSize(7.5);
      pdf.setTextColor(...C.ink60);
      pdf.text(d.dimension, M + labelW, midY + 1, { align: "right" });

      pdf.setFillColor(...C.ink05);
      pdf.roundedRect(barX, midY - barH / 2, barW, barH, 1, 1, "F");

      pdf.setFillColor(...(isAdv ? C.green : C.orange));
      if (isAdv) {
        pdf.roundedRect(barX + barW / 2, midY - barH / 2, barW / 2, barH, 1, 1, "F");
      } else {
        pdf.roundedRect(barX, midY - barH / 2, barW / 2, barH, 1, 1, "F");
      }

      pdf.setDrawColor(...C.ink15);
      pdf.setLineWidth(0.2);
      pdf.line(barX + barW / 2, midY - barH / 2 - 1.5, barX + barW / 2, midY + barH / 2 + 1.5);

      pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.5);
      pdf.setTextColor(...(isAdv ? C.greenDk : C.orangeDk));
      pdf.text(isAdv ? "Advanced" : "Conventional", M + CW, midY + 1, { align: "right" });

      y += rowH;
    }
    y += 6;
  }

  // Pain Points
  if (data.painPoints.length > 0) {
    y = ensureSpace(pdf, y, 20);
    drawSectionLabel(pdf, "Self-Identified Challenges", M, y + 3);
    y += 7;
    y = drawPills(pdf, data.painPoints, y, true);
    y += 6;
  }

  // Sectors
  if (data.sectors.length > 0) {
    y = ensureSpace(pdf, y, 15);
    drawSectionLabel(pdf, "Sectors of Interest", M, y + 3);
    y += 7;
    y = drawPills(pdf, data.sectors, y, false);
    y += 6;
  }

  /* ── PAGE 2: WHERE TO MOVE ── */
  const conventionalDims = dims.filter(d => d.picked === "conventional");

  if (conventionalDims.length > 0) {
    y = newPage(pdf);

    pdf.setDrawColor(...C.ink08);
    pdf.setLineWidth(0.3);
    pdf.line(M, y, M + CW, y);
    y += 8;

    pdf.setFont("helvetica", "bold"); pdf.setFontSize(14);
    pdf.setTextColor(...C.ink85);
    pdf.text("Where to Move", M, y + 4);
    y += 7;

    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
    pdf.setTextColor(...C.ink40);
    pdf.text(
      `Actionable recommendations for your ${conventionalDims.length} gap${conventionalDims.length !== 1 ? "s" : ""}`,
      M, y + 3,
    );
    y += 10;

    for (const d of conventionalDims) {
      y = drawGapCard(pdf, d, data.gapInsights[d.dimension], y);
    }
  }

  /* ── MEASUREMENT GAPS ── */
  if (data.metricsTracked.length > 0 || data.metricsMissing.length > 0) {
    y = ensureSpace(pdf, y, 50);
    drawSectionLabel(pdf, "Measurement Gaps", M, y + 3);
    y += 8;
    y = drawMetricColumns(pdf, data.metricsTracked, data.metricsMissing, y);
    y += 8;
  }

  /* ── PRIORITY PRACTICES ── */
  if (data.selectedPractices.length > 0) {
    y = ensureSpace(pdf, y, 20);
    drawSectionLabel(pdf, "Priority Practices", M, y + 3);
    y += 7;
    y = drawPills(pdf, data.selectedPractices, y, true);
    y += 8;
  }

  /* ── CTA ── */
  y = ensureSpace(pdf, y, 35);
  drawCta(pdf, data, y);

  return pdf;
}
