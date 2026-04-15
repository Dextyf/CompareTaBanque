'use client';

import { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setEmail(session.user.email);
    });
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Paramètres du compte</h1>
      <p className="text-slate-500 font-bold mb-10">Gérez vos informations de connexion.</p>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[color:var(--color-fintech-blue)]/10 p-4 rounded-2xl text-[color:var(--color-fintech-blue)]">
            <User size={28} />
          </div>
          <div>
            <p className="font-black text-slate-900">Compte connecté</p>
            <p className="text-slate-500 text-sm">{email || '—'}</p>
          </div>
        </div>
        {saved && (
          <p className="bg-green-50 text-green-700 border border-green-200 rounded-2xl px-5 py-3 text-sm font-bold mb-6">
            Paramètres sauvegardés.
          </p>
        )}
        <button
          onClick={() => setSaved(true)}
          className="flex items-center gap-2 bg-[color:var(--color-fintech-blue)] text-white px-8 py-4 rounded-full font-black hover:bg-slate-900 transition-all">
          <Save size={18} /> Sauvegarder
        </button>
      </div>
    </div>
  );
}
