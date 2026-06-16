import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Download, Share2, Lightbulb, Calendar, ArrowUpRight, ChevronRight,
  ChevronDown, BookOpen, Clock, Target, Users, Zap,
  ExternalLink, Sparkles, Archive, RotateCcw, FileDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StrategyResponse, UserResponses, PathwayRecommendation, TopSkill } from '../types';
import {
  TrendingSkillsSection,
  PathwayOverlapsSection,
  RecommendedPrioritiesSection,
  LearningAdoptionSection,
  FilesAnalyzedSection,
  ExcelExportButton,
} from './DashboardSectionAdditions';

interface DashboardSectionProps {
  data: StrategyResponse;
  clientName?: string;
  clientType?: 'new' | 'existing';
  reduced?: boolean;
  responses?: UserResponses | null;
  onRestart?: () => void;
}

// Degreed brand palette for charts
const COLORS = ['#26c485', '#1a1f36', '#FED141', '#8FCEEE', '#FF7F64'];

const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-[#f0fdf8] text-[#059669] border-[#26c485]/30',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-gray-50 text-gray-600 border-gray-200',
};

const FORMAT_COLORS: Record<string, string> = {
  'Self-Paced': 'bg-blue-50 text-blue-700',
  'Mentor Led': 'bg-purple-50 text-purple-700',
  'Practice': 'bg-amber-50 text-amber-700',
  'Collaborative': 'bg-[#f0fdf8] text-[#059669]',
};

