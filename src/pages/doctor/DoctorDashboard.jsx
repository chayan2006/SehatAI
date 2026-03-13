import React, { useState, useEffect } from 'react';
import { DoctorSidebar } from '@/components/DoctorSidebar';
import { initHospitalAgent } from '@/lib/hospitalAgent';
import AIChat from '@/components/AIChat';

// Doctor Pages
import DoctorTriage from './DoctorTriage';
import DoctorPatients from './DoctorPatients';
import DoctorStaff from './DoctorStaff';
import DoctorConsultations from './DoctorConsultations';
import DoctorAmbulance from './DoctorAmbulance';
import DoctorVitals from './DoctorVitals';
import DoctorPharmacy from './DoctorPharmacy';
import DoctorWard from './DoctorWard';
import DoctorBilling from './DoctorBilling';
import Settings from '../Settings';
import AgentLogs from '../AgentLogs';

import { db } from '@/lib/database';

export default function DoctorDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agentExecutor, setAgentExecutor] = useState(null);
  const [stats, setStats] = useState({ totalPatients: 0, activeEmergencies: 0, occupancy: '0%' });

  useEffect(() => {
    const setupAgent = async () => {
      try {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (apiKey) {
          const executor = await initHospitalAgent({ apiKey });
          setAgentExecutor(executor);
        }
      } catch (error) {
        console.error("Failed to initialize Doctor AI:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const s = await db.getStats();
        setStats({
          totalPatients: s.totalPatients,
          activeEmergencies: s.activeEmergencies,
          occupancy: '88%' // Placeholder for real occupancy logic if needed
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    setupAgent();
    fetchStats();
  }, []);


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Doctor Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Patients Today</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalPatients}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Active Emergencies</h3>
                <p className={`text-3xl font-bold ${stats.activeEmergencies > 0 ? 'text-red-600' : 'text-[#00b289]'}`}>
                  {stats.activeEmergencies}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Ward Occupancy</h3>
                <p className="text-3xl font-bold text-[#00b289]">{stats.occupancy}</p>
              </div>
            </div>

          </div>
        );
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
      case 'analytics': return <AgentLogs />; // Placeholder for analytics
      case 'settings': return <Settings />;
      default: return <DoctorTriage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <DoctorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
             <button 
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
             >
                Logout
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {renderContent()}
        </div>

        {agentExecutor && (
          <AIChat 
            agentExecutor={agentExecutor} 
            title="SehatAI Clinical Assistant"
            initialMessage="Hello Dr. Miller. I'm your Clinical Assistant. I can help with patient records, triage analysis, and hospital information."
            welcomeTitle="Clinical Agentic Suite"
            themeColor="#00b289"
          />
        )}
      </main>
    </div>
  );
}
