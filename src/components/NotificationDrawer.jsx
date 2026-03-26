import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, BellOff, CheckCheck, Calendar, Ambulance, AlertTriangle, FlaskConical, Receipt, Info, Loader2 } from 'lucide-react';
import { notificationService } from '@/database/notificationService';
import { hospitalService } from '@/database/hospitalService';

const TYPE_CONFIG = {
  appointment: { icon: Calendar,     bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100',    label: 'Appointment' },
  ambulance:   { icon: Ambulance,    bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100',     label: 'Ambulance'   },
  critical:    { icon: AlertTriangle,bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100',     label: 'Critical'    },
  warning:     { icon: AlertTriangle,bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   label: 'Warning'     },
  lab:         { icon: FlaskConical, bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100',  label: 'Lab'         },
  billing:     { icon: Receipt,      bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Billing'     },
  success:     { icon: CheckCheck,   bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Success'     },
  info:        { icon: Info,         bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-100',   label: 'Info'        },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)  return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const MOCK_NOTIFICATIONS = [
  { id: 'm1', type: 'appointment', title: 'New Appointment Request', message: 'Priya Sharma booked a routine checkup for tomorrow.', is_read: false, created_at: new Date(Date.now() - 120000).toISOString() },
  { id: 'm2', type: 'critical',    title: 'Vitals Alert: John Doe', message: 'Heart rate exceeded 140 BPM for more than 2 minutes.', is_read: false, created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 'm3', type: 'ambulance',   title: 'Ambulance Dispatched', message: 'Unit Medic-42 dispatched to 123 Maple St. ETA: 8 mins.', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm4', type: 'lab',         title: 'Lab Result Ready', message: 'CBC report for Marcus Smith is now available.', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
];

export default function NotificationDrawer({ open, onClose, userId, hospitalId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!userId || !hospitalId) return;
    setLoading(true);
    try {
      const data = await notificationService.getMyNotifications(hospitalId, userId);
      if (data.length > 0) {
        setNotifications(data);
        setIsMock(false);
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
        setIsMock(true);
      }
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  }, [userId, hospitalId]);

  // Load + mark all read when drawer opens
  useEffect(() => {
    if (open) {
      loadNotifications();
      if (userId && !isMock) {
        notificationService.markAllRead(userId).catch(() => {});
      }
    }
  }, [open, loadNotifications, userId, isMock]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const sub = notificationService.subscribeToNotifications(userId, (payload) => {
      if (payload.new) {
        setNotifications(prev => [payload.new, ...prev]);
      }
    });
    return () => { if (sub) sub.unsubscribe(); };
  }, [userId]);

  const markRead = async (notif) => {
    if (isMock) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      return;
    }
    try {
      await notificationService.markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-900 flex items-center gap-2">
              <Bell size={18} className="text-[#00b289]" />
              Notifications
              {isMock && <span className="text-[8px] px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-full uppercase font-black">Demo</span>}
            </h2>
            {unread > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">{unread} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && !isMock && (
              <button
                onClick={() => notificationService.markAllRead(userId).then(() => setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))))}
                className="text-[10px] font-black text-[#00b289] uppercase tracking-wider hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={24} className="animate-spin text-[#00b289]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-300">
              <BellOff size={48} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-sm">All caught up!</p>
              <p className="text-xs mt-1">No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map(notif => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif)}
                    className={`flex gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50 ${!notif.is_read ? 'bg-[#00b289]/[0.02]' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`shrink-0 size-9 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                      <Icon size={16} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-bold leading-tight ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="shrink-0 size-2 rounded-full bg-[#00b289] mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-black">
            Real-time • Powered by Supabase
          </p>
        </div>
      </div>
    </>
  );
}
