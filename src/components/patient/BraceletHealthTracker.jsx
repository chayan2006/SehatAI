import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';


export default function BraceletHealthTracker({ isRegistered, onRegister, onLearnMore }) {
  const [deviceId, setDeviceId] = useState('');
  const [vitals, setVitals] = useState({
    heartRate: 72,
    spo2: 98,
    temperature: 36.6,
    steps: 8432,
    lastUpdate: new Date().toLocaleTimeString()
  });
  const [history, setHistory] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      hr: 70 + Math.floor(Math.random() * 10),
      spo2: 97 + Math.floor(Math.random() * 3)
    }))
  );

  useEffect(() => {
    if (!isRegistered) return;

    const interval = setInterval(() => {
      setVitals(prev => {
        const newHR = Math.max(60, Math.min(100, prev.heartRate + (Math.random() * 4 - 2)));
        const newSpO2 = Math.max(95, Math.min(100, prev.spo2 + (Math.random() * 0.4 - 0.2)));
        const newTemp = Math.max(36.1, Math.min(37.5, prev.temperature + (Math.random() * 0.2 - 0.1)));
        
        return {
          heartRate: Math.round(newHR),
          spo2: parseFloat(newSpO2.toFixed(1)),
          temperature: parseFloat(newTemp.toFixed(1)),
          steps: prev.steps + Math.floor(Math.random() * 2),
          lastUpdate: new Date().toLocaleTimeString()
        };
      });

      setHistory(prev => {
        const newPoint = {
          time: prev.length,
          hr: Math.round(70 + Math.random() * 15),
          spo2: Math.round(96 + Math.random() * 4)
        };
        return [...prev.slice(1), newPoint];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isRegistered]);

  if (!isRegistered) {
    return (
      <div className="relative group overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xl shadow-primary/5">
        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6">
          <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-primary/20">
            Coming Soon
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">IoT Health Monitoring</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto text-sm leading-relaxed">
            Our proprietary Sehat-Link smart bracelet is currently in beta testing. 
            Real-time biometric sync will be available to all premium patients next month.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm shadow-xl transition-transform active:scale-95">
              Notify Me on Launch
            </button>
            <button 
              onClick={onLearnMore}
              className="w-full py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-transform active:scale-95"
            >
              Learn More About SEHAT-Link
            </button>
          </div>
        </div>

        {/* Blurred Background Content (The original registration UI) */}
        <div className="opacity-40 pointer-events-none">
          <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">qr_code_scanner</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Register Your Bracelet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
            Scan the QR code on the back of your IoT-Based Smart Health Monitoring Bracelet to begin real-time tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="text"
              readOnly
              placeholder="Enter Device ID (e.g. SEHAT-123)"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
            />
            <button 
              disabled
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl opacity-50"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-green-500 rounded-full flex items-center justify-center text-white inner-shadow shadow-green-500/50">
            <span className="material-symbols-outlined text-xl animate-pulse">sensors</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Live Bracelet Feed</h3>
            <p className="text-[11px] text-green-500 font-bold uppercase tracking-widest">Device: {deviceId || 'Connected'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 font-bold uppercase">Last Sync</p>
          <p className="text-sm font-mono text-slate-900 dark:text-white">{vitals.lastUpdate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate Card */}
        <motion.div 
          layout
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl text-red-500">favorite</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Heart Rate</span>
            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              <span className="material-symbols-outlined text-[12px] animate-bounce">favorite</span> LIVE
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-4 relative z-10">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{vitals.heartRate}</span>
            <span className="text-slate-400 text-xs font-bold uppercase">BPM</span>
          </div>
          <div className="h-16 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorHr)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* SpO2 Card */}
        <motion.div 
          layout
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl text-blue-500">water_drop</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Oxygen</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">SpO₂</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4 relative z-10">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{vitals.spo2}%</span>
            <span className="text-slate-400 text-xs font-bold uppercase">Stable</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2 relative z-10">
            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${vitals.spo2}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium relative z-10">Normal range: 95% - 100%</p>
        </motion.div>

        {/* Temp Card */}
        <motion.div 
          layout
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl text-orange-500">thermostat</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Temperature</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">Body</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4 relative z-10">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{vitals.temperature}°C</span>
          </div>
          <div className="flex items-center gap-2 mt-4 relative z-10">
             <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 overflow-hidden">
                <div className="h-full bg-linear-to-r from-blue-400 via-green-400 to-red-400 rounded-full transition-all duration-1000" style={{ width: `${(vitals.temperature - 35) * 20}%` }}></div>
             </div>
          </div>
        </motion.div>

        {/* Steps Card */}
        <motion.div 
          layout
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl text-primary">directions_run</span>
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Activity</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-primary">+8%</span>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{vitals.steps.toLocaleString()}</span>
            <span className="text-slate-400 text-xs font-bold uppercase">Steps</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-4 relative z-10 italic">Updated from MPU6050 Motion Sensor</p>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">insights</span>
            24-Hour Trends (Real-time Simulation)
        </h4>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={3} dot={false} name="Heart Rate" />
                    <Line type="monotone" dataKey="spo2" stroke="#3b82f6" strokeWidth={3} dot={false} name="SpO2" />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
