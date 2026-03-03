import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Settings() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Platform Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Agent Configuration</CardTitle>
          <CardDescription>Manage thresholds and behaviors for the LangGraph multi-agent system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Inactivity Threshold (Hours)</label>
            <Input type="number" defaultValue="48" className="max-w-md" />
            <p className="text-[0.8rem] text-slate-500">Trigger an alert if a patient has no logged activity or vitals for this duration.</p>
          </div>
          <div className="grid gap-2 pt-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Critical Heart Rate Threshold (BPM)</label>
            <div className="flex items-center space-x-2 max-w-md">
              <Input type="number" defaultValue="40" placeholder="Min" />
              <span className="text-slate-500">-</span>
              <Input type="number" defaultValue="120" placeholder="Max" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Changes</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>Manage connections to external services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">Twilio Account SID</label>
            <Input type="password" defaultValue="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="max-w-md" />
          </div>
          <div className="grid gap-2 pt-2">
            <label className="text-sm font-medium leading-none">Hospital EMR API Endpoint</label>
            <Input type="url" defaultValue="https://api.hospital.local/v1/fhir" className="max-w-md" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Update Integrations</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
