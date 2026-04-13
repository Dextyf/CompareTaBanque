import React from 'react';
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Transactions() {
  
  // Paliers basés sur le PRD v1.4
  const invoices = [
    { id: 'INV-2026-04-015', bank: 'BNI', tranche: '0-250k', amountHT: 1500, amountTTC: 1770, status: 'paid', date: '06 Avr 2026' },
    { id: 'INV-2026-04-012', bank: 'Coris Bank', tranche: '600k-800k', amountHT: 7500, amountTTC: 8850, status: 'pending', date: '05 Avr 2026' },
    { id: 'INV-2026-04-008', bank: 'NSIA Banque', tranche: '800k-1200k', amountHT: 12500, amountTTC: 14750, status: 'paid', date: '02 Avr 2026' },
    { id: 'INV-2026-03-094', bank: 'SIB', tranche: '250k-600k', amountHT: 4000, amountTTC: 4720, status: 'overdue', date: '15 Mar 2026' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Suivi Financier & Facturation</h1>
          <p className="text-slate-400">Suivi des paiements B2B par accès de leads.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-sm text-white transition-colors">
           <Download size={16} /> Exporter CSV
        </button>
      </div>

      {/* Pricing Grid Reminder */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 mt-4 mb-8 flex gap-8 overflow-x-auto text-sm">
        <div className="shrink-0">
          <span className="block text-slate-500 font-semibold mb-1">Palier 1 (0-250k)</span>
          <span className="text-white font-bold">1 500 F HT</span>
        </div>
        <div className="shrink-0 border-l border-slate-700 pl-8">
          <span className="block text-slate-500 font-semibold mb-1">Palier 2 (250-600k)</span>
          <span className="text-white font-bold">4 000 F HT</span>
        </div>
        <div className="shrink-0 border-l border-slate-700 pl-8">
          <span className="block text-slate-500 font-semibold mb-1">Palier 3 (600-800k)</span>
          <span className="text-white font-bold">7 500 F HT</span>
        </div>
        <div className="shrink-0 border-l border-slate-700 pl-8">
          <span className="block text-slate-500 font-semibold mb-1">Palier 4 (800-1.2M)</span>
          <span className="text-white font-bold">12 500 F HT</span>
        </div>
        <div className="shrink-0 border-l border-slate-700 pl-8">
          <span className="block text-slate-500 font-semibold mb-1">Palier 5 (1.2M+)</span>
          <span className="text-fintech-accent font-bold">15 000 F HT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {invoices.map((inv) => (
          <div key={inv.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-600 transition-colors">
             <div className="flex items-center gap-4">
               <div className={`p-3 rounded-full ${
                 inv.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                 inv.status === 'pending' ? 'bg-blue-500/20 text-blue-400' : 
                 'bg-red-500/20 text-red-500'
               }`}>
                 {inv.status === 'paid' && <CheckCircle size={24} />}
                 {inv.status === 'pending' && <Clock size={24} />}
                 {inv.status === 'overdue' && <AlertCircle size={24} />}
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   {inv.bank} <span className="text-xs font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-400">{inv.id}</span>
                 </h3>
                 <p className="text-sm text-slate-500">Tranche: {inv.tranche} • Émis le {inv.date}</p>
               </div>
             </div>

             <div className="flex items-center justify-between md:justify-end gap-8">
               <div className="text-right">
                 <p className="text-sm text-slate-400">Montant HT</p>
                 <p className="font-semibold text-white">{new Intl.NumberFormat('fr-FR').format(inv.amountHT)} F</p>
               </div>
               <div className="text-right border-l border-slate-700 pl-8">
                 <p className="text-sm text-slate-400">Total TTC (18%)</p>
                 <p className="font-bold text-fintech-accent text-lg">{new Intl.NumberFormat('fr-FR').format(inv.amountTTC)} F</p>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
