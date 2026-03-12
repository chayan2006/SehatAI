import React, { useState } from 'react';

const URGENCY_LEVELS = [
  {
    id: 'high', label: 'High Urgency', icon: 'priority_high',
    color: 'border-red-400 bg-red-50 dark:bg-red-900/10',
    activeColor: 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-400',
    iconBg: 'bg-red-100 text-red-600',
    desc: 'Heart attack, trauma, heavy bleeding, loss of consciousness.'
  },
  {
    id: 'moderate', label: 'Moderate Urgency', icon: 'warning',
    color: 'border-amber-300 bg-amber-50 dark:bg-amber-900/10',
    activeColor: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-400',
    iconBg: 'bg-amber-100 text-amber-600',
    desc: 'Fractures, high fever, intense pain but non-life threatening.'
  },
  {
    id: 'low', label: 'Low Urgency', icon: 'info',
    color: 'border-blue-200 bg-blue-50 dark:bg-blue-900/10',
    activeColor: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400',
    iconBg: 'bg-blue-100 text-blue-600',
    desc: 'Minor injuries, non-urgent transport, wellness check.'
  },
];

const FACILITIES = [
  { name: 'Saint Jude Medical Center', dist: '1.2 mi', x: 130, y: 100 },
  { name: 'Springfield General',        dist: '2.4 mi', x: 320, y: 155 },
  { name: 'Central City Hospital',       dist: '3.1 mi', x: 430, y: 85  },
];

