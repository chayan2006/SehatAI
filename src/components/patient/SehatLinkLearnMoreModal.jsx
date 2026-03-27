import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Arrow = () => (
  <div className="flex flex-col items-center my-2 text-slate-500">
    <div className="w-px h-6 bg-slate-500"></div>
    <span className="material-symbols-outlined text-[16px] leading-none -mt-1">arrow_drop_down</span>
  </div>
);

const FlowBox = ({ icon, title, subtitle, specs, bgClass, borderClass = "border-white/10" }) => (
  <div className={`p-4 rounded-xl shadow-lg border flex flex-col items-center text-center min-w-[200px] max-w-[240px] z-10 transition-all hover:scale-105 hover:shadow-2xl ${borderClass} ${bgClass}`}>
    {icon && (
      <div className="size-10 rounded-full bg-black/20 flex items-center justify-center mb-3 text-white shadow-inner">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
    )}
    <span className="font-bold text-sm text-white mb-1 leading-tight">{title}</span>
    {subtitle && <span className="text-xs text-white/80 leading-snug">{subtitle}</span>}
    {specs && (
      <div className="mt-3 pt-3 border-t border-white/10 w-full">
        <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">{specs}</span>
      </div>
    )}
  </div>
);

const Slide1 = () => (
  <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-8">
    <FlowBox 
      icon="watch" 
      title="SEHAT-Link Wearable" 
      subtitle="Comfortable IoT wristband" 
      specs="Main Device Hub"
      bgClass="bg-indigo-600/30 backdrop-blur-md" 
      borderClass="border-indigo-500/50" 
    />
    <Arrow />
    <div className="flex justify-center gap-4 w-full relative z-10 px-4">
      <FlowBox 
        icon="favorite" 
        title="MAX30102" 
        subtitle="Monitors light absorption through your skin" 
        specs="Heart Rate & SpO₂ • I2C"
        bgClass="bg-red-900/40 backdrop-blur-md" 
        borderClass="border-red-500/50" 
      />
      <FlowBox 
        icon="run_circle" 
        title="MPU6050" 
        subtitle="6-axis motion tracking (Gyro + Accel)" 
        specs="Fall Detection • I2C"
        bgClass="bg-amber-900/40 backdrop-blur-md" 
        borderClass="border-amber-500/50" 
      />
      <FlowBox 
        icon="location_on" 
        title="NEO-6M GPS" 
        subtitle="Satelite location triangulation" 
        specs="Live Coordinates • UART"
        bgClass="bg-sky-900/40 backdrop-blur-md" 
        borderClass="border-sky-500/50" 
      />
    </div>
    
    <div className="flex flex-col items-center w-full h-16 mt-2 relative">
      <div className="w-[85%] flex justify-between px-16 max-w-[600px] mx-auto absolute top-0">
         <div className="w-[2px] h-8 bg-gradient-to-b from-red-500/60 to-indigo-500/60 rounded-full"></div>
         <div className="w-[2px] h-8 bg-gradient-to-b from-amber-500/60 to-indigo-500/60 rounded-full"></div>
         <div className="w-[2px] h-8 bg-gradient-to-b from-sky-500/60 to-indigo-500/60 rounded-full"></div>
      </div>
      <div className="w-[80%] max-w-[480px] h-[2px] bg-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.6)] absolute top-8 rounded-full"></div>
      <div className="w-[2px] h-8 bg-indigo-500/80 absolute top-8 flex items-end">
        <span className="material-symbols-outlined absolute -bottom-3 -left-[11px] text-indigo-400">arrow_drop_down</span>
      </div>
    </div>

    <div className="mt-4">
      <FlowBox 
        icon="memory"
        title="ESP32 Microcontroller" 
        subtitle="Dual-core processor fetching telemetry" 
        specs="IoT Brain • Wi-Fi & BLE" 
        bgClass="bg-indigo-600/40 backdrop-blur-md" 
        borderClass="border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
      />
    </div>
    
    <p className="text-sm text-slate-400 font-medium mt-8 text-center max-w-2xl bg-slate-800/50 p-4 rounded-xl border border-slate-700">
      <strong className="text-white">Continuous Monitoring:</strong> All sensors stream high-resolution data into the ESP32 brain constantly. Local fusion occurs on-chip without needing a paired smartphone.
    </p>
  </div>
);

