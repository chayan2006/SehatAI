import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, PhoneCall, AlertTriangle, Users, Calendar, Stethoscope, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const healthData = [
  { time: '00:00', hr: 72, bp: 120 },
  { time: '04:00', hr: 68, bp: 118 },
  { time: '08:00', hr: 75, bp: 122 },
  { time: '12:00', hr: 82, bp: 125 },
  { time: '16:00', hr: 78, bp: 121 },
  { time: '20:00', hr: 74, bp: 119 },
];

const patients = [
  { id: 1, name: 'Eleanor Vance', age: 78, status: 'Critical', lastActive: '2 mins ago', condition: 'Arrhythmia', hr: 110, bp: '145/90' },
  { id: 2, name: 'Robert Ford', age: 82, status: 'Inactive', lastActive: '49 hours ago', condition: 'Hypertension', hr: 72, bp: '130/85' },
  { id: 3, name: 'Martha Wayne', age: 65, status: 'Stable', lastActive: '1 hour ago', condition: 'Post-op Recovery', hr: 68, bp: '118/75' },
  { id: 4, name: 'John Doe', age: 71, status: 'Stable', lastActive: '3 hours ago', condition: 'Diabetes Type 2', hr: 75, bp: '122/80' },
];

const agentLogs = [
  { id: 1, time: '10:45 AM', action: 'Emergency Ambulance Dispatched', patient: 'Eleanor Vance', reason: 'Sustained HR > 100 bpm', type: 'critical' },
  { id: 2, time: '09:30 AM', action: 'Automated Voice Call Initiated', patient: 'Robert Ford', reason: 'Inactivity threshold exceeded (>48h)', type: 'warning' },
  { id: 3, time: '08:00 AM', action: 'Medication Reminder Sent', patient: 'Martha Wayne', reason: 'Scheduled daily reminder', type: 'info' },
  { id: 4, time: '07:15 AM', action: 'Doctor Appointment Booked', patient: 'John Doe', reason: 'Routine checkup requested', type: 'info' },
];

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Platform Overview</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Download Report</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <AlertTriangle className="mr-2 h-4 w-4" /> Trigger Emergency Protocol
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-slate-500">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">14</div>
            <p className="text-xs text-slate-500">Requires immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agent Actions</CardTitle>
            <PhoneCall className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-slate-500">Calls & interventions today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Consultations</CardTitle>
            <Stethoscope className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-slate-500">Scheduled for next 24h</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Average Patient Vitals Trend</CardTitle>
            <CardDescription>Aggregated heart rate and blood pressure over 24 hours.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="hr" name="Heart Rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="bp" name="Systolic BP" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI Agent Activity Log</CardTitle>
            <CardDescription>Recent automated actions taken by the LangGraph agents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {agentLogs.map((log) => (
                <div key={log.id} className="flex items-start">
                  <div className={`mt-0.5 rounded-full p-1.5 ${
                    log.type === 'critical' ? 'bg-red-100 text-red-600' :
                    log.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {log.type === 'critical' ? <AlertTriangle className="h-4 w-4" /> :
                     log.type === 'warning' ? <PhoneCall className="h-4 w-4" /> :
                     <Activity className="h-4 w-4" />}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{log.action}</p>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{log.patient}</span> - {log.reason}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center mt-1">
                      <Clock className="mr-1 h-3 w-3" /> {log.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Priority Patient Monitoring</CardTitle>
          <CardDescription>Patients requiring attention based on AI risk assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Condition</th>
                  <th className="px-4 py-3 font-medium">Vitals (HR / BP)</th>
                  <th className="px-4 py-3 font-medium">Last Active</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {patient.name}
                      <span className="block text-xs text-slate-500 font-normal">{patient.age} years old</span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{patient.condition}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`flex items-center ${patient.hr > 100 ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                          <Heart className="mr-1 h-3 w-3" /> {patient.hr}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600">{patient.bp}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{patient.lastActive}</td>
                    <td className="px-4 py-4">
                      <Badge variant={
                        patient.status === 'Critical' ? 'destructive' :
                        patient.status === 'Inactive' ? 'warning' : 'success'
                      }>
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
