'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Lock, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ConsentKey = 'case1' | 'case2' | 'case3' | 'case4';

export default function ConsentGatePage() {
  const router   = useRouter();
  const supabase = createClient();
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    case1: false, // Obligatoire — traitement données
    case2: false, // Obligatoire — transmission banque
    case3: false, // Optionnel  — alertes
    case4: false, // Optionnel  — IA/historique
  });

  // Garde d'authentification — redirige si pas de session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) router.push('/auth');
    });
  }, []);

  const isDisabled = !consents.case1 || !consents.case2;

  const toggle = (key: ConsentKey, value?: boolean) =>
    setConsents(prev => ({ ...prev, [key]: value ?? !prev[key] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    // Lier le consentement à l'ID utilisateur pour ne plus le redemander
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      localStorage.setItem(`ctb_consent_${session.user.id}`, 'granted');
      sessionStorage.setItem(`ctb_tab_${session.user.id}`, 'true');
    }
    // Clé legacy pour compatibilité
    localStorage.setItem('consent_status', 'granted');
    router.push('/comparateur');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto">

        {/* En-tête */}
        <div className="text-center mb-10">
          <Lock className="mx-auto h-12 w-12 text-[color:var(--color-fintech-blue)] mb-4" />
          <h2 className="text-3xl font-extrabold text-slate-900">Protection de vos données</h2>
          <p className="mt-4 text-lg text-slate-600">
            Conformément à la Loi n° 2013-450 de Côte d&apos;Ivoire, nous avons besoin de votre accord
            pour traiter votre demande.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          <div className="p-8 space-y-6">

            {/* Obligatoire 1 */}
            <ConsentRow id="case1" checked={consents.case1}
              onChange={(v) => toggle('case1', v)} required
              label="Traitement des données"
              desc="J'accepte que la plateforme traite mes données personnelles aux fins exclusives de génération d'une recommandation bancaire personnalisée."
            />

            {/* Obligatoire 2 */}
            <ConsentRow id="case2" checked={consents.case2}
              onChange={(v) => toggle('case2', v)} required
              label="Transmission à la banque"
              desc="J'accepte expressément que mes coordonnées complètes soient transmises à la banque recommandée aux fins de prise de contact commercial."
            />

            <hr className="border-slate-200" />

            {/* Optionnel 1 */}
            <div className="flex items-start p-2">
              <input id="case3" type="checkbox" checked={consents.case3}
                onChange={(e) => toggle('case3', e.target.checked)}
                className="w-5 h-5 mt-0.5 text-[color:var(--color-fintech-accent)] bg-white border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="case3" className="ml-3 text-sm font-medium text-slate-700 cursor-pointer">
                J&apos;accepte de recevoir des alertes, rapports financiers et communications (Optionnel)
              </label>
            </div>

            {/* Optionnel 2 */}
            <div className="flex items-start p-2">
              <input id="case4" type="checkbox" checked={consents.case4}
                onChange={(e) => toggle('case4', e.target.checked)}
                className="w-5 h-5 mt-0.5 text-[color:var(--color-fintech-accent)] bg-white border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="case4" className="ml-3 text-sm font-medium text-slate-700 cursor-pointer">
                J&apos;accepte que mon historique soit conservé pour personnaliser mes recommandations via l&apos;IA (Optionnel — Premium)
              </label>
            </div>
          </div>

          {/* Pied de formulaire */}
          <div className="bg-slate-50 px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200">
            {isDisabled ? (
              <div className="flex items-center text-amber-600 text-sm mb-4 sm:mb-0">
                <AlertTriangle size={18} className="mr-2" />
                Cochez les champs obligatoires
              </div>
            ) : (
              <p className="mb-4 sm:mb-0 text-sm text-green-600 font-medium">Prêt à continuer</p>
            )}
            <button
              type="submit" disabled={isDisabled}
              className={`flex items-center justify-center px-8 py-3 rounded-full font-bold text-white transition-all w-full sm:w-auto ${
                isDisabled
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-[color:var(--color-fintech-blue)] hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5'
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

function ConsentRow({
  id, checked, onChange, required, label, desc,
}: {
  id: string; checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean; label: string; desc: string;
}) {
  return (
    <div className={`flex items-start p-4 rounded-xl border-l-4 transition-all ${
      checked
        ? 'bg-blue-50 border-[color:var(--color-fintech-blue)]'
        : 'bg-slate-50 border-slate-300'
    }`}>
      <input id={id} type="checkbox" checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 mt-0.5 text-[color:var(--color-fintech-blue)] bg-white border-slate-300 rounded cursor-pointer"
      />
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-semibold text-slate-900 cursor-pointer">
          {label}{required && <span className="text-red-500 ml-1">*OBLIGATOIRE</span>}
        </label>
        <p className="text-slate-500 mt-1 cursor-pointer" onClick={() => onChange(!checked)}>
          {desc}
        </p>
      </div>
    </div>
  );
}
