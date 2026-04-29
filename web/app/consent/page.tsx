'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, EyeOff, User, ChevronRight, Building2, X, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function ConsentGatePage() {
  const router   = useRouter();
  const supabase = createClient();
  const [showModal, setShowModal]   = useState(false);
  const [case1,     setCase1]       = useState(false);
  const [case2,     setCase2]       = useState(false);
  const [case3,     setCase3]       = useState(false);
  const [case4,     setCase4]       = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Garde d'authentification
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) router.push('/auth');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = case1 && case2;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      localStorage.setItem(`ctb_consent_${session.user.id}`, 'granted');
      sessionStorage.setItem(`ctb_tab_${session.user.id}`, 'true');
    }
    localStorage.setItem('consent_status', 'granted');
    router.push('/comparateur');
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row overflow-hidden">

      {/* ── Colonne gauche ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-12 lg:py-0 max-w-2xl">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-14">
          <Image
            src="/logos/logo-compare-ta-banque.png"
            alt="CompareTaBanque"
            width={200} height={60}
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Titre */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-3">
            Votre consentement,<br />notre priorité
          </h1>
          <div className="w-12 h-1 rounded-full bg-[color:var(--color-fintech-accent)] mb-6" />
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-md">
            Pour vous proposer les meilleures offres, nous avons besoin d&apos;accéder
            à certaines informations de votre profil, avec votre accord.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-7 mb-12">
          <Feature
            icon={<Shield size={22} className="text-[color:var(--color-fintech-blue)]" />}
            iconBg="bg-blue-100"
            title="Sécurisé"
            titleColor="text-[color:var(--color-fintech-blue)]"
            desc="Vos données sont protégées et chiffrées. Nous n'y avons accès que le temps nécessaire."
          />
          <Feature
            icon={<User size={22} className="text-[color:var(--color-fintech-accent)]" />}
            iconBg="bg-green-100"
            title="Sous votre contrôle"
            titleColor="text-[color:var(--color-fintech-accent)]"
            desc="Vous choisissez les informations à partager et pouvez retirer votre consentement à tout moment."
          />
          <Feature
            icon={<EyeOff size={22} className="text-[color:var(--color-fintech-accent)]" />}
            iconBg="bg-green-100"
            title="Aucune utilisation commerciale"
            titleColor="text-[color:var(--color-fintech-accent)]"
            desc="Vos données ne sont ni revendues, ni utilisées à d'autres fins que votre recommandation bancaire."
          />
        </div>

        {/* CTA principal */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[color:var(--color-fintech-blue)] text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
        >
          <Lock size={20} /> Donner mon consentement
        </button>

        {/* En savoir plus */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-5 flex items-center gap-1 text-[color:var(--color-fintech-blue)] font-bold text-sm hover:underline"
        >
          En savoir plus <ChevronRight size={16} />
        </button>

        {/* Footer */}
        <p className="mt-10 text-slate-400 text-xs flex items-center gap-1.5">
          <Lock size={12} /> Connexion sécurisée — Conforme à la Loi n° 2013-450 de Côte d&apos;Ivoire &amp; standards BCEAO
        </p>
      </div>

      {/* ── Colonne droite (visuel) ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-slate-50 overflow-hidden">

        {/* Photo */}
        <div className="absolute inset-0">
          <Image
            src="/assets/man_app.png"
            alt="Sécurité bancaire"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay dégradé gauche */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent" />
        </div>

        {/* Badges flottants */}
        <div className="relative z-10 w-full flex flex-col justify-between p-14 pb-16">

          {/* Badge haut droit */}
          <div className="self-end">
            <FloatingBadge
              icon={<Building2 size={20} className="text-[color:var(--color-fintech-blue)]" />}
              iconBg="bg-blue-100"
              label="Vos données sont sécurisées"
            />
          </div>

          {/* Badge milieu droit */}
          <div className="self-end mt-auto mb-auto">
            <FloatingBadge
              icon={<Lock size={20} className="text-[color:var(--color-fintech-accent)]" />}
              iconBg="bg-green-100"
              label="Vous gardez le contrôle"
            />
          </div>

          {/* Badge bas — carte conformité */}
          <div className="self-end">
            <div className="bg-white rounded-2xl shadow-2xl p-5 flex items-start gap-4 max-w-[280px] border border-slate-100">
              <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
                <Shield size={22} className="text-[color:var(--color-fintech-blue)]" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">Conformité BCEAO</p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  CompareTaBanque respecte les directives de la Banque Centrale des États de l&apos;Afrique de l&apos;Ouest pour garantir la sécurité de vos données.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal de consentement détaillé ─────────────────────── */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: '#fff', borderRadius: '2rem', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>

            {/* Header modal */}
            <div style={{ background: '#00335c', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#8DC63F', padding: 9, borderRadius: 12, display: 'flex' }}>
                  <Lock size={20} color="#fff" />
                </div>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>Protection des données</p>
                  <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, margin: 0 }}>Votre consentement</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>

            {/* Corps modal */}
            <div style={{ padding: '28px 28px 8px' }}>

              {/* Obligatoires */}
              <p style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 14px' }}>
                Requis pour continuer
              </p>
              <ModalConsent id="m1" checked={case1} onChange={setCase1} required
                label="Traitement de mes données"
                desc="J'accepte que la plateforme traite mes données personnelles aux fins exclusives de génération d'une recommandation bancaire personnalisée."
              />
              <ModalConsent id="m2" checked={case2} onChange={setCase2} required
                label="Transmission à la banque choisie"
                desc="J'accepte que mes coordonnées soient transmises uniquement à la banque que je sélectionne, aux fins de prise de contact."
              />

              {/* Optionnels */}
              <p style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', letterSpacing: 3, textTransform: 'uppercase', margin: '20px 0 14px' }}>
                Optionnel
              </p>
              <ModalConsent id="m3" checked={case3} onChange={setCase3}
                label="Alertes & communications"
                desc="Recevoir des rapports financiers et conseils personnalisés."
              />
              <ModalConsent id="m4" checked={case4} onChange={setCase4}
                label="Personnalisation IA"
                desc="Conserver mon historique pour affiner mes futures recommandations."
              />
            </div>

            {/* Pied modal */}
            <div style={{ padding: '16px 28px 28px' }}>
              {!canSubmit && (
                <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ⚠️ Cochez les deux cases obligatoires pour continuer
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                style={{
                  width: '100%', padding: '16px', border: 'none', borderRadius: '999px',
                  background: canSubmit ? '#00335c' : '#e2e8f0',
                  color: canSubmit ? '#fff' : '#94a3b8',
                  fontWeight: 900, fontSize: 16, cursor: canSubmit ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all .2s',
                }}
              >
                {submitting
                  ? 'Enregistrement…'
                  : <><CheckCircle2 size={18} /> Confirmer mon consentement</>
                }
              </button>
              <p style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8', fontWeight: 700, marginTop: 12 }}>
                🔒 Loi n° 2013-450 CI · Standards BCEAO · Données chiffrées
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sous-composants ─────────────────────────────────────────── */

function Feature({ icon, iconBg, title, titleColor, desc }: {
  icon: React.ReactNode; iconBg: string;
  title: string; titleColor: string; desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>{icon}</div>
      <div>
        <p className={`font-black text-base ${titleColor} mb-1`}>{title}</p>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FloatingBadge({ icon, iconBg, label }: {
  icon: React.ReactNode; iconBg: string; label: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 border border-slate-100 min-w-[200px]">
      <div className={`${iconBg} p-2.5 rounded-xl flex-shrink-0`}>{icon}</div>
      <p className="font-black text-slate-800 text-sm">{label}</p>
    </div>
  );
}

function ModalConsent({ id, checked, onChange, required, label, desc }: {
  id: string; checked: boolean; onChange: (v: boolean) => void;
  required?: boolean; label: string; desc: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
        marginBottom: 10, borderRadius: 14, cursor: 'pointer', transition: 'all .15s',
        background: checked ? '#f0f9ff' : '#f8fafc',
        border: `2px solid ${checked ? '#005596' : '#e2e8f0'}`,
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? '#005596' : '#cbd5e1'}`,
        background: checked ? '#005596' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
      }}>
        {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
      <div>
        <p style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, margin: '0 0 3px' }}>
          {label}
          {required && <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 900, marginLeft: 6 }}>*REQUIS</span>}
        </p>
        <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}
