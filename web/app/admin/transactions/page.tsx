'use client';

import { CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';

const INVOICES = [
  { id: 'INV-2026-04-015', bank: 'BNI',         tranche: '0–250k',       amountHT: 1_500,  amountTTC: 1_770,  status: 'paid',    date: '06 Avr 2026' },
  { id: 'INV-2026-04-012', bank: 'Coris Bank',   tranche: '600k–800k',    amountHT: 7_500,  amountTTC: 8_850,  status: 'pending', date: '05 Avr 2026' },
  { id: 'INV-2026-04-008', bank: 'NSIA Banque',  tranche: '800k–1 200k',  amountHT: 12_500, amountTTC: 14_750, status: 'paid',    date: '02 Avr 2026' },
  { id: 'INV-2026-03-094', bank: 'SIB',          tranche: '250k–600k',    amountHT: 4_000,  amountTTC: 4_720,  status: 'overdue', date: '15 Mar 2026' },
];

const STATUS_CONFIG = {
  paid:    { icon: <CheckCircle size={24} />, bg: 'bg-green-500/20', color: 'text-green-500',  label: 'Payée' },
  pending: { icon: <Clock size={24} />,       bg: 'bg-blue-500/20',  color: 'text-blue-400',   label: 'En attente' },
  overdue: { icon: <AlertCircle size={24} />, bg: 'bg-red-500/20',   color: 'text-red-500',    label: 'En retard' },
};

const CPL_RATES = [
  { tranche: '0–250k',        ht: '1 500 F' },
  { tranche: '250k–600k',     ht: '4 000 F' },
  { tranche: '600k–800k',     ht: '7 500 F' },
  { tranche: '800k–1 200k',   ht: '12 500 F' },
  { tranche: '1 200k+',       ht: '15 000 F', accent: true },
];

export default function TransactionsPage() {
  const fmt = (n: number) => n.toLocaleString('fr-FR');

  return (
    <div className="space-y-6 [animation:var(--animate-fadeIn)]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Suivi Financier & Facturation</h1>
          <p className="text-slate-400">Suivi des paiements B2B par accès de leads.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-sm text-white transition-colors">
          <Download size={16} /> Exporter CSV
        </button>
      </div>

      {/* Grille CPL */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex gap-8 overflow-x-auto text-sm">
        {CPL_RATES.map((r, i) => (
          <div key={r.tranche} className={`shrink-0 ${i > 0 ? 'border-l border-slate-700 pl-8' : ''}`}>
            <span className="block text-slate-500 font-semibold mb-1">Palier {i + 1} ({r.tranche})</span>
            <span className={`font-bold ${r.accent ? 'text-[color:var(--color-fintech-accent)]' : 'text-white'}`}>
              {r.ht} HT
            </span>
          </div>
        ))}
      </div>

      {/* Liste factures */}
      <div className="grid grid-cols-1 gap-4">
        {INVOICES.map(inv => {
          const cfg = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG];
          return (
            <div key={inv.id}
              className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.icon}</div>
                <div>
                  <p className="text-white font-bold">{inv.id}</p>
                  <p className="text-slate-400 text-sm">{inv.bank} — Tranche {inv.tranche}</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className="text-slate-500 text-xs">Montant HT</p>
                  <p className="text-white font-black">{fmt(inv.amountHT)} F</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">TTC (18%)</p>
                  <p className="text-[color:var(--color-fintech-accent)] font-black">{fmt(inv.amountTTC)} F</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Date</p>
                  <p className="text-slate-300 text-sm font-bold">{inv.date}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${cfg.bg} ${cfg.color} border border-current/20`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
