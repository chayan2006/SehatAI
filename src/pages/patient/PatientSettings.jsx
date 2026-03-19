import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PatientSettings() {
  const [email, setEmail] = useState('alex.johnson@example.com');
  const [phone, setPhone] = useState('(555) 449-2019');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    app: true,
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h2>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-xl">Contact Information</CardTitle>
          <CardDescription>Update your personal details for hospital communication.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
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
        <CardFooter className="border-t border-slate-100 dark:border-slate-800 px-6 py-4">
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold">Save Profile Changes</Button>
        </CardFooter>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-xl">Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified about appointments and lab results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive summaries and booking confirmations via email.</p>
            </div>
            <input 
              type="checkbox" 
              checked={notifications.email} 
              onChange={() => setNotifications({...notifications, email: !notifications.email})} 
              className="accent-primary size-4" 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">SMS Alerts</p>
              <p className="text-xs text-slate-500">Get urgent alerts and reminders on your phone.</p>
            </div>
            <input 
              type="checkbox" 
              checked={notifications.sms} 
              onChange={() => setNotifications({...notifications, sms: !notifications.sms})} 
              className="accent-primary size-4" 
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">In-App Notifications</p>
              <p className="text-xs text-slate-500">Real-time alerts within the SehatAI platform.</p>
            </div>
            <input 
              type="checkbox" 
              checked={notifications.app} 
              onChange={() => setNotifications({...notifications, app: !notifications.app})} 
              className="accent-primary size-4" 
            />
          </div>
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
