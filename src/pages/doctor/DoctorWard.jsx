import React, { useState } from 'react';
import { 
  BedDouble, User, Activity, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';

export default function DoctorWard() {
  const [beds, setBeds] = useState([
    {
      id: '101',
      status: 'occupied',
      patient: 'John Doe',
      admitted: '2 days ago',
      condition: 'Stable',
      critical: false
    },
    {
      id: '102',
      status: 'available',
      patient: null,
      admitted: null,
      condition: null,
      critical: false
    },
    {
      id: '103',
      status: 'maintenance',
      patient: null,
      admitted: null,
      condition: null,
      critical: false
    },
    {
      id: '104',
      status: 'occupied',
      patient: 'Jane Smith',
      admitted: '1 day ago',
      condition: 'Critical',
      critical: true
    }
  ]);

  const stats = {
    total: 120,
    available: beds.filter(b => b.status === 'available').length + 43, // Mocking larger total
    occupied: beds.filter(b => b.status === 'occupied').length + 70,
    maintenance: beds.filter(b => b.status === 'maintenance').length + 2
  };

  const handleBedClick = (id) => {
    // Interactive simulation: toggle an available bed to occupied
    setBeds(prev => prev.map(bed => {
      if (bed.id === id && bed.status === 'available') {
        return {
          ...bed,
          status: 'occupied',
          patient: 'New Patient',
          admitted: 'Just now',
          condition: 'Under Observation',
          critical: false
        };
      }
      return bed;
    }));
  };

  const dischargePatient = (id) => {
    setBeds(prev => prev.map(bed => {
      if (bed.id === id) {
        return {
          ...bed,
          status: 'available',
          patient: null,
          admitted: null,
          condition: null,
          critical: false
        };
      }
      return bed;
    }));
  };

  return (
    <div className="space-y-8">
      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-[#00b289]/10 p-4 rounded-lg">
              <BedDouble className="h-8 w-8 text-[#00b289]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Beds</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.total}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Available</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.available}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg">
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Occupied</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.occupied}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Maintenance</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.maintenance}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Status Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BedDouble className="h-6 w-6 text-[#00b289]" />
            Ward 1: Intensive Care Unit
          </h2>
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-bold rounded-full">
            High Capacity
          </span>
        </div>
        
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {beds.map((bed) => {
            if (bed.status === 'occupied') {
              return (
                <div key={bed.id} className={`bg-slate-50 dark:bg-slate-800/50 rounded-xl border p-4 ${bed.critical ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">Bed {bed.id}</span>
                    <span className={`h-2 w-2 rounded-full ${bed.critical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bed.critical ? 'bg-red-200 dark:bg-red-800 text-red-600 dark:text-red-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{bed.patient}</p>
                      <p className={`text-xs font-semibold ${bed.critical ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
                        {bed.critical ? bed.condition : `Admitted: ${bed.admitted}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className={`flex items-center gap-2 text-xs ${bed.critical ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-600 dark:text-slate-400'}`}>
                      <Activity className="h-4 w-4" /> {bed.critical ? 'Monitoring Required' : `Vitals ${bed.condition}`}
                    </div>
                    <button 
                      onClick={() => dischargePatient(bed.id)}
                      className="text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-2 py-1 rounded text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Discharge
                    </button>
                  </div>
                </div>
              );
            }

            if (bed.status === 'available') {
              return (
                <button 
                  key={bed.id}
                  onClick={() => handleBedClick(bed.id)} 
                  className="bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/50 p-4 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 hover:bg-green-100 transition-all cursor-pointer"
                >
                  <BedDouble className="h-10 w-10 text-green-500 mb-2" />
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Bed {bed.id}</span>
                  <span className="text-sm font-semibold text-green-600 mt-1">Available (Click to Assign)</span>
                </button>
              );
            }

            return (
              <div key={bed.id} className="bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 p-4 flex flex-col items-center justify-center text-center opacity-50">
                <AlertTriangle className="h-10 w-10 text-slate-400 mb-2" />
                <span className="text-lg font-bold text-slate-900 dark:text-white">Bed {bed.id}</span>
                <span className="text-sm font-semibold text-slate-500 mt-1">Maintenance</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
