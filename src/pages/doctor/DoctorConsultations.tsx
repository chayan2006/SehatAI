import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConsultationMap, AppointmentLocation } from '@/components/ConsultationMap';

const appointments: AppointmentLocation[] = [
  { id: 1, patient: 'John Doe', type: 'Routine Checkup', mode: 'In-Person', time: 'Today, 2:00 PM', location: 'Room 302, Main Wing', aiNotes: 'Patient blood glucose stable. Review recent lab results.', x: 25, y: 35 },
  { id: 2, patient: 'Martha Wayne', type: 'Post-op Follow-up', mode: 'Telehealth', time: 'Tomorrow, 10:30 AM', location: 'Video Call Link Sent', aiNotes: 'Recovery progressing well. No pain reported in last 48h.' },
  { id: 3, patient: 'Alice Smith', type: 'Cardiology Consult', mode: 'In-Person', time: 'Oct 24, 9:00 AM', location: 'Cardiology Dept, 4th Floor', aiNotes: 'Elevated BP detected. Missed medication for 3 days.', x: 75, y: 75 },
];

export default function DoctorConsultations() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Consultations</h2>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <CalendarIcon className="mr-2 h-4 w-4" /> Schedule Follow-up
        </Button>
      </div>

      <Card className="border-slate-200 mb-6">
        <CardHeader>
          <CardTitle>Clinic Floor Plan & Patient Locations</CardTitle>
          <CardDescription>Real-time view of in-person appointments across the facility.</CardDescription>
        </CardHeader>
        <CardContent>
          <ConsultationMap appointments={appointments} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((apt) => (
          <Card key={apt.id} className="border-slate-200">
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
              <div className="space-y-3 text-sm text-slate-600 mb-4">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-slate-400" />
                  {apt.time}
                </div>
                <div className="flex items-center">
                  {apt.mode === 'Telehealth' ? <Video className="mr-2 h-4 w-4 text-slate-400" /> : <MapPin className="mr-2 h-4 w-4 text-slate-400" />}
                  {apt.location}
                </div>
              </div>
              <div className="bg-teal-50/50 p-3 rounded-md border border-teal-100 mb-4">
                <p className="text-xs font-semibold text-teal-800 mb-1 flex items-center">
                  <Activity className="mr-1 h-3 w-3" /> AI Pre-Consultation Notes:
                </p>
                <p className="text-sm text-teal-900">{apt.aiNotes}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="w-full text-slate-600">Reschedule</Button>
                {apt.mode === 'Telehealth' ? (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white"><Video className="mr-2 h-4 w-4" /> Start Call</Button>
                ) : (
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">Check-in Patient</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
