import * as XLSX from 'xlsx';

interface PathwayRecommendation {
  title: string;
  description?: string;
  reasoning?: string;
  skills?: string[];
  duration?: string;
  format?: string;
  priority?: string;
  source?: string;
  provider?: string;
  targetAudience?: string;
  businessObjective?: string;
  suggestedTimeline?: string;
  expectedImpact?: string;
}

interface StrategyResponse {
  pathways?: PathwayRecommendation[];
  openLibraryPathways?: PathwayRecommendation[];
  catalogPathways?: PathwayRecommendation[];
  recommendedPriorities?: { rank: number; action: string; rationale: string; timeline: string; impact: string; priority: string }[];
  skillAnalysis?: {
    gaps: { skill: string; note: string; severity: string }[];
    strengths: { skill: string; note: string; severity: string }[];
  };
}

export default async (req: Request) => {
  try {
    const { data, clientName } = await req.json() as { data: StrategyResponse; clientName: string };

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Pathway Recommendations ────────────────────────────────
    const allPathways = [
      ...(data.pathways || []).map(p => ({ ...p, source: p.source || 'ai' })),
      ...(data.openLibraryPathways || []).map(p => ({ ...p, source: p.source || 'open-library' })),
      ...(data.catalogPathways || []).map(p => ({ ...p, source: p.source || 'catalog' })),
    ];

    // Sort by priority
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    allPathways.sort((a, b) =>
      (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4)
    );

    const pathwayRows = allPathways.map((p, i) => ({
      'Rank': i + 1,
      'Pathway Title': p.title || '',
      'Learning Goal': p.description || '',
      'Target Audience': p.targetAudience || '',
      'Priority Level': p.priority || '',
      'Recommended Skills': (p.skills || []).join(', '),
      'Business Objective Supported': p.businessObjective || '',
      'Reason for Recommendation': p.reasoning || '',
      'Suggested Timeline': p.suggestedTimeline || p.duration || '',
      'Expected Impact': p.expectedImpact || '',
      'Format': p.format || '',
      'Source': p.source === 'catalog' ? 'Existing Catalog' : p.source === 'open-library' ? `Open Library${p.provider ? ` (${p.provider})` : ''}` : 'New Build',
    }));

    const ws1 = XLSX.utils.json_to_sheet(pathwayRows);

    ws1['!cols'] = [
      { wch: 6 },   // Rank
      { wch: 40 },  // Title
      { wch: 50 },  // Learning Goal
      { wch: 25 },  // Audience
      { wch: 12 },  // Priority
      { wch: 40 },  // Skills
      { wch: 35 },  // Business Objective
      { wch: 50 },  // Reason
      { wch: 20 },  // Timeline
      { wch: 40 },  // Impact
      { wch: 20 },  // Format
      { wch: 25 },  // Source
    ];

    XLSX.utils.book_append_sheet(wb, ws1, 'Pathway Recommendations');

    // ── Sheet 2: Skill Gaps ──────────────────────────────────────────────
    if (data.skillAnalysis?.gaps?.length) {
      const gapRows = data.skillAnalysis.gaps.map((g, i) => ({
        'Rank': i + 1,
        'Skill': g.skill,
        'Priority': g.severity,
        'Evidence': g.note,
      }));
      const ws2 = XLSX.utils.json_to_sheet(gapRows);
      ws2['!cols'] = [{ wch: 6 }, { wch: 35 }, { wch: 12 }, { wch: 70 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Skill Gaps');
    }

    // ── Sheet 3: Recommended Priorities ─────────────────────────────────
    if (data.recommendedPriorities?.length) {
      const prioRows = data.recommendedPriorities.map(p => ({
        'Rank': p.rank,
        'Action': p.action,
        'Priority': p.priority,
        'Rationale': p.rationale,
        'Timeline': p.timeline,
        'Expected Impact': p.impact,
      }));
      const ws3 = XLSX.utils.json_to_sheet(prioRows);
      ws3['!cols'] = [{ wch: 6 }, { wch: 50 }, { wch: 12 }, { wch: 60 }, { wch: 15 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Recommended Priorities');
    }

    // Write to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `${(clientName || 'strategy').replace(/[^a-zA-Z0-9]/g, '-')}-pathway-recommendations.xlsx`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating XLSX:', error);
    return Response.json({ error: 'Failed to generate spreadsheet' }, { status: 500 });
  }
};

export const config = { path: '/api/export-xlsx' };
