import React, { useState } from 'react';
import { ArrowLeft, Calculator, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SimulateurEpargne() {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    initialDeposit: 50000,
    monthlyDeposit: 25000,
    years: 5,
    rate: 5 // Par défaut Coris Prestige (5%)
  });

  const [result, setResult] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    const { initialDeposit, monthlyDeposit, years, rate } = params;
    
    // Intérêts composés annuellement avec versements en début de mois
    let total = Number(initialDeposit);
    const mRate = Number(rate) / 100 / 12; // taux mensuel équivalent
    const months = Number(years) * 12;

    for (let i = 0; i < months; i++) {
       total += Number(monthlyDeposit);
       total = total * (1 + mRate);
    }

    const totalInvested = Number(initialDeposit) + (Number(monthlyDeposit) * months);
    const interests = total - totalInvested;

    setResult({
      total: Math.round(total),
      invested: Math.round(totalInvested),
      interests: Math.round(interests)
    });
  };

  const banks = [
    { name: 'Coris Bank - Épargne Prestige', rate: 5 },
    { name: 'Coris Bank - Taloklama (Femmes)', rate: 3.75 },
    { name: 'NSIA Banque - Épargne', rate: 3.5 },
    { name: 'BNI - Épargne', rate: 3.5 },
    { name: 'SIB - Plan Éducation', rate: 3.5 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-500 mb-6 hover:text-fintech-blue font-semibold"
        >
          <ArrowLeft size={20} className="mr-2"/> Retour au Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
          
          {/* Form */}
          <div className="md:w-1/2 p-8 bg-slate-50 border-r border-slate-100">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
               <div className="bg-fintech-blue p-3 rounded-xl text-white">
                 <Calculator size={24} />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-slate-800">Simulateur d'Épargne</h2>
                 <p className="text-sm text-slate-500">Anticipez vos gains futurs</p>
               </div>
            </div>

            <form onSubmit={calculate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Dépôt initial (FCFA)</label>
                <input 
                  type="number" 
                  value={params.initialDeposit}
                  onChange={e => setParams({...params, initialDeposit: e.target.value})}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-fintech-blue outline-none" 
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Versement mensuel (FCFA)</label>
                <input 
                  type="number" 
                  value={params.monthlyDeposit}
                  onChange={e => setParams({...params, monthlyDeposit: e.target.value})}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-fintech-blue outline-none" 
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Durée (Années) : {params.years} ans</label>
                <input 
                  type="range" 
                  value={params.years}
                  onChange={e => setParams({...params, years: e.target.value})}
                  className="w-full accent-fintech-accent" 
                  min="1" max="25"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Banque & Taux</label>
                <select 
                  value={params.rate}
                  onChange={e => setParams({...params, rate: e.target.value})}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white font-medium focus:border-fintech-blue outline-none"
                >
                  {banks.map(b => (
                    <option key={b.name} value={b.rate}>{b.name} ({b.rate}%/an)</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-fintech-blue text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                Calculer
              </button>
            </form>
          </div>

          {/* Results Area */}
          <div className="md:w-1/2 p-8 bg-gradient-to-br from-white to-slate-50 flex flex-col justify-center items-center text-center">
            {result ? (
              <div className="w-full animate-fadeIn">
                <TrendingUp size={48} className="text-fintech-accent mx-auto mb-6" />
                <h3 className="text-slate-500 font-semibold uppercase tracking-wider text-sm mb-2">Capital Final Estimé</h3>
                <div className="text-5xl font-extrabold text-slate-800 mb-8 break-words text-transparent bg-clip-text bg-gradient-to-r from-fintech-dark to-fintech-blue">
                   {new Intl.NumberFormat('fr-FR').format(result.total)} <span className="text-2xl text-slate-500 font-bold">F</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Total Investi</span>
                    <span className="font-bold text-slate-800">{new Intl.NumberFormat('fr-FR').format(result.invested)} F</span>
                  </div>
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                    <span className="text-green-700 font-medium">Intérêts Gagnés (+{params.rate}%)</span>
                    <span className="font-bold text-fintech-accent">+{new Intl.NumberFormat('fr-FR').format(result.interests)} F</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 p-8">
                <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                <p>Ajustez les valeurs et cliquez sur "Calculer" pour voir la projection de votre épargne dans le temps.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
