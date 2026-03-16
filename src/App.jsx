import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PatientSidebar } from '@/components/PatientSidebar';
import { DoctorSidebar } from '@/components/DoctorSidebar';
import { TopNav } from '@/components/TopNav';
import Login from '@/pages/Login';
import PortalLogin from '@/pages/PortalLogin';
import AdminLogin from '@/pages/AdminLogin';
import { authService } from '@/database';
import { Toast, useToast } from '@/components/ui/Toast';

// Admin Pages
import AdminDashboard from '@/pages/AdminDashboard';
import Patients from '@/pages/Patients';
import EmergencyAlerts from '@/pages/EmergencyAlerts';
import AgentLogs from '@/pages/AgentLogs';
import Appointments from '@/pages/Appointments';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import AdminAmbulance from '@/pages/AdminAmbulance';

// Patient Pages
import PatientDashboard from '@/pages/patient/PatientDashboard';
import PatientMedications from '@/pages/patient/PatientMedications';
import PatientAppointments from '@/pages/patient/PatientAppointments';
import PatientHistory from '@/pages/patient/PatientHistory';
import PatientAmbulance from '@/pages/patient/PatientAmbulance';

// Doctor Pages
import DoctorTriage from '@/pages/doctor/DoctorTriage';
import DoctorPatients from '@/pages/doctor/DoctorPatients';
import DoctorStaff from '@/pages/doctor/DoctorStaff';
import DoctorConsultations from '@/pages/doctor/DoctorConsultations';
import DoctorAmbulance from '@/pages/doctor/DoctorAmbulance';
import DoctorVitals from '@/pages/doctor/DoctorVitals';
import DoctorPharmacy from '@/pages/doctor/DoctorPharmacy';
import DoctorWard from '@/pages/doctor/DoctorWard';
import DoctorBilling from '@/pages/doctor/DoctorBilling';
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import DoctorLab from '@/pages/doctor/DoctorLab';
import HospitalSettings from '@/pages/doctor/HospitalSettings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState('gateway'); // 'gateway' | 'admin_login' | 'portal_login'
  const [loginRole, setLoginRole] = useState(null);
  const [role, setRole] = useState(null);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [patientTab, setPatientTab] = useState('dashboard');
  const [doctorTab, setDoctorTab] = useState('dashboard');
  const { toasts, addToast, removeToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-logout Logic
  const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
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

      return () => {
        events.forEach(event => window.removeEventListener(event, handleActivity));
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      setLoading(true);
      setRole(null); // Reset role to prevent stale dashboard flicks
      try {
        console.log('Checking initial session...');
        const validateRole = (r) => {
          if (!r) return null;
          const lowerR = r.toLowerCase();
          return ['admin', 'doctor', 'patient'].includes(lowerR) ? lowerR : null;
        };

        const session = await authService.getSession();
        if (session) {
          console.log('Session found for user:', session.user.email);
          setUser(session.user);
          
          let userRole = validateRole(session.user.user_metadata?.role);
          
          if (!userRole) {
            console.log('Metadata role missing or invalid, checking profiles table...');
            const profile = await authService.getProfile(session.user.id);
            userRole = validateRole(profile?.role);
          }
          
          if (userRole) {
            console.log('Setting verified role:', userRole);
            setRole(userRole);
            setIsAuthenticated(true);
          } else {
            console.warn('No valid role identified for authenticated user');
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Session check failed:', err.message);
        setIsAuthenticated(false);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthChange(async (event, session) => {
      console.log('Auth change event:', event);
      if (session) {
        setUser(session.user);
        
        const validateRole = (r) => {
          if (!r) return null;
          const lowerR = r.toLowerCase();
          return ['admin', 'doctor', 'patient'].includes(lowerR) ? lowerR : null;
        };

        let userRole = validateRole(session.user.user_metadata?.role);
        
        if (!userRole) {
          console.log('Metadata role missing or invalid, checking profiles table...');
          const profile = await authService.getProfile(session.user.id);
          userRole = validateRole(profile?.role);
        }
        
        if (userRole) {
          console.log('Auth change detected validated role:', userRole);
          setRole(userRole);
          setIsAuthenticated(true);
        } else {
          console.warn('No valid role found for user:', session.user.id);
          // If no valid role exists, we don't authenticate to avoid broken states
          // This prevents the "redirect to hospital page" if the role was some junk value
        }
      } else {
        console.log('No session, clearing state');
        setUser(null);
        setIsAuthenticated(false);
        setRole(null);
        setAuthStep('gateway');
        setAdminTab('dashboard');
        setPatientTab('dashboard');
        setDoctorTab('dashboard');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Initializing SehatAI Secure Gateway...</p>
        </div>
      </div>
    );
  }


  const renderAdminContent = () => {
    switch (adminTab) {
      case 'dashboard': return <AdminDashboard user={user} />;
      case 'patients': return <Patients />;
      case 'alerts': return <EmergencyAlerts />;
      case 'ambulance': return <AdminAmbulance />;
      case 'logs': return <AgentLogs />;
      case 'appointments': return <Appointments />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
      default: return <AdminDashboard user={user} />;
    }
  };

  const renderPatientContent = () => {
    switch (patientTab) {
      case 'dashboard': return <PatientDashboard user={user} onNavigate={setPatientTab} />;
      case 'medications': return <PatientMedications onNavigate={setPatientTab} />;
      case 'appointments': return <PatientAppointments user={user} addToast={addToast} onNavigate={setPatientTab} />;
      case 'history': return <PatientHistory onNavigate={setPatientTab} />;
      case 'ambulance': return <PatientAmbulance onNavigate={setPatientTab} />;
      case 'settings': return <Settings onNavigate={setPatientTab} />;
      default: return <PatientDashboard user={user} onNavigate={setPatientTab} />;
    }
  };

  const renderDoctorContent = () => {
    switch (doctorTab) {
      case 'dashboard': return <DoctorDashboard user={user} />;
      case 'triage': return <DoctorTriage />;
      case 'emergency': return <DoctorTriage />;
      case 'pharmacy': return <DoctorPharmacy />;
      case 'patients': return <DoctorPatients />;
      case 'staff': return <DoctorStaff />;
      case 'vitals': return <DoctorVitals />;
      case 'consultations': return <DoctorConsultations />;
      case 'ambulance': return <DoctorAmbulance />;
      case 'ward': return <DoctorWard />;
      case 'lab': return <DoctorLab />;
      case 'billing': return <DoctorBilling />;
      case 'analytics': return <Analytics />;
      case 'ai-insights': return <AgentLogs />; // Reusing agent logs for AI insights
      case 'hospital-settings': return <HospitalSettings />;
      case 'settings': return <Settings />; // Reusing settings
      default: return <DoctorDashboard user={user} />;
    }
  };

  const renderSidebar = () => {
    const userData = {
      name: user?.user_metadata?.full_name || user?.email || 'User',
      role: role.charAt(0).toUpperCase() + role.slice(1)
    };

    switch (role) {
      case 'admin': return <Sidebar activeTab={adminTab} onTabChange={setAdminTab} user={userData} />;
      case 'doctor': return <DoctorSidebar activeTab={doctorTab} onTabChange={setDoctorTab} user={userData} />;
      case 'patient': return <PatientSidebar activeTab={patientTab} onTabChange={setPatientTab} user={userData} />;
    }
  };

  const renderContent = () => {
    switch (role) {
      case 'admin': return renderAdminContent();
      case 'doctor': return renderDoctorContent();
      case 'patient': return renderPatientContent();
    }
  };

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
              setAuthStep('admin_login');
            } else {
              // The global onAuthChange listener will handle the transition
            }
          }}
        />
      );
    }

    if (authStep === 'admin_login') {
      return (
        <AdminLogin
          onConfirm={() => { 
            // The global onAuthChange listener will handle the transition
          }}
          onBack={() => setAuthStep('gateway')}
        />
      );
    }
  }

  if (isAuthenticated && (role === 'admin' || role === 'doctor' || role === 'patient')) {
    return (
      <div className="flex min-h-screen bg-background-light">
        {renderSidebar()}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav 
            role={role}
            onRoleChange={(r) => setRole(r)}
            user={{ 
              name: user?.user_metadata?.full_name || user?.email || 'User',
              role: role.charAt(0).toUpperCase() + role.slice(1)
            }} 
            onLogout={async () => {
              await authService.signOut();
            }}
            onNavigate={(tab) => {
              if (role === 'doctor') setDoctorTab(tab);
              if (role === 'admin') setAdminTab(tab);
              if (role === 'patient') setPatientTab(tab);
            }}
          />
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {renderContent()}
          </main>
        </div>
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // Fallback: if authenticated but role isn't set yet, show spinner
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return null;
}
