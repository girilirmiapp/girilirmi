'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, Activity, ShieldCheck, FileText, Bot, Loader2, LayoutDashboard, Radar, Terminal, ArrowRight, BarChart2,
  Clock, Settings, CreditCard, LogOut, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-indigo-500/30 overflow-hidden antialiased tracking-tight relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* LEFT SIDEBAR - GLASSMORPHISM */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-white/[0.02] backdrop-blur-2xl flex flex-col p-6 z-10 hidden lg:flex">
        <div className="text-2xl font-black tracking-tighter mb-10 text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm">G</div>
          GİRİLİRMİ
        </div>
        <nav className="flex flex-col gap-2">
          <div className="bg-white/10 text-white font-medium px-4 py-2.5 rounded-lg border border-white/10 shadow-sm transition-all cursor-pointer flex items-center gap-3">
            <LayoutDashboard size={18} /> Yeni Analiz
          </div>
          <div className="text-zinc-500 hover:text-zinc-300 hover:bg-white/5 px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-3">
            <Clock size={18} /> Geçmiş Analizler
          </div>
          <div className="text-zinc-500 hover:text-zinc-300 hover:bg-white/5 px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-3">
            <CreditCard size={18} /> Krediler
          </div>
        </nav>
        <div className="mt-auto text-zinc-600 hover:text-red-400 text-sm font-medium transition-all cursor-pointer px-4 flex items-center gap-2">
          <LogOut size={16} /> Çıkış Yap
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto z-10 custom-scrollbar">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Kalan Kredi
              </div>
              <div className="text-3xl font-light text-white">3 <span className="text-sm text-zinc-500">/ 5</span></div>
           </div>
           <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                <LayoutDashboard size={14} className="text-indigo-500" /> Toplam Analiz
              </div>
              <div className="text-3xl font-light text-white">12</div>
           </div>
           <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 blur-2xl"></div>
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Activity size={14} className="text-red-500" /> Risk Ortalaması
              </div>
              <div className="text-3xl font-light text-red-400">7.4</div>
           </div>
        </div>

        {/* DATA ANALYZER COMPONENT INTEGRATION */}
        <DataAnalyzer />

      </main>
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
  case_study?: string;
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
      {/* Input Section */}
      <div className="flex flex-col">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col h-full shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Terminal size={16} className="text-indigo-400" />
              Ham Veri Girişi
            </h2>
          </div>
          <div className="flex-1 p-6">
            <textarea 
              value={data}
              onChange={e => setData(e.target.value)}
              placeholder="İş fikrinizi, pazar analizinizi veya yatırım detaylarınızı buraya giriniz..."
              className="w-full h-[300px] lg:h-full bg-transparent border-none text-sm text-zinc-300 focus:ring-0 outline-none resize-none placeholder:text-zinc-600 leading-relaxed font-mono"
            />
          </div>
          <div className="p-6 border-t border-white/5 bg-white/[0.02]">
            <button 
              onClick={analyze}
              disabled={!data.trim() || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              {loading ? 'Yapay Zeka Analiz Ediyor...' : 'Analizi Başlat'}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="h-full">
        {result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto custom-scrollbar pr-2">
            {/* Verdict Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300 relative overflow-hidden group">
              <div className={`absolute inset-0 opacity-5 transition-colors duration-500 ${
                result.verdict === 'GİRİLİR' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></div>
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Yapay Zeka Kararı</span>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase ${
                    result.verdict === 'GİRİLİR' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {result.verdict}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Risk Skoru</span>
                <div className="flex items-baseline justify-end gap-1 mt-1">
                  <span className={`text-3xl font-bold ${
                    result.risk_score > 7 ? 'text-rose-400' : result.risk_score > 4 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {result.risk_score}
                  </span>
                  <span className="text-zinc-600 text-sm font-medium">/10</span>
                </div>
              </div>
            </div>

            {/* Market Saturation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 size={16} className="text-zinc-400" />
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Pazar Doygunluğu</h3>
                  </div>
                  <div className={`text-lg font-bold ${
                      result.market_saturation === 'Yüksek' ? 'text-rose-400' : 
                      result.market_saturation === 'Orta' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                    {result.market_saturation || 'Belirsiz'}
                  </div>
               </div>
               
               <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Radar size={16} className="text-zinc-400" />
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Rekabet Radarı</h3>
                  </div>
                  <div className="text-sm text-zinc-300 font-medium leading-relaxed">
                    {result.local_competitor_radar || 'Veri yok'}
                  </div>
               </div>
            </div>

            {/* Analysis Details */}
            <div className="grid grid-cols-1 gap-4">
              <ResultCard 
                title="Stratejik Detaylı Analiz" 
                icon={<FileText size={16} className="text-indigo-400" />}
                content={result.detailed_analysis}
              />
              
              {result.case_study && (
                <div className="bg-white/[0.03] rounded-2xl border border-indigo-500/20 p-6 shadow-2xl backdrop-blur-md hover:border-indigo-500/40 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                      <Bot size={16} className="text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-indigo-300">AI Vaka Analizi (Case Study)</h3>
                  </div>
                  <p className="text-zinc-300 text-sm leading-7 relative z-10 italic">
                    "{result.case_study}"
                  </p>
                </div>
              )}

              <ResultCard 
                title="Fırsat Maliyeti" 
                icon={<Activity size={16} className="text-rose-400" />}
                content={result.opportunity_cost}
              />
              <ResultCard 
                title="Hayatta Kalma Planı (İlk 30 Gün)" 
                icon={<ShieldCheck size={16} className="text-emerald-400" />}
                content={result.survival_plan}
              />
            </div>

          </div>
        ) : (
          <div className="h-full rounded-2xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 shadow-sm">
               <Bot size={32} className="text-zinc-600" />
            </div>
            <h3 className="text-zinc-300 font-medium mb-2">Analiz Bekleniyor</h3>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              Yapay zeka motoru hazır. Sol panelden verilerinizi girerek analizi başlatın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ title, icon, content }: { title: string, icon: React.ReactNode, content: string }) {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-6 shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
      </div>
      <p className="text-zinc-400 text-sm leading-7">
        {content}
      </p>
    </div>
  );
}