import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PatientSidebar } from '@/components/PatientSidebar';
import { DoctorSidebar } from '@/components/DoctorSidebar';
import { TopNav } from '@/components/TopNav';
import Login from '@/pages/Login';
import AdminLogin from '@/pages/AdminLogin';

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
import DoctorConsultations from '@/pages/doctor/DoctorConsultations';
import DoctorAmbulance from '@/pages/doctor/DoctorAmbulance';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState('gateway'); // 'gateway' | 'admin_login'
  const [role, setRole] = useState('doctor');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [patientTab, setPatientTab] = useState('dashboard');
  const [doctorTab, setDoctorTab] = useState('triage');

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
      case 'triage': return <DoctorTriage />;
      case 'patients': return <DoctorPatients />;
      case 'consultations': return <DoctorConsultations />;
      case 'ambulance': return <DoctorAmbulance />;
      case 'ai-insights': return <AgentLogs />; // Reusing agent logs for AI insights
      case 'settings': return <Settings />; // Reusing settings
      default: return <DoctorTriage />;
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

  return <AdminDashboard />;
}
