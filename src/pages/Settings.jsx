import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Bell, Save, LogOut, 
  Building, Mail, MapPin, Clock, 
  Award, Activity, Key, Globe, Camera
} from 'lucide-react';
import { authService, hospitalService } from '@/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function Settings() {
  const { addToast } = useToast();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('profile');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const profileData = await authService.getProfile(user.id);
          setProfile(profileData || { 
            full_name: user.user_metadata?.full_name || 'Clinician',
            email: user.email,
            role: user.user_metadata?.role || 'Doctor'
          });

          const hospitalData = await hospitalService.getMyHospital();
          setHospital(hospitalData);
        }
      } catch (err) {
        console.error('Settings load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = () => {
    addToast('Profile updated successfully', 'success');
  };

  const handleSignOut = async () => {
    try {
      await logout(); // Signs out of both Firebase AND Supabase properly
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/'; // Fallback: force navigate to home
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen medical-pulse-bg">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#00b289] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Profile...</p>
        </div>
    </div>
  );

  return (
    <div className="p-8 medical-pulse-bg min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-slate-200 bg-cover bg-center border-4 border-white shadow-xl overflow-hidden"
                     style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAZyi6wRVH7rOiDaIljA0jMG-SLjzrTnX6uWbglYVRkplpyvp-C0KueyvZDu2GOCq9ryIrWLsu3BVTW59nAfUVwZTKJWc44VHWTOcy2xV3oSa_XaUCJYZtkciYopWn2aeMzWtBCnMoOOxjjoxo06SWW3nFcbD8GzOwGswxYWPx4whOLC6poO7H484xELqtQHj4tlDOZLAoPwVzlMLa8WU6J_xe6xZwEB6XsfBd1ldXAo1zzfuxfmGWTJvtzVeCAwH0HLqGaqof8el9j')" }}>
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-[#00b289] text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                    <Camera size={16}/>
                </button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#00b289]/10 text-[#00b289] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#00b289]/20">
                  Verified {profile?.role || 'Clinician'}
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                  ID: DOC-{profile?.id?.slice(0, 6).toUpperCase() || 'STAF-01'}
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile?.full_name}</h1>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <Building size={14} className="text-slate-400" />
                {hospital?.name || 'Sehat AI General Hospital'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all shadow-sm"
          >
            <LogOut size={16}/> Sign Out
          </button>
        </div>

        {/* Settings Navigation */}
        <div className="flex gap-2 p-1 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
            {[
                { id: 'profile', label: 'Personal Information', icon: User },
                { id: 'security', label: 'Security & Auth', icon: Shield },
                { id: 'hospital', label: 'Affiliated Hospital', icon: Building },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeSubTab === tab.id 
                        ? 'bg-[#00b289] text-white shadow-lg' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <tab.icon size={16}/> {tab.label}
                </button>
            ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {activeSubTab === 'profile' && (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
                            <button onClick={handleUpdateProfile} className="flex items-center gap-2 px-6 py-2 bg-[#00b289] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-xl transition-all">
                                <Save size={16}/> Save Profile
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Full Official Name', val: profile?.full_name, icon: User },
                                { label: 'Medical Registration No', val: 'IMR-12345678', icon: Award },
                                { label: 'Email Address', val: profile?.email, icon: Mail, disabled: true },
                                { label: 'Specialization', val: 'Senior Cardiologist', icon: Activity },
                                { label: 'Contact Number', val: '+91 98765 43210', icon: Activity },
                                { label: 'Current Residency', val: 'New Delhi, India', icon: MapPin },
                            ].map((f, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <f.icon size={12}/> {f.label}
                                    </label>
                                    <input 
                                        type="text" 
                                        defaultValue={f.val} 
                                        disabled={f.disabled}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#00b289]/20 transition-all disabled:opacity-50"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSubTab === 'security' && (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-lg font-black text-slate-900">Security Settings</h3>
                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-[28px] flex items-center justify-between border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm"><Key size={20} className="text-blue-600"/></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Change Account Password</p>
                                        <p className="text-xs text-slate-500 font-medium">Update your credentials for security.</p>
                                    </div>
                                </div>
                                <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">Update</button>
                            </div>
                            
                            <div className="p-6 bg-slate-50 rounded-[28px] flex items-center justify-between border border-slate-100 text-slate-400">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm"><Shield size={20} className="text-emerald-500"/></div>
                                    <div>
                                        <p className="text-sm font-bold opacity-60">Two-Factor Authentication</p>
                                        <p className="text-xs font-medium opacity-60">Add an extra layer of clinical security.</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeSubTab === 'hospital' && (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">Hospital Affiliation</h3>
                        </div>
                        
                        <div className="p-8 bg-[#1a1a1a] rounded-[32px] text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Building size={120} />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                <div className="w-24 h-24 bg-[#00b289] rounded-3xl flex items-center justify-center text-3xl font-black">
                                    {hospital?.name?.[0] || 'H'}
                                </div>
                                <div className="space-y-2 text-center md:text-left">
                                    <p className="text-[#00b289] text-[10px] font-black uppercase tracking-widest">Active Institution</p>
                                    <h4 className="text-3xl font-black">{hospital?.name || 'Sehat AI General Hospital'}</h4>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 font-medium text-sm">
                                        <span className="flex items-center gap-1"><MapPin size={14}/> {hospital?.address || 'Global HQ'}</span>
                                        <span className="flex items-center gap-1"><Globe size={14}/> Healthcare Network</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
                <div className="bg-[#00b289] rounded-[32px] p-8 text-white shadow-xl shadow-[#00b289]/20 relative overflow-hidden group">
                    <div className="absolute -top-4 -right-4 bg-white/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10 space-y-6">
                        <Activity size={32} />
                        <div>
                            <h4 className="text-2xl font-black leading-tight">Your Clinical <br/> Performance</h4>
                            <p className="text-white/70 text-sm mt-2 font-medium">System utilization is optimal.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Shift Time</p>
                                <p className="text-lg font-black">8h 42m</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Accuracy</p>
                                <p className="text-lg font-black">99.2%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-6">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Bell size={16} className="text-[#00b289]" />
                        Notifications
                    </h4>
                    <div className="space-y-4">
                        {[
                            { label: 'Push Notifications', desc: 'Alerts for critical vitals' },
                            { label: 'Weekly Reports', desc: 'Performance analytics via email' },
                        ].map((n, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{n.label}</p>
                                    <p className="text-[11px] text-slate-400 font-medium">{n.desc}</p>
                                </div>
                                <div className="w-10 h-6 bg-[#00b289] rounded-full p-1 cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full ml-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
