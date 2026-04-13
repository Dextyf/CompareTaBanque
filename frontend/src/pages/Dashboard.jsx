import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, FileText, Settings, User, ShieldCheck, Menu, X, ChevronRight, TrendingUp, Sparkles, PieChart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Chatbot from '../components/Chatbot';
import SelectiveComparison from './SelectiveComparison';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      // Pour la démo, on récupère le dernier prospect enregistré
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) setUserData(data);
    }
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    navigate('/auth');
  };

  const navItems = [
    { name: 'Vue d\'ensemble', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { name: 'Mes Recommandations', path: '/dashboard/recommandations', icon: <FileText size={22} /> },
    { name: 'Comparateur Manuel', path: '/dashboard/selective', icon: <PieChart size={22} /> },
    { name: 'Simulateur d\'épargne', path: '/simulateur', icon: <TrendingUp size={22} /> },
    { name: 'Paramètres du compte', path: '/dashboard/settings', icon: <Settings size={22} /> },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar - Desktop Only */}
      <aside className="w-80 bg-fintech-dark text-white flex flex-col shadow-3xl z-40 hidden lg:flex border-r border-white/5">
        <SidebarContent 
          navItems={navItems} 
          currentPath={location.pathname} 
          handleLogout={handleLogout} 
          navigate={navigate} 
          userData={userData}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
           <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={closeMobileMenu}></div>
           <aside className="relative w-72 sm:w-80 bg-fintech-dark h-full flex flex-col shadow-2xl animate-slide-right">
              <div className="absolute top-4 right-4 text-white">
                 <button onClick={closeMobileMenu} className="p-2 bg-white/10 rounded-xl"><X size={24}/></button>
              </div>
              <SidebarContent 
                 navItems={navItems} 
                 currentPath={location.pathname} 
                 handleLogout={handleLogout} 
                 navigate={navigate} 
                 isMobile={true}
                 closeMenu={closeMobileMenu}
                 userData={userData}
              />
           </aside>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scrollbar-hide">
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex lg:hidden justify-between items-center sticky top-0 z-30 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3" onClick={() => navigate('/')}>
               <img src="/logos/logo-compare-ta-banque.png" alt="CTB" className="h-10 object-contain bg-white rounded-lg p-1.5 shadow-sm border border-slate-100" />
               <div className="text-xl font-black text-slate-800 tracking-tighter uppercase">Premium</div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 border border-slate-100 shadow-sm">
               <Menu size={24}/>
            </button>
        </header>

        <div className="p-5 sm:p-8 md:p-12 pb-32">
          <Routes>
            <Route path="/" element={<DashboardOverview navigate={navigate} userData={userData} />} />
            <Route path="/recommandations" element={<RecommandationsHistory />} />
            <Route path="/selective" element={<SelectiveComparison />} />
            <Route path="/settings" element={<div className="flex items-center justify-center h-48 text-slate-300 font-black uppercase text-xs tracking-widest italic">Paramètres à venir...</div>} />
          </Routes>
        </div>
        
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50">
          <Chatbot />
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ navItems, currentPath, handleLogout, navigate, isMobile = false, closeMenu, userData }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-10 border-b border-white/5 bg-slate-900/50 cursor-pointer" onClick={() => { navigate('/'); if(isMobile) closeMenu(); }}>
         <img src="/logos/logo-compare-ta-banque.png" alt="CTB" className="h-20 w-full object-contain bg-white rounded-3xl p-3 mb-6 shadow-2xl" />
         <div className="flex items-center justify-center gap-2 text-fintech-accent text-[10px] font-black uppercase tracking-[0.3em] opacity-80 font-sans"><ShieldCheck size={14} /> Espace Premium</div>
      </div>
      
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto mt-4 px-8">
        {navItems.map((item) => (
          <Link 
            key={item.name}
            to={item.path}
            onClick={isMobile ? closeMenu : undefined}
            className={`flex items-center gap-4 px-6 py-4 rounded-3xl transition-all group ${
              currentPath === item.path 
                ? 'bg-fintech-accent text-white font-black shadow-3xl shadow-fintech-accent/30' 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-sm font-bold tracking-tight">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5 bg-slate-900/80">
        <div className="flex items-center gap-4 mb-6 px-3">
          <div className="bg-slate-700 p-2.5 rounded-full border border-white/10 shadow-lg text-fintech-accent"><User size={24} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate text-white uppercase italic">{userData?.full_name || 'Invité'}</p>
            <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-[0.2em]">{userData ? 'Membre Premium' : 'Démo Flow'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 text-slate-400 hover:bg-red-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </div>
  );
}

function DashboardOverview({ navigate, userData }) {
  return (
    <div className="space-y-10 md:space-y-16 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div className="space-y-3 px-2">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none whitespace-pre-wrap">Bienvenue, {userData?.full_name?.split(' ')[0] || 'Utilisateur'} ! 👋</h1>
          <p className="text-slate-500 text-base md:text-xl font-bold">L'IA Claude a actualisé vos analyses bancaires.</p>
        </div>
        <button 
          onClick={() => navigate('/comparateur')}
          className="w-full lg:w-auto bg-fintech-blue text-white px-8 md:px-12 py-5 md:py-6 rounded-3xl font-black text-lg md:text-xl shadow-[0_20px_50px_rgba(0,85,150,0.3)] hover:bg-slate-900 transition-all flex items-center justify-center gap-4 active:scale-95 group"
        >
          Nouvelle Analyse IA <ChevronRight className="group-hover:translate-x-3 transition-all" size={28} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <KPICard label="Maximum Match Score" value={userData ? "94%" : "0%"} color="border-fintech-blue" />
        <KPICard label="Econ. Potentielle / AN" value={userData ? "35k" : "0"} subValue="FCFA" color="border-fintech-accent" />
        <KPICard label="Statut du Profil" value={userData?.account_type === 'particulier' ? 'PART' : 'PME'} color="border-purple-600" />
      </div>
      
      <div className="mt-6">
        <RecommandationsHistory />
      </div>
    </div>
  );
}

function KPICard({ label, value, subValue, color }) {
  return (
    <div className={`bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-slate-50 border-l-[10px] md:border-l-[12px] ${color} group hover:scale-[1.03] transition-all cursor-pointer`}>
       <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">{label}</h3>
       <p className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">{value} {subValue && <span className="text-lg text-slate-300 font-extrabold uppercase">{subValue}</span>}</p>
    </div>
  );
}

function RecommandationsHistory() {
  const recommendations = [
    { id: 'REC-001', date: '06 Avr 2026', bank: 'Coris Bank', score: 92, status: 'Lead Transmis' },
    { id: 'REC-002', date: '05 Avr 2026', bank: 'SIB', score: 85, status: 'Expiré' },
    { id: 'REC-003', date: '01 Avr 2026', bank: 'BNI', score: 70, status: 'Archivé' },
  ];

  return (
    <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden mt-10">
      <div className="p-8 md:p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Historique des Analyses</h2>
        <div className="px-6 py-2.5 bg-white border-2 border-slate-100 rounded-full text-[10px] uppercase font-black text-slate-500 tracking-widest shadow-sm">Derniers 30 jours</div>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-8">ID</th>
              <th className="p-8">Date</th>
              <th className="p-8 text-center">Banque</th>
              <th className="p-8 text-center">Score IA</th>
              <th className="p-8 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recommendations.map(rec => (
               <tr key={rec.id} className="hover:bg-slate-50 transition-colors group">
                 <td className="p-8 font-black text-slate-400 group-hover:text-fintech-blue text-xs">{rec.id}</td>
                 <td className="p-8 text-slate-500 font-bold text-xs">{rec.date}</td>
                 <td className="p-8 font-black text-slate-800 text-center text-sm">{rec.bank}</td>
                 <td className="p-8 text-center">
                   <span className="bg-green-50 text-fintech-accent py-2 px-5 rounded-full text-xs font-black shadow-sm border border-green-100">
                     {rec.score}%
                   </span>
                 </td>
                 <td className="p-8 text-right">
                   <span className={`py-2 px-6 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/5 ${
                     rec.status.includes('Transmis') ? 'bg-fintech-accent text-white shadow-fintech-accent/20' : 
                     rec.status === 'Expiré' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                   }`}>
                     {rec.status}
                   </span>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
