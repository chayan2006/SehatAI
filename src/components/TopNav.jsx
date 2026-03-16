import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, ShieldAlert, User, Stethoscope, X, Check, Activity, Pill, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { patientService, hospitalService } from '@/database';
import { Loader2 } from 'lucide-react';

export function TopNav({ role, onRoleChange, onLogout, user, onNavigate }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ patients: [], staff: [] });
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchQuery('');
        setSearchResults({ patients: [], staff: [] });
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ patients: [], staff: [] });
        return;
      }

      setIsSearching(true);
      try {
        const hospital = await hospitalService.getMyHospital();
        if (!hospital) return;

        const [patients, staff] = await Promise.all([
          patientService.searchPatients(hospital.id, searchQuery),
          hospitalService.searchStaff(hospital.id, searchQuery)
        ]);

        setSearchResults({ patients, staff });
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (tab, id) => {
    onNavigate(tab);
    setSearchQuery('');
    setSearchResults({ patients: [], staff: [] });
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

  return (
    <div className="border-b bg-white h-16 flex items-center px-6 justify-between sticky top-0 z-10">
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full" ref={searchRef}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={role === 'patient' ? "Search health records..." : "Search patients, staff, or records..."}
            className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          )}

          {/* Search Results Dropdown */}
          {(searchResults.patients.length > 0 || searchResults.staff.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="max-h-[400px] overflow-y-auto">
                {searchResults.patients.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Patients</p>
                    {searchResults.patients.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => handleResultClick('patients', p.id)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                          {p.full_name?.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{p.full_name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: {p.external_id}</p>
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
                
                {searchResults.staff.length > 0 && (
                  <div className="p-2 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Medical Staff</p>
                    {searchResults.staff.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => handleResultClick('staff', s.id)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                          {s.name?.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{s.name}</p>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{s.role || 'Staff'}</p>
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {role === 'admin' && (
           <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full ml-4 whitespace-nowrap">
              <ShieldAlert className="text-emerald-700 h-3 w-3" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">HIPAA Secure</span>
           </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Role switching is now disabled to ensure session integrity */}
        
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
      </div>
    </div>
  );
}
