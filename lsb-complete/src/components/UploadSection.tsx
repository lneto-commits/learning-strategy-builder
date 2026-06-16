import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Table, Sparkles, AlertCircle, FileSpreadsheet, BarChart2, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { FileInput, UserResponses } from '../types';
import { parseAnyFile } from '../lib/parseAnyFile';

interface UploadSectionProps {
  onGenerate: (responses: UserResponses, files: FileInput[]) => void;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={14} className="text-red-400" />,
  image: <Image size={14} className="text-blue-400" />,
  'spreadsheet-data': <FileSpreadsheet size={14} className="text-green-500" />,
  'csv-data': <Table size={14} className="text-green-500" />,
  text: <FileText size={14} className="text-gray-400" />,
  other: <FileText size={14} className="text-gray-400" />,
};

export default function UploadSection({ onGenerate }: UploadSectionProps) {
  const [clientName, setClientName] = useState('');
  const [context, setContext] = useState('');
  const [catalogAnalysis, setCatalogAnalysis] = useState<'yes' | 'no' | null>(null);
  const [files, setFiles] = useState<{ raw: File; parsed: FileInput | null; parsing: boolean }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (incoming: File[]) => {
    const newEntries = incoming.map(f => ({ raw: f, parsed: null, parsing: true }));
    setFiles(prev => [...prev, ...newEntries]);

    const parsed = await Promise.all(incoming.map(f => parseAnyFile(f).catch(() => ({
      name: f.name,
      fileType: 'other' as const,
      textContent: `[Could not read: ${f.name}]`,
      sizeKb: Math.round(f.size / 1024),
    }))));

    setFiles(prev => {
      const next = [...prev];
      incoming.forEach((f, i) => {
        const idx = next.findIndex(e => e.raw === f && e.parsing);
        if (idx !== -1) next[idx] = { raw: f, parsed: parsed[i], parsing: false };
      });
      return next;
    });
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) addFiles(dropped);
  };

  const isReady = clientName.trim() && catalogAnalysis !== null && files.length > 0 && files.every(f => !f.parsing);

  const handleGenerate = () => {
    setSubmitted(true);
    if (!isReady) return;
    const parsedFiles = files.map(f => f.parsed!).filter(Boolean);
    const responses: UserResponses = {
      clientName: clientName.trim(),
      context: context.trim() || undefined,
      clientType: 'new',
      catalogAnalysis: catalogAnalysis === 'yes',
    };
    onGenerate(responses, parsedFiles);
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1f36] px-6 py-3.5 flex items-center gap-3 shadow-md sticky top-0 z-30">
        <div className="w-8 h-8 bg-[#26c485] rounded-md flex items-center justify-center flex-shrink-0">
          <Sparkles size={15} className="text-[#1a1f36]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white tracking-wide leading-tight">Learning Strategy Builder</div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Forward Deployed Solutions · Degreed</div>
        </div>
      </header>

      {/* Title */}
      <div className="bg-white border-b border-[#e5e7eb] px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1a1f36] leading-tight">Learning Strategy Builder</h1>
          <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">
            Upload any information you have — reports, presentations, catalogs, strategy docs, screenshots.
            We will analyze everything and generate a prioritized learning strategy.
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full pb-32">
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 space-y-6">

          {/* Client name */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-[0.06em] mb-1.5">
              Client name <span className="text-[#26c485] ml-1">*</span>
            </label>
            <input
              placeholder="e.g. NovaCare Health Systems"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className={cn(
                'w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-[#111827] placeholder-[#9ca3af] transition-all',
                'focus:outline-none focus:ring-2 focus:ring-[#26c485]/20 focus:border-[#26c485]',
                submitted && !clientName.trim() ? 'border-red-400' : 'border-[#e5e7eb] hover:border-[#d1d5db]'
              )}
            />
            {submitted && !clientName.trim() && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                <AlertCircle size={12} /> Client name is required
              </p>
            )}
          </div>

          {/* Catalog analysis toggle */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-[0.06em] mb-1.5">
              Content catalog analysis <span className="text-[#26c485] ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { val: 'no' as const, icon: <BarChart2 size={18} />, title: 'No catalog', desc: 'Analyze uploaded files and enrich with market trends and industry benchmarks.' },
                { val: 'yes' as const, icon: <BookOpen size={18} />, title: 'Include catalog', desc: "Read the client's Degreed catalog to identify gaps, overlaps, and existing coverage." },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setCatalogAnalysis(opt.val)}
                  className={cn(
                    'flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all',
                    catalogAnalysis === opt.val
                      ? 'border-[#26c485] bg-[#f0fdf8]'
                      : 'border-[#e5e7eb] bg-white hover:border-[#d1d5db]'
                  )}
                >
                  <span className={cn('text-sm', catalogAnalysis === opt.val ? 'text-[#059669]' : 'text-[#374151]')}>{opt.icon}</span>
                  <span className={cn('text-sm font-semibold', catalogAnalysis === opt.val ? 'text-[#059669]' : 'text-[#111827]')}>{opt.title}</span>
                  <span className="text-xs text-[#6b7280] leading-snug">{opt.desc}</span>
                </button>
              ))}
            </div>
            {catalogAnalysis === 'no' && (
              <p className="mt-2 text-xs text-[#374151] bg-[#f8fafb] border border-[#e5e7eb] rounded-lg px-3 py-2 leading-relaxed">
                Strategy will be built from your uploaded files and enriched with current market trends, industry benchmarks, and trending skills data.
              </p>
            )}
            {catalogAnalysis === 'yes' && (
              <p className="mt-2 text-xs text-[#065f46] bg-[#f0fdf8] border border-[#6ee7b7] rounded-lg px-3 py-2 leading-relaxed">
                <strong>Include your Degreed catalog export (XLSX or CSV) in the files below.</strong> We'll analyze skill coverage, gaps, overlaps, and pathway opportunities — then layer in market trends.
              </p>
            )}
            {submitted && catalogAnalysis === null && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                <AlertCircle size={12} /> Select a catalog analysis option
              </p>
            )}
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-[0.06em] mb-1.5">
              Upload files <span className="text-[#26c485] ml-1">*</span>
            </label>
            <p className="text-xs text-[#6b7280] mb-3">
              PDFs, PowerPoints, Excel files, CSVs, images, screenshots — any combination. The more context, the richer the strategy.
            </p>

            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-colors',
                dragOver ? 'border-[#26c485] bg-[#f0fdf8]'
                  : submitted && files.length === 0 ? 'border-red-300 bg-red-50'
                  : 'border-[#e5e7eb] bg-[#f8fafb] hover:border-[#d1d5db] hover:bg-white'
              )}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className={cn('mx-auto mb-2', submitted && files.length === 0 ? 'text-red-400' : 'text-[#9ca3af]')} size={22} />
              <p className="text-sm text-[#6b7280]">Drop files here or click to browse</p>
              <p className="text-xs text-[#9ca3af] mt-1">PDF, PPTX, XLSX, CSV, PNG, JPG, DOCX and more</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.pptx,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.webp,.docx,.txt,.md"
                onChange={e => e.target.files && addFiles(Array.from(e.target.files))}
              />
            </div>
            {submitted && files.length === 0 && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                <AlertCircle size={12} /> Upload at least one file
              </p>
            )}

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-[#f8fafb] rounded-lg border border-[#e5e7eb]">
                    <div className="flex-shrink-0">
                      {f.parsing ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#26c485]/30 border-t-[#26c485] rounded-full animate-spin" />
                      ) : (
                        FILE_ICONS[f.parsed?.fileType || 'other']
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#111827] truncate">{f.raw.name}</p>
                      <p className="text-[10px] text-[#9ca3af]">
                        {f.parsing ? 'Reading...' : `${f.parsed?.sizeKb}KB · ${
                          f.parsed?.fileType === 'spreadsheet-data' && f.parsed.rows
                            ? `${f.parsed.rows.length} rows parsed`
                            : f.parsed?.fileType === 'pdf' ? 'PDF ready'
                            : f.parsed?.fileType === 'image' ? 'Image ready'
                            : 'Ready'
                        }`}
                      </p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeFile(i); }} className="text-[#9ca3af] hover:text-[#6b7280] flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional context */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-[0.06em] mb-1.5">
              Additional context <span className="text-[#9ca3af] font-normal normal-case ml-1">optional</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Focus on leadership development for mid-level managers. Client is in financial services with 5,000 employees."
              value={context}
              onChange={e => setContext(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#e5e7eb] bg-white text-[#111827] placeholder-[#9ca3af] resize-none focus:outline-none focus:ring-2 focus:ring-[#26c485]/20 focus:border-[#26c485] hover:border-[#d1d5db] transition-all"
            />
          </div>
        </div>
      </main>

      {/* Sticky footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-6 py-4 flex items-center justify-between z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="text-xs text-[#9ca3af]">
          {isReady
            ? `${files.length} file${files.length > 1 ? 's' : ''} ready · ${clientName}`
            : 'Add a client name and at least one file'}
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="flex items-center gap-2.5 px-6 py-2.5 bg-[#26c485] hover:bg-[#1db070] text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Sparkles size={15} />
          Generate Strategy
        </button>
      </footer>
    </div>
  );
}
