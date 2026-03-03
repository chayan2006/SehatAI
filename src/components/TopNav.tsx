import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, UserCircle, ShieldAlert, User, Stethoscope, X, Check, Activity, Pill, Calendar, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type Role = 'admin' | 'doctor' | 'patient';

interface TopNavProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export function TopNav({ role, onRoleChange }: TopNavProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cycleRole = () => {
    if (role === 'admin') onRoleChange('doctor');
    else if (role === 'doctor') onRoleChange('patient');
    else onRoleChange('admin');
    setShowNotifications(false);
  };

  const getRoleButtonProps = () => {
    switch (role) {
      case 'admin':
        return {
          className: "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
          icon: <ShieldAlert className="mr-2 h-4 w-4" />,
          text: "Switch Role (Admin)"
        };
      case 'doctor':
        return {
          className: "text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100",
          icon: <Stethoscope className="mr-2 h-4 w-4" />,
          text: "Switch Role (Doctor)"
        };
      case 'patient':
        return {
          className: "text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100",
          icon: <User className="mr-2 h-4 w-4" />,
          text: "Switch Role (Patient)"
        };
    }
  };

  const patientNotifications = [
    { id: 1, title: 'Medication Reminder', message: 'Time to take Lisinopril 10mg.', time: '10 mins ago', icon: Pill, color: 'text-blue-600', bg: 'bg-blue-100', unread: true },
    { id: 2, title: 'AI Insight', message: 'Your blood pressure has been stable for 3 days. Great job!', time: '2 hours ago', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100', unread: true },
    { id: 3, title: 'Appointment Update', message: 'Your telehealth link for tomorrow is ready.', time: '1 day ago', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100', unread: false },
  ];

  const doctorNotifications = [
    { id: 1, title: 'Critical Alert', message: 'Eleanor Vance HR > 110 bpm. Ambulance dispatched.', time: 'Just now', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', unread: true },
    { id: 2, title: 'AI Escalation', message: 'Alice Smith missed medication for 3 consecutive days.', time: '1 hour ago', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100', unread: true },
    { id: 3, title: 'New Consultation', message: 'John Doe booked a routine checkup for today.', time: '3 hours ago', icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-100', unread: false },
  ];

  const adminNotifications = [
    { id: 1, title: 'System Alert', message: 'Database backup completed successfully.', time: '1 hour ago', icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-100', unread: true },
    { id: 2, title: 'Fleet Dispatch', message: 'Medic-42 dispatched to 123 Maple St.', time: '2 hours ago', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', unread: false },
  ];

  const notifications = role === 'patient' ? patientNotifications : role === 'doctor' ? doctorNotifications : adminNotifications;
  const unreadCount = notifications.filter(n => n.unread).length;

  const buttonProps = getRoleButtonProps();

  return (
    <div className="border-b bg-white h-16 flex items-center px-6 justify-between sticky top-0 z-10">
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder={role === 'patient' ? "Search health records..." : "Search patients, alerts, or agents..."}
            className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={cycleRole}
          className={buttonProps.className}
        >
          {buttonProps.icon}
          {buttonProps.text}
        </Button>
        
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-slate-500 hover:text-slate-900"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{unreadCount} new</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 ${notification.unread ? 'bg-slate-50/50' : ''}`}
                      >
                        <div className={`p-2 rounded-full flex-shrink-0 ${notification.bg} ${notification.color}`}>
                          <notification.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-sm font-medium truncate ${notification.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notification.title}
                            </p>
                            {notification.unread && <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>}
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2 leading-snug">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Bell className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50">
                <Button variant="ghost" className="w-full text-sm text-slate-600 hover:text-slate-900 h-8">
                  Mark all as read
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 border-l pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none">
              {role === 'patient' ? 'Eleanor Vance' : 'Dr. Sarah Jenkins'}
            </p>
            <p className="text-xs text-slate-500">
              {role === 'admin' ? 'System Administrator' : role === 'doctor' ? 'Chief Medical Officer' : 'Patient'}
            </p>
          </div>
          <UserCircle className="h-8 w-8 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
