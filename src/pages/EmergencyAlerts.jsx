import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PhoneCall, Ambulance, Clock, CheckCircle2, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const alerts = [
  { id: 1, patient: 'Eleanor Vance', time: '10:45 AM (2 mins ago)', type: 'Critical Vitals', description: 'Sustained Heart Rate > 110 bpm for 15 minutes. Blood pressure elevated.', status: 'Active', aiAction: 'Ambulance Dispatched' },
  { id: 2, patient: 'Robert Ford', time: '09:30 AM (1 hr ago)', type: 'Inactivity Threshold', description: 'No movement or vitals detected for 49 hours. Exceeds 48h threshold.', status: 'Active', aiAction: 'Automated Voice Call Initiated (No Answer)' },
  { id: 3, patient: 'Alice Smith', time: 'Yesterday, 11:20 PM', type: 'Fall Detected', description: 'Sudden impact detected by wearable device followed by inactivity.', status: 'Resolved', aiAction: 'Caregiver Notified' },
];

export default function EmergencyAlerts() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-red-600 flex items-center">
          <AlertTriangle className="mr-3 h-8 w-8" />
          Emergency Alerts
        </h2>
      </div>

      <div className="grid gap-6">
        {alerts.map((alert) => (
          <Card key={alert.id} className={alert.status === 'Active' ? 'border-red-200 shadow-sm shadow-red-100' : 'opacity-75'}>
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant={alert.status === 'Active' ? 'destructive' : 'secondary'}>{alert.status}</Badge>
                  <span className="text-sm font-medium text-slate-500 flex items-center"><Clock className="mr-1 h-3 w-3" /> {alert.time}</span>
                </div>
                <CardTitle className="text-xl">{alert.type} - {alert.patient}</CardTitle>
                <CardDescription className="text-base mt-2 text-slate-700">{alert.description}</CardDescription>
              </div>
              {alert.status === 'Active' && (
                <div className="flex space-x-2">
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50"><PhoneCall className="mr-2 h-4 w-4" /> Call Patient</Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white"><Ambulance className="mr-2 h-4 w-4" /> Dispatch EMS</Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">AI Agent Action Taken:</p>
                  <p className="text-sm text-slate-600 flex items-center">
                    {alert.status === 'Resolved' ? <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> : <Activity className="mr-2 h-4 w-4 text-blue-500" />}
                    {alert.aiAction}
                  </p>
                </div>
                {alert.status === 'Active' && (
                  <Button variant="ghost" size="sm" className="text-slate-500">Mark as Resolved</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
