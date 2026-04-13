import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Columns, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function SelectiveComparison() {
  const navigate = useNavigate();
  const [bank1, setBank1] = useState('');
  const [bank2, setBank2] = useState('');
  const [banksData, setBanksData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const { data, error } = await supabase
          .from('bank_profiles')
          .select('*, banking_tariffs(*)')
          .eq('is_partner', true);

        if (error) throw error;

        if (data) {
          const mapped = data.map(b => {
            const t = b.banking_tariffs?.[0] || {};
            return {
              id: b.id,
              code: b.code,
              name: b.name,
              logo: b.code === 'SGCI' ? '/logos/sgbci.png' : `/logos/${b.code.toLowerCase()}.png`,
              fees: t.monthly_fee > 0 ? `${t.monthly_fee.toLocaleString('fr-FR')} F` : 'Gratuit',
              fees_raw: t.monthly_fee || 0,
              rate: t.savings_rate ? `${t.savings_rate}%` : 'N/A',
              visa: t.has_visa_card ? (t.has_international ? 'VISA Internationale' : 'VISA Classic') : 'Non incluse',
              mobile: t.has_mobile_banking ?? false,
              insurance: t.has_insurance ?? false,
              online: t.has_online_banking ?? false,
              sms: t.has_sms_alerts ?? false,
              reliability: b.reliability_score || 0,
            };
          });
          setBanksData(mapped);
        }
      } catch (err) {
        console.error('Erreur SelectiveComparison:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanks();
  }, []);

  const getBank = (id) => banksData.find(b => b.id === id);
  const b1 = getBank(bank1);
  const b2 = getBank(bank2);

  // Utilitaire pour déterminer le "gagnant" sur un critère numérique
  const winner = (val1, val2, lowerIsBetter = false) => {
    if (val1 === undefined || val2 === undefined) return null;
    return lowerIsBetter ? (val1 < val2 ? 1 : val1 > val2 ? 2 : 0) : (val1 > val2 ? 1 : val1 < val2 ? 2 : 0);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Comparateur Manuel</h1>
          <p className="text-slate-500 mt-2">Duel tarifaire direct entre deux banques partenaires.</p>
        </div>
        <div className="bg-fintech-blue/10 p-4 rounded-2xl">
          <Columns className="text-fintech-blue" size={32} />
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-16 rounded-3xl flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin text-fintech-blue" size={40} />
          <p className="font-bold text-sm uppercase tracking-widest">Chargement des banques partenaires...</p>
        </div>
      ) : (
        <>
          {/* Sélecteurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sticky top-0 z-10 bg-slate-50 py-4">
            <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-fintech-blue">
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase">Banque A</label>
              <select
                value={bank1}
                onChange={(e) => setBank1(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-fintech-blue outline-none text-lg font-bold"
              >
                <option value="">Sélectionner une banque...</option>
                {banksData.map(b => (
                  <option key={b.id} value={b.id} disabled={b.id === bank2}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-fintech-accent">
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase">Banque B</label>
              <select
                value={bank2}
                onChange={(e) => setBank2(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-fintech-accent outline-none text-lg font-bold"
              >
                <option value="">Sélectionner une banque...</option>
                {banksData.map(b => (
                  <option key={b.id} value={b.id} disabled={b.id === bank1}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tableau de comparaison */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-6 text-left text-slate-400 font-bold uppercase text-xs w-1/3">Critères</th>
                  <th className="p-6 w-1/3 font-extrabold text-fintech-blue">
                    {b1 ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={b1.logo} className="h-10 object-contain" alt={b1.name} />
                        <span>{b1.name}</span>
                      </div>
                    ) : '---'}
                  </th>
                  <th className="p-6 w-1/3 font-extrabold text-fintech-accent">
                    {b2 ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={b2.logo} className="h-10 object-contain" alt={b2.name} />
                        <span>{b2.name}</span>
                      </div>
                    ) : '---'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <CompRow
                  label="Frais de Tenue/Mois"
                  val1={b1?.fees} val2={b2?.fees}
                  win={winner(b1?.fees_raw, b2?.fees_raw, true)}
                  isHighlight
                />
                <CompRow
                  label="Taux d'Épargne"
                  val1={b1?.rate} val2={b2?.rate}
                />
                <CompRow
                  label="Score de Fiabilité"
                  val1={b1 ? `${b1.reliability}/100` : undefined}
                  val2={b2 ? `${b2.reliability}/100` : undefined}
                  win={winner(b1?.reliability, b2?.reliability)}
                />
                <CompRow label="Carte Visa"
                  val1={b1?.visa} val2={b2?.visa}
                />
                <CompRow
                  label="Mobile Banking"
                  val1={b1 ? (b1.mobile ? <Check className="text-green-500 mx-auto" size={20} /> : <X className="text-red-300 mx-auto" size={20} />) : undefined}
                  val2={b2 ? (b2.mobile ? <Check className="text-green-500 mx-auto" size={20} /> : <X className="text-red-300 mx-auto" size={20} />) : undefined}
                />
                <CompRow
                  label="Banque en ligne"
                  val1={b1 ? (b1.online ? <Check className="text-green-500 mx-auto" size={20} /> : <X className="text-red-300 mx-auto" size={20} />) : undefined}
                  val2={b2 ? (b2.online ? <Check className="text-green-500 mx-auto" size={20} /> : <X className="text-red-300 mx-auto" size={20} />) : undefined}
                />
                <CompRow
                  label="Alertes SMS"
                  val1={b1 ? (b1.sms ? <Check className="text-green-500 mx-auto" size={20} /> : <X className="text-red-300 mx-auto" size={20} />) : undefined}
                  val2={b2 ? (b2.sms ? <Check className="text-green-500 mx-auto" size={20} /> : <X className="text-red-300 mx-auto" size={20} />) : undefined}
                />
                <CompRow
                  label="Assurance Moyens Paiement"
                  val1={b1 ? (b1.insurance ? <Check className="text-green-500 mx-auto" size={20} /> : <X className="text-red-300 mx-auto" size={20} />) : undefined}
                  val2={b2 ? (b2.insurance ? <Check className="text-green-500 mx-auto" size={20} /> : <X className="text-red-300 mx-auto" size={20} />) : undefined}
                />
              </tbody>
            </table>
          </div>

          {bank1 && bank2 && (
            <div className="bg-fintech-dark text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Besoin d'un matching IA complet ?</h3>
                <p className="text-slate-400">Laissez l'algorithme analyser votre profil complet pour un choix optimal.</p>
              </div>
              <button
                onClick={() => navigate('/comparateur')}
                className="bg-fintech-accent text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all whitespace-nowrap"
              >
                Lancer l'Analyse IA <ArrowRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CompRow({ label, val1, val2, isHighlight, win }) {
  return (
    <tr className={isHighlight ? 'bg-blue-50/30' : ''}>
      <td className="p-6 text-left font-bold text-slate-700 border-r border-slate-100 text-sm">{label}</td>
      <td className={`p-6 text-sm ${isHighlight ? 'font-extrabold text-fintech-blue' : 'text-slate-600'} ${win === 1 ? 'bg-green-50' : ''}`}>
        {val1 ?? <span className="text-slate-300">---</span>}
        {win === 1 && <span className="ml-2 text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Meilleur</span>}
      </td>
      <td className={`p-6 text-sm ${isHighlight ? 'font-extrabold text-fintech-accent' : 'text-slate-600'} ${win === 2 ? 'bg-green-50' : ''}`}>
        {val2 ?? <span className="text-slate-300">---</span>}
        {win === 2 && <span className="ml-2 text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Meilleur</span>}
      </td>
    </tr>
  );
}
