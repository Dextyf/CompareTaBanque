'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, CreditCard, Lock, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { path: '/admin',              name: 'KPIs & Overview',     icon: <LayoutDashboard size={20} /> },
  { path: '/admin/leads',        name: 'Gestion des Leads',   icon: <Users size={20} /> },
  { path: '/admin/transactions', name: 'Suivi Financier',     icon: <CreditCard size={20} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setAdminEmail(session.user.email ?? null);
      else router.push('/auth');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push('/auth');
      else setAdminEmail(session.user.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (!adminEmail) return null;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300 font-sans overflow-hidden">

      {/* ── Sidebar Admin ─────────────────────────────────────── */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800 bg-slate-900 cursor-pointer hover:bg-slate-800 transition-colors"
          onClick={() => router.push('/')}>
          <Image src="/logos/logo-compare-ta-banque.png" alt="CTB" width={120} height={40}
            className="h-10 w-auto object-contain bg-white rounded-lg p-1.5 mb-3" />
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest">
            <Lock size={14} /> Panel Admin
          </div>
        </div>

        <div className="px-6 mt-6 mb-2">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">Administrateur</p>
        </div>
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{adminEmail.split('@')[0]}</p>
              <p className="text-[10px] text-slate-500">Accès total</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {NAV.map(item => (
            <Link key={item.path} href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                pathname === item.path
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}>
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-6">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition-all w-full">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
