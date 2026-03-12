import React, { useState } from 'react';
import PatientMedications from './PatientMedications';
import PatientAppointments from './PatientAppointments';
import PatientHistory from './PatientHistory';
import PatientAmbulance from './PatientAmbulance';
import PatientBookAmbulance from './PatientBookAmbulance';

import PatientBookingConfirmation from './PatientBookingConfirmation';
import Settings from '../Settings';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
export default function PatientDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('dashboard');

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard': return <DashboardView onNavigate={setActiveNav} />;
      case 'appointments': return <PatientAppointments onNavigate={setActiveNav} />;
      case 'confirmation': return <PatientBookingConfirmation onNavigate={setActiveNav} />;
      case 'health': return <PatientHistory onNavigate={setActiveNav} />;
      case 'medications': return <PatientMedications onNavigate={setActiveNav} />;
      case 'support': return <PatientAmbulance onNavigate={setActiveNav} />;
      case 'ambulance': return <PatientBookAmbulance onNavigate={setActiveNav} />;

      case 'settings': return <Settings onNavigate={setActiveNav} />;
      default: return <DashboardView onNavigate={setActiveNav} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display">
      {/* Sidebar Navigation */}
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">emergency_share</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SehatAI</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Clinical Light</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem id="dashboard" icon="dashboard" label="Dashboard" active={activeNav} onClick={setActiveNav} />
          <NavItem id="appointments" icon="calendar_month" label="Appointments" active={activeNav} onClick={setActiveNav} />
          <NavItem id="health" icon="favorite" label="My Health" active={activeNav} onClick={setActiveNav} />
          <NavItem id="medications" icon="pill" label="Medications" active={activeNav} onClick={setActiveNav} />
          <NavItem id="support"    icon="support_agent"  label="Support"       active={activeNav} onClick={setActiveNav} />
          <NavItem id="ambulance"  icon="ambulance"      label="Book Ambulance" active={activeNav} onClick={setActiveNav} />
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-primary/5 rounded-xl p-4">
            <p className="text-xs font-semibold text-primary mb-1">Premium Health Plan</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">24/7 AI-Agent monitoring active.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center flex-1">
            {activeNav === 'confirmation' ? (
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appointment Confirmation</h2>
            ) : (
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" placeholder="Search metrics, records, or agents..." type="text" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setActiveNav('settings')}>
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:border-slate-800 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer" onClick={onLogout}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Alex Johnson</p>
                <p className="text-[11px] text-slate-500">Patient ID: #4492-B</p>
              </div>
              <img alt="Profile picture of Alex Johnson" className="size-10 rounded-full object-cover border-2 border-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWciI4_x9AkulnZp4e-4C_Z_O4IaufaxCEYBs-g2HbwF8Kec5hX13HEdahW8kLrXTTY6B6FzaWga0S8miuGnyK3Eehr2mgR2BD2Fm8iN5hppqndm_6RTM-WQmZpHdeQj2bt_M8Y1gMQGlJvQXq8Ibg2s6CJIGJLLL1yuoMzublG-RnUmcEFcMi3jWnTkejN1s9hNdkY_TEdeaBH1bDSUNbf6wMblePLmtO9Gfry6B0WY0AfJEP5mCS5Tohw4AK43YTS2nCCbLeS_Q" />
            </div>
          </div>
        </header>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function NavItem({ id, icon, label, active, onClick }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive 
        ? 'bg-primary/10 text-primary font-semibold' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}


function DashboardView({ onNavigate }) {
  const [showPhysical, setShowPhysical] = useState(true);


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
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back, Alex</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your vitals are looking stable. 3 tasks need your attention today.</p>
        </div>
        <button onClick={() => onNavigate('appointments')} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-105 transition-all">
          <span className="material-symbols-outlined">add_circle</span>
          Book Medical Checkup
        </button>
      </section>

      {/* Health Pulse Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">pulse_alert</span>
            Health Pulse
          </h3>
          <button onClick={() => onNavigate('health')} className="text-xs font-semibold text-primary hover:underline">View History</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-slate-500">Heart Rate</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">-2%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">72</span>
              <span className="text-slate-400 text-sm font-medium">BPM</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[72%]"></div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-slate-500">Blood Pressure</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">Stable</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">120/80</span>
              <span className="text-slate-400 text-sm font-medium">mmHg</span>
            </div>
            <div className="mt-4 flex gap-1">
              <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
              <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
              <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-slate-500">Daily Activity</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">+15%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">8,432</span>
              <span className="text-slate-400 text-sm font-medium">steps</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[84%]"></div>
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
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              Upcoming
            </h3>
            <button onClick={() => onNavigate('appointments')} className="text-xs font-semibold text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {showPhysical && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 transform origin-top">
                <div className="flex items-center gap-4 mb-3">
                  <div className="size-10 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
                    <span className="text-[10px] font-bold uppercase leading-none">Oct</span>
                    <span className="text-lg font-black leading-none">24</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Annual Physical</p>
                    <p className="text-xs text-slate-500">Dr. Sarah Mitchell • 10:30 AM</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onNavigate('appointments')} className="flex-1 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 transition-colors">Reschedule</button>
                  <button 
                    onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=Saint+Mary%27s+Specialist+Hospital', '_blank')} 
                    className="flex-1 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
                  >
                    Directions
                  </button>
                  <button onClick={() => setShowPhysical(false)} className="px-2 py-1.5 text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm opacity-75">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500">
                  <span className="text-[10px] font-bold uppercase leading-none">Nov</span>
                  <span className="text-lg font-black leading-none">12</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Lab Results Review</p>
                  <p className="text-xs text-slate-500">Video Consultation • 02:00 PM</p>
                </div>
              </div>
            </div>
          </div>
          </section>


          {/* Recent Lab Results */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Recent Lab Results
              </h3>
              <button onClick={() => onNavigate('health')} className="text-xs font-semibold text-primary hover:underline">Full History</button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/50">
                      <th className="px-6 py-4">Test Name</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">Complete Blood Count</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Quest Diagnostics</p>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-600 dark:text-slate-400">Oct 12, 2023</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Normal
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => downloadLabResult('Complete Blood Count', 'Quest Diagnostics', 'Oct 12, 2023', 'Normal', {metric:'RBC Count', value:'4.5 M/µL', range:'4.1-5.1 M/µL'})} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">download</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">Lipid Profile</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">General Medical Labs</p>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-600 dark:text-slate-400">Sep 28, 2023</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Normal
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => downloadLabResult('Lipid Profile', 'General Medical Labs', 'Sep 28, 2023', 'Normal', {metric:'LDL Cholesterol', value:'95 mg/dL', range:'<100 mg/dL'})} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">download</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">Glucose (HbA1c)</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Sehat Healthcare</p>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-600 dark:text-slate-400">Sep 15, 2023</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-100 dark:border-orange-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Borderline
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => downloadLabResult('Glucose (HbA1c)', 'Sehat Healthcare', 'Sep 15, 2023', 'Borderline', {metric:'A1c Level', value:'5.9%', range:'<5.7%'})} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">download</span>
                        </button>
                      </td>
                    </tr>
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
              <span className="material-symbols-outlined text-primary">event_note</span>
              Medication
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="size-10 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">pill</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Lisinopril (10mg)</p>
                  <p className="text-xs text-slate-500">Take with water • 08:00 AM</p>
                </div>
                <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
              </div>
              <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="size-10 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">pill</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Atorvastatin (20mg)</p>
                  <p className="text-xs text-slate-500">After dinner • 08:00 PM</p>
                </div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-full text-slate-500 uppercase">Upcoming</div>
              </div>
              <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="size-10 shrink-0 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-500">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Multivitamin</p>
                  <p className="text-xs text-slate-500">Anytime • Missed Yesterday</p>
                </div>
                <button onClick={() => onNavigate('medications')} className="text-xs font-bold text-primary hover:underline">Log Now</button>
              </div>
            </div>
          </div>
          </section>

          {/* Emergency Contact */}
          <section>
            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl p-5 border border-red-100 dark:border-red-900/30">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">emergency</span>
                Emergency Contact
              </h4>
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white size-10 rounded-full flex items-center justify-center font-bold text-sm">EM</div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Elena Miller</p>
                  <p className="text-xs text-slate-500 mt-1">Spouse • (555) 012-3456</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
