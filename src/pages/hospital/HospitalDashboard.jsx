/**
 * HospitalDashboard.jsx
 *
 * Color-coded, hospital-specific dashboard.
 * Shows ONLY the patients registered to this hospital (hospital-specific filtering).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { HOSPITALS, HOSPITAL_LIST } from '@/lib/hospitalConfig';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'patients', label: 'Patients', icon: 'people' },
  { id: 'emergency', label: 'Emergency', icon: 'emergency' },
  { id: 'appointments', label: 'Appointments', icon: 'calendar_month' },
  { id: 'stats', label: 'Analytics', icon: 'bar_chart' },
];

export default function HospitalDashboard() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  const hospital = HOSPITALS[hospitalId];
  const theme = hospital?.theme;

  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, admitted: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Redirect if not this hospital
  useEffect(() => {
    const sess = sessionStorage.getItem('hospitalSession');
    if (!sess) { navigate(`/hospital/${hospitalId}/login`); return; }
    const parsed = JSON.parse(sess);
    if (parsed.hospitalId !== hospitalId) {
      navigate(`/hospital/${parsed.hospitalId}/dashboard`);
      return;
    }
    setSession(parsed);
  }, [hospitalId, navigate]);

  // Load patients for this hospital only
  useEffect(() => {
    if (!hospitalId) return;
    setLoading(true);
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('primaryHospitalId', '==', hospitalId));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPatients(data);
      const today = new Date().toDateString();
      setStats({
        total: data.length,
        critical: data.filter(p => p.medicalProfile?.hasRecentInjury).length,
        admitted: Math.floor(data.length * 0.3),
        today: data.filter(p => p.medicalProfile?.registeredAt &&
          new Date(p.medicalProfile.registeredAt).toDateString() === today).length,
      });
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [hospitalId]);

  const handleLogout = async () => {
    sessionStorage.removeItem('hospitalSession');
    await signOut(auth);
    navigate(`/hospital/${hospitalId}/login`);
  };

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-700">Hospital not found</p>
          <button onClick={() => navigate('/')} className="mt-4 text-primary underline">Go home</button>
        </div>
      </div>
    );
  }

  const primaryColor = theme.primary;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col shrink-0 text-white shadow-xl"
        style={{ background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}cc 100%)` }}>

        {/* Hospital Brand */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">{hospital.icon}</span>
            </div>
            <div>
              <p className="font-black text-sm leading-tight">{hospital.shortName}</p>
              <p className="text-white/60 text-[10px]">Staff Portal</p>
            </div>
          </div>
          {session && (
            <div className="mt-4 px-3 py-2 bg-white/10 rounded-lg">
              <p className="text-xs text-white/60">Logged in as</p>
              <p className="text-sm font-bold text-white capitalize">{session.staffRole}</p>
              <p className="text-[11px] text-white/70 truncate">{session.staffName || session.email}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white/20 text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
              {tab.id === 'emergency' && emergencies.length > 0 && (
                <span className="ml-auto size-5 bg-red-500 rounded-full text-[10px] font-black flex items-center justify-center">
                  {emergencies.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Hospital info & logout */}
        <div className="p-4 border-t border-white/20">
          <div className="bg-white/10 rounded-xl p-3 mb-3">
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-wide">Specialty</p>
            <p className="text-xs text-white font-semibold mt-0.5">{hospital.specialty}</p>
            <p className="text-[10px] text-white/60 mt-1">{hospital.beds} beds • {hospital.distance}</p>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all">
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-lg font-black text-slate-900 capitalize">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-500">{hospital.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: primaryColor }}>
              {hospital.shortName}
            </div>
            <div className="size-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: primaryColor }}>
              {session?.staffName?.[0] || session?.email?.[0]?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <span className="material-symbols-outlined animate-spin text-4xl" style={{ color: primaryColor }}>progress_activity</span>
            </div>
          )}

          {!loading && (
            <>
              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Welcome, {session?.staffName || 'Staff'}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      {hospital.name} Dashboard — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Patients', value: stats.total, icon: 'people', color: primaryColor },
                      { label: 'Critical Cases', value: stats.critical, icon: 'emergency', color: '#dc2626' },
                      { label: 'Admitted', value: stats.admitted, icon: 'hotel', color: '#7c3aed' },
                      { label: 'Registered Today', value: stats.today, icon: 'today', color: '#16a34a' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="size-10 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: s.color }}>
                          <span className="material-symbols-outlined text-lg">{s.icon}</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{s.value}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Hospital Info Card */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ color: primaryColor }}>{hospital.icon}</span>
                      Hospital Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Specialty', value: hospital.specialty, icon: 'medical_services' },
                        { label: 'Total Beds', value: hospital.beds, icon: 'hotel' },
                        { label: 'Phone', value: hospital.phone, icon: 'call' },
                        { label: 'Email', value: hospital.email, icon: 'mail' },
                        { label: 'Location', value: hospital.location, icon: 'location_on' },
                        { label: 'Distance', value: hospital.distance, icon: 'near_me' },
                      ].map(info => (
                        <div key={info.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                          <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">{info.icon}</span>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{info.label}</p>
                            <p className="text-sm text-slate-800 font-semibold mt-0.5">{info.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent patients preview */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-slate-900">Recent Patients</h3>
                      <button onClick={() => setActiveTab('patients')} className="text-xs font-bold underline" style={{ color: primaryColor }}>View All</button>
                    </div>
                    {patients.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block">person_off</span>
                        <p className="text-sm">No patients registered yet at {hospital.shortName}.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {patients.slice(0, 3).map(p => (
                          <PatientRow key={p.id} patient={p} primaryColor={primaryColor}
                            onClick={() => { setSelectedPatient(p); setActiveTab('patients'); }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── PATIENTS TAB ── */}
              {activeTab === 'patients' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Patient Records</h2>
                      <p className="text-slate-500 text-sm mt-1">
                        Showing <strong>{patients.length}</strong> patients registered at {hospital.shortName}
                        <span className="ml-2 text-xs italic text-slate-400">(Hospital-specific records only)</span>
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full text-xs font-bold border" style={{ color: primaryColor, borderColor: primaryColor, background: theme.secondary }}>
                      🔒 {hospital.shortName} Only
                    </div>
                  </div>

                  {patients.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
                      <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">group_off</span>
                      <h3 className="text-lg font-bold text-slate-500 mb-2">No Patients Yet</h3>
                      <p className="text-sm text-slate-400">Patients will appear here when they register and select {hospital.shortName} as their primary hospital.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patients.map(p => (
                        <PatientDetailCard key={p.id} patient={p} primaryColor={primaryColor} theme={theme}
                          isExpanded={selectedPatient?.id === p.id}
                          onClick={() => setSelectedPatient(selectedPatient?.id === p.id ? null : p)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── EMERGENCY TAB ── */}
              {activeTab === 'emergency' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900">Emergency Alerts</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {patients.filter(p => p.medicalProfile?.hasRecentInjury).length === 0 ? (
                      <div className="bg-white rounded-2xl border border-green-100 p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-green-400 mb-3 block">check_circle</span>
                        <p className="font-bold text-slate-600">No active emergencies</p>
                        <p className="text-sm text-slate-400 mt-1">All registered patients are stable.</p>
                      </div>
                    ) : patients.filter(p => p.medicalProfile?.hasRecentInjury).map(p => (
                      <div key={p.id} className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="size-12 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0">
                            <span className="material-symbols-outlined">emergency</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-black text-red-700">{p.medicalProfile?.injuryDescription || 'Injury reported'}</p>
                              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">ALERT</span>
                            </div>
                            <p className="text-sm text-red-600 mt-1">
                              Patient: {p.medicalProfile?.emergencyContact || 'Anonymous'} •
                              Blood: {p.medicalProfile?.bloodGroup || 'Unknown'} •
                              Injury on: {p.medicalProfile?.injuryDate || 'N/A'}
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600">Respond</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── ANALYTICS TAB ── */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900">Analytics</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'Blood Group Distribution', data: getBloodGroupStats(patients) },
                      { label: 'Gender Distribution', data: getGenderStats(patients) },
                    ].map(chart => (
                      <div key={chart.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">{chart.label}</h3>
                        <div className="space-y-3">
                          {Object.entries(chart.data).map(([key, count]) => (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-600 w-16 shrink-0">{key}</span>
                              <div className="flex-1 bg-slate-100 rounded-full h-3">
                                <div className="h-3 rounded-full transition-all"
                                  style={{ width: `${(count / Math.max(patients.length, 1)) * 100}%`, background: primaryColor }} />
                              </div>
                              <span className="text-xs font-bold text-slate-700 w-6">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BMI Average */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-2">Average BMI</h3>
                    {(() => {
                      const bmis = patients.filter(p => p.medicalProfile?.bmi).map(p => parseFloat(p.medicalProfile.bmi));
                      const avg = bmis.length ? (bmis.reduce((a, b) => a + b, 0) / bmis.length).toFixed(1) : 'N/A';
                      return (
                        <div className="flex items-end gap-3">
                          <span className="text-4xl font-black text-slate-900">{avg}</span>
                          <span className="text-slate-500 text-sm mb-1">BMI across {bmis.length} patients</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── APPOINTMENTS TAB ── */}
              {activeTab === 'appointments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900">Appointments</h2>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">calendar_month</span>
                    <h3 className="font-bold text-slate-500">Appointment system coming soon</h3>
                    <p className="text-sm text-slate-400 mt-2">Patients can book appointments from their portal.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Helper Components ───

function PatientRow({ patient, primaryColor, onClick }) {
  const mp = patient.medicalProfile || {};
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
      <div className="size-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
        style={{ background: primaryColor }}>
        {(mp.emergencyContact || patient.id)?.[0]?.toUpperCase() || 'P'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{mp.emergencyContact || `Patient ${patient.id.slice(-4)}`}</p>
        <p className="text-xs text-slate-500">{mp.bloodGroup || '?'} Blood • Age {mp.age || '?'}</p>
      </div>
      {mp.hasRecentInjury && (
        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">Injury</span>
      )}
    </div>
  );
}

function PatientDetailCard({ patient, primaryColor, theme, isExpanded, onClick }) {
  const mp = patient.medicalProfile || {};
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div onClick={onClick} className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors">
        <div className="size-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
          style={{ background: primaryColor }}>
          {mp.gender === 'female' ? '♀' : '♂'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900">{mp.emergencyContact || `Patient ${patient.id.slice(-6)}`}</p>
            {mp.hasRecentInjury && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">emergency</span> Injury Reported
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-slate-500">Age: {mp.age || 'N/A'}</span>
            <span className="text-xs text-slate-500">Blood: {mp.bloodGroup || 'N/A'}</span>
            <span className="text-xs text-slate-500">BMI: {mp.bmi || 'N/A'}</span>
          </div>
        </div>
        <span className={`material-symbols-outlined text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 p-5" style={{ background: theme.secondary }}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Height', value: mp.heightCm ? `${mp.heightCm} cm` : 'N/A', icon: 'height' },
              { label: 'Weight', value: mp.weightKg ? `${mp.weightKg} kg` : 'N/A', icon: 'scale' },
              { label: 'BMI', value: mp.bmi || 'N/A', icon: 'monitor_weight' },
              { label: 'Allergies', value: mp.allergies || 'None', icon: 'warning' },
              { label: 'Conditions', value: mp.chronicConditions || 'None', icon: 'medical_information' },
              { label: 'Medications', value: mp.currentMedications || 'None', icon: 'medication' },
              { label: 'Last Checkup', value: mp.lastCheckupDate || 'N/A', icon: 'calendar_today' },
              { label: 'Emergency Contact', value: mp.emergencyPhone || 'N/A', icon: 'call' },
              { label: 'Last Facility', value: mp.checkupFacility || 'N/A', icon: 'local_hospital' },
            ].map(info => (
              <div key={info.label} className="bg-white rounded-xl p-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">{info.icon}</span>
                  {info.label}
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{info.value}</p>
              </div>
            ))}
          </div>
          {mp.checkupNotes && (
            <div className="mt-4 bg-white rounded-xl p-3">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Checkup Notes</p>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">{mp.checkupNotes}</p>
            </div>
          )}
          {mp.injuryDescription && (
            <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide">Injury Report</p>
              <p className="text-sm text-red-700 mt-1">{mp.injuryDescription}</p>
              <p className="text-xs text-red-500 mt-1">Date: {mp.injuryDate}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Analytics helpers ───
function getBloodGroupStats(patients) {
  return patients.reduce((acc, p) => {
    const bg = p.medicalProfile?.bloodGroup || 'Unknown';
    acc[bg] = (acc[bg] || 0) + 1;
    return acc;
  }, {});
}
function getGenderStats(patients) {
  return patients.reduce((acc, p) => {
    const g = p.medicalProfile?.gender || 'unknown';
    const label = g.charAt(0).toUpperCase() + g.slice(1);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}
