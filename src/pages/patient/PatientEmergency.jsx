/**
 * PatientEmergency.jsx
 *
 * SOS / Emergency page for patients.
 * Features one-tap trigger + AI agent dispatch with live status panel.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dispatchEmergency, PRIORITY } from '@/lib/emergencyAgent';
import { getUserLocation } from '@/lib/locationService';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const SYMPTOM_PRESETS = [
  { label: 'Chest Pain', icon: 'cardiology', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Severe Bleeding', icon: 'personal_injury', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Difficulty Breathing', icon: 'pulmonology', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Head Injury', icon: 'neurology', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Fracture / Broken Bone', icon: 'orthopedics', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'Severe Burns', icon: 'local_fire_department', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'Stroke Symptoms', icon: 'brain', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Unconscious / Fainting', icon: 'person_off', color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function PatientEmergency({ onNavigate }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState('idle'); // idle | dispatching | dispatched
  const [symptoms, setSymptoms] = useState('');
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [location, setLocation] = useState(null);
  const [incident, setIncident] = useState(null);
  const [medicalProfile, setMedicalProfile] = useState(null);
  const [agentStep, setAgentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Load location
    getUserLocation().then(setLocation);
    // Load medical profile
    if (user?.id) {
      getDoc(doc(db, 'patients', user.id)).then(snap => {
        if (snap.exists()) setMedicalProfile(snap.data().medicalProfile || null);
      });
    }
  }, [user]);

  // Agent step animation
  useEffect(() => {
    if (phase === 'dispatching') {
      const timer = setInterval(() => setAgentStep(s => s + 1), 700);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Elapsed time counter
  useEffect(() => {
    if (phase === 'dispatched') {
      const timer = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const togglePreset = (label) => {
    setSelectedPresets(prev =>
      prev.includes(label) ? prev.filter(p => p !== label) : [...prev, label]
    );
    const full = selectedPresets.includes(label)
      ? symptoms.replace(label + ', ', '').replace(label, '')
      : symptoms ? `${symptoms}, ${label}` : label;
    setSymptoms(full);
  };

  const triggerEmergency = async () => {
    if (!symptoms.trim()) return;
    setPhase('dispatching');
    setAgentStep(0);

    // Simulate agent thinking delay
    await new Promise(r => setTimeout(r, 3500));

    const result = await dispatchEmergency({
      symptoms,
      userLocation: location,
      medicalProfile,
      primaryHospitalId: user?.primaryHospitalId,
    });

    setIncident(result);
    setPhase('dispatched');
    setElapsed(0);
  };

  const formatElapsed = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="size-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
            <span className="material-symbols-outlined text-white text-3xl">emergency</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Emergency SOS</h1>
            <p className="text-slate-500 text-sm mt-0.5">AI-powered instant emergency response system</p>
          </div>
        </div>

        {/* Location status */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${location?.isFallback ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <span className="material-symbols-outlined text-base">location_on</span>
          <span>{location?.label || 'Detecting location...'}</span>
          {location?.isFallback && <span className="text-xs opacity-70">(Prototype default)</span>}
        </div>

        {/* ── IDLE PHASE ── */}
        {phase === 'idle' && (
          <>
            {/* SOS Button */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-900/30 p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500 mb-6 font-medium">Tap the button below to trigger emergency dispatch</p>
              <button
                onClick={() => symptoms && triggerEmergency()}
                disabled={!symptoms.trim()}
                className="size-40 mx-auto rounded-full bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-white flex flex-col items-center justify-center shadow-2xl shadow-red-500/30 transition-all duration-200 group"
              >
                <span className="material-symbols-outlined text-5xl group-hover:scale-110 transition-transform">emergency</span>
                <span className="font-black text-lg mt-1">SOS</span>
              </button>
              {!symptoms.trim() && (
                <p className="text-xs text-red-400 mt-4 font-medium">Please describe symptoms below first</p>
              )}
            </div>

            {/* Symptom Presets */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">symptomatic</span>
                Quick Symptom Selection
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {SYMPTOM_PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => togglePreset(p.label)}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all ${selectedPresets.includes(p.label) ? p.color + ' border-2 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom Text Input */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Describe Emergency
              </h3>
              <textarea
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Describe symptoms in detail: what happened, where it hurts, how long ago..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-none min-h-[100px] placeholder:text-slate-400"
              />
            </div>

            {/* Medical Profile Summary */}
            {medicalProfile && (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-500 mt-0.5">medical_information</span>
                <div>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Medical Profile Detected</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Blood: {medicalProfile.bloodGroup} • {medicalProfile.chronicConditions || 'No chronic conditions'} •
                    Height: {medicalProfile.heightCm}cm, Weight: {medicalProfile.weightKg}kg
                  </p>
                  <p className="text-[11px] text-blue-500 mt-0.5">This data will be shared with emergency responders.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── DISPATCHING PHASE ── */}
        {phase === 'dispatching' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-orange-200 dark:border-orange-900/30 p-8 text-center shadow-sm">
            <div className="size-20 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-orange-500 text-4xl animate-spin">progress_activity</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Emergency Agent Active</h2>
            <p className="text-slate-500 text-sm mb-8">AI is analyzing your situation and dispatching help...</p>

            <div className="text-left space-y-3 max-w-md mx-auto">
              {[
                'Analyzing symptoms and medical history...',
                'Assessing emergency priority level...',
                'Booking nearest ambulance service...',
                'Routing to optimal hospital...',
                'Notifying on-call doctors...',
              ].map((action, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i < agentStep ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${i < agentStep ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {i < agentStep ? (
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${i < agentStep ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DISPATCHED PHASE ── */}
        {phase === 'dispatched' && incident && (
          <>
            {/* Priority Banner */}
            <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${incident.priority.color}`}>
              <span className="material-symbols-outlined text-3xl">{incident.priority.icon}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Priority Level</p>
                <p className="text-2xl font-black">{incident.priority.level}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs font-bold opacity-70">Elapsed</p>
                <p className="text-xl font-black font-mono">{formatElapsed(elapsed)}</p>
              </div>
            </div>

            {/* Incident ID */}
            <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono">INCIDENT ID</p>
                <p className="text-white font-black font-mono text-lg">{incident.incidentId}</p>
              </div>
              <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">DISPATCHED</span>
            </div>

            {/* Ambulance Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
                <span className="material-symbols-outlined text-red-500">ambulance</span>
                Ambulance Dispatched
              </h3>
              <div className="flex items-start gap-4">
                <div className="size-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-red-500">emergency_share</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white">{incident.ambulance.name}</p>
                  <p className="text-sm text-slate-500">{incident.ambulance.type}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm font-bold text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      ETA: {incident.ambulance.eta}
                    </span>
                    <a href={`tel:${incident.ambulance.phone}`}
                      className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                      <span className="material-symbols-outlined text-base">call</span>
                      {incident.ambulance.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Hospital */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
                <span className="material-symbols-outlined text-primary">local_hospital</span>
                Routing to Hospital
              </h3>
              <div className="rounded-xl p-4 flex items-center gap-4"
                style={{ background: incident.targetHospital?.theme?.secondary || '#f0fdf4', border: `1px solid ${incident.targetHospital?.theme?.primary}30` }}>
                <div className="size-12 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ background: incident.targetHospital?.theme?.primary || '#10b77f' }}>
                  <span className="material-symbols-outlined">{incident.targetHospital?.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">{incident.targetHospital?.name}</p>
                  <p className="text-sm text-slate-500">{incident.targetHospital?.specialty}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{incident.targetHospital?.address}</p>
                </div>
              </div>
            </div>

            {/* Assigned Doctors */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">stethoscope</span>
                Doctors On Standby
              </h3>
              <div className="space-y-3">
                {incident.assignedDoctors.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {doc.name.split(' ').pop()[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.specialty}</p>
                    </div>
                    <a href={`tel:${doc.phone}`}
                      className="size-9 bg-primary text-white rounded-lg flex items-center justify-center hover:brightness-110 transition-all">
                      <span className="material-symbols-outlined text-sm">call</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* First Aid Instructions */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6">
              <h3 className="font-black text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined">medical_services</span>
                While You Wait – First Aid
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">{incident.instructions}</p>
            </div>

            {/* Agent Action Log */}
            <div className="bg-slate-900 rounded-2xl p-6">
              <h3 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-widest">AI Agent Action Log</h3>
              <div className="space-y-2">
                {incident.agentActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px] font-mono whitespace-nowrap mt-0.5">
                      {new Date(action.time).toLocaleTimeString()}
                    </span>
                    <span className="text-slate-300 text-sm">{action.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel / New Emergency */}
            <div className="flex gap-4">
              <button onClick={() => { setPhase('idle'); setIncident(null); setSymptoms(''); setSelectedPresets([]); }}
                className="flex-1 py-3 border-2 border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors">
                Cancel Emergency
              </button>
              <button onClick={() => onNavigate('dashboard')}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:brightness-105 transition-all">
                Return to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
