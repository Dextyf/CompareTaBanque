'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Prospect {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  consent_given?: boolean;
  consent_status?: string;
  account_type?: string;
  needs_credit?: string;
  monthly_income?: number;
  created_at?: string;
}

const STATUS_BADGE: Record<string, React.ReactNode> = {
  granted: <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">Consentement OK</span>,
  pending: <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">En attente</span>,
};

export default function LeadsManagerPage() {
  const supabase = createClient();
  const [filter,     setFilter]     = useState('ALL');
  const [search,     setSearch]     = useState('');
  const [prospects,  setProspects]  = useState<Prospect[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setProspects(data);
        setLoading(false);
      });
  }, []);

  const filtered = prospects.filter(p => {
    const matchStatus = filter === 'ALL' || p.consent_status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 [animation:var(--animate-fadeIn)]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Leads</h1>
          <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">
            {filtered.length} prospect(s)
          </p>
        </div>

        {/* Barre de recherche + filtres */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nom, email, téléphone…"
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-sm text-white focus:outline-none focus:border-[color:var(--color-fintech-accent)] transition-colors w-56"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {(['ALL', 'granted', 'pending'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-[color:var(--color-fintech-accent)] text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                }`}>
                {f === 'ALL' ? 'Tous' : f === 'granted' ? 'Actifs' : 'Attente'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-bold animate-pulse">
          Chargement des prospects…
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 font-bold">
          Aucun prospect trouvé.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-slate-800">
                {['Nom', 'Email', 'Téléphone', 'Type', 'Crédit', 'Revenu', 'Statut', 'Date'].map(h => (
                  <th key={h} className="text-left pb-4 pr-4 font-black">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 pr-4 font-bold text-white">{p.full_name ?? '—'}</td>
                  <td className="py-4 pr-4 text-slate-400">{p.email ?? '—'}</td>
                  <td className="py-4 pr-4 text-slate-400">{p.phone ?? '—'}</td>
                  <td className="py-4 pr-4 text-slate-400 capitalize">{p.account_type ?? '—'}</td>
                  <td className="py-4 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-black uppercase ${p.needs_credit === 'yes' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                      {p.needs_credit === 'yes' ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-slate-400">
                    {p.monthly_income ? `${p.monthly_income.toLocaleString('fr-FR')} F` : '—'}
                  </td>
                  <td className="py-4 pr-4">
                    {STATUS_BADGE[p.consent_status ?? ''] ?? (
                      <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                        {p.consent_status ?? 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-slate-500 text-xs">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
