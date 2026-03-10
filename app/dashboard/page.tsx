'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Activity, ShieldCheck, FileText, Bot, Loader2, LayoutDashboard, Radar, Terminal, ArrowRight, BarChart2,
  Clock, Settings, CreditCard, LogOut, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10"></div>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 custom-scrollbar">
          <Header />
          <StatsGrid />
          <DataAnalyzer />
          <HistoryTable />
        </div>
      </main>
    </div>
  );
}

function Sidebar() {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Yeni Analiz', active: true },
    { icon: <Clock size={20} />, label: 'Geçmiş' },
    { icon: <CreditCard size={20} />, label: 'Abonelik' },
    { icon: <Settings size={20} />, label: 'Ayarlar' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex-col hidden lg:flex">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-900/20">
             <LayoutDashboard size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            GİRİLİRMİ
          </h1>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item, index) => (
          <button 
            key={index}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              item.active 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800/50">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-900/10 hover:text-rose-400 transition-all">
          <LogOut size={20} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Kontrol Paneli</h2>
        <p className="text-slate-400 text-sm mt-1">Yapay zeka destekli yatırım analizi ve risk yönetimi.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span>Sistem Çevrimiçi</span>
        </div>
        <div className="h-10 w-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
          MK
        </div>
      </div>
    </header>
  );
}

function StatsGrid() {
  const stats = [
    { label: 'Kalan Kredi', value: '850', sub: '/ 1000 Aylık', icon: <Zap size={18} className="text-amber-400" /> },
    { label: 'Analiz Edilen Fikirler', value: '12', sub: 'Bu ay', icon: <LayoutDashboard size={18} className="text-indigo-400" /> },
    { label: 'Ortalama Risk Skoru', value: '6.4', sub: 'Yüksek Risk', icon: <Activity size={18} className="text-rose-400" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
            <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              {stat.icon}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-slate-500 text-xs">{stat.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryTable() {
  const history = [
    { id: 1, idea: 'SaaS Abonelik Yönetimi', date: 'Bugün, 14:30', score: 3.2, status: 'GİRİLİR' },
    { id: 2, idea: 'Yapay Zeka Video Editörü', date: 'Dün, 09:15', score: 8.7, status: 'GİRİLMEZ' },
    { id: 3, idea: 'E-Ticaret Lojistik Platformu', date: '12 Mart', score: 5.5, status: 'RİSKLİ' },
    { id: 4, idea: 'Blockchain Oyunu', date: '10 Mart', score: 9.1, status: 'GİRİLMEZ' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Son Analizler</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
          Tümünü Gör <ChevronRight size={14} />
        </button>
      </div>
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">İş Fikri</th>
                <th className="px-6 py-4 font-medium">Tarih</th>
                <th className="px-6 py-4 font-medium">Risk Skoru</th>
                <th className="px-6 py-4 font-medium">Sonuç</th>
                <th className="px-6 py-4 font-medium text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-300">{item.idea}</td>
                  <td className="px-6 py-4 text-slate-500">{item.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        item.score > 7 ? 'bg-rose-500' : item.score > 4 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></div>
                      <span className={
                        item.score > 7 ? 'text-rose-400' : item.score > 4 ? 'text-amber-400' : 'text-emerald-400'
                      }>{item.score}/10</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      item.status === 'GİRİLİR' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : item.status === 'GİRİLMEZ'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-white transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[500px]">
      {/* Input Section */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col h-full shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Terminal size={16} className="text-indigo-400" />
              Yeni Analiz Başlat
            </h2>
          </div>
          <div className="flex-1 p-6">
            <textarea 
              value={data}
              onChange={e => setData(e.target.value)}
              placeholder="İş fikrinizi, pazar analizinizi veya yatırım detaylarınızı buraya giriniz..."
              className="w-full h-[300px] lg:h-full bg-transparent border-none text-sm text-slate-300 focus:ring-0 outline-none resize-none placeholder:text-slate-600 leading-relaxed font-mono"
            />
          </div>
          <div className="p-6 border-t border-slate-800 bg-slate-900/30">
            <button 
              onClick={analyze}
              disabled={!data.trim() || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              {loading ? 'Yapay Zeka Analiz Ediyor...' : 'Analizi Başlat'}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-7">
        {result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Verdict Card */}
            <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className={`absolute inset-0 opacity-5 transition-colors duration-500 ${
                result.verdict === 'GİRİLİR' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></div>
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
               <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-5">
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
               
               <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-5">
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
          <div className="h-full rounded-xl border border-dashed border-slate-800 bg-slate-900/20 flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-sm">
               <Bot size={32} className="text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-medium mb-2">Analiz Bekleniyor</h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
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
    <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-6 shadow-sm hover:border-slate-700 transition-colors">
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
