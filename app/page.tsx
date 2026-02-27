'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { SiteContent } from '@/lib/types';

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch landing page content from Supabase
    fetch('/api/content?section=landing')
      .then(res => res.json())
      .then((data: SiteContent[]) => {
        const contentMap = data.reduce((acc: Record<string, SiteContent>, item: SiteContent) => {
          acc[item.key] = item;
          return acc;
        }, {});
        setContent(contentMap);
      })
      .catch(err => console.error('Failed to fetch landing content:', err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Chat failed' }));
        throw new Error(errorData.error || 'Chat failed');
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
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: `Hata: ${err.message || 'Bir sorun oluştu.'}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(79,70,229,0.1)_0%,transparent_100%)]" />
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 mb-8 animate-in fade-in zoom-in duration-700">
            <Sparkles size={16} />
            <span>{content['hero_badge']?.title || 'Yapay Zeka Destekli Yeni Nesil Platform'}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-top-4 duration-1000">
            {content['hero_title']?.title || 'Verilerinizle Konuşan Akıllı Çözümler'}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 text-balance animate-in fade-in slide-in-from-top-2 duration-1000 delay-200">
            {content['hero_description']?.body || 'Karmaşık veri yığınlarını anlamlı içgörülere dönüştürün. RAG teknolojisi ile güvenilir ve hızlı yanıtlar alın.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <button className="rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95">
              Hemen Başlayın <ArrowRight size={18} />
            </button>
            <button className="rounded-full border border-gray-800 bg-gray-900/50 px-8 py-4 font-semibold hover:bg-gray-800 transition-all active:scale-95">
              Demo İzleyin
            </button>
          </div>
        </div>
      </section>

      {/* AI Chat Interface */}
      <section className="container mx-auto px-6 py-20 border-t border-gray-900/50">
        <div className="max-w-4xl mx-auto rounded-2xl border border-gray-800 bg-gray-900/30 shadow-2xl overflow-hidden flex flex-col h-[650px] animate-in fade-in duration-1000 delay-500">
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
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-800" />
              <div className="h-2 w-2 rounded-full bg-gray-800" />
              <div className="h-2 w-2 rounded-full bg-gray-800" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500 opacity-50">
                <Bot size={64} strokeWidth={1.5} />
                <div className="space-y-1">
                  <p className="font-medium text-gray-300">Nasıl yardımcı olabilirim?</p>
                  <p className="max-w-xs text-xs">Sisteme yüklenen belgeler ve içerikler hakkında her şeyi sorabilirsiniz.</p>
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
                    {m.content || (loading && i === messages.length - 1 ? (
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
                placeholder="Bir soru sorun veya dokümanları sorgulayın..."
                className="w-full rounded-2xl border border-gray-700 bg-gray-950 py-4 pl-5 pr-14 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-gray-600 focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2.5 top-2.5 h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale transition-all active:scale-90 shadow-lg shadow-indigo-600/20"
              >
                <Send size={20} className={loading ? 'animate-pulse' : ''} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-950 py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Neden Biz?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">En son teknoloji ile verimliliğinizi artıran veri odaklı çözümler sunuyoruz.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Hızlı Entegrasyon" 
              desc="Verilerinizi saniyeler içinde yükleyin, vektörize edin ve hemen sorgulamaya başlayın. Teknik karmaşa yok."
            />
            <FeatureCard 
              title="Güvenli Veri" 
              desc="Kurumsal düzeyde Row Level Security (RLS) ve JWT tabanlı yetkilendirme ile verileriniz her zaman güvende."
            />
            <FeatureCard 
              title="Sıfır Halüsinasyon" 
              desc="RAG mimarimiz sayesinde yapay zeka sadece sizin verilerinizden beslenir, uydurma bilgiler vermez."
            />
          </div>
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
              <a href="#" className="hover:text-white transition-colors">Ürün</a>
              <a href="#" className="hover:text-white transition-colors">Özellikler</a>
              <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-white transition-colors">Şartlar</a>
            </div>
            <p className="text-sm text-gray-600">© 2026 Girilirmi AI. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="group rounded-3xl border border-gray-800 bg-gray-900/20 p-10 hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] transition-all duration-500">
      <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">{desc}</p>
    </div>
  );
}
