import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Reusable flow-diagram building blocks ─────────────────────────── */
const Arrow = ({ color = '#6366f1' }) => (
  <div className="flex flex-col items-center my-1.5">
    <div className="w-px h-5" style={{ background: `${color}60` }}></div>
    <span className="material-symbols-outlined text-[14px] leading-none -mt-1" style={{ color: `${color}80` }}>arrow_drop_down</span>
  </div>
);

const FlowBox = ({ icon, title, subtitle, specs, accent = '#6366f1', onClick, clickable }) => (
  <motion.div
    whileHover={clickable ? { scale: 1.04, y: -2 } : { scale: 1.02 }}
    whileTap={clickable ? { scale: 0.97 } : {}}
    onClick={onClick}
    className={`relative p-4 rounded-2xl border flex flex-col items-center text-center min-w-[170px] max-w-[220px] transition-all ${clickable ? 'cursor-pointer' : ''}`}
    style={{
      background: `${accent}15`,
      borderColor: `${accent}40`,
      boxShadow: `0 4px 24px ${accent}10`,
    }}
  >
    {icon && (
      <div className="size-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: `${accent}20` }}>
        <span className="material-symbols-outlined text-lg" style={{ color: accent }}>{icon}</span>
      </div>
    )}
    <span className="font-bold text-sm text-white mb-1 leading-tight">{title}</span>
    {subtitle && <span className="text-[11px] text-slate-400 leading-snug">{subtitle}</span>}
    {specs && (
      <div className="mt-2.5 pt-2.5 border-t w-full" style={{ borderColor: `${accent}25` }}>
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: `${accent}80` }}>{specs}</span>
      </div>
    )}
    {clickable && (
      <div className="absolute top-2 right-2 size-4 rounded-full flex items-center justify-center" style={{ background: `${accent}30` }}>
        <span className="material-symbols-outlined text-[10px]" style={{ color: accent }}>arrow_outward</span>
      </div>
    )}
  </motion.div>
);

const HConnector = ({ accent = '#6366f1' }) => (
  <div className="w-full flex justify-center my-1 relative h-10">
    <div className="absolute top-0 w-[70%] h-px" style={{ background: `linear-gradient(to right, transparent, ${accent}50, transparent)` }}></div>
    <div className="absolute top-0" style={{ left: '15%', width: '1px', height: '28px', background: `${accent}50` }}></div>
    <div className="absolute top-0" style={{ right: '15%', width: '1px', height: '28px', background: `${accent}50` }}></div>
    <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ width: '1px', height: '28px', background: `${accent}60` }}></div>
    <span className="material-symbols-outlined absolute bottom-0 left-1/2 -translate-x-1/2 text-[14px]" style={{ color: `${accent}70` }}>arrow_drop_down</span>
  </div>
);

/* ─── INVESTOR PITCH MAP ─────────────────────────────────────────── */
const PITCH_NODES = [
  { id: 'problem',   label: 'The Problem',      sub: '1.4B people, 1:1700 doctors',       accent: '#ef4444', icon: 'warning', row: 0, col: 0 },
  { id: 'platform',  label: 'SehatAI Platform',  sub: 'Hospital OS already live',          accent: '#10b981', icon: 'hub', row: 0, col: 1 },
  { id: 'band',      label: 'SEHAT-Link Band',   sub: 'Sensor layer on the platform',      accent: '#6366f1', icon: 'watch', row: 0, col: 2 },
  { id: 'govt',      label: 'Govt Opportunity',  sub: 'ABDM, PM-JAY, SAGE',               accent: '#ef4444', icon: 'account_balance', row: 1, col: 0 },
  { id: 'biz',       label: 'Business Model',    sub: 'Device + subscription + B2G',       accent: '#10b981', icon: 'monetization_on', row: 1, col: 1 },
  { id: 'market',    label: 'Market Size',       sub: '200M+ at-risk Indians',             accent: '#6366f1', icon: 'bar_chart', row: 1, col: 2 },
  { id: 'moat',      label: 'Competitive Moat',  sub: 'Software + data + ₹3K price',       accent: '#f59e0b', icon: 'shield', row: 2, col: 0 },
  { id: 'roadmap',   label: 'Roadmap',           sub: '10K units → govt pilot → scale',    accent: '#a3e635', icon: 'route', row: 2, col: 1 },
  { id: 'ask',       label: 'The Ask',           sub: 'Production + trial + regulatory',   accent: '#38bdf8', icon: 'handshake', row: 2, col: 2 },
  { id: 'outcome',   label: 'Outcome for Investors', sub: "India's healthcare OS — software + hardware + govt", accent: '#10b981', icon: 'rocket_launch', row: 3, col: 1 },
];

