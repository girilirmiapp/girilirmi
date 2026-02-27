'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Sparkles, ArrowRight, CheckCircle2, 
  Loader2, Mail, Search, Zap, Shield, Database, 
  BarChart3, Brain, Layers, Cpu
} from 'lucide-react';
import type { SiteContent } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/content?section=landing')
      .then(res => res.json())
      .then((data: SiteContent[]) => {
        if (Array.isArray(data)) {
          const contentMap = data.reduce((acc: Record<string, SiteContent>, item: SiteContent) => {
            acc[item.key] = item;
            return acc;
          }, {});
          setContent(contentMap);
        }
      })
      .catch(err => console.error('Failed to fetch landing content:', err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLeadLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing_hero' })
      });

      if (!res.ok) throw new Error('Lead submission failed');
      
      toast.success('Başarıyla kaydedildi! Sizinle en kısa sürede iletişime geçeceğiz.');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLeadLoading(false);
    }
  };

  async function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || chatLoading) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });

      if (!res.ok) {
        await new Promise(r => setTimeout(r, 1000));
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Şu an sistem hazırlık aşamasında. RAG motorumuz verilerinizi analiz etmeye hazır! Daha fazla bilgi için dashboard üzerinden döküman yükleyebilirsiniz.' 
        }]);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      let assistantMsg = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantMsg += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = { ...newMessages[lastIndex], content: assistantMsg };
          return newMessages;
        });
      }
    } catch (err: unknown) {
      console.error('Chat error:', err);
      toast.error('AI yanıtı alınırken bir hata oluştu.');
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-32">
        {/* Background Visuals */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(79,70,229,0.1)_0%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-20 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 mb-8"
          >
            <Sparkles size={16} />
            <span>{content['hero_badge']?.title || 'Yapay Zeka Destekli Analiz Platformu'}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
          >
            {content['hero_title']?.title || 'Verilerinizle Konuşan Akıllı Çözümler'}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 text-balance"
          >
            {content['hero_description']?.body || 'Karmaşık veri yığınlarını anlamlı içgörülere dönüştürün. RAG teknolojisi ile güvenilir ve hızlı yanıtlar alın.'}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="E-posta adresinizi girin"
                  className="w-full rounded-2xl border border-gray-800 bg-gray-900/50 py-4 pl-12 pr-4 text-sm focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={leadLoading}
                className="rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
              >
                {leadLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                {leadLoading ? 'Kaydediliyor...' : 'Hemen Başlayın'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Analysis Visual Showcase */}
      <section className="container mx-auto px-6 py-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto rounded-3xl border border-gray-800 bg-gray-900/20 p-4 md:p-8 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 p-4">
              <h2 className="text-3xl font-bold">Veri Analizinde Yeni Standart</h2>
              <p className="text-gray-400">Gelişmiş RAG motorumuz ile dokümanlarınız sadece saklanmaz, her kelimesi anlamlandırılır.</p>
              <div className="space-y-4">
                <VisualStat label="Analiz Doğruluğu" value={99.4} color="bg-indigo-500" />
                <VisualStat label="Sorgu Hızı" value={88.2} color="bg-emerald-500" />
                <VisualStat label="Veri Güvenliği" value={100} color="bg-blue-500" />
              </div>
            </div>
            
            <div className="relative h-[300px] md:h-[400px] bg-gray-950/50 rounded-2xl border border-gray-800 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">System_Live_v2.0</div>
              </div>
              
              <div className="flex-1 flex items-end gap-1 pb-10">
                {[40, 70, 45, 90, 65, 80, 100, 55, 75, 95, 40, 60, 85].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 1 }}
                    className="flex-1 bg-indigo-500/20 border-t-2 border-indigo-500 rounded-sm"
                  />
                ))}
              </div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="h-20 w-20 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur-md animate-pulse">
                  <Brain className="text-indigo-400" size={32} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gray-950 py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Güçlü Özellikler</h2>
            <p className="text-gray-400 max-w-xl mx-auto">İş akışınızı hızlandıracak ve verimliliğinizi artıracak araçlar.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Search className="text-indigo-400" />}
              title="Semantik Arama" 
              desc="Sadece anahtar kelimelerle değil, anlam bazlı arama yaparak en alakalı bilgileri bulun."
            />
            <FeatureCard 
              icon={<Layers className="text-emerald-400" />}
              title="Akıllı Çıkarım" 
              desc="Düzensiz metinlerden tablo, liste ve özet gibi yapılandırılmış veriler oluşturun."
            />
            <FeatureCard 
              icon={<Shield className="text-blue-400" />}
              title="Kurumsal Güvenlik" 
              desc="Verileriniz askeri düzeyde şifreleme ve RLS protokolleri ile korunur."
            />
            <FeatureCard 
              icon={<Cpu className="text-rose-400" />}
              title="Hibrit Motor" 
              desc="Hem vektör tabanlı hem de geleneksel arama yöntemlerini birleştiren hibrit RAG."
            />
            <FeatureCard 
              icon={<Database className="text-amber-400" />}
              title="Geniş Format Desteği" 
              desc="PDF, DOCX, TXT ve web sayfalarını saniyeler içinde sisteminize entegre edin."
            />
            <FeatureCard 
              icon={<Zap className="text-purple-400" />}
              title="Gerçek Zamanlı" 
              desc="Yüklediğiniz veriler anında vektörize edilir ve hemen sorgulanabilir hale gelir."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-cyan-400" />}
              title="Gelişmiş Analitik" 
              desc="Sorgu trafiği, sistem doğruluğu ve token kullanımı gibi verileri takip edin."
            />
            <FeatureCard 
              icon={<Brain className="text-green-400" />}
              title="Sıfır Halüsinasyon" 
              desc="Sadece sizin verilerinizden beslenen, uydurma bilgi üretmeyen güvenli AI."
            />
          </div>
        </div>
      </section>

      {/* AI Chat Interface Preview */}
      <section className="container mx-auto px-6 py-20 border-t border-gray-900/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Deneyimleyin</h2>
          <p className="text-gray-400">Aşağıdaki asistan ile hemen bir deneme yapabilirsiniz.</p>
        </div>
        
        <div className="max-w-4xl mx-auto rounded-2xl border border-gray-800 bg-gray-900/30 shadow-2xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Bilgi Asistanı</h3>
                <p className="text-[10px] text-green-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Çevrimiçi - RAG Aktif
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500 opacity-50">
                <Bot size={64} strokeWidth={1.5} />
                <div className="space-y-1">
                  <p className="font-medium text-gray-300">Nasıl yardımcı olabilirim?</p>
                  <p className="max-w-xs text-xs">Platform hakkında merak ettiklerinizi sorabilirsiniz.</p>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    m.role === 'user' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-500'
                  }`}>
                    {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm transition-all ${
                    m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-800/80 text-gray-200 border border-gray-700/50'
                  }`}>
                    {m.content || (chatLoading && i === messages.length - 1 ? (
                      <span className="flex gap-1 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce delay-150" />
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce delay-300" />
                      </span>
                    ) : '')}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChat} className="p-5 border-t border-gray-800 bg-gray-900/50">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Bir soru sorun..."
                className="w-full rounded-2xl border border-gray-800 bg-gray-950 py-4 pl-5 pr-14 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-gray-600 focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
              />
              <button
                type="submit"
                disabled={chatLoading || !query.trim()}
                className="absolute right-2.5 top-2.5 h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale transition-all active:scale-90 shadow-lg shadow-indigo-600/20"
              >
                <Send size={20} className={chatLoading ? 'animate-pulse' : ''} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-900 py-16 bg-gray-950/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-600/20">G</div>
              <span className="font-bold text-xl tracking-tight">Girilirmi</span>
            </div>
            <div className="flex gap-10 text-sm text-gray-500">
              <Link href="/" className="hover:text-white transition-colors">Ürün</Link>
              <Link href="#features" className="hover:text-white transition-colors">Özellikler</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Şartlar</Link>
            </div>
            <p className="text-sm text-gray-600">© 2026 Girilirmi AI. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group rounded-3xl border border-gray-800 bg-gray-900/20 p-8 hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] transition-all duration-500"
    >
      <div className="h-12 w-12 rounded-2xl bg-gray-950 flex items-center justify-center mb-6 border border-gray-800 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/30 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">{desc}</p>
    </motion.div>
  );
}

function VisualStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
        <span>{label}</span>
        <span>%{value}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
