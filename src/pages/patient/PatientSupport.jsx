import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PatientSupport({ onNavigate }) {
  const faqs = [
    { q: "How do I book an appointment?", a: "Navigate to the 'Appointments' tab in the sidebar and click 'Book Medical Checkup'." },
    { q: "Where can I see my lab results?", a: "Go to 'My Health' and then 'Health History' to download your latest PDF reports." },
    { q: "What should I do in an emergency?", a: "Click the 'Emergency SOS' button immediately to alert emergency services and your primary hospital." },
    { q: "How does the AI Health Companion work?", a: "Our AI uses your health data and medical history to provide personalized health advice and symptom analysis." }
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Support & Help Center</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Need assistance? We're here to help you navigate your SehatAI journey.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">support_agent</span>
            <span className="text-sm font-bold">Priority Support Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info cards */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">contact_support</span>
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">support@sehatai.med</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-vital-green/10 flex items-center justify-center text-vital-green">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">+1 (800) SEHAT-AI</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 shadow-none">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="size-12 rounded-full bg-primary mx-auto flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl">smart_toy</span>
                </div>
                <h4 className="font-bold text-primary">Talk to AI Assistant</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our SehatAI Health Companion is available 24/7 to answer medical questions and help you with the platform.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-10">Open AI Chat</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions about SehatAI.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
              {faqs.map((faq, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{faq.q}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/10">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Still need help?</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Our human support team is available Monday to Friday, 9:00 AM to 6:00 PM.</p>
            <Button variant="outline" className="font-bold border-primary text-primary hover:bg-primary hover:text-white">Start Live Chat</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
