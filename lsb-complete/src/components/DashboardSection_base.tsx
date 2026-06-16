import React from 'react';
import { motion } from 'motion/react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Download, Share2, Lightbulb, Calendar, ArrowUpRight, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { StrategyResponse } from '../types';

interface DashboardSectionProps {
  data: StrategyResponse;
  clientName?: string;
  clientType?: 'new' | 'existing';
}

// Degreed brand palette for charts
const COLORS = ['#0062E3', '#0F1F2C', '#FED141', '#8FCEEE', '#FF7F64'];

export default function DashboardSection({ data, clientName = 'Strategy Output', clientType = 'new' }: DashboardSectionProps) {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Header */}
      <header className="bg-[#0F1F2C] px-8 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="108" height="24" viewBox="0 0 108 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 4h8a8 8 0 0 1 0 16H0V4z" fill="#0062E3"/>
            <path d="M0 12h8" stroke="#fff" strokeWidth="1.5"/>
            <text x="14" y="17" fontFamily="Inter" fontWeight="700" fontSize="14" fill="white" letterSpacing="-0.3">degreed</text>
          </svg>
          <div className="w-px h-5 bg-white/15" />
          <div>
            <div className="text-[13px] font-semibold text-white tracking-tight">Learning Strategy Builder</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Forward Deployed Solutions</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-3.5 py-2 border border-white/20 rounded-lg text-xs text-white/60 hover:text-white hover:border-white/40 transition-all font-medium">
            <Download size={13} /> Export PDF
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0062E3] rounded-lg text-xs font-semibold text-white hover:bs-[#0056CC] transition-all">
            <Share2 size={13} /> Share executive view
          </button>
        </div>
      </header>

      <main className="max-w-[960px] mx-auto py-8 px-8 space-y-8">

        {/* Hero output bar */}
        <div className="bg-[#0F1F2C] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[rgba(0,98,227,0.08)] -translate-y-1/4 translate-x-1/4" />
          <div className="text-[10px] text-[#8FCEEE]/60 uppercase tracking-widest font-semibold mb-1">Strategy output</div>
          <div className="text-2xl font-bold text-white mb-2 tracking-tight">{clientName}</div>
          <div className="flex flex-wrap items-center gap-0">
            <span className="text-[11px] text-white/50 uppercase tracking-widest pr-3.5 mr-3.5 border-r border-white/15">Degreed Business Impact Framework</span>
            <span className={cn(
              'text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full',
              clientType === 'existing' ? 'bg-[rgba(143,206,238,0.15)] text-[#8FCEEE]' : 'bg-[rgba(0,98,227,0.25)] text-[#8FCEEE]'
            )}>
              {clientType === 'existing' ? 'Strategy refresh' : 'Initial strategy'}
            </span>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {data.kpis.map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white border border-[#E0E5ED] rounded-xl p-5"
            >
              <p className="text-[11px] font-semibold text-[#5A6A7A] mb-2 uppercase tracking-wider">{kpi.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0F1F2C] tracking-tight">{kpi.value}</span>
                {kpi.change && (
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    kpi.change.startsWith('+') ? 'bg-[#EFF5FF] text-[#0062E3]' :
                    kpi.change.startsWith('-') ? 'bg-red-50 text-red-600' :
                    'bg-[#F4F6F9] text-[#5A6A7A]'
                  )}>
                    {kpi.change}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-[#E0E5ED] rounded-xl p-6">
            <div className="text-[11px] font-semibold text-[#5A6A7A] uppercase tracking-wider mb-1">Skill coverage</div>
            <div className="text-base font-bold text-[#0F1F2C] mb-5 tracking-tight">Current vs target</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.charts.skillCoverage}>
                  <PolarGrid stroke="rgba(15,31,44,0.08)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#5A6A7A', fontSize: 11, fontFamily: 'Inter' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Target" dataKey="target" stroke="#0F1F2C" fill="#0F1F2C" fillOpacity={0.06} />
                  <Radar name="Current" dataKey="current" stroke="#0062E3" fill="#0062E3" fillOpacity={0.45} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-[#E0E5ED] rounded-xl p-6">
            <div className="text-[11px] font-semibold text-[#5A6A7A] uppercase tracking-wider mb-1">Use case matrix</div>
            <div className="text-base font-bold text-[#0F1F2C] mb-5 tracking-tight">Impact vs ease of deployment</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,31,44,0.06)" />
                  <XAxis type="number" dataKey="ease" domain={[0, 10]} label={{ value: 'Ease', position: 'bottom', offset: 0, fill: '#9AACBB', fontSize: 11, fontFamily: 'Inter' }} tick={{ fill: '#9AACBB', fontSize: 10 }} />
                  <YAxis type="number" dataKey="impact" domain={[0, 10]} label={{ value: 'Impact', angle: -90, position: 'insideLeft', fill: '#9AACBB', fontSize: 11, fontFamily: 'Inter' }} tick={{ fill: '#9AACBB', fontSize: 10 }} />
                  <ZAxis type="number" range={[80, 400]} />
                  <Tooltip />
                  <Scatter data={data.charts.useCaseMatrix} fill="#0062E3">
                    {data.charts.useCaseMatrix.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Insights + Content mix + Recommendations */}
        <div className="grid grid-cols-3 gap-6">

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0F1F2C] rounded-xl p-6">
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
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0062E3] flex-shrink-0" />
                    {insight}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-[#E0E5ED] rounded-xl p-6">
              <div className="text-[11px] font-semibold text-[#5A6A7A] uppercase tracking-wider mb-4">Content mix by format</div>
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
                    <span className="text-[10px] text-[#5A6A7A] font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recommendations */}
          <div className="col-span-2">
            <div className="text-[11px] font-semibold text-[#5A6A7A] uppercase tracking-wider mb-1">Prescriptive recommendations</div>
            <div className="text-xl font-bold text-[#0F1F2C] mb-5 tracking-tight">Identified gaps &amp; actions</div>
            <div className="grid grid-cols-2 gap-4">
              {data.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.12 }}
                  className="bg-white border border-[#E0E5ED] rounded-xl p-5 flex flex-col hover:border-[#0062E3] transition-all group"
                >
                  <div className="mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded">Gap detected</span>
                    <p className="text-xs font-semibold text-[#0F1F2C] mt-2 leading-snug">{rec.gap}</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#0062E3] block mb-1">Recommended action</span>
                    <p className="text-[11px] text-[#5A6A7A] border-l-2 border-[#0062E3]/30 pl-2.5 leading-relaxed">"{rec.action}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-auto mb-3">
                    <div>
                      <span className="text-[8px] font-bold text-[#9AACBB] uppercase block mb-0.5">Impact</span>
                      <p className="text-[10px] font-semibold text-[#2E3F4F]">{rec.impact}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-[#9AACBB] uppercase block mb-0.5">KPI</span>
                      <p className="text-[10px] font-semibold text-[#2E3F4F]">{rec.kpi}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#E0E5ED] flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#5A6A7A] font-medium">
                      <Calendar size={11} className="text-[#0062E3]" />
                      {rec.timeline}
                    </div>
                    <ChevronRight size={14} className="text-[#9AACBB] group-hover:text-[#0062E3] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E0E5ED] rounded-xl p-8"
        >
          <div className="text-[11px] font-semibold text-[#5A6A7A] uppercase tracking-wider mb-1">Roadmap</div>
          <div className="text-2xl font-bold text-[#0F1F2C] mb-8 tracking-tight">Business impact roadmap</div>

          <div className="grid grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-px bg-[#E0E5ED]" />
            {[
              { id: 'immediate', title: '0–3 Months', subtitle: 'Immediate impact',  items: data.roadmap.immediate, bg: 'bg-[#0062E3]' },
              { id: 'business',  title: '3–9 Months', subtitle: 'Business value',    items: data.roadmap.business,  bg: 'bg-[#0F1F2C]' },
              { id: 'scalable',  title: '9–18 Months',subtitle: 'Scalable growth',   items: data.roadmap.scalable,  bg: 'bg-[#FED141]', textColor: 'text-[#0F1F2C]' },
            ].map((stage, idx) => (
              <div key={stage.id} className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold', stage.bg, stage.textColor || 'text-white')}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0F1F2C] tracking-tight">{stage.title}</div>
                    <div className="text-[10px] text-[#9AACBB] uppercase tracking-wider font-semibold">{stage.subtitle}</div>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {stage.items.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-[#5A6A7A] bg-[#F4F6F9] p-3 rounded-lg border border-[#E0E5ED]">
                      <ArrowUpRight size={12} className="text-[#0062E3] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        <footer className="text-center text-[11px] text-[#9AACBB] py-4 font-medium">
          Learning Strategy Builder · Powered by Degreed Business Impact Framework
        </footer>
      </main>
    </div>
  );
}
