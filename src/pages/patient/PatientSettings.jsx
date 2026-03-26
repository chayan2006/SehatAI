import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/supabaseService';
import { doctors, patients } from '@/lib/api';

export default function PatientSettings() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: false, app: true });
  
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');

  // Populate fields from the real authenticated user
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setSelectedHospital(user.hospital_uid || '');
    }
    
    const fetchHospitals = async () => {
      try {
        const docs = await doctors.list();
        setHospitals(docs);
      } catch (e) {
        console.error('Failed to fetch hospitals:', e);
      }
    };
    fetchHospitals();
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateUserProfile(user.id, { full_name: fullName, phone, hospital_uid: selectedHospital });
      if (selectedHospital) {
        await patients.linkHospital(selectedHospital);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h2>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-xl">Personal Information</CardTitle>
          <CardDescription>Changes are saved directly to your Firestore account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <Input
              type="email"
              value={user?.email || ''}
              disabled
              className="max-w-md bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400">Email cannot be changed here. Contact support.</p>
          </div>
          <div className="grid gap-2 pt-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="max-w-md bg-transparent border-slate-200 dark:border-slate-800"
            />
          </div>
          <div className="grid gap-2 pt-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="max-w-md bg-transparent border-slate-200 dark:border-slate-800"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white font-bold"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
          {saved && <span className="text-sm font-semibold text-green-600">✓ Saved successfully!</span>}
        </CardFooter>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-xl">Healthcare Provider</CardTitle>
          <CardDescription>Select your primary hospital or clinic for data synchronization and telemetry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Hospital / Clinic</label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full max-w-md bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
            >
              <option value="">-- Select a facility --</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>
                  {h.full_name || 'Unnamed Hospital'} ({h.email})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white font-bold"
          >
            {saving ? 'Linking...' : 'Link Provider'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-xl">Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified about appointments and lab results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive summaries and booking confirmations via email.' },
            { key: 'sms', label: 'SMS Alerts', desc: 'Get urgent alerts and reminders on your phone.' },
            { key: 'app', label: 'In-App Notifications', desc: 'Real-time alerts within the SehatAI platform.' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-none">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                className="accent-primary size-4"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-red-100 dark:border-red-900/30 bg-red-50/20 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="text-xl text-red-600 dark:text-red-400">Security: Deactivate Account</CardTitle>
          <CardDescription>Permanently remove your records from the hospital database.</CardDescription>
        </CardHeader>
        <CardFooter className="px-6 py-4">
          <Button variant="destructive" className="font-bold">Deactivate Institutional Access</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