function PathwayCard({ pathway }: { pathway: PathwayRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', PRIORITY_COLORS[pathway.priority] || PRIORITY_COLORS.Medium)}>
                {pathway.priority}
              </span>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', FORMAT_COLORS[pathway.format] || 'bg-gray-50 text-gray-600')}>
                {pathway.format}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#1a1f36] leading-snug">{pathway.title}</h4>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-[#9ca3af] flex items-center gap-1">
              <Clock size={10} /> {pathway.duration}
            </div>
          </div>
        </div>
        <p className="text-xs text-[#6b7280] leading-relaxed mb-3 line-clamp-2">{pathway.description}</p>
        {pathway.skills && pathway.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {pathway.skills.slice(0, 4).map((s, i) => (
              <span key={i} className="text-[10px] bg-[#f3f4f6] text-[#374151] px-2 py-0.5 rounded-full border border-[#e5e7eb]">{s}</span>
            ))}
            {pathway.skills.length > 4 && (
              <span className="text-[10px] text-[#9ca3af] px-2 py-0.5">+{pathway.skills.length - 4} more</span>
            )}
          </div>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] text-[#26c485] font-medium hover:text-[#1db070] transition-colors"
        >
          {expanded ? 'Show less' : 'Show more'}
          <ChevronDown size={12} className={cn('transition-transform', expanded && 'rotate-180')} />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-[#f3f4f6] px-5 py-4 bg-[#f8fafb] space-y-2">
          {pathway.reasoning && (
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] block mb-0.5">Reasoning</span>
              <p className="text-xs text-[#6b7280]">{pathway.reasoning}</p>
            </div>
          )}
          {pathway.targetAudience && (
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Users size={11} className="text-[#26c485]" />
              <span>{pathway.targetAudience}</span>
            </div>
          )}
          {pathway.businessObjective && (
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Target size={11} className="text-[#26c485]" />
              <span>{pathway.businessObjective}</span>
            </div>
          )}
          {pathway.expectedImpact && (
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Zap size={11} className="text-[#26c485]" />
              <span>{pathway.expectedImpact}</span>
            </div>
          )}
          {pathway.suggestedTimeline && (
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Calendar size={11} className="text-[#26c485]" />
              <span>{pathway.suggestedTimeline}</span>
            </div>
          )}
          {pathway.provider && (
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <ExternalLink size={11} className="text-[#26c485]" />
              <span>Provider: {pathway.provider}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TopSkillsSection({ skills }: { skills: TopSkill[] }) {
  if (!skills?.length) return null;
  const gapColors: Record<string, string> = {
    Critical: 'text-red-600',
    High: 'text-orange-500',
    Medium: 'text-amber-500',
    Low: 'text-[#26c485]',
  };
  return (
    <section className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Target size={16} className="text-[#26c485]" />
        <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">Top Skill Gaps</h3>
      </div>
      <div className="space-y-3">
        {skills.map((s, i) => (
          <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-[#f8fafb] border border-[#e5e7eb]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-[#111827] truncate">{s.skill}</span>
                <span className={cn('text-[10px] font-bold', gapColors[s.gap] || 'text-gray-500')}>
                  {s.gap} gap
                </span>
              </div>
              <span className="text-xs text-[#9ca3af]">{s.function}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] text-[#9ca3af]">{s.currentLevel} → {s.targetLevel}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PathwaysSection({ pathways, title, icon }: { pathways: PathwayRecommendation[]; title: string; icon?: React.ReactNode }) {
  if (!pathways?.length) return null;
  return (
    <section className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        {icon || <BookOpen size={16} className="text-[#26c485]" />}
        <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">{title}</h3>
        <span className="ml-auto text-xs text-[#9ca3af]">{pathways.length} pathways</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pathways.map((p, i) => (
          <PathwayCard key={i} pathway={p} />
        ))}
      </div>
    </section>
  );
}

export default function DashboardSection({
  data,
  clientName = 'Strategy Output',
  clientType = 'new',
  reduced = false,
  responses,
  onRestart,
}: DashboardSectionProps) {
  const [pptxLoading, setPptxLoading] = useState(false);

  const handlePptxExport = async () => {
    setPptxLoading(true);
    try {
      const response = await fetch('/api/export-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, clientName }),
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName.replace(/[^a-zA-Z0-9]/g, '-')}-learning-strategy.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('PPTX export failed. Please try again.');
    } finally {
      setPptxLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Header */}
      <header className="bg-[#1a1f36] px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#26c485] rounded-md flex items-center justify-center flex-shrink-0">
            <Sparkles size={15} className="text-[#1a1f36]" />
          </div>
          <div className="w-px h-5 bg-white/15" />
          <div>
            <div className="text-sm font-semibold text-white tracking-wide leading-tight">Learning Strategy Builder</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Forward Deployed Solutions · Degreed</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {onRestart && (
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-white/20 rounded-lg text-xs text-white/60 hover:text-white hover:border-white/40 transition-all font-medium"
            >
              <RotateCcw size={12} /> Start over
            </button>
          )}
          <button
            onClick={handlePptxExport}
            disabled={pptxLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-white/20 rounded-lg text-xs text-white/60 hover:text-white hover:border-white/40 transition-all font-medium"
          >
            <FileDown size={13} /> {pptxLoading ? 'Exporting...' : 'Export PPTX'}
          </button>
          <ExcelExportButton data={data} clientName={clientName} />
        </div>
      </header>

      <main className="max-w-[1040px] mx-auto py-8 px-6 space-y-8">

        {/* Hero output bar */}
        <div className="bg-[#1a1f36] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[rgba(38,196,133,0.08)] -translate-y-1/4 translate-x-1/4" />
          <div className="text-[10px] text-[#26c485]/80 uppercase tracking-widest font-semibold mb-1">Strategy output</div>
          <div className="text-2xl font-bold text-white mb-2 tracking-tight">{clientName}</div>
          <div className="flex flex-wrap items-center gap-0">
            <span className="text-[11px] text-white/50 uppercase tracking-widest pr-3.5 mr-3.5 border-r border-white/15">Degreed Business Impact Framework</span>
            <span className={cn(
              'text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full',
              clientType === 'existing' ? 'bg-[rgba(38,196,133,0.15)] text-[#26c485]' : 'bg-[rgba(38,196,133,0.25)] text-[#26c485]'
            )}>
              {clientType === 'existing' ? 'Strategy refresh' : 'Initial strategy'}
            </span>
          </div>
        </div>

        {/* KPI cards */}
        {data.kpis && data.kpis.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.kpis.map((kpi, idx) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-sm"
              >
                <p className="text-[11px] font-semibold text-[#6b7280] mb-2 uppercase tracking-wider">{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1a1f36] tracking-tight">{kpi.value}</span>
                  {kpi.change && (
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                      kpi.change.startsWith('+') ? 'bg-[#f0fdf8] text-[#059669]' :
                      kpi.change.startsWith('-') ? 'bg-red-50 text-red-600' :
                      'bg-[#f3f4f6] text-[#6b7280]'
                    )}>
                      {kpi.change}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Charts row */}
        {data.charts && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.charts.skillCoverage && data.charts.skillCoverage.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm">
                <div className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Skill coverage</div>
                <div className="text-base font-bold text-[#1a1f36] mb-5 tracking-tight">Current vs target</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.charts.skillCoverage}>
                      <PolarGrid stroke="rgba(26,31,54,0.08)" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Inter' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Target" dataKey="target" stroke="#1a1f36" fill="#1a1f36" fillOpacity={0.06} />
                      <Radar name="Current" dataKey="current" stroke="#26c485" fill="#26c485" fillOpacity={0.45} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {data.charts.useCaseMatrix && data.charts.useCaseMatrix.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm">
                <div className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Use case matrix</div>
                <div className="text-base font-bold text-[#1a1f36] mb-5 tracking-tight">Impact vs ease of deployment</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,31,54,0.06)" />
                      <XAxis type="number" dataKey="ease" domain={[0, 10]} label={{ value: 'Ease', position: 'bottom', offset: 0, fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' }} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <YAxis type="number" dataKey="impact" domain={[0, 10]} label={{ value: 'Impact', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' }} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <ZAxis type="number" range={[80, 400]} />
                      <Tooltip />
                      <Scatter data={data.charts.useCaseMatrix} fill="#26c485">
                        {data.charts.useCaseMatrix.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Insights + Content mix + Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            {data.insights && data.insights.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a1f36] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb className="text-[#FED141]" size={18} />
                  <div className="text-sm font-semibold text-white">Key insights</div>
                </div>
                <ul className="space-y-3.5">
                  {data.insights.map((insight, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.08 }}
                      className="flex gap-2.5 text-xs text-white/60 leading-relaxed"
                    >
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#26c485] flex-shrink-0" />
                      {insight}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {data.charts?.contentMix && data.charts.contentMix.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm">
                <div className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-4">Content mix by format</div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.charts.contentMix} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                        {data.charts.contentMix.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {data.charts.contentMix.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-[10px] text-[#6b7280] font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="col-span-1 md:col-span-2">
              <div className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Prescriptive recommendations</div>
              <div className="text-xl font-bold text-[#1a1f36] mb-5 tracking-tight">Identified gaps &amp; actions</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.12 }}
                    className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex flex-col hover:border-[#26c485] transition-all group shadow-sm"
                  >
                    <div className="mb-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded">Gap detected</span>
                      <p className="text-xs font-semibold text-[#1a1f36] mt-2 leading-snug">{rec.gap}</p>
                    </div>
                    <div className="mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#26c485] block mb-1">Recommended action</span>
                      <p className="text-[11px] text-[#6b7280] border-l-2 border-[#26c485]/30 pl-2.5 leading-relaxed">"{rec.action}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-auto mb-3">
                      <div>
                        <span className="text-[8px] font-bold text-[#9ca3af] uppercase block mb-0.5">Impact</span>
                        <p className="text-[10px] font-semibold text-[#374151]">{rec.impact}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-[#9ca3af] uppercase block mb-0.5">KPI</span>
                        <p className="text-[10px] font-semibold text-[#374151]">{rec.kpi}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#e5e7eb] flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6b7280] font-medium">
                        <Calendar size={11} className="text-[#26c485]" />
                        {rec.timeline}
                      </div>
                      <ChevronRight size={14} className="text-[#9ca3af] group-hover:text-[#26c485] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Skills */}
        {data.topSkills && data.topSkills.length > 0 && (
          <TopSkillsSection skills={data.topSkills} />
        )}

        {/* Pathway Recommendations */}
        {data.pathways && data.pathways.length > 0 && (
          <PathwaysSection
            pathways={data.pathways}
            title="Recommended Pathways"
            icon={<BookOpen size={16} className="text-[#26c485]" />}
          />
        )}

        {/* Open Library Pathways */}
        {data.openLibraryPathways && data.openLibraryPathways.length > 0 && (
          <PathwaysSection
            pathways={data.openLibraryPathways}
            title="Open Library Pathways"
            icon={<ExternalLink size={16} className="text-[#26c485]" />}
          />
        )}

        {/* Catalog Pathways */}
        {data.catalogPathways && data.catalogPathways.length > 0 && (
          <PathwaysSection
            pathways={data.catalogPathways}
            title="Catalog Pathways"
            icon={<Archive size={16} className="text-[#26c485]" />}
          />
        )}

        {/* Strategic Focus Areas */}
        {data.strategicFocusAreas && data.strategicFocusAreas.length > 0 && (
          <section className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={16} className="text-[#26c485]" />
              <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">Strategic Focus Areas</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.strategicFocusAreas.map((area, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#f8fafb] border border-[#e5e7eb]">
                  <h4 className="text-sm font-semibold text-[#1a1f36] mb-2">{area.title}</h4>
                  <p className="text-xs text-[#6b7280] mb-3 leading-relaxed">{area.description}</p>
                  {area.outcomes && area.outcomes.length > 0 && (
                    <ul className="space-y-1.5">
                      {area.outcomes.map((o, j) => (
                        <li key={j} className="flex gap-2 text-xs text-[#374151]">
                          <ArrowUpRight size={11} className="text-[#26c485] flex-shrink-0 mt-0.5" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Roadmap */}
        {data.roadmap && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e5e7eb] rounded-2xl p-8 shadow-sm"
          >
            <div className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Roadmap</div>
            <div className="text-2xl font-bold text-[#1a1f36] mb-8 tracking-tight">Business impact roadmap</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-px bg-[#e5e7eb]" />
              {[
                { id: 'immediate', title: '0–3 Months', subtitle: 'Immediate impact',  items: data.roadmap.immediate || [], bg: 'bg-[#26c485]', textColor: 'text-[#1a1f36]' },
                { id: 'business',  title: '3–9 Months', subtitle: 'Business value',    items: data.roadmap.business  || [], bg: 'bg-[#1a1f36]' },
                { id: 'scalable',  title: '9–18 Months',subtitle: 'Scalable growth',   items: data.roadmap.scalable  || [], bg: 'bg-[#FED141]', textColor: 'text-[#1a1f36]' },
              ].map((stage, idx) => (
                <div key={stage.id} className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold', stage.bg, stage.textColor || 'text-white')}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1a1f36] tracking-tight">{stage.title}</div>
                      <div className="text-[10px] text-[#9ca3af] uppercase tracking-wider font-semibold">{stage.subtitle}</div>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {stage.items.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-[#6b7280] bg-[#f8fafb] p-3 rounded-xl border border-[#e5e7eb]">
                        <ArrowUpRight size={12} className="text-[#26c485] flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* New sections from DashboardSectionAdditions */}
        {data.trendingSkills && data.trendingSkills.length > 0 && (
          <TrendingSkillsSection skills={data.trendingSkills} />
        )}
        {data.pathwayAnalysis?.overlaps && data.pathwayAnalysis.overlaps.length > 0 && (
          <PathwayOverlapsSection overlaps={data.pathwayAnalysis.overlaps} />
        )}
        {data.recommendedPriorities && data.recommendedPriorities.length > 0 && (
          <RecommendedPrioritiesSection priorities={data.recommendedPriorities} />
        )}
        {data.learningAdoption && data.learningAdoption.length > 0 && (
          <LearningAdoptionSection metrics={data.learningAdoption} />
        )}
        {data.filesAnalyzed && data.filesAnalyzed.length > 0 && (
          <FilesAnalyzedSection files={data.filesAnalyzed} />
        )}

        <footer className="text-center text-[11px] text-[#9ca3af] py-4 font-medium">
          Learning Strategy Builder · Powered by Degreed Business Impact Framework
        </footer>
      </main>
    </div>
  );
}
