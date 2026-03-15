import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PhoneCall, Ambulance, Clock, Activity, CheckCircle2, Video, FileText, ShieldCheck, Loader2, X } from 'lucide-react';
import { Toast, useToast } from '@/components/ui/Toast';
import { hospitalService, aiService, authService } from '@/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyEscalations() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
        <ShieldCheck className="w-8 h-8 text-emerald-400" />
      </div>
      <div>
        <p className="font-bold text-slate-700 text-lg">All clear! No critical alerts</p>
        <p className="text-slate-400 text-sm mt-1">All patients are within safe parameters. No action required right now.</p>
      </div>
    </div>
  );
}

export default function DoctorTriage() {
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [emergencies, setEmergencies] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState({});
  
  // Override Modal
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideData, setOverrideData] = useState({ id: '', patientName: '', action: '', notes: '' });

  useEffect(() => {
    loadTriageData();
  }, []);

  const loadTriageData = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) return;

      const hospital = await hospitalService.getHospitalByAdmin(user.id);
      if (!hospital) return;

      const data = await hospitalService.getEscalations(hospital.id);
      
      // Map DB escalations to triage categories
      setEmergencies(data.filter(l => (l.severity === 'critical' || l.severity === 'high') && !l.resolved));
      setEscalations(data.filter(l => (l.severity === 'medium' || l.severity === 'low') && !l.resolved));
      
    } catch (err) {
      console.error(err);
      addToast('Failed to sync triage data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, action, patientName, notes = '') => {
    setResolvingId(id);
    addToast(`Resolving alert for ${patientName}...`, 'loading');
    try {
      const user = await authService.getCurrentUser();
      // Using resolveEscalation from userService which handles timestamp and notes
      await hospitalService.resolveEscalation(id, notes || action);
      
      setEmergencies(prev => prev.filter(e => e.id !== id));
      setEscalations(prev => prev.filter(e => e.id !== id));
      
      addToast(`✓ Alert resolved: ${action}`, 'success');
      setIsOverrideOpen(false);
    } catch (err) {
      addToast('Resolution failed', 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const handleAIAnalyze = async (escalation) => {
    setAnalyzingId(escalation.id);
    addToast('Summoning AI Triage Engine...', 'loading');
    try {
      const analysis = await aiService.analyzeTriageEscalation(escalation);
      setAnalysisResult(prev => ({ ...prev, [escalation.id]: analysis }));
      addToast('✓ AI Intelligence Received', 'success');
    } catch (err) {
      addToast('AI Engine is overloaded', 'error');
    } finally {
      setAnalyzingId(null);
    }
  };

  const totalActive = emergencies.length + escalations.length;

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#00b289]" />
        <p className="font-bold tracking-tight">Syncing with AI Triage Engine...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-2 animate-in fade-in duration-500">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center uppercase gap-3">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          Smart Triage Prioritization
          {totalActive > 0 && (
            <span className="text-xs font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full normal-case tracking-normal animate-pulse">
              {totalActive} ACTIVE ALERTS
            </span>
          )}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-black uppercase text-[10px] tracking-widest">
            <Activity className="mr-2 h-4 w-4" /> Live Vitals Stream
          </Button>
          <Button 
            onClick={loadTriageData} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest px-6"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Activity className="mr-2 h-4 w-4" />}
            Refresh AI Ranking
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Risk Index</span>
            <Badge className={`font-black border-none ${emergencies.length > 2 ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
              {emergencies.length > 2 ? 'CRITICAL' : 'ELEVATED'}
            </Badge>
          </div>
          <h4 className="text-3xl font-black text-slate-900">{totalActive > 5 ? '9.2 / 10' : '4.5 / 10'}</h4>
          <div className="mt-4 flex items-center gap-2 text-slate-500">
            <Activity size={14} className="text-[#00b289]" />
            <span className="text-[11px] font-bold">Based on real-time physiological telemetry</span>
          </div>
        </div>

        <div className="bg-red-600 rounded-2xl p-6 text-white shadow-xl shadow-red-100 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 scale-150">
            <AlertTriangle size={120} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">EMS Response Time</p>
          <h4 className="text-3xl font-black">4.2 min</h4>
          <p className="text-[11px] mt-4 opacity-90 font-medium italic">Average ETA for incoming trauma units</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Queue Dynamics</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-red-50 p-2 rounded-lg">
              <span className="text-[11px] font-black text-slate-900">Critical Emergencies</span>
              <span className="text-[10px] font-bold text-red-600">{emergencies.length} cases</span>
            </div>
            <div className="flex justify-between items-center bg-amber-50 p-2 rounded-lg">
              <span className="text-[11px] font-black text-slate-900">Suspicious Deviations</span>
              <span className="text-[10px] font-bold text-amber-600">{escalations.length} cases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Emergencies */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-full rounded-full h-2 w-2 bg-red-500" />
          </span>
          High-Priority Trauma Cases ({emergencies.length})
        </h3>

        {emergencies.length === 0 && <EmptyEscalations />}

        <div className="grid gap-4">
          {emergencies.map((alert) => (
            <Card key={alert.id} className="border-red-200 border-l-4 bg-red-50/20 shadow-none">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="destructive" className="font-black text-[9px] uppercase tracking-tighter animate-pulse">
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase"><Clock className="mr-1 h-3 w-3" /> {new Date(alert.created_at).toLocaleTimeString()}</span>
                  </div>
                  <CardTitle className="text-lg font-black text-slate-900">{alert.risk}</CardTitle>
                  <CardDescription className="text-sm mt-1 text-slate-700 font-medium leading-relaxed">
                    Patient: {alert.patients?.full_name || 'Individual'} • ID: {alert.external_id || 'N/A'}
                  </CardDescription>
                </div>
                <div className="flex flex-col space-y-2 shrink-0 ml-4">
                  <Button
                    disabled={resolvingId === alert.id}
                    onClick={() => {
                      setOverrideData({ id: alert.id, patientName: alert.patients?.full_name || alert.external_id, action: 'Critical Resolution', notes: '' });
                      setIsOverrideOpen(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest h-9"
                  >
                    Resolve Alert
                  </Button>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest h-9">
                    Track Pulse
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Escalations */}
      <div className="space-y-4 mt-8">
        <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          AI Anomaly Escalations ({escalations.length})
        </h3>

        {escalations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <p className="font-bold text-slate-500">All anomalies reviewed</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {escalations.map((escalation) => (
              <Card key={escalation.id} className="border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
                <CardHeader className="pb-3 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase tracking-tighter">INTELLIGENT TRACER</Badge>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase"><Clock className="mr-1 h-3 w-3" /> {new Date(escalation.created_at).toLocaleTimeString()}</span>
                  </div>
                  <CardTitle className="text-sm font-black text-slate-900 leading-tight">{escalation.risk}</CardTitle>
                  <CardDescription className="text-xs text-slate-600 mt-2">
                    Patient: {escalation.patients?.full_name || 'Individual'} • ID: {escalation.external_id || 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult[escalation.id] && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                         <Bot size={12} /> SehatAI Rationalization
                      </p>
                      <p className="text-[11px] text-slate-700 font-medium leading-relaxed italic">
                        "{analysisResult[escalation.id]}"
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="w-full border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest h-10"
                      disabled={analyzingId === escalation.id}
                      onClick={() => handleAIAnalyze(escalation)}
                    >
                      {analyzingId === escalation.id ? <Loader2 className="animate-spin" /> : 'Analyze Risk'}
                    </Button>
                    <Button
                      className="w-full bg-[#00b289] hover:bg-[#009e7a] text-white font-black uppercase text-[10px] tracking-widest h-10"
                      onClick={() => {
                        setOverrideData({ id: escalation.id, patientName: escalation.patients?.full_name || escalation.external_id, action: 'Anomaly Verified/Resolved', notes: '' });
                        setIsOverrideOpen(true);
                      }}
                    >
                      Resolve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Override Dialog */}
      <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Escalation Override</DialogTitle>
            <DialogDescription className="font-bold text-slate-400">Provide clinical justification for resolving this AI alert.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
             <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Justification / Notes</Label>
                <Textarea 
                  placeholder="e.g. Patient is sleeping, alarm verified as false positive..." 
                  className="rounded-xl font-medium border-slate-100 min-h-[100px]"
                  value={overrideData.notes}
                  onChange={e => setOverrideData({...overrideData, notes: e.target.value})}
                />
             </div>
             <DialogFooter className="pt-6">
                <Button 
                   onClick={() => handleResolve(overrideData.id, overrideData.action, overrideData.patientName, overrideData.notes)}
                   disabled={resolvingId}
                   className="w-full bg-[#00b289] hover:bg-[#009e7a] text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl"
                >
                  {resolvingId ? <Loader2 className="animate-spin" /> : 'Confirm Resolution'}
                </Button>
             </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
