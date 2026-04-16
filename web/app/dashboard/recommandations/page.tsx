'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, FileText, Trophy, Calendar, TrendingUp, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TopBank {
  name: string;
  code: string;
  score: number;
  probabilite?: string;
  taux_estime?: string;
}

interface Comparison {
  id: string;
  created_at: string;
  selected_bank_name: string;
  selected_bank_code: string;
  selected_bank_score: number;
  income_bracket: string;
  top_banks: TopBank[];
  profile_snapshot: Record<string, unknown>;
}

const GRADE_COLOR: Record<string, string> = {
  '1200k+':     '#005596',
  '800k-1200k': '#1A75C2',
  '600k-800k':  '#8DC63F',
  '250k-600k':  '#f59e0b',
  '0-250k':     '#94a3b8',
};

const LOGO = (code: string) =>
  code === 'SGCI' ? '/logos/sgbci.png' : `/logos/${code.toLowerCase()}.png`;

export default function RecommandationsPage() {
  const router   = useRouter();
  const supabase = createClient();
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading,     setLoading]     = useState(true);

  const goToComparateur = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/auth'); return; }
      const hasConsent = localStorage.getItem(`ctb_consent_${session.user.id}`) === 'granted';
      router.push(hasConsent ? '/comparateur' : '/consent');
    } catch { router.push('/auth'); }
  };

  useEffect(() => {
    supabase
      .from('user_comparisons')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setComparisons(data as Comparison[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-4 border-[color:var(--color-fintech-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (comparisons.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Mes Recommandations</h1>
        <p className="text-slate-500 font-bold mb-10">Vos analyses bancaires personnalisées.</p>
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center shadow-sm">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="font-black text-slate-700 text-xl mb-2">Aucune comparaison effectuée</h3>
          <p className="text-slate-400 font-medium mb-8 max-w-sm mx-auto">
            Lancez votre première comparaison pour obtenir des recommandations personnalisées.
          </p>
          <button onClick={goToComparateur}
            className="inline-flex items-center gap-2 bg-[color:var(--color-fintech-blue)] text-white px-8 py-4 rounded-full font-black hover:bg-slate-900 transition-all">
            Lancer une comparaison <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">Mes Recommandations</h1>
          <p className="text-slate-500 font-bold">{comparisons.length} analyse{comparisons.length > 1 ? 's' : ''} réalisée{comparisons.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={goToComparateur}
          className="hidden sm:flex items-center gap-2 bg-[color:var(--color-fintech-blue)] text-white px-6 py-3 rounded-full font-black hover:bg-slate-900 transition-all text-sm">
          Nouvelle analyse <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-6">
        {comparisons.map((c, i) => {
          const profile = c.profile_snapshot as Record<string, unknown>;
          const isPME   = profile?.company_type === 'PME';
          const accentColor = GRADE_COLOR[c.income_bracket] ?? '#005596';
          const date = new Date(c.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
          });

          return (
            <div key={c.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

              {/* Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100"
                style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                    style={{ background: accentColor }}>
                    #{comparisons.length - i}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">
                      {isPME ? 'Entreprise' : 'Particulier'} · {String(profile?.statut ?? profile?.type_pme ?? '').replace('_', ' ')}
                    </p>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mt-0.5">
                      <Calendar size={11} /> {date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Banque choisie</p>
                  <div className="flex items-center gap-2 mt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={LOGO(c.selected_bank_code)}
                      alt={c.selected_bank_name}
                      className="h-7 w-auto object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="font-black text-slate-900 text-sm">{c.selected_bank_name}</p>
                    <span className="font-black text-sm" style={{ color: accentColor }}>{c.selected_bank_score}%</span>
                  </div>
                </div>
              </div>

              {/* Top 3 */}
              <div className="px-8 py-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Trophy size={12} className="text-amber-400" /> Top 3 banques recommandées
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(c.top_banks as TopBank[]).slice(0, 3).map((bank, rank) => (
                    <div key={bank.code}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${
                        bank.code === c.selected_bank_code
                          ? 'border-[color:var(--color-fintech-blue)] bg-blue-50'
                          : 'border-slate-100 bg-slate-50'
                      }`}>
                      <span className={`text-lg font-black ${rank === 0 ? 'text-amber-400' : rank === 1 ? 'text-slate-400' : 'text-amber-600'}`}>
                        {rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={LOGO(bank.code)} alt={bank.name}
                            className="h-5 w-auto object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <p className="font-black text-slate-800 text-xs truncate">{bank.name}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp size={10} className="text-[color:var(--color-fintech-accent)]" />
                          <span className="text-[11px] font-black" style={{ color: accentColor }}>{bank.score}%</span>
                          {bank.probabilite && (
                            <span className="text-[10px] text-slate-400 font-bold">· {bank.probabilite}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profil financier */}
              <div className="px-8 pb-5 flex flex-wrap gap-3">
                {!!profile?.monthly_income && (
                  <Chip icon={<TrendingUp size={11} />} label={`${Number(profile.monthly_income).toLocaleString('fr-FR')} FCFA / mois`} />
                )}
                {!!profile?.needs_credit && String(profile.needs_credit) !== 'no' && (
                  <Chip icon={<Building2 size={11} />} label={`Crédit ${String(profile.type_credit ?? '')} · ${Number(profile.montant_demande ?? 0).toLocaleString('fr-FR')} FCFA`} />
                )}
                {c.income_bracket && (
                  <Chip icon={<span style={{ color: accentColor }}>●</span>} label={`Tranche ${c.income_bracket}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={goToComparateur}
          className="flex sm:hidden items-center gap-2 bg-[color:var(--color-fintech-blue)] text-white px-8 py-4 rounded-full font-black hover:bg-slate-900 transition-all">
          Nouvelle comparaison <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">
      {icon} {label}
    </span>
  );
}
