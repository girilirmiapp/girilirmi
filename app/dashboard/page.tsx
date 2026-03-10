'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Activity, ShieldCheck, FileText, Bot, Loader2, LayoutDashboard, Radar, Terminal
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-white/20">
      <div className="max-w-[1800px] mx-auto p-4 lg:p-8">
        <header className="mb-8 border-b border-gray-800 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white text-black p-2 rounded-sm">
               <LayoutDashboard size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                GİRİLİRMİ <span className="text-gray-600 text-sm font-normal font-mono px-2 py-0.5 bg-gray-900 rounded-sm border border-gray-800">PRO TERMINAL v2.1</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-sm border border-gray-800">
             <div className="flex gap-1.5">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
             </div>
             <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">System Operational</span>
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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Input Section */}
      <div className="xl:col-span-4 flex flex-col h-[calc(100vh-180px)] min-h-[600px]">
        <div className="flex-1 rounded-sm border border-gray-800 bg-[#0a0a0a] flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-[#111] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-gray-500" />
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Input Stream</span>
            </div>
          </div>
          <div className="flex-1 p-4 relative group">
            <textarea 
              value={data}
              onChange={e => setData(e.target.value)}
              placeholder="// Girişim fikri, pazar analizi veya yatırım detaylarını buraya giriniz..."
              className="w-full h-full bg-transparent border-none text-sm font-mono text-gray-300 focus:ring-0 outline-none resize-none placeholder:text-gray-800 leading-relaxed"
            />
          </div>
          <div className="p-4 border-t border-gray-800 bg-[#111]">
            <button 
              onClick={analyze}
              disabled={!data.trim() || loading}
              className="w-full bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed py-3.5 px-4 rounded-sm text-xs font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
              {loading ? 'Processing Data...' : 'Run Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="xl:col-span-8 h-[calc(100vh-180px)] min-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {result ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Verdict */}
               <div className="rounded-sm border border-gray-800 bg-[#0a0a0a] p-5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gray-700 transition-colors">
                  <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${result.verdict === 'GİRİLİR' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <Activity size={64} />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Algorithmic Verdict</span>
                  <div className={`text-4xl font-black tracking-tighter mt-1 ${result.verdict === 'GİRİLİR' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {result.verdict}
                  </div>
               </div>
               
               {/* Risk Score */}
               <div className="rounded-sm border border-gray-800 bg-[#0a0a0a] p-5 flex flex-col justify-between h-32 hover:border-gray-700 transition-colors">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Risk Index</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-5xl font-mono font-medium ${result.risk_score > 7 ? 'text-rose-500' : result.risk_score > 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {result.risk_score}
                    </span>
                    <span className="text-gray-600 font-mono text-sm">/10</span>
                  </div>
               </div>

               {/* Market Saturation */}
               <div className="rounded-sm border border-gray-800 bg-[#0a0a0a] p-5 flex flex-col justify-between h-32 hover:border-gray-700 transition-colors">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Market Saturation</span>
                  <div className={`text-2xl font-bold mt-1 ${
                      result.market_saturation === 'Yüksek' ? 'text-rose-500' : 
                      result.market_saturation === 'Orta' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                    {result.market_saturation || 'N/A'}
                  </div>
               </div>
            </div>

            {/* Detailed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard 
                title="Opportunity Cost" 
                icon={<Activity size={14} className="text-rose-400" />}
                content={result.opportunity_cost}
              />
              <ResultCard 
                title="Survival Protocol" 
                icon={<ShieldCheck size={14} className="text-emerald-400" />}
                content={result.survival_plan}
              />
            </div>

            <ResultCard 
              title="Strategic Deep Dive" 
              icon={<FileText size={14} className="text-blue-400" />}
              content={result.detailed_analysis}
              fullWidth
            />

            <ResultCard 
               title="Local Competitor Radar"
               icon={<Radar size={14} className="text-amber-400" />}
               content={result.local_competitor_radar || "No data available."}
            />

          </div>
        ) : (
          <div className="h-full rounded-sm border border-dashed border-gray-800 bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 rounded-full bg-[#111] flex items-center justify-center mb-6 border border-gray-800">
               <Bot size={32} className="text-gray-600" />
            </div>
            <h3 className="text-gray-300 font-medium mb-2 font-mono uppercase tracking-widest">System Idle</h3>
            <p className="text-gray-600 text-xs font-mono max-w-sm">
              Waiting for data stream. Initialize analysis via the Input Stream terminal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ title, icon, content, fullWidth }: { title: string, icon: React.ReactNode, content: string, fullWidth?: boolean }) {
  return (
    <div className={`rounded-sm border border-gray-800 bg-[#0a0a0a] overflow-hidden hover:border-gray-700 transition-colors ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="bg-[#111] px-4 py-3 border-b border-gray-800 flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="p-6">
        <p className="text-gray-300 text-sm leading-7 font-sans">
          {content}
        </p>
      </div>
    </div>
  );
}
