import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, User, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function LeadsManager() {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProspects() {
      try {
        const { data, error } = await supabase
          .from('prospects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setProspects(data);
      } catch (err) {
        console.error('Erreur admin prospects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProspects();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'granted': return <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">Consentement OK</span>;
      case 'pending': return <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">En attente</span>;
      default: return <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase text-[9px]">{status || 'N/A'}</span>;
    }
  };

  // Filtrage en temps réel : par statut + par recherche
  const filtered = prospects.filter(p => {
    const matchesFilter = filter === 'ALL' || p.consent_status === filter;
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || 
      p.full_name?.toLowerCase().includes(q) || 
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Leads</h1>
          <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">{filtered.length} prospect(s) affiché(s)</p>
        </div>
        <div className="flex gap-3 items-center">
           <div className="relative">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Nom, email, téléphone..." 
               className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-sm text-white focus:outline-none focus:border-fintech-accent transition-colors w-64" 
             />
             {searchTerm && (
               <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                 <X size={14} />
               </button>
             )}
           </div>
           {/* Filtre par statut */}
           <div className="flex gap-2">
             {['ALL', 'granted', 'pending'].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-fintech-accent text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'}`}
               >
                 {f === 'ALL' ? 'Tous' : f === 'granted' ? 'Actifs' : 'Attente'}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Lead ID</th>
                <th className="px-6 py-4">Prospect</th>
                <th className="px-6 py-4">Profil</th>
                <th className="px-6 py-4">Revenu / CA</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase animate-pulse">Chargement des prospects...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase">Aucun prospect trouvé</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-fintech-accent text-[10px] uppercase">{p.id.slice(0,8)}...</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{p.full_name}</span>
                      <span className="text-[10px] text-slate-500 italic">{p.email}</span>
                      <span className="text-[10px] text-slate-600">{p.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${p.account_type === 'entreprise' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {p.account_type || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{(p.monthly_income || 0).toLocaleString('fr-FR')} F/mois</td>
                  <td className="px-6 py-4">{getStatusBadge(p.consent_status)}</td>
                  <td className="px-6 py-4 text-[10px] text-slate-500">{new Date(p.created_at).toLocaleString('fr-FR')}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-500 hover:text-white transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-500">
           <span>{filtered.length} / {prospects.length} prospects affichés</span>
           <span className="text-slate-600 italic">Données en temps réel — Supabase</span>
        </div>
      </div>
    </div>
  );
}

