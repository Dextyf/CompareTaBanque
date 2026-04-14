import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Mail, ChevronLeft, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Emails des admins (table admin_users seed — migration 002)
const ADMIN_EMAILS = [
  'sakidesireluc@gmail.com',
  'arriko199@gmail.com',
  'jeanenockguikan@gmail.com',
];

function translateError(msg) {
  if (!msg) return 'Une erreur inattendue est survenue.';
  if (msg.includes('Invalid login credentials'))       return 'Email ou mot de passe incorrect.';
  if (msg.includes('Email not confirmed'))             return 'Email non confirmé. Vérifiez votre boîte mail.';
  if (msg.includes('User already registered'))         return 'Ce compte existe déjà. Connectez-vous.';
  if (msg.includes('Password should be at least'))     return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (msg.includes('over_email_send_rate_limit'))      return 'Trop d\'emails envoyés. Réessayez dans quelques minutes.';
  if (msg.includes('rate limit'))                      return 'Trop de tentatives. Réessayez dans quelques minutes.';
  if (msg.includes('Email link is invalid'))           return 'Le lien a expiré. Recommencez la réinitialisation.';
  if (msg.includes('Auth session missing'))            return 'Session expirée. Recommencez la réinitialisation depuis votre email.';
  return msg;
}

export default function Auth() {
  const navigate = useNavigate();
  // mode : 'login' | 'signup' | 'forgot' | 'reset'
  const [mode, setMode]       = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }
  const [form, setForm]       = useState({ email: '', password: '', confirmPassword: '' });

  // Détection du retour après clic sur lien Supabase (recovery / email_change)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type=email_change')) {
      setMode('reset');
    }
  }, []);

  // Si l'utilisateur est déjà connecté, on le redirige vers le tunnel consentement
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const email = session.user?.email?.toLowerCase();
        if (email && ADMIN_EMAILS.includes(email)) {
          navigate('/admin');
        } else {
          navigate('/consent');
        }
      }
    });
  }, [navigate]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const switchMode = (next) => { setMode(next); setMessage(null); setForm({ email: '', password: '', confirmPassword: '' }); };

  // ── Connexion / Inscription ────────────────────────────────────────────────
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        });
        if (error) throw error;

        ADMIN_EMAILS.includes(data.user.email.toLowerCase())
          ? navigate('/admin')
          : navigate('/consent');

      } else {
        // Inscription
        const { data, error } = await supabase.auth.signUp({
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        });
        if (error) throw error;

        if (data.session) {
          // Email confirmation désactivée dans Supabase → session immédiate
          navigate('/consent');
        } else {
          setMessage({ type: 'success', text: 'Compte créé ! Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.' });
          switchMode('login');
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: translateError(err.message) });
    } finally {
      setLoading(false);
    }
  };

  // ── Envoi du lien de réinitialisation ─────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        form.email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/auth` }
      );
      if (error) throw error;
      setMessage({ type: 'success', text: 'Lien de réinitialisation envoyé ! Vérifiez votre boîte mail (et vos spams).' });
    } catch (err) {
      setMessage({ type: 'error', text: translateError(err.message) });
    } finally {
      setLoading(false);
    }
  };

  // ── Enregistrement du nouveau mot de passe ────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (form.password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) throw error;
      // Nettoyer le hash Supabase de l'URL
      window.history.replaceState(null, '', window.location.pathname);
      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès ! Redirection vers la connexion...' });
      setTimeout(() => navigate('/auth'), 1800);
    } catch (err) {
      setMessage({ type: 'error', text: translateError(err.message) });
    } finally {
      setLoading(false);
    }
  };

  // ── Textes du panneau gauche selon le mode ────────────────────────────────
  const sidePanel = {
    login:  { title: 'Accès Sécurisé.',           sub: 'Gérez vos analyses bancaires avec la protection SSL renforcée intégrée.' },
    signup: { title: 'Créez votre accès.',         sub: 'Rejoignez des milliers de clients qui ont trouvé leur banque idéale en CI.' },
    forgot: { title: 'Récupération.',              sub: 'Entrez votre email et recevez un lien de réinitialisation sécurisé.' },
    reset:  { title: 'Nouveau mot de passe.',      sub: 'Choisissez un mot de passe fort pour sécuriser votre accès.' },
  }[mode];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans overflow-x-hidden">

      {/* ── Panneau gauche ─────────────────────────────────────────────────── */}
      <div className="lg:w-1/2 xl:w-2/5 bg-fintech-dark relative overflow-hidden flex flex-col items-center justify-center p-10 md:p-20 order-2 lg:order-1 min-h-[300px] lg:min-h-screen">
        <div className="absolute inset-0 z-0">
          <img src="/assets/auth_side.png" alt="Fintech" className="w-full h-full object-cover opacity-20 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-fintech-dark via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center max-w-sm space-y-8 animate-fadeIn">
          <div className="bg-white/5 backdrop-blur-3xl p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] border border-white/10 shadow-3xl">
            <div className="bg-white w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-3xl flex items-center justify-center text-fintech-blue mb-8 mx-auto shadow-2xl">
              <Shield size={48} />
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tighter">{sidePanel.title}</h2>
            <p className="text-blue-100/60 text-base md:text-lg font-bold leading-relaxed">{sidePanel.sub}</p>
          </div>
          <div className="flex justify-center gap-6 text-fintech-accent font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] opacity-80">
            <div className="flex items-center gap-2"><ShieldCheck size={14} /> AES-256</div>
            <div className="flex items-center gap-2"><ShieldCheck size={14} /> TLS 1.3</div>
          </div>
        </div>
      </div>

      {/* ── Panneau droit ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center py-16 px-6 sm:px-12 md:px-20 lg:px-24 bg-white/40 backdrop-blur-sm order-1 lg:order-2">
        <div className="max-w-md mx-auto w-full space-y-12 animate-fadeIn">

          {/* Logo + titre */}
          <div className="flex flex-col items-center lg:items-start gap-10">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-50 cursor-pointer hover:scale-110 transition-all" onClick={() => navigate('/')}>
              <img src="/logos/logo-compare-ta-banque.png" alt="CTB" className="h-16 md:h-24 object-contain" />
            </div>
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter">
                {mode === 'login'  && 'Bienvenue au Conseil IA.'}
                {mode === 'signup' && 'Créer votre compte.'}
                {mode === 'forgot' && 'Mot de passe oublié ?'}
                {mode === 'reset'  && 'Définir un nouveau mot de passe.'}
              </h1>
              <p className="text-slate-500 font-bold md:text-lg">
                {mode === 'login'  && 'Connectez-vous pour votre suivi analytique.'}
                {mode === 'signup' && 'Accédez à vos recommandations personnalisées.'}
                {mode === 'forgot' && 'Un lien sécurisé vous sera envoyé par email.'}
                {mode === 'reset'  && 'Choisissez un mot de passe d\'au moins 6 caractères.'}
              </p>
            </div>
          </div>

          {/* Feedback message */}
          {message && (
            <div className={`p-5 rounded-[2rem] border text-sm font-bold flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {message.type === 'success'
                ? <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                : <AlertCircle  size={20} className="text-red-500   shrink-0 mt-0.5" />
              }
              {message.text}
            </div>
          )}

          {/* ── Formulaire LOGIN / SIGNUP ── */}
          {(mode === 'login' || mode === 'signup') && (
            <form className="space-y-8" onSubmit={handleAuth}>
              <div className="space-y-6">
                <AuthInput
                  id="email" label="Email" name="email" type="email"
                  placeholder="email@exemple.com"
                  value={form.email}
                  onChange={set('email')} icon={<Mail size={22} />}
                />
                <div>
                  <div className="flex justify-between items-center mb-2.5 ml-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mot de Passe</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => switchMode('forgot')}
                        className="font-black text-fintech-accent text-[9px] md:text-[10px] hover:underline uppercase tracking-widest">
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute left-5 top-5 text-slate-300 group-focus-within:text-fintech-blue transition-colors">
                      <KeyRound size={22} strokeWidth={2.5} />
                    </div>
                    <input
                      type="password" name="password" required minLength={6}
                      value={form.password}
                      onChange={set('password')}
                      className="w-full pl-16 pr-6 py-5 md:py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl md:rounded-[2rem] focus:border-fintech-blue focus:bg-white outline-none transition-all font-black text-slate-800 tracking-[0.4em] placeholder:tracking-widest"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <SubmitButton loading={loading} label={mode === 'login' ? 'Authentification' : 'Créer mon compte'} />
            </form>
          )}

          {/* ── Formulaire FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <form className="space-y-8" onSubmit={handleForgotPassword}>
              <AuthInput
                id="forgot_email" label="Votre adresse email" name="email" type="email"
                placeholder="email@exemple.com"
                value={form.email}
                onChange={set('email')} icon={<Mail size={22} />}
              />
              <SubmitButton loading={loading} label="Envoyer le lien" />
            </form>
          )}

          {/* ── Formulaire RESET PASSWORD ── */}
          {mode === 'reset' && (
            <form className="space-y-8" onSubmit={handleResetPassword}>
              <AuthInput
                id="new_password" label="Nouveau mot de passe" name="password" type="password"
                placeholder="••••••••" value={form.password} onChange={set('password')} icon={<KeyRound size={22} />}
              />
              <AuthInput
                id="confirm_password" label="Confirmer le mot de passe" name="confirmPassword" type="password"
                placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} icon={<KeyRound size={22} />}
              />
              <SubmitButton loading={loading} label="Enregistrer le mot de passe" />
            </form>
          )}

          {/* Footer */}
          <div className="flex flex-col items-center gap-8 pt-4">
            {(mode === 'login' || mode === 'signup') && (
              <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-slate-400 hover:text-slate-900 font-black text-[10px] md:text-xs uppercase tracking-[0.1em] transition-all">
                {mode === 'login' ? 'Nouveau sur CTB ? Créer votre accès Premium' : 'Déjà membre ? Authentification sécurisée'}
              </button>
            )}
            {(mode === 'forgot' || mode === 'reset') && (
              <button onClick={() => switchMode('login')}
                className="text-slate-400 hover:text-slate-900 font-black text-[10px] md:text-xs uppercase tracking-[0.1em] transition-all">
                Retour à la connexion
              </button>
            )}
            <div className="w-full h-[1px] bg-slate-100" />
            <button onClick={() => navigate('/')}
              className="group flex items-center gap-3 text-fintech-blue hover:text-black font-black text-xs uppercase tracking-[0.3em] transition-all">
              <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-all" /> Annuler & Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-6 md:py-8 px-6 rounded-[2.5rem] shadow-3xl shadow-blue-600/30 text-xl md:text-2xl font-black text-white bg-fintech-blue hover:bg-black transition-all disabled:opacity-70 flex items-center justify-center gap-4 group active:scale-95">
      {loading
        ? <><Loader2 size={28} className="animate-spin" /> Validation...</>
        : <>{label} <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform" /></>
      }
    </button>
  );
}

function AuthInput({ label, name, placeholder, onChange, icon, type = 'text', id, value }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 ml-2">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-5 text-slate-300 group-focus-within:text-fintech-blue transition-colors">{icon}</div>
        <input
          id={id} type={type} name={name} required value={value} onChange={onChange}
          className="w-full pl-16 pr-6 py-5 md:py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl md:rounded-[2rem] focus:border-fintech-blue focus:bg-white outline-none transition-all font-black text-slate-800 placeholder:font-bold placeholder:text-slate-300"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
