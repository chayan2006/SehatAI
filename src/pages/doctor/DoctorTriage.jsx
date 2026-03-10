import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PhoneCall, Ambulance, Clock, Activity, CheckCircle2, Video, FileText } from 'lucide-react';

const activeEmergencies = [
  { id: 1, patient: 'Eleanor Vance', age: 78, time: '10:45 AM (2 mins ago)', type: 'Critical Vitals', description: 'Sustained Heart Rate > 110 bpm for 15 minutes. Blood pressure elevated.', aiAction: 'Ambulance Dispatched & Caregiver Notified', status: 'In Progress' },
  { id: 2, patient: 'Robert Ford', age: 82, time: '09:30 AM (1 hr ago)', type: 'Inactivity Threshold', description: 'No movement or vitals detected for 49 hours. Exceeds 48h threshold.', aiAction: 'Automated Voice Call Initiated (No Answer)', status: 'Requires Doctor Override' },
];

const aiEscalations = [
  { id: 3, patient: 'Alice Smith', age: 88, time: '2 hours ago', type: 'Medication Non-Adherence', description: 'Patient missed heart medication for 3 consecutive days.', aiAction: 'Sent SMS reminders. Escalating to Doctor for consultation.', status: 'Pending Review' },
  { id: 4, patient: 'James Wilson', age: 62, time: '4 hours ago', type: 'Abnormal Sleep Pattern', description: 'SpO2 dropped below 90% multiple times during sleep.', aiAction: 'Logged event. Recommending Sleep Study.', status: 'Pending Review' },
];

export default function DoctorTriage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
          <AlertTriangle className="mr-3 h-8 w-8 text-red-600" />
          Emergency Triage & AI Escalations
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
            <Activity className="mr-2 h-4 w-4" /> Live Vitals Stream
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-red-600 flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Active Emergencies
        </h3>
        <div className="grid gap-6">
          {activeEmergencies.map((alert) => (
            <Card key={alert.id} className="border-red-200 shadow-sm shadow-red-100 bg-red-50/30">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="destructive" className="animate-pulse">{alert.status}</Badge>
                    <span className="text-sm font-medium text-slate-500 flex items-center"><Clock className="mr-1 h-3 w-3" /> {alert.time}</span>
                  </div>
                  <CardTitle className="text-xl">{alert.type} - {alert.patient} ({alert.age}y)</CardTitle>
                  <CardDescription className="text-base mt-2 text-slate-700 font-medium">{alert.description}</CardDescription>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button className="bg-red-600 hover:bg-red-700 text-white"><Ambulance className="mr-2 h-4 w-4" /> Track EMS</Button>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50"><Video className="mr-2 h-4 w-4" /> Emergency Telehealth</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">AI Agent Action Taken:</p>
                    <p className="text-sm text-slate-600 flex items-center">
                      <Activity className="mr-2 h-4 w-4 text-blue-500" />
                      {alert.aiAction}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-slate-600 border-slate-200">
                    <FileText className="mr-2 h-4 w-4" /> View Full Chart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-semibold text-amber-600 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          AI Escalations (Requires Doctor Review)
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          {aiEscalations.map((escalation) => (
            <Card key={escalation.id} className="border-amber-200 shadow-sm shadow-amber-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="warning">{escalation.status}</Badge>
                  <span className="text-sm font-medium text-slate-500 flex items-center"><Clock className="mr-1 h-3 w-3" /> {escalation.time}</span>
                </div>
                <CardTitle className="text-lg">{escalation.type}</CardTitle>
                <CardDescription className="text-sm text-slate-700 mt-1">
                  <span className="font-semibold text-slate-900">{escalation.patient} ({escalation.age}y)</span> - {escalation.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50/50 p-3 rounded-md border border-amber-100 mb-4">
                  <p className="text-xs font-semibold text-amber-800 mb-1">AI Recommendation:</p>
                  <p className="text-sm text-amber-900">{escalation.aiAction}</p>
                </div>
                <div className="flex space-x-2">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">Approve & Schedule</Button>
                  <Button variant="outline" className="w-full text-slate-600">Dismiss</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
