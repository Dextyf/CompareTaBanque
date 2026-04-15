'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RecommandationsPage() {
  const router   = useRouter();
  const supabase = createClient();

  const goToComparateur = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    const hasConsent = uid && localStorage.getItem(`ctb_consent_${uid}`) === 'granted';
    router.push(hasConsent ? '/comparateur' : '/consent');
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Mes Recommandations</h1>
      <p className="text-slate-500 font-bold mb-10">Vos dernières analyses bancaires personnalisées.</p>
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center shadow-sm">
        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="font-black text-slate-700 text-xl mb-2">Aucune recommandation enregistrée</h3>
        <p className="text-slate-400 font-medium mb-8 max-w-sm mx-auto">
          Lancez une comparaison pour obtenir vos recommandations personnalisées.
        </p>
        <button onClick={goToComparateur}
          className="inline-flex items-center gap-2 bg-[color:var(--color-fintech-blue)] text-white px-8 py-4 rounded-full font-black hover:bg-slate-900 transition-all">
          Lancer une comparaison <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
