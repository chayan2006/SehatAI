import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const medications = [
  { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '08:00 AM', status: 'Taken', type: 'Blood Pressure' },
  { id: 2, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '02:00 PM', status: 'Pending', type: 'Diabetes' },
  { id: 3, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', time: '08:00 PM', status: 'Upcoming', type: 'Cholesterol' },
];

export default function PatientMedications() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Medications</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Pill className="mr-2 h-4 w-4" /> Request Refill
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-blue-100 shadow-sm shadow-blue-50">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your medication plan for today. AI reminders are active.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                  med.status === 'Taken' ? 'bg-emerald-50 border-emerald-100' :
                  med.status === 'Pending' ? 'bg-amber-50 border-amber-200 shadow-sm' :
                  'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      med.status === 'Taken' ? 'bg-emerald-100 text-emerald-600' :
                      med.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{med.name} <span className="text-sm font-normal text-slate-500 ml-2">{med.dosage}</span></h4>
                      <p className="text-sm text-slate-600 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" /> Scheduled for {med.time} • {med.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={
                      med.status === 'Taken' ? 'success' :
                      med.status === 'Pending' ? 'warning' : 'secondary'
                    } className="text-sm px-3 py-1">
                      {med.status}
                    </Badge>
                    {med.status === 'Pending' && (
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Taken
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Adherence Summary</CardTitle>
            <CardDescription>Your medication adherence over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">94%</h3>
                  <p className="text-sm text-slate-500">Excellent adherence rate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">AI Note:</p>
                <p className="text-sm text-slate-600 max-w-xs mt-1">
                  "Great job staying on track! Your blood pressure has stabilized significantly since you improved your morning routine."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
