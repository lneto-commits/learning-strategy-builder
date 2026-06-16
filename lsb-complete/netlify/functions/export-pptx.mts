import PptxGenJS from 'pptxgenjs';

interface PathwayRecommendation {
  title: string;
  description?: string;
  skills?: string[];
  duration?: string;
  format?: string;
  priority?: string;
  source?: string;
  provider?: string;
  targetAudience?: string;
  businessObjective?: string;
  expectedImpact?: string;
}

interface StrategyResponse {
  insights?: string[];
  kpis?: { label: string; value: string; change?: string }[];
  recommendations?: { gap: string; action: string; impact: string; kpi: string; timeline: string }[];
  pathways?: PathwayRecommendation[];
  openLibraryPathways?: PathwayRecommendation[];
  catalogPathways?: PathwayRecommendation[];
  roadmap?: { immediate: string[]; business: string[]; scalable: string[] };
  topSkills?: { skill: string; function: string; currentLevel: string; targetLevel: string; gap: string }[];
  strategicFocusAreas?: { title: string; description: string; outcomes: string[] }[];
  recommendedPriorities?: { rank: number; action: string; rationale: string; timeline: string; impact: string; priority: string }[];
}

const NAVY = '1a1f36';
const GREEN = '26c485';
const LIGHT_GRAY = 'f8fafb';
const WHITE = 'FFFFFF';
const DARK_TEXT = '111827';
const MID_TEXT = '6b7280';

function priorityColor(p?: string): string {
  switch (p) {
    case 'Critical': return 'dc2626';
    case 'High': return '059669';
    case 'Medium': return '2563eb';
    default: return '6b7280';
  }
}

