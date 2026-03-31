/**
 * PatientMedicalSetup.jsx
 *
 * Multi-step first-time patient onboarding form.
 * Captures: Personal info → Vitals → Injury/History → Hospital Selection
 * Saves to Firestore: patients/{uid}/medicalProfile
 */
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { HOSPITAL_LIST } from '@/lib/hospitalConfig';

const STEPS = [
  { id: 1, label: 'Personal Info', icon: 'person' },
  { id: 2, label: 'Health Vitals', icon: 'monitor_heart' },
  { id: 3, label: 'Medical History', icon: 'history_edu' },
  { id: 4, label: 'Choose Hospital', icon: 'local_hospital' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientMedicalSetup({ onComplete, onSkip }) {
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Step 1 – Personal
    age: '',
    dateOfBirth: '',
    gender: '',
    phone: user?.phone || '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',

    // Step 2 – Vitals
    bloodGroup: '',
    heightCm: '',
    weightKg: '',
    bmi: '',
    allergies: '',
    chronicConditions: '',

    // Step 3 – History
    hasRecentInjury: false,
    injuryDescription: '',
    injuryDate: '',
    lastCheckupDate: '',
    checkupFacility: '',
    checkupNotes: '',
    currentMedications: '',
    smokingStatus: 'never',
    alcoholStatus: 'never',

    // Step 4 – Hospital
    primaryHospitalId: '',
  });

  const set = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate BMI
      if (field === 'heightCm' || field === 'weightKg') {
        const h = parseFloat(field === 'heightCm' ? value : prev.heightCm);
        const w = parseFloat(field === 'weightKg' ? value : prev.weightKg);
        if (h > 0 && w > 0) {
          updated.bmi = ((w / ((h / 100) ** 2)).toFixed(1));
        }
      }
      return updated;
    });
  };

  const bmiCategory = () => {
    const b = parseFloat(form.bmi);
    if (!b) return null;
    if (b < 18.5) return { label: 'Underweight', color: 'text-blue-600 bg-blue-50' };
    if (b < 25) return { label: 'Normal', color: 'text-green-600 bg-green-50' };
    if (b < 30) return { label: 'Overweight', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'Obese', color: 'text-red-600 bg-red-50' };
  };

  const canProceed = () => {
    if (step === 1) return form.age && form.gender && form.phone;
    if (step === 2) return form.bloodGroup && form.heightCm && form.weightKg;
    if (step === 3) return true;
    if (step === 4) return form.primaryHospitalId;
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const profile = {
        ...form,
        registeredAt: new Date().toISOString(),
        profileComplete: true,
        userId: user.id,
      };

      // Save to patients/{uid} in Firestore
      await setDoc(
        doc(db, 'patients', user.id),
        { medicalProfile: profile, primaryHospitalId: form.primaryHospitalId, user_id: user.id },
        { merge: true }
      );

      // Also update users/{uid} with hospitalId, phone, and profile complete flag
      await updateDoc(doc(db, 'users', user.id), {
        primaryHospitalId: form.primaryHospitalId,
        medicalProfileComplete: true,
        phone: form.phone,
      });

      onComplete(profile);
    } catch (e) {
      setError('Failed to save. Please try again.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">health_and_safety</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Update Your Health Profile</h1>
              <p className="text-white/80 text-sm mt-0.5">Welcome, {user?.full_name?.split(' ')[0] || 'User'}! Step {step} of {STEPS.length}</p>
            </div>
              <button 
                onClick={onSkip}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all"
              >
                Skip for now
              </button>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all"
              >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {STEPS.map(s => (
              <div key={s.id} className={`text-[10px] font-bold uppercase tracking-wide transition-opacity ${step === s.id ? 'opacity-100' : 'opacity-50'}`}>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {/* ─── STEP 1: Personal Info ─── */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Personal Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Age" icon="cake">
                  <input type="number" min="1" max="120" value={form.age} onChange={e => set('age', e.target.value)}
                    className={inputClass} placeholder="e.g. 28" />
                </Field>
                <Field label="Date of Birth" icon="calendar_today">
                  <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                    className={inputClass} />
                </Field>
              </div>

              <Field label="Gender" icon="person_4">
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputClass}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not">Prefer not to say</option>
                </select>
              </Field>

              <Field label="Phone Number" icon="phone">
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className={inputClass} placeholder="+91 XXXXX XXXXX" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Emergency Contact Name" icon="person_alert">
                  <input type="text" value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)}
                    className={inputClass} placeholder="Full name" />
                </Field>
                <Field label="Emergency Phone" icon="emergency">
                  <input type="tel" value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)}
                    className={inputClass} placeholder="+91 XXXXX XXXXX" />
                </Field>
              </div>

              <Field label="Home Address" icon="home">
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                  className={inputClass} placeholder="Street, City, State" />
              </Field>
            </div>
          )}

          {/* ─── STEP 2: Health Vitals ─── */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">monitor_heart</span>
                Health Vitals
              </h2>

              <Field label="Blood Group" icon="bloodtype">
                <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} className={inputClass}>
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Height (cm)" icon="height">
                  <input type="number" min="50" max="250" value={form.heightCm} onChange={e => set('heightCm', e.target.value)}
                    className={inputClass} placeholder="e.g. 170" />
                </Field>
                <Field label="Weight (kg)" icon="scale">
                  <input type="number" min="10" max="400" value={form.weightKg} onChange={e => set('weightKg', e.target.value)}
                    className={inputClass} placeholder="e.g. 65" />
                </Field>
              </div>

              {/* BMI Display */}
              {form.bmi && (
                <div className="rounded-xl border border-slate-100 p-4 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">BMI Score</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{form.bmi}</p>
                  </div>
                  {bmiCategory() && (
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${bmiCategory().color}`}>
                      {bmiCategory().label}
                    </span>
                  )}
                </div>
              )}

              <Field label="Known Allergies" icon="warning">
                <input type="text" value={form.allergies} onChange={e => set('allergies', e.target.value)}
                  className={inputClass} placeholder="e.g. Penicillin, Dust, Pollen (or None)" />
              </Field>

              <Field label="Chronic Conditions" icon="medical_information">
                <input type="text" value={form.chronicConditions} onChange={e => set('chronicConditions', e.target.value)}
                  className={inputClass} placeholder="e.g. Diabetes, Hypertension (or None)" />
              </Field>
            </div>
          )}

          {/* ─── STEP 3: Medical History ─── */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history_edu</span>
                Medical History & Reports
              </h2>

              {/* Recent Injury */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500">personal_injury</span>
                    Recent Injury Report
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.hasRecentInjury}
                      onChange={e => set('hasRecentInjury', e.target.checked)}
                      className="size-4 rounded accent-primary" />
                    <span className="text-sm text-slate-600">I have a recent injury</span>
                  </label>
                </div>

                {form.hasRecentInjury && (
                  <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                    <Field label="Injury Description" icon="description">
                      <textarea value={form.injuryDescription} onChange={e => set('injuryDescription', e.target.value)}
                        className={`${inputClass} min-h-[80px] resize-none`}
                        placeholder="Describe the injury, how it happened, symptoms..." />
                    </Field>
                    <Field label="Injury Date" icon="event">
                      <input type="date" value={form.injuryDate} onChange={e => set('injuryDate', e.target.value)}
                        className={inputClass} />
                    </Field>
                  </div>
                )}
              </div>

              {/* Last Medical Checkup */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                <p className="font-semibold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">lab_research</span>
                  Last Medical Checkup
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Checkup Date" icon="calendar_today">
                    <input type="date" value={form.lastCheckupDate} onChange={e => set('lastCheckupDate', e.target.value)}
                      className={inputClass} />
                  </Field>
                  <Field label="Facility/Hospital" icon="local_hospital">
                    <input type="text" value={form.checkupFacility} onChange={e => set('checkupFacility', e.target.value)}
                      className={inputClass} placeholder="Hospital / Clinic name" />
                  </Field>
                </div>
                <Field label="Checkup Notes / Findings" icon="notes">
                  <textarea value={form.checkupNotes} onChange={e => set('checkupNotes', e.target.value)}
                    className={`${inputClass} min-h-[80px] resize-none`}
                    placeholder="Doctor's observations, test results, diagnoses..." />
                </Field>
              </div>

              <Field label="Current Medications" icon="medication">
                <textarea value={form.currentMedications} onChange={e => set('currentMedications', e.target.value)}
                  className={`${inputClass} min-h-[60px] resize-none`}
                  placeholder="List medications with dosage, e.g. Metformin 500mg (or None)" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Smoking Status" icon="smoking_rooms">
                  <select value={form.smokingStatus} onChange={e => set('smokingStatus', e.target.value)} className={inputClass}>
                    <option value="never">Never smoked</option>
                    <option value="former">Former smoker</option>
                    <option value="occasional">Occasional</option>
                    <option value="regular">Regular smoker</option>
                  </select>
                </Field>
                <Field label="Alcohol Consumption" icon="local_bar">
                  <select value={form.alcoholStatus} onChange={e => set('alcoholStatus', e.target.value)} className={inputClass}>
                    <option value="never">Never</option>
                    <option value="occasional">Occasional</option>
                    <option value="moderate">Moderate</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Choose Hospital ─── */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_hospital</span>
                Choose Your Primary Hospital
              </h2>
              <p className="text-sm text-slate-500">Select the hospital near Bharat Mandapam where you'll receive primary care.</p>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {HOSPITAL_LIST.map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => set('primaryHospitalId', h.id)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 flex items-start gap-4
                      ${form.primaryHospitalId === h.id
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`size-12 rounded-xl flex items-center justify-center text-white shrink-0`}
                      style={{ background: h.theme.primary }}>
                      <span className="material-symbols-outlined">{h.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-900 text-sm leading-tight">{h.name}</p>
                        {form.primaryHospitalId === h.id && (
                          <span className="material-symbols-outlined text-primary text-xl shrink-0">check_circle</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{h.specialty}</p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                        {h.location} • {h.distance}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="px-6 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-30 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back
            </button>

            <div className="flex items-center gap-2">
              {STEPS.map(s => (
                <div key={s.id} className={`size-2 rounded-full transition-all ${step === s.id ? 'bg-primary w-6' : 'bg-slate-200'}`} />
              ))}
            </div>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-105 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={!canProceed() || saving}
                className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-105 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-base">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <span className="material-symbols-outlined">check_circle</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
        {icon && <span className="material-symbols-outlined text-[16px] text-slate-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 text-sm";