export default function PatientBookAmbulance({ onNavigate }) {
  const [urgency, setUrgency]           = useState('high');
  const [pickup, setPickup]             = useState('123 Maple St, Springfield');
  const [destination, setDestination]   = useState('Saint Jude Medical Center');
  const [notes, setNotes]               = useState('');
  const [dispState, setDispState]       = useState('idle');
  const [eta, setEta]                   = useState(8);
  const [dispLog, setDispLog]           = useState([]);
  const [ambProgress, setAmbProgress]   = useState(0);
  const [callActive, setCallActive]     = useState(false);
  const [callSecs, setCallSecs]         = useState(0);
  const [shareToast, setShareToast]     = useState(false);
  const etaRef  = React.useRef(null);
  const ambRef  = React.useRef(null);
  const callRef = React.useRef(null);

  const addLog = (msg, icon, color) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setDispLog(prev => [{ id: Date.now(), msg, icon, color, time }, ...prev]);
  };

  const requestAmbulance = () => {
    setDispState('confirming');
    setTimeout(() => {
      setDispState('dispatching');
      addLog('Dispatch request received.', 'task_alt', 'text-primary');
      setTimeout(() => {
        setDispState('enroute');
        setEta(8);
        setAmbProgress(0);
        addLog('Unit NY-4402 en route — ETA 8 minutes.', 'emergency', 'text-red-500');
        addLog('Emergency contacts notified via SMS.', 'sms', 'text-amber-500');
        etaRef.current = setInterval(() => {
          setEta(prev => {
            if (prev <= 1) {
              clearInterval(etaRef.current);
              clearInterval(ambRef.current);
              setAmbProgress(100);
              setDispState('arrived');
              addLog('Ambulance arrived at your location.', 'check_circle', 'text-green-500');
              return 0;
            }
            return prev - 1;
          });
        }, 30000);
        ambRef.current = setInterval(() => {
          setAmbProgress(prev => {
            if (prev >= 95) { clearInterval(ambRef.current); return 95; }
            return prev + 2;
          });
        }, 1500);
      }, 2000);
    }, 1200);
  };

  const cancelDispatch = () => {
    clearInterval(etaRef.current);
    clearInterval(ambRef.current);
    clearInterval(callRef.current);
    setDispState('idle');
    setEta(8);
    setAmbProgress(0);
    setCallActive(false);
    setCallSecs(0);
    addLog('Dispatch cancelled by patient.', 'cancel', 'text-slate-400');
  };

  const resetForm = () => {
    setDispState('idle'); setEta(8); setDispLog([]);
    setAmbProgress(0); setCallActive(false); setCallSecs(0);
  };

  const handleCall = () => {
    if (callActive) {
      clearInterval(callRef.current);
      setCallActive(false); setCallSecs(0);
      addLog('Call with paramedic ended.', 'call_end', 'text-slate-400');
    } else {
      setCallActive(true); setCallSecs(0);
      callRef.current = setInterval(() => setCallSecs(s => s + 1), 1000);
      addLog('Connected to lead paramedic Dr. Marcus Vance.', 'call', 'text-green-500');
    }
  };

  const handleShare = () => {
    setShareToast(true);
    addLog('Live location shared with dispatch unit.', 'share_location', 'text-blue-500');
    setTimeout(() => setShareToast(false), 3000);
  };

  const fmtSecs = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const ambX = 80 + (ambProgress / 100) * 170;
  const ambY = 55 + (ambProgress / 100) * 95;
  const isTracking = dispState === 'enroute' || dispState === 'arrived';

  return (
    <div className="flex-1 space-y-8 p-8 font-display bg-background-light dark:bg-background-dark min-h-full">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isTracking ? 'Ambulance Tracking' : 'Book an Ambulance'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isTracking
              ? 'Your ambulance is en route. Stay calm and follow the instructions below.'
              : 'Request emergency medical transport to the nearest facility.'}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 border rounded-full flex items-center gap-1.5 ${
          dispState === 'enroute'  ? 'bg-red-50 text-red-600 border-red-200' :
          dispState === 'arrived'  ? 'bg-green-50 text-green-600 border-green-200' :
          'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200'
        }`}>
          <span className={`size-2 rounded-full ${
            dispState === 'arrived' ? 'bg-green-500' : 'bg-red-500 animate-pulse'
          }`}></span>
          {dispState === 'enroute' ? 'LIVE TRACKING' : dispState === 'arrived' ? 'ARRIVED' : '24/7 Available'}
        </span>
      </div>

      {/* ── TRACKING VIEW ── */}
      {isTracking && (
        <div className="space-y-6">
          {shareToast && (
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>share_location</span>
              Live location shared with dispatch unit #NY-4402.
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* LEFT: Map + Paramedic */}
            <div className="xl:col-span-3 space-y-4">

              {/* Map Card */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                <div className="flex items-stretch">
                  <div className="flex-1 px-5 py-4 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        Ambulance is {(2 - (ambProgress / 100) * 0.8).toFixed(1)} miles away
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 ml-4">Moving fast. Traffic is currently light on your route.</p>
                  </div>
                  {dispState === 'enroute' ? (
                    <div className="bg-red-600 text-white px-7 flex flex-col items-center justify-center shrink-0">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Arriving in</p>
                      <p className="text-5xl font-black leading-none">{String(eta).padStart(2, '0')}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Minutes</p>
                    </div>
                  ) : (
                    <div className="bg-green-600 text-white px-7 flex flex-col items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                      <p className="text-xs font-black uppercase">Arrived</p>
                    </div>
                  )}
                </div>
                <div className="relative bg-[#c8ddc7] h-56 overflow-hidden">
                  <svg viewBox="0 0 560 224" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                    <rect width="560" height="224" fill="#c8ddc7" />
                    <ellipse cx="280" cy="112" rx="260" ry="95" fill="#d4e8d0" opacity="0.6" />
                    <line x1="0" y1="85"  x2="560" y2="155" stroke="#b0a090" strokeWidth="9" opacity="0.5" />
                    <line x1="0" y1="155" x2="560" y2="85"  stroke="#b0a090" strokeWidth="6" opacity="0.3" />
                    <line x1="200" y1="0" x2="260" y2="224"  stroke="#b0a090" strokeWidth="7" opacity="0.4" />
                    <line x1="80" y1="50" x2="250" y2="170" stroke="#10b97f" strokeWidth="3" strokeDasharray="8 4" opacity="0.7" />
                    <circle cx="80"  cy="50"  r="12" fill="#10b97f" opacity="0.9" />
                    <text   x="80"   y="55"   textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">+</text>
                    {/* Moving ambulance */}
                    <g transform={`translate(${ambX - 14}, ${ambY - 10})`}>
                      <rect width="28" height="18" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                      <rect x="2" y="2" width="9" height="9" rx="1.5" fill="#ef4444" />
                      <text x="14" y="13" fontSize="9" fill="#ef4444" fontWeight="bold" textAnchor="middle">+</text>
                      <line x1="13" y1="11" x2="13" y2="6"   stroke="#ef4444" strokeWidth="1.5" />
                      <line x1="11" y1="8.5" x2="16" y2="8.5" stroke="#ef4444" strokeWidth="1.5" />
                      <circle cx="7"  cy="18" r="3" fill="#334155" />
                      <circle cx="21" cy="18" r="3" fill="#334155" />
                      {dispState === 'enroute' && (
                        <>
                          <circle cx="14" cy="-6" r="5" fill="#ef4444" opacity="0.2">
                            <animate attributeName="r"       values="5;10;5"     dur="1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.3;0;0.3"  dur="1s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="14" cy="-6" r="3" fill="#ef4444" />
                        </>
                      )}
                    </g>
                    {/* Patient pin */}
                    <g>
                      <circle cx="250" cy="170" r="16" fill="#ef4444" opacity="0.15">
                        <animate attributeName="r"       values="10;22;10"    dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.2;0;0.2"   dur="2.5s" repeatCount="indefinite" />
                      </circle>
                      <circle  cx="250" cy="170" r="8"  fill="#ef4444" />
                      <polygon points="250,155 244,170 256,170" fill="#ef4444" opacity="0.7" />
                    </g>
                    <rect x="172" y="178" width="120" height="28" rx="5" fill="white" opacity="0.95" />
                    <text x="177" y="188" fontSize="7" fill="#94a3b8" fontWeight="bold">PICKUP POINT</text>
                    <text x="177" y="200" fontSize="9" fill="#1e293b" fontWeight="bold">123 Maple St, Springfield</text>
                  </svg>
                </div>
              </div>

              {/* Paramedic + Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
                  <div className="size-14 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white shrink-0 relative">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>person</span>
                    <span className="absolute -bottom-1 -right-1 size-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[11px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Paramedic</p>
                    <p className="font-black text-slate-900 dark:text-white text-base">Dr. Marcus Vance</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold text-slate-500">UNIT #NY-4402</span>
                      <span className="text-yellow-500 text-xs font-black flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span> 4.9
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={handleCall} className={`flex items-center justify-center gap-2 font-black py-3.5 px-5 rounded-xl transition-all cursor-pointer active:scale-95 ${callActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'}`}>
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>{callActive ? 'call_end' : 'call'}</span>
                    {callActive ? `End Call (${fmtSecs(callSecs)})` : 'Call Paramedic'}
                  </button>
                  <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-black py-3.5 px-5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>share_location</span>
                    Share Location
                  </button>
                </div>
              </div>

              <div className="text-center">
                {dispState === 'enroute'
                  ? <button onClick={cancelDispatch} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer">Cancel Dispatch</button>
                  : <button onClick={resetForm} className="text-xs font-bold text-primary hover:underline cursor-pointer">← Back to booking</button>
                }
              </div>
            </div>

            {/* RIGHT: Protocol + Timeline + Tips + Vitals */}
            <div className="xl:col-span-2 space-y-4">
              {/* Emergency Protocol */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Emergency Protocol</p>
                <div className="space-y-3">
                  {[
                    { n: '1. Stay Calm',    d: 'Ensure the entrance is clear for the paramedic team to enter quickly.' },
                    { n: '2. Prepare ID',   d: "Have the patient's ID and current medications ready for review." },
                    { n: '3. Unlock Door',  d: 'Unlock the main entrance so paramedics can enter without delay.' },
                  ].map((p, i) => (
                    <div key={i} className={`p-3.5 rounded-xl border ${i === 0 ? 'border-primary/40 bg-primary/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'}`}>
                      <p className={`text-sm font-bold ${i === 0 ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>{p.n}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{p.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-Time Timeline */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Real-Time Timeline</p>
                <div className="space-y-0">
                  {[
                    { label: 'Dispatch Confirmed', sub: `${new Date(Date.now()-8*60000).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})} • Emergency Center`, done: true },
                    { label: 'Unit En Route',       sub: `${new Date(Date.now()-6*60000).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})} • 2.8 miles away`,   done: true },
                    { label: 'Entering Your Area',  sub: 'Live • 1.2 miles away', live: true },
                    { label: 'Arrival & Triage',    sub: `Est. ${new Date(Date.now()+eta*60000).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}`, future: true },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`size-6 rounded-full flex items-center justify-center shrink-0 z-10 ${step.done ? 'bg-primary' : step.live ? 'border-2 border-primary bg-white dark:bg-slate-900' : 'border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
                          {step.done && <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check</span>}
                          {step.live && <span className="size-2.5 bg-primary rounded-full animate-pulse block"></span>}
                        </div>
                        {i < 3 && <div className={`w-0.5 h-8 ${step.done ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>}
                      </div>
                      <div className="pb-4 pt-0.5">
                        <p className={`text-sm font-bold ${step.future ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{step.label}</p>
                        <p className={`text-xs mt-0.5 ${step.live ? 'text-primary font-bold' : 'text-slate-500'}`}>{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Helpful Tips While Waiting */}
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Helpful Tips While Waiting</p>
                </div>
                <div className="space-y-3">
                  {[
                    'Stay calm and breathe deeply to maintain a clear mind.',
                    'Clear the path and unlock doors for paramedics to enter quickly.',
                    'Prepare your ID, insurance, and list of current medications.',
                    'Do not eat or drink anything until paramedics assess you.',
                    'Keep your phone nearby and charged to receive updates.',
                    'If possible, have someone wait outside to guide the ambulance.',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-white text-[11px]" style={{ fontVariationSettings: '"FILL" 1' }}>check</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-snug">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Vitals */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: '"FILL" 1' }}>monitor_heart</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Vitals</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Monitoring Active</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Heart Rate', val: '82', unit: 'BPM', color: 'text-red-500' },
                    { label: 'SpO2',       val: '98', unit: '%',   color: 'text-primary'  },
                  ].map(v => (
                    <div key={v.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{v.label}</p>
                      <p className={`text-2xl font-black ${v.color}`}>{v.val} <span className="text-xs text-slate-400 font-bold">{v.unit}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOOKING FORM ── */}
      {!isTracking && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT: Map + Details + Log */}
          <div className="xl:col-span-2 space-y-5">

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="size-7 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>local_hospital</span>
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nearest Facility</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Saint Jude Medical Center (1.2 mi)</p>
                  </div>
                </div>
                <span className="text-xs font-black text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">Open 24/7</span>
              </div>
              <div className="bg-[#4eada2] h-52 overflow-hidden">
                <svg viewBox="0 0 560 208" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                  <rect width="560" height="208" fill="#4eada2" />
                  <ellipse cx="260" cy="110" rx="220" ry="80" fill="#8bc4b0" opacity="0.5" />
                  <ellipse cx="280" cy="120" rx="180" ry="70" fill="#a8d5c2" opacity="0.6" />
                  <line x1="60"  y1="120" x2="480" y2="120" stroke="white" strokeWidth="2"   opacity="0.3" />
                  <line x1="200" y1="40"  x2="200" y2="192" stroke="white" strokeWidth="1.5" opacity="0.3" />
                  <line x1="360" y1="40"  x2="360" y2="192" stroke="white" strokeWidth="1.5" opacity="0.2" />
                  {FACILITIES.map((f, i) => (
                    <g key={i}>
                      <circle cx={f.x} cy={f.y} r="12" fill={i === 0 ? '#10b97f' : '#2563eb'} opacity="0.9" />
                      <text x={f.x} y={f.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+</text>
                    </g>
                  ))}
                  <g>
                    <circle cx="250" cy="148" r="14" fill="#ef4444" opacity="0.2">
                      <animate attributeName="r"       values="10;20;10"   dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0;0.3"  dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle  cx="250" cy="148" r="7" fill="#ef4444" />
                    <polygon points="250,134 243,148 257,148" fill="#ef4444" opacity="0.8" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Dispatch Details */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white">Dispatch Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Current Pickup Location</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-primary">location_on</span>
                    <input value={pickup} onChange={e => setPickup(e.target.value)} className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-900 dark:text-slate-100" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Destination Hospital</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-primary">local_hospital</span>
                    <input value={destination} onChange={e => setDestination(e.target.value)} className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-900 dark:text-slate-100" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Additional Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="e.g. Gate code 1234. Patient has penicillin allergy." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-900 dark:text-slate-100" />
              </div>
            </div>

            {/* Dispatch Log */}
            {dispLog.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">history</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dispatch Log</h4>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dispLog.map(e => (
                    <div key={e.id} className="flex items-start gap-3 px-5 py-3 text-xs">
                      <span className={`material-symbols-outlined text-sm mt-0.5 ${e.color}`} style={{ fontVariationSettings: '"FILL" 1' }}>{e.icon}</span>
                      <p className="flex-1 text-slate-700 dark:text-slate-300 font-medium">{e.msg}</p>
                      <span className="text-slate-400 font-medium shrink-0">{e.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Urgency + Confirm */}
          <div className="space-y-5">
            {/* Urgency Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Select Urgency Level</h4>
              <div className="space-y-3">
                {URGENCY_LEVELS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setUrgency(u.id)}
                    className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${urgency === u.id ? u.activeColor : `${u.color} hover:brightness-95`}`}
                  >
                    <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${u.iconBg}`}>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>{u.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{u.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{u.desc}</p>
                    </div>
                    {urgency === u.id && (
                      <span className="material-symbols-outlined text-lg text-primary shrink-0 mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm / Status Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 text-center">
              {dispState === 'idle' && (
                <>
                  <span className="material-symbols-outlined text-6xl text-red-500 mb-4 block" style={{ fontVariationSettings: '"FILL" 1' }}>ambulance</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">Confirm Request</h4>
                  <p className="text-xs text-slate-500 mt-1.5 mb-5 leading-relaxed">By clicking below, you authorize an immediate emergency dispatch to your current location.</p>
                  <button onClick={requestAmbulance} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-[0.98] cursor-pointer">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>emergency_share</span>
                    Request Ambulance Now
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </>
              )}
              {dispState === 'confirming' && (
                <>
                  <div className="size-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-amber-600 text-4xl animate-spin" style={{ animationDuration: '1.5s' }}>progress_activity</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Processing…</h4>
                  <p className="text-xs text-slate-500 mt-1">Contacting dispatch center.</p>
                </>
              )}
              {dispState === 'dispatching' && (
                <>
                  <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>cell_tower</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Dispatching Unit…</h4>
                  <p className="text-xs text-slate-500 mt-1">Locating nearest available unit.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
