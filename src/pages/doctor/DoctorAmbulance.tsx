import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ambulance, MapPin, Clock, AlertTriangle, PhoneCall, Activity } from 'lucide-react';
import { AmbulanceMap, Dispatch } from '@/components/AmbulanceMap';

const activeDispatches: Dispatch[] = [
  { id: 1, patient: 'Eleanor Vance', location: '123 Maple St, Springfield', status: 'En Route', eta: '4 mins', unit: 'Medic-42', priority: 'Critical', progress: 65, destY: 30 },
];

export default function DoctorAmbulance() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">EMS & Dispatch</h2>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Ambulance className="mr-2 h-4 w-4" /> Dispatch Ambulance
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-red-200 shadow-sm shadow-red-100 bg-red-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="animate-pulse">Active Emergency</Badge>
                  <span className="text-sm font-medium text-slate-500 flex items-center"><Clock className="mr-1 h-3 w-3" /> Dispatched 3 mins ago</span>
                </div>
                <Badge variant="outline" className="text-red-600 border-red-200 bg-white">
                  <Activity className="mr-1 h-3 w-3" /> AI Initiated
                </Badge>
              </div>
              <CardTitle className="text-xl mt-2">Eleanor Vance (78y)</CardTitle>
              <CardDescription className="text-base text-slate-700 font-medium">Reason: Sustained HR &gt; 110 bpm. Blood pressure elevated.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-lg border border-red-100 flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-full">
                    <Ambulance className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Medic-42 is En Route</h4>
                    <p className="text-sm text-slate-600 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" /> 123 Maple St, Springfield
                    </p>
                  </div>
                </div>
                <div className="text-right w-48">
                  <p className="text-sm font-medium text-slate-500">Estimated Time of Arrival</p>
                  <p className="text-2xl font-bold text-red-600 mb-2">4 mins</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${activeDispatches[0].progress}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{activeDispatches[0].progress}% Arrived</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white"><PhoneCall className="mr-2 h-4 w-4" /> Contact Paramedics</Button>
                <Button variant="outline" className="w-full text-slate-600 border-slate-200">View Patient Chart</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Recent Dispatches (Last 24h)</CardTitle>
              <CardDescription>History of ambulance dispatches for your assigned patients.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50 border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-slate-200 text-slate-500 rounded-full">
                      <Ambulance className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Marcus Johnson</h4>
                      <p className="text-xs text-slate-600 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" /> Yesterday, 11:20 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">Resolved</Badge>
                    <Button variant="ghost" size="sm" className="text-teal-600">View Report</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 h-fit">
          <CardHeader>
            <CardTitle>Live Tracking Map</CardTitle>
            <CardDescription>Real-time location of active ambulance dispatches for your patients.</CardDescription>
          </CardHeader>
          <CardContent>
            <AmbulanceMap dispatches={activeDispatches} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
