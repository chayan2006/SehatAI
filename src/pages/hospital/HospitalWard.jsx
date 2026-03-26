import React, { useState, useEffect } from 'react';
import { BedDouble, User, Activity, AlertTriangle, CheckCircle2, Clock, Loader2, ChevronRight, Building2, X } from 'lucide-react';
import { Toast, useToast } from '@/components/ui/Toast';
import { hospitalService, patientService, authService } from '@/database';

export default function HospitalWard({ hospitalId, primaryColor, theme }) {
  const { toasts, addToast, removeToast } = useToast();
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState(null); // { wardId, bedId }
  const [transferModal, setTransferModal] = useState(null);     // { fromBedId, patientId, wardName, bedNumber }
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    loadData();

    let subscription;
    const setupRealtime = async () => {
      if (!hospitalId) return;

      subscription = hospitalService.subscribeToBeds(hospitalId, (payload) => {
        if (payload.eventType === 'UPDATE') {
          loadData();
        }
      });
    };

    setupRealtime();
    return () => { if (subscription) subscription.unsubscribe(); };
  }, [hospitalId]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!hospitalId) return;

      const [wardData, patientData] = await Promise.all([
        hospitalService.getWards(hospitalId),
        patientService.getPatients(hospitalId)
      ]);

      setWards(wardData);
      setPatients(patientData);
    } catch (err) {
      console.error(err);
      addToast('Failed to sync ward data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Flatten all beds for stats
  const allBeds = wards.flatMap(w => w.beds || []);
  const stats = {
    total: allBeds.length,
    available: allBeds.filter(b => b.status === 'available').length,
    occupied: allBeds.filter(b => b.status === 'occupied').length,
    maintenance: allBeds.filter(b => b.status === 'maintenance').length
  };

  const handleBedClick = (wardId, bedId) => {
    setAssignmentModal({ wardId, bedId });
  };

  const assignPatientToBed = async (bedId, patientId, patientName) => {
    setIsProcessing(true);
    const lid = addToast(`Assigning Bed to ${patientName}...`, 'loading', 3000);
    setLastError(null);
    try {
      await hospitalService.updateBedStatus(bedId, 'occupied', patientId);
      removeToast(lid);
      await loadData();
      addToast(`✓ Bed assigned to ${patientName}.`, 'success');
      setAssignmentModal(null);
    } catch (err) {
      console.error('Assignment error:', err);
      const msg = err.message || JSON.stringify(err);
      setLastError(`ASSIGNMENT FAILED: ${msg}`);
      removeToast(lid);
      addToast('Assignment failed. Check permissions.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async (fromBedId, toBedId, patientId, patientName) => {
    setIsProcessing(true);
    const lid = addToast(`Transferring ${patientName}...`, 'loading', 3000);
    try {
      await hospitalService.updateBedStatus(fromBedId, 'available', null);
      await hospitalService.updateBedStatus(toBedId, 'occupied', patientId);
      
      removeToast(lid);
      await loadData();
      addToast(`✓ ${patientName} transferred successfully.`, 'success');
      setTransferModal(null);
    } catch (err) {
      removeToast(lid);
      addToast('Transfer failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const dischargePatient = async (wardId, bedId, patientName) => {
    setIsProcessing(true);
    const lid = addToast(`Processing discharge for ${patientName}...`, 'loading', 3000);
    try {
      await hospitalService.updateBedStatus(bedId, 'available', null);
      removeToast(lid);
      await loadData();
      addToast(`✓ ${patientName} discharged. Bed is now available.`, 'success');
    } catch (err) {
      removeToast(lid);
      addToast('Discharge failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickSetup = async () => {
    setIsProcessing(true);
    const lid = addToast('Configuring Hospital Infrastructure...', 'loading', 3000);
    try {
      await hospitalService.seedHospitalInfrastructure(hospitalId);
      await loadData();
      removeToast(lid);
      addToast('✓ Infrastructure created! ICU and General Wards are ready.', 'success');
      setLastError(null);
    } catch (err) {
      console.error(err);
      setLastError(err.message || 'Unknown database error');
      addToast('Setup failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4" style={{ color: primaryColor }} />
        <p className="font-bold text-sm tracking-tight">Synchronizing Ward Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Capacity', val: stats.total,       icon: 'bed',         color: primaryColor },
          { label: 'Available Beds', val: stats.available,   icon: 'check_circle', color: '#16a34a' },
          { label: 'Current Patients', val: stats.occupied,  icon: 'person',      color: '#ca8a04' },
          { label: 'Maintenance',   val: stats.maintenance,  icon: 'warning',     color: '#dc2626' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl flex items-center justify-center text-white" style={{ background: s.color }}>
                <span className="material-symbols-outlined text-lg">{s.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-2xl font-black mt-0.5 text-slate-900">{s.val}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wards Display */}
      {wards.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4 text-center">
          <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">domain</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">No Wards Configured</h3>
            <p className="text-sm text-slate-500 mb-6">Initialize your hospital with default ICU and General Medical wards.</p>
            
            <button 
              onClick={handleQuickSetup}
              disabled={isProcessing}
              className="px-8 py-3 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              style={{ background: primaryColor }}
            >
              Initialize Ward Infrastructure
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {wards.map(ward => (
            <div key={ward.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ color: primaryColor }}>hotel</span>
                  {ward.name}
                  <span className="text-[10px] text-slate-400 font-bold ml-2">({ward.beds?.length || 0} BEDS)</span>
                </h3>
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${
                  (ward.beds?.filter(b=>b.status==='occupied').length / (ward.beds?.length || 1)) > 0.8 
                  ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {Math.round((ward.beds?.filter(b=>b.status==='occupied').length / (ward.beds?.length || 1)) * 100)}% OCCUPANCY
                </span>
              </div>
              
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(ward.beds || []).map((bed) => {
                  if (bed.status === 'occupied') {
                    const patientData = bed.patients;
                    const p = Array.isArray(patientData) ? patientData[0] : patientData;
                    return (
                      <div key={bed.id} className="bg-white rounded-xl border border-slate-100 p-4 transition-all hover:bg-slate-50 group">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bed {bed.bed_number}</span>
                          <span className="h-2 w-2 rounded-full bg-[#ca8a04] animate-pulse"></span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="size-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                            {p?.full_name?.split(' ').map(n=>n[0]).join('') || 'P'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-900 truncate">{p?.full_name || 'Patient'}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Inpatient Care</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-50 flex gap-2">
                           <button 
                             disabled={isProcessing}
                             onClick={() => setTransferModal({ fromBedId: bed.id, patientId: p.id, wardName: ward.name, bedNumber: bed.bed_number, patientName: p.full_name })}
                             className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg transition-all"
                           >
                             Transfer
                           </button>
                           <button 
                             disabled={isProcessing}
                             onClick={() => dischargePatient(ward.id, bed.id, p?.full_name || 'Patient')}
                             className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase rounded-lg transition-all"
                           >
                             Discharge
                           </button>
                        </div>
                      </div>
                    );
                  }

                  if (bed.status === 'available') {
                    return (
                      <button 
                        key={bed.id}
                        disabled={isProcessing}
                        onClick={() => handleBedClick(ward.id, bed.id)} 
                        className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:bg-white hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <BedDouble className="h-8 w-8 text-slate-200 group-hover:text-slate-400 mb-2 transition-colors" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bed {bed.bed_number}</span>
                        <span className="text-[9px] font-black text-slate-400 mt-1 uppercase" style={{ color: primaryColor }}>Assign Patient</span>
                      </button>
                    );
                  }

                  return (
                    <div key={bed.id} className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center opacity-50 grayscale">
                      <AlertTriangle className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bed {bed.bed_number}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {assignmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Admit Patient</h3>
              <button onClick={() => setAssignmentModal(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium">Select a patient for immediate ward placement.</p>
              
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {patients.filter(p => !allBeds.some(b => b.patient_id === p.id)).map(p => (
                  <button 
                    key={p.id}
                    disabled={isProcessing}
                    onClick={() => assignPatientToBed(assignmentModal.bedId, p.id, p.full_name)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 text-left transition-all group disabled:opacity-50"
                  >
                    <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{p.full_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Patient ID: {p.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-900" />
                  </button>
                ))}
                
                {patients.filter(p => !allBeds.some(b => b.patient_id === p.id)).length === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-xs font-bold uppercase tracking-widest">No candidates available</p>
                    <p className="text-[10px] mt-1">All patients are currently admitted or none are registered.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Transfer Patient</h3>
              <button onClick={() => setTransferModal(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                 <div className="size-10 bg-white rounded-xl flex items-center justify-center text-xs font-bold text-slate-400">{transferModal.patientName[0]}</div>
                 <div>
                    <p className="text-xs font-black text-slate-900 uppercase">{transferModal.patientName}</p>
                    <p className="text-[10px] text-slate-500 font-bold">Currently at {transferModal.wardName} - Bed {transferModal.bedNumber}</p>
                 </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Destinations</p>
                {wards.map(w => (
                  <div key={w.id} className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 px-2">{w.name}</p>
                    {w.beds?.filter(b => b.status === 'available').map(bed => (
                      <button 
                        key={bed.id}
                        onClick={() => handleTransfer(transferModal.fromBedId, bed.id, transferModal.patientId, transferModal.patientName)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-left transition-all"
                      >
                         <BedDouble size={16} className="text-slate-300" />
                         <p className="text-sm font-black text-slate-900">Transfer to Bed {bed.bed_number}</p>
                         <ChevronRight size={14} className="ml-auto text-slate-300" />
                      </button>
                    ))}
                  </div>
                ))}
                
                {allBeds.filter(b => b.status === 'available').length === 0 && (
                   <div className="py-8 text-center text-slate-400">
                      <p className="text-xs font-black uppercase tracking-widest italic">Hospital at full capacity</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
