import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PatientSidebar } from '@/components/PatientSidebar';
import { DoctorSidebar } from '@/components/DoctorSidebar';
import { TopNav } from '@/components/TopNav';
import Login from '@/pages/Login';
import PortalLogin from '@/pages/PortalLogin';
import AdminLogin from '@/pages/AdminLogin';
import { supabase } from '@/database/supabaseClient';
import { userService } from '@/database/userService';

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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState('gateway'); // 'gateway' | 'admin_login' | 'portal_login'
  const [loginRole, setLoginRole] = useState('doctor');
  const [role, setRole] = useState('doctor');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [patientTab, setPatientTab] = useState('dashboard');
  const [doctorTab, setDoctorTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setRole(session.user.user_metadata.role || 'doctor');
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setRole(session.user.user_metadata.role || 'doctor');
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setAuthStep('gateway');
      }
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
      case 'dashboard': return <AdminDashboard />;
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
      case 'dashboard': return <PatientDashboard />;
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
      case 'dashboard': return <AdminDashboard />;
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
      default: return <AdminDashboard />;
    }
  };

  const renderSidebar = () => {
    switch (role) {
      case 'admin': return <Sidebar activeTab={adminTab} onTabChange={setAdminTab} />;
      case 'doctor': return <DoctorSidebar activeTab={doctorTab} onTabChange={setDoctorTab} />;
      case 'patient': return <PatientSidebar activeTab={patientTab} onTabChange={setPatientTab} />;
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

  if (role === 'admin' || role === 'doctor') {
    return <AdminDashboard 
      role={role} 
      onRoleChange={(r) => setRole(r)} 
      onLogout={async () => {
        await userService.signOut();
      }} 
    />;
  }

  if (role === 'patient') {
    return <PatientDashboard 
      onLogout={async () => {
        await userService.signOut();
      }} 
    />;
  }


  return null;
}
