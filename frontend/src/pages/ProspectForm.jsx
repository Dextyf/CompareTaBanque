import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Zap, CheckCircle2, TrendingUp, 
  Activity, Wallet, Landmark, PieChart, ShieldCheck, 
  Handshake, Layout, Briefcase, User 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ProspectForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const qualiteSectionRef = useRef(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: '25',
    statut: 'salarié_privé', // salarié_privé, fonctionnaire, indépendant
    company_type: 'individual', // individual OR PME
    legal_type: '', // SARL, SA, etc.
    type_pme: 'PME', // startup, PME, corporate

    // Financial & Credit
    monthly_income: '',
    chiffre_affaires: '',
    needs_credit: 'yes', // 'yes' or 'no'
    montant_demande: '',
    type_credit: 'consommation', 
    apport_personnel_pct: '10',

    // Quality & Prep
    niveau_structuration: '3', // 0-5
    garantie_disponible: '3', // 0-5
    besoin_autonomie: '3', // 0-5
    secteur_activite: 'services',
    
    // Strategic Partnerships
    partenariat_sgpme: false,
    partenariat_ifc: false,

    interests: {
      savings: false,
      visa_premium: false,
      low_fees: false,
      mortgage: false,
      business_credit: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
        if (name.startsWith('interest_')) {
            const interestKey = name.replace('interest_', '');
            setFormData(prev => ({
                ...prev,
                interests: { ...prev.interests, [interestKey]: checked }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: checked }));
        }
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Sauvegarde dans Supabase — on récupère l'ID créé
      const { data, error } = await supabase
        .from('prospects')
        .insert({
          email: formData.email,
          phone: formData.phone,
          full_name: formData.full_name,
          account_type: formData.company_type === 'individual' ? 'particulier' : 'entreprise',
          monthly_income: parseInt(formData.monthly_income || formData.chiffre_affaires / 12 || 0),
          company_type: formData.type_pme,
          needs_credit: formData.needs_credit,
          consent_given: true,
          consent_date: new Date().toISOString()
        })
        .select('id')
        .single();

      let prospectId = data?.id;

      // Email déjà existant → on récupère l'ID du prospect existant
      if (error?.code === '23505') {
        const { data: existing } = await supabase
          .from('prospects')
          .select('id')
          .eq('email', formData.email)
          .single();
        prospectId = existing?.id;
      } else if (error) {
        throw error;
      }

      // 2. Navigation vers résultats — on passe l'ID prospect pour la création du lead
      setTimeout(() => {
        navigate('/results', { state: { profile: formData, prospect_id: prospectId } });
      }, 2500);

    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      
      {/* Sidebar Info - LG+ Only */}
      <div className="hidden lg:flex lg:w-1/4 bg-fintech-dark relative overflow-hidden items-center justify-center p-12 border-r border-white/5 h-screen sticky top-0">
        <div className="absolute inset-0 bg-gradient-to-t from-fintech-dark via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10 text-center">
            <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="bg-fintech-accent w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-8 mx-auto shadow-xl">
                    <Zap size={40} />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 leading-tight whitespace-pre-wrap">Matching IA v2.0 Actif</h2>
                <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-70 italic whitespace-pre-wrap">Précision de scoring optimisée</p>
            </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 overflow-y-auto bg-slate-50 py-12 px-6 md:px-16 scrollbar-hide">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <img 
              src="/logos/logo-compare-ta-banque.png" 
              alt="Logo" 
              className="h-20 mx-auto mb-8 cursor-pointer hover:scale-105 transition-all" 
              onClick={() => navigate('/')}
            />
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-3 tracking-tighter">Évaluation Intelligente.</h1>
            <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">Précisez votre besoin pour un matching précis.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12 pb-24">

            {/* STEP 01 - NATURE DU PROFIL */}
            <Section title="Structure & Identité" icon={<Activity size={24} />} color="bg-blue-50 text-blue-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-full">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Nature du Demandeur</label>
                        <div className="flex bg-slate-100 p-2 rounded-3xl border border-slate-100">
                            <button type="button" onClick={() => setFormData({...formData, company_type:'individual'})} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${formData.company_type === 'individual' ? 'bg-white shadow-lg text-fintech-blue' : 'text-slate-400'}`}>Particulier / Indépendant</button>
                            <button type="button" onClick={() => setFormData({...formData, company_type:'PME'})} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${formData.company_type === 'PME' ? 'bg-white shadow-lg text-fintech-blue' : 'text-slate-400'}`}>PME / Entreprise</button>
                        </div>
                    </div>
                </div>
            </Section>

            {/* STEP 02 - FINANCES & CRÉDIT */}
            <Section title="Finances & Intention" icon={<Wallet size={24} />} color="bg-green-50 text-green-600">
                <div className="col-span-full mb-10">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">Souhaitez-vous un financement (crédit) ?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectionCard 
                            active={formData.needs_credit === 'yes'}
                            onClick={() => setFormData({...formData, needs_credit: 'yes'})}
                            icon={<TrendingUp size={24} />}
                            label="Oui, j'ai un projet"
                            sub="Inclure le scoring crédit"
                        />
                        <SelectionCard 
                            active={formData.needs_credit === 'no'}
                            onClick={() => {
                              setFormData({...formData, needs_credit: 'no', montant_demande: '0'});
                              setTimeout(() => qualiteSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                            }}
                            icon={<PieChart size={24} />}
                            label="Pas pour le moment"
                            sub="Comparer frais & services"
                            color="text-fintech-accent" activeColor="bg-fintech-accent border-fintech-accent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{formData.company_type === 'PME' ? 'Chiffre d\'Affaires Annuel' : 'Revenu Mensuel'}</label>
                        <input required type="number" name={formData.company_type === 'PME' ? 'chiffre_affaires' : 'monthly_income'} value={formData.company_type === 'PME' ? formData.chiffre_affaires : formData.monthly_income} onChange={handleChange} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-800" placeholder="FCFA" />
                    </div>

                    {formData.needs_credit === 'yes' && (
                        <>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Montant souhaité</label>
                                <input required type="number" name="montant_demande" value={formData.montant_demande} onChange={handleChange} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-800" placeholder="FCFA" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Type de crédit</label>
                                <select name="type_credit" value={formData.type_credit} onChange={handleChange} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black">
                                    <option value="consommation">Consommation</option>
                                    <option value="immobilier">Immobilier</option>
                                    <option value="investissement">Investissement (Business)</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </Section>

            {/* STEP 03 - PRÉPARATION (SCORING) */}
            <div ref={qualiteSectionRef}>
            <Section title="Qualité & Préparation" icon={<ShieldCheck size={24} />} color="bg-purple-50 text-purple-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <RangeInput 
                        label={formData.needs_credit === 'no' ? "Niveau d'organisation personnelle / entreprise" : "Structuration de l'entreprise / dossier"} 
                        name="niveau_structuration" 
                        value={formData.niveau_structuration} 
                        onChange={handleChange} 
                        min="1" max="5" 
                        left="Très Informel" right={formData.needs_credit === 'no' ? "Très Organisé" : "Audit Certifié"}
                    />
                    <RangeInput 
                        label="Besoin d'autonomie (Digitale)" 
                        name="besoin_autonomie" 
                        value={formData.besoin_autonomie} 
                        onChange={handleChange} 
                        min="1" max="5" 
                        left="Besoin Agence" right="100% Mobile"
                    />
                </div>
            </Section>
            </div>

            {/* STEP 04 - CONTACT */}
            <Section title="Finalisation & Contact" icon={<Handshake size={24} />} color="bg-orange-50 text-orange-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nom Complet</label>
                        <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black" placeholder="Ex: Jean Luc" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black" placeholder="Ex: jean@mail.com" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Téléphone</label>
                        <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black" placeholder="Ex: 05..." />
                    </div>
                </div>

                <div className="mt-12">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-slate-900 text-white py-8 rounded-[3rem] font-black text-2xl shadow-2xl hover:bg-fintech-blue transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                    >
                        {isSubmitting ? 'Calcul du matching IA...' : 'Lancer le Scoring IA v2.0'}
                        {!isSubmitting && <ChevronRight className="group-hover:translate-x-3 transition-all" size={32} />}
                    </button>
                    <p className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest mt-8 flex items-center justify-center gap-2">
                        <ShieldCheck size={14} className="text-fintech-accent" /> Données chiffrées sécurisées standard BCEAO 2026
                    </p>
                </div>
            </Section>

          </form>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, color, children }) {
    return (
        <section className="bg-white p-8 md:p-12 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-fadeIn">
            <div className="flex items-center gap-4 mb-10">
                <div className={`${color} p-3 rounded-2xl`}>{icon}</div>
                <h3 className="text-[12px] font-black uppercase text-slate-800 tracking-[0.4em]">{title}</h3>
            </div>
            {children}
        </section>
    );
}

function SelectionCard({ active, onClick, icon, label, sub, color="text-fintech-blue", activeColor="bg-fintech-blue border-fintech-blue" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${active ? `${activeColor.replace('bg-','border-')} bg-blue-50/50` : 'border-slate-100 hover:border-slate-300 bg-white'}`}
        >
            <div className="flex items-center gap-4 text-left">
                <div className={`p-3 rounded-2xl ${active ? activeColor + ' text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>{icon}</div>
                <div>
                    <p className={`text-sm font-black uppercase tracking-tight ${active ? color : 'text-slate-600'}`}>{label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{sub}</p>
                </div>
            </div>
            {active && <CheckCircle2 className={color} size={24} />}
        </button>
    );
}

function RangeInput({ label, name, value, onChange, min, max, left, right }) {
    return (
        <div>
            <label className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 ml-2">
                <span>{label}</span>
                <span className="text-fintech-blue">{value}/{max}</span>
            </label>
            <input type="range" name={name} value={value} onChange={onChange} min={min} max={max} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-fintech-blue" />
            <div className="flex justify-between text-[8px] font-black text-slate-300 mt-2 uppercase">
                <span>{left}</span>
                <span>{right}</span>
            </div>
        </div>
    );
}
