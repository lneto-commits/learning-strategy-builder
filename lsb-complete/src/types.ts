export interface PathwayRecommendation {
  title: string;
  description: string;
  reasoning?: string;
  skills: string[];
  duration: string;
  format: 'Self-Paced' | 'Mentor Led' | 'Practice' | 'Collaborative';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  source?: 'ai' | 'open-library' | 'catalog';
  provider?: string;
  targetAudience?: string;
  businessObjective?: string;
  suggestedTimeline?: string;
  expectedImpact?: string;
}

export interface TopSkill {
  skill: string;
  function: string;
  currentLevel: 'Beginner' | 'Developing' | 'Proficient' | 'Advanced';
  targetLevel: 'Developing' | 'Proficient' | 'Advanced' | 'Expert';
  gap: 'Critical' | 'High' | 'Medium' | 'Low';
}

export type AnalysisType = 'skill-gap' | 'content-pathway' | 'full-review';

export interface SkillInsight {
  skill: string;
  note: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface PathwayInsight {
  title: string;
  note: string;
}

export interface PathwayOverlap {
  skill?: string;
  pathways: string[];
  note: string;
}

export interface TrendingSkill {
  skill: string;
  trend: string;
  relevance: string;
}

export interface RecommendedPriority {
  rank: number;
  action: string;
  rationale: string;
  timeline: string;
  impact: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface LearningAdoptionMetric {
  metric: string;
  value: string;
  trend?: string;
}

export interface StrategyResponse {
  // Core analysis sections
  insights: string[];
  skillAnalysis?: {
    gaps: SkillInsight[];
    strengths: SkillInsight[];
  };
  pathwayAnalysis?: {
    gaps: PathwayInsight[];
    overlaps: PathwayOverlap[];
  };

  // Dashboard sections (existing)
  kpis?: { label: string; value: string; change: string }[];
  charts?: {
    skillCoverage: { name: string; current: number; target: number }[];
    contentMix: { name: string; value: number }[];
    useCaseMatrix: { name: string; impact: number; ease: number }[];
  };
  strategicFocusAreas?: {
    title: string;
    description: string;
    outcomes: string[];
  }[];
  recommendations?: {
    gap: string;
    action: string;
    impact: string;
    kpi: string;
    timeline: string;
  }[];
  topSkills?: TopSkill[];
  pathways?: PathwayRecommendation[];
  openLibraryPathways?: PathwayRecommendation[];
  catalogPathways?: PathwayRecommendation[];
  roadmap?: {
    immediate: string[];
    business: string[];
    scalable: string[];
  };

  // New fields
  trendingSkills?: TrendingSkill[];
  topSearches?: { topic: string; volume?: string }[];
  learningAdoption?: LearningAdoptionMetric[];
  recommendedPriorities?: RecommendedPriority[];
  strategicOpportunities?: { title: string; description: string; priority: string }[];

  // File metadata
  filesAnalyzed?: { name: string; type: string; contribution: string }[];
}

export interface UserResponses {
  clientName: string;
  context?: string;
  catalogAnalysis?: boolean;  // true = include catalog in analysis, false = market trends only
  // Keep these for backward compat with existing dashboard/export code
  clientType?: 'new' | 'existing';
  analysisType?: AnalysisType;
  businessChallenges?: string[];
  businessPriority?: string;
  outcomeMatter?: string;
  successKPI?: string;
  roles?: string[];
  targetAudience?: string;
  degreedExperience?: string;
  strategicImpact?: string;
  easeOfDeployment?: string;
  strategicInitiative?: string;
  priorityLevel?: string;
  contentNeeded?: string;
  ldMaturity?: string;
  learningTeamStructure?: string[];
  orgPriorities?: string[];
  catalogScrape?: boolean;
  dolEnabled?: boolean;
  macroTrends?: string[];
  research?: string[];
  benchmarks?: string[];
}

// File input for sending to backend
export interface FileInput {
  name: string;
  fileType: 'csv-data' | 'pdf' | 'image' | 'text' | 'spreadsheet-data' | 'other';
  textContent?: string;  // For CSV/XLSX: pre-parsed text; for PPTX/DOCX: extracted text
  rows?: Record<string, string>[];  // For CSV/XLSX structured data
  base64?: string;  // For PDF/images: base64 encoded content
  mediaType?: string;  // e.g. 'image/png', 'application/pdf'
  sizeKb?: number;
}