export default async (req: Request) => {
  try {
    const { data, clientName } = await req.json() as { data: StrategyResponse; clientName: string };

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'Degreed Learning Strategy Builder';
    pptx.company = 'Degreed';
    pptx.subject = `Learning Strategy: ${clientName}`;

    // ── Slide 1: Title ───────────────────────────────────────────────────
    {
      const slide = pptx.addSlide();
      slide.background = { color: NAVY };
      slide.addText('LEARNING STRATEGY', { x: 0.5, y: 1.2, w: 12, h: 0.4, fontSize: 11, bold: true, color: GREEN, charSpacing: 3 });
      slide.addText(clientName, { x: 0.5, y: 1.8, w: 12, h: 1.2, fontSize: 40, bold: true, color: WHITE });
      slide.addText('Degreed Business Impact Framework · Forward Deployed Solutions', {
        x: 0.5, y: 3.2, w: 12, h: 0.4, fontSize: 13, color: 'FFFFFF80',
      });
      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.0, w: 1.2, h: 0.06, fill: { color: GREEN }, line: { color: GREEN } });
    }

    // ── Slide 2: Key Insights ────────────────────────────────────────────
    if (data.insights && data.insights.length > 0) {
      const slide = pptx.addSlide();
      slide.background = { color: LIGHT_GRAY };
      slide.addText('Key Insights', { x: 0.5, y: 0.4, w: 12, h: 0.5, fontSize: 22, bold: true, color: NAVY });
      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.95, w: 0.8, h: 0.04, fill: { color: GREEN }, line: { color: GREEN } });

      data.insights.slice(0, 6).forEach((insight, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5 + col * 6.2, y: 1.2 + row * 1.4, w: 5.8, h: 1.2,
          fill: { color: WHITE }, line: { color: 'e5e7eb', pt: 1 },
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5 + col * 6.2, y: 1.2 + row * 1.4, w: 0.06, h: 1.2,
          fill: { color: GREEN }, line: { color: GREEN },
        });
        slide.addText(insight, {
          x: 0.7 + col * 6.2, y: 1.25 + row * 1.4, w: 5.5, h: 1.1,
          fontSize: 11, color: DARK_TEXT, wrap: true, valign: 'middle',
        });
      });
    }

    // ── Slide 3: KPIs ────────────────────────────────────────────────────
    if (data.kpis && data.kpis.length > 0) {
      const slide = pptx.addSlide();
      slide.background = { color: LIGHT_GRAY };
      slide.addText('Key Performance Indicators', { x: 0.5, y: 0.4, w: 12, h: 0.5, fontSize: 22, bold: true, color: NAVY });
      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.95, w: 0.8, h: 0.04, fill: { color: GREEN }, line: { color: GREEN } });

      const kpis = data.kpis.slice(0, 4);
      const cardW = 12 / kpis.length - 0.2;
      kpis.forEach((kpi, i) => {
        const x = 0.5 + i * (cardW + 0.2);
        slide.addShape(pptx.ShapeType.rect, { x, y: 1.2, w: cardW, h: 2.2, fill: { color: NAVY }, line: { color: NAVY } });
        slide.addText(kpi.label.toUpperCase(), { x: x + 0.2, y: 1.35, w: cardW - 0.4, h: 0.4, fontSize: 9, bold: true, color: '9ca3af', charSpacing: 1 });
        slide.addText(kpi.value, { x: x + 0.2, y: 1.75, w: cardW - 0.4, h: 0.8, fontSize: 28, bold: true, color: WHITE });
        if (kpi.change) {
          slide.addText(kpi.change, { x: x + 0.2, y: 2.6, w: cardW - 0.4, h: 0.4, fontSize: 11, bold: true, color: GREEN });
        }
      });
    }

    // ── Slide 4: Recommendations ─────────────────────────────────────────
    if (data.recommendations && data.recommendations.length > 0) {
      const slide = pptx.addSlide();
      slide.background = { color: LIGHT_GRAY };
      slide.addText('Recommendations', { x: 0.5, y: 0.4, w: 12, h: 0.5, fontSize: 22, bold: true, color: NAVY });
      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.95, w: 0.8, h: 0.04, fill: { color: GREEN }, line: { color: GREEN } });

      data.recommendations.slice(0, 4).forEach((rec, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5 + col * 6.2, y: 1.2 + row * 2.0, w: 5.8, h: 1.8,
          fill: { color: WHITE }, line: { color: 'e5e7eb', pt: 1 },
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5 + col * 6.2, y: 1.2 + row * 2.0, w: 5.8, h: 0.3,
          fill: { color: 'fef2f2' }, line: { color: 'fef2f2' },
        });
        slide.addText('GAP DETECTED', {
          x: 0.6 + col * 6.2, y: 1.22 + row * 2.0, w: 5.6, h: 0.26,
          fontSize: 8, bold: true, color: 'dc2626', charSpacing: 1,
        });
        slide.addText(rec.gap, {
          x: 0.6 + col * 6.2, y: 1.52 + row * 2.0, w: 5.6, h: 0.4,
          fontSize: 10, bold: true, color: NAVY, wrap: true,
        });
        slide.addText(`Action: ${rec.action}`, {
          x: 0.6 + col * 6.2, y: 1.94 + row * 2.0, w: 5.6, h: 0.5,
          fontSize: 9, color: MID_TEXT, wrap: true,
        });
        slide.addText(`${rec.timeline} · ${rec.impact}`, {
          x: 0.6 + col * 6.2, y: 2.5 + row * 2.0, w: 5.6, h: 0.3,
          fontSize: 8, color: GREEN, bold: true,
        });
      });
    }

    // ── Slide 5: Roadmap ─────────────────────────────────────────────────
    if (data.roadmap) {
      const slide = pptx.addSlide();
      slide.background = { color: LIGHT_GRAY };
      slide.addText('Business Impact Roadmap', { x: 0.5, y: 0.4, w: 12, h: 0.5, fontSize: 22, bold: true, color: NAVY });
      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.95, w: 0.8, h: 0.04, fill: { color: GREEN }, line: { color: GREEN } });

      const phases = [
        { title: '0–3 Months', subtitle: 'Immediate Impact', items: data.roadmap.immediate || [], color: GREEN },
        { title: '3–9 Months', subtitle: 'Business Value',   items: data.roadmap.business  || [], color: NAVY },
        { title: '9–18 Months', subtitle: 'Scalable Growth', items: data.roadmap.scalable  || [], color: 'FED141' },
      ];

      phases.forEach((phase, i) => {
        const x = 0.5 + i * 4.2;
        slide.addShape(pptx.ShapeType.rect, { x, y: 1.2, w: 3.9, h: 0.7, fill: { color: phase.color }, line: { color: phase.color } });
        slide.addText(phase.title, { x: x + 0.1, y: 1.22, w: 3.7, h: 0.3, fontSize: 13, bold: true, color: phase.color === 'FED141' ? NAVY : WHITE });
        slide.addText(phase.subtitle.toUpperCase(), { x: x + 0.1, y: 1.52, w: 3.7, h: 0.25, fontSize: 8, bold: true, color: phase.color === 'FED141' ? '374151' : 'FFFFFF80', charSpacing: 1 });

        phase.items.slice(0, 4).forEach((item, j) => {
          slide.addShape(pptx.ShapeType.rect, {
            x, y: 2.0 + j * 0.65, w: 3.9, h: 0.55,
            fill: { color: WHITE }, line: { color: 'e5e7eb', pt: 1 },
          });
          slide.addText(`→ ${item}`, {
            x: x + 0.1, y: 2.05 + j * 0.65, w: 3.7, h: 0.45,
            fontSize: 9, color: MID_TEXT, wrap: true,
          });
        });
      });
    }

    // ── Slide 6: Pathways summary ────────────────────────────────────────
    const allPathways = [
      ...(data.pathways || []),
      ...(data.openLibraryPathways || []),
      ...(data.catalogPathways || []),
    ];
    if (allPathways.length > 0) {
      const slide = pptx.addSlide();
      slide.background = { color: LIGHT_GRAY };
      slide.addText('Recommended Pathways', { x: 0.5, y: 0.4, w: 12, h: 0.5, fontSize: 22, bold: true, color: NAVY });
      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.95, w: 0.8, h: 0.04, fill: { color: GREEN }, line: { color: GREEN } });

      allPathways.slice(0, 6).forEach((p, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = 0.5 + col * 4.1;
        const y = 1.2 + row * 2.1;
        slide.addShape(pptx.ShapeType.rect, { x, y, w: 3.8, h: 1.9, fill: { color: WHITE }, line: { color: 'e5e7eb', pt: 1 } });
        slide.addShape(pptx.ShapeType.rect, { x, y, w: 3.8, h: 0.04, fill: { color: priorityColor(p.priority) }, line: { color: priorityColor(p.priority) } });
        slide.addText(p.title, { x: x + 0.1, y: y + 0.1, w: 3.6, h: 0.5, fontSize: 10, bold: true, color: NAVY, wrap: true });
        slide.addText(p.description?.slice(0, 100) || '', { x: x + 0.1, y: y + 0.62, w: 3.6, h: 0.7, fontSize: 8, color: MID_TEXT, wrap: true });
        slide.addText(`${p.format || ''} · ${p.duration || ''}`, {
          x: x + 0.1, y: y + 1.55, w: 3.6, h: 0.25,
          fontSize: 8, color: GREEN, bold: true,
        });
      });
    }

    // ── Generate buffer ──────────────────────────────────────────────────
    const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${clientName.replace(/[^a-zA-Z0-9]/g, '-')}-learning-strategy.pptx"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('export-pptx error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
