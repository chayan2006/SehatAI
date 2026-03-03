import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, PhoneCall, AlertTriangle, Clock, MessageSquare, HeartPulse } from 'lucide-react';

const logs = [
  { id: 1, time: 'Today, 10:45 AM', agent: 'AI Care Agent', action: 'Vitals Checked', reason: 'Your heart rate and blood pressure are stable.', type: 'success' },
  { id: 2, time: 'Yesterday, 09:30 AM', agent: 'Communication Agent', action: 'Automated Voice Call', reason: 'Checked in on your well-being after 24 hours of inactivity.', type: 'info' },
  { id: 3, time: 'Oct 15, 08:00 AM', agent: 'Scheduler Agent', action: 'Medication Reminder SMS', reason: 'Sent reminder for Lisinopril.', type: 'info' },
  { id: 4, time: 'Oct 12, 06:30 AM', agent: 'Analysis Agent', action: 'Health Alert Generated', reason: 'Elevated BP detected. Dr. Jenkins was notified.', type: 'warning' },
];

export default function PatientHistory() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Health History & AI Logs</h2>
      </div>

      <Card className="border-blue-100 shadow-sm shadow-blue-50">
        <CardHeader>
          <CardTitle>Your AI Care Timeline</CardTitle>
          <CardDescription>A record of interactions and monitoring events from your AI care team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-blue-200 ml-3 space-y-8 pb-4">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-8">
                <div className={`absolute -left-3.5 top-1 rounded-full p-1.5 border-2 border-white ${
                  log.type === 'warning' ? 'bg-amber-500 text-white' :
                  log.type === 'success' ? 'bg-emerald-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {log.type === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
                   log.type === 'success' ? <HeartPulse className="h-3 w-3" /> :
                   log.action.includes('Call') || log.action.includes('SMS') ? <MessageSquare className="h-3 w-3" /> :
                   <Activity className="h-3 w-3" />}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                  <h4 className="text-sm font-semibold text-slate-900">{log.action}</h4>
                  <time className="text-xs text-slate-500 flex items-center mt-1 sm:mt-0"><Clock className="mr-1 h-3 w-3" /> {log.time}</time>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {log.reason}
                </p>
                <div className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10">
                  Handled by: {log.agent}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
