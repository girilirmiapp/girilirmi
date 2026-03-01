'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Sistem yapılandırma hatası: Sunucu bağlantısı kurulamadı (ENV missing).');
      }

      // 1. Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        toast.success('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın veya giriş yapın.');
        
        // Some Supabase configs auto-login after signup, others don't.
        // We'll redirect to login to be safe, unless a session was automatically created.
        if (data.session) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
        router.refresh();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(79,70,229,0.1)_0%,transparent_100%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-xl text-white shadow-lg shadow-indigo-600/20 mb-4 hover:scale-110 transition-transform">G</Link>
            <h1 className="text-3xl font-bold tracking-tight text-white">Hesap Oluştur</h1>
            <p className="mt-2 text-sm text-gray-400">Ücretsiz deneme sürenizi hemen başlatın.</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Ad Soyad</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  name="fullName" 
                  type="text" 
                  required 
                  disabled={loading}
                  className="w-full rounded-2xl border border-gray-800 bg-gray-950 py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-600 disabled:opacity-50" 
                  placeholder="Ahmet Yılmaz"
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-gray-300 ml-1">Şifre</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  name="password" 
                  type="password" 
                  required 
                  minLength={6}
                  disabled={loading}
                  className="w-full rounded-2xl border border-gray-800 bg-gray-950 py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-600 disabled:opacity-50" 
                  placeholder="Min. 6 karakter"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <ShieldCheck className="text-indigo-400 shrink-0" size={20} />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Kayıt olarak <Link href="#" className="text-indigo-400 hover:underline">Kullanım Koşullarını</Link> ve <Link href="#" className="text-indigo-400 hover:underline">Gizlilik Politikasını</Link> kabul etmiş sayılırsınız.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-600/20 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              {loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
              {!loading && <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Zaten hesabınız var mı? {' '}
              <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Giriş Yapın</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
