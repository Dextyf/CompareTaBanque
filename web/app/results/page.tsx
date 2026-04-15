'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2, TrendingUp, Sparkles, Trophy,
  MessageSquare, ShieldAlert, Zap, Percent, ShieldCheck,
  Activity, CreditCard, Wallet, Landmark, Loader2, X,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { scoreBanks, type ScoredBank, type Profile } from '@/lib/scoring';

function getIncomeBracket(income: number): string {
  if (income <= 250000)  return '0-250k';
  if (income <= 600000)  return '250k-600k';
  if (income <= 800000)  return '600k-800k';
  if (income <= 1200000) return '800k-1200k';
  return '1200k+';
}

const DEFAULT_PROFILE: Profile = {
  full_name: 'Utilisateur', company_type: 'individual',
  statut: 'salarié_privé', monthly_income: 500000,
  needs_credit: 'yes', montant_demande: 5000000,
  type_credit: 'consommation',
  interests: { visa_premium: true, low_fees: true },
};

/* ── Page principale (enveloppée dans Suspense pour useSearchParams) ── */
export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Chargement..." />}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const profile: Profile = (() => {
    try {
      const raw = searchParams.get('profile');
      return raw ? JSON.parse(decodeURIComponent(raw)) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  })();

  const prospectId = searchParams.get('prospect_id') ?? undefined;

  const [analyzing,     setAnalyzing]     = useState(true);
  const [banks,         setBanks]         = useState<ScoredBank[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [leadConfirmed, setLeadConfirmed] = useState<{ name: string; code: string } | null>(null);
  const [comparisonId,  setComparisonId]  = useState<string | null>(null);
  const [pendingBank,   setPendingBank]   = useState<ScoredBank | null>(null); // modale confirmation
  const savedRef = useRef(false); // évite la double-sauvegarde

  // Modal expert
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [expertEmail,     setExpertEmail]     = useState('');
  const [expertMotif,     setExpertMotif]     = useState('');
  const [expertDesc,      setExpertDesc]      = useState('');
  const [expertSending,   setExpertSending]   = useState(false);
  const [expertSent,      setExpertSent]      = useState(false);

  const sendExpertRequest = async () => {
    if (!expertEmail.trim() || !expertMotif.trim() || !expertDesc.trim()) return;
    setExpertSending(true);
    try {
      await fetch('/api/contact-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: expertEmail, motif: expertMotif, description: expertDesc }),
      });
      setExpertSent(true);
    } catch {
      setExpertSent(true); // on ferme quand même
    } finally {
      setExpertSending(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setAnalyzing(false), 3200);
    return () => clearTimeout(t);
  }, []);

  const fetchBanks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bank_profiles')
        .select('*, banking_tariffs(*)')
        .eq('is_partner', true);
      if (error) throw error;
      if (data) {
        const mapped = data.map((b: Record<string, unknown>) => ({
          id: b.id as string,
          code: b.code as string,
          name: b.name as string,
          logo: (() => {
            const code = b.code as string;
            const MAP: Record<string, string> = { SGCI: 'sgbci', BRIDGE: 'bridge' };
            return `/logos/${MAP[code] ?? code.toLowerCase()}.png`;
          })(),
          reliability_score:    (b.reliability_score    as number) ?? 0,
          taux_base_credit:     (b.taux_base_credit     as number) ?? 11,
          score_partenariats:   (b.score_partenariats   as number) ?? 3,
          score_autonomie_base: (b.score_autonomie_base as number) ?? 10,
          banking_tariffs: Array.isArray(b.banking_tariffs) ? b.banking_tariffs as import('@/lib/scoring').BankTariff[] : [],
          is_partner: b.is_partner,
        }));
        const scored = scoreBanks(mapped, profile).sort((a, b) => b.score - a.score).slice(0, 3);
        setBanks(scored);

        // ── Auto-save : dès que le scoring est prêt, on enregistre ──
        if (!savedRef.current && scored.length > 0) {
          savedRef.current = true;
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const income = parseInt(String(
              profile.monthly_income ?? (Number(profile.chiffre_affaires ?? 0) / 12)
            )) || 0;
            const top = scored[0];
            const { data: saved } = await supabase
              .from('user_comparisons')
              .insert({
                auth_user_id:        user.id,
                prospect_id:         prospectId ?? null,
                profile_snapshot:    profile,
                top_banks:           scored.map(b => ({
                  name: b.name, code: b.code, score: b.score,
                  probabilite: b.probabilite, taux_estime: b.taux_estime,
                })),
                selected_bank_name:  top.name,
                selected_bank_code:  top.code,
                selected_bank_score: top.score,
                income_bracket:      getIncomeBracket(income),
              })
              .select('id')
              .single();
            if (saved?.id) setComparisonId(saved.id);
          }
        }
      }
    } catch (err) {
      console.error('Erreur fetch:', err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  const handleSelectBank = async (rec: ScoredBank) => {
    if (submitting) return;
    setSubmitting(true);
    const income = parseInt(String(profile.monthly_income ?? (Number(profile.chiffre_affaires ?? 0) / 12))) || 0;

    // Payload complet pour la notification email
    const notifyPayload = {
      full_name:        profile.full_name        ?? '',
      email:            (profile as Record<string,unknown>).email ?? '',
      phone:            (profile as Record<string,unknown>).phone ?? '',
      company_type:     profile.company_type     ?? '',
      statut:           profile.statut           ?? '',
      secteur_activite: profile.secteur_activite ?? '',
      monthly_income:   income,
      needs_credit:     profile.needs_credit     ?? '',
      montant_demande:  profile.montant_demande  ?? 0,
      type_credit:      profile.type_credit      ?? '',
      bank_id:          rec.id,
      bank_name:        rec.name,
      bank_code:        rec.code,
      score:            rec.score,
      probabilite:      rec.probabilite,
      comment:          rec.comment,
      taux_estime:      rec.taux_estime,
      prospect_id:      prospectId ?? null,
      income_bracket:   getIncomeBracket(income),
    };

    try {
      // Met à jour la banque choisie si auto-save a déjà créé l'enregistrement
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (comparisonId) {
          await supabase
            .from('user_comparisons')
            .update({
              selected_bank_name:  rec.name,
              selected_bank_code:  rec.code,
              selected_bank_score: rec.score,
            })
            .eq('id', comparisonId);
        } else {
          // Fallback si auto-save n'a pas pu créer l'enregistrement
          await supabase.from('user_comparisons').insert({
            auth_user_id:        user.id,
            prospect_id:         prospectId ?? null,
            profile_snapshot:    profile,
            top_banks:           banks.map(b => ({
              name: b.name, code: b.code, score: b.score,
              probabilite: b.probabilite, taux_estime: b.taux_estime,
            })),
            selected_bank_name:  rec.name,
            selected_bank_code:  rec.code,
            selected_bank_score: rec.score,
            income_bracket:      getIncomeBracket(income),
          });
        }
      }

      // Envoi email de notification (sans bloquer l'UX)
      await fetch('/api/lead-notify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(notifyPayload),
      });
    } catch (err) {
      console.warn('Erreur save/notification:', (err as Error).message);
    } finally {
      setSubmitting(false);
      setLeadConfirmed({ name: rec.name, code: rec.code });
    }
  };

  /* ── Ecran analyse ──────────────────────────────────────────── */
  if (analyzing) {
    return (
      <LoadingScreen message={`Analyse multicritère de votre profil ${profile.company_type?.toUpperCase() ?? ''}…`} />
    );
  }

  /* ── Confirmation lead ──────────────────────────────────────── */
  if (leadConfirmed) {
    return (
      <div className="min-h-screen bg-[color:var(--color-fintech-dark)] flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[4rem] shadow-2xl p-14 max-w-lg w-full text-center">
          <div className="w-24 h-24 bg-[color:var(--color-fintech-accent)]/15 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={52} className="text-[color:var(--color-fintech-accent)]" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[color:var(--color-fintech-accent)] mb-4">Dossier transmis</p>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            Votre demande a été envoyée à<br />
            <span className="text-[color:var(--color-fintech-blue)]">{leadConfirmed.name}</span>
          </h2>
          <p className="text-slate-500 font-bold leading-relaxed mb-10">
            Un conseiller vous contactera dans les <span className="text-slate-800">48 heures</span> aux coordonnées que vous avez fournies.
          </p>
          <ul className="bg-slate-50 rounded-[2rem] p-6 mb-10 text-left space-y-3">
            {[
              'Dossier transmis via notre réseau sécurisé',
              'Délai de réponse garanti : 48h maximum',
              'Notification par email et téléphone',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <CheckCircle2 size={16} className="text-[color:var(--color-fintech-accent)] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => router.push('/')}
              className="flex-1 py-5 rounded-[2rem] border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-50 transition-all">
              Retour à l&apos;accueil
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="flex-1 py-5 rounded-[2rem] bg-[color:var(--color-fintech-blue)] text-white font-black hover:bg-black transition-all">
              Accéder à mon dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayMontant = !isNaN(parseInt(String(profile.montant_demande ?? '')))
    ? parseInt(String(profile.montant_demande)).toLocaleString('fr-FR')
    : 'N/A';
  const displayProfil = profile.company_type === 'PME' ? 'PME/ENT' : 'PARTICULIER';

  return (
    <>
    {/* ── Modale de confirmation avant transmission ─────────── */}
    {pendingBank && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={e => { if (e.target === e.currentTarget) setPendingBank(null); }}
      >
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden [animation:var(--animate-fadeIn)]">

          {/* Header modale */}
          <div className="bg-[color:var(--color-fintech-dark)] px-10 py-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[color:var(--color-fintech-accent)] p-3 rounded-2xl">
                <Landmark size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmation requise</p>
                <p className="text-white font-black text-lg">{pendingBank.name}</p>
              </div>
            </div>
            <button
              onClick={() => setPendingBank(null)}
              className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-red-500/30 p-2 rounded-xl"
            >
              <X size={20} />
            </button>
          </div>

          {/* Corps modale */}
          <div className="p-10">
            {/* Logo + score banque */}
            <div className="flex items-center gap-5 mb-8 p-5 bg-slate-50 rounded-3xl border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingBank.logo} alt={pendingBank.name}
                style={{ height: 56, width: 'auto', maxWidth: 120, objectFit: 'contain' }} />
              <div>
                <p className="font-black text-slate-900 text-xl">{pendingBank.name}</p>
                <p className="text-[color:var(--color-fintech-blue)] font-black text-2xl">{pendingBank.score}% compatibilité</p>
              </div>
            </div>

            {/* Message explicatif */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-8">
              <p className="text-amber-800 font-black text-sm uppercase tracking-widest mb-2">⚠️ Avant de confirmer</p>
              <p className="text-slate-700 font-medium leading-relaxed text-[15px]">
                Vous autorisez CompareTaBanque à transmettre votre dossier à <strong>{pendingBank.name}</strong>.
              </p>
            </div>

            {/* Données qui seront transmises */}
            <div className="mb-8 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Informations transmises</p>
              {[
                ['Identité', String(profile.full_name ?? '—')],
                ['Contact',  `${String((profile as Record<string,unknown>).email ?? '—')} · ${String((profile as Record<string,unknown>).phone ?? '—')}`],
                ['Profil',   displayProfil],
                ...(profile.needs_credit !== 'no'
                  ? [['Montant crédit', `${displayMontant} FCFA — ${profile.type_credit ?? ''}`]]
                  : [['Besoin', 'Compte & Services bancaires']]),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-400 font-bold">{label}</span>
                  <span className="text-slate-800 font-black text-right max-w-[60%] truncate">{val}</span>
                </div>
              ))}
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setPendingBank(null)}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => { setPendingBank(null); handleSelectBank(pendingBank); }}
                disabled={submitting}
                className="flex-1 py-4 rounded-2xl bg-[color:var(--color-fintech-blue)] text-white font-black text-lg hover:bg-slate-900 transition-all shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><Loader2 size={18} className="[animation:var(--animate-spin)]" /> Envoi…</>
                  : <><CheckCircle2 size={18} /> CONFIRMATION</>
                }
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-bold mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-[color:var(--color-fintech-accent)]" />
              Conforme aux standards BCEAO
            </p>
          </div>
        </div>
      </div>
    )}
    <div className="min-h-screen bg-slate-50 font-sans pb-32 overflow-x-hidden">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="bg-[color:var(--color-fintech-dark)] text-white pt-16 md:pt-28 pb-40 md:pb-56 relative overflow-hidden px-4 md:px-0 text-center">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-[color:var(--color-fintech-accent)]/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="container mx-auto relative z-10 px-6">
          <div className="flex justify-center mb-12">
            <div className="bg-white p-6 rounded-[3rem] shadow-2xl cursor-pointer hover:scale-105 border-b-4 border-slate-200"
              onClick={() => router.push('/')}>
              <Image src="/logos/logo-compare-ta-banque.png" alt="CTB" width={200} height={100}
                className="h-20 sm:h-28 md:h-32 w-auto object-contain" />
            </div>
          </div>
          <div className="inline-flex items-center gap-4 bg-[color:var(--color-fintech-accent)]/20 text-[color:var(--color-fintech-accent)] px-8 py-3 rounded-full font-black text-xs mb-10 border border-white/10 tracking-[0.4em] uppercase">
            <Trophy size={20} /> TOP 3 MATCHING MIXTE v2.0
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-10 leading-tight tracking-tighter max-w-5xl mx-auto">
            Votre profil <span className="text-[color:var(--color-fintech-accent)] italic">analysé</span> par notre IA.
          </h1>
          <div className="flex overflow-x-auto md:justify-center gap-6 mt-12 px-4 md:px-0">
            <MetricBadge label="PROFIL"   value={displayProfil} color="bg-blue-500" />
            <MetricBadge
              label={profile.needs_credit === 'no' ? 'INTENTION' : 'BESOIN'}
              value={profile.needs_credit === 'no' ? 'Service & Frais' : `${displayMontant} F`}
              color="bg-[color:var(--color-fintech-accent)]"
            />
            <MetricBadge
              label="STATUT"
              value={(profile.statut ?? (profile as Record<string,unknown>).type_pme as string ?? 'N/A').replace('_', ' ')}
              color="bg-purple-500"
            />
          </div>
        </div>
      </div>

      {/* ── Cartes banques ────────────────────────────────────── */}
      <div className="container mx-auto px-5 sm:px-10 -mt-24 md:-mt-36 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {loading ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-[color:var(--color-fintech-blue)] rounded-full [animation:var(--animate-spin)]" />
              <p className="text-slate-400 font-bold animate-pulse">Synchronisation avec les tarifs bancaires…</p>
            </div>
          ) : banks.length > 0 ? (
            banks.map((rec, index) => (
              <BankCard
                key={rec.id}
                rec={rec}
                index={index}
                profile={profile}
                submitting={submitting}
                onSelect={() => setPendingBank(rec)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[4rem] shadow-xl border-2 border-dashed border-slate-200">
              <ShieldAlert className="mx-auto text-orange-500 mb-6" size={64} />
              <h3 className="text-2xl font-black text-slate-800 mb-4">Aucune banque partenaire trouvée</h3>
              <p className="text-slate-500 max-w-md mx-auto font-bold mb-8">
                Veuillez exécuter le script{' '}
                <code className="bg-slate-100 px-2 py-1 rounded text-red-500">002_seed_banks.sql</code>{' '}
                dans votre SQL Editor Supabase.
              </p>
              <button onClick={() => window.location.reload()}
                className="bg-slate-900 text-white px-8 py-4 rounded-full font-black hover:bg-[color:var(--color-fintech-blue)] transition-all">
                Rafraîchir
              </button>
            </div>
          )}
        </div>

        {/* CTA expert */}
        <div className="mt-24 bg-white/50 backdrop-blur-md p-10 rounded-[4rem] border border-white shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="bg-[color:var(--color-fintech-blue)] p-6 rounded-[2.5rem] text-white">
            <Landmark size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-2xl font-black text-slate-900 mb-2">Besoin d&apos;un coaching expert ?</h4>
            <p className="text-slate-500 font-bold leading-relaxed">
              Nos conseillers sont disponibles pour affiner votre dossier avant l&apos;envoi banque.
            </p>
          </div>
          <button
            onClick={() => { setShowExpertModal(true); setExpertSent(false); setExpertEmail(''); setExpertMotif(''); setExpertDesc(''); }}
            className="bg-slate-900 text-white px-10 py-5 rounded-full font-black hover:bg-[color:var(--color-fintech-accent)] transition-all whitespace-nowrap cursor-pointer"
          >
            Parler à un Expert
          </button>
        </div>

        <div className="mt-20 text-center opacity-70 px-6">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-2xl mx-auto">
            Conforme aux standards BCEAO · Plateforme de Conseil Financier Indépendante · Zone UEMOA
          </p>
        </div>
      </div>
    </div>

    {/* ── Modal Parler à un Expert ─────────────────────────── */}
    {showExpertModal && (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        onClick={e => { if (e.target === e.currentTarget) setShowExpertModal(false); }}
      >
        <div style={{ background: '#fff', borderRadius: '2rem', width: '100%', maxWidth: '480px', padding: '40px', position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
          {/* Fermeture */}
          <button
            onClick={() => setShowExpertModal(false)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} color="#64748b" />
          </button>

          {expertSent ? (
            /* ── Succès ── */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h3 style={{ color: '#0f172a', fontSize: '22px', fontWeight: 900, margin: '0 0 12px' }}>
                Message envoyé !
              </h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7, margin: '0 0 28px' }}>
                Un expert vous contactera sous 24h à l&apos;adresse indiquée.
              </p>
              <button
                onClick={() => setShowExpertModal(false)}
                style={{ background: '#00335c', color: '#fff', border: 'none', borderRadius: '999px', padding: '14px 32px', fontWeight: 900, fontSize: '15px', cursor: 'pointer' }}
              >
                Fermer
              </button>
            </div>
          ) : (
            /* ── Formulaire ── */
            <>
              <p style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 8px' }}>
                Coaching Expert
              </p>
              <h3 style={{ color: '#0f172a', fontSize: '24px', fontWeight: 900, margin: '0 0 28px', lineHeight: 1.2 }}>
                Parler à un Expert
              </h3>

              {/* Email */}
              <label style={{ display: 'block', marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Votre email *
                </span>
                <input
                  type="email"
                  value={expertEmail}
                  onChange={e => setExpertEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#005596')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                />
              </label>

              {/* Motif */}
              <label style={{ display: 'block', marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Motif *
                </span>
                <input
                  type="text"
                  value={expertMotif}
                  onChange={e => setExpertMotif(e.target.value)}
                  placeholder="Ex : Crédit immobilier, Compte entreprise…"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#005596')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                />
              </label>

              {/* Description */}
              <label style={{ display: 'block', marginBottom: '28px' }}>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Description du besoin *
                </span>
                <textarea
                  value={expertDesc}
                  onChange={e => setExpertDesc(e.target.value)}
                  placeholder="Décrivez votre situation et vos attentes…"
                  rows={4}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#005596')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                />
              </label>

              {/* Bouton envoyer */}
              <button
                onClick={sendExpertRequest}
                disabled={expertSending || !expertEmail.trim() || !expertMotif.trim() || !expertDesc.trim()}
                style={{
                  width: '100%', padding: '16px', border: 'none', borderRadius: '999px',
                  background: (!expertEmail.trim() || !expertMotif.trim() || !expertDesc.trim()) ? '#e2e8f0' : '#00335c',
                  color: (!expertEmail.trim() || !expertMotif.trim() || !expertDesc.trim()) ? '#94a3b8' : '#fff',
                  fontWeight: 900, fontSize: '16px', cursor: (!expertEmail.trim() || !expertMotif.trim() || !expertDesc.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all .2s',
                }}
              >
                {expertSending ? 'Envoi en cours…' : 'Envoyer ma demande'}
              </button>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}

/* ── Sous-composants ─────────────────────────────────────────── */

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans text-white text-center p-8">
      <div className="relative mb-10 md:mb-16">
        <div className="w-32 h-32 md:w-56 md:h-56 rounded-full border-4 md:border-8 border-slate-800 border-t-[color:var(--color-fintech-accent)] [animation:var(--animate-spin)] shadow-[0_0_100px_rgba(141,198,63,0.4)]" />
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[color:var(--color-fintech-accent)] animate-pulse" size={48} />
      </div>
      <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
        Moteur IA v2.0 Actif…
      </h2>
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 max-w-xl mx-auto shadow-2xl">
        <p className="text-slate-400 text-lg md:text-xl font-bold leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {[0, 200, 400].map(delay => (
            <div key={delay} className="h-1.5 w-12 bg-[color:var(--color-fintech-accent)] rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BankCard({
  rec, index, profile, submitting, onSelect,
}: {
  rec: ScoredBank; index: number; profile: Profile; submitting: boolean; onSelect: () => void;
}) {
  const isTop = index === 0;
  const noCredit = profile.needs_credit === 'no';
  return (
    <div className={`bg-white rounded-[4.5rem] shadow-2xl overflow-hidden flex flex-col border-2 transform transition-all duration-700 hover:-translate-y-6 ${
      isTop
        ? 'border-[color:var(--color-fintech-accent)] lg:scale-105 z-10'
        : 'border-white'
    }`}>
      {isTop && (
        <div className="bg-[color:var(--color-fintech-accent)] text-white py-5 text-center font-black text-[11px] tracking-[0.5em] uppercase">
          🏆 Recommandation Optimisée
        </div>
      )}

      {/* Tête carte */}
      <div className="p-10 md:p-12 text-center border-b border-slate-50 bg-gradient-to-b from-slate-50/20 to-white">
        <div className="h-24 md:h-28 flex items-center justify-center mb-8 bg-white rounded-[2.5rem] p-6 w-full shadow-lg border border-slate-50">
          {rec.logo
            /* eslint-disable-next-line @next/next/no-img-element */
            ? <img src={rec.logo} alt={rec.name} style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }} />
            : <span className="text-2xl font-black text-slate-400">{rec.code}</span>
          }
        </div>
        <h3 className="font-black text-slate-900 text-3xl mb-1 tracking-tight">{rec.name}</h3>
        <div className="flex items-center justify-center gap-3">
          <span className="text-[color:var(--color-fintech-blue)] font-black text-6xl md:text-7xl tracking-tighter leading-none">{rec.score}%</span>
          <div className="text-[10px] text-slate-300 font-extrabold uppercase text-left leading-none tracking-widest">Score<br/>Mixte</div>
        </div>
      </div>

      {/* Corps carte */}
      <div className="p-10 md:p-12 flex-1 flex flex-col">

        {/* Synthèse IA */}
        <div className="mb-10 p-8 bg-blue-50 rounded-[3rem] border border-blue-100 flex gap-5 items-start">
          <MessageSquare size={40} className="text-[color:var(--color-fintech-blue)] shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-[10px] font-black text-[color:var(--color-fintech-blue)] uppercase tracking-widest mb-2 opacity-80">
              Synthèse IA v2.0
            </p>
            <p className="text-[14px] font-bold text-slate-700 italic leading-relaxed">
              &ldquo;{rec.comment}&rdquo;
            </p>
            <div className="mt-4 text-[11px] text-slate-500 space-y-2">
              <p>Accès: <b className="text-slate-700">{rec.scoreBreakdown.access}</b>/30</p>
              <p>Coût: <b className="text-slate-700">{rec.scoreBreakdown.cost}</b>/30</p>
              <p>Services: <b className="text-slate-700">{rec.scoreBreakdown.service}</b>/20</p>
              <p>Confiance: <b className="text-slate-700">{rec.scoreBreakdown.trust}</b>/20</p>
            </div>
          </div>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <MetricSmall
            label={noCredit ? 'Frais Mensuels' : 'Taux Prévisionnel'}
            value={noCredit ? (rec.fees_detail.split(': ')[1] ?? '0 F') : `${rec.taux_estime}%`}
            icon={noCredit ? <Wallet size={14} /> : <Percent size={14} />}
          />
          <MetricSmall
            label={noCredit ? 'Taux Épargne' : 'Garantie Requise'}
            value={noCredit ? '3.5% (Base)' : rec.garantie_requise}
            icon={noCredit ? <Sparkles size={14} /> : <ShieldCheck size={14} />}
          />
          <MetricSmall label="Levier Épargne" value={(rec as Record<string,unknown>).nv_ep as string ?? 'N/A'} icon={<TrendingUp size={14} />} />
          <MetricSmall label="Indépendance"   value={rec.dependance_conseiller} icon={<Activity size={14} />} />
        </div>

        {/* VISA & frais */}
        <div className="grid grid-cols-1 gap-3 mb-10">
          <FeatureRow icon={<CreditCard size={20} className="text-purple-500" />} label="Plafond VISA / Mastercard" value={rec.visa_detail} />
          <FeatureRow icon={<Wallet size={20} className="text-green-500" />} label="Coût de maintenance" value={rec.fees_detail} />
        </div>

        {/* Avantages */}
        <div className="space-y-4 mb-10 flex-1 px-4 border-t border-slate-50 pt-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Avantages Inclus</p>
          {rec.pros.map((pro, i) => (
            <div key={i} className="flex items-center gap-4">
              <CheckCircle2 size={16} className="text-[color:var(--color-fintech-accent)]" />
              <span className="text-slate-600 font-bold text-[10px] uppercase tracking-wider">{pro}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onSelect} disabled={submitting}
          className={`w-full py-7 rounded-[3rem] font-black text-2xl transition-all shadow-xl active:scale-95 disabled:opacity-60 flex items-center justify-center gap-3 ${
            isTop
              ? 'bg-[color:var(--color-fintech-blue)] text-white hover:bg-black border-b-8 border-slate-800'
              : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {submitting
            ? <><Loader2 size={22} className="[animation:var(--animate-spin)]" /> Envoi en cours…</>
            : noCredit ? 'Ouvrir mon compte' : 'Choisir cette banque'
          }
        </button>
      </div>
    </div>
  );
}

function MetricBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md py-4 px-8 rounded-3xl border border-white/10 font-black text-xs text-slate-300 uppercase tracking-widest flex items-center gap-4 shrink-0 shadow-xl">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="opacity-60">{label}:</span>
      <span className="text-white text-xl">{value ?? 'N/A'}</span>
    </div>
  );
}

function MetricSmall({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100/50 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
        {icon} <span>{label}</span>
      </div>
      <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{value ?? 'N/A'}</div>
    </div>
  );
}

function FeatureRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
      {icon}
      <div className="flex-1">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs font-black text-slate-800 uppercase">{value}</p>
      </div>
    </div>
  );
}
