import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ConsentGate from './pages/ConsentGate';
import ProspectForm from './pages/ProspectForm';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SimulateurEpargne from './pages/SimulateurEpargne';
import ComparisonResults from './pages/ComparisonResults';
import AdminLayout from './pages/admin/AdminDashboard';
import { supabase } from './lib/supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = chargement en cours

  useEffect(() => {
    // Vérification initiale de la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Écoute des changements d'état d'auth (connexion / déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="h-screen flex items-center justify-center font-black text-fintech-blue">Chargement Sécurisé...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/consent" element={
          <ProtectedRoute>
            <ConsentGate />
          </ProtectedRoute>
        } />
        <Route path="/comparateur" element={
          <ProtectedRoute>
            <ProspectForm />
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <ComparisonResults />
          </ProtectedRoute>
        } />
        <Route path="/auth" element={<Auth />} />

        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/simulateur" element={
          <ProtectedRoute>
            <SimulateurEpargne />
          </ProtectedRoute>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
