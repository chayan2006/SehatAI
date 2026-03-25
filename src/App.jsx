import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import Login from '@/pages/Login';
import PortalLogin from '@/pages/PortalLogin';
import AdminLogin from '@/pages/AdminLogin';

import AdminDashboard from '@/pages/AdminDashboard';
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import PatientDashboard from '@/pages/patient/PatientDashboard';

/** Wrapper: redirects to / if not authed or wrong role */
function ProtectedRoute({ role: requiredRole, children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <span className="animate-spin material-symbols-outlined text-primary text-4xl">progress_activity</span>
      </div>
    );
  }
  if (!user || user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard after login if already on a login/root page
  useEffect(() => {
    if (loading || !user) return;
    const onLoginPage = location.pathname === '/' || location.pathname.startsWith('/portal') || location.pathname === '/admin/login';
    if (onLoginPage) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  const handleLoginSuccess = (selectedRole) => {
    if (selectedRole === 'gateway_back') { navigate('/'); return; }
    if (selectedRole === 'admin') { navigate('/admin/login'); return; }
    navigate(`/${selectedRole}/dashboard`);
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login onLogin={(r) => { if (r === 'admin') navigate('/admin/login'); else navigate(`/portal/${r}`); }} />} />
      <Route path="/portal/:loginRole" element={<PortalLogin onLogin={handleLoginSuccess} />} />
      <Route path="/admin/login" element={<AdminLogin onConfirm={() => navigate('/admin/dashboard')} onBack={() => navigate('/')} />} />

      {/* Protected dashboards */}
      <Route path="/patient/*" element={
        <ProtectedRoute role="patient">
          <PatientDashboard onLogout={() => { logout(); navigate('/'); }} />
        </ProtectedRoute>
      } />

      <Route path="/doctor/*" element={
        <ProtectedRoute role="doctor">
          <DoctorDashboard onLogout={() => { logout(); navigate('/'); }} />
        </ProtectedRoute>
      } />

      <Route path="/admin/*" element={
        <ProtectedRoute role="admin">
          <AdminDashboard onLogout={() => { logout(); navigate('/'); }} />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
