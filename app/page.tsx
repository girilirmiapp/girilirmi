'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Mail, 
  Search, 
  Zap, 
  Shield, 
  Database, 
  BarChart3, 
  Brain, 
  Layers, 
  Cpu 
} from 'lucide-react';
import type { SiteContent } from '@/lib/types';

/**
 * LandingPage Component
 * Fully corrected with all required imports and hydration guards.
 */
export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [mounted, setMounted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Hydration Guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Site Content
  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted]);

  // Auto-scroll chat
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
          content: 'Şu an sistem hazırlık aşamasında. AI motorumuz verilerinizi analiz etmeye hazır! Daha fazla bilgi için dashboard üzerinden döküman yükleyebilirsiniz.' 
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

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-32">
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
            {content['hero_description']?.body || 'Karmaşık veri yığınlarını anlamlı içgörülere dönüştürün. Gelişmiş AI teknolojisi ile güvenilir ve hızlı yanıtlar alın.'}
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
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Gelişmiş Veri Analitiği</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Verileriniz arasındaki gizli bağlantıları keşfedin ve stratejik kararlar alın.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Vector Space Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-3xl border border-gray-800 bg-gray-900/20 p-8 overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Database size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white">Vektör Uzayı Analizi</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Dokümanlarınız 1536 boyutlu bir vektör uzayında temsil edilir. Benzerlik aramaları milisaniyeler içinde sonuçlanır.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-700">Cosine Similarity</span>
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-700">Dense Vectors</span>
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-700">Semantic Map</span>
                </div>
              </div>
              <div className="w-full md:w-64 h-64 bg-gray-950/50 rounded-2xl border border-gray-800 relative overflow-hidden flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-2 p-4 opacity-20">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ 
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                      className="rounded-full bg-indigo-500 h-1.5 w-1.5"
                    />
                  ))}
                </div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <motion.path 
                    d="M 20 30 L 50 50 L 80 20 M 50 50 L 40 80 L 10 70" 
                    stroke="rgba(99, 102, 241, 0.3)" 
                    strokeWidth="0.5" 
                    fill="none" 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </svg>
                <div className="relative z-10 text-center">
                  <div className="text-4xl font-bold text-indigo-400">1.5M+</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Vektör İlişkisi</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Performance Stat */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-gray-800 bg-gray-900/20 p-8 flex flex-col justify-between group hover:border-emerald-500/30 transition-all"
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Ultra Hızlı İşleme</h3>
              <p className="text-gray-400 text-sm">
                Büyük veri setlerini anında indeksleyin. AI motorumuz sorgularınıza ortalama 1.2 saniyede yanıt verir.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800/50">
              <div className="flex items-end justify-between gap-1 h-24">
                {[30, 45, 25, 60, 40, 75, 50, 90, 65, 100].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.8 }}
                    className="flex-1 bg-emerald-500/20 border-t border-emerald-500/50 rounded-sm"
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                <span>0ms</span>
                <span>Latency</span>
                <span>500ms</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-gray-800 bg-gray-900/20 p-8 group overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="font-bold text-white">Canlı Analiz Akışı</h3>
                <p className="text-xs text-gray-500">Sistem aktivitesini takip edin</p>
              </div>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse delay-75" />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse delay-150" />
              </div>
            </div>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex justify-between p-2 rounded-lg bg-gray-950/50 border border-gray-800/50 text-indigo-400">
                <span>> INDEXING_DOC_4282</span>
                <span>OK</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-950/50 border border-gray-800/50 text-emerald-400">
                <span>> QUERY_SEARCH_SEMANTIC</span>
                <span>124ms</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-950/50 border border-gray-800/50 text-gray-500">
                <span>> CACHE_HIT_RATIO</span>
                <span>94.2%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-950/50 border border-gray-800/50 text-blue-400">
                <span>> EMBEDDING_GEN_v3</span>
                <span>DONE</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-gray-800 bg-gray-900/20 p-8 flex flex-col items-center justify-center text-center group"
          >
            <div className="relative h-32 w-32 flex items-center justify-center mb-6">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="#4f46e5" strokeWidth="8" 
                  strokeDasharray="282.7"
                  initial={{ strokeDashoffset: 282.7 }}
                  whileInView={{ strokeDashoffset: 282.7 * (1 - 0.994) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">99.4%</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase">Doğruluk</span>
              </div>
            </div>
            <h3 className="font-bold text-white mb-2">Güvenilir İçerik Üretimi</h3>
            <p className="text-xs text-gray-400">Sadece doğrulanmış kaynaklardan bilgi üretimi.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-gray-800 bg-gray-900/20 p-8 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <Shield className="text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" size={64} />
            </div>
            <div className="relative z-10 space-y-6">
              <h3 className="font-bold text-white text-xl">Kurumsal Güvenlik</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={16} />
                  <span className="text-sm text-gray-300">Uçtan uca şifreleme (AES-256)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={16} />
                  <span className="text-sm text-gray-300">Row-Level Security (RLS)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={16} />
                  <span className="text-sm text-gray-300">GDPR & KVKK Uyumluluğu</span>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl border border-gray-800 text-xs font-bold text-gray-400 hover:text-white hover:border-gray-700 transition-all">Güvenlik Raporunu İncele</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gray-950 py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 mb-4"
            >
              <Zap size={14} />
              <span>Güçlü Altyapı</span>
            </motion.div>
            <h2 className="text-4xl font-bold tracking-tight">Eksiksiz Özellik Seti</h2>
            <p className="text-gray-400 max-w-xl mx-auto">İş akışınızı baştan sona dijitalleştiren ve yapay zeka ile güçlendiren modüller.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="text-indigo-400" />}
              title="Semantik Arama" 
              desc="Sadece anahtar kelimelerle değil, anlam bazlı arama yaparak en alakalı bilgileri bulun."
              badge="Yeni"
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
              title="Hibrit Arama" 
              desc="Hem vektör tabanlı hem de geleneksel arama yöntemlerini birleştiren hibrit motor."
              badge="Pro"
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
              title="Akıllı Asistan" 
              desc="Verilerinizden beslenen, her an yardıma hazır akıllı yapay zeka asistanı."
            />
            <FeatureCard 
              icon={<Sparkles className="text-yellow-400" />}
              title="Otomatik Etiketleme" 
              desc="Yüklenen her doküman AI tarafından otomatik olarak kategorize edilir ve etiketlenir."
              badge="Beta"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 border-t border-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Size Uygun Planı Seçin</h2>
            <p className="text-gray-400">İhtiyacınıza göre ölçeklenebilen esnek fiyatlandırma.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard 
              name="Başlangıç" 
              price="0" 
              features={["5 Doküman", "100 Sorgu / Ay", "Standart Destek", "Temel AI Motoru"]}
            />
            <PricingCard 
              name="Profesyonel" 
              price="499" 
              isPopular={true}
              features={["Sınırsız Doküman", "10.000 Sorgu / Ay", "7/24 Öncelikli Destek", "Gelişmiş Hibrit Motor", "API Erişimi"]}
            />
            <PricingCard 
              name="Kurumsal" 
              price="Özel" 
              features={["Sınırsız Her Şey", "Özel Deployment", "SLA Garantisi", "Dedicated Destek", "On-Premise Seçeneği"]}
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
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Çevrimiçi - AI Aktif
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

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 -z-10" />
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto space-y-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Verilerinizin Gücünü Serbest Bırakın</h2>
            <p className="text-xl text-gray-400">Dakikalar içinde kurulum yapın ve AI asistanınızı eğitmeye başlayın.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="rounded-2xl bg-white text-black px-10 py-5 font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                Hemen Başlayın <ArrowRight size={20} />
              </Link>
              <Link href="/demo" className="rounded-2xl bg-gray-900 text-white border border-gray-800 px-10 py-5 font-bold text-lg hover:bg-gray-800 transition-all">
                Demo Talebi
              </Link>
            </div>
          </motion.div>
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

/**
 * Sub-components
 */

function FeatureCard({ icon, title, desc, badge }: { icon: React.ReactNode, title: string, desc: string, badge?: string }) {
  return (
    <Link href="/dashboard" className="block group">
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        className="h-full rounded-3xl border border-gray-800 bg-gray-900/20 p-8 hover:border-indigo-500/50 hover:bg-indigo-500/[0.05] transition-all duration-300 relative overflow-hidden cursor-pointer"
      >
        {badge && (
          <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            {badge}
          </div>
        )}
        <div className="h-12 w-12 rounded-2xl bg-gray-950 flex items-center justify-center mb-6 border border-gray-800 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/30 transition-all">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">{desc}</p>
        
        {/* Click indicator */}
        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Hemen Deneyin</span>
          <ArrowRight size={14} />
        </div>
      </motion.div>
    </Link>
  );
}

function PricingCard({ name, price, features, isPopular }: { name: string, price: string, features: string[], isPopular?: boolean }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`rounded-3xl border p-8 flex flex-col h-full transition-all ${
        isPopular ? 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-600/20' : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
      }`}
    >
      {isPopular && (
        <div className="bg-white text-indigo-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">
          En Popüler
        </div>
      )}
      <h3 className="text-xl font-bold mb-2 text-white">{name}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-bold">₺{price}</span>
        {price !== 'Özel' && <span className="text-sm opacity-60">/ay</span>}
      </div>
      
      <div className="space-y-4 mb-10 flex-1">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle2 size={16} className={isPopular ? 'text-white' : 'text-indigo-400'} />
            <span className={isPopular ? 'text-indigo-50' : 'text-gray-400'}>{f}</span>
          </div>
        ))}
      </div>
      
      <Link 
        href="/register" 
        className={`w-full py-4 rounded-2xl font-bold text-center transition-all ${
          isPopular ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
      >
        Planı Seç
      </Link>
    </motion.div>
  );
}
