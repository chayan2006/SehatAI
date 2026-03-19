import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { DoctorSidebar } from '@/components/DoctorSidebar';
import { initHospitalAgent } from '@/lib/hospitalAgent';
import AIChat from '@/components/AIChat';

import DoctorOverview from './DoctorOverview';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [agentExecutor, setAgentExecutor] = useState(null);
  const [stats, setStats] = useState({ totalPatients: 0, activeEmergencies: 0, occupancy: '0%' });

  // Extract current tab from URL
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

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
          occupancy: '88%' 
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    setupAgent();
    fetchStats();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-body selection:bg-primary/30 dark:bg-slate-950">
      <DoctorSidebar activeTab={activeTab} onTabChange={(tab) => navigate(`/doctor/${tab}`)} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-64">
        {/* TopNavBar */}
        <header className="h-16 sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-emerald-50/50 dark:border-slate-800">
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 flex items-center h-10 transition-all">
              <span className="material-symbols-outlined text-slate-400 mr-2 text-xl">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 dark:text-white" 
                placeholder="Search Command Center..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all group">
                <span className="material-symbols-outlined transition-transform group-active:scale-90">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              <button className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all group">
                <span className="material-symbols-outlined transition-transform group-active:scale-90">help_outline</span>
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={onLogout}>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none">Dr. Sarah Chen</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-tighter mt-1">Chief Medical Officer</p>
              </div>
              <img 
                alt="Admin Profile" 
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-50 dark:ring-slate-800 group-hover:ring-primary transition-all shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQlrFYxun5sS9xW7fxqTAo6Pd0DAgclxrL5ogI49naNRsZEMTdUpcbBkWwkfPy8tpUtjpL1kmoMvtHA5TTbK95V6PKY0QpUXtuTScVp0mJ4Y7gYKdoEkTDNzcatf9M-TnAl4YttfgRN0HZHvapcY0xDpPIs_2Zrb72Ibw_TuYc1n_8NjPJ33JpkGEj4IC0ZjesQo7YCJApHTY7L2tE1yjgSRtSrDzLGeshLbaqvMJ13-syAjVtdpMddHNSnFDDsA86Eef3SgWRz3c" 
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorOverview />} />
            <Route path="triage" element={<DoctorTriage />} />
            <Route path="emergency" element={<DoctorTriage />} />
            <Route path="pharmacy" element={<DoctorPharmacy />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="staff" element={<DoctorStaff />} />
            <Route path="vitals" element={<DoctorVitals />} />
            <Route path="consultations" element={<DoctorConsultations />} />
            <Route path="ambulance" element={<DoctorAmbulance />} />
            <Route path="ward" element={<DoctorWard />} />
            <Route path="billing" element={<DoctorBilling />} />
            <Route path="analytics" element={<AgentLogs />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
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
