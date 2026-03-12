import React from 'react';

export default function PatientBookingConfirmation({ onNavigate }) {
  const handleAddToCalendar = () => {
    const event = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:Appointment with Dr. Sarah Mitchell',
      'DTSTART:20231024T110000',
      'DTEND:20231024T120000',
      "LOCATION:Saint Mary's Specialist Hospital",
      'DESCRIPTION:Senior Cardiologist appointment.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'appointment_dr_mitchell.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                Your appointment has been successfully scheduled. A confirmation email has been sent to your inbox.
            </p>
          </div>
        </div>

        {/* Appointment Details Card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Appointment Details</h3>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <img 
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80" 
              alt="Hospital" 
              className="w-[120px] h-[120px] object-cover rounded-xl shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm bg-slate-100"
            />
            <div className="flex-1 w-full space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-widest font-extrabold text-primary mb-1">Doctor</p>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">Dr. Sarah Mitchell</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Senior Cardiologist</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 pt-1">
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>location_on</span>
                    Hospital
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                    Saint Mary's Specialist<br/>Hospital
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Date & Time
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Oct 24 • 11:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button onClick={handleAddToCalendar} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm shadow-primary/20 text-sm">
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                Add to Calendar
            </button>
            <button onClick={() => onNavigate?.('appointments')} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold transition-all text-sm">
                <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                Reschedule
            </button>
            <button 
                onClick={() => onNavigate?.('dashboard')}
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold transition-all text-sm"
            >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Dashboard
            </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center font-medium">
            Need help? <button onClick={() => onNavigate?.('support')} className="text-primary font-bold hover:underline cursor-pointer">Contact Support</button> or check our <button onClick={() => onNavigate?.('support')} className="text-primary font-bold hover:underline cursor-pointer">Help Center</button>.
        </p>

        {/* Map Banner */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm group border border-slate-200 dark:border-slate-800 bg-blue-50/50">
            <img 
              src="https://www.google.com/maps/d/thumbnail?mid=1rB9ZepWqWw0-y_aY01z_1lA659s&hl=en_US" 
              alt="Map location" 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity mix-blend-multiply dark:mix-blend-overlay dark:opacity-30"
            />
            
            <div className="absolute bottom-4 left-4 z-10">
                <button 
                  onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=Saint+Mary%27s+Specialist+Hospital', '_blank')}
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white px-4 py-2 rounded-lg font-bold text-[13px] shadow-md hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700 cursor-pointer"
                >
                    Get Directions
                </button>
            </div>
            
            {/* Map pin centered */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
               <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-2 border-primary">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>location_on</span>
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}
