import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  BarChart2, TrendingUp, Users, AlertCircle, Clock, 
  Download, Filter, Calendar, ChevronRight, Activity,
  Brain, Heart, Zap, ShieldCheck
} from 'lucide-react';
import { hospitalService, patientService } from '@/database';

const ADHERENCE_DATA = [
  { day: 'Mon', rate: 92, target: 90 },
  { day: 'Tue', rate: 88, target: 90 },
  { day: 'Wed', rate: 95, target: 90 },
  { day: 'Thu', rate: 90, target: 90 },
  { day: 'Fri', rate: 85, target: 90 },
  { day: 'Sat', rate: 82, target: 90 },
  { day: 'Sun', rate: 94, target: 90 },
];

const ALERT_TRENDS = [
  { month: 'Jan', critical: 12, warning: 45, stable: 120 },
  { month: 'Feb', critical: 8, warning: 38, stable: 135 },
  { month: 'Mar', critical: 15, warning: 52, stable: 128 },
  { month: 'Apr', critical: 10, warning: 41, stable: 142 },
  { month: 'May', critical: 14, warning: 48, stable: 155 },
  { month: 'Jun', critical: 9, warning: 35, stable: 160 },
];

const PATIENT_DISTRIBUTION = [
  { name: 'Critical', value: 15, color: '#ef4444' },
  { name: 'Stable', value: 65, color: '#10b981' },
  { name: 'Under Obs', value: 20, color: '#f59e0b' },
];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeAlerts: 0,
    adherenceRate: '91.4%',
    efficiency: '+12.5%'
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const hospital = await hospitalService.getMyHospital();
        if (hospital) {
          const patients = await patientService.getPatients(hospital.id);
          const alerts = await hospitalService.getEscalations(hospital.id);
          setStats(prev => ({
            ...prev,
            totalPatients: patients.length,
            activeAlerts: alerts.filter(a => !a.resolved).length
          }));
        }
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 medical-pulse-bg min-h-screen">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-[#00b289]/10 text-[#00b289] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#00b289]/20">
              Clinical Intelligence
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart2 className="text-[#00b289]" size={40} />
            Analytics Command Center
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-2xl text-lg">
            Real-time clinical throughput, patient outcomes, and AI-driven operational forecasting.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Calendar size={16}/> Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-xl transition-all active:scale-95 shadow-lg shadow-slate-200">
            <Download size={16}/> Export Report
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Census', val: stats.totalPatients, icon: Users, color: 'emerald', trend: '+4% vs LY' },
          { label: 'Escalation Rate', val: stats.activeAlerts, icon: AlertCircle, color: 'red', trend: '-2% improved' },
          { label: 'Med Adherence', val: stats.adherenceRate, icon: Heart, color: 'blue', trend: 'Target: 95%' },
          { label: 'AI Throughput', val: stats.efficiency, icon: Zap, color: 'amber', trend: 'Optimal' },
        ].map((kpi, i) => (
          <div key={i} className="group bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-[#00b289]/30 hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <kpi.icon size={80} />
            </div>
            <div className="relative z-10">
                <div className={`p-3 w-fit rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                    <kpi.icon size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-3xl font-black text-slate-900">{kpi.val}</h3>
                    <span className="text-[10px] font-black text-emerald-500">{kpi.trend}</span>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Adherence */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-sm p-8 group">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#00b289]" />
                Medication Adherence (Weekly)
              </h3>
              <p className="text-sm text-slate-400 mt-1 font-medium">Compliance tracking across all wards.</p>
            </div>
            <select className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl focus:ring-0">
                <option>All Wards</option>
                <option>ICU Only</option>
            </select>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ADHERENCE_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00b289" stopOpacity={1} />
                    <stop offset="100%" stopColor="#00b289" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Bar 
                    dataKey="rate" 
                    fill="url(#barGradient)" 
                    radius={[10, 10, 10, 10]} 
                    barSize={40}
                    animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Health Distribution */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-8">
                <Activity size={16} className="text-[#00b289]" />
                Census Distribution
            </h3>
            <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={PATIENT_DISTRIBUTION}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                        >
                            {PATIENT_DISTRIBUTION.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</p>
                    <h4 className="text-3xl font-black text-slate-900">{stats.totalPatients}</h4>
                </div>
            </div>
            <div className="mt-8 space-y-3">
                {PATIENT_DISTRIBUTION.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                            <span className="text-xs font-bold text-slate-600">{d.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{d.value}%</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* AI Risk Trend Chart */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
            <Brain size={200} />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-2xl w-fit border border-white/5">
                    <Brain size={18} className="text-[#00b289]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Prediction Engine</span>
                </div>
                <h3 className="text-4xl font-black tracking-tighter">Predictive Trajectory</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                    Our Clinical AI models have analyzed current patient vitals to forecast regional health trends for the next quarter.
                </p>
                <button className="flex items-center gap-2 text-[#00b289] font-black uppercase text-xs tracking-widest mt-4 hover:gap-4 transition-all">
                    Full AI Audit <ChevronRight size={16} />
                </button>
            </div>
            
            <div className="lg:col-span-3 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ALERT_TRENDS}>
                        <defs>
                            <linearGradient id="colorStable" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00b289" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00b289" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="stable" 
                            stroke="#00b289" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorStable)" 
                        />
                         <Area 
                            type="monotone" 
                            dataKey="critical" 
                            stroke="#ef4444" 
                            strokeWidth={2} 
                            fillOpacity={0} 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}
