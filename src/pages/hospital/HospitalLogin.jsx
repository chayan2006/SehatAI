/**
 * HospitalLogin.jsx
 *
 * Hospital-specific login portal for the 5 hospitals near Bharat Mandapam.
 * Each hospital gets a unique color-coded UI based on their theme.
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { HOSPITALS, HOSPITAL_LIST } from '@/lib/hospitalConfig';

export default function HospitalLogin() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  const [selectedHospital, setSelectedHospital] = useState(hospitalId || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');  // signin | signup
  const [staffName, setStaffName] = useState('');
  const [role, setRole] = useState('nurse');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hospital = HOSPITALS[selectedHospital];
  const theme = hospital?.theme || { primary: '#10b77f', secondary: '#f0fdf4', gradient: 'from-primary to-primary/80', badge: 'bg-primary/10 text-primary' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHospital) { setError('Please select a hospital.'); return; }
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        // Sign in
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;
        const snap = await getDoc(doc(db, 'hospitalStaff', uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.hospitalId !== selectedHospital) {
            throw new Error(`This account belongs to ${HOSPITALS[data.hospitalId]?.name || 'another hospital'}.`);
          }
          // Store in session storage for dashboard
          sessionStorage.setItem('hospitalSession', JSON.stringify({
            uid, email, hospitalId: selectedHospital, staffName: data.staffName, staffRole: data.staffRole
          }));
          navigate(`/hospital/${selectedHospital}/dashboard`);
        } else {
          throw new Error('Hospital staff profile not found. Please register first.');
        }
      } else {
        // Register new staff
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;
        await setDoc(doc(db, 'hospitalStaff', uid), {
          uid, email, staffName, staffRole: role, hospitalId: selectedHospital,
          createdAt: new Date().toISOString()
        });
        sessionStorage.setItem('hospitalSession', JSON.stringify({
          uid, email, hospitalId: selectedHospital, staffName, staffRole: role
        }));
        navigate(`/hospital/${selectedHospital}/dashboard`);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: theme.secondary }}>
      <div className="flex min-h-screen">
        {/* Left: Branded Panel */}
        <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${theme.gradient} p-16 flex-col justify-between relative overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 size-64 rounded-full border-2 border-white" />
            <div className="absolute bottom-20 left-10 size-80 rounded-full border border-white" />
            <div className="absolute top-1/2 right-0 size-48 rounded-full border border-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="size-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">{hospital?.icon || 'local_hospital'}</span>
              </div>
              <div>
                <h1 className="text-white font-black text-2xl leading-tight">{hospital?.shortName || 'SehatAI'}</h1>
                <p className="text-white/70 text-sm">Hospital Portal</p>
              </div>
            </div>

            {hospital && (
              <div className="space-y-6">
                <h2 className="text-white text-4xl font-black leading-tight">{hospital.name}</h2>
                <p className="text-white/80 text-lg leading-relaxed">{hospital.tagline}</p>
                <div className="space-y-3 mt-8">
                  <div className="flex items-center gap-3 text-white/90">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-sm">{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <span className="material-symbols-outlined text-sm">medical_services</span>
                    <span className="text-sm">{hospital.specialty}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <span className="material-symbols-outlined text-sm">hotel</span>
                    <span className="text-sm">{hospital.beds} beds capacity</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <span className="material-symbols-outlined text-sm">near_me</span>
                    <span className="text-sm">{hospital.distance}</span>
                  </div>
                </div>
              </div>
            )}

            {!hospital && (
              <div>
                <h2 className="text-white text-4xl font-black">Hospital Staff Portal</h2>
                <p className="text-white/80 text-lg mt-4">Select your hospital and sign in securely.</p>
              </div>
            )}
          </div>

          <div className="relative z-10">
            {/* Mini hospital cards */}
            <div className="space-y-2">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Network Hospitals</p>
              {HOSPITAL_LIST.slice(0, 3).map(h => (
                <div key={h.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur ${selectedHospital === h.id ? 'bg-white/25' : ''}`}>
                  <span className="material-symbols-outlined text-white text-sm">{h.icon}</span>
                  <span className="text-white/80 text-xs font-medium">{h.shortName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo on mobile */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="size-10 rounded-xl flex items-center justify-center text-white" style={{ background: theme.primary }}>
                <span className="material-symbols-outlined">{hospital?.icon || 'local_hospital'}</span>
              </div>
              <span className="font-black text-xl text-slate-900">{hospital?.shortName || 'Hospital Portal'}</span>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-1">
                {mode === 'signin' ? 'Staff Login' : 'Staff Registration'}
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                {mode === 'signin' ? 'Access your hospital dashboard securely.' : 'Register as hospital staff member.'}
              </p>

              {error && (
                <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Hospital Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Select Hospital</label>
                  <select
                    value={selectedHospital}
                    onChange={e => { setSelectedHospital(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 text-sm"
                    style={{ focusRingColor: theme.primary }}
                    required
                  >
                    <option value="">— Select your hospital —</option>
                    {HOSPITAL_LIST.map(h => (
                      <option key={h.id} value={h.id}>{h.shortName}</option>
                    ))}
                  </select>
                </div>

                {/* Staff Name (register only) */}
                {mode === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                    <input type="text" value={staffName} onChange={e => setStaffName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 outline-none"
                      placeholder="Dr. / Nurse full name" required />
                  </div>
                )}

                {/* Role (register only) */}
                {mode === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Staff Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none">
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="admin">Admin Staff</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="lab_tech">Lab Technician</option>
                    </select>
                  </div>
                )}

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 outline-none"
                      placeholder="staff@hospital.in" required />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 outline-none"
                      placeholder="••••••••" required minLength={6} />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: theme.primary, boxShadow: `0 8px 24px ${theme.primary}30` }}
                >
                  {loading ? (
                    <><span className="animate-spin material-symbols-outlined text-base">progress_activity</span>
                      {mode === 'signin' ? 'Signing in...' : 'Registering...'}</>
                  ) : (
                    <><span>{mode === 'signin' ? 'Sign In' : 'Register'}</span>
                      <span className="material-symbols-outlined">{mode === 'signin' ? 'login' : 'person_add'}</span></>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {mode === 'signin' ? "New staff member? " : "Already registered? "}
                <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                  className="font-bold hover:underline" style={{ color: theme.primary }}>
                  {mode === 'signin' ? 'Register here' : 'Sign in'}
                </button>
              </p>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button onClick={() => navigate('/')}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to main portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
