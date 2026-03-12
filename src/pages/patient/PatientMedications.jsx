import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const INITIAL_SCHEDULE = [
  { id: 1, time: '08:00', period: 'AM', name: 'Atorvastatin - 20mg', instructions: 'Take with food', icon: 'restaurant', extra: 'Oral Tablet', extraIcon: 'local_pharmacy', taken: false, disabled: false },
  { id: 2, time: '09:30', period: 'AM', name: 'Lisinopril - 10mg', instructions: 'Take with water', icon: 'water_drop', extra: null, taken: false, disabled: false },
  { id: 3, time: '08:00', period: 'PM', name: 'Metformin - 500mg', instructions: 'Refill required within 48 hours', icon: 'warning', extra: null, urgent: true, taken: false, disabled: true },
];

const HISTORY_ALL = [
  { name: 'Amoxicillin', type: 'Antibiotic', dose: '500 mg', dates: 'Oct 01 – Oct 10, 2023', doctor: 'Dr. Sarah Smith', status: 'COMPLETED' },
  { name: 'Ibuprofen', type: 'Pain Relief', dose: '400 mg', dates: 'Aug 15 – Aug 20, 2023', doctor: 'Dr. Alex Chen', status: 'DISCONTINUED' },
  { name: 'Claritin', type: 'Allergy', dose: '10 mg', dates: 'Apr 10 – Jun 30, 2023', doctor: 'Dr. Sarah Smith', status: 'COMPLETED' },
  { name: 'Azithromycin', type: 'Antibiotic', dose: '250 mg', dates: 'Jan 05 – Jan 10, 2023', doctor: 'Dr. James Chen', status: 'COMPLETED' },
  { name: 'Cetirizine', type: 'Allergy', dose: '10 mg', dates: 'Mar 01 – May 31, 2023', doctor: 'Dr. Amy Watson', status: 'COMPLETED' },
];

