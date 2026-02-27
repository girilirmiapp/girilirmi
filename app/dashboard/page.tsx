'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Users, FileText, Cpu, Zap, Activity, Clock, 
  ArrowUpRight, ArrowDownRight, ShieldCheck, Database, LayoutDashboard
} from 'lucide-react';

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

const accuracyData = [
  { name: '01:00', value: 98.2 },
  { name: '04:00', value: 98.5 },
  { name: '08:00', value: 97.9 },
  { name: '12:00', value: 99.1 },
  { name: '16:00', value: 98.8 },
  { name: '20:00', value: 99.3 },
  { name: '23:00', value: 99.5 },
];

const storageData = [
  { name: 'PDF', value: 400, color: '#4f46e5' },
  { name: 'Docx', value: 300, color: '#818cf8' },
  { name: 'TXT', value: 200, color: '#a5b4fc' },
  { name: 'Web', value: 100, color: '#c7d2fe' },
];

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <LayoutDashboard className="text-indigo-500" size={32} />
              Sistem Özeti
            </h1>
            <p className="mt-2 text-gray-400">Platform performansını ve kullanım verilerini gerçek zamanlı takip edin.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-gray-950 bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                  U{i}
                </div>
              ))}
              <div className="h-10 w-10 rounded-full border-2 border-gray-950 bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                +12
              </div>
            </div>
            <button className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
              <Zap size={18} /> Rapor Al
            </button>
          </div>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Toplam Analiz" 
            value="12,482" 
            change="+12.5%" 
            isPositive={true} 
            icon={<FileText className="text-indigo-400" />} 
          />
          <StatCard 
            title="Aktif Sorgular" 
            value="842" 
            change="+5.2%" 
            isPositive={true} 
            icon={<Cpu className="text-emerald-400" />} 
          />
          <StatCard 
            title="Hata Oranı" 
            value="%0.04" 
            change="-2.1%" 
            isPositive={true} 
            icon={<ShieldCheck className="text-amber-400" />} 
          />
          <StatCard 
            title="Kullanılan Kredi" 
            value="42.8k" 
            change="+18.4%" 
            isPositive={false} 
            icon={<Zap className="text-indigo-400" />} 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart - Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            className="lg:col-span-2 rounded-3xl border border-gray-800 bg-gray-900/30 p-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Analiz Trafiği</h3>
                <p className="text-sm text-gray-500">Günlük işlenen toplam AI sorgusu</p>
              </div>
              <div className="flex gap-2 rounded-xl bg-gray-950 p-1">
                {['Gün', 'Hafta', 'Ay'].map(t => (
                  <button key={t} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${t === 'Hafta' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[350px] w-full">
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
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Side Chart - Pie */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8 backdrop-blur-sm"
          >
            <h3 className="text-xl font-bold text-white mb-2">Veri Kaynakları</h3>
            <p className="text-sm text-gray-500 mb-8">Doküman türü dağılımı</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {storageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-4">
              {storageData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-400 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-white font-bold">{item.value} Dosya</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Accuracy Chart - Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            className="lg:col-span-3 rounded-3xl border border-gray-800 bg-gray-900/30 p-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Sistem Doğruluğu</h3>
                <p className="text-sm text-gray-500">Saatlik RAG doğruluk skorları</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                <Activity size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Optimal Çalışma</span>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[95, 100]} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} hide />
                  <Tooltip 
                    cursor={{ fill: '#374151', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40}>
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 99 ? '#10b981' : '#4f46e5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          className="rounded-3xl border border-gray-800 bg-gray-900/30 p-8 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Son Etkinlikler</h3>
            <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300">Tümünü Gör</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 text-xs font-bold uppercase tracking-widest text-gray-500">
                  <th className="pb-4 px-2">Doküman</th>
                  <th className="pb-4 px-2">Durum</th>
                  <th className="pb-4 px-2">Zaman</th>
                  <th className="pb-4 px-2 text-right">Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                <RecentRow name="Finansal_Rapor_Q4.pdf" status="Analiz Edildi" time="2 dk önce" score="0.98" />
                <RecentRow name="Teknik_Sartname_v2.docx" status="Kuyrukta" time="15 dk önce" score="-" />
                <RecentRow name="Pazar_Arastirmasi.pdf" status="Analiz Edildi" time="1 saat önce" score="0.94" />
                <RecentRow name="Kullanım_Kilavuzu.txt" status="Hata" time="3 saat önce" score="0.00" />
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon }: { title: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900/40 p-6 shadow-lg hover:border-indigo-500/30 transition-all group">
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

function RecentRow({ name, status, time, score }: { name: string, status: string, time: string, score: string }) {
  const isError = status === 'Hata';
  const isPending = status === 'Kuyrukta';

  return (
    <tr className="group hover:bg-white/[0.02] transition-colors">
      <td className="py-4 px-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-950 flex items-center justify-center text-gray-400 group-hover:text-indigo-400 transition-colors">
            <FileText size={18} />
          </div>
          <span className="text-sm font-bold text-gray-200">{name}</span>
        </div>
      </td>
      <td className="py-4 px-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
          isError ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 
          isPending ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' :
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
        }`}>
          {status}
        </span>
      </td>
      <td className="py-4 px-2 text-sm text-gray-500 font-medium">
        <div className="flex items-center gap-2">
          <Clock size={14} />
          {time}
        </div>
      </td>
      <td className="py-4 px-2 text-right">
        <span className={`text-sm font-mono font-bold ${score === '0.00' ? 'text-rose-400' : 'text-indigo-400'}`}>
          {score}
        </span>
      </td>
    </tr>
  );
}
