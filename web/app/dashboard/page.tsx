'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, TrendingUp, FileText, PieChart, ShieldCheck, Calendar, Trophy } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface Comparison {
  id: string;
  created_at: string;
  selected_bank_name: string;
  selected_bank_code: string;
  selected_bank_score: number;
  income_bracket: string;
}

interface ProspectData {
  full_name?: string;
  email?: string;
  monthly_income?: number;
  company_type?: string;
}

const LOGO = (code: string) =>
  code === 'SGCI' ? '/logos/sgbci.png' : `/logos/${code.toLowerCase()}.png`;

export default function DashboardHomePage() {
  const router   = useRouter();
  const supabase = createClient();
  const [userData,     setUserData]     = useState<ProspectData | null>(null);
  const [comparisons,  setComparisons]  = useState<Comparison[]>([]);
  const [totalCount,   setTotalCount]   = useState<number>(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Données prospect
      const { data: prospect } = await supabase
        .from('prospects')
        .select('full_name, email, monthly_income, company_type')
        .eq('auth_user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (prospect) setUserData(prospect);

      // Historique comparaisons — 5 dernières pour affichage + count total
      const [{ data: comps }, { count: totalCount }] = await Promise.all([
        supabase
          .from('user_comparisons')
          .select('id, created_at, selected_bank_name, selected_bank_code, selected_bank_score, income_bracket')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('user_comparisons')
          .select('*', { count: 'exact', head: true }),
      ]);
      if (comps) setComparisons(comps as Comparison[]);
      if (totalCount !== null) setTotalCount(totalCount);

      setLoading(false);
    }
    load();
  }, []);

  const goToComparateur = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    const hasConsent = uid && localStorage.getItem(`ctb_consent_${uid}`) === 'granted';
    router.push(hasConsent ? '/comparateur' : '/consent');
  };

  const name       = userData?.full_name ?? userData?.email ?? 'Utilisateur';
  const lastComp   = comparisons[0];
  const totalComps = totalCount; // count réel depuis Supabase

  // Économies estimées : 2% du revenu mensuel * 12
  const savings = userData?.monthly_income
    ? Math.round(userData.monthly_income * 0.02 * 12).toLocaleString('fr-FR') + ' FCFA/an'
    : '—';

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Salutation */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
          Bonjour, <span className="text-[color:var(--color-fintech-blue)]">
            {name.split(' ')[0]}
          </span> 👋
        </h1>
        <p className="text-slate-500 font-bold mt-2">Votre espace bancaire personnalisé — UEMOA 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <KpiCard
          icon={<TrendingUp size={28} />}
          label="Économies potentielles"
          value={loading ? '…' : savings}
          color="bg-blue-50 text-[color:var(--color-fintech-blue)]"
        />
        <KpiCard
          icon={<FileText size={28} />}
          label="Comparaisons réalisées"
          value={loading ? '…' : String(totalComps)}
          color="bg-green-50 text-green-600"
        />
        <KpiCard
          icon={<ShieldCheck size={28} />}
          label="Données sécurisées"
          value="BCEAO 2026"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Dernière comparaison */}
      {lastComp && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Trophy size={12} className="text-amber-400" /> Dernière recommandation
          </p>
          <div className="flex items-center gap-4">
            <Image
              src={LOGO(lastComp.selected_bank_code)}
              alt={lastComp.selected_bank_name}
              width={48} height={48}
              className="h-12 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="flex-1">
              <p className="font-black text-slate-900 text-lg">{lastComp.selected_bank_name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[color:var(--color-fintech-blue)] font-black">{lastComp.selected_bank_score}% compatibilité</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-400 text-sm font-bold flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(lastComp.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            <button onClick={() => router.push('/dashboard/recommandations')}
              className="text-slate-400 hover:text-[color:var(--color-fintech-blue)] transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

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
