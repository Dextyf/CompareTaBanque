import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock, ArrowRight } from 'lucide-react';

export default function ConsentGate() {
  const navigate = useNavigate();
  const [consents, setConsents] = useState({
    case1: false, // Obligatoire
    case2: false, // Obligatoire
    case3: false, // Optionnel (Alertes)
    case4: false, // Optionnel (IA)
  });

  const isContinuerDisabled = !consents.case1 || !consents.case2;

  const handleConsentChange = (caseName) => {
    setConsents(prev => ({
      ...prev,
      [caseName]: !prev[caseName]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isContinuerDisabled) {
      // Save consent to local state or context/API
      localStorage.setItem('consent_status', 'granted');
      navigate('/comparateur');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Lock className="mx-auto h-12 w-12 text-fintech-blue mb-4" />
          <h2 className="text-3xl font-extrabold text-slate-900">
            Protection de vos données
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Conformément à la Loi n° 2013-450 de Côte d'Ivoire, nous avons besoin de votre accord pour traiter votre demande.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          <div className="p-8 space-y-6">
            
            {/* Obligatoire 1 */}
            <div className={`flex items-start p-4 rounded-xl border-l-4 transition-all ${consents.case1 ? 'bg-blue-50 border-fintech-blue' : 'bg-slate-50 border-slate-300'}`}>
              <div className="flex items-center h-5">
                <input
                  id="case1"
                  type="checkbox"
                  checked={consents.case1}
                  onChange={() => handleConsentChange('case1')}
                  className="w-5 h-5 text-fintech-blue bg-white border-slate-300 rounded focus:ring-fintech-blue cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="case1" className="font-semibold text-slate-900 cursor-pointer">
                  Traitement des données <span className="text-red-500">*OBLIGATOIRE</span>
                </label>
                <p className="text-slate-500 mt-1 cursor-pointer" onClick={() => handleConsentChange('case1')}>
                  J'accepte que la plateforme traite mes données personnelles aux fins exclusives de génération d'une recommandation bancaire personnalisée.
                </p>
              </div>
            </div>

            {/* Obligatoire 2 */}
            <div className={`flex items-start p-4 rounded-xl border-l-4 transition-all ${consents.case2 ? 'bg-blue-50 border-fintech-blue' : 'bg-slate-50 border-slate-300'}`}>
              <div className="flex items-center h-5">
                <input
                  id="case2"
                  type="checkbox"
                  checked={consents.case2}
                  onChange={() => handleConsentChange('case2')}
                  className="w-5 h-5 text-fintech-blue bg-white border-slate-300 rounded focus:ring-fintech-blue cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="case2" className="font-semibold text-slate-900 cursor-pointer">
                  Transmission à la banque <span className="text-red-500">*OBLIGATOIRE</span>
                </label>
                <p className="text-slate-500 mt-1 cursor-pointer" onClick={() => handleConsentChange('case2')}>
                  J'accepte expressément que mes coordonnées complètes soient transmises à la banque recommandée aux fins de prise de contact commercial.
                </p>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Optionnel 1 */}
            <div className="flex items-start p-2">
              <div className="flex items-center h-5">
                <input
                  id="case3"
                  type="checkbox"
                  checked={consents.case3}
                  onChange={() => handleConsentChange('case3')}
                  className="w-5 h-5 text-fintech-accent bg-white border-slate-300 rounded focus:ring-fintech-accent cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="case3" className="font-medium text-slate-700 cursor-pointer">
                  J'accepte de recevoir des alertes, rapports financiers et communications (Optionnel)
                </label>
              </div>
            </div>

            {/* Optionnel 2 */}
            <div className="flex items-start p-2">
              <div className="flex items-center h-5">
                <input
                  id="case4"
                  type="checkbox"
                  checked={consents.case4}
                  onChange={() => handleConsentChange('case4')}
                  className="w-5 h-5 text-fintech-accent bg-white border-slate-300 rounded focus:ring-fintech-accent cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="case4" className="font-medium text-slate-700 cursor-pointer">
                  J'accepte que mon historique soit conservé pour personnaliser mes recommandations via l'IA (Optionnel - Premium)
                </label>
              </div>
            </div>

          </div>
          
          <div className="bg-slate-50 px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200">
            {isContinuerDisabled ? (
              <div className="flex items-center text-amber-600 text-sm mb-4 sm:mb-0">
                <AlertTriangle size={18} className="mr-2" />
                Cochez les champs obligatoires
              </div>
            ) : (
              <div className="mb-4 sm:mb-0 text-sm text-green-600 font-medium">
                Prêt à continuer
              </div>
            )}
            
            <button
              type="submit"
              disabled={isContinuerDisabled}
              className={`flex items-center justify-center px-8 py-3 rounded-full font-bold text-white transition-all w-full sm:w-auto ${
                isContinuerDisabled 
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                  : 'bg-fintech-blue hover:bg-opacity-90 hover:shadow-[0_4px_15px_rgba(30,58,138,0.4)] transform hover:-translate-y-0.5'
              }`}
            >
              Continuer <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
