import React from 'react';
import { Stethoscope, AlertCircle, Users, Video, Activity, Settings, Ambulance } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoctorSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DoctorSidebar({ className, activeTab, onTabChange }: DoctorSidebarProps) {
  const navItems = [
    { id: 'triage', label: 'Emergency Triage', icon: AlertCircle, badge: 2 },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'consultations', label: 'Consultations', icon: Video, badge: 4 },
    { id: 'ambulance', label: 'EMS Dispatch', icon: Ambulance },
    { id: 'ai-insights', label: 'AI Insights & Logs', icon: Activity },
  ];

  return (
    <div className={cn("pb-12 min-h-screen w-64 border-r bg-teal-950 text-teal-100 flex flex-col sticky top-0", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white flex items-center">
            <Stethoscope className="mr-2 h-5 w-5 text-teal-400" />
            Clinic Portal
          </h2>
          <div className="space-y-1 mt-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === item.id
                    ? "bg-teal-900/50 text-teal-300 hover:bg-teal-900/70"
                    : "hover:bg-teal-900/30 hover:text-white"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
                ? "bg-teal-900/50 text-teal-300 hover:bg-teal-900/70"
                : "hover:bg-teal-900/30 hover:text-white"
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
