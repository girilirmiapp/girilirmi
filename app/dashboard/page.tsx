'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Activity, ShieldCheck, FileText, Bot, Loader2, LayoutDashboard, Radar, Terminal, ArrowRight, BarChart2
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-900/20">
               <LayoutDashboard size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                GİRİLİRMİ <span className="text-slate-500 text-sm font-medium px-2 py-0.5 bg-slate-900 rounded-full border border-slate-800">Beta</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
             <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
             <span>Sistem Aktif</span>
          </div>
        </header>

        <DataAnalyzer />
      </div>
    </div>
  );
}

interface AnalysisResult {
  verdict: "GİRİLİR" | "GİRİLMEZ";
  risk_score: number;
  opportunity_cost: string;
  survival_plan: string;
  detailed_analysis: string;
  market_saturation?: string;
  local_competitor_radar?: string;
}

function DataAnalyzer() {
  const [data, setData] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!data.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data }),
      });

      if (!response.ok) {
        throw new Error('Analiz başarısız oldu.');
      }

      const json = await response.json();
      setResult(json);
      toast.success('Analiz tamamlandı');
    } catch (error) {
      toast.error('Sistem hatası. Tekrar deneyin.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-1">
          <div className="bg-slate-950 rounded-xl border border-slate-800/50 overflow-hidden flex flex-col h-[600px] shadow-sm">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Terminal size={16} className="text-indigo-400" />
                Ham Veri Girişi
              </h2>
            </div>
            <div className="flex-1 p-6">
              <textarea 
                value={data}
                onChange={e => setData(e.target.value)}
                placeholder="İş fikrinizi, pazar analizinizi veya yatırım detaylarınızı buraya giriniz..."
                className="w-full h-full bg-transparent border-none text-sm text-slate-300 focus:ring-0 outline-none resize-none placeholder:text-slate-600 leading-relaxed"
              />
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-900/20">
              <button 
                onClick={analyze}
                disabled={!data.trim() || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                {loading ? 'Analiz Ediliyor...' : 'Analizi Başlat'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-7 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Verdict Card */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Yapay Zeka Kararı</span>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${
                    result.verdict === 'GİRİLİR' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {result.verdict}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Skoru</span>
                <div className="flex items-baseline justify-end gap-1 mt-1">
                  <span className={`text-3xl font-bold ${
                    result.risk_score > 7 ? 'text-rose-400' : result.risk_score > 4 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {result.risk_score}
                  </span>
                  <span className="text-slate-600 text-sm font-medium">/10</span>
                </div>
              </div>
            </div>

            {/* Market Saturation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 size={16} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pazar Doygunluğu</h3>
                  </div>
                  <div className={`text-lg font-bold ${
                      result.market_saturation === 'Yüksek' ? 'text-rose-400' : 
                      result.market_saturation === 'Orta' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                    {result.market_saturation || 'Belirsiz'}
                  </div>
               </div>
               
               <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Radar size={16} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Rekabet Radarı</h3>
                  </div>
                  <div className="text-sm text-slate-300 font-medium leading-relaxed">
                    {result.local_competitor_radar || 'Veri yok'}
                  </div>
               </div>
            </div>

            {/* Analysis Details */}
            <div className="grid grid-cols-1 gap-4">
              <ResultCard 
                title="Fırsat Maliyeti" 
                icon={<Activity size={16} className="text-rose-400" />}
                content={result.opportunity_cost}
              />
              <ResultCard 
                title="Hayatta Kalma Planı" 
                icon={<ShieldCheck size={16} className="text-emerald-400" />}
                content={result.survival_plan}
              />
              <ResultCard 
                title="Stratejik Detaylı Analiz" 
                icon={<FileText size={16} className="text-indigo-400" />}
                content={result.detailed_analysis}
              />
            </div>

          </div>
        ) : (
          <div className="h-full rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-sm">
               <Bot size={32} className="text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-medium mb-2">Sistem Hazır</h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              Analiz motorunu başlatmak için sol panelden veri girişi yapın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ title, icon, content }: { title: string, icon: React.ReactNode, content: string }) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      </div>
      <p className="text-slate-400 text-sm leading-7">
        {content}
      </p>
    </div>
  );
}
