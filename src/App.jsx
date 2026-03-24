import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from '@/pages/Login';
import PortalLogin from '@/pages/PortalLogin';
import AdminLogin from '@/pages/AdminLogin';

// Dashboards
import AdminDashboard from '@/pages/AdminDashboard';
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import PatientDashboard from '@/pages/patient/PatientDashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    navigate('/');
  };

  // Protect routes and handle role-based redirection
  useEffect(() => {
    if (isAuthenticated && role) {
      if (location.pathname === '/' || location.pathname === '/login' || location.pathname.startsWith('/portal')) {
        navigate(`/${role}/dashboard`);
      }
    }
  }, [isAuthenticated, role, location.pathname, navigate]);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Login onLogin={(selectedRole) => {
            if (selectedRole === 'admin') {
              navigate('/admin/login');
            } else {
              navigate(`/portal/${selectedRole}`);
            }
          }} />
        } 
      />
      
      <Route 
        path="/portal/:loginRole" 
        element={
          <PortalLogin onLogin={(selectedRole) => {
            if (selectedRole === 'gateway_back') {
              navigate('/');
            } else if (selectedRole === 'admin') {
              navigate('/admin/login');
            } else {
              setRole(selectedRole);
              setIsAuthenticated(true);
              navigate(`/${selectedRole}/dashboard`);
            }
          }} />
        } 
      />

      <Route 
        path="/admin/login" 
        element={
          <AdminLogin 
            onConfirm={() => {
              setRole('admin');
              setIsAuthenticated(true);
              navigate('/admin/dashboard');
            }} 
            onBack={() => navigate('/')} 
          />
        } 
      />

      {/* Role-Based Protected Dashboards */}
      <Route 
        path="/admin/*" 
        element={
          isAuthenticated && role === 'admin' 
            ? <AdminDashboard role={role} onLogout={handleLogout} /> 
            : <Navigate to="/" replace />
        } 
      />
      
      <Route 
        path="/doctor/*" 
        element={
          isAuthenticated && role === 'doctor' 
            ? <DoctorDashboard onLogout={handleLogout} /> 
            : <Navigate to="/" replace />
        } 
      />
      
      <Route 
        path="/patient/*" 
        element={
          isAuthenticated && role === 'patient' 
            ? <PatientDashboard onLogout={handleLogout} /> 
            : <Navigate to="/" replace />
        } 
      />

      {/* Catch-all for undefined routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
