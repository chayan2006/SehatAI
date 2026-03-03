import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ambulance, MapPin, Clock, AlertTriangle, Activity, PhoneCall } from 'lucide-react';
import { AmbulanceMap, Dispatch } from '@/components/AmbulanceMap';

const activeDispatches: Dispatch[] = [
  { id: 1, patient: 'Eleanor Vance', location: '123 Maple St, Springfield', status: 'En Route', eta: '4 mins', unit: 'Medic-42', priority: 'Critical', progress: 65, destY: 20 },
  { id: 2, patient: 'Marcus Johnson', location: '88 Oak Ave, Springfield', status: 'On Scene', eta: 'Arrived', unit: 'Medic-17', priority: 'High', progress: 95, destY: 80 },
];

export default function AdminAmbulance() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ambulance Fleet & EMS</h2>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <AlertTriangle className="mr-2 h-4 w-4" /> Manual Override Dispatch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fleet</CardTitle>
            <Ambulance className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-slate-500">Registered units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Units</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">18</div>
            <p className="text-xs text-slate-500">Ready for dispatch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dispatches</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">6</div>
            <p className="text-xs text-slate-500">Currently deployed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.2m</div>
            <p className="text-xs text-slate-500">-0.4m from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Live Fleet Map</CardTitle>
            <CardDescription>Real-time location of active ambulance dispatches.</CardDescription>
          </CardHeader>
          <CardContent>
            <AmbulanceMap dispatches={activeDispatches} />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Active Emergency Dispatches</CardTitle>
            <CardDescription>Real-time tracking of AI-initiated and manual ambulance dispatches.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Patient & Location</th>
                    <th className="px-4 py-3 font-medium">Status & ETA</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDispatches.map((dispatch) => (
                    <tr key={dispatch.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        <div className="flex items-center">
                          <Ambulance className="mr-2 h-4 w-4 text-slate-400" />
                          {dispatch.unit}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{dispatch.patient}</div>
                        <div className="text-xs text-slate-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" /> {dispatch.location}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{dispatch.status}</div>
                        <div className="text-xs text-blue-600 flex items-center mt-1 mb-2">
                          <Clock className="h-3 w-3 mr-1" /> ETA: {dispatch.eta}
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[150px]">
                          <div 
                            className={`h-1.5 rounded-full ${dispatch.progress > 90 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                            style={{ width: `${dispatch.progress}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm"><PhoneCall className="h-4 w-4" /></Button>
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
    </div>
  );
}
