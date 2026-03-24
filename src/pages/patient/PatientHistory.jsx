import React, { useState, useRef, useCallback } from 'react';

const GRAPH_W = 800;
const GRAPH_H = 200;
const MAX_VBW = GRAPH_W * 2.5; 

const HISTORY_RECORDS = [
  { id: 1, date: "Sep 24", month: "Sep", day: "24", title: "Quarterly Wellness Checkup", diagnosis: "Stable", doctor: "Dr. Sarah Mitchell", facility: "Mercy General", tags: ["Routine", "Blood Work"] },
  { id: 2, date: "Aug 12", month: "Aug", day: "12", title: "Severe Migraine Consultation", diagnosis: "Chronic Migraine", doctor: "Dr. James Chen", facility: "Neurology Center", tags: ["Acute", "Prescription"] },
  { id: 3, date: "Jun 05", month: "Jun", day: "05", title: "Sports Injury (Knee)", diagnosis: "MCL sprain", doctor: "Dr. Sarah Mitchell", facility: "Mercy General", tags: ["Injury", "Rehab"] },
  { id: 4, date: "Apr 18", month: "Apr", day: "18", title: "Seasonal Allergy Follow-up", diagnosis: "Allergic Rhinitis", doctor: "Dr. Amy Watson", facility: "Online Consult", tags: ["Allergy"] },
  { id: 5, date: "Feb 10", month: "Feb", day: "10", title: "Emergency Fever Visit", diagnosis: "Viral Infection", doctor: "ER Staff", facility: "Springfield Hospital", tags: ["ER", "Labs"] },
];

