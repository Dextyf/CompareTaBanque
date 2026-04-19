'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, Zap, CheckCircle2, TrendingUp,
  Activity, Wallet, ShieldCheck, Handshake, PieChart,
  Building2, User, Briefcase, GraduationCap, Stethoscope,
  Shield, Store, Wrench,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

/* ── Types ─────────────────────────────────────────────────── */
interface FormData {
  // Identité
  full_name: string;
  email: string;
  phone: string;
  age: string;
  pays: string;
  // Type principal
  company_type: string;       // 'individual' | 'PME'
  // Particulier
  statut: string;             // 'salarié_privé'|'fonctionnaire'|'indépendant'|'profession_libérale'|'retraité'
  corps_fonction: string;     // si fonctionnaire
  anciennete_emploi: string;  // si salarié/fonctionnaire
  secteur_salarie: string;    // secteur pour salarié privé
  // Entrepreneur / PME
  legal_type: string;         // SA|SARL|SUARL|EI|SNC
  type_pme: string;           // PME|TPE|EI
  taille_entreprise: string;  // '1-5'|'6-10'|'11-50'|'51-200'|'200+'
  anciennete_entreprise: string; // '<1'|'1-3'|'3-7'|'7+'
  secteur_activite: string;
  // Finances
  monthly_income: string;
  chiffre_affaires: string;
  needs_credit: string;
  montant_demande: string;
  type_credit: string;
  apport_personnel_pct: string;
  // Qualité
  niveau_structuration: string;
  garantie_disponible: string;
  besoin_autonomie: string;
  // Partenariats
  partenariat_sgpme: boolean;
  partenariat_ifc: boolean;
  // Intérêts
  interests: {
    savings: boolean; visa_premium: boolean;
    low_fees: boolean; mortgage: boolean; business_credit: boolean;
  };
}

const INITIAL: FormData = {
  full_name: '', email: '', phone: '', age: '30', pays: 'Côte d\'Ivoire',
  company_type: 'individual',
  statut: 'salarié_privé', corps_fonction: '', anciennete_emploi: '1-3',
  secteur_salarie: 'prive',
  legal_type: 'SARL', type_pme: 'PME',
  taille_entreprise: '1-5', anciennete_entreprise: '1-3',
  secteur_activite: 'commerce',
  monthly_income: '', chiffre_affaires: '',
  needs_credit: 'yes', montant_demande: '', type_credit: 'consommation',
  apport_personnel_pct: '10',
  niveau_structuration: '3', garantie_disponible: '3', besoin_autonomie: '3',
  partenariat_sgpme: false, partenariat_ifc: false,
  interests: { savings: false, visa_premium: false, low_fees: false, mortgage: false, business_credit: false },
};

/* ── Données statiques ──────────────────────────────────────── */
const STATUTS_PARTICULIER = [
  { value: 'salarié_privé',       label: 'Salarié Privé',       icon: <Briefcase    size={22} />, sub: 'Secteur privé / ONG' },
  { value: 'fonctionnaire',       label: 'Fonctionnaire',        icon: <Shield       size={22} />, sub: 'État / Corps habillés' },
  { value: 'indépendant',         label: 'Indépendant',          icon: <Wrench       size={22} />, sub: 'Artisan / Commerçant' },
  { value: 'profession_libérale', label: 'Profession Libérale',  icon: <Stethoscope  size={22} />, sub: 'Médecin / Avocat / Expert' },
  { value: 'retraité',            label: 'Retraité',             icon: <User         size={22} />, sub: 'Pension régulière' },
];

const CORPS_FONCTION = [
  { value: 'education',       label: 'Éducation / Enseignement' },
  { value: 'sante',           label: 'Santé / Médecine' },
  { value: 'armee',           label: 'Armée / Défense' },
  { value: 'police',          label: 'Police / Gendarmerie' },
  { value: 'douane_impot',    label: 'Douanes / Impôts / Trésor' },
  { value: 'administration',  label: 'Administration Publique' },
  { value: 'justice',         label: 'Justice / Magistrature' },
  { value: 'autre',           label: 'Autre Corps d\'État' },
];

