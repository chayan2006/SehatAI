import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PatientSidebar } from '@/components/PatientSidebar';
import { DoctorSidebar } from '@/components/DoctorSidebar';
import { TopNav } from '@/components/TopNav';
import { Toast } from '@/components/ui/Toast';

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

import { useApp } from '@/context/AppContext';

export function AuthenticatedApp({ 
  adminTab, 
  setAdminTab, 
  patientTab, 
  setPatientTab, 
  doctorTab, 
  setDoctorTab,
  toasts,
  addToast,
  removeToast,
  onLogout,
  onRoleChange
}) {
  const { user, role } = useApp();
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
      case 'ai-insights': return <AgentLogs />; 
      case 'hospital-settings': return <HospitalSettings />;
      case 'settings': return <Settings />; 
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

  return (
    <div className="flex min-h-screen bg-background-light">
      {renderSidebar()}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav 
          role={role}
          onRoleChange={onRoleChange}
          user={{ 
            name: user?.user_metadata?.full_name || user?.email || 'User',
            role: role.charAt(0).toUpperCase() + role.slice(1)
          }} 
          onLogout={onLogout}
          onNavigate={(tab) => {
            if (role === 'doctor') setDoctorTab(tab);
            if (role === 'admin') setAdminTab(tab);
            if (role === 'patient') setPatientTab(tab);
          }}
        />
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
