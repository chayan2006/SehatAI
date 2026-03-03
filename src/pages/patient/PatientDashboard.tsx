import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Heart, PhoneCall, AlertTriangle, Clock, Pill, Calendar, Wind } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const healthData = [
  { time: '00:00', hr: 72, bp: 120 },
  { time: '04:00', hr: 68, bp: 118 },
  { time: '08:00', hr: 75, bp: 122 },
  { time: '12:00', hr: 82, bp: 125 },
  { time: '16:00', hr: 78, bp: 121 },
  { time: '20:00', hr: 74, bp: 119 },
];

const agentLogs = [
  { id: 1, time: '2 hours ago', action: 'Routine Check-in Complete', reason: 'Your vitals are looking great today, Eleanor.', type: 'success' },
  { id: 2, time: 'Yesterday, 8:00 AM', action: 'Medication Reminder', reason: 'Did you take your morning Lisinopril?', type: 'info' },
  { id: 3, time: 'Oct 15, 2:30 PM', action: 'Appointment Scheduled', reason: 'Dr. Jenkins booked a follow-up for next week.', type: 'info' },
];

export default function PatientDashboard() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Good morning, Eleanor</h2>
          <p className="text-slate-500 mt-1">Here's your health summary for today.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 h-12 px-6 rounded-full text-base font-bold">
          <AlertTriangle className="mr-2 h-5 w-5" /> SOS Emergency
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-100 shadow-sm shadow-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Current Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">74 <span className="text-sm font-normal text-slate-500">bpm</span></div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <Activity className="h-3 w-3 mr-1" /> Normal resting rate
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 shadow-sm shadow-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Blood Pressure</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">119/78</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Optimal range
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 shadow-sm shadow-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Blood Oxygen</CardTitle>
            <Wind className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">98%</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Healthy levels
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-600 text-white shadow-md shadow-blue-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Next Action</CardTitle>
            <Pill className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Lisinopril 10mg</div>
            <p className="text-sm text-blue-200 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" /> Today at 2:00 PM
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-200">
          <CardHeader>
            <CardTitle>Your Vitals Trend</CardTitle>
            <CardDescription>Heart rate and blood pressure over the last 24 hours.</CardDescription>
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

        <Card className="col-span-3 border-slate-200">
          <CardHeader>
            <CardTitle>AI Health Assistant</CardTitle>
            <CardDescription>Recent updates from your personal AI care team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {agentLogs.map((log) => (
                <div key={log.id} className="flex items-start">
                  <div className={`mt-0.5 rounded-full p-2 ${
                    log.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {log.type === 'success' ? <Activity className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900">{log.action}</p>
                    <p className="text-sm text-slate-600">
                      {log.reason}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center mt-1">
                      <Clock className="mr-1 h-3 w-3" /> {log.time}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                <PhoneCall className="mr-2 h-4 w-4" /> Talk to AI Assistant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
