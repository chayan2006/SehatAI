import React, { useState, useEffect, useRef } from 'react';
import { authService } from '@/database';
import { useToast } from '@/components/ui/Toast';
import { AuthenticatedApp } from '@/components/AuthenticatedApp';
import { UnauthenticatedApp } from '@/components/UnauthenticatedApp';
import { useApp } from '@/context/AppContext';
import { BrandOverlay } from '@/components/BrandLoader';

export default function App() {
  const { user, role, loading: appLoading, setRole, setUser } = useApp();
  const [authStep, setAuthStep] = useState('gateway'); // 'gateway' | 'admin_login' | 'portal_login'
  const [loginRole, setLoginRole] = useState(null);

  const [adminTab, setAdminTab] = useState('dashboard');
  const [patientTab, setPatientTab] = useState('dashboard');
  const [doctorTab, setDoctorTab] = useState('dashboard');
  const { toasts, addToast, removeToast } = useToast();

  const isAuthenticated = !!user;

  // Auto-logout Logic
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes (Elite Standard)
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      console.log('Auto-logout due to inactivity');
      await authService.signOut();
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      const handleActivity = () => resetTimer();
      
      events.forEach(event => window.addEventListener(event, handleActivity));
      resetTimer(); // Start timer

      window.addEventListener('storage', (e) => {
        if (e.key === 'sehat_ai_logout') {
          console.log('Detected logout from another tab');
          setUser(null);
          setRole(null);
        }
      });

      return () => {
        events.forEach(event => window.removeEventListener(event, handleActivity));
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [isAuthenticated]);

  if (appLoading) {
    return <BrandOverlay message="Initializing SehatAI Secure Gateway" />;
  }

  if (!isAuthenticated) {
    return (
      <UnauthenticatedApp 
        authStep={authStep}
        setAuthStep={setAuthStep}
        setRole={setRole}
        loginRole={loginRole}
        setLoginRole={setLoginRole}
      />
    );
  }

  if (isAuthenticated && role) {
    return (
      <AuthenticatedApp 
        user={user}
        role={role}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        patientTab={patientTab}
        setPatientTab={setPatientTab}
        doctorTab={doctorTab}
        setDoctorTab={setDoctorTab}
        toasts={toasts}
        addToast={addToast}
        removeToast={removeToast}
        onRoleChange={setRole}
        onLogout={async () => {
          localStorage.setItem('sehat_ai_logout', Date.now());
          await authService.signOut();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
