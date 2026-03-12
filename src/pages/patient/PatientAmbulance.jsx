import React, { useState, useEffect, useRef } from 'react';

const CONTACTS_INIT = [
  { id: 1, name: 'Dr. Sarah Jenkins', role: 'Primary Care Physician', phone: '(555) 101-2020', avatar: 'SJ', color: 'bg-primary/10 text-primary' },
  { id: 2, name: 'Michael Vance', role: 'Son (Primary Caregiver)', phone: '(555) 987-6543', avatar: 'MV', color: 'bg-blue-100 text-blue-600' },
];

const LOG_INIT = [
  { id: 1, time: '08:12 AM', msg: 'Vitals check completed — all normal.', icon: 'check_circle', color: 'text-green-500' },
  { id: 2, time: '07:45 AM', msg: 'Morning activity detected. No alerts triggered.', icon: 'directions_run', color: 'text-primary' },
  { id: 3, time: '12:00 AM', msg: 'Nightly inactivity period started (Sleep mode).', icon: 'bedtime', color: 'text-slate-400' },
];

export default function PatientAmbulance({ onNavigate }) {
  // SOS states: idle | countdown | dispatching | enroute | cancelled
  const [sosState, setSosState] = useState('idle');
  const [countdown, setCountdown] = useState(5);
  const [eta, setEta] = useState(null);
  const countdownRef = useRef(null);

  const [monitoring, setMonitoring] = useState(true);
  const [contacts, setContacts] = useState(CONTACTS_INIT);
  const [log, setLog] = useState(LOG_INIT);

  const [callModal, setCallModal] = useState(null); // { name, phone }
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const callRef = useRef(null);

  const [showAddContact, setShowAddContact] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [newContact, setNewContact] = useState({ name: '', role: '', phone: '' });

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addLog = (msg, icon = 'info', color = 'text-primary') => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setLog(prev => [{ id: Date.now(), time, msg, icon, color }, ...prev]);
  };

  // SOS flow
  const triggerSOS = () => {
    setSosState('countdown');
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setSosState('dispatching');
          setTimeout(() => {
            setSosState('enroute');
            setEta(8);
            addLog('🚨 Ambulance dispatched to 123 Maple St, Springfield.', 'emergency', 'text-red-500');
            addLog('Emergency contacts notified via SMS.', 'sms', 'text-amber-500');
            contacts.forEach(c => showToast(`Notified: ${c.name}`, 'info'));
          }, 2200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(countdownRef.current);
    setSosState('cancelled');
    addLog('SOS cancelled by patient.', 'cancel', 'text-slate-400');
    showToast('SOS cancelled.', 'info');
    setTimeout(() => { setSosState('idle'); setEta(null); }, 3000);
  };

  const resetSOS = () => { setSosState('idle'); setEta(null); };

  // ETA countdown
  useEffect(() => {
    if (sosState !== 'enroute' || eta === null) return;
    if (eta <= 0) return;
    const t = setTimeout(() => setEta(prev => prev - 1), 60000);
    return () => clearTimeout(t);
  }, [sosState, eta]);

  // Call timer
  useEffect(() => {
    if (!callActive) return;
    callRef.current = setInterval(() => setCallSeconds(s => s + 1), 1000);
    return () => clearInterval(callRef.current);
  }, [callActive]);

  const startCall = (contact) => {
    setCallModal(contact);
    setCallActive(false);
    setCallSeconds(0);
    setTimeout(() => setCallActive(true), 1500); // simulate ring delay
    addLog(`Call initiated with ${contact.name}.`, 'call', 'text-blue-500');
  };

  const endCall = () => {
    clearInterval(callRef.current);
    const dur = callSeconds;
    addLog(`Call with ${callModal.name} ended (${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}).`, 'call_end', 'text-slate-500');
    setCallModal(null);
    setCallActive(false);
    setCallSeconds(0);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const saveContact = () => {
    if (!newContact.name || !newContact.phone) return;
    const colors = ['bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600'];
    const avatar = newContact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    if (editContact) {
      setContacts(prev => prev.map(c => c.id === editContact.id ? { ...c, ...newContact, avatar } : c));
      showToast('Contact updated.');
    } else {
      setContacts(prev => [...prev, { id: Date.now(), ...newContact, avatar, color: colors[prev.length % colors.length] }]);
      showToast('Emergency contact added.');
    }
    addLog(`Emergency contact ${editContact ? 'updated' : 'added'}: ${newContact.name}.`, 'person_add', 'text-primary');
    setShowAddContact(false);
    setEditContact(null);
    setNewContact({ name: '', role: '', phone: '' });
  };

  const deleteContact = (id) => {
    const c = contacts.find(x => x.id === id);
    setContacts(prev => prev.filter(x => x.id !== id));
    addLog(`Contact removed: ${c.name}.`, 'person_remove', 'text-red-400');
    showToast('Contact removed.', 'info');
  };

  const toggleMonitoring = () => {
    const next = !monitoring;
    setMonitoring(next);
    addLog(next ? 'AI monitoring re-enabled.' : 'AI monitoring paused by patient.', next ? 'check_circle' : 'pause_circle', next ? 'text-green-500' : 'text-amber-500');
    showToast(next ? 'AI Monitoring enabled.' : 'AI Monitoring paused.');
  };

  const sosColors = {
    idle: { ring: 'bg-red-600 hover:bg-red-700 shadow-red-300', pulse: true },
    countdown: { ring: 'bg-amber-500 hover:bg-amber-600 shadow-amber-300', pulse: false },
    dispatching: { ring: 'bg-primary hover:bg-primary/90 shadow-primary/40', pulse: false },
    enroute: { ring: 'bg-green-600 hover:bg-green-700 shadow-green-300', pulse: true },
    cancelled: { ring: 'bg-slate-400', pulse: false },
  };
  const sc = sosColors[sosState];

  return (
    <div className="flex-1 space-y-8 p-8 font-display bg-background-light dark:bg-background-dark min-h-full">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-200 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${toast.type === 'info' ? 'bg-blue-500' : 'bg-primary'}`}>
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>{toast.type === 'info' ? 'info' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}

      {/* Call Modal */}
      {callModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden">
            <div className={`py-10 flex flex-col items-center ${callActive ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <div className={`size-20 rounded-full flex items-center justify-center text-2xl font-black mb-4 ${contacts.find(c => c.name === callModal.name)?.color || 'bg-primary/10 text-primary'}`}>
                {callModal.name.split(' ').map(w => w[0]).join('').slice(0,2)}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{callModal.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{callModal.role}</p>
              {!callActive ? (
                <p className="text-primary font-bold mt-3 flex items-center gap-1.5 animate-pulse">
                  <span className="material-symbols-outlined text-base">call</span> Calling…
                </p>
              ) : (
                <p className="text-green-600 font-bold text-xl mt-3 font-mono">{fmt(callSeconds)}</p>
              )}
            </div>
            <div className="p-6 flex justify-center">
              <button onClick={endCall} className="size-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>call_end</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowAddContact(false); setEditContact(null); setNewContact({ name: '', role: '', phone: '' }); }}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-8 space-y-5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{editContact ? 'Edit Contact' : 'Add Emergency Contact'}</h2>
            <div className="space-y-4">
              {[['Name', 'name', 'Full name'], ['Role', 'role', 'e.g. Daughter, Cardiologist'], ['Phone', 'phone', '(555) 000-0000']].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{label}</label>
                  <input
                    type={key === 'phone' ? 'tel' : 'text'}
                    placeholder={ph}
                    value={newContact[key]}
                    onChange={e => setNewContact(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setShowAddContact(false); setEditContact(null); setNewContact({ name: '', role: '', phone: '' }); }} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={saveContact} className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-primary/90 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Emergency Services</h2>
        <p className="text-slate-500 mt-1">24/7 AI-powered emergency support and ambulance dispatch.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: SOS + Contacts */}
        <div className="lg:col-span-2 space-y-6">

          {/* SOS Card */}
          <div className={`rounded-2xl border p-8 text-center shadow-sm transition-all ${sosState === 'enroute' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50' : sosState === 'idle' || sosState === 'cancelled' ? 'bg-red-50/30 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30'}`}>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2 mb-2">
              <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: '"FILL" 1' }}>emergency</span>
              {sosState === 'idle' && 'Need Immediate Help?'}
              {sosState === 'countdown' && `Dispatching in ${countdown}…`}
              {sosState === 'dispatching' && 'Contacting Dispatch…'}
              {sosState === 'enroute' && `Ambulance En Route — ETA ~${eta} min`}
              {sosState === 'cancelled' && 'SOS Cancelled'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
              {sosState === 'idle' && 'Tap the button below to dispatch an ambulance to your current location immediately.'}
              {sosState === 'countdown' && 'Hold on — dispatching shortly. Tap Cancel to abort.'}
              {sosState === 'dispatching' && 'Connecting with the nearest available paramedic unit…'}
              {sosState === 'enroute' && 'Springfield EMS Unit #7 is on the way. Stay calm and remain at your location.'}
              {sosState === 'cancelled' && 'No ambulance was dispatched. You can re-trigger if needed.'}
            </p>

            <div className="flex flex-col items-center gap-5">
              {/* SOS Button */}
              {(sosState === 'idle' || sosState === 'countdown') && (
                <button
                  onClick={sosState === 'idle' ? triggerSOS : undefined}
                  className={`relative size-36 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all ${sc.ring} ${sosState === 'idle' ? 'hover:scale-105 cursor-pointer active:scale-95' : 'cursor-default'}`}
                >
                  {sc.pulse && <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-20"></span>}
                  {sosState === 'idle' ? (
                    <>
                      <span className="material-symbols-outlined text-4xl mb-1" style={{ fontVariationSettings: '"FILL" 1' }}>emergency_share</span>
                      <span className="text-xl tracking-widest">SOS</span>
                    </>
                  ) : (
                    <span className="text-6xl font-black">{countdown}</span>
                  )}
                </button>
              )}

              {sosState === 'dispatching' && (
                <div className="size-28 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                  <span className="material-symbols-outlined text-white text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>radio_button_checked</span>
                </div>
              )}

              {sosState === 'enroute' && (
                <div className="relative size-36 rounded-full bg-green-600 flex flex-col items-center justify-center shadow-2xl shadow-green-300">
                  <span className="absolute inset-0 rounded-full animate-ping bg-green-500 opacity-20"></span>
                  <span className="material-symbols-outlined text-white text-5xl mb-1" style={{ fontVariationSettings: '"FILL" 1' }}>ambulance</span>
                  <span className="text-white font-black text-sm">{eta} min</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                {(sosState === 'countdown' || sosState === 'dispatching' || sosState === 'enroute') && (
                  <button onClick={cancelSOS} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">
                    Cancel SOS
                  </button>
                )}
                {sosState === 'cancelled' && (
                  <button onClick={resetSOS} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all cursor-pointer">
                    Re-trigger SOS
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium mt-6 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              Your location: 123 Maple St, Springfield
              <a href="https://maps.google.com/?q=123+Maple+St,+Springfield" target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline font-bold">View Map</a>
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>contacts</span>
                  Emergency Contacts
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">Notified automatically during an emergency.</p>
              </div>
              <button
                onClick={() => { setEditContact(null); setNewContact({ name: '', role: '', phone: '' }); setShowAddContact(true); }}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add Contact
              </button>
            </div>
            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className={`size-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${c.color}`}>{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.role} · {c.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditContact(c); setNewContact({ name: c.name, role: c.role, phone: c.phone }); setShowAddContact(true); }}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button onClick={() => deleteContact(c.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                  <button onClick={() => startCall(c)} className="ml-2 px-4 py-2 text-xs font-bold text-primary border-2 border-primary/30 hover:bg-primary hover:text-white hover:border-primary rounded-lg transition-all cursor-pointer shrink-0">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">call</span>Call
                  </button>
                </div>
              ))}
              {contacts.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <span className="material-symbols-outlined text-4xl block mb-2">contacts</span>
                  <p className="text-sm font-medium">No emergency contacts added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Monitoring + Log */}
        <div className="space-y-6">
          {/* AI Monitoring Toggle */}
          <div className={`rounded-2xl border p-6 shadow-sm transition-all ${monitoring ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${monitoring ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>{monitoring ? 'shield_with_heart' : 'shield_off'}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">AI Monitoring</h3>
                <p className={`text-xs font-bold mt-0.5 ${monitoring ? 'text-green-600' : 'text-amber-600'}`}>
                  {monitoring ? '● Active' : '○ Paused'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {monitoring
                    ? 'Vitals are being monitored. Auto-dispatch triggers on critical events.'
                    : 'Auto-dispatch is disabled. Enable to restore emergency monitoring.'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleMonitoring}
              className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${monitoring ? 'bg-white dark:bg-slate-800 text-amber-600 border border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/10' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              {monitoring ? 'Pause Monitoring' : 'Enable Monitoring'}
            </button>
          </div>

          {/* Quick Numbers */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">dialpad</span>
              Quick Numbers
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Emergency (US)', num: '911', color: 'text-red-600 border-red-200 hover:bg-red-600' },
                { label: 'SehatAI Helpline', num: '1-800-SEHAT', color: 'text-primary border-primary/30 hover:bg-primary' },
                { label: 'Poison Control', num: '1-800-222-1222', color: 'text-amber-600 border-amber-200 hover:bg-amber-500' },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{n.label}</p>
                    <p className="text-xs text-slate-500">{n.num}</p>
                  </div>
                  <button
                    onClick={() => startCall({ name: n.label, role: n.label, phone: n.num, avatar: '📞' })}
                    className={`text-xs font-bold border px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white ${n.color}`}
                  >
                    <span className="material-symbols-outlined text-sm align-middle">call</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Log */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">history</span>
                AI Activity Log
              </h3>
              <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
              {log.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <span className={`material-symbols-outlined text-base mt-0.5 ${entry.color}`} style={{ fontVariationSettings: '"FILL" 1' }}>{entry.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">{entry.msg}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
