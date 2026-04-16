'use client';

import { useState, useEffect } from 'react';
import { Save, User, Phone, Mail, TrendingUp, ShieldCheck, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ProspectData {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  monthly_income?: number;
  company_type?: string;
  account_type?: string;
  needs_credit?: boolean;
  consent_given?: boolean;
  created_at?: string;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [prospect, setProspect] = useState<ProspectData | null>(null);
  const [authEmail, setAuthEmail]   = useState('');
  const [phone,     setPhone]       = useState('');
  const [saving,    setSaving]      = useState(false);
  const [saved,     setSaved]       = useState(false);
  const [loading,   setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setAuthEmail(session.user.email ?? '');

      const { data } = await supabase
        .from('prospects')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setProspect(data);
        setPhone(data.phone ?? '');
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!prospect?.id) return;
    setSaving(true);
    await supabase
      .from('prospects')
      .update({ phone })
      .eq('id', prospect.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const fmt = (n?: number) => n ? n.toLocaleString('fr-FR') + ' FCFA' : '—';

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Paramètres du compte</h1>
      <p className="text-slate-500 font-bold mb-10">Vos informations personnelles et préférences.</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[color:var(--color-fintech-blue)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Identité */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User size={14} /> Identité
            </h2>
            <div className="space-y-4">
              <InfoRow label="Nom complet"  value={prospect?.full_name ?? '—'} icon={<User size={16} />} />
              <InfoRow label="Email"        value={authEmail}                  icon={<Mail size={16} />} />
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Téléphone
                </label>
                <div className="flex gap-3">
                  <input
                    type="tel" value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-800 focus:border-[color:var(--color-fintech-blue)] outline-none"
                  />
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-[color:var(--color-fintech-blue)] text-white px-6 py-3 rounded-2xl font-black hover:bg-slate-900 transition-all disabled:opacity-60">
                    <Save size={16} /> {saving ? '…' : 'Sauver'}
                  </button>
                </div>
                {saved && (
                  <p className="text-green-600 text-sm font-bold mt-2 flex items-center gap-1">
                    <ShieldCheck size={14} /> Numéro mis à jour
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profil financier */}
          {prospect && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} /> Profil financier
              </h2>
              <div className="space-y-4">
                <InfoRow
                  label="Type de compte"
                  value={prospect.account_type === 'entreprise' ? 'PME / Entreprise' : 'Particulier'}
                  icon={<Building2 size={16} />}
                />
                <InfoRow
                  label="Revenu mensuel"
                  value={fmt(prospect.monthly_income)}
                  icon={<TrendingUp size={16} />}
                />
                <InfoRow
                  label="Profil / Statut"
                  value={String(prospect.company_type ?? '—').replace('_', ' ')}
                  icon={<User size={16} />}
                />
                <InfoRow
                  label="Besoin crédit"
                  value={prospect.needs_credit && String(prospect.needs_credit) !== 'no' ? 'Oui' : 'Non — Compte & Services'}
                  icon={<ShieldCheck size={16} />}
                />
              </div>
            </div>
          )}

          {/* Statut RGPD */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck size={14} /> Consentement & Données
            </h2>
            <div className="space-y-3">
              <ConsentRow label="Traitement des données" given={prospect?.consent_given ?? false} />
              <ConsentRow label="Transmission aux banques partenaires" given={prospect?.consent_given ?? false} />
              {prospect?.consent_given && prospect?.created_at && (
                <p className="text-xs text-slate-400 font-bold mt-4">
                  Consentement accordé le {new Date(prospect.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
      <div className="text-slate-400 w-5 shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function ConsentRow({ label, given }: { label: string; given: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span className={`text-xs font-black px-3 py-1 rounded-full ${
        given ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
      }`}>
        {given ? 'Accordé' : 'Non accordé'}
      </span>
    </div>
  );
}
