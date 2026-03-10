"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    
    try {
      // 1. Try to Login
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // 2. If Login Fails, Try to Sign Up (Frictionless)
        // Check if the error is "Invalid login credentials" which usually means user might not exist or wrong password
        // But for frictionless flow, we will attempt sign up if it's a new user scenario.
        // However, a safer approach for "Frictionless Fallback" as requested:
        
        console.log("Login failed, attempting signup...", signInError.message);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) {
          throw new Error(signUpError.message);
        }
        
        if (signUpData.session) {
          toast.success('Hesap oluşturuldu ve giriş yapıldı!');
          router.push('/dashboard');
        } else if (signUpData.user) {
          // Sometimes email confirmation is required, but if disabled in supabase, session is returned
           toast.success('Hesap oluşturuldu! Lütfen emailinizi kontrol edin (eğer zorunluysa).');
           // In development/frictionless often session is returned immediately if email confirm is off
           // If session is null but user exists, likely email confirm needed.
           if (!signUpData.session) {
             toast.info("Lütfen email adresinizi doğrulayın.");
           }
        }
      } else {
        // Login Successful
        toast.success('Giriş başarılı');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] -z-10"></div>
      
      <div className="w-full max-w-md bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-600/20">
             <Terminal size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">GİRİLİRMİ</h1>
          <p className="text-zinc-500 text-sm mt-2">Yapay Zeka Destekli Analiz Platformu</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
              placeholder="ornek@sirket.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Şifre</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sisteme Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Hesabınız yoksa otomatik oluşturulacaktır.
        </p>
      </div>
    </div>
  );
}