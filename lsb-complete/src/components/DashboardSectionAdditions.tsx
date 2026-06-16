import React from 'react';
import { TrendingUp, Star, BarChart2, CheckCircle, ArrowUpRight, FileSpreadsheet, Sparkles } from 'lucide-react';
import type { TrendingSkill, RecommendedPriority, LearningAdoptionMetric, PathwayOverlap, StrategyResponse } from '../types';

const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-[#f0fdf8] text-[#059669] border-[#26c485]/30',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-gray-50 text-gray-600 border-gray-200',
};

export function TrendingSkillsSection({ skills }: { skills: TrendingSkill[] }) {
  if (!skills?.length) return null;
  return (
    <section className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-[#26c485]" />
        <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">Trending Skills</h3>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {skills.map((s, i) => (
          <div key={i} className="p-3.5 rounded-xl border border-[#e5e7eb] bg-[#f8fafb]">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-sm font-semibold text-[#111827]">{s.skill}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                s.trend === 'Critical' ? 'bg-red-50 text-red-700 border-red-200'
                : s.trend === 'Rising' ? 'bg-[#f0fdf8] text-[#059669] border-[#26c485]/30'
                : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>{s.trend}</span>
            </div>
            <p className="text-xs text-[#6b7280]">{s.relevance}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PathwayOverlapsSection({ overlaps }: { overlaps: PathwayOverlap[] }) {
  if (!overlaps?.length) return null;
  return (
    <section className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={16} className="text-[#26c485]" />
        <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">Pathway Overlaps</h3>
        <span className="ml-auto text-xs text-[#9ca3af]">Content that can be consolidated</span>
      </div>
      <div className="space-y-3">
        {overlaps.map((o, i) => (
          <div key={i} className="p-4 rounded-xl border border-amber-200 bg-amber-50">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Overlap</span>
              {o.skill && <span className="text-sm font-semibold text-[#111827]">{o.skill}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {o.pathways.map((p, j) => (
                <span key={j} className="text-xs bg-white border border-amber-200 text-amber-700 px-2 py-0.5 rounded">{p}</span>
              ))}
            </div>
            <p className="text-xs text-[#6b7280]">{o.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RecommendedPrioritiesSection({ priorities }: { priorities: RecommendedPriority[] }) {
  if (!priorities?.length) return null;
  return (
    <section className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <Star size={16} className="text-[#26c485]" />
        <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">Recommended Priorities</h3>
      </div>
      <p className="text-xs text-[#9ca3af] mb-4">Where to invest first, ranked by evidence and impact</p>
      <div className="space-y-3">
        {priorities.map((p) => (
          <div key={p.rank} className="flex gap-4 p-4 rounded-xl border border-[#e5e7eb] bg-[#f8fafb]">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1a1f36] flex items-center justify-center text-sm font-bold text-white">
              {p.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <p className="text-sm font-semibold text-[#111827] flex-1">{p.action}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${PRIORITY_COLORS[p.priority] || PRIORITY_COLORS.Medium}`}>
                  {p.priority}
                </span>
              </div>
              <p className="text-xs text-[#6b7280] mb-2">{p.rationale}</p>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-[#9ca3af]">
                  <ArrowUpRight size={10} /> {p.timeline}
                </span>
                <span className="text-[#9ca3af]">·</span>
                <span className="text-[#6b7280]">{p.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LearningAdoptionSection({ metrics }: { metrics: LearningAdoptionMetric[] }) {
  if (!metrics?.length) return null;
  return (
    <section className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle size={16} className="text-[#26c485]" />
        <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">Learning Adoption</h3>
        <span className="ml-auto text-xs text-[#9ca3af]">From uploaded data</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#f8fafb] border border-[#e5e7eb]">
            <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide">{m.metric}</p>
            <p className="text-2xl font-bold text-[#1a1f36] mt-1">{m.value}</p>
            {m.trend && (
              <p className={`text-xs font-semibold mt-1 ${
                m.trend === 'Up' ? 'text-[#059669]' : m.trend === 'Down' ? 'text-red-600' : 'text-[#9ca3af]'
              }`}>
                {m.trend === 'Up' ? '↑' : m.trend === 'Down' ? '↓' : '→'} {m.trend}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function FilesAnalyzedSection({ files }: { files: { name: string; type: string; contribution: string }[] }) {
  if (!files?.length) return null;
  return (
    <section className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-[#26c485]" />
        <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">Files Analyzed</h3>
      </div>
      <div className="space-y-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-[#f3f4f6] last:border-0">
            <span className="text-xs font-medium text-[#374151] min-w-[120px] truncate">{f.name}</span>
            <p className="text-xs text-[#6b7280] flex-1">{f.contribution}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ExcelExportButton({ data, clientName }: { data: StrategyResponse; clientName: string }) {
  const [loading, setLoading] = React.useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/export-xlsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, clientName }),
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName.replace(/[^a-zA-Z0-9]/g, '-')}-pathway-recommendations.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e7eb] hover:border-[#26c485] hover:bg-[#f0fdf8] text-sm font-semibold text-[#374151] rounded-xl transition-all"
    >
      <FileSpreadsheet size={15} className="text-[#26c485]" />
      {loading ? 'Exporting...' : 'Export Pathway Recommendations'}
    </button>
  );
}
