import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Search, Filter, Plus, Activity, FileText, Ambulance, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const initialPatients = [
  { id: 1, name: 'Eleanor Vance', age: 78, status: 'Critical', lastActive: '2 mins ago', condition: 'Arrhythmia', hr: 110, bp: '145/90', riskScore: 92, aiNotes: 'Sustained tachycardia detected.', ambulanceStatus: 'En Route' },
  { id: 2, name: 'Robert Ford', age: 82, status: 'Inactive', lastActive: '49 hours ago', condition: 'Hypertension', hr: 72, bp: '130/85', riskScore: 85, aiNotes: 'No vitals logged for 48h.', ambulanceStatus: 'None' },
  { id: 3, name: 'Martha Wayne', age: 65, status: 'Stable', lastActive: '1 hour ago', condition: 'Post-op Recovery', hr: 68, bp: '118/75', riskScore: 24, aiNotes: 'Recovery progressing normally.', ambulanceStatus: 'None' },
  { id: 4, name: 'John Doe', age: 71, status: 'Stable', lastActive: '3 hours ago', condition: 'Diabetes Type 2', hr: 75, bp: '122/80', riskScore: 35, aiNotes: 'Blood glucose levels stable.', ambulanceStatus: 'None' },
  { id: 5, name: 'Alice Smith', age: 88, status: 'Warning', lastActive: '12 hours ago', condition: 'Heart Failure', hr: 95, bp: '135/88', riskScore: 78, aiNotes: 'Missed medication for 3 days.', ambulanceStatus: 'None' },
  { id: 6, name: 'James Wilson', age: 62, status: 'Stable', lastActive: '5 mins ago', condition: 'Asthma', hr: 82, bp: '120/80', riskScore: 15, aiNotes: 'SpO2 drops detected during sleep.', ambulanceStatus: 'None' },
];

export default function DoctorPatients() {
  const [patients, setPatients] = useState(initialPatients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New Patient Form State
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newCondition, setNewCondition] = useState("");
  
  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!newName) return;
    
    const newPatient = {
      id: Date.now(),
      name: newName,
      age: parseInt(newAge) || 45,
      status: 'Stable',
      lastActive: 'Just now',
      condition: newCondition || 'Under Observation',
      hr: Math.floor(Math.random() * (90 - 60 + 1) + 60), // Mock HR
      bp: '120/80', // Mock BP
      riskScore: Math.floor(Math.random() * (40 - 10 + 1) + 10), // Low risk mock score
      aiNotes: 'New patient added. Baseline vitals recorded.',
      ambulanceStatus: 'None'
    };
    
    setPatients([newPatient, ...patients]);
    setIsDialogOpen(false);
    
    // Reset form
    setNewName("");
    setNewAge("");
    setNewCondition("");
  };

  const removePatient = (id) => {
    setPatients(patients.filter(p => p.id !== id));
  };
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Patients</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Enter the patient's details here to add them to your roster. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPatient}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-slate-700">Name</Label>
                    <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="col-span-3 border-slate-200" placeholder="e.g. Jane Doe" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right text-slate-700">Age</Label>
                    <Input id="age" type="number" value={newAge} onChange={(e) => setNewAge(e.target.value)} className="col-span-3 border-slate-200" placeholder="e.g. 45" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="condition" className="text-right text-slate-700">Condition</Label>
                    <Input id="condition" value={newCondition} onChange={(e) => setNewCondition(e.target.value)} className="col-span-3 border-slate-200" placeholder="e.g. Routine Checkup" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-200 hover:bg-slate-50">Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Save Patient</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assigned Patients</CardTitle>
              <CardDescription>Monitor your patients' health status and AI-generated risk scores.</CardDescription>
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
                  <th className="px-4 py-3 font-medium">Condition & AI Notes</th>
                  <th className="px-4 py-3 font-medium">Vitals (HR / BP)</th>
                  <th className="px-4 py-3 font-medium">AI Risk Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">EMS Status</th>
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
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-700">{patient.condition}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center">
                        <Activity className="h-3 w-3 mr-1 text-primary" /> {patient.aiNotes}
                      </div>
                    </td>
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
                        <span className="text-xs font-medium text-slate-700">{patient.riskScore}/100</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={
                        patient.status === 'Critical' ? 'destructive' :
                        patient.status === 'Inactive' || patient.status === 'Warning' ? 'warning' : 'success'
                      }>
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={patient.ambulanceStatus !== 'None' ? 'destructive' : 'secondary'} className={patient.ambulanceStatus !== 'None' ? 'animate-pulse' : ''}>
                        {patient.ambulanceStatus !== 'None' && <Ambulance className="mr-1 h-3 w-3" />}
                        {patient.ambulanceStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/10">
                          <FileText className="mr-2 h-4 w-4" /> View Chart
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removePatient(patient.id)}
                          title="Remove Patient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
