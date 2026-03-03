import React, { useEffect, useState } from 'react';
import { MapPin, Ambulance, Building2 } from 'lucide-react';

export interface Dispatch {
  id: number;
  unit: string;
  patient: string;
  eta: string;
  progress: number; // 0 to 100
  destY: number; // Percentage for Y coordinate of destination (e.g., 20 or 80)
}

interface AmbulanceMapProps {
  dispatches: Dispatch[];
}

export function AmbulanceMap({ dispatches }: AmbulanceMapProps) {
  // Optional: Add a little animation to the progress to make it feel "live"
  const [liveDispatches, setLiveDispatches] = useState(dispatches);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveDispatches(prev => prev.map(d => {
        if (d.progress >= 98) return d;
        // Slowly increment progress to simulate movement
        return { ...d, progress: d.progress + 0.5 };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [dispatches]);

  // Calculate position along a quadratic bezier curve
  const getPointOnCurve = (t: number, y2: number) => {
    const x0 = 25, y0 = 50; // Hospital (Start)
    const x1 = 50, y1 = y2; // Control point
    const x2 = 80;          // Destination (End)
    
    const x = Math.pow(1 - t, 2) * x0 + 2 * (1 - t) * t * x1 + Math.pow(t, 2) * x2;
    const y = Math.pow(1 - t, 2) * y0 + 2 * (1 - t) * t * y1 + Math.pow(t, 2) * y2;
    
    return { x, y };
  };

  return (
    <div className="relative w-full h-[400px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      {/* Simulated Map Background (Grid) */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Hospital Location */}
      <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg z-10 border-2 border-white">
          <Building2 className="h-6 w-6" />
        </div>
        <span className="text-xs font-bold text-slate-700 mt-2 bg-white/90 px-2 py-0.5 rounded shadow-sm">Central Hospital</span>
      </div>

      {/* Routes and Ambulances */}
      {liveDispatches.map((dispatch) => {
        const t = dispatch.progress / 100;
        const currentPos = getPointOnCurve(t, dispatch.destY);
        
        return (
          <React.Fragment key={dispatch.id}>
            {/* Route Line (Background) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path 
                d={`M 25% 50% Q 50% ${dispatch.destY}% 80% ${dispatch.destY}%`} 
                fill="none" 
                stroke="#94a3b8" 
                strokeWidth="4" 
                strokeDasharray="8 8" 
                className="opacity-50"
              />
              {/* Route Line (Progress) - Using a simple trick with strokeDasharray for SVG path progress isn't perfect for curves, 
                  so we'll just show the full path and let the ambulance icon show progress */}
              <path 
                d={`M 25% 50% Q 50% ${dispatch.destY}% 80% ${dispatch.destY}%`} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="4" 
                className="opacity-30"
              />
            </svg>

            {/* Patient Location (Destination) */}
            <div className="absolute flex flex-col items-center transition-all" style={{ top: `${dispatch.destY}%`, left: '80%', transform: 'translate(-50%, -100%)' }}>
              <MapPin className="h-8 w-8 text-red-500 drop-shadow-md -mb-2 relative z-10" />
              <span className="text-xs font-bold text-slate-700 mt-2 bg-white/90 px-2 py-0.5 rounded shadow-sm">{dispatch.patient}</span>
            </div>

            {/* Ambulance Current Location */}
            <div className="absolute flex flex-col items-center transition-all duration-1000 ease-linear z-20" 
                 style={{ 
                   top: `${currentPos.y}%`, 
                   left: `${currentPos.x}%`,
                   transform: 'translate(-50%, -50%)' 
                 }}>
              <div className="relative">
                {dispatch.progress < 98 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                )}
                <div className="h-10 w-10 bg-white border-2 border-red-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                  <Ambulance className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded mt-2 shadow-md whitespace-nowrap">
                {dispatch.unit} • ETA: {dispatch.eta}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