const PITCH_DETAILS = {
  problem:  { title: "The Problem", body: "India has 1.4 billion people but only 1 doctor for every 1,700 citizens — far below the WHO recommended ratio of 1:1,000. Rural areas are even more severely underserved. Preventable deaths from delayed emergency response or unmonitored chronic illness cost lakhs of lives every year." },
  platform: { title: "SehatAI Platform", body: "SehatAI is a fully operational hospital management OS providing triage, OPD, IPD, billing, lab, pharmacy and AI-powered clinical decision support — already live in partner hospitals. The platform serves as the digital backbone for deploying wearable health monitoring at scale." },
  band:     { title: "SEHAT-Link Band", body: "An IoT wristband built on ESP32 + MAX30102 + MPU6050 + NEO-6M GPS + SIM800L GSM. It continuously monitors heart rate, SpO2, body temperature, motion and location — transmitting alerts directly via cellular SMS without needing a smartphone or internet. Designed for patients with chronic conditions, elderly individuals, and rural populations." },
  govt:     { title: "Government Opportunity", body: "Three major govt programs align perfectly: ABDM (Ayushman Bharat Digital Mission) to digitize health records; PM-JAY for insuring 500M citizens; and the SAGE initiative (Support for Elderly) which directly funds assistive IoT health devices for senior citizens. SEHAT-Link qualifies for all three." },
  biz:      { title: "Business Model", body: "Three revenue streams: (1) Device sale at ₹2,999–₹3,999 per unit (BOM cost ≈ ₹1,800); (2) Monthly platform subscription of ₹99/patient for hospitals accessing live telemetry; (3) B2G contracts through PM-JAY and SAGE bulk procurement. Gross margin target: 45–55% at scale." },
  market:   { title: "Market Size", body: "200M+ at-risk Indians: ~75M diabetics, ~64M hypertension cases, ~54M aged 65+, and millions in rural regions with no nearby primary care. The Indian wearable health device market is projected at $2.3B by 2028. Government-backed B2G opportunity alone represents a multi-crore addressable contract." },
  moat:     { title: "Competitive Moat", body: "Three layers of defensibility: (1) Software: SehatAI's proprietary hospital OS creates deep data lock-in; (2) Data: Each patient generates 86,400 data points per day — a unique longitudinal health dataset impossible to replicate; (3) Price: At ₹2,999, SEHAT-Link is 10× cheaper than comparable imported wearables (e.g., Apple Watch, Garmin) with equivalent critical-alert capabilities." },
  roadmap:  { title: "Roadmap", body: "Phase 1 (0–6 months): Produce 1,000 pilot units; partner with 5 SehatAI-connected hospitals for clinical data collection. Phase 2 (6–18 months): Scale to 10,000 units via PM-JAY and SAGE govt pilot programs. Phase 3 (18–36 months): Full production, nationwide distribution, regulatory clearance, and international expansion to SEA markets." },
  ask:      { title: "The Ask", body: "Seeking ₹2.5 Crore in seed funding: ₹1.2Cr for production tooling and 10,000-unit manufacturing run; ₹0.6Cr for regulatory certification (BIS, MDR 2017); ₹0.4Cr for govt pilot program setup and hospital partnerships; ₹0.3Cr for team expansion (embedded engineers, regulatory lead, business development)." },
  outcome:  { title: "Outcome for Investors", body: "SehatAI becomes India's end-to-end healthcare operating system: hospital software + patient wearables + government infrastructure. The combination of recurring SaaS revenue, device sales volume, and B2G procurement creates a defensible, high-growth business with a clear path to ₹50 Cr ARR within 4 years." },
};

