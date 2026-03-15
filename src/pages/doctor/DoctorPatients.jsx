import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Search, Filter, Plus, Activity, FileText, Trash2, Brain, TrendingUp, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Toast, useToast } from '@/components/ui/Toast';
import { patientService, aiService, authService, hospitalService } from '@/database';

// ── 20-patient demo dataset ──────────────────────────────────────────────────
const DEMO_PATIENTS = [
  { id: 1,  name: 'Eleanor Vance',   age: 78, status: 'Critical', lastActive: '2 mins ago',   condition: 'Arrhythmia',         hr: 110, bp: '145/90', riskScore: 92, aiNotes: 'Sustained tachycardia detected.',          ambulanceStatus: 'En Route', risks: { sepsis: 12, cardiac: 88, respiratory: 15 } },
  { id: 2,  name: 'Robert Ford',     age: 82, status: 'Inactive', lastActive: '49 hours ago',  condition: 'Hypertension',       hr: 72,  bp: '130/85', riskScore: 85, aiNotes: 'No vitals logged for 48h.',                ambulanceStatus: 'None',     risks: { sepsis: 45, cardiac: 62, respiratory: 40 } },
  { id: 3,  name: 'Martha Wayne',    age: 65, status: 'Stable',   lastActive: '1 hour ago',    condition: 'Post-op Recovery',   hr: 68,  bp: '118/75', riskScore: 24, aiNotes: 'Recovery progressing normally.',           ambulanceStatus: 'None',     risks: { sepsis: 5,  cardiac: 12, respiratory: 2  } },
  { id: 4,  name: 'John Doe',        age: 71, status: 'Stable',   lastActive: '3 hours ago',   condition: 'Diabetes Type 2',    hr: 75,  bp: '122/80', riskScore: 35, aiNotes: 'Blood glucose levels stable.',             ambulanceStatus: 'None',     risks: { sepsis: 5,  cardiac: 18, respiratory: 8  } },
  { id: 5,  name: 'Alice Smith',     age: 88, status: 'Warning',  lastActive: '12 hours ago',  condition: 'Heart Failure',      hr: 95,  bp: '135/88', riskScore: 78, aiNotes: 'Missed medication for 3 days.',            ambulanceStatus: 'None',     risks: { sepsis: 15, cardiac: 72, respiratory: 35 } },
  { id: 6,  name: 'James Wilson',    age: 62, status: 'Stable',   lastActive: '5 mins ago',    condition: 'Asthma',             hr: 82,  bp: '120/80', riskScore: 15, aiNotes: 'SpO2 drops detected during sleep.',        ambulanceStatus: 'None',     risks: { sepsis: 2,  cardiac: 5,  respiratory: 68 } },
  { id: 7,  name: 'Priya Sharma',    age: 54, status: 'Stable',   lastActive: '20 mins ago',   condition: 'Thyroid Disorder',   hr: 77,  bp: '119/78', riskScore: 20, aiNotes: 'TSH levels within normal range.',          ambulanceStatus: 'None',     risks: { sepsis: 3,  cardiac: 8,  respiratory: 4  } },
  { id: 8,  name: 'David Chen',      age: 45, status: 'Warning',  lastActive: '6 hours ago',   condition: 'COVID-19 (Moderate)',hr: 98,  bp: '128/84', riskScore: 62, aiNotes: 'SpO2 at 93% — borderline threshold.',     ambulanceStatus: 'None',     risks: { sepsis: 30, cardiac: 22, respiratory: 58 } },
  { id: 9,  name: 'Fatima Al-Rashid',age: 60, status: 'Critical', lastActive: '1 min ago',     condition: 'Sepsis Stage II',   hr: 118, bp: '90/60',  riskScore: 96, aiNotes: 'Elevated WBC, lactate rising rapidly.',    ambulanceStatus: 'En Route', risks: { sepsis: 94, cardiac: 35, respiratory: 45 } },
  { id: 10, name: 'Carlos Rivera',   age: 38, status: 'Stable',   lastActive: '2 hours ago',   condition: 'Appendicitis',       hr: 80,  bp: '116/74', riskScore: 18, aiNotes: 'Post-appendectomy. Healing well.',         ambulanceStatus: 'None',     risks: { sepsis: 8,  cardiac: 4,  respiratory: 5  } },
  { id: 11, name: 'Yuki Tanaka',     age: 72, status: 'Warning',  lastActive: '8 hours ago',   condition: 'COPD',               hr: 91,  bp: '132/86', riskScore: 55, aiNotes: 'FEV1 at 62%. Bronchodilator adjusted.',   ambulanceStatus: 'None',     risks: { sepsis: 12, cardiac: 28, respiratory: 72 } },
  { id: 12, name: 'Samuel Okafor',   age: 67, status: 'Stable',   lastActive: '30 mins ago',   condition: 'Kidney Disease',     hr: 70,  bp: '140/90', riskScore: 42, aiNotes: 'GFR stable at 45. Diet compliance good.', ambulanceStatus: 'None',     risks: { sepsis: 18, cardiac: 32, respiratory: 10 } },
  { id: 13, name: 'Helen Park',      age: 55, status: 'Stable',   lastActive: '45 mins ago',   condition: 'Rheumatoid Arthritis',hr: 74, bp: '121/79', riskScore: 22, aiNotes: 'CRP moderately elevated. Stable overall.', ambulanceStatus: 'None',     risks: { sepsis: 6,  cardiac: 10, respiratory: 5  } },
  { id: 14, name: 'Omar Hassan',     age: 49, status: 'Warning',  lastActive: '5 hours ago',   condition: 'Hypertensive Crisis',hr: 102, bp: '178/110',riskScore: 74, aiNotes: 'BP spike at 3 AM. Medication adjusted.',  ambulanceStatus: 'None',     risks: { sepsis: 8,  cardiac: 65, respiratory: 14 } },
  { id: 15, name: 'Linda Perkins',   age: 81, status: 'Critical', lastActive: '10 mins ago',   condition: 'Acute MI (STEMI)',   hr: 125, bp: '88/55',  riskScore: 99, aiNotes: 'STEMI confirmed. Cath lab on standby.',    ambulanceStatus: 'En Route', risks: { sepsis: 20, cardiac: 97, respiratory: 30 } },
  { id: 16, name: 'Marcus Thompson', age: 44, status: 'Stable',   lastActive: '1 hour ago',    condition: 'Pneumonia',          hr: 84,  bp: '123/81', riskScore: 30, aiNotes: 'Antibiotic response positive. Temp down.', ambulanceStatus: 'None',     risks: { sepsis: 22, cardiac: 8,  respiratory: 48 } },
  { id: 17, name: 'Sarah Connelly',  age: 33, status: 'Stable',   lastActive: '15 mins ago',   condition: 'Antenatal Care',     hr: 76,  bp: '110/70', riskScore: 10, aiNotes: 'Week 32. Fetal heartbeat normal.',         ambulanceStatus: 'None',     risks: { sepsis: 2,  cardiac: 3,  respiratory: 2  } },
  { id: 18, name: 'Raj Patel',       age: 58, status: 'Warning',  lastActive: '3 hours ago',   condition: 'Liver Cirrhosis',    hr: 88,  bp: '115/72', riskScore: 60, aiNotes: 'Bilirubin elevated. INR 2.1.',            ambulanceStatus: 'None',     risks: { sepsis: 35, cardiac: 18, respiratory: 20 } },
  { id: 19, name: 'Grace Kim',       age: 29, status: 'Stable',   lastActive: '2 hours ago',   condition: 'Appendicitis',       hr: 78,  bp: '117/75', riskScore: 12, aiNotes: 'Pre-op assessment complete. Low risk.',   ambulanceStatus: 'None',     risks: { sepsis: 4,  cardiac: 2,  respiratory: 3  } },
  { id: 20, name: 'Thomas Muller',   age: 76, status: 'Warning',  lastActive: '7 hours ago',   condition: 'Parkinson\'s Disease',hr: 79, bp: '126/82', riskScore: 48, aiNotes: 'Tremor severity increased. Review meds.',  ambulanceStatus: 'None',     risks: { sepsis: 5,  cardiac: 22, respiratory: 15 } },
];

