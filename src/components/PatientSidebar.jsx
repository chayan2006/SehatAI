import React from 'react';
import { Home, Pill, Calendar, Activity, Settings, PhoneCall, Ambulance } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PatientSidebar({ className, activeTab, onTabChange }) {
  const navItems = [
    { id: 'dashboard', label: 'My Health', icon: Home },
    { id: 'medications', label: 'Medications', icon: Pill, badge: 1 },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'history', label: 'Health History', icon: Activity },
    { id: 'ambulance', label: 'Emergency SOS', icon: Ambulance },
  ];

  return (
    <div className={cn("pb-12 min-h-screen w-64 border-r bg-blue-950 text-blue-100 flex flex-col sticky top-0", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white flex items-center">
            <Activity className="mr-2 h-5 w-5 text-blue-400" />
            MyHealth Portal
          </h2>
          <div className="space-y-1 mt-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === item.id
                    ? "bg-blue-900/50 text-blue-300 hover:bg-blue-900/70"
                    : "hover:bg-blue-900/30 hover:text-white",
                  item.id === 'ambulance' && "text-red-400 hover:text-red-300 hover:bg-red-900/30"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 py-2 mt-auto">
        <div className="space-y-1">
          <button
            onClick={() => onTabChange('settings')}
            className={cn(
              "w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === 'settings'
                ? "bg-blue-900/50 text-blue-300 hover:bg-blue-900/70"
                : "hover:bg-blue-900/30 hover:text-white"
            )}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
