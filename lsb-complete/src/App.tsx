import React, { useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import UploadSection from './components/UploadSection';
import DashboardSection from './components/DashboardSection';
import { StrategyResponse, UserResponses, FileInput } from './types';

type AppView = 'upload' | 'dashboard';

export default function App() {
  const [view, setView] = useState<AppView>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userResponses, setUserResponses] = useState<UserResponses | null>(null);
  const [strategyData, setStrategyData] = useState<StrategyResponse | null>(null);

  const handleGenerate = async (responses: UserResponses, files: FileInput[]) => {
    setUserResponses(responses);
    setIsLoading(true);
    setError(null);

    try {
      // Filter out files that are too large (base64 PDFs/images > 4MB each)
      const safeFiles = files.map(f => {
        if ((f.fileType === 'pdf' || f.fileType === 'image') && f.base64) {
          const sizeBytes = (f.base64.length * 3) / 4;
          if (sizeBytes > 4 * 1024 * 1024) {
            // Too large — send metadata only
            return { ...f, base64: undefined, textContent: `[File too large to include: ${f.name} (${f.sizeKb}KB)]` };
          }
        }
        return f;
      });

      const response = await fetch('/api/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: responses.clientName,
          context: responses.context,
          catalogAnalysis: responses.catalogAnalysis ?? false,
          files: safeFiles,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Analysis failed (HTTP ${response.status})`);
      }

      const data = await response.json();
      setStrategyData(data);
      setView('dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  const restart = () => {
    setView('upload');
    setStrategyData(null);
    setError(null);
    setUserResponses(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1f36] flex flex-col items-center justify-center gap-5">
        <div className="w-11 h-11 rounded-full border-[2.5px] border-[#26c485]/20 border-t-[#26c485] animate-spin" />
        <div className="text-center px-6">
          <div className="text-xl font-bold text-white mb-1">Analysing your files</div>
          <div className="text-sm text-white/50">Claude is reading your data — this usually takes 30–90 seconds.</div>
          <div className="text-xs text-white/30 mt-2">Please keep this tab open.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex flex-col">
        <header className="bg-[#1a1f36] px-6 py-3.5 flex items-center gap-3 shadow-md">
          <div className="w-8 h-8 bg-[#26c485] rounded-md flex items-center justify-center flex-shrink-0">
            <Sparkles size={15} className="text-[#1a1f36]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white tracking-wide leading-tight">Learning Strategy Builder</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Forward Deployed Solutions · Degreed</div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-md w-full bg-white border border-[#e5e7eb] rounded-2xl shadow-sm p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500" size={22} />
            </div>
            <h1 className="text-lg font-bold text-[#1a1f36]">Analysis failed</h1>
            <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">{error}</p>
            <p className="text-xs text-[#9ca3af] mt-2">No fake data is shown — check the error above and try again.</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={restart}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#26c485] hover:bg-[#1db070] text-white text-sm font-semibold rounded-xl transition-all"
              >
                <RotateCcw size={14} /> Try again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {view === 'upload' && <UploadSection onGenerate={handleGenerate} />}
      {view === 'dashboard' && strategyData && (
        <DashboardSection
          data={strategyData}
          clientName={userResponses?.clientName || 'Strategy Output'}
          clientType={userResponses?.clientType}
          responses={userResponses}
          reduced={false}
          onRestart={restart}
        />
      )}
    </div>
  );
}
