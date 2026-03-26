import React, { useState, useEffect } from 'react';
import { hospitalService } from '@/database/hospitalService';
import { useAuth } from '@/contexts/AuthContext';
import {
  Loader2, Save, Building2, IndianRupee, Star, Tag, Upload,
  ShieldCheck, Clock, CreditCard, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toast, useToast } from '@/components/ui/Toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PAYMENT_OPTIONS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Insurance', 'CGHS', 'ESIC'];

const defaultHours = Object.fromEntries(DAYS.map(d => [d, { open: '09:00', close: '17:00', closed: d === 'Sunday' }]));

export default function HospitalSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [hospital, setHospital] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const [formData, setFormData] = useState({
    hospital_name: '',
    consultation_fee: '',
    rating: '',
    specialties: '',
    logo_url: '',
    address: '',
    emergency_24h: false,
    nabh_certified: false,
    payment_methods: [],
    operating_hours: defaultHours,
  });

  useEffect(() => { loadHospital(); }, [user]);

  const loadHospital = async () => {
    try {
      setLoading(true);
      const data = await hospitalService.getMyHospital();
      if (data) {
        setHospital(data);
        setFormData({
          hospital_name: data.hospital_name || '',
          consultation_fee: data.consultation_fee || '0',
          rating: data.rating || '0',
          specialties: data.specialties ? data.specialties.join(', ') : '',
          logo_url: data.logo_url || '',
          address: data.address || '',
          emergency_24h: data.emergency_24h ?? false,
          nabh_certified: data.nabh_certified ?? false,
          payment_methods: data.payment_methods || [],
          operating_hours: data.operating_hours || defaultHours,
        });
      }
    } catch (err) {
      console.error('Failed to load hospital settings:', err);
      addToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePayment = (method) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
  };

  const updateHours = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: { ...prev.operating_hours[day], [field]: value }
      }
    }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!hospital?.id) return;
    setSaving(true);
    setSavedOk(false);
    try {
      const specialtiesArray = formData.specialties.split(',').map(s => s.trim()).filter(Boolean);
      await hospitalService.updateHospitalSettings(hospital.id, {
        hospital_name: formData.hospital_name,
        consultation_fee: parseFloat(formData.consultation_fee) || 0,
        rating: parseFloat(formData.rating) || 0,
        specialties: specialtiesArray,
        logo_url: formData.logo_url,
        address: formData.address,
        emergency_24h: formData.emergency_24h,
        nabh_certified: formData.nabh_certified,
        payment_methods: formData.payment_methods,
        operating_hours: formData.operating_hours,
      });
      setSavedOk(true);
      addToast('Settings updated successfully!', 'success');
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      addToast('Update failed. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'hours', label: 'Operating Hours', icon: Clock },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'certifications', label: 'Certifications', icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-[#00b289]" />
        <p className="font-bold text-lg tracking-tight">Loading Clinic Settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Settings</h2>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest text-[#00b289]">
            Configure your public profile, hours & capabilities
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#00b289] hover:bg-[#00b289]/90 text-white rounded-xl font-bold uppercase text-xs tracking-widest px-6 py-6 shadow-lg shadow-[#00b289]/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : savedOk ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Saving...' : savedOk ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white text-[#00b289] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Building2 size={16} /></span>
              Basic Information
            </h3>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Clinic Name</Label>
              <Input value={formData.hospital_name} onChange={e => setFormData({...formData, hospital_name: e.target.value})} className="rounded-xl border-slate-200" placeholder="e.g. LifeCare Wellness Center" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Clinic Address</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl border-slate-200" placeholder="e.g. Plot 45, Sector 12, Delhi" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Logo URL</Label>
              <Input value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} className="rounded-xl border-slate-200" placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="p-1.5 bg-emerald-50 text-[#00b289] rounded-lg"><IndianRupee size={16} /></span>
              Clinical Details
            </h3>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Consultation Fee (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input type="number" value={formData.consultation_fee} onChange={e => setFormData({...formData, consultation_fee: e.target.value})} className="rounded-xl border-slate-200 pl-10" placeholder="e.g. 500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Public Rating (0-5)</Label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4" />
                <Input type="number" step="0.1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="rounded-xl border-slate-200 pl-10" placeholder="e.g. 4.8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Specialties (comma separated)</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} className="rounded-xl border-slate-200 pl-10" placeholder="Cardiology, General, Pediatrics" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operating Hours Tab */}
      {activeTab === 'hours' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Clock size={16} /></span>
            Weekly Operating Hours
          </h3>
          <div className="space-y-3">
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-28 flex-shrink-0">
                  <span className="text-sm font-black text-slate-800">{day}</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => updateHours(day, 'closed', !formData.operating_hours[day]?.closed)}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${formData.operating_hours[day]?.closed ? 'bg-slate-300' : 'bg-[#00b289]'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.operating_hours[day]?.closed ? 'left-0.5' : 'left-5'}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{formData.operating_hours[day]?.closed ? 'Closed' : 'Open'}</span>
                </label>
                {!formData.operating_hours[day]?.closed && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Input type="time" value={formData.operating_hours[day]?.open || '09:00'} onChange={e => updateHours(day, 'open', e.target.value)} className="w-32 rounded-xl border-slate-200 text-sm" />
                    <span className="text-slate-400 text-xs font-bold">to</span>
                    <Input type="time" value={formData.operating_hours[day]?.close || '17:00'} onChange={e => updateHours(day, 'close', e.target.value)} className="w-32 rounded-xl border-slate-200 text-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-emerald-50 text-[#00b289] rounded-lg"><CreditCard size={16} /></span>
            Accepted Payment Methods
          </h3>
          <p className="text-xs text-slate-400 -mt-2">Select all payment modes accepted at your facility.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PAYMENT_OPTIONS.map(method => {
              const selected = formData.payment_methods.includes(method);
              return (
                <button
                  key={method}
                  onClick={() => togglePayment(method)}
                  className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                    selected
                      ? 'border-[#00b289] bg-[#00b289]/10 text-[#00b289]'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {selected && <CheckCircle2 size={14} className="inline mr-1 mb-0.5" />}
                  {method}
                </button>
              );
            })}
          </div>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">Payment options are visible to patients on the booking portal. Keep this up to date.</p>
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck size={16} /></span>
            Certifications & Emergency Status
          </h3>

          {/* Emergency 24h Toggle */}
          <div className="flex items-center justify-between p-6 bg-red-50 border border-red-100 rounded-2xl">
            <div>
              <p className="font-black text-slate-900">24/7 Emergency Services</p>
              <p className="text-xs text-slate-500 mt-1">Enable if your facility has round-the-clock emergency care. Shown as a badge to patients.</p>
            </div>
            <div
              onClick={() => setFormData(prev => ({ ...prev, emergency_24h: !prev.emergency_24h }))}
              className={`w-14 h-7 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${formData.emergency_24h ? 'bg-red-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.emergency_24h ? 'left-8' : 'left-1'}`} />
            </div>
          </div>

          {/* NABH Toggle */}
          <div className="flex items-center justify-between p-6 bg-blue-50 border border-blue-100 rounded-2xl">
            <div>
              <p className="font-black text-slate-900">NABH Certified</p>
              <p className="text-xs text-slate-500 mt-1">National Accreditation Board for Hospitals certification. Displayed as a trust badge on patient portal.</p>
            </div>
            <div
              onClick={() => setFormData(prev => ({ ...prev, nabh_certified: !prev.nabh_certified }))}
              className={`w-14 h-7 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${formData.nabh_certified ? 'bg-blue-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.nabh_certified ? 'left-8' : 'left-1'}`} />
            </div>
          </div>

          {/* Status display */}
          <div className="flex gap-3 flex-wrap">
            {formData.emergency_24h && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                24/7 Emergency Active
              </span>
            )}
            {formData.nabh_certified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-black">
                <ShieldCheck size={12} />
                NABH Certified
              </span>
            )}
            {!formData.emergency_24h && !formData.nabh_certified && (
              <p className="text-xs text-slate-400">No active certifications or emergency status enabled.</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 bg-[#1a1a1a] rounded-3xl text-white flex items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Upload className="text-[#00b289]" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Public Visibility</p>
            <h4 className="text-lg font-black tracking-tight">Your changes reflect instantly on the Patient Portal</h4>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Status</p>
          <span className="inline-flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black uppercase tracking-tighter mt-1">
            Active & Verified
          </span>
        </div>
      </div>
    </div>
  );
}
