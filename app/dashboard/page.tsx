'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  FileText, Cpu, Zap, Activity, Clock, 
  ArrowUpRight, ArrowDownRight, ShieldCheck, LayoutDashboard,
  MessageSquare, Send, Bot, User, BarChart3, Search, Loader2, RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';

// --- Mock Data ---
const queryData = [
  { name: 'Pzt', value: 2400 },
  { name: 'Sal', value: 3100 },
  { name: 'Çar', value: 2800 },
  { name: 'Per', value: 3900 },
  { name: 'Cum', value: 4800 },
  { name: 'Cmt', value: 3200 },
  { name: 'Paz', value: 2900 },
];

const storageData = [
  { name: 'PDF', value: 400, color: '#4f46e5' },
  { name: 'Docx', value: 300, color: '#818cf8' },
  { name: 'TXT', value: 200, color: '#a5b4fc' },
  { name: 'Web', value: 100, color: '#c7d2fe' },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'analyze'>('overview');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* Header & Tabs */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <LayoutDashboard className="text-indigo-500" size={32} />
              Yönetim Paneli
            </h1>
            <p className="mt-2 text-gray-400">Platform özelliklerini kullanın ve verilerinizi analiz edin.</p>
          </div>
          
          <div className="flex bg-gray-900/50 p-1 rounded-2xl border border-gray-800">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={16} />} label="Genel Bakış" />
            <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={16} />} label="AI Chat" />
            <TabButton active={activeTab === 'analyze'} onClick={() => setActiveTab('analyze')} icon={<BarChart3 size={16} />} label="Veri Analizi" />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewView key="overview" />}
          {activeTab === 'chat' && <ChatSimulator key="chat" />}
          {activeTab === 'analyze' && <DataAnalyzer key="analyze" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// --- Views ---

function OverviewView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Toplam Analiz" value="12,482" change="+12.5%" isPositive={true} icon={<FileText className="text-indigo-400" />} />
        <StatCard title="Aktif Sorgular" value="842" change="+5.2%" isPositive={true} icon={<Cpu className="text-emerald-400" />} />
        <StatCard title="Sistem Sağlığı" value="%99.9" change="Sabit" isPositive={true} icon={<ShieldCheck className="text-amber-400" />} />
        <StatCard title="Kullanılan Kredi" value="42.8k" change="+18.4%" isPositive={false} icon={<Zap className="text-indigo-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Analiz Trafiği</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Sorgu Sayısı
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={queryData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-emerald-400" />
                Sistem Kaynakları
              </h3>
              <div className="space-y-6">
                <ProgressStat label="CPU Kullanımı" value={24} color="bg-emerald-500" />
                <ProgressStat label="RAM Kullanımı" value={68} color="bg-indigo-500" />
                <ProgressStat label="Depolama" value={42} color="bg-amber-500" />
              </div>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-400" />
                Güvenlik Özeti
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/50 border border-gray-800/50">
                  <span className="text-xs text-gray-400">SSL Durumu</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Aktif</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/50 border border-gray-800/50">
                  <span className="text-xs text-gray-400">Son Yedekleme</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">2s Önce</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/50 border border-gray-800/50">
                  <span className="text-xs text-gray-400">Tehdit Engelleme</span>
                  <span className="text-[10px] font-bold text-blue-400 uppercase">Devrede</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8">
            <h3 className="text-xl font-bold text-white mb-8">Veri Kaynakları</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={storageData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {storageData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {storageData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-white font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8">
            <h3 className="text-xl font-bold text-white mb-6">Son Aktiviteler</h3>
            <div className="space-y-6">
              <ActivityItem icon={<FileText size={14} />} title="Yeni döküman yüklendi" time="12 dk önce" color="text-indigo-400" />
              <ActivityItem icon={<MessageSquare size={14} />} title="AI Analizi tamamlandı" time="45 dk önce" color="text-emerald-400" />
              <ActivityItem icon={<Search size={14} />} title="Semantik arama yapıldı" time="2s önce" color="text-blue-400" />
              <ActivityItem icon={<Zap size={14} />} title="Vektör motoru güncellendi" time="5s önce" color="text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
        <span>{label}</span>
        <span>%{value}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, time, color }: { icon: React.ReactNode, title: string, time: string, color: string }) {
  return (
    <div className="flex gap-4">
      <div className={`h-8 w-8 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-200">{title}</p>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{time}</p>
      </div>
    </div>
  );
}

function ChatSimulator() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    // Realistic simulation
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: `"${userText}" sorgusunu analiz ettim. Vektör veri tabanımızda bu konuyla ilgili 4 eşleşme bulundu. RAG motoru en doğru cevabı sentezledi: Verileriniz güvenli ve optimize edilmiş durumda.` 
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto rounded-3xl border border-gray-800 bg-gray-900/30 overflow-hidden flex flex-col h-[600px] shadow-2xl"
    >
      <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-bold text-white">AI Bilgi Asistanı</h3>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Simülatör Aktif</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 space-y-4">
            <MessageSquare size={48} />
            <p className="text-sm font-medium">Bir soru sorarak simülasyonu başlatın.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-gray-800' : 'bg-indigo-600'}`}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Bot size={16} /></div>
            <div className="bg-gray-800 px-4 py-2.5 rounded-2xl"><Loader2 className="animate-spin text-indigo-400" size={16} /></div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-6 border-t border-gray-800 bg-gray-900/50">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 pl-6 pr-14 text-sm focus:border-indigo-500 outline-none transition-all"
          />
          <button type="submit" disabled={!input.trim() || loading} className="absolute right-2 top-2 h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 transition-all">
            <Send size={18} />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function DataAnalyzer() {
  const [data, setData] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = () => {
    if (!data.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const words = data.trim().split(/\s+/).length;
      const chars = data.length;
      const sentiment = Math.random() * 100;
      
      setResult({
        stats: [
          { name: 'Kelimeler', value: words },
          { name: 'Karakterler', value: chars },
          { name: 'Yoğunluk', value: (chars / words).toFixed(1) }
        ],
        chart: [
          { name: 'Sentiment', value: sentiment },
          { name: 'Objectivity', value: 100 - sentiment }
        ]
      });
      setLoading(false);
      toast.success('Analiz tamamlandı!');
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8">
          <h3 className="text-xl font-bold text-white mb-6">Ham Veri Girişi</h3>
          <textarea 
            value={data}
            onChange={e => setData(e.target.value)}
            placeholder="Analiz edilecek metni buraya yapıştırın..."
            className="w-full h-64 bg-gray-950 border border-gray-800 rounded-2xl p-6 text-sm text-gray-300 focus:border-indigo-500 outline-none transition-all resize-none"
          />
          <button 
            onClick={analyze}
            disabled={!data.trim() || loading}
            className="w-full mt-6 bg-indigo-600 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            {loading ? 'Analiz Ediliyor...' : 'Hemen Analiz Et'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {result ? (
          <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8 h-full">
            <h3 className="text-xl font-bold text-white mb-8">Analiz Sonuçları</h3>
            <div className="grid grid-cols-3 gap-4 mb-10">
              {result.stats.map((s: any) => (
                <div key={s.name} className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{s.name}</p>
                  <p className="text-xl font-bold text-indigo-400">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8 h-full flex flex-col items-center justify-center text-center text-gray-500 opacity-50 space-y-4">
            <Activity size={48} />
            <p className="text-sm font-medium">Analiz sonuçları burada görünecek.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, change, isPositive, icon }: { title: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900/40 p-6 shadow-lg group hover:border-indigo-500/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="h-12 w-12 rounded-2xl bg-gray-950 flex items-center justify-center border border-gray-800 group-hover:bg-indigo-600/10 transition-colors">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'text-emerald-400 bg-emerald-400/5' : 'text-rose-400 bg-rose-400/5'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
    </div>
  );
}
