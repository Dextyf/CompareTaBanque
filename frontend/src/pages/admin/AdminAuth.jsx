import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Key } from 'lucide-react';

export default function AdminAuth() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const adminEmails = ['Sakidesireluc@gmail.com', 'arriko199@gmail.com', 'Jeanenockguikan@gmail.com'];
    
    // Fake Auth
    if (adminEmails.includes(formData.email) && formData.password === 'admin123') {
      localStorage.setItem('admin_token', formData.email);
      navigate('/admin/dashboard');
    } else {
      setError('Accès refusé. Vérifiez vos identifiants administrateur.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-3xl font-extrabold text-white">Zone Restreinte</h2>
        <p className="mt-2 text-slate-400">Authentification requise (Admins uniquement)</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-10 px-8 rounded-2xl shadow-2xl border border-slate-700">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm">{error}</div>}
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email Administrateur</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Mot de Passe Moteur</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-xl text-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-600/30"
            >
              Déverrouiller la console
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
