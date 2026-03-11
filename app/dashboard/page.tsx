'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Zap, Activity, ShieldCheck, FileText, Bot, Loader2, LayoutDashboard, Radar, Terminal, ArrowRight, BarChart2,
  Clock, Settings, CreditCard, LogOut, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Auth Check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email || null);
        setUserId(session.user.id);
        
        // Fetch Credits
        const { data: profileData } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', session.user.id)
          .single();
        if (profileData) setCredits(profileData.credits);

        // Fetch History
        const { data: historyData } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if (historyData) setHistory(historyData);
      }
    };
    
    checkUser();
  }, [router]);

  // Helper functions for refreshing data
  const refreshData = async (uid: string) => {
    // Fetch Credits
    const { data: profileData } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', uid)
      .single();
    if (profileData) setCredits(profileData.credits);

    // Fetch History
    const { data: historyData } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (historyData) setHistory(historyData);
  };

  if (!mounted) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

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
        
        {userEmail && (
          <div className="mb-6 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Giriş Yapıldı</div>
            <div className="text-xs text-white truncate font-mono">{userEmail}</div>
          </div>
        )}

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar">
          <div 
            onClick={() => setSelectedAnalysis(null)}
            className={`bg-white/10 text-white font-medium px-4 py-2.5 rounded-lg border border-white/10 shadow-sm transition-all cursor-pointer flex items-center gap-3 ${selectedAnalysis === null ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : ''}`}
          >
            <LayoutDashboard size={18} /> Yeni Analiz
          </div>
          
          <div className="mt-4 mb-2 px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Geçmiş Analizler</div>
          
          {history.length > 0 ? (
            history.map((analysis) => (
              <div 
                key={analysis.id}
                onClick={() => setSelectedAnalysis(analysis.result)}
                className={`text-zinc-400 hover:text-white hover:bg-white/5 px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-3 text-sm truncate ${selectedAnalysis === analysis.result ? 'bg-white/5 text-white' : ''}`}
              >
                <Clock size={14} className="flex-shrink-0" />
                <span className="truncate">{analysis.idea_text?.substring(0, 20) || 'Analiz'}...</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-xs text-zinc-600 italic">Henüz analiz yok.</div>
          )}

          <div className="mt-auto pt-4 border-t border-white/5">
             <div className="text-zinc-500 hover:text-zinc-300 hover:bg-white/5 px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-3">
              <CreditCard size={18} /> Krediler
            </div>
          </div>
        </nav>
        
        <div 
          onClick={handleLogout}
          className="mt-4 text-zinc-600 hover:text-red-400 text-sm font-medium transition-all cursor-pointer px-4 flex items-center gap-2"
        >
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
              <div className="text-3xl font-light text-white">
                {credits !== null ? credits : '-'} <span className="text-sm text-zinc-500">/ 5</span>
              </div>
           </div>
           <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                <LayoutDashboard size={14} className="text-indigo-500" /> Toplam Analiz
              </div>
              <div className="text-3xl font-light text-white">{history.length}</div>
           </div>
           <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 blur-2xl"></div>
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Activity size={14} className="text-red-500" /> Risk Ortalaması
              </div>
              <div className="text-3xl font-light text-red-400">
                {history.length > 0 
                  ? (history.reduce((acc, curr) => acc + (curr.result?.risk_score || 0), 0) / history.length).toFixed(1)
                  : '-'}
              </div>
           </div>
        </div>

        {/* DATA ANALYZER COMPONENT INTEGRATION */}
        <DataAnalyzer 
          credits={credits} 
          userId={userId} 
          onSuccess={() => userId && refreshData(userId)}
          setCredits={setCredits}
          initialResult={selectedAnalysis}
        />

      </main>
    </div>
  );
}

interface AnalysisResult {
  board_opinions: {
    investor: string;
    growth_hacker: string;
    lawyer: string;
  };
  financials: {
    estimated_cac: string;
    break_even_months: string;
    year_1_revenue: string;
  };
  verdict: string;
}