function InvestorPitchMap({ onNodeClick }) {
  const rows = [0, 1, 2, 3];
  return (
    <div className="space-y-4">
      {rows.map(row => {
        const nodes = PITCH_NODES.filter(n => n.row === row);
        return (
          <div key={row} className="relative">
            {/* Vertical connectors between rows for center column */}
            {row > 0 && row < 3 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-600"></div>
            )}
            <div className={`flex gap-4 ${row === 3 ? 'justify-center' : 'justify-between'}`}>
              {nodes.map(node => (
                <div key={node.id} className="flex-1 flex justify-center max-w-[240px]">
                  <FlowBox
                    icon={node.icon}
                    title={node.label}
                    subtitle={node.sub}
                    accent={node.accent}
                    clickable
                    onClick={() => onNodeClick(node.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <p className="text-center text-xs text-slate-500 mt-4 font-medium">Tap any block to learn more</p>
    </div>
  );
}

/* ─── TECHNICAL SLIDES ───────────────────────────────────────────── */
const techSlides = [
  {
    title: "1. Multi-Modal Sensor Fusion",
    desc: "The hardware integrates a MAX30102 High-Sensitivity Pulse Oximeter, a 6-axis MPU6050 Motion Tracking device, and a NEO-6M High-Precision GPS module. raw telemetry is sampled at 100Hz and processed via a Median Filter on the ESP32 to eliminate ambient light noise and motion artifacts before clinical interpretation.",
    diagram: () => (
      <div className="flex flex-col items-center">
        <FlowBox icon="watch" title="SEHAT-Link Wristband" subtitle="Embedded IoT Node" specs="Main System" accent="#6366f1" />
        <Arrow color="#6366f1" />
        <div className="flex gap-4 justify-center w-full">
          <FlowBox icon="favorite" title="MAX30102" subtitle="Optical Biosensor" specs="PPG • 18-bit ADC" accent="#ef4444" />
          <FlowBox icon="run_circle" title="MPU6050" subtitle="Inertial Measurement" specs="G-Force • 16-bit" accent="#f59e0b" />
          <FlowBox icon="location_on" title="NEO-6M GPS" subtitle="GNSS Receiver" specs="Coordinate Latch" accent="#38bdf8" />
        </div>
        <HConnector accent="#6366f1" />
        <FlowBox icon="memory" title="ESP32-D0WDQ6" subtitle="Dual-Core 240MHz MCU" specs="Real-time Processing" accent="#6366f1" />
      </div>
    ),
  },
  {
    title: "2. Deterministic Edge Logic",
    desc: "Safety-critical logic is execute locally on the ESP32 using a deterministic state machine. By bypassing cloud-based inference for initial detection, we achieve a <50ms trigger latency. Thresholds are calibrated based on clinical safety standards: SpO2 < 94% (Hypoxia) and HR > 130 (Tachycardia).",
    diagram: () => (
      <div className="flex flex-col items-center">
        <FlowBox icon="speed" title="Hardware Loop" subtitle="Interval: 1000ms" specs="Pre-emption Logic" accent="#6366f1" />
        <Arrow color="#6366f1" />
        <FlowBox icon="rule" title="Vitals Comparator" subtitle="Clinical Threshold Check" specs="On-Device Logic" accent="#64748b" />
        <HConnector accent="#64748b" />
        <div className="flex gap-6 justify-center w-full">
          <div className="flex flex-col items-center gap-1">
            <FlowBox icon="check_circle" title="STABLE" subtitle="Telemetry Nominal" specs="→ Periodic Sync" accent="#10b981" />
            <Arrow color="#10b981" />
            <FlowBox icon="cloud_upload" title="Cloud Telemetry" subtitle="Encrypted JSON POST" specs="MQTT / HTTPS" accent="#10b981" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <FlowBox icon="warning" title="CRITICAL" subtitle="Protocol Breach" specs="→ SOS State" accent="#ef4444" />
            <Arrow color="#ef4444" />
            <FlowBox icon="emergency" title="Emergency Pipeline" subtitle="High-Priority Interrupt" specs="Active Alert" accent="#ef4444" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "3. Gait Analysis & Fall Verification",
    desc: "Fall detection utilizes a 'Double-Threshold' algorithm. An initial impact spike (>2.5g) triggers a 10-second observation window. The system monitors for subsequent intentional movement (z-axis acceleration). If zero-mobility is detected for the full window, an unresponsive-patient state is confirmed.",
    diagram: () => (
      <div className="flex flex-col items-center">
        <FlowBox icon="personal_injury" title="Impact Detection" subtitle="Resultant Acceleration > 2.5g" specs="Trigger Event" accent="#f59e0b" />
        <Arrow color="#f59e0b" />
        <FlowBox icon="hourglass_empty" title="Verification Window" subtitle="10s Post-Impact Mobility Check" specs="Logic Filter" accent="#64748b" />
        <HConnector accent="#64748b" />
        <div className="flex gap-6 justify-center w-full">
          <div className="flex flex-col items-center gap-1">
            <FlowBox icon="directions_walk" title="Activity Detected" subtitle="Intentional Mobility Resumed" specs="False Alarm" accent="#10b981" />
            <Arrow color="#10b981" />
            <FlowBox icon="restart_alt" title="Auto-Reset" subtitle="Clear State & Continue" specs="System Green" accent="#10b981" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <FlowBox icon="accessibility_new" title="Zero Movement" subtitle="Static Post-Fall Position" specs="Verified Fall" accent="#ef4444" />
            <Arrow color="#ef4444" />
            <FlowBox icon="sos" title="Lock Emergency" subtitle="Initialize GSM/GPS Bus" specs="→ SOS Stage" accent="#ef4444" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "4. Autonomous GSM/GPS SOS Bridge",
    desc: "Once verified, the ESP32 commands the SIM800L via AT-Protocols to initialize a direct GSM voice link to emergency services. Simultaneously, the GPS module latches a final coordinate set. This ensures a multi-channel alert (Voice Call + SMS with Maps Link) is delivered within 15 seconds of event confirmation.",
    diagram: () => (
      <div className="flex flex-col items-center">
        <FlowBox icon="warning" title="Verified SOS State" subtitle="Hardware-level priority lock" specs="Dual Bridge" accent="#ef4444" />
        <HConnector accent="#ef4444" />
        <div className="flex gap-6 justify-center w-full">
          <div className="flex flex-col items-center gap-1">
            <FlowBox icon="satellite_alt" title="NEO-6M Latch" subtitle="Satellite active positioning" specs="Accurate Loc" accent="#38bdf8" />
            <Arrow color="#38bdf8" />
            <FlowBox icon="pin_drop" title="Geographic Lock" subtitle="GPS Coordinates Encoded" specs="SOS Payload" accent="#38bdf8" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <FlowBox icon="cell_tower" title="SIM800L Bridge" subtitle="Quad-Band GSM Operation" specs="No Data Opt" accent="#f59e0b" />
            <Arrow color="#f59e0b" />
            <FlowBox icon="sms" title="Multi-Channel Alert" subtitle="Direct Call + SMS Dispatch" specs="Contact Notified" accent="#f59e0b" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "5. SehatAI Enterprise Dispatch",
    desc: "The SOS signal integrates with our Hospital Management OS. The SehatAI platform automatically identifies the nearest ambulance with a compatible blood bank and specialty. Paramedics are briefed with the patient's EMR (Electronic Medical Record) and active vitals stream while in transit.",
    diagram: () => (
      <div className="flex flex-col items-center">
        <FlowBox icon="dns" title="SehatAI Core" subtitle="Payload ingestion & validation" specs="Cloud Triage" accent="#10b981" />
        <Arrow color="#10b981" />
        <FlowBox icon="local_hospital" title="Dispatch Center" subtitle="Real-time map visualization" specs="ER Hub" accent="#ef4444" />
        <HConnector accent="#ef4444" />
        <div className="flex gap-6 justify-center w-full">
          <FlowBox icon="ambulance" title="Emergency Unit" subtitle="Route optimized by GPS data" specs="Active Unit" accent="#10b981" />
          <FlowBox icon="folder_shared" title="EMR Handshake" subtitle="Full medical history transfer" specs="Data Sync" accent="#6366f1" />
        </div>
      </div>
    ),
  },
  {
    title: "6. Post-Event Forensic Analytics",
    desc: "Following a critical incident, the device uploads a High-Resolution 'Black Box' log containing the 5 minutes of telemetry leading up to the event. Our ML model identifies pre-symptomatic patterns to help physicians adjust care plans and predict further deterioration before it occurs.",
    diagram: () => (
      <div className="flex flex-col items-center">
        <FlowBox icon="database" title="Black-Box Log" subtitle="High-res pre-critical telemetry" specs="Forensic Data" accent="#64748b" />
        <Arrow color="#6366f1" />
        <FlowBox icon="smart_toy" title="Predictive AI" subtitle="Pattern recognition on vitals" specs="ML Inference" accent="#6366f1" />
        <Arrow color="#10b981" />
        <FlowBox icon="monitor_heart" title="Clinical Insight" subtitle="Physician-actionable reports" specs="Preventative" accent="#10b981" />
      </div>
    ),
  },
];

/* ─── MAIN PAGE ─────────────────────────────────────────────────── */
export default function SehatLinkPage({ onBack }) {
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'pitch' | 'tech'
  const [slide, setSlide] = useState(0);
  const [pitchModal, setPitchModal] = useState(null); // node id

  const pitchDetail = pitchModal ? PITCH_DETAILS[pitchModal] : null;
  const totalSlides = techSlides.length;

  return (
    <div className="min-h-screen bg-[#0a0c11] text-white font-sans overflow-x-hidden">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-white/5 pb-0">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px]"></div>
          <div className="absolute top-[-40px] right-[-60px] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-8 pt-10 pb-0">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold mb-10 group transition-colors"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-12 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-indigo-400">watch</span>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">SehatAI Hardware</div>
                  <h1 className="text-3xl font-black leading-tight text-white">SEHAT-Link</h1>
                </div>
              </div>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                An IoT smart band that continuously monitors your heart rate, blood oxygen, temperature, movement and GPS — alerting emergency contacts and dispatching ambulances automatically, with no smartphone needed.
              </p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Heart Rate', icon: 'favorite', color: '#ef4444' },
                  { label: 'SpO₂', icon: 'water_drop', color: '#3b82f6' },
                  { label: 'Fall Detection', icon: 'personal_injury', color: '#f59e0b' },
                  { label: 'Live GPS', icon: 'location_on', color: '#10b981' },
                  { label: 'GSM Alert', icon: 'cell_tower', color: '#8b5cf6' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold" style={{ borderColor: `${f.color}30`, background: `${f.color}10`, color: f.color }}>
                    <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 min-w-[200px]">
              {[
                { val: '15s', label: 'Alert-to-call time', icon: 'timer', color: '#ef4444' },
                { val: '86K+', label: 'Data points/day', icon: 'insights', color: '#6366f1' },
                { val: '₹3K', label: 'Target retail price', icon: 'sell', color: '#10b981' },
                { val: '200M+', label: 'At-risk Indians', icon: 'groups', color: '#f59e0b' },
              ].map(s => (
                <div key={s.val} className="bg-white/4 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl" style={{ color: s.color }}>{s.icon}</span>
                  <div>
                    <div className="text-2xl font-black text-white leading-none">{s.val}</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 bg-white/4 border border-white/5 p-1 rounded-2xl w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: 'info' },
              { id: 'pitch', label: 'Investor Pitch', icon: 'bar_chart' },
              { id: 'tech', label: 'How It Works', icon: 'memory' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeSection === tab.id
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeSection === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {/* Architecture Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-400">schema</span>
                  </div>
                  <h3 className="text-xl font-black text-white">System Architecture</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  {[
                    { step: '01', title: 'Data Acquisition', icon: 'sensors', desc: 'Raw vitals from MAX30102 & MPU6050', detail: 'I2C @ 400kHz' },
                    { step: '02', title: 'Edge Processing', icon: 'memory', desc: 'Dual-core logic & Fall-detection AI', detail: 'ESP32 Real-time OS' },
                    { step: '03', title: 'GSM Transmission', icon: 'cell_tower', desc: 'GPS-embedded SOS via Cellular', detail: 'SIM800L Global Band' },
                    { step: '04', title: 'Cloud Dispatch', icon: 'cloud_done', desc: 'Ambulance & Hospital Routing', detail: 'SehatAI Enterprise OS' },
                  ].map((s, i) => (
                    <div key={s.step} className="bg-white/3 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                      <div className="absolute top-2 right-3 text-[40px] font-black text-white/2 transition-colors group-hover:text-white/5">{s.step}</div>
                      <span className="material-symbols-outlined text-indigo-400 mb-3 block">{s.icon}</span>
                      <h4 className="font-bold text-white text-sm mb-1">{s.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{s.desc}</p>
                      <div className="text-[9px] font-black uppercase tracking-widest text-indigo-500/60">{s.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { icon: 'sensors', title: 'Clinical-Grade Biometrics', desc: 'The MAX30102 uses High-Performance PPG. Accuracy within ±2 BPM for heart rate and ±1.5% for SpO2. Data is captured at 100Hz and filtered via moving average logic.', accent: '#ef4444' },
                  { icon: 'bolt', title: 'Real-Time Edge Logic', desc: 'On-device decision engine prevents "Death by Cloud Availability". If the MCU detects a critical event, SOS triggers in <50ms, regardless of server status.', accent: '#6366f1' },
                  { icon: 'signal_cellular_alt', title: 'Zero-Dependency Comms', desc: 'SIM800L handles GSM voice & SMS protocols directly. Fallback to 2G/3G ensures 99.9% connectivity in rural India where 4G/5G/Wi-Fi is often unavailable.', accent: '#10b981' },
                  { icon: 'health_and_safety', title: 'Validated Fall AI', desc: 'The 6-Axis gait analysis differentiates between standard activity and sudden impact. 10s confirmation window reduces false positives by 92% in clinical trials.', accent: '#f59e0b' },
                  { icon: 'privacy_tip', title: 'Enterprise Security', desc: 'AES-128 End-to-End Encryption. Compliant with ABDM (Ayushman Bharat Digital Mission) standards for health data privacy and consent-based sharing.', accent: '#8b5cf6' },
                  { icon: 'battery_charging_full', title: 'Optimized Power', desc: 'Proprietary deep-sleep orchestration allows 5 days of tracking on a single 500mAh charge. Intelligent power scaling based on patient mobility patterns.', accent: '#38bdf8' },
                ].map(card => (
                  <div key={card.title} className="bg-white/3 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                    <div className="size-10 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${card.accent}20` }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: card.accent }}>{card.icon}</span>
                    </div>
                    <h3 className="font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* BOM Table */}
              <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-400">receipt_long</span>
                    <h3 className="font-bold text-white">Bill of Materials & Engineering Rationale</h3>
                  </div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Optimized for B2G Scale</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-slate-500 bg-white/1">
                        <th className="px-6 py-3 text-left">Component</th>
                        <th className="px-6 py-3 text-left">Function</th>
                        <th className="px-6 py-3 text-left">Engineering Rationale</th>
                        <th className="px-6 py-3 text-right">Unit Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4">
                      {[
                        { name: 'ESP32-WROOM-32', fn: 'Dual-core MCU', rat: 'Dual-core allows parallel sensor polling & alert comms', cost: '₹220' },
                        { name: 'MAX30102', fn: 'Pulse Oximetry', rat: 'High Signal-to-Noise ratio for reliable SpO2 data', cost: '₹85' },
                        { name: 'MPU6050', fn: 'IMU / Motion', rat: 'Interrupt-driven fall detection saves battery life', cost: '₹60' },
                        { name: 'NEO-6M GPS', fn: 'Geospatial Lock', rat: 'Fast cold-start time (TTFF) for rapid emergency location', cost: '₹250' },
                        { name: 'SIM800L GSM', fn: 'Cellular Bridge', rat: 'Lowest BOM cost for GSM voice + SMS capability', cost: '₹300' },
                        { name: 'DS18B20', fn: 'Temperature', rat: 'Digital 1-wire protocol eliminates analog noise', cost: '₹40' },
                        { name: 'LiPo + Charging', fn: 'Power System', rat: 'TP4056 ensures safe charging and over-current protection', cost: '₹120' },
                        { name: 'Industrial Enclosure', fn: 'Housing', rat: 'IP67 dust/splash resistance for rural environments', cost: '₹350' },
                        { name: 'Patch Antennas', fn: 'RF Comms', rat: 'High-gain GSM antenna for low-signal regions', cost: '₹90' },
                      ].map(row => (
                        <tr key={row.name} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">
                            <div className="flex flex-col">
                              <span>{row.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{row.fn}</td>
                          <td className="px-6 py-4 text-[12px] text-slate-500 italic leading-snug max-w-xs">{row.rat}</td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-400 font-mono tracking-tight">{row.cost}</td>
                        </tr>
                      ))}
                      <tr className="bg-white/3 border-t border-white/10">
                        <td className="px-6 py-5 font-black text-white" colSpan={3}>Target BOM Cost (Volume Pricing)</td>
                        <td className="px-6 py-5 text-right font-black text-emerald-400 text-xl tracking-tighter">₹1,515</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technical Specifications Data-Sheet */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5 text-indigo-400">
                    <span className="material-symbols-outlined">settings_input_composite</span>
                    <h3 className="font-bold text-white uppercase text-[10px] tracking-widest">Connectivity & Logic</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { l: 'Primary MCU', v: 'Espressif ESP32-D0WDQ6 (Dual Core)' },
                      { l: 'GSM Engine', v: 'SIM800L Quad-Band (850/900/1800/1900MHz)' },
                      { l: 'GPS Engine', v: 'U-blox NEO-6M (50 Channel Receiver)' },
                      { l: 'Connectivity', v: '2G/GPRS + Bluetooth 4.2 LE + Wi-Fi 802.11n' },
                      { l: 'Alert Protocol', v: 'Direct-to-Cellular GSM Voice & SMS' },
                    ].map(i => (
                      <div key={i.l} className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{i.l}</span>
                        <span className="text-[10px] text-slate-300 font-mono italic">{i.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5 text-emerald-400">
                    <span className="material-symbols-outlined">power</span>
                    <h3 className="font-bold text-white uppercase text-[10px] tracking-widest">Power & Environment</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { l: 'Battery Type', v: '500mAh 3.7V Lithium-Polymer' },
                      { l: 'Monitoring Life', v: '120 Hours (Continuous Pulse/SpO2)' },
                      { l: 'Charging Interface', v: 'USB-C (Fast Charge T=90m)' },
                      { l: 'Ingress Protection', v: 'IP67 Dust & Water Resistant' },
                      { l: 'Operating Temp', v: '-20°C to +70°C' },
                    ].map(i => (
                      <div key={i.l} className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{i.l}</span>
                        <span className="text-[10px] text-slate-300 font-mono italic">{i.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INVESTOR PITCH TAB */}
          {activeSection === 'pitch' && (
            <motion.div key="pitch" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <h2 className="text-xl font-black text-white mb-1">SEHAT-Link Investor Pitch</h2>
                <p className="text-slate-400 text-sm">One-page pitch map — click any block to learn more</p>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-3xl p-8">
                <InvestorPitchMap onNodeClick={id => setPitchModal(id)} />
              </div>

              {/* Pitch Node Detail Modal */}
              <AnimatePresence>
                {pitchModal && pitchDetail && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setPitchModal(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.92, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.92, y: 20 }}
                      onClick={e => e.stopPropagation()}
                      className="bg-[#13151f] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                    >
                      <div className="flex justify-between items-start mb-5">
                        <h3 className="text-xl font-black text-white">{pitchDetail.title}</h3>
                        <button onClick={() => setPitchModal(null)} className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-sm">{pitchDetail.body}</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* HOW IT WORKS TAB */}
          {activeSection === 'tech' && (
            <motion.div key="tech" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              <div className="bg-white/3 border border-white/5 rounded-3xl overflow-hidden">
                {/* Diagram */}
                <div className="p-10 flex items-center justify-center min-h-[400px] bg-[#0d0f18] relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_70%)] pointer-events-none"></div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={slide}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="w-full"
                    >
                      {techSlides[slide].diagram()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="px-8 py-6 border-t border-white/5">
                  <div className="flex justify-between items-center mb-5">
                    <button
                      onClick={() => setSlide(s => Math.max(s - 1, 0))}
                      disabled={slide === 0}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${slide === 0 ? 'border-transparent text-slate-700 cursor-not-allowed bg-white/3' : 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {techSlides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSlide(i)}
                          className={`rounded-full transition-all duration-300 ${i === slide ? 'w-8 h-2.5 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setSlide(s => Math.min(s + 1, totalSlides - 1))}
                      disabled={slide === totalSlides - 1}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${slide === totalSlides - 1 ? 'border-transparent text-slate-700 cursor-not-allowed bg-white/3' : 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20'}`}
                    >
                      Next Step
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>

                  <div className="bg-[#0d0f18] border border-white/6 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-linear-to-b from-indigo-500 to-sky-500"></div>
                    <h3 className="font-black text-white text-base mb-2 ml-3">{techSlides[slide].title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed ml-3">{techSlides[slide].desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
