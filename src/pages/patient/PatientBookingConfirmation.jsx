import React, { useState, useEffect } from 'react';

export default function PatientBookingConfirmation({ onNavigate }) {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('sehat_appointments');
    if (saved) {
      const apts = JSON.parse(saved);
      if (apts.length > 0) {
        setBooking(apts[apts.length - 1]);
      }
    }
  }, []);

  const handleAddToCalendar = () => {
    if (!booking) return;
    const event = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:Appointment at ${booking.facility.name}`,
      `DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `LOCATION:${booking.facility.location}`,
      `DESCRIPTION:Medical appointment booked via SehatAI.`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `appointment_${booking.facility.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!booking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark h-full">
         <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl">
           <h2 className="text-xl font-bold mb-4">No recent booking found</h2>
           <button onClick={() => onNavigate('dashboard')} className="bg-primary text-white px-6 py-2 rounded-xl font-bold">Go to Dashboard</button>
         </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 font-display bg-background-light dark:bg-background-dark min-h-full pb-12">
      <div className="flex flex-col items-center justify-center max-w-3xl mx-auto px-8 py-12 w-full space-y-10">
        
        {/* Success Icon & Header */}
        <div className="text-center space-y-6">
          <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Booking Confirmed!</h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                Your appointment at {booking.facility.name} has been successfully scheduled. A confirmation email has been sent to your inbox.
            </p>
          </div>
        </div>

        {/* Appointment Details Card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Appointment Details</h3>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
             <div className="size-24 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
                 <img src={booking.facility.image} alt="" className="w-full h-full object-cover rounded-xl" />
             </div>
             <div className="flex-1 space-y-4">
                <div>
                   <h4 className="text-xl font-bold text-slate-900 dark:text-white">{booking.facility.name}</h4>
                   <p className="text-slate-500 dark:text-slate-400">{booking.facility.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Date</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{booking.date}</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Time Slot</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{booking.slot}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
           <button onClick={handleAddToCalendar} className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 py-4 rounded-2xl font-black text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
             <span className="material-symbols-outlined">calendar_add_on</span>
             Add to Calendar
           </button>
           <button onClick={() => onNavigate('dashboard')} className="flex-1 bg-primary py-4 rounded-2xl font-black text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
             <span className="material-symbols-outlined">dashboard</span>
             Return to Dashboard
           </button>
        </div>
      </div>
    </div>
  );
}
