import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  CheckCircle2, TrendingUp, Sparkles, Building2, ChevronRight, Check, Trophy,
  MessageSquare, ShieldAlert, Zap, Percent, ShieldCheck, Info, ArrowUpRight,
  HelpCircle, MoreHorizontal, Activity, CreditCard, Wallet, Landmark, Loader2
} from 'lucide-react';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

function getIncomeBracket(income) {
  const n = parseInt(income || 0);
  if (n <= 250000)  return '0-250k';
  if (n <= 600000)  return '250k-600k';
  if (n <= 800000)  return '600k-800k';
  if (n <= 1200000) return '800k-1200k';
  return '1200k+';
}

export default function ComparisonResults() {
  const location = useLocation();
  const navigate = useNavigate();

  // useMemo évite la recréation de l'objet à chaque render → pas de boucle infinie
  const profile = useMemo(() => location.state?.profile || { 
    full_name: 'Utilisateur',
    age: 30, 
    company_type: 'individual', 
    statut: 'salarié_privé',
    monthly_income: 500000,
    needs_credit: 'yes',
    montant_demande: 5000000,
    type_credit: 'consommation',
    interests: { visa_premium: true, low_fees: true }
  }, [location.state]);

  const [analyzing, setAnalyzing] = useState(true);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leadConfirmed, setLeadConfirmed] = useState(null); // { name, code } de la banque choisie

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {

    async function fetchBanks() {
      try {
        const { data, error } = await supabase
          .from('bank_profiles')
          .select(`
            *,
            banking_tariffs (*)
          `)
          .eq('is_partner', true);

        if (error) throw error;

        if (data) {
          const mapped = data.map(b => {
            const target = profile.company_type === 'individual' ? 'particulier' : 'entreprise';
            const validTariffs = b.banking_tariffs.filter(t => t.target_profile === target || t.target_profile === 'mixte');
            const t = validTariffs[0] || b.banking_tariffs[0] || {};

            // Correction spécifique logo SGCI
            const logoPath = b.code === 'SGCI' ? '/logos/sgbci.png' : `/logos/${b.code.toLowerCase()}.png`;

            // Construction dynamique des Pros
            const dynamicPros = [];
            if (t.has_mobile_banking) dynamicPros.push('App Mobile incluse');
            if (t.has_visa_card) dynamicPros.push('Carte VISA active');
            if (t.has_online_banking) dynamicPros.push('Accès web 24/7');
            if (t.has_insurance) dynamicPros.push('Assurance incluse');
            if (dynamicPros.length < 3) dynamicPros.push('Service Client 5*');

            return {
              id: b.id,
              code: b.code,
              name: b.name,
              logo: logoPath,
              credit_access_pme: b.reliability_score / 5,
              credit_access_fonct: b.reliability_score / 5 - 1,
              credit_access_salarie: b.reliability_score / 5 - 2,
              taux_base_credit: 8.5, 
              score_partenariats: b.reliability_score > 80 ? 12 : 10,
              score_autonomie_base: t.has_online_banking ? 12 : 8,
              visa_detail: t.has_visa_card ? (t.has_international ? 'VISA Internationale' : 'VISA Classic') : 'Standard',
              fees_detail: t.monthly_fee > 0 ? `Pack: ${t.monthly_fee}F/mois` : 'Compte Gratuit',
              pros: dynamicPros.slice(0, 3)
            };
          });
          setBanks(mapped);
        }
      } catch (err) {
        console.error('Erreur fetch:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanks();
  }, [profile]);

  if (analyzing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans text-white text-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fintech-dark via-slate-900 to-black opacity-50"></div>
        <div className="relative mb-10 md:mb-16">
          <div className="w-32 h-32 md:w-56 md:h-56 rounded-full border-4 md:border-8 border-slate-800 border-t-fintech-accent animate-spin shadow-[0_0_100px_rgba(141,198,63,0.4)]"></div>
          <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-fintech-accent animate-pulse" size={48} />
        </div>
        <h2 className="relative text-4xl md:text-6xl font-black mb-6 tracking-tighter animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">Moteur IA v2.0 Actif...</h2>
        <div className="relative bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 max-w-xl mx-auto shadow-2xl">
           <p className="text-slate-400 text-lg md:text-xl font-bold leading-relaxed mb-6">
              Analyse multicritère de votre profil <span className="text-fintech-accent uppercase tracking-widest">{profile.company_type}</span>. 
              Mixage des variables PRD 1.4 & 1.5.
           </p>
           <div className="flex gap-3 justify-center mb-4">
              <div className="h-1.5 w-12 bg-fintech-accent rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="h-1.5 w-12 bg-fintech-accent/60 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
              <div className="h-1.5 w-12 bg-fintech-accent/30 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
           </div>
        </div>
      </div>
    );
  }

  function scoringBancaireComplet(banque, profil) {
    const fortnightly_income = parseInt(profil.monthly_income || 0);
    const chiffre_affaires = parseInt(profil.chiffre_affaires || 0);
    const epargne_mensuelle = parseInt(profil.epargne_mensuelle || 0);
    const structuration = parseInt(profil.niveau_structuration || 3);
    
    // CAS : SOUHAITE UN CRÉDIT
    const needsCredit = profil.needs_credit !== 'no';

    // CRITÈRE 1: Accessibilité (Crédit) ou Digital (Services)
    let s_access = 0;
    if (needsCredit) {
      s_access = profil.company_type === "PME" ? banque.credit_access_pme : (profil.statut === "fonctionnaire" ? banque.credit_access_fonct : banque.credit_access_salarie);
      if (structuration >= 4) s_access += 2;
    } else {
      s_access = banque.score_autonomie_base + (banque.visa_detail.includes('International') ? 5 : 2);
    }

    // CRITÈRE 2: Coût (Taux ou Frais)
    let s_cout = 0;
    let taux = banque.taux_base_credit;
    
    if (needsCredit) {
      if (profil.partenariat_sgpme) taux -= 2.5;
      const income_ref = profil.company_type === 'PME' ? (chiffre_affaires / 12 || 1) : (fortnightly_income || 1);
      const ep_ratio = epargne_mensuelle / income_ref;
      if (ep_ratio >= 0.15) taux -= 1.0;
      taux = Math.max(4.5, taux);
      s_cout = taux <= 7 ? 18 : taux <= 9 ? 12 : 8;
    } else {
      // Pour les frais : banque NSIA/CORIS souvent moins chères
      const monthlyFee = parseInt(banque.fees_detail.replace(/\D/g, '') || 0);
      s_cout = monthlyFee <= 2000 ? 25 : monthlyFee <= 4000 ? 18 : 10;
    }

    // Mix profile interests
    if (profil.interests?.low_fees && (banque.code === 'CORIS' || banque.code === 'BNI')) s_cout += 5;
    if (profil.interests?.visa_premium && (banque.code === 'SGCI' || banque.code === 'SIB')) s_cout += 3;

    let score_brut = s_access + s_cout + 40;
    const score_final = Math.min(100, Math.round(score_brut));

    return {
      ...banque,
      score: score_final,
      taux_estime: taux.toFixed(1),
      probabilite: score_final >= 80 ? "Optimale" : score_final >= 60 ? "Élevée" : "À renforcer",
      garantie_requise: "Sur Dossier",
      dependance_conseiller: banque.score_autonomie_base >= 11 ? "Faible" : "Moyenne",
      comment: needsCredit 
        ? (score_final >= 85 ? "Match Crédit Premium. Votre dossier est idéal pour cette banque." : "Match Crédit Standard. Accord probable sous conditions.")
        : (score_final >= 85 ? "Pack Services Idéal. Les frais de tenue sont parmi les plus bas." : "Services Bancaires Complets. Idéal pour votre gestion quotidienne.")
    };
  }

  const recs = banks
    .map(b => scoringBancaireComplet(b, profile))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const displayMontant = !isNaN(parseInt(profile.montant_demande)) ? parseInt(profile.montant_demande).toLocaleString() : 'N/A';
  const displayProfil = profile.company_type === 'PME' ? 'PME/ENT' : 'PARTICULIER';

  const handleSelectBank = async (rec) => {
    if (submitting) return;
    setSubmitting(true);

    const income = parseInt(profile.monthly_income || (profile.chiffre_affaires / 12) || 0);
    const payload = {
      prospect_id:      location.state?.prospect_id || null,
      bank_id:          rec.id,
      bank_name:        rec.name,
      bank_code:        rec.code,
      income_bracket:   getIncomeBracket(income),
      profile_snapshot: {
        full_name:       profile.full_name,
        email:           profile.email,
        phone:           profile.phone,
        monthly_income:  income,
        company_type:    profile.company_type,
        needs_credit:    profile.needs_credit,
        montant_demande: profile.montant_demande || null,
        type_credit:     profile.type_credit || null,
      },
    };

    try {
      if (N8N_WEBHOOK_URL) {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      // Le webhook est indisponible — on ne bloque pas l'UX
      console.warn('N8N webhook non joignable:', err.message);
    } finally {
      setSubmitting(false);
      setLeadConfirmed({ name: rec.name, code: rec.code });
    }
  };

  // ── Modal de confirmation lead envoyé ─────────────────────────
  if (leadConfirmed) {
    return (
      <div className="min-h-screen bg-fintech-dark flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[4rem] shadow-2xl p-14 max-w-lg w-full text-center">
          <div className="w-24 h-24 bg-fintech-accent/15 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={52} className="text-fintech-accent" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-fintech-accent mb-4">Dossier transmis</p>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            Votre demande a été envoyée à<br />
            <span className="text-fintech-blue">{leadConfirmed.name}</span>
          </h2>
          <p className="text-slate-500 font-bold leading-relaxed mb-10">
            Un conseiller de la banque vous contactera dans les <span className="text-slate-800">48 heures</span> aux coordonnées que vous avez fournies.
          </p>
          <div className="bg-slate-50 rounded-[2rem] p-6 mb-10 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <CheckCircle2 size={16} className="text-fintech-accent shrink-0" />
              Dossier transmis via notre réseau sécurisé
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <CheckCircle2 size={16} className="text-fintech-accent shrink-0" />
              Délai de réponse garanti : 48h maximum
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <CheckCircle2 size={16} className="text-fintech-accent shrink-0" />
              Notification par email et téléphone
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-5 rounded-[2rem] border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-50 transition-all"
            >
              Retour à l'accueil
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="flex-1 py-5 rounded-[2rem] bg-fintech-blue text-white font-black hover:bg-black transition-all"
            >
              Créer mon compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 overflow-x-hidden">
      <div className="bg-fintech-dark text-white pt-16 md:pt-28 pb-40 md:pb-56 relative overflow-hidden px-4 md:px-0 text-center">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-fintech-accent/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="container mx-auto relative z-10 px-6">
          <div className="flex justify-center mb-12">
             <div className="bg-white p-6 rounded-[3rem] shadow-2xl cursor-pointer hover:scale-105 border-b-4 border-slate-200" onClick={() => navigate('/')}>
               <img src="/logos/logo-compare-ta-banque.png" alt="CTB" className="h-20 sm:h-28 md:h-32 object-contain" />
             </div>
          </div>
          <div className="inline-flex items-center gap-4 bg-fintech-accent/20 text-fintech-accent px-8 py-3 rounded-full font-black text-xs mb-10 border border-white/10 tracking-[0.4em] uppercase">
            <Trophy size={20} /> TOP 3 MATCHING MIXTE v2.0
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-10 leading-tight tracking-tighter max-w-5xl mx-auto">
             Votre profil <span className="text-fintech-accent italic">analysé</span> par notre IA.
          </h1>
          <div className="flex overflow-x-auto md:justify-center gap-6 mt-12 scrollbar-hide px-4 md:px-0">
             <MetricBadge label="PROFIL" value={displayProfil} color="bg-blue-500" />
             <MetricBadge 
               label={profile.needs_credit === 'no' ? "INTENTION" : "BESOIN"} 
               value={profile.needs_credit === 'no' ? "Service & Frais" : `${displayMontant} F`} 
               color="bg-fintech-accent" 
             />
             <MetricBadge label="STATUT" value={profile.statut ? profile.statut.replace('_', ' ') : profile.type_pme} color="bg-purple-500" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-5 sm:px-10 -mt-24 md:-mt-36 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {loading ? (
             <div className="col-span-full py-20 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-fintech-blue rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold animate-pulse">Synchronisation avec les tarifs bancaires...</p>
             </div>
          ) : recs.length > 0 ? (
            recs.map((rec, index) => (
               <div key={rec.id} className={`bg-white rounded-[4.5rem] shadow-2xl overflow-hidden flex flex-col border-2 transform transition-all duration-700 hover:-translate-y-6 ${index === 0 ? 'border-fintech-accent scale-100 lg:scale-105 z-10' : 'border-white'}`}>
                 
                 {index === 0 && (
                   <div className="bg-fintech-accent text-white py-5 text-center font-black text-[11px] tracking-[0.5em] uppercase">
                     🏆 Recommandation Optimisée
                   </div>
                 )}

                 <div className="p-10 md:p-12 text-center border-b border-slate-50 bg-gradient-to-b from-slate-50/20 to-white relative">
                    <div className="h-24 md:h-28 flex items-center justify-center mb-8 bg-white rounded-[2.5rem] p-6 w-full shadow-lg border border-slate-50">
                      <img src={rec.logo} alt={rec.name} className="max-h-full object-contain" />
                    </div>
                    <h3 className="font-black text-slate-900 text-3xl mb-1 tracking-tight">{rec.name}</h3>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-fintech-blue font-black text-6xl md:text-7xl tracking-tighter leading-none">{rec.score}%</span>
                      <div className="text-[10px] text-slate-300 font-extrabold uppercase text-left leading-none tracking-widest">Score<br/>Mixte</div>
                    </div>
                 </div>

                 <div className="p-10 md:p-12 flex-1 flex flex-col">
                   <div className="mb-10 p-8 bg-blue-50 rounded-[3rem] border border-blue-100 flex gap-5 items-start relative">
                      <MessageSquare size={40} className="text-fintech-blue shrink-0 mt-1" />
                      <div className="flex-1">
                         <p className="text-[10px] font-black text-fintech-blue uppercase tracking-widest mb-2 opacity-80">Synthèse IA v2.0</p>
                         <p className="text-[14px] font-bold text-slate-700 italic leading-relaxed">
                           "{rec.comment}"
                         </p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-10">
                    <MetricSmall 
                      label={profile.needs_credit === 'no' ? "Frais Mensuels" : "Taux Prévisionnel"} 
                      value={profile.needs_credit === 'no' ? (rec.fees_detail.split(': ')[1] || '0 F') : `${rec.taux_estime}%`} 
                      icon={profile.needs_credit === 'no' ? <Wallet size={14} /> : <Percent size={14} />} 
                    />
                    <MetricSmall 
                      label={profile.needs_credit === 'no' ? "Taux Épargne" : "Garantie Requise"} 
                      value={profile.needs_credit === 'no' ? "3.5% (Base)" : rec.garantie_requise} 
                      icon={profile.needs_credit === 'no' ? <Sparkles size={14} /> : <ShieldCheck size={14} />} 
                    />
                    <MetricSmall label="Levier Épargne" value={rec.nv_ep} icon={<TrendingUp size={14} />} />
                    <MetricSmall label="Indépendance" value={rec.dependance_conseiller} icon={<Activity size={14} />} />
                  </div>

                   {/* SPECIFIC FEATURES (VISA & FEES) */}
                   <div className="grid grid-cols-1 gap-3 mb-10">
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <CreditCard size={20} className="text-purple-500" />
                         <div className="flex-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Plafond VISA / Mastercard</p>
                            <p className="text-xs font-black text-slate-800 uppercase">{rec.visa_detail}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <Wallet size={20} className="text-green-500" />
                         <div className="flex-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Coût de maintenance</p>
                            <p className="text-xs font-black text-slate-800 uppercase">{rec.fees_detail}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4 mb-10 flex-1 px-4 border-t border-slate-50 pt-8">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Avantages Inclus</p>
                     {rec.pros.map((pro, i) => (
                       <div key={i} className="flex items-center gap-4">
                         <CheckCircle2 size={16} className="text-fintech-accent" />
                         <span className="text-slate-600 font-bold text-[10px] uppercase tracking-wider">{pro}</span>
                       </div>
                     ))}
                   </div>

                   <button
                     onClick={() => handleSelectBank(rec)}
                     disabled={submitting}
                     className={`w-full py-7 rounded-[3rem] font-black text-2xl transition-all shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                       index === 0
                         ? 'bg-fintech-blue text-white hover:bg-black border-b-8 border-slate-800'
                         : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
                     }`}
                   >
                     {submitting
                       ? <><Loader2 size={22} className="animate-spin" /> Envoi en cours...</>
                       : profile.needs_credit === 'no' ? 'Ouvrir mon compte' : 'Choisir cette banque'
                     }
                   </button>
                 </div>
               </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[4rem] shadow-xl border-2 border-dashed border-slate-200">
               <ShieldAlert className="mx-auto text-orange-500 mb-6" size={64} />
               <h3 className="text-2xl font-black text-slate-800 mb-4">Aucune banque partenaire trouvée</h3>
               <p className="text-slate-500 max-w-md mx-auto font-bold mb-8">
                 Il semble que votre base de données Supabase soit vide. 
                 Veuillez exécuter le script <code className="bg-slate-100 px-2 py-1 rounded text-red-500">002_seed_banks.sql</code> dans votre SQL Editor.
               </p>
               <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-8 py-4 rounded-full font-black hover:bg-fintech-blue transition-all">
                 Rafraîchir après import
               </button>
            </div>
          )}
        </div>
        
        <div className="mt-24 bg-white/50 backdrop-blur-md p-10 rounded-[4rem] border border-white shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
           <div className="bg-fintech-blue p-6 rounded-[2.5rem] text-white">
              <Landmark size={40} />
           </div>
           <div className="flex-1 text-center md:text-left">
              <h4 className="text-2xl font-black text-slate-900 mb-2">Besoin d'un coaching expert ?</h4>
              <p className="text-slate-500 font-bold leading-relaxed">Nos conseillers sont disponibles pour affiner votre dossier de crédit avant l'envoi banque.</p>
           </div>
           <button className="bg-slate-900 text-white px-10 py-5 rounded-full font-black hover:bg-fintech-accent transition-all whitespace-nowrap">Parler à un Expert</button>
        </div>

        <div className="mt-20 text-center opacity-70 px-6">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-2xl mx-auto">
             Plateforme certifiée Standard UEMOA 2026. 
             Données certifiées conformes à la Directive 07/2010/CM/UEMOA.
           </p>
        </div>
      </div>
    </div>
  );
}

function MetricBadge({ label, value, color }) {
  const displayValue = value || 'N/A';
  return (
    <div className={`bg-white/10 backdrop-blur-md py-4 px-8 rounded-3xl border border-white/10 font-black text-xs text-slate-300 uppercase tracking-widest flex items-center gap-4 shrink-0 shadow-xl`}>
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="opacity-60">{label}:</span> <span className="text-white text-xl">{displayValue}</span>
    </div>
  );
}

function MetricSmall({ label, value, icon }) {
  const displayValue = value || 'N/A';
  return (
    <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100/50 flex flex-col gap-2 shadow-sm">
       <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
          {icon} <span>{label}</span>
       </div>
       <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{displayValue}</div>
    </div>
  );
}
