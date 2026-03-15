import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, BedDouble, Pill, PlusSquare, 
  AlertTriangle, CheckCircle2, Clock, Loader2, TrendingUp,
  Calendar, ArrowUpRight, ArrowDownRight, UserPlus
} from 'lucide-react';
import { authService, patientService, hospitalService } from '@/database';

export default function DoctorDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    availableBeds: 0,
    wardOccupancy: 0,
    lowStockMeds: 0,
    todayAppointments: 0,
    activeEscalations: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [activeEscalations, setActiveEscalations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return;

      const hospital = await hospitalService.getHospitalByAdmin(currentUser.id);
      if (!hospital) return;

      const [patients, wards, inventory, appointments, escalations] = await Promise.all([
        patientService.getPatients(hospital.id),
        hospitalService.getWards(hospital.id),
        hospitalService.getInventory(hospital.id),
        hospitalService.getAppointments(hospital.id),
        hospitalService.getEscalations(hospital.id)
      ]);

      const allBeds = (wards || []).flatMap(w => w.beds || []);
      const totalBeds = allBeds.length;
      const occupiedBeds = allBeds.filter(b => b.status === 'occupied').length;

      setStats({
        totalPatients: patients?.length || 0,
        availableBeds: totalBeds - occupiedBeds,
        wardOccupancy: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        lowStockMeds: (inventory || []).filter(i => i.stock_level < i.min_stock).length,
        todayAppointments: (appointments || []).filter(a => {
            const date = new Date(a.appointment_time);
            return date.toDateString() === new Date().toDateString();
        }).length,
        activeEscalations: (escalations || []).filter(e => !e.resolved).length
      });

      setRecentPatients((patients || []).slice(0, 5));
      setActiveEscalations((escalations || []).filter(e => !e.resolved).slice(0, 4));

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-[#00b289]" />
        <p className="font-bold text-lg tracking-tight">Syncing Clinical Ecosystem...</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', up: true },
    { label: 'Bed Availability', value: stats.availableBeds, icon: BedDouble, color: 'text-[#00b289]', bg: 'bg-emerald-50', trend: '-2', up: false },
    { label: 'Ward Occupancy', value: `${stats.wardOccupancy}%`, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Optimal', up: true },
    { label: 'Low Stock Meds', value: stats.lowStockMeds, icon: Pill, color: 'text-red-600', bg: 'bg-red-50', trend: 'Restock Soon', up: false },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Operational Overview
          </h2>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest">
            Welcome back, {user?.user_metadata?.full_name || 'Medical Officer'}
          </p>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#00b289] text-white rounded-xl text-xs font-black uppercase tracking-tighter hover:shadow-lg transition-all active:scale-95">
                <UserPlus size={14} />
                New Admission
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-slate-50 transition-all">
                <Calendar size={14} />
                Schedules
            </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${card.up ? 'text-emerald-600' : 'text-red-600'}`}>
                {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Escalations */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
               <span className="p-1.5 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={14} /></span>
               AI Alerts
            </h3>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black">
                {stats.activeEscalations} ACTIVE
            </span>
          </div>

          <div className="space-y-4">
            {activeEscalations.map((esc, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-red-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                   <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter px-2 py-0.5 bg-red-50 rounded-lg">
                     {esc.severity}
                   </p>
                   <span className="text-[9px] text-slate-400 font-bold">{new Date(esc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">{esc.risk}</p>
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">
                   <Clock size={10} />
                   Awaiting Intervention
                </div>
              </div>
            ))}
            {activeEscalations.length === 0 && (
                <div className="py-12 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center text-center px-6">
                    <CheckCircle2 size={32} className="text-[#00b289] mb-3" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">System Stable</p>
                    <p className="text-[10px] text-slate-400 mt-1">No active clinical escalations detected at this time.</p>
                </div>
            )}
          </div>
        </div>

        {/* Live Patient Pulse / Insights */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Activity size={14} /></span>
                    Recent Census Activity
                </h3>
                <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                    View Registry
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentPatients.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                                {p.full_name?.split(' ').map(n=>n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{p.full_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">ID: {p.external_id || 'PX-XXXX'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase">
                                            Stable
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] font-black text-slate-500">{new Date(p.admission_date || p.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1 px-3 bg-slate-100 hover:bg-[#00b289] hover:text-white text-slate-600 text-[10px] font-black rounded-lg transition-all uppercase tracking-tighter">
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {recentPatients.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                        No recent patient activity found.
                    </div>
                )}
            </div>
            
            <div className="p-6 bg-[#1a1a1a] rounded-3xl text-white flex items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                        <TrendingUp className="text-[#00b289]" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AI Productivity Pulse</p>
                        <h4 className="text-lg font-black tracking-tight">System throughput increased by 14% today</h4>
                    </div>
                </div>
                <button className="px-6 py-2 bg-white text-black rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-slate-100 transition-all">
                    View Report
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
