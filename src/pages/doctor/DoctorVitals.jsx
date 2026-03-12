import React, { useState, useEffect } from 'react';
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

const initialPatients = [
  {
    id: '8829',
    initials: 'JD',
    name: 'John Doe',
    ward: '402-03',
    status: 'Critical',
    hr: 142,
    spO2: 92,
    bp: '155/98',
    temp: 38.2,
    minHr: 64,
    maxHr: 158,
    avgHr: 88,
    variability: 'High',
  },
  {
    id: '9241',
    initials: 'EW',
    name: 'Elena Wright',
    ward: '105-12',
    status: 'Monitoring',
    hr: 78,
    spO2: 99,
    bp: '122/80',
    temp: 36.8,
    minHr: 60,
    maxHr: 85,
    avgHr: 72,
    variability: 'Normal',
  },
  {
    id: '4120',
    initials: 'MS',
    name: 'Marcus Smith',
    ward: '202-01',
    status: 'Monitoring',
    hr: 82,
    spO2: 98,
    bp: '118/76',
    temp: 37.1,
    minHr: 65,
    maxHr: 90,
    avgHr: 75,
    variability: 'Normal',
  }
];

export default function DoctorVitals() {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState('8829');
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const [timeRange, setTimeRange] = useState('1H');
  
  // Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', id: '', ward: '' });

  // Simulate real-time subtle vital fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients(currentPatients => 
        currentPatients.map(p => {
          // Fluctuate HR by -2 to +2, clamping ranges
          let newHr = p.hr + (Math.floor(Math.random() * 5) - 2);
          if (p.status === 'Critical' && newHr < 120) newHr = 120;
          if (p.status !== 'Critical' && newHr > 100) newHr = 95;
          if (newHr < 50) newHr = 55;

          // Fluctuate SpO2 randomly by -1, 0, or 1 
          let newSpO2 = p.spO2 + (Math.floor(Math.random() * 3) - 1);
          if (newSpO2 > 100) newSpO2 = 100;
          if (p.status === 'Critical' && newSpO2 > 94) newSpO2 = 94;

          return { ...p, hr: newHr, spO2: newSpO2 };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAddMonitor = (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.id) return;
    
    // Create initials
    const parts = newPatient.name.split(' ');
    const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length-1][0]}` : parts[0].substring(0, 2);

    const created = {
      id: newPatient.id,
      initials: initials.toUpperCase(),
      name: newPatient.name,
      ward: newPatient.ward || 'TBD',
      status: 'Monitoring',
      hr: 75,
      spO2: 98,
      bp: '120/80',
      temp: 37.0,
      minHr: 70,
      maxHr: 80,
      avgHr: 75,
      variability: 'Low'
    };

    setPatients([...patients, created]);
    setNewPatient({ name: '', id: '', ward: '' });
    setIsAddOpen(false);
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const criticalCount = patients.filter(p => p.status === 'Critical').length;

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-10">
      {/* Title Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vitals Monitoring</h2>
          <p className="text-slate-500 mt-1">Real-time patient health tracking and AI diagnostics engine</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter Ward
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00b289] text-white rounded-lg text-sm font-medium shadow-lg shadow-[#00b289]/20 hover:bg-[#00b289]/90 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Monitor
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {isAlertVisible && (
        <section className="bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/20 rounded-xl p-4 flex items-center gap-4 transition-all">
          <div className="bg-red-500 text-white size-10 rounded-full flex items-center justify-center animate-pulse shrink-0">
            <span className="material-symbols-outlined">emergency_home</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-red-900 dark:text-red-400 font-bold text-sm truncate">Critical Alert: Ward 402 - Bed 03</h4>
            <p className="text-red-700 dark:text-red-300/80 text-sm truncate">Tachycardia detected in Patient John Doe (ID: 8829). HR exceeded 140 BPM for {'>'}2 mins. Immediate review required.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => setIsAlertVisible(false)}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-red-600 border border-red-200 dark:border-red-900 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors"
            >
              Dismiss
            </button>
            <button 
              onClick={() => setSelectedPatientId('8829')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors"
            >
              View Patient
            </button>
          </div>
        </section>
      )}

      {/* Vitals Grid */}
      <section>
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          Monitored Patients
          {criticalCount > 0 && (
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black ml-2 uppercase">
              {criticalCount} CRITICAL
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {patients.map(patient => {
            const isCritical = patient.status === 'Critical';
            const isSelected = patient.id === selectedPatientId;
            const primaryColor = isCritical ? 'red-500' : '[#00b289]';
            const bgClass = isCritical ? 'bg-white border-2 border-red-500' : 'bg-white border border-slate-200';
            
            return (
              <div 
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={`${bgClass} rounded-2xl p-6 shadow-sm relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-offset-2 ring-slate-800 scale-[1.02]' : 'hover:scale-[1.01]'}`}
              >
                {isCritical && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-6">
                  <div className={`size-12 rounded-xl bg-${isCritical ? 'slate-100' : '[#00b289]/10'} flex items-center justify-center font-bold text-${isCritical ? 'slate-400' : '[#00b289]'}`}>
                    {patient.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{patient.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">ID: {patient.id} • Ward {patient.ward}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className={`text-[10px] font-bold text-${primaryColor} uppercase tracking-widest bg-${isCritical ? 'red-50' : '[#00b289]/10'} px-2 py-1 rounded-md`}>
                      {patient.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Heart Rate</span>
                      <span className={`material-symbols-outlined text-${primaryColor} text-sm`}>{isCritical ? 'trending_up' : 'favorite'}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-black text-${primaryColor} transition-all duration-300`}>{patient.hr}</span>
                      <span className="text-[10px] text-slate-400 font-bold">BPM</span>
                    </div>
                    <div className={`h-8 mt-2 w-full bg-${isCritical ? 'red-100' : '[#00b289]/10'} rounded overflow-hidden`}>
                      <div className={`h-full bg-${isCritical ? 'red-500/30' : '[#00b289]/30'} w-full transition-all duration-500`} style={{ clipPath: isCritical ? 'polygon(0 80%, 10% 20%, 20% 60%, 30% 10%, 40% 90%, 50% 30%, 60% 70%, 70% 20%, 80% 80%, 90% 10%, 100% 50%)' : 'polygon(0 40%, 10% 60%, 20% 40%, 30% 60%, 40% 40%, 50% 60%, 60% 40%, 70% 60%, 80% 40%, 90% 60%, 100% 40%)' }}></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SpO2</span>
                      <span className="material-symbols-outlined text-[#00b289] text-sm">horizontal_rule</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 transition-all duration-300">{patient.spO2}</span>
                      <span className="text-[10px] text-slate-400 font-bold">%</span>
                    </div>
                    <div className="h-8 mt-2 w-full bg-[#00b289]/10 rounded overflow-hidden">
                      <div className="h-full bg-[#00b289]/30 w-full" style={{ clipPath: 'polygon(0 50%, 10% 55%, 20% 50%, 30% 48%, 40% 52%, 50% 50%, 60% 45%, 70% 50%, 80% 55%, 90% 52%, 100% 50%)' }}></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BP</span>
                      <span className={`material-symbols-outlined text-${primaryColor} text-sm`}>{isCritical ? 'trending_up' : 'horizontal_rule'}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[20px] font-black text-slate-900 leading-none">{patient.bp}</span>
                      <span className="text-[10px] text-slate-400 font-bold ml-1">mmHg</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Temp</span>
                      <span className="material-symbols-outlined text-[#00b289] text-sm">horizontal_rule</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[20px] font-black text-slate-900 leading-none">{patient.temp}</span>
                      <span className="text-[10px] text-slate-400 font-bold ml-1">°C</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Chart and Device Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Detailed Vital Trends */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">Vital Trends Analysis</h3>
              <p className="text-sm text-slate-500">Selected: {selectedPatient.name} (Ward {selectedPatient.ward})</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {['1H', '6H', '24H', '7D'].map(range => (
                <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${timeRange === range ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart visual */}
          <div className="relative h-64 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-end px-4 py-8 overflow-hidden transition-all duration-300">
            {/* AI Prediction Zone */}
            <div className="absolute inset-y-0 right-0 w-1/4 bg-[#00b289]/5 border-l border-[#00b289]/20 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-[#00b289] rotate-90 whitespace-nowrap opacity-50 tracking-widest">AI PREDICTION ZONE</span>
            </div>
            
            <svg className={`w-full h-full text-${selectedPatient.status === 'Critical' ? 'red-500' : '[#00b289]'}`} preserveAspectRatio="none" viewBox="0 0 1000 200">
              <path 
                d={selectedPatient.status === 'Critical' 
                  ? "M0,150 Q50,140 100,160 T200,100 T300,120 T400,80 T500,90 T600,40 T700,70 T800,20 T900,40 L1000,30" 
                  : "M0,120 L100,125 L200,115 L300,120 L400,118 L500,122 L600,115 L700,128 L800,110 L900,125 L1000,120"} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3"
              />
              <path 
                d={selectedPatient.status === 'Critical' 
                  ? "M0,150 Q50,140 100,160 T200,100 T300,120 T400,80 T500,90 T600,40 T700,70 T800,20 T900,40 L1000,30 L1000,200 L0,200 Z"
                  : "M0,120 L100,125 L200,115 L300,120 L400,118 L500,122 L600,115 L700,128 L800,110 L900,125 L1000,120 L1000,200 L0,200 Z"} 
                fill="url(#gradient)" opacity="0.1"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }}></stop>
                  <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0 }}></stop>
                </linearGradient>
              </defs>
            </svg>
            
            {selectedPatient.status === 'Critical' && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold shadow-lg shadow-red-500/20 animate-pulse">
                {selectedPatient.maxHr} BPM CRITICAL SPIKE
              </div>
            )}
          </div>
          
          <div className="mt-6 grid grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Min HR</span>
              <span className="text-lg font-bold text-slate-900">{selectedPatient.minHr}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max HR</span>
              <span className={`text-lg font-bold text-${selectedPatient.status === 'Critical' ? 'red-500 relative inline-flex' : 'slate-900'}`}>
                {selectedPatient.maxHr}
                {selectedPatient.status === 'Critical' && <span className="absolute -top-1 -right-3 size-1.5 rounded-full bg-red-500 animate-pulse"></span>}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg HR</span>
              <span className="text-lg font-bold text-slate-900">{selectedPatient.avgHr}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Variability</span>
              <span className={`text-lg font-bold text-${selectedPatient.status === 'Critical' ? 'red-500' : '[#00b289]'}`}>{selectedPatient.variability}</span>
            </div>
          </div>
        </section>

        {/* Device Status */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Device Status</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
              <div className="size-10 bg-[#00b289]/10 text-[#00b289] flex items-center justify-center rounded-lg shrink-0">
                <span className="material-symbols-outlined">router</span>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold truncate">IoT Gateway 04</h5>
                <p className="text-[10px] text-slate-500 truncate">Ward {selectedPatient.ward} Network</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-black text-[#00b289] tracking-wider">ONLINE</span>
                <div className="h-1 w-12 bg-[#00b289] rounded-full mt-1.5 ml-auto opacity-70"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
              <div className="size-10 bg-[#00b289]/10 text-[#00b289] flex items-center justify-center rounded-lg shrink-0">
                <span className="material-symbols-outlined">ecg</span>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold truncate">ECG Monitor B-12</h5>
                <p className="text-[10px] text-slate-500 truncate">Connected: {selectedPatient.name}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-black text-[#00b289] tracking-wider">ACTIVE</span>
                <div className="h-1 w-12 bg-[#00b289] rounded-full mt-1.5 ml-auto opacity-70 flex">
                  <div className="h-full w-1/3 bg-white/50 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
              <div className="size-10 bg-orange-100 text-orange-500 flex items-center justify-center rounded-lg shrink-0">
                <span className="material-symbols-outlined">battery_3_bar</span>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold truncate">Pulse Ox P-09</h5>
                <p className="text-[10px] text-slate-500 truncate">Low Battery Alert</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-black text-orange-500 tracking-wider">12%</span>
                <div className="h-1 w-12 bg-slate-200 mt-1.5 ml-auto rounded-full overflow-hidden">
                  <div className="h-full w-[12%] bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
              <div className="size-10 bg-red-100 text-red-500 flex items-center justify-center rounded-lg shrink-0">
                <span className="material-symbols-outlined">link_off</span>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold truncate">BP Cuff S-22</h5>
                <p className="text-[10px] text-slate-500 truncate">Calibration Req.</p>
              </div>
              <div className="text-right shrink-0 opacity-50">
                <span className="text-[10px] font-black text-red-500 tracking-wider">ERROR</span>
                <div className="h-1 w-12 bg-red-500 rounded-full mt-1.5 ml-auto border border-red-700"></div>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
            Run Diagnostics
          </button>
        </section>
      </div>

      {/* Add Monitor Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Vitals Monitor</DialogTitle>
            <DialogDescription>
              Connect a new patient to the centralized tracking board.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMonitor}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input 
                  id="name" 
                  className="col-span-3" 
                  placeholder="e.g. Thomas Wayne"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id" className="text-right">Patient ID</Label>
                <Input 
                  id="id" 
                  className="col-span-3" 
                  placeholder="e.g. 5582"
                  value={newPatient.id}
                  onChange={(e) => setNewPatient({...newPatient, id: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ward" className="text-right">Ward</Label>
                <Input 
                  id="ward" 
                  className="col-span-3" 
                  placeholder="e.g. ER-02"
                  value={newPatient.ward}
                  onChange={(e) => setNewPatient({...newPatient, ward: e.target.value})}
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#00b289] text-white hover:bg-[#00b289]/90">Connect Monitor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
