import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Lock, Activity, TrendingUp, AlertTriangle, LogOut } from 'lucide-react';
import LeadsManager from './LeadsManager';
import Transactions from './Transactions';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentAdmin = localStorage.getItem('admin_token');

  const handleLogout = () => {
    // Record logout time in the session tracking
    const currentSession = JSON.parse(localStorage.getItem('current_admin_session') || '{}');
    if (currentSession.admin_id) {
      currentSession.logout_time = new Date().toLocaleString('fr-FR');
      localStorage.setItem('current_admin_session', JSON.stringify(currentSession));
      localStorage.setItem('previous_admin_session', JSON.stringify(currentSession));
    }
    localStorage.removeItem('admin_token');
    navigate('/auth'); // Retour à la page de connexion unifiée
  };

  useEffect(() => {
    if (!currentAdmin) {
      navigate('/auth');
    }
  }, [currentAdmin, navigate]);

  if (!currentAdmin) return null;

  const navItems = [
    { path: '/admin/dashboard', name: 'KPIs & Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/leads', name: 'Gestion des Leads', icon: <Users size={20} /> },
    { path: '/admin/transactions', name: 'Suivi Financier', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300 font-sans overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800 bg-slate-900 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => navigate('/')}>
           <img src="/logos/logo-compare-ta-banque.png" alt="CompareTaBanque" className="h-10 object-contain bg-white rounded-lg p-1.5 mb-3" />
           <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest"><Lock size={14} /> Panel Admin</div>
        </div>
        
        <div className="px-6 mt-6 text-xs font-bold uppercase text-slate-500 tracking-widest mb-2">Administrateur</div>
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
             <div className="bg-red-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold">
               {currentAdmin.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white truncate">{currentAdmin.split('@')[0]}</p>
               <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> En ligne
               </div>
             </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                location.pathname === item.path 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
           <button 
             onClick={handleLogout} 
             className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-bold shadow-sm"
           >
             <LogOut size={18} /> Déconnexion
           </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto bg-slate-900/50">
        <div className="p-8 pb-12 overflow-x-hidden">
           <Routes>
             <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
             <Route path="/dashboard" element={<OverviewKPIs />} />
             <Route path="/leads" element={<LeadsManager />} />
             <Route path="/transactions" element={<Transactions />} />
           </Routes>
        </div>
      </main>
    </div>
  );
}

function OverviewKPIs() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Vue d'Ensemble des Performances</h1>
          <p className="text-slate-400">Données agrégées pour les administrateurs de la plateforme.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg text-sm text-fintech-accent border border-slate-700">
             <Activity size={16} className="animate-pulse" /> Temps Réel
          </div>
          
          {/* Last Login Tracking Card */}
          {localStorage.getItem('previous_admin_session') && (
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-[10px] space-y-1 animate-fadeIn">
               <div className="flex justify-between gap-4">
                  <span className="text-slate-500 uppercase font-black tracking-widest">Dernière session :</span>
                  <span className="text-fintech-accent font-bold">{(JSON.parse(localStorage.getItem('previous_admin_session'))).admin_id}</span>
               </div>
               <div className="flex justify-between gap-4">
                  <span className="text-slate-500 uppercase font-black tracking-widest">Connexion :</span>
                  <span className="text-slate-300">{(JSON.parse(localStorage.getItem('previous_admin_session'))).login_time}</span>
               </div>
               <div className="flex justify-between gap-4">
                  <span className="text-slate-500 uppercase font-black tracking-widest">Déconnexion :</span>
                  <span className="text-slate-300">{(JSON.parse(localStorage.getItem('previous_admin_session'))).logout_time}</span>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Prospects Inscrits (Mois)" value="204" sub="Objectif M3: 200" trend="+12" icon={<Users className="text-blue-500" />} />
        <KpiCard title="Taux Acceptation" value="68%" sub="Objectif M3: 70%" trend="-2" icon={<TrendingUp className="text-green-500" />} />
        <KpiCard title="CA Généré (HT)" value="450 000 F" sub="Sur la semaine" trend="+5" icon={<CreditCard className="text-fintech-accent" />} />
        <KpiCard title="Impayés J+7" value="3" sub="Factures en attente" isWarning icon={<AlertTriangle className="text-orange-500" />} />
      </div>

      {localStorage.getItem('admin_token') !== 'Sakidesireluc@gmail.com' && (
        <div className="bg-red-500/10 border-2 border-red-500/20 p-6 rounded-[2rem] flex items-center gap-6 animate-pulse">
          <Lock className="text-red-500 shrink-0" size={32} />
          <div>
            <h4 className="text-red-500 font-black uppercase text-xs tracking-widest mb-1">Mode Lecture Seule Activé</h4>
            <p className="text-slate-400 text-sm font-bold">Votre profil administrateur ne vous autorise pas à modifier le code source, les processus ou les informations du site. Contactez l'administrateur principal pour toute demande.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mock Chart Area */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-80 flex flex-col">
          <h3 className="font-bold text-white mb-4">Évolution des Leads</h3>
          <div className="flex-1 flex items-end gap-2 text-xs text-slate-400 justify-between mt-auto">
            <div className="w-1/6 bg-slate-700 rounded-t h-[40%] hover:bg-slate-600 transition-colors"></div>
            <div className="w-1/6 bg-slate-700 rounded-t h-[55%] hover:bg-slate-600 transition-colors"></div>
            <div className="w-1/6 bg-slate-700 rounded-t h-[30%] hover:bg-slate-600 transition-colors"></div>
            <div className="w-1/6 bg-fintech-blue rounded-t h-[80%] hover:bg-blue-400 transition-colors relative group"><span className="absolute -top-8 bg-slate-900 border border-slate-700 p-1 rounded hidden group-hover:block">Semaine Actuelle</span></div>
            <div className="w-1/6 bg-fintech-accent rounded-t h-[95%] hover:bg-green-400 transition-colors"></div>
          </div>
        </div>

        {/* Lead Activity Feed */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-80 overflow-y-auto">
          <h3 className="font-bold text-white mb-4">Activité des Webhooks (N8N)</h3>
          <div className="space-y-4">
            <ActivityItem time="Il y a 10 min" text="Lead ID: REC-290 transmis à Coris Bank" type="info" />
            <ActivityItem time="Il y a 45 min" text="Facture INV-2026-04-012 générée (15 000 F)" type="success" />
            <ActivityItem time="Il y a 2 h" text="Relance J+7 (Workflow 8) exécutée pour BDU-CI" type="warning" />
            <ActivityItem time="Hier" text="Lead expiré (48h) sans réponse de SIB -> Recyclage" type="danger" />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, sub, trend, icon, isWarning }) {
  return (
    <div className={`p-6 rounded-xl border ${isWarning ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800 border-slate-700'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-900 rounded-lg">{icon}</div>
        {trend && (
           <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
             {trend}%
           </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function ActivityItem({ time, text, type }) {
  const colors = {
    info: 'text-blue-400 before:bg-blue-500',
    success: 'text-green-400 before:bg-green-500',
    warning: 'text-orange-400 before:bg-orange-500',
    danger: 'text-red-400 before:bg-red-500'
  }
  return (
    <div className={`relative pl-4 text-sm ${colors[type]} before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full`}>
      <span className="text-xs text-slate-500 block mb-0.5">{time}</span>
      <span className="text-slate-300">{text}</span>
    </div>
  )
}
