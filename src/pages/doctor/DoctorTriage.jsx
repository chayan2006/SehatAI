import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PhoneCall, Ambulance, Clock, Activity, CheckCircle2, Video, FileText } from 'lucide-react';
import { db } from '@/lib/database';


const activeEmergencies = [
  { id: 1, patient: 'Eleanor Vance', age: 78, time: '10:45 AM (2 mins ago)', type: 'Critical Vitals', description: 'Sustained Heart Rate > 110 bpm for 15 minutes. Blood pressure elevated.', aiAction: 'Ambulance Dispatched & Caregiver Notified', status: 'In Progress' },
  { id: 2, patient: 'Robert Ford', age: 82, time: '09:30 AM (1 hr ago)', type: 'Inactivity Threshold', description: 'No movement or vitals detected for 49 hours. Exceeds 48h threshold.', aiAction: 'Automated Voice Call Initiated (No Answer)', status: 'Requires Doctor Override' },
];

const aiEscalations = [
  { id: 3, patient: 'Alice Smith', age: 88, time: '2 hours ago', type: 'Medication Non-Adherence', description: 'Patient missed heart medication for 3 consecutive days.', aiAction: 'Sent SMS reminders. Escalating to Doctor for consultation.', status: 'Pending Review' },
  { id: 4, patient: 'James Wilson', age: 62, time: '4 hours ago', type: 'Abnormal Sleep Pattern', description: 'SpO2 dropped below 90% multiple times during sleep.', aiAction: 'Logged event. Recommending Sleep Study.', status: 'Pending Review' },
];

export default function DoctorTriage() {
  const [stats, setStats] = React.useState({ totalPatients: 0, activeEmergencies: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const s = await db.getStats();
        setStats(s);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center uppercase">
          <AlertTriangle className="mr-3 h-8 w-8 text-red-600" />
          Smart Triage Prioritization
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-black uppercase text-[10px] tracking-widest">
            <Activity className="mr-2 h-4 w-4" /> Live Vitals Stream
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest">
            Refresh AI Ranking
          </Button>
        </div>
      </div>

      {/* AI Triage Logic (Feature 7) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
           <div className="flex justify-between items-start mb-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Index</span>
             <Badge className="bg-red-600 text-white border-none font-black">CRITICAL</Badge>
           </div>
            <h4 className="text-3xl font-black text-slate-900">{stats.activeEmergencies > 0 ? (stats.activeEmergencies / 10).toFixed(1) : '0.0'}/10</h4>

           <div className="mt-4 flex items-center gap-2 text-red-600">
             <span className="material-symbols-outlined text-sm">trending_up</span>
             <span className="text-[11px] font-bold">Surge detected in Wing C</span>
           </div>
        </div>
        
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 scale-150">
             <AlertTriangle size={120} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Wait Time Impact</p>
           <h4 className="text-3xl font-black">-18 min</h4>
           <p className="text-[11px] mt-4 opacity-90 font-medium italic">AI Re-routing optimized ER inflow by 22%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Next Escalation Risk</p>
           <div className="space-y-3">
             <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                <span className="text-[11px] font-black text-slate-900">Patient #9921</span>
                <span className="text-[10px] font-bold text-amber-600">High Risk</span>
             </div>
             <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                <span className="text-[11px] font-black text-slate-900">Patient #4482</span>
                <span className="text-[10px] font-bold text-slate-400">Stable</span>
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-red-600 flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Active Emergencies
        </h3>
        <div className="grid gap-6">
          {activeEmergencies.map((alert) => (
            <Card key={alert.id} className="border-red-200 shadow-sm shadow-red-100 bg-red-50/30">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="destructive" className="animate-pulse">{alert.status}</Badge>
                    <span className="text-sm font-medium text-slate-500 flex items-center"><Clock className="mr-1 h-3 w-3" /> {alert.time}</span>
                  </div>
                  <CardTitle className="text-xl">{alert.type} - {alert.patient} ({alert.age}y)</CardTitle>
                  <CardDescription className="text-base mt-2 text-slate-700 font-medium">{alert.description}</CardDescription>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button className="bg-red-600 hover:bg-red-700 text-white"><Ambulance className="mr-2 h-4 w-4" /> Track EMS</Button>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50"><Video className="mr-2 h-4 w-4" /> Emergency Telehealth</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">AI Agent Action Taken:</p>
                    <p className="text-sm text-slate-600 flex items-center">
                      <Activity className="mr-2 h-4 w-4 text-blue-500" />
                      {alert.aiAction}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-slate-600 border-slate-200">
                    <FileText className="mr-2 h-4 w-4" /> View Full Chart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-semibold text-amber-600 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          AI Escalations (Requires Doctor Review)
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          {aiEscalations.map((escalation) => (
            <Card key={escalation.id} className="border-amber-200 shadow-sm shadow-amber-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="warning">{escalation.status}</Badge>
                  <span className="text-sm font-medium text-slate-500 flex items-center"><Clock className="mr-1 h-3 w-3" /> {escalation.time}</span>
                </div>
                <CardTitle className="text-lg">{escalation.type}</CardTitle>
                <CardDescription className="text-sm text-slate-700 mt-1">
                  <span className="font-semibold text-slate-900">{escalation.patient} ({escalation.age}y)</span> - {escalation.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50/50 p-3 rounded-md border border-amber-100 mb-4">
                  <p className="text-xs font-semibold text-amber-800 mb-1">AI Recommendation:</p>
                  <p className="text-sm text-amber-900">{escalation.aiAction}</p>
                </div>
                <div className="flex space-x-2">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">Approve & Schedule</Button>
                  <Button variant="outline" className="w-full text-slate-600">Dismiss</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
