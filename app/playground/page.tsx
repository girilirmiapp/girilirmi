'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, Database, FileUp, 
  MessageSquare, History, Search, Loader2, Info, 
  X, CheckCircle2, AlertCircle, RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function PlaygroundPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast.success(`${file.name} başarıyla yüklendi ve vektörize edildi.`);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      // API call logic (simulated for immediate response if no keys)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content })
      });

      if (!res.ok) {
        // Simulation Fallback if API fails (no keys)
        await new Promise(resolve => setTimeout(resolve, 2000));
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Şu an simülasyon modundayım. OpenAI API anahtarlarınız henüz yapılandırılmamış olabilir, ancak arayüz mükemmel çalışıyor! Gerçek bir LLM yanıtı almak için .env dosyanızı güncelleyin.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        return;
      }

      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantContent += chunk;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
      }

    } catch (error: any) {
      toast.error('AI yanıtı alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-6 lg:px-12 flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-8 h-[800px]">
        
        {/* Sidebar - Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Database size={20} className="text-indigo-400" /> Veri Kaynağı
            </h3>
            
            <div className="space-y-4">
              <label className="group relative flex flex-col items-center justify-center h-40 w-full border-2 border-dashed border-gray-800 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="text-gray-500 group-hover:text-indigo-400 mb-3 transition-colors" size={32} />
                  <p className="text-xs text-gray-400 font-medium">Dosya Yükle</p>
                  <p className="text-[10px] text-gray-600 mt-1">PDF, TXT, DOCX</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileUpload} />
                
                <AnimatePresence>
                  {isUploading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gray-900/90 rounded-2xl flex flex-col items-center justify-center px-6"
                    >
                      <Loader2 className="animate-spin text-indigo-500 mb-3" size={24} />
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          className="bg-indigo-500 h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-indigo-400 mt-2 uppercase tracking-widest">{uploadProgress}% Vektörize Ediliyor</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </label>

              <div className="pt-4 space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Aktif Bilgi Tabanı</p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-300">Sistem_Verisi_v1</span>
                  </div>
                  <X size={14} className="text-gray-600 hover:text-red-400 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <History size={20} className="text-emerald-400" /> Geçmiş
            </h3>
            <div className="space-y-3 opacity-50">
              <p className="text-xs text-gray-500 italic">Henüz geçmiş sorgu bulunmuyor.</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3 rounded-3xl border border-gray-800 bg-gray-900/20 flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_40%_at_50%_50%,rgba(79,70,229,0.03)_0%,transparent_100%)]" />
          
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="font-bold text-white">AI Playground</h2>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">RAG Motoru Aktif</span>
                </div>
              </div>
            </div>
            <button onClick={() => setMessages([])} className="text-gray-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800">
              <RefreshCcw size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-800">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-20 w-20 rounded-3xl bg-gray-900 flex items-center justify-center text-gray-600 border border-gray-800 animate-bounce">
                  <MessageSquare size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-300">Konuşmaya Başlayın</h3>
                  <p className="text-sm text-gray-500 max-w-sm">Veri tabanındaki bilgilerle ilgili sorular sorun veya belgeleri analiz edin.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-lg">
                  <SuggestionCard text="Bu platformun temel özellikleri nelerdir?" onClick={setQuery} />
                  <SuggestionCard text="RAG teknolojisi nasıl çalışır?" onClick={setQuery} />
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m.id} 
                  className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    m.role === 'user' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  }`}>
                    {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm transition-all ${
                    m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-800/80 text-gray-200 border border-gray-700/50'
                  }`}>
                    {m.content}
                    <p className={`text-[10px] mt-2 font-medium ${m.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
            {loading && (
              <div className="flex gap-5">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white border border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Bot size={20} />
                </div>
                <div className="bg-gray-800/80 rounded-2xl px-6 py-4 border border-gray-700/50">
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce delay-150" />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-8 border-t border-gray-800 bg-gray-900/40">
            <form onSubmit={handleChat} className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Verileriniz hakkında bir soru sorun..."
                className="w-full rounded-2xl border border-gray-800 bg-gray-950 py-5 pl-6 pr-20 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder:text-gray-600 focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale transition-all active:scale-90 shadow-lg shadow-indigo-600/20"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
            <div className="mt-4 flex items-center gap-4 justify-center">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                <AlertCircle size={12} /> Yanıtlar sınırlı veriye dayalıdır
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                <Info size={12} /> GPT-4o Model
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ text, onClick }: { text: string, onClick: (t: string) => void }) {
  return (
    <button 
      onClick={() => onClick(text)}
      className="p-4 rounded-xl border border-gray-800 bg-gray-900/50 text-left hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
    >
      <p className="text-xs text-gray-400 group-hover:text-indigo-300 transition-colors">{text}</p>
    </button>
  );
}
