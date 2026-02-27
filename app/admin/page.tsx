'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import type { SiteContent } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Database, FileText, Activity, 
  Plus, Trash2, Save, LogIn, LogOut, 
  ChevronRight, RefreshCcw, Search, Filter 
} from 'lucide-react';

type Tab = 'dashboard' | 'ingest' | 'content' | 'logs';

interface Stats {
  vectors: string;
  queries: string;
  leads: string;
  tokens: string;
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [error, setError] = useState<string | null>(null);

  // Initialize client once
  const [supabase] = useState(() => createSupabaseClient());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
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
        <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-xl shadow-lg shadow-indigo-600/20">G</div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="mt-2 text-sm text-gray-400">Access the platform management dashboard.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                placeholder="••••••••"
              />
            </div>
            {error && <p className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              <LogIn size={18} /> Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold shadow-lg shadow-indigo-600/20">G</div>
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
            <div className="mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Account</div>
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" /> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-10 animate-in fade-in slide-in-from-right-4 duration-500">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold capitalize tracking-tight">{activeTab}</h1>
            <p className="mt-1 text-sm text-gray-400">Manage your platform data and AI systems.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-2 text-xs text-gray-400 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {session.user.email}
            </div>
          </div>
        </header>

        <div className="rounded-3xl border border-gray-800 bg-gray-900/20 p-8 backdrop-blur-sm shadow-xl">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'ingest' && <IngestView token={session.access_token} />}
          {activeTab === 'content' && <ContentView />}
          {activeTab === 'logs' && <LogsView />}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105' 
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
  const stats: Stats = {
    vectors: "12,480",
    queries: "1,205",
    leads: "48",
    tokens: "2.4M"
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Vectors" value={stats.vectors} change="+12%" />
        <StatsCard title="AI Queries" value={stats.queries} change="+5%" />
        <StatsCard title="Total Leads" value={stats.leads} change="+18%" />
        <StatsCard title="Token Usage" value={stats.tokens} change="-2%" />
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-gray-950/30 p-6 shadow-inner">
          <h2 className="mb-6 text-xl font-bold tracking-tight">Recent Activity</h2>
          <div className="space-y-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="group flex items-center justify-between border-b border-gray-800 pb-5 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors">Vector Ingestion Complete</p>
                    <p className="text-xs text-gray-500">{i} hour ago • knowledge_base_v{i}.pdf</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-800 bg-gray-950/30 p-6 shadow-inner">
          <h2 className="mb-6 text-xl font-bold tracking-tight">System Status</h2>
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
    <div className="flex items-center justify-between rounded-xl bg-gray-900/50 p-4 border border-gray-800/50 transition-hover hover:border-gray-700">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{status}</span>
        <div className={`h-2.5 w-2.5 rounded-full ${status === 'online' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'} animate-pulse`} />
      </div>
    </div>
  );
}

function StatsCard({ title, value, change }: { title: string, value: string, change: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950/30 p-6 shadow-lg transition-all hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] group">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{title}</p>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight group-hover:text-white transition-colors">{value}</span>
        <span className={`text-xs font-bold rounded-lg px-2 py-1 ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

function IngestView({ token }: { token: string }) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

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
      if (!res.ok) throw new Error(data.error || 'Ingestion failed');
      setResult({ type: 'success', message: data.message });
      setText('');
      setSource('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection error';
      setResult({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-500">
      <form onSubmit={handleIngest} className="space-y-8 rounded-2xl">
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-500">Knowledge Content</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-80 w-full rounded-2xl border border-gray-800 bg-gray-950 p-5 text-sm focus:border-indigo-500 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 shadow-inner scrollbar-thin"
            placeholder="Paste the raw text or markdown to be vectorized..."
            required
          />
        </div>
        <div className="max-w-sm space-y-2">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-500">Source Identifier</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-gray-950 p-4 text-sm focus:border-indigo-500 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
            placeholder="e.g. employee_handbook_2024"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="flex items-center gap-3 rounded-2xl bg-indigo-600 px-10 py-4 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Database size={20} />}
          Vectorize and Store
        </button>
        {result && (
          <div className={`rounded-2xl border p-5 text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
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
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('[Admin] Content fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-6">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            className="w-full rounded-2xl border border-gray-800 bg-gray-950/50 py-3.5 pl-12 pr-5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" 
            placeholder="Search content keys or titles..."
          />
        </div>
        <div className="flex gap-4 shrink-0">
          <button className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 px-5 py-3 text-sm font-bold hover:bg-gray-800 transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-950/20 shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-800 bg-gray-900/50 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-8 py-5">Key</th>
              <th className="px-8 py-5">Section</th>
              <th className="px-8 py-5">Title</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-500"><RefreshCcw className="animate-spin inline mr-2" size={16} /> Loading assets...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-medium">No content found in the database.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="group hover:bg-indigo-500/[0.03] transition-colors">
                  <td className="px-8 py-5 font-mono text-xs text-indigo-400 font-bold">{item.key}</td>
                  <td className="px-8 py-5 text-gray-400">{item.section}</td>
                  <td className="px-8 py-5 font-bold text-gray-200">{item.title || '-'}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold border ${
                      item.published 
                        ? 'border-green-500/20 bg-green-500/10 text-green-400' 
                        : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${item.published ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-yellow-400 shadow-lg shadow-yellow-400/50'}`} />
                      {item.published ? 'LIVE' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="rounded-xl p-2.5 bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Save size={18} /></button>
                      <button className="rounded-xl p-2.5 bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
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
  const logs = [
    { time: "2026-02-26 14:20:01", level: "INFO", msg: "AI Query processed. user_id: 843... latency: 450ms", color: "indigo" },
    { time: "2026-02-26 14:18:45", level: "SUCCESS", msg: "Bulk vector ingestion completed (240 chunks)", color: "green" },
    { time: "2026-02-26 14:15:12", level: "WARN", msg: "High token usage: approaching gpt-4o limits", color: "yellow" },
    { time: "2026-02-26 14:10:33", level: "ERROR", msg: "Google Sheets API: Timeout on /api/leads", color: "red" },
    { time: "2026-02-26 14:05:00", level: "DEBUG", msg: "Background vector cleanup cycle started", color: "gray" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-8 font-mono text-xs leading-loose text-gray-500 shadow-inner">
        {logs.map((log, i) => (
          <div key={i} className="mb-3 flex items-start gap-4 last:mb-0 hover:bg-gray-800/20 rounded px-2 py-1 transition-colors">
            <span className="text-gray-600 shrink-0">[{log.time}]</span>
            <span className={`font-bold tracking-widest shrink-0 text-${log.color}-400`}>{log.level}</span>
            <span className="text-gray-300">{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
