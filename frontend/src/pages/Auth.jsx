import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Mail, LogIn, ChevronLeft, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const adminEmails = ['Sakidesireluc@gmail.com', 'arriko199@gmail.com', 'Jeanenockguikan@gmail.com'];
    const isAdmin = adminEmails.includes(formData.email) && formData.password === 'p@ssword';

    try {
      setTimeout(() => {
        if (isAdmin) {
          // Track previous session before setting new one
          const currentSession = JSON.parse(localStorage.getItem('current_admin_session') || '{}');
          if (currentSession.admin_id) {
            localStorage.setItem('previous_admin_session', JSON.stringify(currentSession));
          }

          const newSession = {
            admin_id: formData.email,
            login_time: new Date().toLocaleString('fr-FR'),
            logout_time: 'Session active'
          };

          localStorage.setItem('admin_token', formData.email);
          localStorage.setItem('current_admin_session', JSON.stringify(newSession));
          navigate('/admin');
        } else {
          localStorage.setItem('access_token', 'mock_jwt_token_premium');
          navigate('/dashboard');
        }
      }, 1800);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans overflow-x-hidden">

      {/* Left Visual Illustration - Responsive Height/Width */}
      <div className="lg:w-1/2 xl:w-2/5 bg-fintech-dark relative overflow-hidden flex flex-col items-center justify-center p-10 md:p-20 order-2 lg:order-1 min-h-[300px] lg:min-h-screen">
        <div className="absolute inset-0 z-0">
          <img src="/assets/auth_side.png" alt="Fintech UX" className="w-full h-full object-cover opacity-20 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-fintech-dark via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 text-center max-w-sm space-y-8 animate-fadeIn">
          <div className="bg-white/5 backdrop-blur-3xl p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] border border-white/10 shadow-3xl">
            <div className="bg-white w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-3xl flex items-center justify-center text-fintech-blue mb-8 mx-auto shadow-2xl animate-float">
              <Shield size={48} />
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tighter">Accès Sécurisé.</h2>
            <p className="text-blue-100/60 text-base md:text-lg font-bold leading-relaxed">
              Gérez vos analyses bancaires avec la protection SSL renforcée intégrée.
            </p>
          </div>

          <div className="flex justify-center gap-6 text-fintech-accent font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] opacity-80">
            <div className="flex items-center gap-2"><ShieldCheck size={14} /> AES-256</div>
            <div className="flex items-center gap-2"><ShieldCheck size={14} /> TLS 1.3</div>
          </div>
        </div>
      </div>

      {/* Right Interaction Side - Responsive width/padding */}
      <div className="flex-1 flex flex-col justify-center py-16 px-6 sm:px-12 md:px-20 lg:px-24 bg-white/40 backdrop-blur-sm order-1 lg:order-2">
        <div className="max-w-md mx-auto w-full space-y-12 animate-fadeIn">

          {/* Enhanced Branding - Center mobile, Left Desktop */}
          <div className="flex flex-col items-center lg:items-start gap-10">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-50 cursor-pointer hover:scale-110 transition-all" onClick={() => navigate('/')}>
              <img src="/logos/logo-compare-ta-banque.png" alt="CTB" className="h-16 md:h-24 object-contain" />
            </div>
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter">Bienvenue au Conseil IA.</h1>
              <p className="text-slate-500 font-bold md:text-lg">Connectez-vous pour votre suivi analytique.</p>
            </div>
          </div>

          <form className="space-y-8" onSubmit={handleAuth}>
            <div className="space-y-6">
              <AuthInput
                id="email"
                label="Adresse Professionnelle / Email"
                name="email"
                type="email"
                placeholder="Ex: contact@votre-sa.ci"
                onChange={handleChange}
                icon={<Mail size={22} />}
              />
              <div>
                <div className="flex justify-between items-center mb-2.5 ml-2">
                  <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mot de Passe</label>
                  <a href="#" className="font-black text-fintech-accent text-[9px] md:text-[10px] hover:underline uppercase tracking-widest leading-none">Oublié ?</a>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-5 text-slate-300 group-focus-within:text-fintech-blue transition-colors h-5 w-5">
                    <KeyRound size={22} strokeWidth={2.5} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    onChange={handleChange}
                    className="w-full pl-16 pr-6 py-5 md:py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl md:rounded-[2rem] focus:border-fintech-blue focus:bg-white outline-none transition-all font-black text-slate-800 tracking-[0.4em] placeholder:tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center ml-2">
              <input
                id="remember"
                name="rememberMe"
                type="checkbox"
                onChange={handleChange}
                className="h-6 w-6 text-fintech-blue focus:ring-fintech-blue border-slate-200 rounded-xl cursor-pointer"
              />
              <label htmlFor="remember" className="ml-4 text-xs md:text-sm font-black text-slate-600 cursor-pointer uppercase tracking-widest">
                Maintenir ma session
              </label>
            </div>

            {/* Submit Control - Responsive Width */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 md:py-8 px-6 rounded-[2.5rem] shadow-3xl shadow-blue-600/30 text-xl md:text-2xl font-black text-white bg-fintech-blue hover:bg-black transition-all disabled:opacity-70 flex items-center justify-center gap-4 group active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Validation...
                </div>
              ) : (
                <>{isLogin ? 'Authentification' : 'Création Profil'} <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Toggle Action */}
          <div className="flex flex-col items-center gap-8 pt-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 hover:text-slate-900 font-black text-[10px] md:text-xs uppercase tracking-[0.1em] transition-all"
            >
              {isLogin ? "Nouveau sur CTB ? Créer votre accès Premium" : "Déjà membre ? Authentification sécurisée"}
            </button>

            <div className="w-full h-[1px] bg-slate-100"></div>

            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 text-fintech-blue hover:text-black font-black text-xs uppercase tracking-[0.3em] transition-all"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-all" /> Annuler & Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Logic for Auth Inputs
function AuthInput({ label, name, placeholder, onChange, icon, type = "text", id }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 ml-2">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-5 text-slate-300 group-focus-within:text-fintech-blue transition-colors h-5 w-5">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          name={name}
          required
          onChange={onChange}
          className="w-full pl-16 pr-6 py-5 md:py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl md:rounded-[2rem] focus:border-fintech-blue focus:bg-white outline-none transition-all font-black text-slate-800 placeholder:font-bold placeholder:text-slate-300"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
