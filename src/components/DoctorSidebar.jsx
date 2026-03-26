import React from 'react';
import { cn } from '@/lib/utils';

export function DoctorSidebar({ className, activeTab, onTabChange }) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Analytics', icon: 'analytics' },
    { id: 'patients', label: 'Patient Management', icon: 'person' },
    { id: 'staff', label: 'Staff', icon: 'group' },
    { id: 'emergency', label: 'Emergency', icon: 'emergency' },
    { id: 'vitals', label: 'Vitals', icon: 'vital_signs' },
    { id: 'ward', label: 'Ward/Bed', icon: 'bed' },
  ];

  const secondaryNavItems = [
    { id: 'pharmacy', label: 'Pharmacy', icon: 'pill' },
    { id: 'lab', label: 'Lab', icon: 'science' },
    { id: 'billing', label: 'Billing', icon: 'payments' },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full flex flex-col py-6 px-4 w-64 border-r border-emerald-50/50 dark:border-emerald-900/20 bg-white dark:bg-slate-900 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transition-all duration-300", 
      className
    )}>
      <div className="flex items-center gap-3 px-2 mb-10 group">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tighter text-emerald-600 dark:text-emerald-400 leading-none">SehatAI</h1>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Hospital Command Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id || 
            (activeTab === 'triage' && item.id === 'emergency') || 
            (activeTab === 'consultations' && item.id === 'patients') || 
            (activeTab === 'ambulance' && item.id === 'emergency');
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group",
                isActive 
                  ? "text-emerald-700 dark:text-emerald-300 font-bold border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/30" 
                  : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20"
              )}
            >
              <span className={cn(
                "material-symbols-outlined transition-transform duration-200",
                isActive ? "fill-1 scale-110" : "group-hover:scale-110"
              )} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className="font-semibold text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}

        <div className="my-6 border-t border-slate-50 dark:border-slate-800 mx-2"></div>

        {secondaryNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group",
                isActive 
                  ? "text-emerald-700 dark:text-emerald-300 font-bold border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/30" 
                  : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20"
              )}
            >
              <span className={cn(
                "material-symbols-outlined transition-transform duration-200",
                isActive ? "fill-1 scale-110" : "group-hover:scale-110"
              )} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className="font-semibold text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-emerald-50/50 dark:border-slate-800 space-y-3">
        <button 
          onClick={() => onTabChange('dashboard')}
          className="w-full bg-primary hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl mb-4 shadow-xl shadow-primary/20 hover:shadow-primary/40 transform active:scale-95 transition-all"
        >
          New Admission
        </button>
        <button 
          onClick={() => onTabChange('settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-all font-bold text-sm"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
          <span>Settings</span>
        </button>
        <button 
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-all font-bold text-sm"
        >
          <span className="material-symbols-outlined text-lg">help</span>
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
}