function DataAnalyzer({ credits, userId, onSuccess, initialResult, setCredits }: { credits: number | null, userId: string | null, onSuccess: () => void, initialResult: AnalysisResult | null, setCredits: React.Dispatch<React.SetStateAction<number | null>> }) {
  const [data, setData] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync result when initialResult changes (e.g. from sidebar history click)
  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
    } else {
      // Reset if "New Analysis" is clicked
      setResult(null);
      setData('');
    }
  }, [initialResult]);

  const analyze = async () => {
    if (!data.trim()) return;
    
    // AI Hallucination Fix: Minimum Length Check
    if (data.trim().length < 20) {
      toast.error('Lütfen analiz edilebilecek detaylı bir iş fikri giriniz. (En az 20 karakter)');
      return;
    }
    
    // Client-side credit check
    if (credits !== null && credits <= 0) {
      toast.error('Krediniz bitti. Devam etmek için paket satın alın.');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      // 1. Run Analysis
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
      
      // 2. Save Analysis & Deduct Credit
      if (userId) {
        // Save to analyses table
        const { error: insertError } = await supabase.from('analyses').insert({
          user_id: userId,
          idea_text: data,
          result: json,
        });
        
        if (insertError) {
          console.error('Error saving analysis:', insertError);
          toast.error('Analiz kaydedilemedi.');
        }

        // Fix Credit Leak: Manual Update
        const { error: creditError } = await supabase
          .from('profiles')
          .update({ credits: (credits || 0) - 1 })
          .eq('id', userId);
          
        if (creditError) {
           console.error('Error deducting credit:', creditError);
        } else {
           // Update local state immediately
           setCredits((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
           toast.success('1 Kredi kullanıldı.');
           onSuccess(); 
        }
      }

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
              disabled={!!initialResult} // Disable editing if viewing history
            />
          </div>
          <div className="p-6 border-t border-white/5 bg-white/[0.02]">
            {initialResult ? (
              <button 
                onClick={() => {
                   // This is a bit of a hack to "reset" the view, but better handled by parent state
                   // In this simple version, clicking "Yeni Analiz" in sidebar is the way.
                   toast.info("Yeni analiz yapmak için sol menüden 'Yeni Analiz'e tıklayın.");
                }}
                className="w-full bg-white/5 text-zinc-400 font-medium py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Clock size={18} /> Geçmiş Analiz Görüntüleniyor
              </button>
            ) : (
              credits !== null && credits <= 0 ? (
                 <button 
                   disabled
                   className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                 >
                   <Zap size={18} /> Krediniz Bitti - Paket Alın
                 </button>
              ) : (
                <button 
                  onClick={analyze}
                  disabled={!data.trim() || loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                  {loading ? 'Yapay Zeka Analiz Ediyor... (1 Kredi)' : 'Analizi Başlat (1 Kredi)'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="h-full">
        {loading ? (
           <div className="h-full rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center p-12 space-y-4">
             <Loader2 className="animate-spin text-indigo-500" size={48} />
             <p className="text-zinc-400 animate-pulse">Veriler işleniyor, lütfen bekleyin...</p>
           </div>
        ) : result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto custom-scrollbar pr-2">
            {/* Verdict Hero */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md relative overflow-hidden group">
              <div className={`absolute inset-0 opacity-10 transition-colors duration-500 ${
                result.verdict.toLowerCase().includes('evet') ? 'bg-emerald-500' : 'bg-red-500'
              }`}></div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight relative z-10">
                {result.verdict}
              </h2>
            </div>

            {/* Financial Projections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FinancialCard label="Tahmini CAC" value={result.financials.estimated_cac} />
               <FinancialCard label="Başabaş Noktası" value={result.financials.break_even_months} />
               <FinancialCard label="1. Yıl Ciro Tahmini" value={result.financials.year_1_revenue} />
            </div>

            {/* Board Opinions */}
            <div className="grid grid-cols-1 gap-6">
              <BoardCard 
                role="Melek Yatırımcı" 
                content={result.board_opinions.investor}
                color="border-rose-500/30"
                icon={<Activity className="text-rose-400" />}
              />
              <BoardCard 
                role="Growth Hacker" 
                content={result.board_opinions.growth_hacker}
                color="border-emerald-500/30"
                icon={<Zap className="text-emerald-400" />}
              />
              <BoardCard 
                role="Şirket Avukatı" 
                content={result.board_opinions.lawyer}
                color="border-blue-500/30"
                icon={<ShieldCheck className="text-blue-400" />}
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
              Yapay Zeka Yönetim Kurulu hazır. Sol panelden iş fikrinizi girerek toplantıyı başlatın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FinancialCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
      <div className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function BoardCard({ role, content, color, icon }: { role: string, content: string, color: string, icon: React.ReactNode }) {
  return (
    <div className={`bg-white/[0.02] rounded-xl border ${color} p-6 relative overflow-hidden`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <h3 className="text-lg font-bold text-zinc-200">{role}</h3>
      </div>
      <p className="text-zinc-400 text-sm leading-7">
        "{content}"
      </p>
    </div>
  );
}