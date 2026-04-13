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

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const adminToken = localStorage.getItem('admin_token');
    if (token || adminToken) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-fintech-blue">Chargement Sécurisé...</div>;

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/consent" element={<ConsentGate />} />
        <Route path="/comparateur" element={<ProspectForm />} />
        <Route path="/results" element={<ComparisonResults />} />
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
