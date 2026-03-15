import React, { useState, useEffect, useRef } from 'react';
import { Toast, useToast } from '@/components/ui/Toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Activity, Heart, Thermometer, Wind, AlertTriangle, Plus, Search, ChevronRight } from 'lucide-react';
import { patientService, hospitalService, aiService, authService } from '@/database';
import { Textarea } from "@/components/ui/textarea"

export default function DoctorVitals() {
  const { toasts, addToast, removeToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const [timeRange, setTimeRange] = useState('1H');
  
  // Lab Report file input ref
  const labInputRef = useRef(null);

  // Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', id: '', ward: '' });
  const [newReading, setNewReading] = useState({ hr: '', bp: '', spo2: '', temp: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);

  useEffect(() => {
    loadAllPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchVitalsHistory(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadAllPatients = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) return;

      const hospital = await hospitalService.getHospitalByAdmin(user.id);
      if (!hospital) return;

      const data = await patientService.getPatients(hospital.id);
      
      // Transform DB patients to component schema with simulated live values
      const transformed = data.map(p => ({
        id: p.id,
        initials: p.full_name.split(' ').map(n => n[0]).join('').toUpperCase(),
        name: p.full_name,
        ward: p.ward_info || 'Unassigned',
        status: p.status || 'Monitoring',
        hr: 75 + Math.floor(Math.random() * 10),
        spO2: 98 + Math.floor(Math.random() * 2),
        bp: '120/80',
        temp: 36.5 + (Math.random() * 0.5),
        minHr: 60,
        maxHr: 100,
        avgHr: 75,
        variability: 'Normal',
        wearable: { battery: 85, signal: 'Strong', firmware: 'v2.4.1' }
      }));

      setPatients(transformed);
      if (transformed.length > 0 && !selectedPatientId) {
        setSelectedPatientId(transformed[0].id);
      }
    } catch (err) {
      addToast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVitalsHistory = async (patientId) => {
    try {
      const data = await patientService.getLatestVitals(patientId);
      setVitalsHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Real-time subtle vital fluctuations + Real-time Sync
  useEffect(() => {
    let channel;
    
    // Simulations (Internal Heartbeat)
    const interval = setInterval(() => {
      setPatients(currentPatients => 
        currentPatients.map(p => {
          let newHr = p.hr + (Math.floor(Math.random() * 3) - 1);
          if (p.status === 'Critical' && newHr < 120) newHr = 125;
          if (p.status !== 'Critical' && newHr > 110) newHr = 95;
          if (newHr < 50) newHr = 55;

          let newSpO2 = p.spO2 + (Math.floor(Math.random() * 3) - 1);
          if (newSpO2 > 100) newSpO2 = 100;
          if (newSpO2 < 85) newSpO2 = 88;

          return { ...p, hr: newHr, spO2: newSpO2 };
        })
      );
    }, 4000);

    // Supabase Realtime Sync
    const setupRealtime = async () => {
      const hospital = await hospitalService.getMyHospital();
      if (!hospital) return;

      channel = hospitalService.subscribeToVitals('vitals_realtime', (payload) => {
        // If the reading is for the selected patient, update history
        if (payload.new.patient_id === selectedPatientId) {
          setVitalsHistory(prev => [payload.new, ...prev].slice(0, 10));
        }
        
        // Update the "Live Board" values for this patient
        setPatients(prev => prev.map(p => 
          p.id === payload.new.patient_id 
            ? { ...p, hr: payload.new.heart_rate, spO2: payload.new.spo2, bp: payload.new.blood_pressure, temp: payload.new.temperature }
            : p
        ));
      });
    };

    setupRealtime();

    return () => {
      clearInterval(interval);
      if (channel) channel.unsubscribe();
    };
  }, [selectedPatientId]);

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setIsSaving(true);
    addToast('Saving vital readings...', 'loading');
    
    try {
      const user = await authService.getCurrentUser();
      await patientService.recordVitals({
        patient_id: selectedPatientId,
        recorded_by: user.id,
        hr: parseInt(newReading.hr),
        bp: newReading.bp,
        spo2: parseInt(newReading.spo2),
        temperature: parseFloat(newReading.temp),
        resp_rate: 18 // Default
      });

      // Audit log for clinical record commit
      await hospitalService.logAction(user.id, 'EMR_COMMIT_VITALS', 'vital_readings', selectedPatientId);

      addToast('✓ Vitals recorded and committed to EMR.', 'success');
      setIsRecordOpen(false);
      setNewReading({ hr: '', bp: '', spo2: '', temp: '' });
      fetchVitalsHistory(selectedPatientId);
    } catch (err) {
      addToast('Failed to save vitals', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIByForecast = async () => {
    if (!selectedPatientId) return;
    setIsForecastLoading(true);
    addToast('SehatAI Brain generating 72h clinical trajectory...', 'loading');
    
    try {
      const patient = patients.find(p => p.id === selectedPatientId);
      const recentReadings = vitalsHistory.slice(0, 5);
      
      const analysis = await aiService.analyzePatientRecord(
        { full_name: patient.name, date_of_birth: '1985-05-12', blood_group: 'O+' }, // Partial mock demographics
        { diagnosis: 'Chronic Monitoring', vital_signs: recentReadings }
      );
      
      setForecastResult(analysis);
      addToast('✓ AI Forecast Ready', 'success');
    } catch (err) {
      addToast('AI Forecast failed', 'error');
    } finally {
      setIsForecastLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || (patients.length > 0 ? patients[0] : null);
  const criticalCount = patients.filter(p => p.status === 'Critical').length;

  if (loading && patients.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-[#00b289]" />
        <p className="font-bold text-lg tracking-tight">Initializing AI Vitals Engine...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-10 p-2">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Title Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vitals Monitoring</h2>
          <p className="text-slate-500 mt-1">Real-time patient health tracking and AI diagnostics engine</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsRecordOpen(true)}
            disabled={!selectedPatientId}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Activity size={16} /> Record Reading
          </Button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-5 bg-[#00b289] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#00b289]/20 hover:bg-[#00b289]/90 transition-all font-sans"
          >
            <Plus size={18} /> Add Monitor
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {isAlertVisible && criticalCount > 0 && (
        <section className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-top-4">
          <div className="bg-red-500 text-white size-10 rounded-full flex items-center justify-center animate-pulse shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-red-900 font-bold text-sm">Critical Threshold Breach Detected</h4>
            <p className="text-red-700 text-sm truncate">Multiple patients exhibiting tachycardia or hypoxia. Immediate triage advised.</p>
          </div>
          <button onClick={() => setIsAlertVisible(false)} className="text-red-300 hover:text-red-500"><X size={20}/></button>
        </section>
      )}

      {/* Vitals Grid */}
      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          Centralized Monitoring Board
          {criticalCount > 0 && (
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded font-black ml-2 animate-pulse uppercase">
              {criticalCount} CRITICAL
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {patients.map(patient => {
            const isCritical = patient.status === 'Critical';
            const isSelected = patient.id === selectedPatientId;
            const primaryColor = isCritical ? 'red-500' : 'emerald-500';
            
            return (
              <div 
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={`bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden cursor-pointer transition-all border ${isSelected ? 'border-slate-800 ring-2 ring-slate-800 ring-offset-2' : 'border-slate-100 hover:border-slate-300'} ${isCritical ? 'border-red-200' : ''}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`size-12 rounded-xl bg-slate-50 flex items-center justify-center font-black text-lg ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                    {patient.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{patient.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">WARD {patient.ward} • {patient.status}</p>
                  </div>
                  {isCritical && (
                    <div className="ml-auto">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-1 h-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Heart Rate</span>
                      <Heart className={`size-3 ${isCritical ? 'text-red-500 animate-bounce' : 'text-emerald-500'}`} />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-2xl font-black ${isCritical ? 'text-red-500' : 'text-slate-900'}`}>{patient.hr}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">BPM</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-1 h-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Oxygen (SpO2)</span>
                      <Wind className="size-3 text-sky-500" />
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-slate-900">{patient.spO2}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Analysis Row */}
      {selectedPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Telemetry Timeline</h3>
                <p className="text-xs text-slate-500 mt-1">Live feed for {selectedPatient.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                   onClick={handleAIByForecast}
                   disabled={isForecastLoading}
                   className="bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 font-black uppercase text-[10px] tracking-widest h-8"
                >
                  {isForecastLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Activity size={14} className="mr-2" />}
                  Generate 72h AI Forecast
                </Button>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {['1H', '6H', '24H'].map(range => (
                    <button 
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${timeRange === range ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {forecastResult && (
              <div className="mb-8 p-6 bg-slate-900 rounded-2xl text-white border-l-4 border-indigo-500 animate-in fade-in slide-in-from-left duration-500">
                <div className="flex items-center gap-3 mb-4">
                   <div className="bg-indigo-500 p-2 rounded-xl text-white">
                      <Plus size={18} />
                   </div>
                   <h4 className="font-black text-xs uppercase tracking-widest">Predictive AI Diagnostic Summary</h4>
                   <button onClick={() => setForecastResult(null)} className="ml-auto text-slate-500 hover:text-white"><X size={16}/></button>
                </div>
                <div className="text-sm font-medium leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {forecastResult}
                </div>
              </div>
            )}
            
            <div className="h-64 w-full bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
               {/* Live ECG Waveform Animation */}
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <div className="grid grid-cols-12 h-full w-full">
                   {Array.from({length: 12}).map((_, i) => <div key={i} className="border-r border-slate-700 h-full"></div>)}
                 </div>
                 <div className="absolute inset-0 flex flex-col justify-around">
                   {Array.from({length: 6}).map((_, i) => <div key={i} className="border-b border-slate-700 w-full"></div>)}
                 </div>
               </div>
               
               <div className="relative w-full h-full flex items-center">
                 <svg className="w-full h-1/2 text-[#00b289]" preserveAspectRatio="none" viewBox="0 0 1000 100">
                   <defs>
                     <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#00b289" stopOpacity="0" />
                       <stop offset="50%" stopColor="#00b289" stopOpacity="1" />
                       <stop offset="100%" stopColor="#00b289" stopOpacity="0" />
                     </linearGradient>
                   </defs>
                   <path 
                     d="M0,50 L50,50 L60,10 L75,90 L90,50 L150,50 L160,10 L175,90 L190,50 L250,50 L260,10 L275,90 L290,50 L350,50 L360,10 L375,90 L390,50 L450,50 L460,10 L475,90 L490,50 L550,50 L560,10 L575,90 L590,50 L650,50 L660,10 L675,90 L690,50 L750,50 L760,10 L775,90 L790,50 L850,50 L860,10 L875,90 L890,50 L950,50 L960,10 L975,90 L990,50 L1000,50" 
                     fill="none" 
                     stroke="url(#ecgGradient)" 
                     strokeWidth="3" 
                     strokeLinecap="round"
                   >
                     <animate 
                       attributeName="stroke-dasharray" 
                       from="0, 1000" 
                       to="1000, 0" 
                       dur="2s" 
                       repeatCount="indefinite" 
                     />
                   </path>
                   <circle r="4" fill="#00b289">
                     <animateMotion 
                       path="M0,50 L50,50 L60,10 L75,90 L90,50 L150,50 L160,10 L175,90 L190,50 L250,50 L260,10 L275,90 L290,50 L350,50 L360,10 L375,90 L390,50 L450,50 L460,10 L475,90 L490,50 L550,50 L560,10 L575,90 L590,50 L650,50 L660,10 L675,90 L690,50 L750,50 L760,10 L775,90 L790,50 L850,50 L860,10 L875,90 L890,50 L950,50 L960,10 L975,90 L990,50 L1000,50" 
                       dur="2s" 
                       repeatCount="indefinite" 
                     />
                   </circle>
                 </svg>
                 <div className="absolute inset-x-0 bottom-4 flex justify-around text-[10px] font-black text-slate-500 px-6">
                   <span>LIVE TELEMETRY</span>
                   <span className="flex items-center gap-1">
                     <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                     {selectedPatient.name.toUpperCase()} FEED
                   </span>
                 </div>
               </div>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-4">
              {[
                { label: 'Min HR', val: selectedPatient.minHr, unit: 'BPM' },
                { label: 'Max HR', val: selectedPatient.maxHr, unit: 'BPM' },
                { label: 'Avg Pulse', val: selectedPatient.avgHr, unit: 'BPM' },
                { label: 'SDNN', val: 'Low', unit: 'VAR' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{s.val} <span className="text-[9px] text-slate-400">{s.unit}</span></p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
             {/* EMR Commit Log */}
             <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center justify-between">
                  Latest EMR Commits
                  <span className="material-symbols-outlined text-[#00b289] text-sm">database</span>
                </h3>
                <div className="space-y-3">
                  {vitalsHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No persistent readings found.</p>
                  ) : vitalsHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-[#00b289]/30 transition-all">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{h.hr} BPM • {h.spo2}% O2</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(h.recorded_at).toLocaleTimeString()}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-[#00b289]" />
                    </div>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-[10px] font-black uppercase text-[#00b289] hover:bg-emerald-50"
                  onClick={() => setIsRecordOpen(true)}
                >
                  Confirm New Reading
                </Button>
             </div>

             {/* IoT Status */}
             <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wearable Health</h3>
                  <div className="size-2 bg-[#00b289] rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-black">{selectedPatient.wearable?.battery || 85}%</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Battery Life</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{selectedPatient.wearable?.signal || 'Optimal'}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Signal Link</p>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00b289]" style={{ width: `${selectedPatient.wearable?.battery || 85}%` }}></div>
                  </div>
                </div>
             </div>
          </aside>
        </div>
      )}

      {/* Record Vitals Dialog */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Record Clinical Vitals</DialogTitle>
            <DialogDescription>Commit these values to the patient's permanent medical record.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordVitals} className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heart Rate (BPM)</Label>
                  <Input 
                    type="number" 
                    value={newReading.hr} 
                    onChange={e => setNewReading({...newReading, hr: e.target.value})}
                    placeholder="e.g. 72"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Oxygen (SpO2 %)</Label>
                  <Input 
                    type="number" 
                    value={newReading.spo2} 
                    onChange={e => setNewReading({...newReading, spo2: e.target.value})}
                    placeholder="99"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Blood Pressure</Label>
                  <Input 
                    value={newReading.bp} 
                    onChange={e => setNewReading({...newReading, bp: e.target.value})}
                    placeholder="120/80"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temperature (°C)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={newReading.temp} 
                    onChange={e => setNewReading({...newReading, temp: e.target.value})}
                    placeholder="36.6"
                    required
                  />
                </div>
             </div>
             <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsRecordOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-[#00b289] text-white hover:bg-[#00b289]/90 font-bold">
                  {isSaving ? 'Committing...' : 'Commit to EMR'}
                </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
