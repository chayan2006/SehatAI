import React from 'react';
import Login from '@/pages/Login';
import PortalLogin from '@/pages/PortalLogin';
import AdminLogin from '@/pages/AdminLogin';

export function UnauthenticatedApp({ 
  authStep, 
  setAuthStep, 
  setRole, 
  loginRole, 
  setLoginRole 
}) {
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
            setAuthStep('admin_login');
          } else {
            // The global onAuthChange listener in App.jsx handles the transition
          }
        }}
      />
    );
  }

  if (authStep === 'admin_login') {
    return (
      <AdminLogin
        onConfirm={() => { 
          // The global onAuthChange listener in App.jsx handles the transition
        }}
        onBack={() => setAuthStep('gateway')}
      />
    );
  }

  return null;
}