const Slide2 = () => (
  <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-8">
    <FlowBox icon="speed" title="ESP32 Edge Computing" subtitle="Process loop runs every 1 second" specs="Latency: <50ms" bgClass="bg-indigo-600/40" borderClass="border-indigo-500/50" />
    <Arrow />
    <FlowBox icon="rule" title="Safety Threshold Check" subtitle="HR: 60-100 • SpO2: > 94% • Normal Move" specs="Local Rule Engine" bgClass="bg-slate-700/50" borderClass="border-slate-500" />
    
    <div className="flex w-full max-w-xl mx-auto justify-center mt-6 relative h-10">
      <div className="absolute top-0 w-[50%] h-[2px] bg-slate-600 rounded-full"></div>
      <div className="absolute top-0 left-1/4 w-[2px] h-6 bg-slate-600 rounded-full"></div>
      <div className="absolute top-0 left-3/4 w-[2px] h-6 bg-slate-600 rounded-full"></div>
    </div>
      
    <div className="flex w-full max-w-2xl justify-between items-start">
      <div className="flex flex-col items-center w-1/2">
         <FlowBox icon="check_circle" title="Status: NORMAL" subtitle="Vitals stable" specs="Proceed" bgClass="bg-emerald-900/40" borderClass="border-emerald-500/50" />
         <Arrow />
         <FlowBox icon="cloud_upload" title="Routine Telemetry" subtitle="Log to cloud securely" specs="Encrypted POST" bgClass="bg-emerald-950/60" borderClass="border-emerald-800" />
      </div>

      <div className="flex flex-col items-center w-1/2">
         <FlowBox icon="warning" title="Status: CRITICAL" subtitle="Threshold broken or Fall detected" specs="Alert Triggered" bgClass="bg-rose-900/40" borderClass="border-rose-500/50" />
         <Arrow />
         <FlowBox icon="emergency" title="Emergency Engine" subtitle="Switch to high-priority alert mode" specs="Interrupt Priority" bgClass="bg-rose-950/80 shadow-[0_0_20px_rgba(225,29,72,0.3)]" borderClass="border-rose-600" />
      </div>
    </div>
    <p className="text-sm text-slate-400 font-medium mt-10 text-center max-w-2xl bg-slate-800/50 p-4 rounded-xl border border-slate-700">
      <strong className="text-white">Edge Processing:</strong> Analyzing algorithms directly on the ESP32 eliminates internet latency for detection.
    </p>
  </div>
);

const Slide3 = () => (
  <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-8">
    <FlowBox icon="personal_injury" title="Fall Event Detected" subtitle="MPU6050 registers severe G-force impact" specs="Accel > 2.5g" bgClass="bg-amber-900/40" borderClass="border-amber-500" />
    <Arrow />
    <FlowBox icon="hourglass_empty" title="Consciousness Pause" subtitle="System waits 10 seconds for movement" specs="Post-impact Analysis" bgClass="bg-slate-700/50" borderClass="border-slate-500" />
    
    <div className="flex w-full max-w-xl mx-auto justify-center mt-6 relative h-10">
      <div className="absolute top-0 w-[50%] h-[2px] bg-slate-600 rounded-full"></div>
      <div className="absolute top-0 left-1/4 w-[2px] h-6 bg-slate-600 rounded-full"></div>
      <div className="absolute top-0 left-3/4 w-[2px] h-6 bg-slate-600 rounded-full"></div>
    </div>
      
    <div className="flex w-full max-w-2xl justify-between items-start">
      <div className="flex flex-col items-center w-1/2">
         <FlowBox icon="directions_walk" title="Movement Resumes" subtitle="Patient moved or got up" specs="False Alarm Ignored" bgClass="bg-emerald-900/40" borderClass="border-emerald-500/50" />
         <Arrow />
         <FlowBox icon="restart_alt" title="Resume Monitoring" subtitle="No sirens, simply log recovery" specs="Return to base" bgClass="bg-emerald-950/60" borderClass="border-emerald-800" />
      </div>

      <div className="flex flex-col items-center w-1/2">
         <FlowBox icon="accessibility_new" title="No Movement (0g)" subtitle="Patient lies unresponsive" specs="Emergency Confirm" bgClass="bg-rose-900/40" borderClass="border-rose-500/50" />
         <Arrow />
         <FlowBox icon="sos" title="Lock Device State" subtitle="Hardware SOS Pipeline" specs="Proceed to Step 4" bgClass="bg-rose-950/80 shadow-[0_0_20px_rgba(225,29,72,0.3)]" borderClass="border-rose-600" />
      </div>
    </div>
    
    <p className="text-sm text-slate-400 font-medium mt-10 text-center max-w-2xl bg-slate-800/50 p-4 rounded-xl border border-slate-700">
      <strong className="text-white">Smart Verification:</strong> The 10-second wait effectively filters out false alarms from accidental drops and stumbles.
    </p>
  </div>
);

