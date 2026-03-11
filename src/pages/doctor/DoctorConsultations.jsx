import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, Activity, Mic, Square, FileEdit, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConsultationMap } from '@/components/ConsultationMap';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const appointments = [
  { id: 1, patient: 'John Doe', type: 'Routine Checkup', mode: 'In-Person', time: 'Today, 2:00 PM', location: 'Room 302, Main Wing', aiNotes: 'Patient blood glucose stable. Review recent lab results.', x: 25, y: 35 },
  { id: 2, patient: 'Martha Wayne', type: 'Post-op Follow-up', mode: 'Telehealth', time: 'Tomorrow, 10:30 AM', location: 'Video Call Link Sent', aiNotes: 'Recovery progressing well. No pain reported in last 48h.' },
  { id: 3, patient: 'Alice Smith', type: 'Cardiology Consult', mode: 'In-Person', time: 'Oct 24, 9:00 AM', location: 'Cardiology Dept, 4th Floor', aiNotes: 'Elevated BP detected. Missed medication for 3 days.', x: 75, y: 75 },
];

export default function DoctorConsultations() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [soapNote, setSoapNote] = useState(null);

  const startRecording = () => {
    setIsRecording(true);
    setTranscript([]);
    setSoapNote(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    generateScribeNote();
  };

  const generateScribeNote = () => {
    setIsGenerating(true);
    // Simulation: Generate notes after a delay
    setTimeout(() => {
      setSoapNote({
        subjective: "Patient reports mild chest tightness during exertion. Admits to missing two doses of Beta-blocker.",
        objective: "HR 88 bpm (resting), BP 138/88. Lung sounds clear. Pulse oximetry 98% on room air.",
        assessment: "Stage 1 Hypertension with poor medication compliance. Mild exertion-induced angina suspicious.",
        plan: "1. Resume daily Beta-blocker regimen immediately. 2. Schedule EKG for tomorrow morning. 3. Monitor BP daily for 1 week."
      });
      setIsGenerating(false);
    }, 2000);
  };

  // Simulate live transcript
  useEffect(() => {
    if (isRecording) {
      const phrases = [
        "Patient: Good morning Doctor.",
        "Doctor: Good morning John, how have you been feeling since our last visit?",
        "Patient: I've had some tightness in my chest when I walk too fast.",
        "Doctor: I see. Have you been taking your medication regularly?",
        "Patient: Well, I missed a couple of days last week...",
        "Doctor: We need to be consistent with those. Let's check your blood pressure."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < phrases.length) {
          setTranscript(prev => [...prev, phrases[i]]);
          i++;
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Consultations</h2>
        <div className="flex gap-2">
          {/* AI SCRIBE BUTTON */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                <Mic className="mr-2 h-4 w-4" /> AI Medical Scribe
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Wand2 className="text-indigo-600" /> AI Consultation Scribe
                </SheetTitle>
                <SheetDescription>
                  Automatically document patient visits using real-time ambient AI listening.
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6 space-y-6">
                {!isRecording && !soapNote && !isGenerating ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl space-y-4">
                    <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Mic className="text-slate-400 size-8" />
                    </div>
                    <p className="text-center text-sm text-slate-500 font-medium">Ready to transcribe. Ensure HIPAA-compliant environment before start.</p>
                    <Button onClick={startRecording} className="bg-indigo-600 text-white w-full">Start AI Scribe</Button>
                  </div>
                ) : null}

                {isRecording && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Listening...</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={stopRecording} className="text-slate-500 hover:text-red-500">
                        <Square className="mr-2 h-3 w-3" /> Stop
                      </Button>
                    </div>
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono h-64 overflow-y-auto space-y-2">
                      {transcript.map((line, i) => (
                        <p key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">{line}</p>
                      ))}
                      {transcript.length === 0 && <p className="text-slate-500 italic">Waiting for voice input...</p>}
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <Loader2 className="animate-spin text-indigo-600 size-10" />
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Generating SOAP Note...</p>
                  </div>
                )}

                {soapNote && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-indigo-900 uppercase text-xs tracking-tighter">AI Generated Clinical Summary</h4>
                      <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 h-7 text-[10px]" onClick={startRecording}>New Record</Button>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'Subjective', content: soapNote.subjective },
                        { label: 'Objective', content: soapNote.objective },
                        { label: 'Assessment', content: soapNote.assessment },
                        { label: 'Plan', content: soapNote.plan }
                      ].map((section, idx) => (
                        <div key={idx} className="bg-white border border-indigo-100 p-3 rounded-lg shadow-sm">
                          <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">{section.label}</p>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">{section.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1 bg-indigo-600 text-white">Export to EMR</Button>
                      <Button variant="outline" className="flex-1 border-slate-200">Modify</Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <CalendarIcon className="mr-2 h-4 w-4" /> Schedule Follow-up
          </Button>
        </div>
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
              <div className="bg-primary/5 p-3 rounded-md border border-primary/20 mb-4">
                <p className="text-xs font-semibold text-primary mb-1 flex items-center">
                  <Activity className="mr-1 h-3 w-3" /> AI Pre-Consultation Notes:
                </p>
                <p className="text-sm text-primary">{apt.aiNotes}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="w-full text-slate-600">Reschedule</Button>
                {apt.mode === 'Telehealth' ? (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white"><Video className="mr-2 h-4 w-4" /> Start Call</Button>
                ) : (
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">Check-in Patient</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
