import React, { useState, useEffect } from 'react';
import { hospitalService, authService } from '@/database';
import { Loader2, Save, Building2, IndianRupee, Star, Tag, Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toast, useToast } from '@/components/ui/Toast';

export default function HospitalSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hospital, setHospital] = useState(null);
    const { toasts, addToast, removeToast } = useToast();
    
    const [formData, setFormData] = useState({
        hospital_name: '',
        consultation_fee: '',
        rating: '',
        specialties: '',
        logo_url: '',
        address: ''
    });

    useEffect(() => {
        loadHospital();
    }, []);

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
                    address: data.address || ''
                });
            }
        } catch (err) {
            console.error('Failed to load hospital settings:', err);
            addToast('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const specialtiesArray = formData.specialties
                .split(',')
                .map(s => s.trim())
                .filter(s => s !== '');

            await hospitalService.updateHospitalSettings(hospital.id, {
                hospital_name: formData.hospital_name,
                consultation_fee: parseFloat(formData.consultation_fee),
                rating: parseFloat(formData.rating),
                specialties: specialtiesArray,
                logo_url: formData.logo_url,
                address: formData.address
            });
            
            addToast('Settings updated successfully!', 'success');
        } catch (err) {
            console.error('Failed to update settings:', err);
            addToast('Update failed. Try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-[#00b289]" />
                <p className="font-bold text-lg tracking-tight">Loading Clinic Settings...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Toast toasts={toasts} removeToast={removeToast} />
            
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Settings</h2>
                    <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest text-[#00b289]">Configure your public profile & consultation rates</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-[#00b289] hover:bg-[#00b289]/90 text-white rounded-xl font-bold uppercase text-xs tracking-widest px-6 py-6 shadow-lg shadow-[#00b289]/20"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Info */}
                <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Building2 size={16} /></span>
                        Basic Information
                    </h3>
                    
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Clinic Name</Label>
                        <Input 
                            value={formData.hospital_name}
                            onChange={(e) => setFormData({...formData, hospital_name: e.target.value})}
                            className="rounded-xl border-slate-200"
                            placeholder="e.g. LifeCare Wellness Center"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Clinic Address</Label>
                        <Input 
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="rounded-xl border-slate-200"
                            placeholder="e.g. Plot 45, Sector 12, Delhi"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Logo or Image URL</Label>
                        <div className="flex gap-2">
                            <Input 
                                value={formData.logo_url}
                                onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                                className="rounded-xl border-slate-200"
                                placeholder="https://..."
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 italic">This will be displayed to patients on the booking page.</p>
                    </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <span className="p-1.5 bg-emerald-50 text-[#00b289] rounded-lg"><IndianRupee size={16} /></span>
                        Clinical Details
                    </h3>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Consultation Fee (₹)</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input 
                                type="number"
                                value={formData.consultation_fee}
                                onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                                className="rounded-xl border-slate-200 pl-10"
                                placeholder="e.g. 500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Public Rating (0-5)</Label>
                        <div className="relative">
                            <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4" />
                            <Input 
                                type="number"
                                step="0.1"
                                max="5"
                                value={formData.rating}
                                onChange={(e) => setFormData({...formData, rating: e.target.value})}
                                className="rounded-xl border-slate-200 pl-10"
                                placeholder="e.g. 4.8"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Specialties (Comma separated)</Label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input 
                                value={formData.specialties}
                                onChange={(e) => setFormData({...formData, specialties: e.target.value})}
                                className="rounded-xl border-slate-200 pl-10"
                                placeholder="Cardiology, General, Pediatrics"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 italic">Used for patient filtering.</p>
                    </div>
                </div>
            </form>

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
