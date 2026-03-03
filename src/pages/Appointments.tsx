import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, User, Video, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const appointments = [
  { id: 1, patient: 'John Doe', type: 'Routine Checkup', mode: 'In-Person', time: 'Today, 2:00 PM', doctor: 'Dr. Sarah Jenkins', location: 'Room 302, Main Wing' },
  { id: 2, patient: 'Martha Wayne', type: 'Post-op Follow-up', mode: 'Telehealth', time: 'Tomorrow, 10:30 AM', doctor: 'Dr. Michael Chen', location: 'Video Call Link Sent' },
  { id: 3, patient: 'Alice Smith', type: 'Cardiology Consult', mode: 'In-Person', time: 'Oct 24, 9:00 AM', doctor: 'Dr. Emily Stone', location: 'Cardiology Dept, 4th Floor' },
];

export default function Appointments() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <CalendarIcon className="mr-2 h-4 w-4" /> Schedule New
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((apt) => (
          <Card key={apt.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={apt.mode === 'Telehealth' ? 'secondary' : 'outline'} className={apt.mode === 'Telehealth' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-transparent' : ''}>
                  {apt.mode === 'Telehealth' ? <Video className="mr-1 h-3 w-3" /> : <MapPin className="mr-1 h-3 w-3" />}
                  {apt.mode}
                </Badge>
              </div>
              <CardTitle className="text-lg">{apt.type}</CardTitle>
              <CardDescription className="text-base font-medium text-slate-900">{apt.patient}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600 mb-6">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-slate-400" />
                  {apt.time}
                </div>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-slate-400" />
                  {apt.doctor}
                </div>
                <div className="flex items-center">
                  {apt.mode === 'Telehealth' ? <Video className="mr-2 h-4 w-4 text-slate-400" /> : <MapPin className="mr-2 h-4 w-4 text-slate-400" />}
                  {apt.location}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="w-full">Reschedule</Button>
                {apt.mode === 'Telehealth' && <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Join Call</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
