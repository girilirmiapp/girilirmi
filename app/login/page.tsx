'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Başarıyla giriş yapıldı!');
        router.push('/dashboard');
        router.refresh();
      } else {
        throw new Error('Oturum açılamadı. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Giriş başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(79,70,229,0.1)_0%,transparent_100%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-xl text-white shadow-lg shadow-indigo-600/20 mb-4 hover:scale-110 transition-transform">G</Link>
            <h1 className="text-3xl font-bold tracking-tight text-white">Tekrar Hoşgeldiniz</h1>
            <p className="mt-2 text-sm text-gray-400">Hesabınıza giriş yaparak devam edin.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">E-posta</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  name="email" 
                  type="email" 
                  required 
                  disabled={loading}
                  className="w-full rounded-2xl border border-gray-800 bg-gray-950 py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-600 disabled:opacity-50" 
                  placeholder="isim@sirket.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-gray-300">Şifre</label>
                <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Şifremi Unuttum</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  name="password" 
                  type="password" 
                  required 
                  disabled={loading}
                  className="w-full rounded-2xl border border-gray-800 bg-gray-950 py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-600 disabled:opacity-50" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-600/20 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              {!loading && <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Henüz hesabınız yok mu? {' '}
              <Link href="/register" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Hemen Kaydolun</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
