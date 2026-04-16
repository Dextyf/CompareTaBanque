'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, LogOut, FileText, Settings, PieChart,
  TrendingUp, Menu, X, ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { name: 'Vue d\'ensemble',        path: '/dashboard',              icon: <LayoutDashboard size={22} /> },
  { name: 'Mes Recommandations',    path: '/dashboard/recommandations', icon: <FileText size={22} /> },
  { name: 'Comparateur Manuel',     path: '/dashboard/selective',    icon: <PieChart size={22} /> },
  { name: 'Simulateur d\'épargne',  path: '/simulateur',             icon: <TrendingUp size={22} /> },
  { name: 'Paramètres du compte',   path: '/dashboard/settings',     icon: <Settings size={22} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isMobileMenuOpen, setMobileMenu] = useState(false);
  const [userData, setUserData]           = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/auth'); return; }

      setUserData({ email: session.user.email ?? '' });

      const { data } = await supabase
        .from('prospects')
        .select('full_name, email')
        .eq('auth_user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) setUserData(data);
    }
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => router.push('/')}>
        <Image src="/logos/logo-compare-ta-banque.png" alt="CTB" width={160} height={60}
          className="h-14 w-auto object-contain bg-white rounded-xl p-2" />
      </div>

      {userData && (
        <div className="px-8 py-6 border-b border-white/5">
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
            <div className="bg-[color:var(--color-fintech-accent)] w-10 h-10 rounded-full flex items-center justify-center text-white font-black">
              {(userData.full_name ?? userData.email ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">{userData.full_name ?? userData.email}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck size={10} className="text-[color:var(--color-fintech-accent)]" /> Compte vérifié
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-6 py-6 space-y-2">
        {NAV_ITEMS.map(item => (
          <Link key={item.path} href={item.path}
            onClick={() => setMobileMenu(false)}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
              pathname === item.path
                ? 'bg-[color:var(--color-fintech-blue)] text-white shadow-lg shadow-blue-900/30'
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`}>
            {item.icon} {item.name}
          </Link>
        ))}
      </nav>

      <div className="px-6 pb-8">
        <button onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all w-full">
          <LogOut size={22} /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* ── Sidebar desktop ───────────────────────────────────── */}
      <aside className="w-80 bg-[color:var(--color-fintech-dark)] text-white hidden lg:flex flex-col shadow-3xl z-40 border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* ── Sidebar mobile overlay ────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />
          <aside className="relative w-80 bg-[color:var(--color-fintech-dark)] text-white flex flex-col h-full shadow-3xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Contenu principal ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shadow-sm">
          <button onClick={() => setMobileMenu(true)} className="text-slate-700">
            <Menu size={28} />
          </button>
          <Image src="/logos/logo-compare-ta-banque.png" alt="CTB" width={100} height={40}
            className="h-10 w-auto object-contain" />
          <button onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors" title="Déconnexion">
            <LogOut size={22} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
