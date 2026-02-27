'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import type { SiteContent } from '@/lib/types';
import { 
  LayoutDashboard, Database, FileText, Activity, 
  Plus, Trash2, Save, LogIn, LogOut, 
  ChevronRight, RefreshCcw, Search, Filter 
} from 'lucide-react';

type Tab = 'dashboard' | 'ingest' | 'content' | 'logs';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <RefreshCcw className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-xl">G</div>
            <h1 className="text-2xl font-bold">Admin Girişi</h1>
            <p className="mt-2 text-sm text-gray-400">Yönetim paneline erişmek için giriş yapın.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">E-posta</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full rounded-lg border border-gray-800 bg-gray-950 p-3 text-sm outline-none focus:border-indigo-500 transition" 
                placeholder="admin@girilirmi.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Şifre</label>
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full rounded-lg border border-gray-800 bg-gray-950 p-3 text-sm outline-none focus:border-indigo-500 transition" 
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
            >
              <LogIn size={18} /> Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold">G</div>
          <span className="text-xl font-bold tracking-tight">Girilirmi</span>
        </div>
        
        <nav className="flex h-[calc(100%-120px)] flex-col justify-between">
          <div className="space-y-1">
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={<Database size={20} />} 
              label="RAG Ingest" 
              active={activeTab === 'ingest'} 
              onClick={() => setActiveTab('ingest')} 
            />
            <SidebarItem 
              icon={<FileText size={20} />} 
              label="Site Content" 
              active={activeTab === 'content'} 
              onClick={() => setActiveTab('content')} 
            />
            <SidebarItem 
              icon={<Activity size={20} />} 
              label="System Logs" 
              active={activeTab === 'logs'} 
              onClick={() => setActiveTab('logs')} 
            />
          </div>

          <div className="pt-6 border-t border-gray-800">
            <div className="mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Kullanıcı</div>
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} /> Çıkış Yap
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
            <p className="mt-1 text-sm text-gray-400">Yönetim paneli üzerinden platformu yönetin.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-1.5 text-xs text-gray-400">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              {session.user.email}
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'ingest' && <IngestView token={session.access_token} />}
        {activeTab === 'content' && <ContentView />}
        {activeTab === 'logs' && <LogsView />}
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// --- Views ---

function DashboardView() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Vektör Sayısı" value="12,480" change="+12%" />
        <StatsCard title="AI Sorguları" value="1,205" change="+5%" />
        <StatsCard title="Lead Sayısı" value="48" change="+18%" />
        <StatsCard title="Token Kullanımı" value="2.4M" change="-2%" />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="mb-4 text-xl font-semibold">Son Aktiviteler</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                    <Database size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Yeni veri yüklendi</p>
                    <p className="text-xs text-gray-500">{i} saat önce • knowledge_base_v{i}.pdf</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
          <h2 className="mb-4 text-xl font-semibold">Sistem Durumu</h2>
          <div className="space-y-4">
            <StatusRow label="Supabase DB" status="online" />
            <StatusRow label="OpenAI API" status="online" />
            <StatusRow label="Vercel Edge" status="online" />
            <StatusRow label="Vector Search" status="online" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, status }: { label: string, status: 'online' | 'offline' }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-950/50 p-3">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium capitalize text-gray-400">{status}</span>
        <div className={`h-2 w-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      </div>
    </div>
  );
}

function StatsCard({ title, value, change }: { title: string, value: string, change: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6 shadow-sm transition-hover hover:border-gray-700">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{change}</span>
      </div>
    </div>
  );
}

function IngestView({ token }: { token: string }) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, source })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ type: 'success', message: data.message });
      setText('');
    } catch (err: any) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <form onSubmit={handleIngest} className="space-y-6 rounded-2xl border border-gray-800 bg-gray-900/30 p-8">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">İçerik</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-64 w-full rounded-xl border border-gray-800 bg-gray-950 p-4 text-sm focus:border-indigo-500 outline-none transition"
            placeholder="Vektörize edilecek metni buraya yapıştırın..."
            required
          />
        </div>
        <div className="max-w-sm">
          <label className="mb-2 block text-sm font-medium text-gray-300">Kaynak İsmi</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 text-sm focus:border-indigo-500 outline-none transition"
            placeholder="Örn: sirket_el_kitabi_2024"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? <RefreshCcw className="animate-spin" size={18} /> : <Database size={18} />}
          Vektörize Et ve Kaydet
        </button>
        {result && (
          <div className={`rounded-xl border p-4 text-sm ${
            result.type === 'success' ? 'border-green-800 bg-green-950/20 text-green-400' : 'border-red-800 bg-red-950/20 text-red-400'
          }`}>
            {result.message}
          </div>
        )}
      </form>
    </div>
  );
}

function ContentView() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            className="w-full rounded-xl border border-gray-800 bg-gray-900/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition" 
            placeholder="İçeriklerde ara..."
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-2.5 text-sm font-medium hover:bg-gray-800">
            <Filter size={18} /> Filtrele
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold hover:bg-indigo-500 transition-all active:scale-95">
            <Plus size={18} /> Yeni İçerik
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-800 bg-gray-800/50 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-6 py-4">Anahtar</th>
              <th className="px-6 py-4">Bölüm</th>
              <th className="px-6 py-4">Başlık</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Henüz içerik eklenmemiş.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-400">{item.key}</td>
                  <td className="px-6 py-4">{item.section}</td>
                  <td className="px-6 py-4 font-medium">{item.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${
                      item.published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      <div className={`h-1 w-1 rounded-full ${item.published ? 'bg-green-400' : 'bg-yellow-400'}`} />
                      {item.published ? 'YAYINDA' : 'TASLAK'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="rounded-lg p-2 hover:bg-indigo-500/10 hover:text-indigo-400"><Save size={16} /></button>
                      <button className="rounded-lg p-2 hover:bg-red-500/10 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LogsView() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-8 font-mono text-xs leading-relaxed text-gray-500">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-indigo-500">[2026-02-26 14:20:01]</span>
          <span className="font-bold text-indigo-400">INFO</span>
          <span className="text-gray-300">AI Sorgusu tamamlandı. user_id: 843... latency: 450ms</span>
        </div>
        <div className="mb-2 flex items-center gap-3">
          <span className="text-green-500">[2026-02-26 14:18:45]</span>
          <span className="font-bold text-green-400">SUCCESS</span>
          <span className="text-gray-300">Vektör yükleme başarılı. (240 parça)</span>
        </div>
        <div className="mb-2 flex items-center gap-3">
          <span className="text-yellow-500">[2026-02-26 14:15:12]</span>
          <span className="font-bold text-yellow-400">WARN</span>
          <span className="text-gray-300">Yüksek token kullanımı uyarısı: gpt-4o modelinde limit yaklaşılıyor.</span>
        </div>
        <div className="mb-2 flex items-center gap-3">
          <span className="text-red-500">[2026-02-26 14:10:33]</span>
          <span className="font-bold text-red-400">ERROR</span>
          <span className="text-gray-300">Google Sheets API hatası: Timeout on /api/leads endpoint.</span>
        </div>
        <div className="mb-2 flex items-center gap-3">
          <span className="text-gray-600">[2026-02-26 14:05:00]</span>
          <span className="font-bold text-gray-600">DEBUG</span>
          <span className="text-gray-400">Arkaplan vektör temizliği başlatıldı.</span>
        </div>
      </div>
    </div>
  );
}