const Slide4 = () => (
  <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-8">
    <FlowBox icon="warning" title="Hardware SOS Triggered" subtitle="ESP32 initiates dual-band transmission" specs="Simultaneous Exec" bgClass="bg-rose-900/50" borderClass="border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]" />
    
    <div className="flex w-full max-w-2xl mx-auto justify-center mt-6 relative h-10">
      <div className="absolute top-0 w-[50%] h-[2px] bg-slate-600 rounded-full"></div>
      <div className="absolute top-0 left-1/4 w-[2px] h-6 bg-slate-600 rounded-full"></div>
      <div className="absolute top-0 left-3/4 w-[2px] h-6 bg-slate-600 rounded-full"></div>
    </div>

    <div className="flex w-full max-w-4xl justify-between items-start">
      <div className="flex flex-col items-center w-1/2 px-4 relative">
         <FlowBox icon="satellite_alt" title="NEO-6M GPS" subtitle="Locks onto satellites" specs="Acquiring Lat/Long..." bgClass="bg-sky-900/40" borderClass="border-sky-500/50" />
         <Arrow />
         <FlowBox icon="pin_drop" title="Coordinate Ping" subtitle="Ex: 28.7041° N, 77.1025° E" specs="+/- 2m Accuracy" bgClass="bg-sky-950/50" borderClass="border-sky-800" />
         <div className="absolute bottom-[35%] right-[-10%] h-[2px] w-[20%] border-t-2 border-dashed border-slate-500 flex justify-center -translate-y-1/2">
            <span className="material-symbols-outlined text-slate-500 text-sm bg-[#1a1a1a] px-1 translate-y-[-10px]">arrow_forward</span>
         </div>
      </div>
      <div className="flex flex-col items-center w-1/2 px-4">
         <FlowBox icon="cell_tower" title="SIM800L GSM" subtitle="Connects to Cellular Web" specs="Independent Network" bgClass="bg-amber-900/40" borderClass="border-amber-500/50" />
         <Arrow />
         <FlowBox icon="sms" title="Direct SMS + Call Dispatch" subtitle="Embeds GPS link into distress message" specs="Contact Network" bgClass="bg-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]" borderClass="border-amber-600" />
      </div>
    </div>
    
    <p className="text-sm text-slate-400 font-medium mt-10 text-center max-w-2xl bg-slate-800/50 p-4 rounded-xl border border-slate-700">
      <strong className="text-white">Guaranteed Delivery:</strong> By embedding dedicated GSM and GPS, the bracelet completely bypasses any paired phone requirement.
    </p>
  </div>
);

const Slide5 = () => (
  <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-8">
    <FlowBox icon="dns" title="SehatAI Server Receives Ping" subtitle="Alert hits webhook & parsed" specs="Cloud Validation" bgClass="bg-teal-900/40" borderClass="border-teal-500/50" />
    <Arrow />
    <FlowBox icon="local_hospital" title="Hospital Command Center" subtitle="Emergency flashes on dispatch board" specs="Code Red" bgClass="bg-rose-900/40" borderClass="border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]" />
    <div className="flex w-full max-w-xl mx-auto justify-center mt-6 relative h-10">
      <div className="absolute top-0 w-[50%] h-[2px] bg-slate-600 rounded-full"></div>
      <div className="absolute top-0 left-1/4 w-[2px] h-6 bg-slate-600 rounded-full"></div>
      <div className="absolute top-0 left-3/4 w-[2px] h-6 bg-slate-600 rounded-full"></div>
    </div>
    <div className="flex w-full max-w-2xl justify-between items-start">
      <div className="flex flex-col items-center w-1/2 px-4">
         <FlowBox icon="ambulance" title="Ambulance Dispatched" subtitle="Live location routed to EMT" specs="Optimal Route" bgClass="bg-emerald-900/40" borderClass="border-emerald-500/50" />
      </div>
      <div className="flex flex-col items-center w-1/2 px-4">
         <FlowBox icon="folder_shared" title="Patient Record Sent" subtitle="Pre-existing conditions sent to EMT" specs="EMR Prep" bgClass="bg-indigo-900/40" borderClass="border-indigo-500/50" />
      </div>
    </div>
  </div>
);

const Slide6 = () => (
  <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-8">
    <FlowBox icon="database" title="Hardware Telemetry Archiving" subtitle="Raw 1-sec incident data uploaded" specs="Black Box Log" bgClass="bg-slate-800/50" borderClass="border-slate-500" />
    <Arrow />
    <FlowBox icon="smart_toy" title="SehatAI Risk Matrix" subtitle="Deep learning reviews pre-fall vitals" specs="Pattern Match" bgClass="bg-indigo-900/40" borderClass="border-indigo-500/50" />
    <Arrow />
    <FlowBox icon="monitor_heart" title="Physician Dashboard" subtitle="Preventative insights on care & dosage" specs="Betterment Cycle" bgClass="bg-teal-900/40" borderClass="border-teal-500/50" />
  </div>
);