export default function PatientHistory({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Week');
  const [viewMode, setViewMode] = useState('summary');
  const [vbX, setVbX] = useState(0);
  const [vbW, setVbW] = useState(GRAPH_W);
  const [searchQuery, setSearchQuery] = useState("");
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, vbX: 0 });
  const svgRef = useRef(null);

  const MIN_VBW = 150; 

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const applyZoom = useCallback((newVbW, centerX = vbX + vbW / 2) => {
    const clamped = clamp(newVbW, MIN_VBW, MAX_VBW);
    let newX;
    if (clamped > GRAPH_W) {
      newX = -(clamped - GRAPH_W) / 2;
    } else {
      newX = centerX - clamped / 2;
      newX = clamp(newX, 0, GRAPH_W - clamped);
    }
    setVbW(clamped);
    setVbX(newX);
  }, [vbX, vbW]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.87;
    const rect = svgRef.current.getBoundingClientRect();
    const cursorRatio = (e.clientX - rect.left) / rect.width;
    const cursorSvgX = vbX + cursorRatio * vbW;
    applyZoom(vbW * factor, cursorSvgX);
  }, [vbX, vbW, applyZoom]);

  const handleMouseDown = useCallback((e) => {
    if (vbW >= GRAPH_W) return; 
    isPanning.current = true;
    panStart.current = { x: e.clientX, vbX };
    e.currentTarget.style.cursor = 'grabbing';
  }, [vbX, vbW]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - panStart.current.x) / rect.width) * vbW;
    const newX = clamp(panStart.current.vbX - dx, 0, GRAPH_W - vbW);
    setVbX(newX);
  }, [vbW]);

  const handleMouseUp = useCallback((e) => {
    isPanning.current = false;
    if (e.currentTarget) e.currentTarget.style.cursor = vbW < GRAPH_W ? 'grab' : 'default';
  }, [vbW]);

  const resetZoom = () => { setVbX(0); setVbW(GRAPH_W); };
  const zoomPercent = Math.round((GRAPH_W / vbW) * 100);

  const filteredRecords = HISTORY_RECORDS.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const graphData = {
    Day: {
      path:     "M0,110 C38,110 76,130 114,130 C152,130 191,100 229,100 C267,100 305,85 343,85 C381,85 419,95 457,95 C495,95 533,110 571,110 C609,110 648,120 686,120 C724,120 762,108 800,108",
      fillPath: "M0,110 C38,110 76,130 114,130 C152,130 191,100 229,100 C267,100 305,85 343,85 C381,85 419,95 457,95 C495,95 533,110 571,110 C609,110 648,120 686,120 C724,120 762,108 800,108 L800,200 L0,200 Z",
      labels: ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "11 PM"]
    },
    Week: {
      path:     "M0,140 C38,140 76,118 114,118 C152,118 191,132 229,132 C267,132 305,100 343,100 C381,100 419,112 457,112 C495,112 533,82 571,82 C609,82 648,96 686,96 C724,96 762,88 800,88",
      fillPath: "M0,140 C38,140 76,118 114,118 C152,118 191,132 229,132 C267,132 305,100 343,100 C381,100 419,112 457,112 C495,112 533,82 571,82 C609,82 648,96 686,96 C724,96 762,88 800,88 L800,200 L0,200 Z",
      labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    },
    Month: {
      path:     "M0,130 C22,130 45,120 67,120 C89,120 111,140 133,140 C155,140 178,110 200,110 C222,110 245,130 267,130 C289,130 311,100 333,100 C355,100 378,120 400,120 C422,120 445,90 467,90 C489,90 511,130 533,130 C555,130 578,105 600,105 C622,105 645,120 667,120 C689,120 711,108 733,108 C756,108 778,115 800,115",
      fillPath: "M0,130 C22,130 45,120 67,120 C89,120 111,140 133,140 C155,140 178,110 200,110 C222,110 245,130 267,130 C289,130 311,100 333,100 C355,100 378,120 400,120 C422,120 445,90 467,90 C489,90 511,130 533,130 C555,130 578,105 600,105 C622,105 645,120 667,120 C689,120 711,108 733,108 C756,108 778,115 800,115 L800,200 L0,200 Z",
      labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    }
  };

  const currentGraph = graphData[activeTab];

  if (viewMode === 'all') {
    return (
      <div className="flex-1 space-y-8 p-8 font-display bg-background-light dark:bg-background-dark min-h-full">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode('summary')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Full Health History</h2>
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Medical Visits Log</h3>
              <p className="text-xs text-slate-500 font-medium">Detailed history of all clinical encounters</p>
            </div>
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search records..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRecords.map(record => (
              <div key={record.id} className="p-5 flex gap-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{record.month}</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{record.day}</span>
                  <div className="w-px h-full bg-slate-200 dark:bg-slate-700 my-3 group-hover:bg-primary/20 transition-colors"></div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{record.title}</h4>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider shrink-0">Archived</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Diagnosis: {record.diagnosis}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">{record.doctor}</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">{record.facility}</span>
                    {record.tags.map(tag => (
                      <span key={tag} className="text-xs bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg text-primary font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filteredRecords.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                No records matched "<span className="font-bold">{searchQuery}</span>"
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 font-display bg-background-light dark:bg-background-dark min-h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">My Health</h2>
        <p className="text-slate-500">Real-time health monitoring and AI-powered insights for your wellness journey.</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Health Snapshot
          </h3>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['Day', 'Week', 'Month'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex flex-wrap gap-8 items-end justify-between mb-8">
            <div className="flex gap-12">
              <Metric value="72" unit="BPM" label="Heart Rate" color="text-red-500" trend="+2% vs avg" />
              <Metric value="98.5" unit="%" label="SpO2" color="text-primary" trend="Normal" />
              <Metric value="120/80" unit="mmHg" label="BP" color="text-blue-500" trend="Optimal" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Focus</p>
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                Recovery Path A
              </div>
            </div>
          </div>
          
          <div className="relative h-[200px] w-full bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button onClick={resetZoom} className="px-3 py-1 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:text-primary transition-colors">Reset View</button>
              <div className="px-3 py-1 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg text-[10px] font-black uppercase text-primary">{zoomPercent}% Zoom</div>
            </div>
            <svg 
              ref={svgRef}
              viewBox={`${vbX} 0 ${vbW} ${GRAPH_H}`}
              className="w-full h-full cursor-grab active:cursor-grabbing preserve-3d"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b77f" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b77f" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              {[0, 50, 100, 150].map(y => (
                <line key={y} x1="-1000" y1={y} x2="2000" y2={y} stroke="currentColor" className="text-slate-200/50 dark:text-slate-700/50" strokeWidth="0.5" />
              ))}
              <path d={currentGraph.fillPath} fill="url(#graphGradient)" transition="all 0.5s ease" />
              <path d={currentGraph.path} fill="none" stroke="#10b77f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" transition="all 0.5s ease" />
              {/* Data points */}
              {currentGraph.path.split(/[MCL]/).filter(Boolean).map((pt, i) => {
                const [x, y] = pt.trim().split(/[\s,]+/).map(Number);
                if (isNaN(x) || isNaN(y)) return null;
                return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#10b77f" strokeWidth="2" />;
              })}
            </svg>
            <div className="absolute bottom-2 left-0 right-0 flex justify-between px-6 pointer-events-none">
              {currentGraph.labels.map(label => (
                <span key={label} className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Records</h3>
            <button onClick={() => setViewMode('all')} className="text-xs font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {HISTORY_RECORDS.slice(0, 3).map(record => (
              <div key={record.id} className="p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <span className="text-[10px] font-black leading-none">{record.month}</span>
                  <span className="text-lg font-black leading-none">{record.day}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{record.title}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{record.doctor} • {record.facility}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors self-center">chevron_right</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-9xl opacity-10 rotate-12">clinical_notes</span>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2 tracking-tight">AI Health Insight</h3>
            <p className="text-primary-foreground/90 text-sm leading-relaxed mb-6 font-medium">
              Your "Pulse Score" has improved by 4% this month. Your consistent morning activity is positively impacting your cardiovascular recovery profile.
            </p>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground">Monthly Goal</span>
                <span className="text-xs font-bold">85% Complete</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[85%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ value, unit, label, color, trend }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black tracking-tight ${color}`}>{value}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
      </div>
      <p className="text-[11px] font-bold text-slate-500 mt-0.5">{label}</p>
      <p className="text-[9px] font-extrabold text-primary mt-1 flex items-center gap-0.5">
        <span className="material-symbols-outlined text-[10px]">trending_up</span>
        {trend}
      </p>
    </div>
  );
}
