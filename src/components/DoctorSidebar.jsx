import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Activity, Users, Stethoscope, AlertCircle, HeartPulse, 
  BedDouble, Calendar, Pill, FlaskConical, Receipt, 
  BarChart2, ShieldCheck, MessageSquare
} from 'lucide-react';

export function DoctorSidebar({ className, activeTab, onTabChange, user }) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'patients', label: 'Patient Management', icon: Users },
    { id: 'staff', label: 'Staff', icon: Stethoscope },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle },
    { id: 'vitals', label: 'Vitals', icon: HeartPulse },
    { id: 'ward', label: 'Ward/Bed', icon: BedDouble },
  ];

  const secondaryNavItems = [
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    { id: 'lab', label: 'Lab', icon: FlaskConical },
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <aside className={cn("w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-screen sticky top-0", className)}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#00b289] rounded-lg flex items-center justify-center text-white">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none text-slate-900 dark:text-white">Sehat AI</h1>
          <p className="text-xs text-slate-500 font-medium">Healthcare SaaS</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 space-y-1 no-scrollbar pb-4">
        {mainNavItems.map((item) => {
          // Keep active states working even if mapped to older components
          const isActive = activeTab === item.id || 
            (activeTab === 'triage' && item.id === 'emergency') || 
            (activeTab === 'consultations' && item.id === 'patients') || 
            (activeTab === 'ambulance' && item.id === 'emergency') || 
            (activeTab === 'ai-insights' && item.id === 'vitals');
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                isActive 
                  ? "bg-[#00b289]/10 text-[#00b289]" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}

        <div className="my-4 border-t border-slate-100 dark:border-slate-800"></div>

        {secondaryNavItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                isActive 
                  ? "bg-[#00b289]/10 text-[#00b289]" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
          <div 
            className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAZyi6wRVH7rOiDaIljA0jMG-SLjzrTnX6uWbglYVRkplpyvp-C0KueyvZDu2GOCq9ryIrWLsu3BVTW59nAfUVwZTKJWc44VHWTOcy2xV3oSa_XaUCJYZtkciYopWn2aeMzWtBCnMoOOxjjoxo06SWW3nFcbD8GzOwGswxYWPx4whOLC6poO7H484xELqtQHj4tlDOZLAoPwVzlMLa8WU6J_xe6xZwEB6XsfBd1ldXAo1zzfuxfmGWTJvtzVeCAwH0HLqGaqof8el9j')" }}
          ></div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{user?.name || 'Loading...'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role || 'User'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
