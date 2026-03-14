import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, PhoneCall, AlertTriangle, Clock, Stethoscope, MessageSquare, Sparkles } from 'lucide-react';
import { aiService } from '@/database/aiService';

const staticLogs = [
  { id: 1, time: '10:45 AM', agent: 'Decision Agent', action: 'Emergency Ambulance Dispatched', patient: 'Eleanor Vance', reason: 'Sustained HR > 100 bpm', type: 'critical' },
  { id: 2, time: '09:30 AM', agent: 'Communication Agent', action: 'Automated Voice Call Initiated', patient: 'Robert Ford', reason: 'Inactivity threshold exceeded (>48h)', type: 'warning' },
  { id: 3, time: '08:00 AM', agent: 'Scheduler Agent', action: 'Medication Reminder SMS Sent', patient: 'Martha Wayne', reason: 'Scheduled daily reminder (Lisinopril)', type: 'info' },
  { id: 4, time: '07:15 AM', agent: 'Booking Agent', action: 'Doctor Appointment Booked', patient: 'John Doe', reason: 'Routine checkup requested via voice interface', type: 'info' },
  { id: 5, time: '06:30 AM', agent: 'Analysis Agent', action: 'Risk Score Updated (Increased to 78)', patient: 'Alice Smith', reason: 'Elevated BP detected during morning reading', type: 'warning' },
  { id: 6, time: '02:15 AM', agent: 'Monitoring Agent', action: 'Sleep Apnea Event Logged', patient: 'James Wilson', reason: 'SpO2 dropped below 90% for 45 seconds', type: 'warning' },
];

export default function AgentLogs() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    // Mock patient data to send to the AI for this demo
    const demoPatient = {
      date_of_birth: '1975-04-12',
      blood_group: 'O+',
      medical_history_summary: 'Type 2 Diabetes, Hypertension. Smoker (1 pack/day).'
    };
    
    const demoRecord = {
      diagnosis: 'Chest pain, shortness of breath on exertion.',
      vital_signs: { heart_rate: 98, blood_pressure: "145/90", temp: 98.6 },
      prescription_data: { current_meds: "Metformin 500mg, Lisinopril 10mg" }
    };

    try {
      const summary = await aiService.analyzePatientRecord(demoPatient, demoRecord);
      setAiAnalysis(summary);
    } catch (error) {
      setAiAnalysis("Error generating analysis. Check console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">SehatAI Engine</h2>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Sparkles className="mr-2 h-5 w-5" />
            AI Patient Analysis
          </CardTitle>
          <CardDescription>Select a patient record to generate an instant, AI-driven executive medical summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <button 
            onClick={handleGenerateAnalysis}
            disabled={isAnalyzing}
            className="mb-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing Records..." : "Generate Analysis for Demo Patient"}
          </button>

          {aiAnalysis && (
            <div className="mt-4 rounded-lg bg-white p-6 shadow-sm border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-2">Gemini Analysis Summary:</h4>
              <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {aiAnalysis}
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>System Activity Timeline</CardTitle>
          <CardDescription>Comprehensive audit log of all autonomous actions taken by the multi-agent system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-slate-200 ml-3 space-y-8 pb-4">
            {staticLogs.map((log) => (
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
