import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { DoctorSidebar } from '@/components/DoctorSidebar';
import { initHospitalAgent } from '@/lib/hospitalAgent';
import AIChat from '@/components/AIChat';
import NotificationDrawer from '@/components/NotificationDrawer';

import DoctorOverview from './DoctorOverview';
import DoctorTriage from './DoctorTriage';
import DoctorPatients from './DoctorPatients';
import DoctorStaff from './DoctorStaff';
import DoctorConsultations from './DoctorConsultations';
import DoctorAmbulance from './DoctorAmbulance';
import DoctorVitals from './DoctorVitals';
import DoctorPharmacy from './DoctorPharmacy';
import DoctorLab from './DoctorLab';
import DoctorWard from './DoctorWard';
import DoctorBilling from './DoctorBilling';
import DoctorAppointments from './DoctorAppointments';
import HospitalSettings from './HospitalSettings';
import Settings from '../Settings';
import AgentLogs from '../AgentLogs';

import { useAuth } from '@/contexts/AuthContext';
import { getHospitalStats } from '@/lib/supabaseService';
import { hospitalService } from '@/database/hospitalService';
import { notificationService } from '@/database/notificationService';

export default function DoctorDashboard({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [agentExecutor, setAgentExecutor] = useState(null);
  const [stats, setStats] = useState({ totalPatients: 0, activeEmergencies: 0, occupancy: '0%' });
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userName = localStorage.getItem('sehat_user_name') || user?.full_name || user?.user_metadata?.full_name || "Doctor";
  const avatarUrl = user?.avatar_url || user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=00b289&color=fff`;

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
        const s = await getHospitalStats();
        setStats({
          totalPatients: s.totalPatients,
          activeEmergencies: s.pendingAppointments,
          occupancy: s.totalPatients > 0 ? `${Math.min(Math.round((s.totalPatients / 50) * 100), 99)}%` : '0%'
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      }
    };

    const fetchHospitalInfo = async () => {
      if (!user?.id) return;
      try {
        const h = await hospitalService.getMyHospital();
        if (h) setHospitalInfo(h);
      } catch (err) {
        console.error("Failed to load hospital info from Supabase", err);
      }
    };

    const fetchUnreadCount = async () => {
      if (!user?.id) return;
      try {
        const count = await notificationService.getUnreadCount(user.id);
        setUnreadCount(count);
      } catch (_) {}
    };

    setupAgent();
    fetchStats();
    fetchHospitalInfo();
    fetchUnreadCount();
  }, [user?.id]);

  const dashboardStyle = {};

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-body selection:bg-primary/30 dark:bg-slate-950" style={dashboardStyle}>
      <DoctorSidebar activeTab={activeTab} onTabChange={(tab) => navigate(`/doctor/${tab}`)} user={user} />
      
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
              <button onClick={() => setNotifOpen(true)} className="relative p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all group">
                <span className="material-symbols-outlined transition-transform group-active:scale-90">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 border border-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              <button className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all group">
                <span className="material-symbols-outlined transition-transform group-active:scale-90">help_outline</span>
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/doctor/settings')}>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{userName}</p>
                <p className="text-[10px] text-primary font-black uppercase tracking-tighter mt-1">{hospitalInfo?.hospital_name || "Chief Medical Officer"}</p>
              </div>
              <img 
                alt="Admin Profile" 
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-50 dark:ring-slate-800 group-hover:ring-primary transition-all shadow-sm"
                src={avatarUrl}
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=00b289&color=fff`; }}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorOverview hospitalInfo={hospitalInfo} stats={stats} />} />
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
            <Route path="lab" element={<DoctorLab />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="analytics" element={<AgentLogs />} />
            <Route path="settings" element={<Settings />} />
            <Route path="hospital-settings" element={<HospitalSettings />} />
          </Routes>
        </div>

        <NotificationDrawer
          open={notifOpen}
          onClose={() => { setNotifOpen(false); setUnreadCount(0); }}
          userId={user?.id}
          hospitalId={hospitalInfo?.id}
        />

        {agentExecutor && (
          <AIChat 
            agentExecutor={agentExecutor} 
            title="SehatAI Clinical Assistant"
            initialMessage={`Hello ${user?.full_name ? `Dr. ${user.full_name.split(' ').pop()}` : userName}. I'm your Clinical Assistant. I can help with patient records, triage analysis, and hospital information.`}
            welcomeTitle="Clinical Agentic Suite"
            themeColor="#00b289"
          />
        )}
      </main>
    </div>
  );
}
