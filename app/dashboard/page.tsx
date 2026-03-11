'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Zap, Activity, ShieldCheck, FileText, Bot, Loader2, LayoutDashboard, Radar, Terminal, ArrowRight, BarChart2,
  Clock, Settings, CreditCard, LogOut, ChevronRight, Sparkles, PieChart, Users, Download
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const ResultCard = ({ title, icon, content }: { title: string, icon: React.ReactNode, content: string }) => (
  <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-6 shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
    </div>
    <div className="text-zinc-400 text-sm leading-7 prose prose-invert prose-sm max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  </div>
);

// Dashboard Component
export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'analiz' | 'finans' | 'kurul' | 'pdf'>('analiz');
  const [financeInput, setFinanceInput] = useState('');
  const [isFinanceLoading, setIsFinanceLoading] = useState(false);
  const [financeResult, setFinanceResult] = useState<any | null>(null);
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

  const handleFinanceAnalyze = async () => {
    if (financeInput.length <= 20) {
      toast.error('Lütfen en az 20 karakterlik detaylı bir iş fikri girin.');
      return;
    }

    if (credits !== null && credits < 2) {
      toast.error('Yetersiz kredi! Finansal analiz 2 kredi gerektirir.');
      return;
    }

    setIsFinanceLoading(true);
    setFinanceResult(null);

    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: financeInput }),
      });

      if (!response.ok) throw new Error('Finansal analiz başarısız.');

      const json = await response.json();
      setFinanceResult(json);

      if (userId) {
        // Deduct 2 credits
        const { error: creditError } = await supabase
          .from('profiles')
          .update({ credits: (credits || 0) - 2 })
          .eq('id', userId);

        if (creditError) {
          console.error('Error deducting credit:', creditError);
        } else {
          setCredits((prev) => (prev !== null && prev >= 2 ? prev - 2 : prev));
          toast.success('Finansal model oluşturuldu! (2 Kredi)');
          
          // Optional: Save to analyses table with a type if needed, 
          // or just let it be ephemeral for now as per instructions.
          // Saving it as a regular analysis for history tracking:
          await supabase.from('analyses').insert({
            user_id: userId,
            idea_text: `[FINANCE] ${financeInput}`,
            result: { ...json, type: 'finance' }, // Storing finance result in the JSONB column
          });
          
          refreshData(userId);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Analiz sırasında bir hata oluştu.');
    } finally {
      setIsFinanceLoading(false);
    }
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
          <div className="space-y-2 mt-6"> 
             <button onClick={() => setActiveTab('analiz')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analiz' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}> 
               <LayoutDashboard size={18} /> <span className="font-medium text-sm">Hızlı Analiz</span> 
             </button> 
             <button onClick={() => setActiveTab('finans')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'finans' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}> 
               <PieChart size={18} /> <span className="font-medium text-sm">Finansal Simülatör</span> 
             </button> 
             <button onClick={() => setActiveTab('kurul')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'kurul' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}> 
               <Users size={18} /> <span className="font-medium text-sm">Yönetim Kurulu Paneli</span> 
             </button> 
             <button onClick={() => setActiveTab('pdf')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pdf' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}> 
               <Download size={18} /> <span className="font-medium text-sm">Pitch Deck (PDF)</span> 
             </button> 
           </div>

          <div className="mt-8 mb-2 px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Geçmiş Analizler</div>
          
          {history.length > 0 ? (
            history.map((analysis) => (
              <div 
                key={analysis.id}
                onClick={() => {
                  setSelectedAnalysis(analysis.result);
                  setActiveTab('analiz'); // Switch to main tab to view result
                }}
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

        {activeTab === 'analiz' && (
          /* DATA ANALYZER COMPONENT INTEGRATION */
          <DataAnalyzer 
            credits={credits} 
            userId={userId} 
            onSuccess={() => userId && refreshData(userId)}
            setCredits={setCredits}
            initialResult={selectedAnalysis}
          />
        )}

        {activeTab === 'finans' && (
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><PieChart className="text-indigo-400"/> Finansal Simülatör</h2>
              <p className="text-gray-400 text-sm mb-4">İş fikrinizi detaylıca anlatın. CFO yapay zeka motoru 1 yıllık maliyet, CAC ve ciro tablonuzu çıkarsın.</p>
              <textarea 
                value={financeInput} 
                onChange={(e) => setFinanceInput(e.target.value)} 
                placeholder="Örn: B2B firmalar için yapay zeka destekli ön muhasebe yazılımı (SaaS)..." 
                className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors mb-4"
              />
              <button 
                onClick={handleFinanceAnalyze} 
                disabled={isFinanceLoading || !financeInput} 
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                {isFinanceLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16}/> Hesaplanıyor...
                  </>
                ) : (
                  <>
                    <Zap size={16}/> Finansal Model Çıkar (2 Kredi)
                  </>
                )}
              </button>
            </div>

            {financeResult && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="text-emerald-400" /> CFO Özeti
                  </h3>
                  <p className="text-zinc-300 italic text-lg leading-relaxed border-l-4 border-indigo-500 pl-4">
                    "{financeResult.financial_summary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FinancialCard label="Başlangıç Sermayesi" value={financeResult.initial_investment} />
                  <FinancialCard label="Aylık Yakım Hızı" value={financeResult.monthly_burn_rate} />
                  <FinancialCard label="Müşteri Edinme Maliyeti (CAC)" value={financeResult.estimated_cac} />
                  <FinancialCard label="Başabaş Noktası" value={financeResult.break_even_months} />
                  <FinancialCard label="1. Yıl Ciro Tahmini" value={financeResult.year_1_revenue} />
                  <FinancialCard label="Kar Marjı" value={financeResult.profit_margin} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'kurul' && (
          <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <div className="text-center">
              <Users size={48} className="mx-auto text-zinc-600 mb-4" />
              <h3 className="text-xl font-bold text-zinc-300">Yönetim Kurulu Paneli</h3>
              <p className="text-zinc-500 mt-2">Bu modül yakında hizmetinizde olacak.</p>
            </div>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <div className="text-center">
              <Download size={48} className="mx-auto text-zinc-600 mb-4" />
              <h3 className="text-xl font-bold text-zinc-300">Pitch Deck Oluşturucu</h3>
              <p className="text-zinc-500 mt-2">Bu modül yakında hizmetinizde olacak.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

interface AnalysisResult {
  verdict: string;
  risk_score: number;
  opportunity_cost: string;
  survival_plan: string;
  detailed_analysis: string;
  market_saturation?: string;
  local_competitor_radar?: string;
  case_study?: string;
  // Optional fields for the Tier 2 deep dive:
  board_opinions?: {
    investor: string;
    growth_hacker: string;
    lawyer: string;
  };
  financials?: {
    estimated_cac: string;
    break_even_months: string;
    year_1_revenue: string;
  };
}

function DataAnalyzer({ credits, userId, onSuccess, initialResult, setCredits }: { credits: number | null, userId: string | null, onSuccess: () => void, initialResult: AnalysisResult | null, setCredits: React.Dispatch<React.SetStateAction<number | null>> }) {
  const [data, setData] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tier2Unlocked, setTier2Unlocked] = useState(false);

  // Sync result when initialResult changes (e.g. from sidebar history click)
  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
      // Automatically unlock if it's history (optional, or force unlock if history shows it?)
      // For now, let's keep it locked unless paid again, or maybe check if user already paid for this specific analysis?
      // Since we don't track "paid tier" per analysis in DB yet, we'll reset to locked.
      setTier2Unlocked(false);
    } else {
      // Reset if "New Analysis" is clicked
      setResult(null);
      setData('');
      setTier2Unlocked(false);
    }
  }, [initialResult]);

  const handleUnlock = async () => {
    if (credits !== null && credits < 2) {
      toast.error('Yetersiz kredi! Derinlemesine analiz için 2 krediye ihtiyacınız var.');
      return;
    }

    if (userId) {
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: (credits || 0) - 2 })
        .eq('id', userId);
        
      if (creditError) {
         console.error('Error deducting credit:', creditError);
         toast.error('Kredi düşülürken hata oluştu.');
      } else {
         setCredits((prev) => (prev !== null && prev >= 2 ? prev - 2 : prev));
         toast.success('Analiz derinleştirildi! (2 Kredi)');
         setTier2Unlocked(true);
         onSuccess(); 
      }
    }
  };

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
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Risk Skoru</span>
                <span className={`text-2xl font-bold ${
                  result.risk_score > 7 ? 'text-rose-400' : result.risk_score > 4 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {result.risk_score}/10
                </span>
              </div>
            </div>

            {/* Basic Analysis Details */}
            <div className="grid grid-cols-1 gap-4">
              <ResultCard 
                title="Stratejik Detaylı Analiz" 
                icon={<FileText size={16} className="text-indigo-400" />}
                content={result.detailed_analysis}
              />
              
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

            {/* TIER 2 UPSELL SECTION */}
            <div className="mt-8 border-t border-white/10 pt-8">
              {!tier2Unlocked ? (
                <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-8 text-center relative overflow-hidden group hover:border-indigo-500/40 transition-all cursor-pointer"
                     onClick={handleUnlock}
                >
                  <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                      <Sparkles size={24} className="text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Derinlemesine Finans & Kurul Kararı</h3>
                    <p className="text-zinc-400 max-w-md mx-auto text-sm">
                      Yapay zeka yönetim kurulu (Yatırımcı, Growth Hacker, Avukat) ve detaylı finansal projeksiyonlar (CAC, Ciro) için kilidi açın.
                    </p>
                    <button className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95">
                      <Bot size={18} />
                      Analizi Derinleştir (Ekstra 2 Kredi)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-indigo-400" size={20} />
                    <h3 className="text-lg font-bold text-white">Premium Analiz Raporu</h3>
                  </div>

                  {/* Financial Projections */}
                  {result.financials && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <FinancialCard label="Tahmini CAC" value={result.financials.estimated_cac} />
                       <FinancialCard label="Başabaş Noktası" value={result.financials.break_even_months} />
                       <FinancialCard label="1. Yıl Ciro Tahmini" value={result.financials.year_1_revenue} />
                    </div>
                  )}

                  {/* Board Opinions */}
                  {result.board_opinions && (
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
                  )}
                </div>
              )}
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