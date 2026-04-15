'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, TrendingUp, FileText, PieChart, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ProspectData {
  full_name?: string;
  email?: string;
  needs_credit?: string;
  monthly_income?: number;
  company_type?: string;
}

export default function DashboardHomePage() {
  const router   = useRouter();
  const supabase = createClient();
  const [userData, setUserData] = useState<ProspectData | null>(null);

  useEffect(() => {
    supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setUserData(data); });
  }, []);

  /** Redirige vers /comparateur si consentement déjà donné, sinon /consent */
  const goToComparateur = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    const hasConsent = uid && localStorage.getItem(`ctb_consent_${uid}`) === 'granted';
    router.push(hasConsent ? '/comparateur' : '/consent');
  };

  const name = userData?.full_name ?? 'Utilisateur';

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
          Bonjour, <span className="text-[color:var(--color-fintech-blue)]">{name}</span> 👋
        </h1>
        <p className="text-slate-500 font-bold mt-2">Votre espace bancaire personnalisé</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <KpiCard icon={<TrendingUp size={28} />} label="Économies potentielles" value="120 000 F/an" color="bg-blue-50 text-[color:var(--color-fintech-blue)]" />
        <KpiCard icon={<FileText size={28} />}   label="Comparaisons réalisées" value="1"              color="bg-green-50 text-green-600" />
        <KpiCard icon={<ShieldCheck size={28} />} label="Données sécurisées"   value="BCEAO 2026"      color="bg-purple-50 text-purple-600" />
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="Nouvelle comparaison"
          desc="Relancez le comparateur avec un profil actualisé."
          icon={<PieChart size={24} />}
          onClick={goToComparateur}
        />
        <ActionCard
          title="Simulateur d'épargne"
          desc="Estimez vos gains avec les meilleurs taux du marché UEMOA."
          icon={<TrendingUp size={24} />}
          onClick={() => router.push('/simulateur')}
        />
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4`}>{icon}</div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick }: {
  title: string; desc: string; icon: React.ReactNode; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-start gap-5">
      <div className="bg-[color:var(--color-fintech-blue)]/10 p-4 rounded-2xl text-[color:var(--color-fintech-blue)] shrink-0">{icon}</div>
      <div className="flex-1">
        <h3 className="font-black text-slate-900 text-lg mb-1">{title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
      </div>
      <ChevronRight size={20} className="text-slate-300 group-hover:text-[color:var(--color-fintech-blue)] group-hover:translate-x-1 transition-all mt-1 shrink-0" />
    </button>
  );
}
