'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({ total: 0, granted: 0, pending: 0 });

  useEffect(() => {
    supabase.from('prospects').select('consent_given').then(({ data }) => {
      if (!data) return;
      const granted = data.filter(p => p.consent_given).length;
      setStats({ total: data.length, granted, pending: data.length - granted });
    });
  }, []);

  return (
    <div className="space-y-8 [animation:var(--animate-fadeIn)]">
      <div>
        <h1 className="text-3xl font-bold text-white">KPIs & Overview</h1>
        <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">
          Tableau de bord administrateur
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={<Users size={28} />}       label="Total Prospects"  value={stats.total}   color="text-blue-400"  bg="bg-blue-500/10" />
        <StatCard icon={<CheckCircle size={28} />}  label="Consentements OK" value={stats.granted} color="text-green-400" bg="bg-green-500/10" />
        <StatCard icon={<Clock size={28} />}        label="En attente"       value={stats.pending} color="text-orange-400" bg="bg-orange-500/10" />
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-[color:var(--color-fintech-accent)]" />
          Paliers CPL actifs (PRD v1.4)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-widest">
                <th className="text-left pb-4">Tranche Revenu</th>
                <th className="text-right pb-4">Prix HT (FCFA)</th>
                <th className="text-right pb-4">Prix TTC</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {CPL_RATES.map(r => (
                <tr key={r.tranche} className="border-t border-slate-700/50">
                  <td className="py-3 text-slate-300 font-bold">{r.tranche}</td>
                  <td className="py-3 text-right text-white font-black">{r.ht.toLocaleString('fr-FR')} F</td>
                  <td className="py-3 text-right text-[color:var(--color-fintech-accent)] font-black">{r.ttc.toLocaleString('fr-FR')} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 flex items-start gap-4">
      <div className={`${bg} ${color} p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

const CPL_RATES = [
  { tranche: '0 – 250 000 F',          ht: 1_500,  ttc: 1_770  },
  { tranche: '250 000 – 600 000 F',    ht: 4_000,  ttc: 4_720  },
  { tranche: '600 000 – 800 000 F',    ht: 7_500,  ttc: 8_850  },
  { tranche: '800 000 – 1 200 000 F',  ht: 12_500, ttc: 14_750 },
  { tranche: '1 200 000 F+',           ht: 15_000, ttc: 17_700 },
];
