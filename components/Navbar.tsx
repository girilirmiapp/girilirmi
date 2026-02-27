'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  LayoutDashboard, LogOut, User, 
  Settings, HelpCircle, Menu, X, 
  ChevronDown, Bell, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const [supabase] = useState(() => createSupabaseClient());

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh(); // Refresh to update server-side components if any
    });

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [supabase.auth, router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Başarıyla çıkış yapıldı.');
      setUser(null);
      setIsUserMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast.error('Çıkış yapılırken bir hata oluştu.');
    }
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? 'bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-lg text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">G</div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">Girilirmi</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/" active={pathname === '/'}>Ana Sayfa</NavLink>
          <NavLink href="/#features">Özellikler</NavLink>
          <NavLink href="/#pricing">Fiyatlandırma</NavLink>
          
          <div className="h-6 w-px bg-gray-800" />

          {loading ? (
            <div className="h-10 w-24 rounded-2xl bg-gray-900 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-5">
              <button className="text-gray-400 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-500" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/50 pl-2 pr-4 py-1.5 hover:border-gray-700 transition-all"
                >
                  <div className="h-8 w-8 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <User size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-none mb-1 truncate max-w-[100px]">{user.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-indigo-400 font-medium leading-none">Pro Plan</p>
                  </div>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl border border-gray-800 bg-gray-900 p-2 shadow-2xl"
                    >
                      <UserMenuItem href="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
                      <UserMenuItem href="/profile" icon={<User size={16} />} label="Profilim" />
                      <UserMenuItem href="/settings" icon={<Settings size={16} />} label="Ayarlar" />
                      <div className="my-2 border-t border-gray-800" />
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut size={16} /> Çıkış Yap
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Giriş Yap</Link>
              <Link href="/register" className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                <Sparkles size={16} /> Ücretsiz Dene
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-gray-950 p-10 md:hidden"
          >
            <div className="flex flex-col gap-8 items-center justify-center h-full">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-white">Ana Sayfa</Link>
              <Link href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-white">Özellikler</Link>
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-white">Dashboard</Link>
              {user ? (
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="text-2xl font-bold text-red-400"
                >
                  Çıkış Yap
                </button>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-indigo-400">Giriş Yap</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, children, active }: { href: string, children: React.ReactNode, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`text-sm font-bold transition-all hover:text-indigo-400 ${active ? 'text-indigo-400' : 'text-gray-400'}`}
    >
      {children}
    </Link>
  );
}

function UserMenuItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
    >
      {icon} {label}
    </Link>
  );
}
