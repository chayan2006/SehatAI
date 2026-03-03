import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ambulance, MapPin, PhoneCall, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';

export default function PatientAmbulance() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Emergency Services</h2>
      </div>

      <div className="grid gap-6">
        <Card className="border-red-200 shadow-sm shadow-red-100 bg-red-50/30">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-red-600 flex items-center justify-center">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Need Immediate Help?
            </CardTitle>
            <CardDescription className="text-base text-slate-700 mt-2">
              If you are experiencing a medical emergency, tap the button below to dispatch an ambulance to your current location immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200 rounded-full h-32 w-32 flex flex-col items-center justify-center transition-transform hover:scale-105">
              <Ambulance className="h-10 w-10 mb-2" />
              <span className="font-bold text-lg">SOS</span>
            </Button>
            <p className="text-sm text-slate-500 mt-6 flex items-center">
              <MapPin className="mr-1 h-4 w-4" /> Your location: 123 Maple St, Springfield
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm shadow-blue-50">
          <CardHeader>
            <CardTitle>AI Emergency Monitoring</CardTitle>
            <CardDescription>Your AI assistant is constantly monitoring your vitals for emergencies.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Monitoring Active</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    If your vitals drop to critical levels or you remain inactive for 48 hours, we will automatically dispatch an ambulance and notify Dr. Jenkins.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>People who will be notified in case of an emergency.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50 border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-200 text-slate-500 rounded-full">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Dr. Sarah Jenkins</h4>
                    <p className="text-xs text-slate-600 mt-1">Primary Care Physician</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">Call</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50 border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-200 text-slate-500 rounded-full">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Michael Vance</h4>
                    <p className="text-xs text-slate-600 mt-1">Son (Primary Caregiver)</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">Call</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
