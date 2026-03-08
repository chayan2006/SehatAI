import React, { useState } from 'react';
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

const initialBeds = [
  // General Ward (12 beds)
  { id: '101', ward: 'General Ward', status: 'Available', patient: '' },
  { id: '102', ward: 'General Ward', status: 'Occupied', patient: 'John Doe' },
  { id: '103', ward: 'General Ward', status: 'Occupied', patient: 'Sarah Smith' },
  { id: '104', ward: 'General Ward', status: 'Maintenance', patient: '' },
  { id: '105', ward: 'General Ward', status: 'Available', patient: '' },
  { id: '106', ward: 'General Ward', status: 'Occupied', patient: 'Mike Johnson' },
  { id: '107', ward: 'General Ward', status: 'Occupied', patient: 'Emma Brown' },
  { id: '108', ward: 'General Ward', status: 'Available', patient: '' },
  { id: '109', ward: 'General Ward', status: 'Available', patient: '' },
  { id: '110', ward: 'General Ward', status: 'Occupied', patient: 'Robert Chen' },
  { id: '111', ward: 'General Ward', status: 'Occupied', patient: 'Jane Lee' },
  { id: '112', ward: 'General Ward', status: 'Available', patient: '' },
  // ICU (6 beds)
  { id: 'ICU-1', ward: 'ICU', status: 'Occupied', patient: 'Critical Patient A' },
  { id: 'ICU-2', ward: 'ICU', status: 'Occupied', patient: 'Critical Patient B' },
  { id: 'ICU-3', ward: 'ICU', status: 'Available', patient: '' },
  { id: 'ICU-4', ward: 'ICU', status: 'Maintenance', patient: '' },
  { id: 'ICU-5', ward: 'ICU', status: 'Occupied', patient: 'Critical Patient C' },
  { id: 'ICU-6', ward: 'ICU', status: 'Available', patient: '' },
];

