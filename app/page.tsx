import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10"></div>
      
      {/* Header */}
      <header className="container mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-900/20">
             <Terminal size={20} strokeWidth={2.5} />
           </div>
           <span className="font-bold text-xl text-white tracking-tight">GİRİLİRMİ</span>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
          Giriş Yap
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Yapay Zeka Destekli Analiz Motoru
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Hayallerinle Değil, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Verilerle Yüzleş.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Kod yazmaya başlamadan önce fikrinin birim ekonomisini ve pazar doygunluğunu test et. 
          Top %1 seviyesindeki acımasız yapay zeka analisti ile gerçekleri öğren.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-white text-slate-950 font-bold rounded-full hover:bg-slate-200 transition-all flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95"
          >
            Hemen Test Et <ArrowRight size={18} />
          </Link>
          
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-slate-900 text-white font-medium rounded-full border border-slate-800 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            Giriş Yap / Kayıt Ol
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-slate-600 text-sm">
        <p>&copy; 2024 Girilirmi AI. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}