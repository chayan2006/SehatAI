import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

const patients = [
  { id: 1, name: 'Eleanor Vance', age: 78, status: 'Critical', lastActive: '2 mins ago', condition: 'Arrhythmia', hr: 110, bp: '145/90', riskScore: 92 },
  { id: 2, name: 'Robert Ford', age: 82, status: 'Inactive', lastActive: '49 hours ago', condition: 'Hypertension', hr: 72, bp: '130/85', riskScore: 85 },
  { id: 3, name: 'Martha Wayne', age: 65, status: 'Stable', lastActive: '1 hour ago', condition: 'Post-op Recovery', hr: 68, bp: '118/75', riskScore: 24 },
  { id: 4, name: 'John Doe', age: 71, status: 'Stable', lastActive: '3 hours ago', condition: 'Diabetes Type 2', hr: 75, bp: '122/80', riskScore: 35 },
  { id: 5, name: 'Alice Smith', age: 88, status: 'Warning', lastActive: '12 hours ago', condition: 'Heart Failure', hr: 95, bp: '135/88', riskScore: 78 },
  { id: 6, name: 'James Wilson', age: 62, status: 'Stable', lastActive: '5 mins ago', condition: 'Asthma', hr: 82, bp: '120/80', riskScore: 15 },
];

export default function Patients() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Patients Directory</h2>
        <div className="flex items-center space-x-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Patients</CardTitle>
              <CardDescription>Manage and monitor your assigned patients.</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input type="search" placeholder="Search patients..." className="pl-9" />
              </div>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Condition</th>
                  <th className="px-4 py-3 font-medium">Vitals (HR / BP)</th>
                  <th className="px-4 py-3 font-medium">Risk Score</th>
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
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[80px]">
                          <div className={`h-2.5 rounded-full ${patient.riskScore > 80 ? 'bg-red-500' : patient.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${patient.riskScore}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-500">{patient.riskScore}/100</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{patient.lastActive}</td>
                    <td className="px-4 py-4">
                      <Badge variant={
                        patient.status === 'Critical' ? 'destructive' :
                        patient.status === 'Inactive' || patient.status === 'Warning' ? 'warning' : 'success'
                      }>
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm">View Profile</Button>
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