export default function AdminDashboard() {
  const [activeWard, setActiveWard] = useState('General Ward');
  const [beds, setBeds] = useState(initialBeds);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editPatient, setEditPatient] = useState('');

  // Derived Stats
  const totalBeds = beds.length + 82; // Baseline pad for realism
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length + 70;
  const availableBedsCount = beds.filter(b => b.status === 'Available').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const displayedBeds = beds.filter(b => b.ward === activeWard);

  const openManageBed = (bed) => {
    setSelectedBed(bed);
    setEditStatus(bed.status);
    setEditPatient(bed.patient);
    setIsManageOpen(true);
  };

  const handleSaveBed = (e) => {
    e.preventDefault();
    setBeds(beds.map(b => b.id === selectedBed.id ? {
      ...b,
      status: editStatus,
      patient: editStatus === 'Occupied' ? editPatient : ''
    } : b));
    setIsManageOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-background-light text-slate-900 font-display">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Hospital Overview</h2>
        <p className="text-slate-500">Real-time status of St. Jude Medical Center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-blue-500 p-2 bg-blue-50 rounded-lg">hotel</span>
            <span className="text-xs font-bold text-green-500">+2% vs last hour</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Hospital Occupancy</p>
          <h3 className="text-3xl font-bold">{occupancyRate}%</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-red-500 p-2 bg-red-50 rounded-lg">emergency_home</span>
            <span className="text-xs font-bold text-red-500">-1 vs last hour</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Active Emergencies</p>
          <h3 className="text-3xl font-bold">2</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">bed</span>
            <span className="text-xs font-bold text-slate-400">Critical: Low</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Bed Availability</p>
          <h3 className="text-3xl font-bold">{availableBedsCount} Free</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-teal-500 p-2 bg-teal-50 rounded-lg">event_available</span>
            <span className="text-xs font-bold text-green-500">+5% scheduled</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Today's Appointments</p>
          <h3 className="text-3xl font-bold">48</h3>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg border-l-8 border-red-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined animate-pulse">warning</span>
                <h4 className="text-xl font-bold uppercase tracking-tight">Active Emergency Alert</h4>
              </div>
              <span className="bg-red-700/50 px-3 py-1 rounded text-xs font-bold tracking-widest">CRITICAL</span>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-white/10 p-4 rounded-lg">
                <p className="text-xs uppercase font-bold opacity-75 mb-1">Alert Type</p>
                <p className="text-lg font-bold">CODE BLUE - Room 402</p>
              </div>
              <div className="flex-1 bg-white/10 p-4 rounded-lg">
                <p className="text-xs uppercase font-bold opacity-75 mb-1">Time Elapsed</p>
                <p className="text-lg font-bold">02:45 min</p>
              </div>
              <div className="flex-1 bg-white/10 p-4 rounded-lg border border-white/20">
                <p className="text-xs uppercase font-bold opacity-75 mb-1">Response Team</p>
                <p className="text-lg font-bold">Team Alpha Dispatched</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold">High-Risk Patient Vitals</h4>
              <a className="text-primary text-sm font-bold hover:underline cursor-pointer">View All Patients</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-red-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">JD</div>
                  <div>
                    <p className="text-sm font-bold">John Doe</p>
                    <p className="text-[10px] text-slate-500">ID: #88291 | Ward: ICU-B</p>
                  </div>
                  <div className="ml-auto">
                    <span className="size-2 block rounded-full bg-red-500"></span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400">Heart Rate</p>
                    <p className="text-sm font-bold text-red-600">102 bpm</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400">SpO2</p>
                    <p className="text-sm font-bold text-amber-500">94%</p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-slate-400 italic font-medium text-center">Status: Escalated Monitoring</p>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">JS</div>
                  <div>
                    <p className="text-sm font-bold">Jane Smith</p>
                    <p className="text-[10px] text-slate-500">ID: #88294 | Ward: Cardiac</p>
                  </div>
                  <div className="ml-auto">
                    <span className="size-2 block rounded-full bg-green-500"></span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400">Heart Rate</p>
                    <p className="text-sm font-bold">72 bpm</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400">SpO2</p>
                    <p className="text-sm font-bold text-primary">98%</p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-slate-400 italic font-medium text-center">Status: Stable</p>
              </div>

              <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">RC</div>
                  <div>
                    <p className="text-sm font-bold">Robert Chen</p>
                    <p className="text-[10px] text-slate-500">ID: #88302 | Ward: ER-2</p>
                  </div>
                  <div className="ml-auto">
                    <span className="size-2 block rounded-full bg-amber-500"></span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400">Heart Rate</p>
                    <p className="text-sm font-bold">88 bpm</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400">SpO2</p>
                    <p className="text-sm font-bold text-amber-500">91%</p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-slate-400 italic font-medium text-center">Status: Cautionary Alert</p>
              </div>
            </div>
          </div>

          {/* Interactive Ward Map */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold">Ward Occupancy Map</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveWard('ICU')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${activeWard === 'ICU' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  ICU
                </button>
                <button 
                  onClick={() => setActiveWard('General Ward')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${activeWard === 'General Ward' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  General Ward
                </button>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-4 md:grid-cols-6 gap-4">
              {displayedBeds.map((bed) => {
                let bgClass = "bg-slate-100";
                let icon = "bed";
                let textClass = "text-slate-400";
                let iconClass = "text-slate-300";
                
                if (bed.status === 'Occupied') {
                  bgClass = "bg-[#00b289]/20";
                  icon = "person";
                  textClass = "text-[#00b289]";
                  iconClass = "text-[#00b289]";
                } else if (bed.status === 'Maintenance') {
                  bgClass = "bg-red-100";
                  icon = "medical_services";
                  textClass = "text-red-500";
                  iconClass = "text-red-500";
                }

                return (
                  <div 
                    key={bed.id} 
                    onClick={() => openManageBed(bed)}
                    className={`aspect-square ${bgClass} rounded-lg flex flex-col items-center justify-center p-2 relative cursor-pointer hover:opacity-80 transition-opacity hover:scale-[1.02] transform duration-200`}
                  >
                    <span className={`material-symbols-outlined ${iconClass}`}>{icon}</span>
                    <span className={`text-[10px] font-bold mt-1 ${textClass}`}>{bed.id}</span>
                    {bed.status === 'Available' && <span className="absolute top-1 right-1 size-2 rounded-full bg-[#00b289]"></span>}
                  </div>
                )
              })}
            </div>
            
            <div className="px-8 pb-6 flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#00b289]"></span>
                Available
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#00b289]/20 border border-[#00b289]/50"></span>
                Occupied
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-400"></span>
                Maintenance
              </div>
            </div>
          </div>
        </div>

        {/* Dialog for Managing Beds */}
        <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Manage Bed {selectedBed?.id}</DialogTitle>
              <DialogDescription>
                Update the operational status of {selectedBed?.ward} bed {selectedBed?.id}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveBed}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Bed Status</Label>
                  <select 
                    required 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" 
                    value={editStatus} 
                    onChange={e => setEditStatus(e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                {editStatus === 'Occupied' && (
                  <div className="grid gap-2">
                    <Label htmlFor="patientName">Assigned Patient</Label>
                    <Input 
                      id="patientName" 
                      value={editPatient} 
                      onChange={e => setEditPatient(e.target.value)} 
                      placeholder="e.g. Eleanor Vance" 
                      required 
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsManageOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#00b289] text-white hover:bg-[#00b289]/90">Save Status</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h4 className="font-bold">On-Duty Staff</h4>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-200 bg-cover" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5XSs0dDJhFq-JkSlj_BkffdOgFpxvT7FwTjWaSeIN4BhpdetQapjV_hYU-X_TPo8sFQlAupOHfiH0kMyQ21ua_mRWCWis-NeWZYqSYUJAdrrQXcFqTondO7hEerI3CfqmU_dbrC9xqEpD2os9qDnRVXaOJImp_j2rHUfhqhWEILdO2eolZTBFoaoNKlCHOTPD_fqo4QnZ3krSZ35oz39edvnWQO1bts24Yyhsv3i7oZL2EZ1HLGvnVjrWEBTHO9iHB1GULkYE_7FS')"}}></div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Dr. Marcus Thorne</p>
                  <p className="text-xs text-slate-500">ER - Resident Physician</p>
                </div>
                <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">On Duty</span>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-200 bg-cover" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDUVB_X4CHYyH30KdMRITSAZRwOTziVtxh3ozDrrYXcp96qV8GEdUPNkdgA__S6Lhj7NxeghOTJUR3AaWUWH_KtfPEaZZ9L5nK1xQDQVO0HePUf1JdttV2Qe0kkBfmUxg51GDBpOtnd14guPhCAQjpMpflpCDQTWtqJZOvLmj9br3SkJ-6avDfqLKeJTE75P4PLaK-oTp-K1yEZiEWd8C7Zwi0D05QyeFxN3xlKWY5h5IGr5hXJAKn_L_LYWMFUQhp7M7sVwkSEXaQO')"}}></div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Elena Vance</p>
                  <p className="text-xs text-slate-500">ICU - Head Nurse</p>
                </div>
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">At Lunch</span>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-200 bg-cover" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7xAEg5oLuweutcm2KKNmdG8sK-SJf9inT48Y_Hd91p_O1nYx67n3yuau8QLXhDiXleZS0jJuF7TFWH9QKUC8SArOpWsrsOd5R0-938NrAzDc5vJ4bJyA0wM9JHFko7YmcxMOcgeFnxidM4KW02BBmpvYGw0450ZH5BIx_AQCQh29F2CJ91ySkJghw00mHnSa5jbtvc1Qorq05e-DslvWkxsUZrE0aQ6_HGU9ucp-lPq2BoRRvSyYmJMvHxqc2d5gqmrLUQVbbtfzm')"}}></div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Dr. James Wilson</p>
                  <p className="text-xs text-slate-500">Surgery - Consultant</p>
                </div>
                <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">On Duty</span>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-200 bg-cover" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPopkkVztIFB78wYgeYkI2tQOwt-m9sUvfQZaJYcxWPyohqd1C0Qh9l60u4ekEJERXs9bZfBIBgH4d529JG90DrmbSpLh9666xyjdxWB6XRlYdV5lrgu3W0FFv8ehayZ03qc6DlGbCb4VrOqG5DjFLHx4c8bxu35o9Vip4222pvDEXWoPXbexJdGWjtDJ7STEd1daHXbfKF3YtYxsZLOraH5EqID1bp4ioZoNrjfl3MoIiFTQZc983jIR-kx3LEmaTWdgoZt6ZIcDt')"}}></div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Maria Garcia</p>
                  <p className="text-xs text-slate-500">Admissions - Admin</p>
                </div>
                <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">On Duty</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="font-bold mb-6">Patient Admission Trends</h4>
            <div className="h-48 flex items-end justify-between gap-2">
              <div className="flex-1 bg-primary/20 rounded-t-lg h-[40%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">12</div>
              </div>
              <div className="flex-1 bg-primary/20 rounded-t-lg h-[60%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">18</div>
              </div>
              <div className="flex-1 bg-primary/20 rounded-t-lg h-[85%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">26</div>
              </div>
              <div className="flex-1 bg-primary rounded-t-lg h-[95%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">31</div>
              </div>
              <div className="flex-1 bg-primary/20 rounded-t-lg h-[50%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">15</div>
              </div>
              <div className="flex-1 bg-primary/20 rounded-t-lg h-[30%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">9</div>
              </div>
              <div className="flex-1 bg-primary/20 rounded-t-lg h-[45%] relative group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">14</div>
              </div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h4 className="text-sm font-bold text-blue-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">info</span>
              System Bulletin
            </h4>
            <ul className="space-y-3">
              <li className="text-xs text-blue-800 flex gap-2">
                <span className="font-bold">•</span>
                Backup power generator testing scheduled for Saturday 02:00 AM.
              </li>
              <li className="text-xs text-blue-800 flex gap-2">
                <span className="font-bold">•</span>
                New HIPAA compliance training modules available for all staff.
              </li>
              <li className="text-xs text-blue-800 flex gap-2">
                <span className="font-bold">•</span>
                ER capacity approaching peak due to regional accident.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
