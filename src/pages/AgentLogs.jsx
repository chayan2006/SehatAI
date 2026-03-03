import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, PhoneCall, AlertTriangle, Clock, Stethoscope, MessageSquare } from 'lucide-react';

const logs = [
  { id: 1, time: '10:45 AM', agent: 'Decision Agent', action: 'Emergency Ambulance Dispatched', patient: 'Eleanor Vance', reason: 'Sustained HR > 100 bpm', type: 'critical' },
  { id: 2, time: '09:30 AM', agent: 'Communication Agent', action: 'Automated Voice Call Initiated', patient: 'Robert Ford', reason: 'Inactivity threshold exceeded (>48h)', type: 'warning' },
  { id: 3, time: '08:00 AM', agent: 'Scheduler Agent', action: 'Medication Reminder SMS Sent', patient: 'Martha Wayne', reason: 'Scheduled daily reminder (Lisinopril)', type: 'info' },
  { id: 4, time: '07:15 AM', agent: 'Booking Agent', action: 'Doctor Appointment Booked', patient: 'John Doe', reason: 'Routine checkup requested via voice interface', type: 'info' },
  { id: 5, time: '06:30 AM', agent: 'Analysis Agent', action: 'Risk Score Updated (Increased to 78)', patient: 'Alice Smith', reason: 'Elevated BP detected during morning reading', type: 'warning' },
  { id: 6, time: '02:15 AM', agent: 'Monitoring Agent', action: 'Sleep Apnea Event Logged', patient: 'James Wilson', reason: 'SpO2 dropped below 90% for 45 seconds', type: 'warning' },
];

export default function AgentLogs() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Agent Logs</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity Timeline</CardTitle>
          <CardDescription>Comprehensive audit log of all autonomous actions taken by the LangGraph multi-agent system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-slate-200 ml-3 space-y-8 pb-4">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-8">
                <div className={`absolute -left-3.5 top-1 rounded-full p-1.5 border-2 border-white ${
                  log.type === 'critical' ? 'bg-red-500 text-white' :
                  log.type === 'warning' ? 'bg-amber-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {log.type === 'critical' ? <AlertTriangle className="h-3 w-3" /> :
                   log.type === 'warning' ? <Activity className="h-3 w-3" /> :
                   log.action.includes('Call') || log.action.includes('SMS') ? <MessageSquare className="h-3 w-3" /> :
                   log.action.includes('Appointment') ? <Stethoscope className="h-3 w-3" /> :
                   <Activity className="h-3 w-3" />}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                  <h4 className="text-sm font-semibold text-slate-900">{log.action}</h4>
                  <time className="text-xs text-slate-500 flex items-center mt-1 sm:mt-0"><Clock className="mr-1 h-3 w-3" /> {log.time}</time>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-medium text-slate-800">{log.patient}</span> - {log.reason}
                </p>
                <div className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                  Executed by: {log.agent}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