const slidesData = [
  {
    title: "1. Triple-Band Sensor Telemetry",
    description: "The MAX30102 shines an infrared LED through your skin to calculate heart rate and blood oxygen (SpO2). The MPU6050 tracks 6-axis acceleration to detect falls. The NEO-6M GPS fetches exact real-world coordinates via satellite. All three continuously feed this raw telemetry straight into the ESP32 brain via I2C and UART protocols.",
    component: <Slide1 />
  },
  {
    title: "2. The Edge Engine (Local Safety Checks)",
    description: "Unlike traditional health watches that just forward data to a phone app, SEHAT-Link uses the ESP32 to make local, instantaneous decisions. Every 1-second process cycle verifies that HR is within bounds (60-100) and SpO2 is normal (>94%). If values skew critically, it flags an override alert locally.",
    component: <Slide2 />
  },
  {
    title: "3. False Alarm Prevention Routine",
    description: "When the MPU6050 detects sudden massive acceleration characteristic of hitting the floor, the processor initiates a 10-second consciousness pause. If normal movement resumes within ten seconds, it's flagged as an anomaly or stumble and safely dismissed. If accelerometer readings stay flatlined (0g deviation), a confirmed emergency SOS sequence is locked.",
    component: <Slide3 />
  },
  {
    title: "4. Uninterrupted Hardware SOS Execution",
    description: "Locked into Emergency SOS, the ESP32 commands the NEO-6M to retrieve immediate latitude and longitude. Automatically, the SIM800L baseband negotiates a 2G/LTE cellular connection. It constructs an SMS with medical alerts, attaches a pinpoint Google Maps link, and directly dials registered contacts. No Wi-Fi or Bluetooth pairing is required.",
    component: <Slide4 />
  },
  {
    title: "5. SehatAI Command Dispatch (Server-Side)",
    description: "Simultaneous to family notification, a webhook payload is securely POSTed to our SehatAI unified servers. Hospital Admins see a visual Code Red flash instantly on their dashboard mapping grid. A paramedic unit is assigned and pre-briefed using the patient's existing Electronic Health Record file on route.",
    component: <Slide5 />
  },
  {
    title: "6. Post-Event Analysis & Preventative Healthcare",
    description: "With the event managed, the 5 minutes of telemetry leading up to the crisis is archived securely. The SehatAI pattern recognition engine evaluates pre-fall oxygen dips or heart rhythm irregularities, giving doctors precise empirical data to intervene effectively and tailor the patient's future recuperation path.",
    component: <Slide6 />
  }
];

export default function SehatLinkLearnMoreModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slidesData.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-[#0f1117] border border-neutral-800 w-full max-w-5xl rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-gradient-to-r from-[#151923] to-[#0f1117]">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-400 p-2 bg-indigo-500/10 rounded-xl">watch</span>
              How SEHAT-Link Architecture Works
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-rose-500/20 rounded-full text-slate-400 hover:text-rose-400 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Diagram Area */}
          <div className="flex-1 overflow-y-auto min-h-[440px] flex items-center justify-center p-8 bg-[#13151c] custom-scrollbar relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_100%)] pointer-events-none"></div>
            {slidesData[currentSlide].component}
          </div>

          {/* Controls & Text Area */}
          <div className="p-8 bg-[#0a0c10] border-t border-white/5">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  currentSlide === 0 
                  ? 'border-transparent text-neutral-600 bg-neutral-800/50 cursor-not-allowed' 
                  : 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Previous
              </button>
              
              <div className="flex items-center gap-4">
                {slidesData.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-10 bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'w-2.5 bg-neutral-700 hover:bg-neutral-500'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={nextSlide}
                disabled={currentSlide === slidesData.length - 1}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  currentSlide === slidesData.length - 1 
                  ? 'border-transparent text-neutral-600 bg-neutral-800/50 cursor-not-allowed' 
                  : 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white'
                }`}
              >
                Next Step
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            <div className="bg-[#151923] border border-white/5 p-6 rounded-2xl shadow-inner relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-sky-500"></div>
              <h3 className="text-lg font-black text-white mb-2 ml-2 tracking-tight">{slidesData[currentSlide].title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm ml-2 font-medium">
                {slidesData[currentSlide].description}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
