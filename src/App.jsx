import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PatientSidebar } from '@/components/PatientSidebar';
import { DoctorSidebar } from '@/components/DoctorSidebar';
import { TopNav } from '@/components/TopNav';
import Login from '@/pages/Login';
import PortalLogin from '@/pages/PortalLogin';
import AdminLogin from '@/pages/AdminLogin';
import { authService } from '@/database';

// Admin Pages
import Dashboard from '@/pages/Dashboard';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState('gateway'); // 'gateway' | 'admin_login' | 'portal_login'
  const [loginRole, setLoginRole] = useState('doctor');
  const [role, setRole] = useState('doctor');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [patientTab, setPatientTab] = useState('dashboard');
  const [doctorTab, setDoctorTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        if (session) {
          setUser(session.user);
          const userRole = session.user.user_metadata?.role || 'doctor';
          setRole(userRole);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('Session check failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthChange((event, session) => {
      if (session) {
        setUser(session.user);
        const userRole = session.user.user_metadata?.role || 'doctor';
        setRole(userRole);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthStep('gateway');
      }
      // Make sure loading is cleared when auth state changes
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
      default: return <Dashboard />;
    }
  };

  const renderPatientContent = () => {
    switch (patientTab) {
      case 'dashboard': return <PatientDashboard user={user} />;
      case 'medications': return <PatientMedications />;
      case 'appointments': return <PatientAppointments />;
      case 'history': return <PatientHistory />;
      case 'ambulance': return <PatientAmbulance />;
      case 'settings': return <Settings />; // Reusing settings for now
      default: return <PatientDashboard />;
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
      case 'billing': return <DoctorBilling />;
      case 'ai-insights': return <AgentLogs />; // Reusing agent logs for AI insights
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
              setRole('admin');
              setAuthStep('admin_login');
            } else {
              setRole(selectedRole);
              setIsAuthenticated(true);
              setLoading(false);
            }
          }}
        />
      );
    }

    if (authStep === 'admin_login') {
      return (
        <AdminLogin
          onConfirm={() => { setIsAuthenticated(true); setLoading(false); }}
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
          />
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {renderContent()}
          </main>
        </div>
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
