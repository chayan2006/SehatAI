import React, { useState } from 'react';
import Login from '@/pages/Login';
import PortalLogin from '@/pages/PortalLogin';
import AdminLogin from '@/pages/AdminLogin';

// Dashboards
import AdminDashboard from '@/pages/AdminDashboard';
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import PatientDashboard from '@/pages/patient/PatientDashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState('gateway'); // 'gateway' | 'admin_login' | 'portal_login'
  const [loginRole, setLoginRole] = useState('doctor');
  const [role, setRole] = useState('doctor');

  if (!isAuthenticated) {
    if (authStep === 'gateway') {
      return (
        <Login
          onLogin={(selectedRole) => {
            if (selectedRole === 'admin') {
              setRole('admin');
              setAuthStep('admin_login');
            } else {
              setLoginRole(selectedRole);
              setAuthStep('portal_login');
            }
          }}
        />
      );
    }

    if (authStep === 'portal_login') {
      return (
        <PortalLogin
          initialRole={loginRole}
          onLogin={(selectedRole) => {
            if (selectedRole === 'gateway_back') {
              setAuthStep('gateway');
            } else if (selectedRole === 'admin') {
              setRole('admin');
              setAuthStep('admin_login');
            } else {
              setRole(selectedRole);
              setIsAuthenticated(true);
            }
          }}
        />
      );
    }

    if (authStep === 'admin_login') {
      return (
        <AdminLogin
          onConfirm={() => setIsAuthenticated(true)}
          onBack={() => setAuthStep('gateway')}
        />
      );
    }
  }

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthStep('gateway');
  };

  // Main Portal Entry Points
  if (role === 'admin') {
    return <AdminDashboard role={role} onLogout={handleLogout} />;
  }

  if (role === 'doctor') {
    return <DoctorDashboard onLogout={handleLogout} />;
  }

  if (role === 'patient') {
    return <PatientDashboard onLogout={handleLogout} />;
  }

  return null;
}

