import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, UserCircle, ShieldAlert, User, Stethoscope, X, Check, Activity, Pill, Calendar, AlertTriangle, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TopNav({ role, onRoleChange, onLogout }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
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
          className: "text-primary border-primary/30 bg-primary/10 hover:bg-primary/20",
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
    { id: 3, title: 'New Consultation', message: 'John Doe booked a routine checkup for today.', time: '3 hours ago', icon: Calendar, color: 'text-primary', bg: 'bg-primary/10', unread: false },
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
            placeholder={role === 'patient' ? "Search health records..." : "Search patients, staff, or records..."}
            className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
          />
        </div>
        {role === 'admin' && (
           <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full ml-4 whitespace-nowrap">
              <ShieldAlert className="text-emerald-700 h-3 w-3" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">HIPAA Secure</span>
           </div>
        )}
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

        <div className="flex items-center space-x-2 border-l pl-4" ref={profileRef}>
          {/* Admin Specific Action Bar */}
          {role === 'admin' && (
            <div className="hidden lg:flex items-center gap-4 mr-4 pr-4 border-r border-slate-200">
               <div className="flex items-center gap-2 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-medium">System: Optimal</span>
               </div>
               <Button className="bg-red-500 hover:bg-red-600 text-white h-8 text-xs font-bold px-3 py-1 flex items-center gap-1 transition-colors">
                  <ShieldAlert className="h-3 w-3" />
                  EMERGENCY
               </Button>
            </div>
          )}

          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
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

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 md:hidden">
                <p className="text-sm font-medium leading-none">
                  {role === 'patient' ? 'Eleanor Vance' : 'Dr. Sarah Jenkins'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {role === 'admin' ? 'System Administrator' : role === 'doctor' ? 'Chief Medical Officer' : 'Patient'}
                </p>
              </div>
              <div className="p-2">
                {onLogout && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
