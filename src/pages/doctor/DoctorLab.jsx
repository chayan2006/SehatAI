import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, Search, Plus, Filter, Clock, CheckCircle2, 
  AlertCircle, FileText, Brain, ChevronRight, Loader2, 
  ArrowUpRight, Beaker, Download, X, MoreVertical
} from 'lucide-react';
import { Toast, useToast } from '@/components/ui/Toast';
import { labService, patientService, hospitalService, aiService } from '@/database';

export default function DoctorLab() {
  const { toasts, addToast, removeToast } = useToast();
  const [results, setResults] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(null); // Result object
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Form State
  const [orderForm, setOrderForm] = useState({
    patientId: '',
    testName: '',
    category: 'Pathology'
  });

  const [resultUpdate, setResultUpdate] = useState({
    value: '',
    unit: '',
    range: '',
    notes: '',
    status: 'Completed'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const hospital = await hospitalService.getMyHospital();
      if (!hospital) return;

      const [labData, patientData] = await Promise.all([
        labService.getLabResults(hospital.id),
        patientService.getPatients(hospital.id)
      ]);

      setResults(labData);
      setPatients(patientData);
    } catch (err) {
      console.error(err);
      addToast('Failed to sync lab data', 'error');
      setLastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTest = async (e) => {
    e.preventDefault();
    if (!orderForm.patientId || !orderForm.testName) return;

    setIsProcessing(true);
    const lid = addToast(`Ordering ${orderForm.testName}...`, 'loading', 3000);
    try {
      const hospital = await hospitalService.getMyHospital();
      const newOrder = await labService.orderTab(
        hospital.id,
        orderForm.patientId,
        orderForm.testName,
        orderForm.category
      );

      removeToast(lid);
      addToast('✓ Test ordered successfully.', 'success');
      setShowOrderModal(false);
      setOrderForm({ patientId: '', testName: '', category: 'Pathology' });
      loadData();
    } catch (err) {
      removeToast(lid);
      addToast('Failed to order test', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    if (!showResultModal) return;

    setIsProcessing(true);
    const lid = addToast(`Updating ${showResultModal.test_name}...`, 'loading', 3000);
    try {
      await labService.updateLabResult(showResultModal.id, {
        result_value: resultUpdate.value,
        unit: resultUpdate.unit,
        reference_range: resultUpdate.range,
        doctor_notes: resultUpdate.notes,
        status: resultUpdate.status
      });

      removeToast(lid);
      addToast('✓ Result updated successfully.', 'success');
      setShowResultModal(null);
      loadData();
    } catch (err) {
      removeToast(lid);
      addToast('Failed to update result', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIAnalyze = async (result) => {
    setIsAIGenerating(true);
    const lid = addToast('SehatAI scanning markers for clinical anomalies...', 'loading', 3000);
    try {
      const patient = patients.find(p => p.id === result.patient_id);
      const summary = await aiService.generateLabSummary(result, patient);
      
      await labService.updateLabResult(result.id, { ai_summary: summary });
      
      removeToast(lid);
      addToast('✓ AI Diagnosis Integrated', 'success');
      loadData();
    } catch (err) {
      removeToast(lid);
      addToast('AI Engine is busy', 'error');
    } finally {
      setIsAIGenerating(false);
    }
  };

  const filteredResults = results.filter(r => {
    const matchesSearch = r.test_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.patients?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || r.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: results.length,
    pending: results.filter(r => r.status === 'Pending').length,
    completed: results.filter(r => r.status === 'Completed').length,
    critical: results.filter(r => r.ai_summary?.toLowerCase().includes('critical') || r.doctor_notes?.toLowerCase().includes('critical')).length
  };

  const repairDatabase = () => {
    const sql = `-- FIX: Create lab_results table
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  category TEXT,
  result_value TEXT,
  unit TEXT,
  reference_range TEXT,
  status TEXT DEFAULT 'Pending',
  doctor_notes TEXT,
  ai_summary TEXT,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy update
DO $$
BEGIN
    ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Global Demo Access" ON public.lab_results;
    CREATE POLICY "Global Demo Access" ON public.lab_results FOR ALL USING (true) WITH CHECK (true);
END $$;`;
    navigator.clipboard.writeText(sql);
    addToast('Repair SQL copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-[#00b289]" />
        <p className="font-bold text-lg tracking-tight">Syncing Diagnostic Cloud...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 animate-in fade-in duration-500">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FlaskConical className="text-[#00b289]" size={32} />
            Diagnostic & Lab Center
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Manage pathology, radiology, and AI-assisted clinical findings</p>
        </div>
        <div className="flex gap-3">
           {lastError && (
             <button onClick={repairDatabase} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2">
               <AlertCircle size={14} /> Auto-Fix DB
             </button>
           )}
           <button 
             onClick={() => setShowOrderModal(true)}
             className="px-6 py-3 bg-[#00b289] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
           >
             <Plus size={16} /> New Lab Order
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Investigations', val: stats.total, icon: Beaker, color: 'indigo' },
          { label: 'Awaiting Results', val: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Validated Reports', val: stats.completed, icon: CheckCircle2, color: 'emerald' },
          { label: 'Critical Alerts', val: stats.critical, icon: AlertCircle, color: 'red' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-[#00b289]/20 group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${s.color === 'emerald' ? 'emerald' : s.color === 'amber' ? 'amber' : s.color === 'red' ? 'red' : 'indigo'}-50 text-${s.color === 'emerald' ? 'emerald' : s.color === 'amber' ? 'amber' : s.color === 'red' ? 'red' : 'indigo'}-600 group-hover:scale-110 transition-transform`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-2xl font-black mt-0.5 text-slate-900">{s.val}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            {['all', 'pending', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tests or patients..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00b289] transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Investigation</th>
                <th className="px-6 py-5">Patient Details</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Diagnostics</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResults.map((r) => (
                <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Beaker size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{r.test_name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{r.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-900">{r.patients?.full_name || 'General'}</p>
                    <p className="text-[10px] font-black text-[#00b289] uppercase tracking-tighter">ID: {r.patients?.external_id || 'PX-XXXX'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-widest border ${
                      r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      r.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {r.result_value ? (
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-slate-900">{r.result_value} {r.unit}</span>
                         {r.ai_summary && <Brain size={14} className="text-[#00b289] animate-pulse" />}
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase italic">Awaiting Lab</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.status === 'Pending' ? (
                        <button 
                          onClick={() => {
                            setShowResultModal(r);
                            setResultUpdate({
                              value: '', unit: '', range: '', notes: '', status: 'Completed'
                            });
                          }}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                          title="Enter Results"
                        >
                          <Plus size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAIAnalyze(r)} 
                          className="p-2 bg-emerald-50 text-[#00b289] rounded-lg hover:bg-emerald-100 transition-colors"
                          title="AI Diagnostics"
                        >
                          <Brain size={16} />
                        </button>
                      )}
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <FlaskConical size={48} className="text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No clinical findings Match your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                <Plus className="text-[#00b289]" /> Initialize Lab Order
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleOrderTest} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Assign Patient</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b289] appearance-none"
                  value={orderForm.patientId}
                  onChange={e => setOrderForm(prev => ({ ...prev, patientId: e.target.value }))}
                  required
                >
                  <option value="">Select a patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.external_id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Investigation Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CBC, Liver Function Panel, MRI Head"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b289]"
                    value={orderForm.testName}
                    onChange={e => setOrderForm(prev => ({ ...prev, testName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Diagnostic Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b289]"
                    value={orderForm.category}
                    onChange={e => setOrderForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Pathology">Pathology / Blood Work</option>
                    <option value="Radiology">Radiology / Imaging</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Cardiology">Cardiology / ECG</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#00b289] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-xl transition-all shadow-emerald-200/50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                  Commit Clinical Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Entry Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Record Lab Findings</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{showResultModal.test_name} • {showResultModal.patients?.full_name}</p>
              </div>
              <button onClick={() => setShowResultModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <form onSubmit={handleUpdateResult} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Measured Value</label>
                       <input 
                         type="text" placeholder="e.g. 14.5" 
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b289]"
                         value={resultUpdate.value}
                         onChange={e => setResultUpdate(prev => ({ ...prev, value: e.target.value }))}
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</label>
                       <input 
                         type="text" placeholder="e.g. g/dL" 
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b289]"
                         value={resultUpdate.unit}
                         onChange={e => setResultUpdate(prev => ({ ...prev, unit: e.target.value }))}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference Range</label>
                    <input 
                      type="text" placeholder="e.g. 13.5 - 17.5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b289]"
                      value={resultUpdate.range}
                      onChange={e => setResultUpdate(prev => ({ ...prev, range: e.target.value }))}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Context / Notes</label>
                    <textarea 
                      rows="3" 
                      placeholder="Doctor's interpretation..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b289] resize-none"
                      value={resultUpdate.notes}
                      onChange={e => setResultUpdate(prev => ({ ...prev, notes: e.target.value }))}
                    ></textarea>
                 </div>

                 <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#00b289] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-xl transition-all shadow-emerald-200/50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Validate & Publish Findings
                </button>
              </form>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain size={120} />
                 </div>
                 <div className="relative z-10 space-y-4">
                    <div className="p-4 bg-white rounded-full w-16 h-16 mx-auto shadow-sm flex items-center justify-center">
                       <Brain className="text-[#00b289]" size={32} />
                    </div>
                    <div className="max-w-[200px]">
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-1">SehatAI Diagnostic Integration</h4>
                       <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Verify results with our clinical LLM tuned for Indian pathology standards.</p>
                    </div>
                    <button 
                      onClick={() => handleAIAnalyze(showResultModal)}
                      disabled={isAIGenerating || !showResultModal.result_value && !resultUpdate.value}
                      className="px-6 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-[#00b289] hover:text-[#00b289] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {isAIGenerating ? <Loader2 className="animate-spin" size={12} /> : 'Request AI Assist'}
                    </button>
                 </div>
                 
                 {showResultModal.ai_summary && (
                   <div className="mt-6 p-4 bg-white rounded-xl border border-emerald-100 text-left animate-in slide-in-from-bottom-2">
                       <p className="text-[10px] font-black text-[#00b289] uppercase tracking-widest mb-2 flex items-center gap-2">
                          <CheckCircle2 size={12} /> SehatAI Insight
                       </p>
                       <p className="text-[11px] text-slate-700 leading-relaxed italic">{showResultModal.ai_summary}</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
