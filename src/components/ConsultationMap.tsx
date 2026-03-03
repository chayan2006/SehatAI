import React, { useState, useEffect } from 'react';
import { MapPin, Building2, User } from 'lucide-react';

export interface AppointmentLocation {
  id: number;
  patient: string;
  location: string;
  mode: string;
  x?: number;
  y?: number;
}

interface ConsultationMapProps {
  appointments: AppointmentLocation[];
}

export function ConsultationMap({ appointments }: ConsultationMapProps) {
  const [liveAppointments, setLiveAppointments] = useState(
    appointments.filter(a => a.mode === 'In-Person' && a.x !== undefined && a.y !== undefined)
  );

  // Simulate slight movement for patients waiting
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAppointments(prev => prev.map(apt => {
        // Randomly jitter x and y by a tiny amount to simulate pacing/waiting
        const jitterX = (Math.random() - 0.5) * 2; // -1 to 1
        const jitterY = (Math.random() - 0.5) * 2; // -1 to 1
        
        // Keep them within their general area
        const newX = Math.max(10, Math.min(90, (apt.x || 50) + jitterX));
        const newY = Math.max(10, Math.min(90, (apt.y || 50) + jitterY));

        return { ...apt, x: newX, y: newY };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[400px] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Floor Plan Elements */}
      <div className="absolute inset-8 border-4 border-slate-200 rounded-lg bg-white/50"></div>
      
      {/* Main Corridor */}
      <div className="absolute top-8 bottom-8 left-1/2 w-16 bg-slate-100 border-x-2 border-slate-200 transform -translate-x-1/2 flex items-center justify-center">
        <span className="text-slate-300 font-bold tracking-[0.5em] -rotate-90 whitespace-nowrap">MAIN CORRIDOR</span>
      </div>

      {/* Rooms / Departments */}
      <div className="absolute top-16 left-16 w-48 h-32 border-2 border-slate-200 rounded-lg bg-white flex items-start justify-start p-3 shadow-sm">
        <span className="text-sm font-bold text-slate-400">Main Wing (Rooms 300-350)</span>
      </div>
      
      <div className="absolute bottom-16 right-16 w-56 h-40 border-2 border-slate-200 rounded-lg bg-white flex items-start justify-start p-3 shadow-sm">
        <span className="text-sm font-bold text-slate-400">Cardiology Dept (4th Floor)</span>
      </div>

      {/* Central Desk */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
        <div className="h-16 w-16 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
          <Building2 className="h-6 w-6" />
        </div>
        <span className="text-[10px] font-bold text-slate-700 mt-1 bg-white/90 px-2 py-0.5 rounded shadow-sm">Reception</span>
      </div>

      {/* Patient Pins */}
      {liveAppointments.map((apt) => (
        <div key={apt.id} className="absolute flex flex-col items-center transition-all duration-3000 ease-in-out z-20"
             style={{ top: `${apt.y}%`, left: `${apt.x}%`, transform: 'translate(-50%, -100%)' }}>
          <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-200">
            {/* Radar rings to indicate active tracking */}
            <div className="absolute -inset-4 bg-teal-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute -inset-2 bg-teal-300/30 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
            
            {/* Main Icon */}
            <div className="h-8 w-8 bg-white border-2 border-teal-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
              <User className="h-4 w-4 text-teal-600" />
            </div>
            
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-900 text-white text-xs rounded p-3 shadow-xl z-30">
              <p className="font-bold text-sm mb-1">{apt.patient}</p>
              <p className="text-slate-300 flex items-start"><MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" /> {apt.location}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-700 mt-2 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-200">{apt.patient}</span>
        </div>
      ))}
    </div>
  );
}
