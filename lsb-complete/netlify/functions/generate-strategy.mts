import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface FileInput {
  name: string;
  fileType: 'csv-data' | 'pdf' | 'image' | 'text' | 'spreadsheet-data' | 'other';
  textContent?: string;
  rows?: Record<string, string>[];
  base64?: string;
  mediaType?: string;
  sizeKb?: number;
}

function parseJsonFromText(text: string): unknown {
  if (!text) throw new Error('Empty response from Claude');
  const clean = text
    .replace(/```json[\s\S]*?```/g, m => m.replace(/```json|```/g, ''))
    .replace(/```/g, '')
    .trim();
  // Find the first { and last } to extract JSON
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in response');
  return JSON.parse(clean.slice(start, end + 1));
}

export default async (req: Request) => {
  try {
    const { clientName, context, catalogAnalysis, files } = await req.json() as {
      clientName: string;
      context?: string;
      catalogAnalysis?: boolean;
      files: FileInput[];
    };

    if (!files || files.length === 0) {
      return Response.json({ error: 'No files provided' }, { status: 400 });
    }

    // Build the Claude message content
    const contentParts: Anthropic.MessageParam['content'] = [];

    // System prompt as first text block
    const fileDescriptions = files.map(f => `- ${f.name} (${f.fileType}, ${f.sizeKb || 0}KB)`).join('\n');

    const catalogMode = catalogAnalysis === true;
    const systemText = `You are a senior Learning Strategy Consultant at Degreed's Forward Deployed Solutions team.

A consultant has uploaded ${files.length} file(s) for client "${clientName}" and needs a comprehensive learning strategy analysis.

Files provided:
${fileDescriptions}
${context ? `\nAdditional context from the consultant: ${context}` : ''}

CATALOG ANALYSIS MODE: ${catalogMode
  ? 'YES — The consultant included a content catalog export. Perform deep catalog analysis: map existing coverage, identify skill gaps, surface duplicate/overlapping content, and flag underrepresented topics. Catalog insights should drive the majority of recommendations.'
  : 'NO — No catalog provided. Build strategy from uploaded files and enrich with current market trends, industry benchmarks, and trending skills. Pathway recommendations should be net-new suggestions grounded in the files and industry context.'}

Your task:
1. Analyze ALL uploaded files carefully
2. Extract signals from each of the 5 categories below
3. Generate evidence-based recommendations — ONLY from what the files show, never invent specific metrics
4. If files have limited information, still generate useful recommendations using what IS available
5. ${catalogMode
  ? 'Prioritize catalog-specific insights: what exists, what is missing, what overlaps, what should be consolidated or built.'
  : 'Prioritize market-enriched insights: what the industry demands, what the files suggest, where the organization should invest.'}

SIGNAL CATEGORIES TO EXTRACT:
- Business Signals: strategic priorities, business objectives, transformation initiatives, organizational focus areas, performance challenges
- Learning Signals: existing learning coverage, existing pathway coverage, learning demand, skill development opportunities, areas of learner interest
- Capability Signals: skill gaps, skill strengths, emerging capabilities, missing capabilities, capability overlaps
- Content Signals: coverage gaps, duplicate content, underrepresented topics, overrepresented topics, pathway opportunities
- Market Signals: trending skills, industry trends, future capability needs (enrich with general knowledge${catalogMode ? ' to contextualize catalog gaps' : ''})

OUTPUT FORMAT: Respond ONLY with valid JSON. No prose, no markdown fences, no explanation outside the JSON.`;

    contentParts.push({ type: 'text', text: systemText });

    // Add each file's content
    for (const file of files) {
      if (file.fileType === 'pdf' && file.base64 && file.mediaType) {
        // PDF via document block
        contentParts.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: file.mediaType as 'application/pdf',
            data: file.base64,
          },
        } as Anthropic.DocumentBlockParam);
      } else if (file.fileType === 'image' && file.base64 && file.mediaType) {
        // Image via image block
        contentParts.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: file.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: file.base64,
          },
        } as Anthropic.ImageBlockParam);
        contentParts.push({ type: 'text', text: `Above image is from file: ${file.name}` });
      } else if (file.textContent) {
        // Text content (CSV, XLSX parsed, PPTX extracted, etc.)
        contentParts.push({
          type: 'text',
          text: `\n\n[FILE: ${file.name}]\n${file.textContent}`,
        });
      }
    }

    // The analysis prompt
    const analysisPrompt = `Based on ALL the files above, produce a comprehensive learning strategy analysis for "${clientName}".

Respond ONLY with this JSON structure:

{
  "filesAnalyzed": [
    { "name": "filename", "type": "pdf/spreadsheet/etc", "contribution": "what this file contributed to the analysis" }
  ],
  "insights": [
    "Concise insight grounded directly in the uploaded files — 3-5 insights"
  ],
  "skillAnalysis": {
    "gaps": [
      { "skill": "Skill name", "note": "Why this is a gap, citing evidence from the files", "severity": "Critical" }
    ],
    "strengths": [
      { "skill": "Skill name", "note": "Why this is strong, citing evidence from the files", "severity": "Low" }
    ]
  },
  "pathwayAnalysis": {
    "gaps": [
      { "title": "Missing pathway/topic", "note": "What outcome is uncovered" }
    ],
    "overlaps": [
      { "skill": "Shared theme", "pathways": ["Title A", "Title B"], "note": "Why these overlap and how to consolidate" }
    ]
  },
  "trendingSkills": [
    { "skill": "Skill name", "trend": "Rising/Emerging/Critical", "relevance": "Why this matters for this client" }
  ],
  "strategicOpportunities": [
    { "title": "Opportunity title", "description": "What this is and why it matters", "priority": "High" }
  ],
  "learningAdoption": [
    { "metric": "Metric name (if found in data)", "value": "Value", "trend": "Up/Down/Stable" }
  ],
  "recommendedPriorities": [
    {
      "rank": 1,
      "action": "Specific action to take",
      "rationale": "Why this is the top priority, citing evidence from the files",
      "timeline": "0-3 Months",
      "impact": "Expected business impact",
      "priority": "Critical"
    }
  ],
  "pathways": [
    {
      "title": "Pathway title",
      "description": "What learners will achieve",
      "reasoning": "One sentence: why this pathway addresses a specific gap in the data",
      "skills": ["Skill 1", "Skill 2"],
      "duration": "X weeks",
      "format": "Self-Paced",
      "priority": "Critical",
      "source": "ai",
      "targetAudience": "Who this is for",
      "businessObjective": "Which business objective this supports",
      "suggestedTimeline": "When to build/deploy",
      "expectedImpact": "Expected outcome"
    }
  ],
  "topSkills": [
    {
      "skill": "Skill name",
      "function": "Role/function group",
      "currentLevel": "Beginner",
      "targetLevel": "Proficient",
      "gap": "High"
    }
  ],
  "recommendations": [
    {
      "gap": "Specific gap from the data",
      "action": "Specific action",
      "impact": "Expected impact",
      "kpi": "Measurement metric",
      "timeline": "0-3 Months"
    }
  ],
  "roadmap": {
    "immediate": ["Action 1", "Action 2"],
    "business": ["Action 3", "Action 4"],
    "scalable": ["Action 5", "Action 6"]
  }
}

Rules:
- severity is one of: Critical | High | Medium | Low
- format is one of: Self-Paced | Mentor Led | Practice | Collaborative
- priority is one of: Critical | High | Medium | Low
- timeline is one of: 0-3 Months | 3-9 Months | 9-18 Months
- Generate 3-7 recommendedPriorities ranked by importance
- Generate 3-6 pathway recommendations grounded in the data
- Generate 3-5 trending skills relevant to the industry/context
- If learningAdoption data is NOT in the files, return empty array []
- NEVER invent specific metrics (engagement rates, completion rates, etc.) unless they appear in the uploaded files
- All insights and recommendations must reference the actual uploaded content`;

    contentParts.push({ type: 'text', text: analysisPrompt });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 6000,
      messages: [{ role: 'user', content: contentParts }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    if (!text) throw new Error('Empty response from Claude');

    const result = parseJsonFromText(text);
    return Response.json(result);

  } catch (error) {
    console.error('Error generating strategy:', error);
    const msg = error instanceof Error ? error.message : 'Failed to generate strategy';
    return Response.json({ error: msg }, { status: 500 });
  }
};

export const config = { path: '/api/generate-strategy' };