export default function PatientMedications({ onNavigate }) {
  const [showReminder, setShowReminder] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [refillSubmitted, setRefillSubmitted] = useState(false);
  const [snoozeActive, setSnoozeActive] = useState(false);
  const [historyShown, setHistoryShown] = useState(3);
  const [toast, setToast] = useState(null);

  const takenCount = schedule.filter(s => s.taken).length;
  const totalEnabled = schedule.filter(s => !s.disabled).length;
  const adherence = Math.round(((takenCount / Math.max(totalEnabled, 1)) * 6 + 94) / 2); // blend today into monthly

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const markTaken = (id) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, taken: true } : s));
    showToast('Medication logged successfully!');
  };

  const handleModalTaken = () => {
    markTaken(1); // Atorvastatin from modal
    setShowReminder(false);
  };

  const handleSnooze = () => {
    setSnoozeActive(true);
    setShowReminder(false);
    showToast('Reminder snoozed for 15 minutes.', 'info');
    setTimeout(() => { setSnoozeActive(false); setShowReminder(true); }, 15 * 60 * 1000); // real 15min
  };

  const handleRefillSubmit = () => {
    setRefillSubmitted(true);
    setTimeout(() => { setShowRefillModal(false); setRefillSubmitted(false); showToast('Refill request sent to your pharmacy!'); }, 1800);
  };

  const exportHistory = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Medication History – Alex Johnson', 14, 22);
    autoTable(doc, {
      startY: 32,
      head: [['Medication', 'Dosage', 'Dates', 'Doctor', 'Status']],
      body: HISTORY_ALL.map(h => [h.name, h.dose, h.dates, h.doctor, h.status]),
      theme: 'grid',
      headStyles: { fillColor: [16, 183, 127] },
    });
    doc.save('Medication_History.pdf');
    showToast('History exported as PDF!');
  };

  const PHARMACIES = [
    { name: 'Walgreens #1102', address: '123 Main St, Springfield', phone: '(555) 123-4567' },
    { name: 'CVS Pharmacy #445', address: '88 Oak Ave, Springfield', phone: '(555) 987-6543' },
    { name: 'Rite Aid #209', address: '210 Elm Blvd, Springfield', phone: '(555) 654-3210' },
  ];
  const [selectedPharmacy, setSelectedPharmacy] = useState(0);
  const [pendingPharmacy, setPendingPharmacy] = useState(0);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-200 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${toast.type === 'info' ? 'bg-blue-500' : 'bg-primary'}`}>
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>{toast.type === 'info' ? 'info' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}

      {/* Medication Reminder Modal */}
      {showReminder && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowReminder(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-primary/10 p-8 flex flex-col items-center text-center">
              <div className="bg-primary text-white size-16 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>pill</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Medication Reminder</h2>
              <p className="text-primary font-bold mt-1">Scheduled for 08:00 AM</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Atorvastatin - 20mg</h3>
                <div className="flex items-center justify-center gap-2 mt-2 text-slate-500">
                  <span className="material-symbols-outlined text-sm">restaurant</span>
                  <p className="text-sm font-medium">Take with food for better absorption.</p>
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={handleModalTaken} className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined">check_circle</span>
                  Mark as Taken
                </button>
                <button onClick={handleSnooze} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-xl">timer</span>
                  Remind Me in 15 Min
                </button>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={handleSnooze} className="flex-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold py-2 transition-colors cursor-pointer">Snooze</button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                  <button onClick={() => setShowReminder(false)} className="flex-1 text-slate-400 hover:text-red-500 text-sm font-bold py-2 transition-colors cursor-pointer">Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Refill Modal */}
      {showRefillModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRefillModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-8 space-y-6">
            {!refillSubmitted ? (
              <>
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>add_shopping_cart</span>
                  <h2 className="text-xl font-black mt-3 text-slate-900 dark:text-white">Request Refill</h2>
                  <p className="text-sm text-slate-500 mt-1">Select medications to refill</p>
                </div>
                <div className="space-y-3">
                  {['Atorvastatin – 20mg', 'Lisinopril – 10mg', 'Metformin – 500mg'].map((med) => (
                    <label key={med} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/40 cursor-pointer transition-colors">
                      <input type="checkbox" defaultChecked className="accent-primary size-4" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{med}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-2">
                  <button onClick={handleRefillSubmit} className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all cursor-pointer">Submit Request</button>
                  <button onClick={() => setShowRefillModal(false)} className="w-full text-slate-400 hover:text-slate-600 py-2 text-sm font-bold transition-colors cursor-pointer">Cancel</button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-500 text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Request Sent!</h3>
                <p className="text-sm text-slate-500 mt-2">Walgreens will have your refill ready in 24–48 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Pharmacy Modal */}
      {showPharmacyModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPharmacyModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-8 space-y-5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Change Pharmacy</h2>
            <div className="space-y-3">
              {PHARMACIES.map((ph, i) => (
                <label key={i} onClick={() => setPendingPharmacy(i)} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${pendingPharmacy === i ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                  <div className={`size-4 rounded-full border-2 mt-0.5 shrink-0 ${pendingPharmacy === i ? 'border-primary bg-primary' : 'border-slate-300'}`}></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{ph.name}</p>
                    <p className="text-xs text-slate-500">{ph.address}</p>
                    <p className="text-xs text-slate-500">{ph.phone}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowPharmacyModal(false)} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={() => { setSelectedPharmacy(pendingPharmacy); setShowPharmacyModal(false); showToast(`Pharmacy changed to ${PHARMACIES[pendingPharmacy].name}`); }} className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-primary/90 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 space-y-8 p-8 font-display bg-background-light dark:bg-background-dark min-h-full transition-all duration-300 ${(showReminder || showRefillModal || showPharmacyModal) ? 'opacity-50 pointer-events-none select-none' : ''}`}>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Medications</h2>
            <p className="text-slate-500 mt-1">Manage your active prescriptions and daily schedule.</p>
          </div>
          <button onClick={() => setShowRefillModal(true)} className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0 cursor-pointer">
            <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
            Request Refill
          </button>
        </div>

        {/* AI Banner */}
        {showBanner && (
          <div className="bg-white dark:bg-slate-900 border-l-4 border-primary rounded-xl p-4 shadow-sm flex items-start flex-col sm:flex-row gap-4">
            <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white">SehatAI Reminder</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                You have two doses scheduled for this morning. Remember to take <span className="font-semibold text-primary">Atorvastatin</span> with food for better absorption.
              </p>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors self-end sm:self-auto shrink-0 cursor-pointer">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Schedule + Prescriptions */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>schedule</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Schedule</h3>
                <span className="ml-auto text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                  {takenCount}/{totalEnabled} taken today
                </span>
              </div>

              <div className="space-y-4">
                {schedule.map((item) => (
                  <div key={item.id} className={`p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm transition-all ${item.taken ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50' : item.urgent ? 'bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 relative overflow-hidden' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md'}`}>
                    {item.urgent && !item.taken && (
                      <div className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-bl-lg">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
                      </div>
                    )}
                    <div className={`size-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${item.taken ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : item.urgent ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-primary/10 text-primary'}`}>
                      {item.taken ? (
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                      ) : (
                        <>
                          <span className="text-sm font-black leading-none tracking-tight">{item.time}</span>
                          <span className="text-[10px] uppercase font-bold mt-0.5">{item.period}</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <h4 className={`font-bold text-base ${item.taken ? 'text-green-700 dark:text-green-400 line-through opacity-70' : 'text-slate-800 dark:text-slate-100'}`}>{item.name}</h4>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1.5">
                        <span className={`text-xs font-medium flex items-center gap-1.5 ${item.urgent && !item.taken ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-500'}`}>
                          <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                          {item.instructions}
                        </span>
                        {item.extra && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">{item.extraIcon}</span>
                              {item.extra}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {item.taken ? (
                      <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-black rounded-xl shrink-0">✓ Taken</span>
                    ) : (
                      <button
                        disabled={item.disabled}
                        onClick={() => !item.disabled && markTaken(item.id)}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${item.disabled ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed' : 'border-2 border-primary text-primary hover:bg-primary hover:text-white cursor-pointer active:scale-95'}`}
                      >
                        Mark as Taken
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Current Prescriptions */}
            <section className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>medication_liquid</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Prescriptions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { name: 'Atorvastatin', type: 'Cholesterol', dose: '20 mg', freq: 'Once daily', started: 'Jan 12, 2024', refills: 2, refillColor: 'text-red-500', labelColor: 'text-red-500' },
                  { name: 'Lisinopril', type: 'Blood Pressure', dose: '10 mg', freq: 'Once daily', started: 'Mar 05, 2024', refills: 5, refillColor: 'text-primary', labelColor: 'text-primary' },
                ].map((rx) => (
                  <div key={rx.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-5 shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{rx.name}</h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">{rx.type}</p>
                      </div>
                      <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-md shrink-0 border border-primary/20">ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                      <div><p className="text-slate-400 font-semibold text-xs mb-0.5">Dosage</p><p className="font-bold text-slate-900 dark:text-slate-200 text-[13px]">{rx.dose}</p></div>
                      <div><p className="text-slate-400 font-semibold text-xs mb-0.5">Frequency</p><p className="font-bold text-slate-900 dark:text-slate-200 text-[13px]">{rx.freq}</p></div>
                      <div><p className="text-slate-400 font-semibold text-xs mb-0.5">Started</p><p className="font-bold text-slate-900 dark:text-slate-200 text-[13px]">{rx.started}</p></div>
                      <div>
                        <p className={`${rx.labelColor} font-semibold text-xs mb-0.5`}>Refills Left</p>
                        <p className={`font-black ${rx.refillColor} text-[13px]`}>{rx.refills}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowRefillModal(true)} className="w-full text-xs font-bold text-primary border border-primary/30 hover:bg-primary/5 py-2 rounded-lg transition-colors cursor-pointer">
                      Request Refill
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Adherence Widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute -top-4 -right-4 size-24 bg-primary/10 rounded-full blur-2xl"></div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">donut_large</span>
                Monthly Adherence
              </h3>
              <div className="flex items-center justify-center py-6">
                <div className="relative size-36 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path className="stroke-slate-100 dark:stroke-slate-800 stroke-3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" />
                    <path
                      className="stroke-primary stroke-3 transition-all duration-700 ease-out"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${adherence}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{adherence}%</span>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 text-center">{adherence >= 90 ? 'Excellent' : adherence >= 75 ? 'Good' : 'Needs Work'}</p>
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-center text-slate-500 font-medium">
                {takenCount === totalEnabled ? "All today's doses taken! Great job!" : `${totalEnabled - takenCount} dose(s) remaining today.`}
              </p>
            </div>

            {/* Pharmacy Info */}
            <div className="bg-green-50/50 dark:bg-slate-800/40 rounded-2xl p-6 border border-primary/20">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>local_pharmacy</span>
                Preferred Pharmacy
              </h4>
              <div className="space-y-1 mt-4">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{PHARMACIES[selectedPharmacy].name}</p>
                <p className="text-xs text-slate-500 font-medium">{PHARMACIES[selectedPharmacy].address}</p>
                <p className="text-xs text-slate-500 font-medium">{PHARMACIES[selectedPharmacy].phone}</p>
              </div>
              <button onClick={() => { setPendingPharmacy(selectedPharmacy); setShowPharmacyModal(true); }} className="mt-5 w-full text-[13px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5 py-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                Change Pharmacy <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Medication History Table */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm pt-1">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Medication History</h3>
            <button onClick={exportHistory} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-sm">download</span>
              Export as PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">Medication</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">Dosage</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 hidden sm:table-cell">Dates</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 hidden md:table-cell">Doctor</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {HISTORY_ALL.slice(0, historyShown).map((h) => (
                  <tr key={h.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[13px] text-slate-900 dark:text-white">{h.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{h.type}</p>
                      <div className="sm:hidden text-[11px] text-slate-500 mt-2 space-y-0.5">
                        <p>{h.dates}</p>
                        <p>{h.doctor}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300">{h.dose}</td>
                    <td className="px-6 py-4 text-[13px] font-medium text-slate-500 hidden sm:table-cell">{h.dates}</td>
                    <td className="px-6 py-4 text-[13px] font-medium text-slate-500 hidden md:table-cell">{h.doctor}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black tracking-wider px-2.5 py-1.5 rounded-md border block w-max ${h.status === 'DISCONTINUED' ? 'bg-red-50 dark:bg-red-900/10 text-red-500 border-red-100 dark:border-red-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/20 text-center border-t border-slate-100 dark:border-slate-800/50">
            {historyShown < HISTORY_ALL.length ? (
              <button onClick={() => setHistoryShown(HISTORY_ALL.length)} className="text-sm font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer">
                Load {HISTORY_ALL.length - historyShown} more records
              </button>
            ) : (
              <button onClick={() => setHistoryShown(3)} className="text-sm font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer">
                Show less
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
