import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { patientService, appointmentService } from '@/database';
import { format, parseISO } from 'date-fns';

export default function PatientDashboard({ user, onNavigate }) {
  const [showPhysical, setShowPhysical] = useState(true);
  const [vitals, setVitals] = useState({
    pulse: '--',
    bp: '--/--',
    steps: '0'
  });
  const [appointments, setAppointments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [loadingMeds, setLoadingMeds] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      try {
        setLoadingApps(true);
        // Fetch Vitals
        const vitalData = await patientService.getLatestVitals(user.id);
        if (vitalData && vitalData.length > 0) {
          const latest = vitalData[0];
          setVitals({
            pulse: latest.pulse || '--',
            bp: `${latest.systolic || '--'}/${latest.diastolic || '--'}`,
            steps: '8,432'
          });
        }

        // Fetch Appointments
        const appData = await appointmentService.getPatientAppointments(user.id);
        setAppointments(appData.slice(0, 2)); // Show top 2
        setLoadingApps(false);

        // Fetch Medical Records for Labs
        const records = await patientService.getMedicalRecords(user.id);
        const labs = records
          .filter(r => r.diagnosis)
          .map(r => ({
            name: r.diagnosis,
            facility: 'Sehat General Hospital',
            date: format(parseISO(r.visit_date), 'MMM dd, yyyy'),
            status: r.vital_signs ? 'Normal' : 'Reviewed',
            color: 'green',
            notes: r.ai_analysis_summary
          }))
          .slice(0, 3);
        setLabResults(labs);
        setLoadingLabs(false);

        // Fetch Medications from Prescriptions
        const meds = records
          .filter(r => r.prescription_data)
          .map(r => {
            const rx = typeof r.prescription_data === 'string' ? JSON.parse(r.prescription_data) : r.prescription_data;
            return {
              name: `${rx.medication} (${rx.dosage})`,
              time: rx.frequency,
              desc: 'As prescribed',
              done: false,
              upcoming: true
            };
          })
          .slice(0, 3);
        setMedications(meds);
        setLoadingMeds(false);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setLoadingApps(false);
        setLoadingLabs(false);
        setLoadingMeds(false);
      }
    };

    fetchData();
    
    // Subscribe to real-time updates
    const subscription = patientService.subscribeToVitals(user.id, (payload) => {
      console.log('Real-time vital update:', payload);
      const latest = payload.new;
      setVitals(prev => ({
        ...prev,
        pulse: latest.pulse || prev.pulse,
        bp: `${latest.systolic || '--'}/${latest.diastolic || '--'}`
      }));
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [user?.id]);

  const downloadLabResult = (testName, facility, date, status, notes) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(`Lab Result: ${testName}`, 14, 22);
    
    doc.setFontSize(14);
    doc.text(`Facility: ${facility}`, 14, 32);
    doc.text(`Date: ${date}`, 14, 40);
    doc.text(`Status: ${status}`, 14, 48);
    
    const details = notes ? [[notes.metric, notes.value, notes.range]] : [['Blood Cells', 'Normal', 'Standard']];

    autoTable(doc, {
      startY: 56,
      head: [['Metric', 'Value', 'Reference Range']],
      body: details,
      theme: 'grid',
      headStyles: { fillColor: [16, 183, 127] } // Primary color
    });
    
    doc.save(`${testName.replace(/\s+/g, '_')}_Result.pdf`);
  };

  return (
    <div className="p-8 space-y-8 medical-pulse-bg min-h-full">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Alex'}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your vitals are looking stable. 3 tasks need your attention today.</p>
        </div>
        <button onClick={() => onNavigate?.('appointments')} className="flex items-center gap-2 px-6 py-3 bg-[#00b289] text-white font-bold rounded-xl shadow-lg shadow-[#00b289]/20 hover:scale-105 transition-all cursor-pointer">
          <span className="material-symbols-outlined">add_circle</span>
          Book Medical Checkup
        </button>
      </section>

      {/* Health Pulse Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00b289]">pulse_alert</span>
            Health Pulse
          </h3>
          <button onClick={() => onNavigate?.('history')} className="text-xs font-black uppercase tracking-widest text-[#00b289] hover:underline cursor-pointer">View History</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">Heart Rate</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 text-red-600">-2%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{vitals.pulse}</span>
              <span className="text-slate-400 text-sm font-medium">BPM</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full w-[72%]"></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">Blood Pressure</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-600">Stable</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{vitals.bp}</span>
              <span className="text-slate-400 text-sm font-medium">mmHg</span>
            </div>
            <div className="mt-4 flex gap-1">
              <div className="h-1.5 flex-1 bg-[#00b289] rounded-full"></div>
              <div className="h-1.5 flex-1 bg-[#00b289] rounded-full"></div>
              <div className="h-1.5 flex-1 bg-slate-50 dark:bg-slate-800 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">Daily Activity</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-600">+15%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">8,432</span>
              <span className="text-slate-400 text-sm font-medium">steps</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-[84%]"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Appointments */}
          <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00b289]">calendar_today</span>
              Upcoming
            </h3>
            <button onClick={() => onNavigate?.('appointments')} className="text-xs font-black uppercase tracking-widest text-[#00b289] hover:underline cursor-pointer">View All</button>
          </div>
          <div className="space-y-4">
            {loadingApps ? (
              <div className="py-12 text-center text-slate-400 font-medium">Loading your appointments...</div>
            ) : appointments.length > 0 ? (
              appointments.map((app) => {
                const dateObj = parseISO(app.appointment_time);
                return (
                  <div key={app.id} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="size-12 bg-[#00b289]/10 rounded-xl flex flex-col items-center justify-center text-[#00b289]">
                        <span className="text-[10px] font-black uppercase leading-none">{format(dateObj, 'MMM')}</span>
                        <span className="text-xl font-black leading-none">{format(dateObj, 'dd')}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-slate-900 dark:text-white">{app.reason || 'Medical Consultation'}</p>
                        <p className="text-xs text-slate-500 font-medium">{app.hospitals?.hospital_name || 'Hospital'} • {format(dateObj, 'hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => onNavigate?.('appointments')} className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">Reschedule</button>
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(app.hospitals?.hospital_name || 'Hospital')}`, '_blank')} 
                        className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-[#00b289] bg-[#00b289]/10 rounded-xl hover:bg-[#00b289]/20 transition-colors cursor-pointer"
                      >
                        Directions
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-slate-500 font-medium text-sm mb-4">No upcoming appointments found</p>
                <button 
                  onClick={() => onNavigate?.('appointments')}
                  className="px-6 py-2.5 bg-[#00b289] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#00b289]/90 transition-all cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            )}
          </div>
          </section>

          {/* Recent Lab Results */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Lab Results</h3>
              <button onClick={() => onNavigate?.('history')} className="text-xs font-black uppercase tracking-widest text-[#00b289] hover:underline cursor-pointer">Full History</button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/50">
                      <th className="px-8 py-5">Test Name</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                    {loadingLabs ? (
                      <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-400">Loading lab records...</td></tr>
                    ) : labResults.length > 0 ? (
                      labResults.map((test, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-8 py-6">
                            <p className="font-bold text-slate-900 dark:text-white">{test.name}</p>
                            <p className="text-[11px] text-slate-400 font-black uppercase mt-0.5">{test.facility}</p>
                          </td>
                          <td className="px-8 py-6 text-slate-500 font-medium">{test.date}</td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-${test.color}-50 text-${test.color}-600 border border-${test.color}-100`}>
                              <span className={`size-1.5 rounded-full bg-${test.color}-500 animate-pulse`}></span> {test.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => downloadLabResult(test.name, test.facility, test.date, test.status)}
                              className="text-[#00b289] hover:bg-[#00b289]/10 p-2.5 rounded-xl transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined">download</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-400">No medical records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (1 span) */}
        <div className="lg:col-span-1 space-y-8">
          {/* Medication Schedule */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00b289]">event_note</span>
                Medication
              </h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {loadingMeds ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Loading medications...</div>
                ) : medications.length > 0 ? (
                  medications.map((med, i) => (
                    <div key={i} className="p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className={`size-10 shrink-0 rounded-xl flex items-center justify-center ${med.done ? 'bg-green-50 text-green-500' : med.missed ? 'bg-red-50 text-red-500' : 'bg-[#00b289]/10 text-[#00b289]'}`}>
                        <span className="material-symbols-outlined text-[20px]">{med.missed ? 'warning' : 'pill'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{med.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{med.desc} • {med.time}</p>
                      </div>
                      {med.done ? (
                        <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                      ) : med.upcoming ? (
                        <span className="text-[10px] font-black uppercase text-slate-300 py-1 px-2 border border-slate-100 rounded-lg">Soon</span>
                      ) : (
                        <button onClick={() => onNavigate?.('medications')} className="text-[10px] font-black uppercase text-[#00b289] hover:underline">Log</button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">No active medications prescribed.</div>
                )}
              </div>
            </div>
          </section>

          {/* Emergency Contact */}
          <section>
            <div className="bg-red-50 rounded-[28px] p-6 border border-red-100 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">emergency</span>
                Emergency Contact
              </h4>
              <div className="flex items-center gap-4">
                <div className="bg-red-600 text-white size-12 rounded-2xl flex items-center justify-center font-black text-base shadow-lg shadow-red-200">EM</div>
                <div>
                  <p className="text-base font-bold text-slate-900 leading-none">Elena Miller</p>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">call</span>
                    (555) 012-3456
                  </p>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-white text-red-600 font-black text-xs uppercase tracking-widest rounded-xl border border-red-100 hover:bg-red-100 transition-all shadow-sm">
                Call Guardian
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
