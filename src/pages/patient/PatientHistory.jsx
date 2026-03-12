import React, { useState, useRef, useCallback } from 'react';

const GRAPH_W = 800;
const GRAPH_H = 200;
const MAX_VBW = GRAPH_W * 2.5; // allows zooming out to 40%

export default function PatientHistory({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Week');
  const [viewMode, setViewMode] = useState('summary');
  const [vbX, setVbX] = useState(0);
  const [vbW, setVbW] = useState(GRAPH_W);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, vbX: 0 });
  const svgRef = useRef(null);

  const MIN_VBW = 150; // max zoom in

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const applyZoom = useCallback((newVbW, centerX = vbX + vbW / 2) => {
    const clamped = clamp(newVbW, MIN_VBW, MAX_VBW);
    let newX;
    if (clamped > GRAPH_W) {
      // Zoomed OUT: center the graph data (0-800) in the wider viewBox
      newX = -(clamped - GRAPH_W) / 2;
    } else {
      // Zoomed IN: keep cursor/center stable and clamp to data bounds
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
    if (vbW >= GRAPH_W) return; // zoomed OUT or at 100% — no panning needed
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

  return (
    <div className="flex-1 space-y-8 p-8 font-display bg-background-light dark:bg-background-dark min-h-full">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">My Health</h2>
        <p className="text-slate-500">Real-time health monitoring and AI-powered insights for your wellness journey.</p>
      </div>

      {/* Health Snapshot: Real-time Vitals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Health Snapshot
          </h3>
          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1 border border-green-200">
            <span className="size-2 bg-green-500 rounded-full animate-pulse"></span> Live Sync
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Heart Rate */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Heart Rate</span>
              <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: '"FILL" 1' }}>favorite</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">72</span>
              <span className="text-slate-400 font-medium">BPM</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-red-500 font-bold flex items-center"><span className="material-symbols-outlined text-sm">trending_down</span> 2%</span>
              <span className="text-slate-400">from last hour</span>
            </div>
          </div>
          {/* Blood Pressure */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Blood Pressure</span>
              <span className="material-symbols-outlined text-blue-500" style={{ fontVariationSettings: '"FILL" 1' }}>blood_pressure</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">120/80</span>
              <span className="text-slate-400 font-medium">mmHg</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-green-500 font-bold flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> 1%</span>
              <span className="text-slate-400">Stable range</span>
            </div>
          </div>
          {/* SpO2 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">SpO2</span>
              <span className="material-symbols-outlined text-primary">air</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">98</span>
              <span className="text-slate-400 font-medium">%</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-bold flex items-center"><span className="material-symbols-outlined text-sm">horizontal_rule</span> 0%</span>
              <span className="text-slate-400">No change</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vitals History Graph */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">show_chart</span>
            Vitals History
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => applyZoom(vbW * 0.7)}
                title="Zoom In"
                className="px-2.5 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">zoom_in</span>
              </button>
              <span className="text-[10px] font-black text-slate-400 px-1 min-w-[38px] text-center">{zoomPercent}%</span>
              <button
                onClick={() => applyZoom(vbW * 1.3)}
                title="Zoom Out"
                className="px-2.5 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">zoom_out</span>
              </button>
              {vbW < GRAPH_W && (
                <button
                  onClick={resetZoom}
                  title="Reset zoom"
                  className="px-2.5 py-1.5 text-[10px] font-black text-primary hover:bg-primary/10 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-700"
                >
                  RESET
                </button>
              )}
            </div>
            {/* Period tabs */}
            <div className="flex gap-2">
              {['Day', 'Week', 'Month'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); resetZoom(); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* hint */}
        <p className="text-[10px] text-slate-400 font-medium mb-3">
          <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">mouse</span>
          Scroll to zoom · Click &amp; drag to pan when zoomed
        </p>
        <div
          className="h-64 w-full relative overflow-hidden rounded-xl select-none"
          style={{ cursor: vbW < GRAPH_W ? 'grab' : 'default' }}
        >
          <svg
            ref={svgRef}
            className="w-full h-full stroke-primary fill-none stroke-3"
            viewBox={`${vbX} 0 ${vbW} ${GRAPH_H}`}
            preserveAspectRatio="none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <path d={currentGraph.path}></path>
            <path className="fill-primary/5 stroke-0" d={currentGraph.fillPath}></path>
            {/* Grid lines */}
            <line className="stroke-slate-100 dark:stroke-slate-800 stroke-1" x1="0" x2="800" y1="40" y2="40"></line>
            <line className="stroke-slate-100 dark:stroke-slate-800 stroke-1" x1="0" x2="800" y1="90" y2="90"></line>
            <line className="stroke-slate-100 dark:stroke-slate-800 stroke-1" x1="0" x2="800" y1="140" y2="140"></line>
          </svg>
          <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-slate-400 font-bold px-4 pb-2 pointer-events-none">
            {currentGraph.labels.map((label, idx) => (
              <span key={idx}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Insights (AI Agents) */}
        <section className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            AI Health Insights
          </h3>
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>bolt</span>
                </div>
                <span className="text-sm font-bold text-primary">Optimization Tip</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Your resting heart rate has decreased by 2% over the last week. This indicates improved cardiovascular efficiency. Keep up the aerobic activity!
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>water_drop</span>
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Hydration Alert</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Based on your activity data, you are 15% behind your hydration goal for today. Aim for 2 more glasses before 6 PM.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-8 rounded-full bg-slate-400 dark:bg-slate-600 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>nightlight</span>
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Sleep Insight</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Deep sleep cycles were shorter than average last night. Consider reducing screen time 30 mins earlier today.
              </p>
            </div>
          </div>
        </section>

        {/* Medical History */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="material-symbols-outlined text-primary">history</span>
                Medical History {viewMode === 'all' && '(All Records)'}
              </h3>
              {viewMode === 'all' && (
                <div className="relative hidden sm:block">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</span>
                  <input type="text" placeholder="Search records..." className="pl-8 pr-3 py-1 bg-slate-100 dark:bg-slate-800 border-none rounded-md text-[11px] w-44 focus:ring-1 focus:ring-primary/20" />
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                setViewMode(viewMode === 'summary' ? 'all' : 'summary');
                if (viewMode === 'summary') {
                  // Scroll slightly to indicate change
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }
              }} 
              className="text-primary text-sm font-bold hover:underline transition-all cursor-pointer"
            >
              {viewMode === 'summary' ? 'View All Records' : 'Show Less'}
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Entry 1 */}
              <div className="p-5 flex gap-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oct</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">12</span>
                  <div className="w-px h-full bg-slate-200 dark:bg-slate-700 my-3 group-hover:bg-primary/20 transition-colors"></div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">Seasonal Allergies (Follow-up)</h4>
                    <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider shrink-0">Completed</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Diagnosis: Allergic Rhinitis</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">Dr. Sarah Miller</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">Prescription: Loratadine</span>
                  </div>
                </div>
              </div>
              
              {/* Entry 2 */}
              <div className="p-5 flex gap-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aug</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">28</span>
                  <div className="w-px h-full bg-slate-200 dark:bg-slate-700 my-3 group-hover:bg-primary/20 transition-colors"></div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">Annual Physical Examination</h4>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider shrink-0">Archived</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 font-medium">General check-up, blood work, and vaccinations.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">Dr. James Chen</span>
                    <span className="text-xs bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg text-primary font-bold">Healthy Range</span>
                  </div>
                </div>
              </div>

              {/* Entry 3 */}
              <div className="p-5 flex gap-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jun</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">05</span>
                  <div className="w-px h-full bg-slate-200 dark:bg-slate-700 my-3 group-hover:bg-primary/20 transition-colors"></div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">Minor Sports Injury (Ankle)</h4>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider shrink-0">Archived</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Diagnosis: Grade 1 Sprain</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">Physiotherapy Center</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">Treatment: R.I.C.E</span>
                  </div>
                </div>
              </div>

              {/* Entry 4 */}
              <div className="p-5 flex gap-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apr</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">18</span>
                  <div className="w-px h-full bg-slate-200 dark:bg-slate-700 my-3 group-hover:bg-primary/20 transition-colors"></div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">Telehealth Consultation</h4>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider shrink-0">Archived</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Follow-up on skin rash.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">Dr. Amy Watson</span>
                  </div>
                </div>
              </div>

              {/* Entry 5 */}
              <div className="p-5 flex gap-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feb</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">02</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">Emergency Room Visit</h4>
                    <span className="px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-extrabold uppercase tracking-wider shrink-0">Archived</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Severe abdominal pain - Appendicitis ruled out.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-800">Springfield General</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
