import React from 'react';
import { LayoutDashboard, Users, Activity, Calendar, Settings, Bell, ShieldAlert, PhoneCall, Ambulance, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({ className, activeTab, onTabChange, user }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'alerts', label: 'Emergency Alerts', icon: ShieldAlert, badge: 3 },
    { id: 'ambulance', label: 'Ambulance Fleet', icon: Ambulance },
    { id: 'logs', label: 'Agent Logs', icon: PhoneCall },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: Activity },
  ];

  return (
    <div className={cn("pb-12 min-h-screen w-64 border-r bg-slate-950 text-slate-300 flex flex-col sticky top-0", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white flex items-center">
            <Activity className="mr-2 h-5 w-5 text-emerald-500" />
            HealthAgent AI
          </h2>
          <div className="space-y-1 mt-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === item.id
                    ? "bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60"
                    : "hover:bg-slate-900 hover:text-white"
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
      
      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900 cursor-pointer group">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 border border-slate-700">
            <UserCircle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold truncate text-white">{user?.name || 'Loading...'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