const TYPES_PME = [
  { value: 'PME',  label: 'PME',               sub: '10 – 200 employés',     icon: <Building2 size={22} /> },
  { value: 'TPE',  label: 'TPE',               sub: '1 – 9 employés',        icon: <Store     size={22} /> },
  { value: 'EI',   label: 'Entrepreneur Ind.', sub: 'Entreprise Individuelle',icon: <Briefcase size={22} /> },
];

const SECTEURS = [
  'Agriculture / Élevage', 'BTP / Immobilier', 'Commerce / Distribution',
  'Éducation / Formation', 'Finance / Assurance', 'Industrie / Manufacture',
  'Informatique / Numérique', 'Santé / Pharmacie', 'Services / Conseil',
  'Transport / Logistique', 'Tourisme / Hôtellerie', 'Autre',
];

const PAYS_UEMOA = [
  'Bénin', 'Burkina Faso', 'Côte d\'Ivoire', 'Guinée-Bissau',
  'Mali', 'Niger', 'Sénégal', 'Togo',
];

/* ── Page principale ────────────────────────────────────────── */
export default function ProspectFormPage() {
  const router   = useRouter();
  const supabase = createClient();
  const qualiteSectionRef = useRef<HTMLDivElement>(null);

  const [formData,    setFormData]    = useState<FormData>(INITIAL);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPME = formData.company_type === 'PME';

  // ── Validation : champs obligatoires avant lancer le scoring ──
  const missingFields: string[] = [];
  if (!formData.full_name.trim())   missingFields.push('Nom complet');
  if (!formData.email.trim())       missingFields.push('Email');
  if (!isPME && !formData.monthly_income.trim()) missingFields.push('Revenu mensuel');
  if (isPME  && !formData.chiffre_affaires.trim()) missingFields.push('Chiffre d\'affaires');
  if (formData.needs_credit === 'yes' && !formData.montant_demande.trim())
    missingFields.push('Montant du crédit');
  const isFormValid = missingFields.length === 0;

  const set = (field: keyof FormData, value: unknown) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    if (type === 'checkbox' && name.startsWith('interest_')) {
      const key = name.replace('interest_', '') as keyof FormData['interests'];
      setFormData(prev => ({ ...prev, interests: { ...prev.interests, [key]: checked } }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const income = parseInt(
        isPME
          ? String(Number(formData.chiffre_affaires) / 12 || 0)
          : formData.monthly_income || '0'
      );

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('prospects')
        .insert({
          email:          formData.email,
          phone:          formData.phone,
          full_name:      formData.full_name,
          monthly_income: income,
          company_type:   isPME ? formData.type_pme : formData.statut,
          needs_credit:   formData.needs_credit,
          consent_given:  true,
          consent_date:   new Date().toISOString(),
          auth_user_id:   user?.id ?? null,
        })
        .select('id')
        .single();

      let prospectId = data?.id as string | undefined;
      if (error?.code === '23505') {
        const { data: existing } = await supabase
          .from('prospects').select('id').eq('email', formData.email).single();
        prospectId = existing?.id;
      } else if (error) {
        throw error;
      }

      setTimeout(() => {
        const params = new URLSearchParams();
        params.set('profile', encodeURIComponent(JSON.stringify(formData)));
        if (prospectId) params.set('prospect_id', prospectId);
        router.push(`/results?${params.toString()}`);
      }, 2500);

    } catch (err: unknown) {
      console.error(err);
      alert('Erreur: ' + (err as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-1/4 bg-[color:var(--color-fintech-dark)] relative overflow-hidden items-center justify-center p-12 border-r border-white/5 h-screen sticky top-0">
        <div className="relative z-10 text-center">
          <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
            <div className="bg-[color:var(--color-fintech-accent)] w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-8 mx-auto shadow-xl">
              <Zap size={40} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 leading-tight">Matching IA v2.0 Actif</h2>
            <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-70 italic">
              Précision de scoring optimisée
            </p>
            <div className="mt-8 space-y-3 text-left">
              {[
                'Profil évalué en temps réel',
                'Grilles tarifaires officielles',
                'Score CPL automatique',
                'Top 3 banques personnalisé',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-blue-200/70 font-bold">
                  <CheckCircle2 size={14} className="text-[color:var(--color-fintech-accent)] shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Formulaire ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50 py-12 px-6 md:px-16">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-16">
            <Image src="/logos/logo-compare-ta-banque.png" alt="Logo" width={200} height={80}
              className="h-20 w-auto mx-auto mb-8 cursor-pointer hover:scale-105 transition-all"
              onClick={() => router.push('/')} />
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-3 tracking-tighter">
              Évaluation Intelligente.
            </h1>
            <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
              Précisez votre profil pour un matching et un scoring précis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12 pb-24">

            {/* ═══ SECTION 1 — Structure & Profil ═══════════════ */}
            <Section title="Structure & Profil" icon={<Activity size={24} />} color="bg-blue-50 text-blue-600">

              {/* Toggle principal */}
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                Nature du Demandeur
              </label>
              <div className="flex bg-slate-100 p-2 rounded-3xl mb-10">
                <ToggleBtn
                  active={!isPME} label="Particulier / Indépendant"
                  onClick={() => set('company_type', 'individual')}
                  icon={<User size={18} />}
                />
                <ToggleBtn
                  active={isPME} label="PME / Entreprise"
                  onClick={() => set('company_type', 'PME')}
                  icon={<Building2 size={18} />}
                />
              </div>

              {/* ── Particulier ──────────────────────────────── */}
              {!isPME && (
                <div className="space-y-8 [animation:var(--animate-fadeIn)]">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                      Statut Professionnel
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {STATUTS_PARTICULIER.map(s => (
                        <button key={s.value} type="button"
                          onClick={() => set('statut', s.value)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                            formData.statut === s.value
                              ? 'border-[color:var(--color-fintech-blue)] bg-blue-50'
                              : 'border-slate-100 bg-white hover:border-slate-300'
                          }`}>
                          <div className={`p-2 rounded-xl ${formData.statut === s.value ? 'bg-[color:var(--color-fintech-blue)] text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {s.icon}
                          </div>
                          <div>
                            <p className={`text-sm font-black ${formData.statut === s.value ? 'text-[color:var(--color-fintech-blue)]' : 'text-slate-700'}`}>
                              {s.label}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">{s.sub}</p>
                          </div>
                          {formData.statut === s.value && (
                            <CheckCircle2 size={18} className="ml-auto text-[color:var(--color-fintech-blue)] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fonctionnaire → Corps */}
                  {formData.statut === 'fonctionnaire' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50 rounded-3xl border border-blue-100 [animation:var(--animate-fadeIn)]">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Corps / Administration
                        </label>
                        <select name="corps_fonction" value={formData.corps_fonction} onChange={handleChange}
                          className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl font-bold text-slate-800">
                          <option value="">— Sélectionner —</option>
                          {CORPS_FONCTION.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Ancienneté dans la Fonction
                        </label>
                        <select name="anciennete_emploi" value={formData.anciennete_emploi} onChange={handleChange}
                          className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl font-bold text-slate-800">
                          <option value="<1">Moins d'1 an</option>
                          <option value="1-3">1 – 3 ans</option>
                          <option value="3-7">3 – 7 ans</option>
                          <option value="7-15">7 – 15 ans</option>
                          <option value="15+">Plus de 15 ans</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Salarié privé → Secteur + Ancienneté */}
                  {formData.statut === 'salarié_privé' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 [animation:var(--animate-fadeIn)]">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Secteur d'Activité de l'Employeur
                        </label>
                        <select name="secteur_salarie" value={formData.secteur_salarie} onChange={handleChange}
                          className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-800">
                          {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Ancienneté dans l'Entreprise
                        </label>
                        <select name="anciennete_emploi" value={formData.anciennete_emploi} onChange={handleChange}
                          className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-800">
                          <option value="<1">Moins d'1 an</option>
                          <option value="1-3">1 – 3 ans</option>
                          <option value="3-7">3 – 7 ans</option>
                          <option value="7+">Plus de 7 ans</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Indépendant / Libéral → Secteur */}
                  {(formData.statut === 'indépendant' || formData.statut === 'profession_libérale') && (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 [animation:var(--animate-fadeIn)]">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Domaine d'Activité
                      </label>
                      <select name="secteur_activite" value={formData.secteur_activite} onChange={handleChange}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-800">
                        {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* ── PME / Entreprise ─────────────────────────── */}
              {isPME && (
                <div className="space-y-8 [animation:var(--animate-fadeIn)]">

                  {/* Type d'entreprise */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                      Type d'Entreprise
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {TYPES_PME.map(t => (
                        <button key={t.value} type="button"
                          onClick={() => set('type_pme', t.value)}
                          className={`flex items-center gap-3 p-5 rounded-2xl border-2 transition-all text-left ${
                            formData.type_pme === t.value
                              ? 'border-[color:var(--color-fintech-blue)] bg-blue-50'
                              : 'border-slate-100 bg-white hover:border-slate-300'
                          }`}>
                          <div className={`p-2 rounded-xl ${formData.type_pme === t.value ? 'bg-[color:var(--color-fintech-blue)] text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {t.icon}
                          </div>
                          <div>
                            <p className={`font-black text-sm ${formData.type_pme === t.value ? 'text-[color:var(--color-fintech-blue)]' : 'text-slate-700'}`}>
                              {t.label}
                            </p>
                            <p className="text-[10px] text-slate-400">{t.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Structure juridique + Taille + Ancienneté */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Forme Juridique
                      </label>
                      <select name="legal_type" value={formData.legal_type} onChange={handleChange}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-800">
                        <option value="SARL">SARL</option>
                        <option value="SA">SA</option>
                        <option value="SUARL">SUARL</option>
                        <option value="EI">Entreprise Individuelle</option>
                        <option value="SNC">SNC</option>
                        <option value="SAS">SAS</option>
                        <option value="Asso">Association / ONG</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Effectif (Employés)
                      </label>
                      <select name="taille_entreprise" value={formData.taille_entreprise} onChange={handleChange}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-800">
                        <option value="1-5">1 – 5</option>
                        <option value="6-10">6 – 10</option>
                        <option value="11-50">11 – 50</option>
                        <option value="51-200">51 – 200</option>
                        <option value="200+">Plus de 200</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Ancienneté
                      </label>
                      <select name="anciennete_entreprise" value={formData.anciennete_entreprise} onChange={handleChange}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-800">
                        <option value="<1">Moins d'1 an</option>
                        <option value="1-3">1 – 3 ans</option>
                        <option value="3-7">3 – 7 ans</option>
                        <option value="7+">Plus de 7 ans</option>
                      </select>
                    </div>
                  </div>

                  {/* Secteur d'activité */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Secteur d'Activité
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {SECTEURS.map(s => (
                        <button key={s} type="button"
                          onClick={() => set('secteur_activite', s)}
                          className={`px-3 py-2.5 rounded-xl text-[11px] font-black border-2 transition-all text-left ${
                            formData.secteur_activite === s
                              ? 'border-[color:var(--color-fintech-blue)] bg-blue-50 text-[color:var(--color-fintech-blue)]'
                              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* ═══ SECTION 2 — Finances & Intention ════════════ */}
            <Section title="Finances & Intention" icon={<Wallet size={24} />} color="bg-green-50 text-green-600">
              <div className="mb-10">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">
                  Souhaitez-vous un financement (crédit) ?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectionCard
                    active={formData.needs_credit === 'yes'}
                    onClick={() => set('needs_credit', 'yes')}
                    icon={<TrendingUp size={24} />}
                    label="Oui, j'ai un projet" sub="Inclure le scoring crédit"
                  />
                  <SelectionCard
                    active={formData.needs_credit === 'no'}
                    onClick={() => {
                      set('needs_credit', 'no');
                      set('montant_demande', '0');
                      setTimeout(() => qualiteSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                    }}
                    icon={<PieChart size={24} />}
                    label="Pas pour le moment" sub="Comparer frais & services"
                    accentColor
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormInput
                  label={isPME ? "Chiffre d'Affaires Annuel (FCFA)" : 'Revenu Mensuel Net (FCFA)'}
                  name={isPME ? 'chiffre_affaires' : 'monthly_income'}
                  value={isPME ? formData.chiffre_affaires : formData.monthly_income}
                  onChange={handleChange} type="number" placeholder="Ex: 500000" required
                />
                {formData.needs_credit === 'yes' && (
                  <>
                    <FormInput
                      label="Montant souhaité (FCFA)" name="montant_demande"
                      value={formData.montant_demande} onChange={handleChange}
                      type="number" placeholder="Ex: 5000000"
                    />
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Type de Crédit
                      </label>
                      <select name="type_credit" value={formData.type_credit} onChange={handleChange}
                        className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-800">
                        <option value="consommation">Crédit Consommation</option>
                        <option value="immobilier">Crédit Immobilier</option>
                        <option value="investissement">Investissement / Équipement</option>
                        <option value="tresorerie">Trésorerie / Fonds de roulement</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </Section>

            {/* ═══ SECTION 3 — Qualité & Préparation ══════════ */}
            <div ref={qualiteSectionRef}>
              <Section title="Qualité & Préparation du Dossier" icon={<ShieldCheck size={24} />} color="bg-purple-50 text-purple-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <RangeInput
                    label={isPME ? "Structuration de l'entreprise / dossier" : "Niveau d'organisation personnelle"}
                    name="niveau_structuration" value={formData.niveau_structuration}
                    onChange={handleChange} min="1" max="5"
                    left="Très Informel" right="Audit Certifié"
                  />
                  <RangeInput
                    label="Besoin d'Autonomie Digitale"
                    name="besoin_autonomie" value={formData.besoin_autonomie}
                    onChange={handleChange} min="1" max="5"
                    left="Besoin Agence" right="100% Mobile"
                  />
                </div>
                {isPME && (
                  <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-purple-50/50 rounded-3xl border border-purple-100">
                    <label className="col-span-full block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Partenariats & Dispositifs Publics
                    </label>
                    {[
                      { name: 'partenariat_sgpme', label: 'Partenaire SGPME', sub: 'Société de Gestion et Financement des PME' },
                      { name: 'partenariat_ifc',   label: 'Partenaire IFC',   sub: 'International Finance Corporation' },
                    ].map(p => (
                      <label key={p.name} className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        (formData as unknown as Record<string, unknown>)[p.name]
                          ? 'border-purple-400 bg-purple-50'
                          : 'border-slate-100 bg-white hover:border-purple-200'
                      }`}>
                        <input type="checkbox" name={p.name} checked={!!(formData as unknown as Record<string, unknown>)[p.name]}
                          onChange={handleChange} className="mt-1 w-5 h-5 accent-purple-600" />
                        <div>
                          <p className="font-black text-sm text-slate-800">{p.label}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{p.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </Section>
            </div>

            {/* ═══ SECTION 4 — Contact ═════════════════════════ */}
            <Section title="Finalisation & Contact" icon={<Handshake size={24} />} color="bg-orange-50 text-orange-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <FormInput label="Nom Complet" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Ex: Jean Luc Koné" />
                <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="jean@mail.com" />
                <FormInput label="Téléphone" name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="07 00 00 00 00" />
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pays</label>
                  <select
                    name="pays"
                    value={formData.pays}
                    onChange={e => setFormData(prev => ({ ...prev, pays: e.target.value }))}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-800 focus:border-[color:var(--color-fintech-blue)] focus:bg-white outline-none transition-all"
                  >
                    {PAYS_UEMOA.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-12">
                {/* Champs manquants */}
                {!isFormValid && !isSubmitting && (
                  <div className="mb-6 bg-orange-50 border border-orange-200 rounded-3xl px-6 py-4 flex flex-wrap gap-2 items-center">
                    <span className="text-orange-700 font-black text-xs uppercase tracking-widest shrink-0">Champs requis :</span>
                    {missingFields.map(f => (
                      <span key={f} className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                )}
                <button type="submit" disabled={isSubmitting || !isFormValid}
                  className={`w-full py-8 rounded-[3rem] font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group ${
                    isFormValid && !isSubmitting
                      ? 'bg-slate-900 text-white hover:bg-[color:var(--color-fintech-blue)] cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                  }`}>
                  {isSubmitting
                    ? 'Calcul du matching IA...'
                    : <>Lancer le Scoring IA v2.0 <ChevronRight className="group-hover:translate-x-3 transition-all" size={32} /></>
                  }
                </button>
                <p className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest mt-8 flex items-center justify-center gap-2">
                  <ShieldCheck size={14} className="text-[color:var(--color-fintech-accent)]" />
                  Conforme aux standards BCEAO
                </p>
              </div>
            </Section>

          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Sous-composants ─────────────────────────────────────────── */

function Section({ title, icon, color, children }: {
  title: string; icon: React.ReactNode; color: string; children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-8 md:p-12 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 [animation:var(--animate-fadeIn)]">
      <div className="flex items-center gap-4 mb-10">
        <div className={`${color} p-3 rounded-2xl`}>{icon}</div>
        <h3 className="text-[12px] font-black uppercase text-slate-800 tracking-[0.4em]">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ToggleBtn({ active, label, onClick, icon }: { active: boolean; label: string; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all ${
        active ? 'bg-white shadow-lg text-[color:var(--color-fintech-blue)]' : 'text-slate-400'
      }`}>
      {icon} {label}
    </button>
  );
}

function SelectionCard({ active, onClick, icon, label, sub, accentColor }: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; sub: string; accentColor?: boolean;
}) {
  const col = accentColor ? 'var(--color-fintech-accent)' : 'var(--color-fintech-blue)';
  return (
    <button type="button" onClick={onClick}
      className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
        active ? 'border-[color:var(--color-fintech-blue)] bg-blue-50/50' : 'border-slate-100 hover:border-slate-300 bg-white'
      }`}>
      <div className="flex items-center gap-4 text-left">
        <div className={`p-3 rounded-2xl transition-all ${active ? 'text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}
          style={active ? { backgroundColor: `var(${accentColor ? '--color-fintech-accent' : '--color-fintech-blue'})` } : undefined}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-black uppercase tracking-tight`} style={active ? { color: `var(${col})` } : { color: '#475569' }}>{label}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{sub}</p>
        </div>
      </div>
      {active && <CheckCircle2 size={24} style={{ color: `var(${col})` }} />}
    </button>
  );
}

function FormInput({ label, name, value, onChange, type = 'text', placeholder, required }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</label>
      <input required={required} type={type} name={name} value={value} onChange={onChange}
        className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-800 focus:border-[color:var(--color-fintech-blue)] focus:bg-white outline-none transition-all"
        placeholder={placeholder} />
    </div>
  );
}

function RangeInput({ label, name, value, onChange, min, max, left, right }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: string; max: string; left: string; right: string;
}) {
  return (
    <div>
      <label className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 ml-2">
        <span>{label}</span>
        <span className="text-[color:var(--color-fintech-blue)]">{value}/{max}</span>
      </label>
      <input type="range" name={name} value={value} onChange={onChange} min={min} max={max}
        className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[color:var(--color-fintech-blue)]" />
      <div className="flex justify-between text-[8px] font-black text-slate-300 mt-2 uppercase">
        <span>{left}</span><span>{right}</span>
      </div>
    </div>
  );
}
