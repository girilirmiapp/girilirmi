import Link from 'next/link';
import { ArrowRight, Terminal, BarChart2, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10"></div>
      
      {/* Header */}
      <header className="container mx-auto px-6 py-8 flex items-center justify-between relative z-10">
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
      <main className="flex-col items-center justify-center text-center px-6 relative overflow-hidden pt-20 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Yapay Zeka Destekli Analiz Motoru
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Hayallerinle Değil, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Verilerle Yüzleş.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Kod yazmaya başlamadan önce fikrinin birim ekonomisini ve pazar doygunluğunu test et. 
          Top %1 seviyesindeki acımasız yapay zeka analisti ile gerçekleri öğren.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 mb-20">
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

        {/* 1. App Showcase Mockup */}
        <div className="w-full max-w-5xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="relative rounded-xl border border-slate-800 bg-[#0B0F19]/80 backdrop-blur-sm shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            <div className="h-10 border-b border-slate-800/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
            </div>
            <div className="h-96 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
              {/* Abstract Dashboard Lines */}
              <div className="w-full h-full p-8 grid grid-cols-12 gap-6 opacity-40 scale-95 group-hover:scale-100 transition-transform duration-700">
                <div className="col-span-3 h-full bg-slate-800/20 rounded-lg border border-slate-800/50"></div>
                <div className="col-span-9 h-full flex flex-col gap-6">
                   <div className="h-1/3 w-full bg-slate-800/20 rounded-lg border border-slate-800/50 flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-pulse"></div>
                   </div>
                   <div className="h-2/3 w-full grid grid-cols-2 gap-6">
                      <div className="bg-slate-800/20 rounded-lg border border-slate-800/50"></div>
                      <div className="bg-slate-800/20 rounded-lg border border-slate-800/50"></div>
                   </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 text-sm font-mono backdrop-blur-md">
                   [Dashboard Arayüzü Canlı Önizleme]
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Social Proof Banner */}
        <div className="mt-20 mb-24 flex flex-col items-center gap-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Şu ana kadar <span className="text-slate-300 font-bold">10,000+</span> iş fikri acımasızca test edildi.
          </p>
        </div>

        {/* 3. Bento Grid / Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto gap-6 mb-32 px-4">
          <FeatureCard 
            title="Kognitif Pazar Simülasyonu"
            text="Hedef lokasyonunuzun tüketici alışkanlıklarını algılayarak, 'talep yokluğunu' önceden tespit eden hiper-yerel analiz algoritması."
            icon={<RadarIcon />}
          />
          <FeatureCard 
            title="Birim Ekonomisi Stres Testi"
            text="Müşteri Edinme Maliyeti (CAC) ve Fırsat Maliyeti metriklerini çarpıştırarak projenizin finansal dayanıklılığını test eder."
            icon={<BarChart2 className="text-indigo-400" />}
          />
          <FeatureCard 
            title="Anti-Halüsinasyon Veri Mimarisi"
            text="Sıfır duygu protokolüyle kilitlenmiştir. Sizi mutlu etmek için yalan söylemez. Sadece salt matematik ve pazar gerçekleri ile net karar verir."
            icon={<ShieldCheck className="text-emerald-400" />}
          />
          <FeatureCard 
            title="Prediktif Hayatta Kalma Protokolü"
            text="Eğer fikir operasyonel bir intiharsa, sizi kurtaracak acil durum pivot stratejisini ve minimum uygulanabilir ürünü (MVP) saniyeler içinde çizer."
            icon={<Activity className="text-rose-400" />}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="bg-indigo-600/20 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/20">
               <Terminal size={16} strokeWidth={2.5} />
             </div>
             <span className="font-bold text-slate-200 tracking-tight">GİRİLİRMİ</span>
          </div>
          <p className="text-slate-600 text-sm">
            &copy; 2024 Girilirmi AI. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Gizlilik</Link>
            <Link href="#" className="hover:text-white transition-colors">Kullanım Şartları</Link>
            <Link href="#" className="hover:text-white transition-colors">İletişim</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, text, icon }: { title: string, text: string, icon: React.ReactNode }) {
  return (
    <div className="group relative p-8 rounded-2xl border border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 transition-all duration-300 hover:border-slate-700 text-left">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm group-hover:text-slate-300 transition-colors">
        {text}
      </p>
    </div>
  );
}

function RadarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
      <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 13.14A10 10 0 0 0 21.86 10.84"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59-5.66 5.66"/>
    </svg>
  );
}