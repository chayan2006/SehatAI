import React, { useState, useEffect } from 'react';
import { hospitalService } from '@/database/hospitalService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PAYMENT_OPTIONS = ['UPI', 'Cash', 'Credit/Debit Card', 'Health Insurance', 'CGHS', 'Mediclaim'];

const defaultHours = Object.fromEntries(DAYS.map(d => [d, { open: '09:00', close: '17:00', closed: false }]));

export default function HospitalSettings({ primaryColor = '#00b289', theme }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [hospitalData, setHospitalData] = useState({
    hospital_name: '',
    contact_name: 'Admin Desk',
    contact_email: '',
    contact_phone: '+91-11-2337-0000',
    emergency_phone: '102 / 112',
    total_capacity_beds: 100,
    address: '',
    is_emergency_24h: false,
    is_nabh_certified: false,
    payment_methods: [],
    operating_hours: defaultHours,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const h = await hospitalService.getMyHospital();
        if (h) {
          setHospitalData(prev => ({
            ...prev,
            ...h,
            contact_name: h.contact_name || 'Admin Desk',
            contact_phone: h.contact_phone || prev.contact_phone,
            emergency_phone: h.emergency_phone || prev.emergency_phone,
            is_emergency_24h: !!h.is_emergency_24h,
            is_nabh_certified: !!h.is_nabh_certified,
            payment_methods: Array.isArray(h.payment_methods) ? h.payment_methods : [],
            operating_hours: h.operating_hours && typeof h.operating_hours === 'object' ? h.operating_hours : defaultHours,
          }));
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedOk(false);
    try {
      const h = await hospitalService.getMyHospital();
      if (!h) throw new Error('Hospital not found');
      await hospitalService.updateHospital(h.id, {
        contact_name:       hospitalData.contact_name,
        contact_email:      hospitalData.contact_email,
        contact_phone:      hospitalData.contact_phone,
        emergency_phone:    hospitalData.emergency_phone,
        total_capacity_beds: parseInt(hospitalData.total_capacity_beds),
        address:            hospitalData.address,
        is_emergency_24h:   hospitalData.is_emergency_24h,
        is_nabh_certified:  hospitalData.is_nabh_certified,
        payment_methods:    hospitalData.payment_methods,
        operating_hours:    hospitalData.operating_hours,
      });
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Update failed: ' + (err.message || 'Check if migration has been applied.'));
    } finally {
      setSaving(false);
    }
  };

  const togglePayment = (method) => {
    setHospitalData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
  };

  const updateHours = (day, field, value) => {
    setHospitalData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: { ...prev.operating_hours[day], [field]: value }
      }
    }));
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#00b289]/20 bg-slate-50/50 text-sm transition-all";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin h-8 w-8" style={{ color: primaryColor }} />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Hospital Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Configure your facility's public information and operational configuration.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Info Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">contact_phone</span>
              Primary Contact Information
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Point of Contact Name</label>
              <input type="text" value={hospitalData.contact_name} onChange={e => setHospitalData({...hospitalData, contact_name: e.target.value})} className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Public Email</label>
              <input type="email" value={hospitalData.contact_email} onChange={e => setHospitalData({...hospitalData, contact_email: e.target.value})} className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Office Phone</label>
              <input type="text" value={hospitalData.contact_phone} onChange={e => setHospitalData({...hospitalData, contact_phone: e.target.value})} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergency Line</label>
              <input type="text" value={hospitalData.emergency_phone} onChange={e => setHospitalData({...hospitalData, emergency_phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-200/50 bg-amber-50/30 text-amber-700 font-bold text-sm" />
            </div>
          </div>
        </div>

        {/* Operational Limits */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">domain_verification</span>
              Facility Capacity &amp; Address
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Bed Capacity</label>
              <div className="relative">
                <input type="number" value={hospitalData.total_capacity_beds} onChange={e => setHospitalData({...hospitalData, total_capacity_beds: e.target.value})} className={`${inputClass} pr-12`} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">BEDS</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facility Address</label>
              <input type="text" value={hospitalData.address} onChange={e => setHospitalData({...hospitalData, address: e.target.value})} className={inputClass} placeholder="Street, City, PIN" />
            </div>
          </div>
        </div>

        {/* Certifications & Emergency Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">verified</span>
              Certifications &amp; Service Availability
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl border border-slate-100 hover:border-[#00b289]/30 transition-all">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={hospitalData.is_emergency_24h}
                  onChange={e => setHospitalData({ ...hospitalData, is_emergency_24h: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${hospitalData.is_emergency_24h ? 'bg-[#00b289]' : 'bg-slate-200'}`}>
                  <div className={`size-4 bg-white rounded-full shadow-sm mt-1 transition-transform ${hospitalData.is_emergency_24h ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">24/7 Emergency Services</p>
                <p className="text-xs text-slate-500 mt-0.5">Visible to patients on the search page and map.</p>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl border border-slate-100 hover:border-[#00b289]/30 transition-all">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={hospitalData.is_nabh_certified}
                  onChange={e => setHospitalData({ ...hospitalData, is_nabh_certified: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${hospitalData.is_nabh_certified ? 'bg-[#00b289]' : 'bg-slate-200'}`}>
                  <div className={`size-4 bg-white rounded-full shadow-sm mt-1 transition-transform ${hospitalData.is_nabh_certified ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">NABH Certified</p>
                <p className="text-xs text-slate-500 mt-0.5">National Accreditation Board certification badge shown publicly.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">payments</span>
              Accepted Payment Methods
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PAYMENT_OPTIONS.map(method => {
                const checked = hospitalData.payment_methods.includes(method);
                return (
                  <label key={method} className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${checked ? 'border-[#00b289] bg-[#00b289]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`size-5 rounded flex items-center justify-center border-2 transition-all ${checked ? 'bg-[#00b289] border-[#00b289]' : 'border-slate-300'}`}>
                      {checked && <span className="material-symbols-outlined text-white text-sm leading-none">check</span>}
                    </div>
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => togglePayment(method)} />
                    <span className="text-sm font-bold text-slate-700">{method}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">schedule</span>
              Operating Hours
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {DAYS.map(day => {
              const hrs = hospitalData.operating_hours[day] || { open: '09:00', close: '17:00', closed: false };
              return (
                <div key={day} className="flex items-center gap-4 flex-wrap">
                  <span className="w-28 text-xs font-black text-slate-600 uppercase tracking-wider shrink-0">{day}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-8 h-5 rounded-full transition-colors ${hrs.closed ? 'bg-slate-200' : 'bg-[#00b289]'}`}>
                      <div className={`size-3 bg-white rounded-full shadow-sm mt-1 transition-transform ${hrs.closed ? 'translate-x-1' : 'translate-x-4'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={!hrs.closed} onChange={e => updateHours(day, 'closed', !e.target.checked)} />
                    <span className="text-xs font-bold text-slate-500">{hrs.closed ? 'Closed' : 'Open'}</span>
                  </label>
                  {!hrs.closed && (
                    <>
                      <input type="time" value={hrs.open} onChange={e => updateHours(day, 'open', e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00b289]/20" />
                      <span className="text-xs text-slate-400 font-bold">to</span>
                      <input type="time" value={hrs.close} onChange={e => updateHours(day, 'close', e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00b289]/20" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            style={{ background: primaryColor, boxShadow: `0 8px 16px ${primaryColor}40` }}
          >
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : savedOk ? <CheckCircle2 className="h-5 w-5 text-white/80" /> : <span className="material-symbols-outlined">save</span>}
            {savedOk ? 'Saved!' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