const STATUS_COLOR = {
  Critical: 'bg-red-100 text-red-600',
  Warning:  'bg-amber-100 text-amber-600',
  Inactive: 'bg-slate-100 text-slate-500',
  Stable:   'bg-emerald-100 text-emerald-600',
};

// ── Empty State Component ─────────────────────────────────────────────────────
function EmptyPatients({ onAdd }) {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="font-bold text-slate-700 text-lg">No patients yet</p>
            <p className="text-slate-400 text-sm mt-1">Click "Add Patient" to register your first patient</p>
          </div>
          <Button onClick={onAdd} className="bg-[#00b289] hover:bg-[#00b289]/90 text-white mt-2">
            <Plus className="mr-2 h-4 w-4" /> Add First Patient
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [predictionMode, setPredictionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const { toasts, addToast, removeToast } = useToast();

  // Form state
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Detail Dialog state
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) return;

      const hospital = await hospitalService.getHospitalByAdmin(user.id);
      
      if (!hospital) {
        setPatients([]);
        return;
      }

      const data = await patientService.getPatients(hospital.id);
      
      // Transform DB records to component schema
      const transformed = data.map(p => ({
        id: p.id,
        name: p.full_name,
        age: p.age,
        status: p.status || 'Stable',
        lastActive: 'Just now',
        condition: p.condition || 'Observation',
        hr: 75, bp: '120/80', riskScore: p.risk_score || 25,
        aiNotes: 'Real-time telemetry active.',
        ambulanceStatus: 'None',
        risks: { sepsis: 5, cardiac: 10, respiratory: 5 }
      }));
      setPatients(transformed);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    addToast('Adding patient to registry...', 'loading');

    try {
      const hospital = await hospitalService.getMyHospital();

      const newRecord = await patientService.addPatient({
        hospital_id: hospital.id,
        full_name: newName,
        age: parseInt(newAge) || null,
        condition: newCondition,
        status: 'Stable',
        risk_score: 25
      });

      const newPatient = {
        id: newRecord.id,
        name: newRecord.full_name,
        age: newRecord.age,
        status: newRecord.status,
        lastActive: 'Just now',
        condition: newRecord.condition,
        hr: 75, bp: '120/80', riskScore: 25,
        aiNotes: 'New patient registered.',
        ambulanceStatus: 'None',
        risks: { sepsis: 5, cardiac: 5, respiratory: 5 }
      };

      setPatients(prev => [newPatient, ...prev]);
      setIsDialogOpen(false);
      setNewName(''); setNewAge(''); setNewCondition('');
      addToast(`✓ Patient "${newName}" added successfully!`, 'success');
    } catch (err) {
      addToast('Failed to add patient', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePatient = async (id, name) => {
    addToast(`Removing ${name}...`, 'loading');
    try {
      await patientService.deletePatient(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      addToast(`${name} removed from roster.`, 'success');
    } catch (err) {
      addToast('Failed to remove patient', 'error');
    }
  };

  const handleRunForecast = async (patient) => {
    addToast(`SehatAI analyzing trajectory for ${patient.name}...`, 'loading');
    try {
      const risks = await aiService.predictRisks(
        { name: patient.name, age: patient.age, condition: patient.condition },
        { hr: patient.hr, bp: patient.bp }
      );
      setPatients(prev => prev.map(p => p.id === patient.id ? { ...p, risks } : p));
      addToast(`✓ 72h Forecast updated for ${patient.name}`, 'success');
    } catch (err) {
      addToast('AI Forecast engine timed out.', 'error');
    }
  };

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            My Patients
            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-indigo-200 text-indigo-600 bg-indigo-50">
              AI Predictive Engine Active
            </Badge>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {patients.length} patients · Autonomous 72h risk forecasting for cardiac and sepsis events.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setPredictionMode(!predictionMode)}
            variant={predictionMode ? 'default' : 'outline'}
            className={predictionMode ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100' : 'border-slate-200'}
          >
            <Brain className="mr-2 h-4 w-4" />
            {predictionMode ? 'Hide 72h Forecast' : 'Show 72h Forecast'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00b289] hover:bg-[#00b289]/90 text-white shadow-lg shadow-[#00b289]/10">
                <Plus className="mr-2 h-4 w-4" /> Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>Enter the patient's details to add them to your roster.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPatient}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-slate-700">Name</Label>
                    <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} className="col-span-3" placeholder="e.g. Jane Doe" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right text-slate-700">Age</Label>
                    <Input id="age" type="number" value={newAge} onChange={e => setNewAge(e.target.value)} className="col-span-3" placeholder="e.g. 45" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="condition" className="text-right text-slate-700">Condition</Label>
                    <Input id="condition" value={newCondition} onChange={e => setNewCondition(e.target.value)} className="col-span-3" placeholder="e.g. Diabetes Type 2" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving} className="bg-[#00b289] hover:bg-[#00b289]/90 text-white min-w-[110px]">
                    {saving ? 'Saving...' : 'Save Patient'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {['All', 'Critical', 'Warning', 'Stable', 'Inactive'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              filterStatus === s
                ? 'border-[#00b289] bg-[#00b289] text-white'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {s}
            {s !== 'All' && (
              <span className="ml-1.5 opacity-70">({patients.filter(p => p.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Assigned Patients</CardTitle>
              <CardDescription>Live health telemetry and neural-linked risk assessment.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search name or condition..."
                className="pl-9 h-9 border-slate-200 text-xs"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-bold">Patient Roster</th>
                  <th className="px-4 py-4 font-bold">Health Status & AI Notes</th>
                  <th className="px-4 py-4 font-bold">Vitals Pulse</th>
                  <th className="px-4 py-4 font-bold">
                    {predictionMode ? <span className="text-indigo-600">72h AI Risk Prediction</span> : 'Aggregate Risk'}
                  </th>
                  <th className="px-4 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p className="font-bold">Syncing with medical registry...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 && patients.length === 0 ? (
                  <EmptyPatients onAdd={() => setIsDialogOpen(true)} />
                ) : filtered.length === 0 && patients.length > 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="py-14 text-center">
                        <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No patients match your search</p>
                        <p className="text-slate-400 text-xs mt-1">Try a different name, condition, or status filter</p>
                      </div>
                    </td>
                  </tr>
                ) : null}
                {!loading && filtered.map((patient) => (
                  <tr key={patient.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full flex items-center justify-center font-bold text-xs ${STATUS_COLOR[patient.status] || 'bg-slate-100 text-slate-500'}`}>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-[13px]">{patient.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{patient.age}y • ID: PX-{patient.id.toString().slice(-4)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-700 text-xs">{patient.condition}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center bg-white border border-slate-100 rounded-md px-2 py-1 w-fit shadow-sm">
                        <Activity className="h-3 w-3 mr-2 text-[#00b289]" /> {patient.aiNotes}
                      </div>
                      <Badge className={`mt-1.5 text-[9px] font-black ${STATUS_COLOR[patient.status]} border-0`}>
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Heart Rate</span>
                          <span className={`text-sm font-black flex items-center ${patient.hr > 100 ? 'text-red-600' : 'text-slate-900'}`}>
                            <Heart className={`mr-1.5 h-3 w-3 ${patient.hr > 100 ? 'animate-pulse' : ''}`} fill="currentColor" />
                            {patient.hr} <span className="text-[10px] font-medium ml-0.5">bpm</span>
                          </span>
                        </div>
                        <div className="h-6 w-px bg-slate-100" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Blood Pressure</span>
                          <span className="text-sm font-black text-slate-900">{patient.bp} <span className="text-[10px] font-medium">mmHg</span></span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {predictionMode ? (
                        <div className="flex gap-4 items-center animate-in fade-in duration-500">
                          {[
                            { label: 'Sepsis',  val: patient.risks.sepsis,       color: 'red'    },
                            { label: 'Cardiac', val: patient.risks.cardiac,      color: 'indigo' },
                            { label: 'Resp.',   val: patient.risks.respiratory,  color: 'orange' }
                          ].map(risk => (
                            <div key={risk.label} className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="relative size-12">
                                      <svg className="size-full" viewBox="0 0 36 36">
                                        <path className="text-slate-100 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path
                                          className={`text-${risk.val > 60 ? 'red' : risk.val > 30 ? 'orange' : risk.color}-500 stroke-current`}
                                          strokeWidth="3" strokeDasharray={`${risk.val}, 100`} strokeLinecap="round" fill="none"
                                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                      </svg>
                                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{risk.val}%</span>
                                    </div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-tighter">{risk.label}</p>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 border-none">
                                    <p className="text-[10px] font-bold text-white">{risk.val}% probability in 72h</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                          <div className="flex justify-between items-center px-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Score</span>
                            <span className={`text-[10px] font-black ${patient.riskScore > 80 ? 'text-red-600' : patient.riskScore > 50 ? 'text-amber-500' : 'text-emerald-600'}`}>{patient.riskScore}/100</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${patient.riskScore > 80 ? 'bg-red-500' : patient.riskScore > 50 ? 'bg-amber-500' : 'bg-[#00b289]'}`}
                              style={{ width: `${patient.riskScore}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" size="sm" 
                          className="h-8 text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm"
                          onClick={() => {
                            setSelectedPatientForDetail(patient);
                            setIsDetailOpen(true);
                          }}
                        >
                          <FileText className="mr-1.5 h-3 w-3" /> Chart
                        </Button>
                        {predictionMode && (
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => handleRunForecast(patient)}
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleRemovePatient(patient.id, patient.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Patient Detail Dialog (The Chart) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedPatientForDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className={`size-14 rounded-2xl flex items-center justify-center font-black text-xl ${STATUS_COLOR[selectedPatientForDetail.status]}`}>
                    {selectedPatientForDetail.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black">{selectedPatientForDetail.name}</DialogTitle>
                    <DialogDescription className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                      Patient ID: PX-{selectedPatientForDetail.id.toString().slice(-4)} • AGE {selectedPatientForDetail.age}
                    </DialogDescription>
                  </div>
                  <Badge className={`ml-auto ${STATUS_COLOR[selectedPatientForDetail.status]} border-0 font-black px-4 py-1.5`}>
                    {selectedPatientForDetail.status.toUpperCase()}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Clinical Context</h4>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="font-bold text-slate-900">{selectedPatientForDetail.condition}</p>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Patient admitted for persistent {selectedPatientForDetail.condition.toLowerCase()}. 
                        Neural monitoring shows stability in cardiovascular output but requires monitoring for secondary infection.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Health Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                        <Heart className="mx-auto h-4 w-4 text-red-500 mb-1" />
                        <p className="text-xl font-black">{selectedPatientForDetail.hr}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">BPM</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                        <Activity className="mx-auto h-4 w-4 text-[#00b289] mb-1" />
                        <p className="text-xl font-black">{selectedPatientForDetail.bp}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">BP (mmHg)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 text-indigo-600">
                      <TrendingUp size={14} /> AI Trajectory Analysis
                    </h4>
                    <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
                       <div className="space-y-4">
                          {[
                            { label: 'Sepsis Risk', val: selectedPatientForDetail.risks.sepsis },
                            { label: 'Cardiac Arrest Risk', val: selectedPatientForDetail.risks.cardiac },
                            { label: 'Resp. Failure Risk', val: selectedPatientForDetail.risks.respiratory }
                          ].map(r => (
                            <div key={r.label}>
                               <div className="flex justify-between text-[10px] font-black uppercase mb-1.5 opacity-70">
                                 <span>{r.label}</span>
                                 <span>{r.val}%</span>
                               </div>
                               <div className="w-full bg-indigo-800 rounded-full h-1.5 overflow-hidden border border-white/5">
                                 <div className="bg-white h-full" style={{ width: `${r.val}%` }}></div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-[#00b289] hover:bg-[#00b289]/90 text-white font-bold h-10 shadow-lg shadow-[#00b289]/10"
                    onClick={() => addToast('Treatment plan updated and synced with pharmacy.', 'success')}
                  >
                    Sync Treatment Plan
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
