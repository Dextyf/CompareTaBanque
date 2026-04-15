'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, TrendingUp } from 'lucide-react';

interface SimParams {
  initialDeposit: number;
  monthlyDeposit: number;
  years: number;
  rate: number;
}

interface SimResult {
  total: number;
  invested: number;
  interests: number;
}

const BANKS = [
  { name: 'Bridge Bank — Plan Épargne Immobilier / Étude', rate: 4.5  },
  { name: 'Coris Bank — Épargne Prestige',                 rate: 5    },
  { name: 'Coris Bank — Taloklama (Femmes)',               rate: 3.75 },
  { name: 'NSIA Banque — Épargne',                         rate: 3.5  },
  { name: 'BNI — Épargne',                                 rate: 3.5  },
  { name: 'SIB — Plan Éducation',                          rate: 3.5  },
];

export default function SimulateurPage() {
  const router = useRouter();
  const [params, setParams] = useState<SimParams>({
    initialDeposit: 50000,
    monthlyDeposit: 25000,
    years: 5,
    rate: 5,
  });
  const [result, setResult] = useState<SimResult | null>(null);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const { initialDeposit, monthlyDeposit, years, rate } = params;
    let total      = Number(initialDeposit);
    const mRate    = Number(rate) / 100 / 12;
    const months   = Number(years) * 12;
    for (let i = 0; i < months; i++) {
      total += Number(monthlyDeposit);
      total  = total * (1 + mRate);
    }
    const totalInvested = Number(initialDeposit) + Number(monthlyDeposit) * months;
    setResult({
      total:     Math.round(total),
      invested:  Math.round(totalInvested),
      interests: Math.round(total - totalInvested),
    });
  };

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-slate-500 mb-6 hover:text-[color:var(--color-fintech-blue)] font-semibold"
        >
          <ArrowLeft size={20} className="mr-2" /> Retour au Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">

          {/* ── Formulaire ──────────────────────────────────── */}
          <div className="md:w-1/2 p-8 bg-slate-50 border-r border-slate-100">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
              <div className="bg-[color:var(--color-fintech-blue)] p-3 rounded-xl text-white">
                <Calculator size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Simulateur d&apos;Épargne</h2>
                <p className="text-sm text-slate-500">Anticipez vos gains futurs</p>
              </div>
            </div>

            <form onSubmit={calculate} className="space-y-6">
              <SimInput
                label="Dépôt initial (FCFA)"
                value={params.initialDeposit}
                onChange={v => setParams(p => ({ ...p, initialDeposit: Number(v) }))}
                type="number" min={0}
              />
              <SimInput
                label="Versement mensuel (FCFA)"
                value={params.monthlyDeposit}
                onChange={v => setParams(p => ({ ...p, monthlyDeposit: Number(v) }))}
                type="number" min={0}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Durée : <span className="text-[color:var(--color-fintech-blue)]">{params.years} ans</span>
                </label>
                <input
                  type="range" min={1} max={25} value={params.years}
                  onChange={e => setParams(p => ({ ...p, years: Number(e.target.value) }))}
                  className="w-full accent-[color:var(--color-fintech-accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Banque &amp; Taux</label>
                <select
                  value={params.rate}
                  onChange={e => setParams(p => ({ ...p, rate: Number(e.target.value) }))}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white font-medium focus:border-[color:var(--color-fintech-blue)] outline-none"
                >
                  {BANKS.map(b => (
                    <option key={b.name} value={b.rate}>{b.name} ({b.rate}%/an)</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[color:var(--color-fintech-blue)] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Calculer
              </button>
            </form>
          </div>

          {/* ── Résultats ────────────────────────────────────── */}
          <div className="md:w-1/2 p-8 bg-gradient-to-br from-white to-slate-50 flex flex-col justify-center items-center text-center">
            {result ? (
              <div className="w-full [animation:var(--animate-fadeIn)]">
                <TrendingUp size={48} className="text-[color:var(--color-fintech-accent)] mx-auto mb-6" />
                <h3 className="text-slate-500 font-semibold uppercase tracking-wider text-sm mb-2">
                  Capital Final Estimé
                </h3>
                <div className="text-5xl font-extrabold text-slate-800 mb-8 break-words text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--color-fintech-dark)] to-[color:var(--color-fintech-blue)]">
                  {fmt(result.total)} <span className="text-2xl text-slate-500 font-bold">F</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Total Investi</span>
                    <span className="font-bold text-slate-800">{fmt(result.invested)} F</span>
                  </div>
                  <div className="flex justify-between bg-green-50 p-3 rounded-lg border border-green-100">
                    <span className="text-green-700 font-medium">Intérêts Gagnés (+{params.rate}%)</span>
                    <span className="font-bold text-[color:var(--color-fintech-accent)]">+{fmt(result.interests)} F</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 p-8">
                <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                <p>Ajustez les valeurs et cliquez sur &laquo;&nbsp;Calculer&nbsp;&raquo; pour voir la projection.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimInput({ label, value, onChange, type, min }: {
  label: string; value: number;
  onChange: (v: string) => void;
  type?: string; min?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input
        type={type ?? 'text'} value={value} min={min}
        onChange={e => onChange(e.target.value)}
        className="w-full p-4 rounded-xl border border-slate-200 focus:border-[color:var(--color-fintech-blue)] outline-none"
      />
    </div>
  );
}
