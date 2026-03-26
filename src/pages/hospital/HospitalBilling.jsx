import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  IndianRupee, FileText, Clock, TrendingUp, Plus, Check, 
  Mail, Download, X, RotateCcw, Loader2, Search, Filter,
  ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Toast, useToast } from '@/components/ui/Toast';
import { billingService, patientService, authService, hospitalService } from '@/database';

const INSURANCE_PROVIDERS = ['Blue Cross', 'Aetna', 'Medicare', 'Cigna', 'UnitedHealth', 'Humana'];

const STATUS_STYLE = {
  Paid:    'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Partial: 'bg-blue-100 text-blue-700',
  Overdue: 'bg-red-100 text-red-700',
  Refunded: 'bg-slate-100 text-slate-500',
};

// ── New Invoice Dialog ─────────────────────────────────────────────────────────
function NewInvoiceDialog({ onAdd, onClose, isProcessing, patientsList = [], primaryColor }) {
  const [form, setForm] = useState({ 
    patientId: '', 
    services: '', 
    amount: '', 
    provider: 'Blue Cross' 
  });
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientId || !form.amount) return;
    
    const selectedPatient = patientsList.find(p => p.id === form.patientId);
    
    onAdd({
      patient_id: form.patientId,
      services: form.services || 'General Medical Services',
      amount: parseFloat(form.amount) || 0,
      provider: form.provider,
      status: 'Pending',
      patient_name: selectedPatient?.full_name || 'Unknown Patient'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Financial Records</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Generate New Billing Invoice</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X size={18}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Target Patient</label>
              <select 
                required
                value={form.patientId} 
                onChange={e => set('patientId', e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="" disabled>Select patient from registry...</option>
                {patientsList.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Services Rendered</label>
               <input 
                 required 
                 placeholder="e.g. ICU Consultation, Diagnostics"
                 value={form.services} 
                 onChange={e => set('services', e.target.value)}
                 className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-300"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Amount (₹)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="0.00"
                  value={form.amount} 
                  onChange={e => set('amount', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Insurance</label>
                <select 
                  value={form.provider} 
                  onChange={e => set('provider', e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20"
                >
                  {INSURANCE_PROVIDERS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isProcessing} 
              className="flex-1 py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100/50 transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: primaryColor }}
            >
              {isProcessing ? 'Processing...' : 'Authorize Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function HospitalBilling({ hospitalId, primaryColor, theme }) {
  const { toasts, addToast, removeToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    loadData();

    let subscription;
    const setupRealtime = async () => {
      if (!hospitalId) return;

      subscription = billingService.subscribeToInvoices(hospitalId, (payload) => {
        if (payload.eventType === 'INSERT') {
          loadData();
        } else if (payload.eventType === 'UPDATE') {
          setInvoices(prev => prev.map(inv => inv.id === payload.new.id ? { ...inv, ...payload.new } : inv));
        } else if (payload.eventType === 'DELETE') {
          setInvoices(prev => prev.filter(inv => inv.id === payload.old.id));
        }
      });
    };

    setupRealtime();
    return () => { if (subscription) subscription.unsubscribe(); };
  }, [hospitalId]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!hospitalId) return;

      const [invData, patientData] = await Promise.all([
        billingService.getInvoices(hospitalId),
        patientService.getPatients(hospitalId)
      ]);

      setInvoices(invData);
      setPatients(patientData);
    } catch (err) {
      console.error(err);
      addToast('Failed to sync billing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending' || i.status === 'Partial').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

  const handleCreate = async (invoiceData) => {
    setIsProcessing(true);
    const lid = addToast(`Generating Secure Invoice...`, 'loading', 3000);
    try {
      const newInvoice = await billingService.createInvoice({
        hospital_id: hospitalId,
        patient_id: invoiceData.patient_id,
        services: invoiceData.services,
        amount: invoiceData.amount,
        provider: invoiceData.provider,
        status: 'Pending'
      });

      setInvoices(prev => [{
        ...newInvoice,
        patients: { full_name: invoiceData.patient_name }
      }, ...prev]);
      
      setShowNewInvoice(false);
      removeToast(lid);
      addToast(`✓ Invoice generated for ${invoiceData.patient_name}.`, 'success');
    } catch (err) {
      removeToast(lid);
      addToast('Invoice generation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (id, status, patientName) => {
    setProcessingId(id);
    const lid = addToast(`Updating record status...`, 'loading', 3000);
    try {
      await billingService.updateInvoiceStatus(id, status);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: status } : inv));
      removeToast(lid);
      addToast(`✓ Invoice for ${patientName} marked as ${status}.`, 'success');
    } catch (err) {
      removeToast(lid);
      addToast('Status update failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadPDF = async (inv) => {
    const lid = addToast(`Preparing PDF Document...`, 'loading', 3000);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const patientName = inv.patients?.full_name || 'Patient';
      
      // Professional Header
      doc.setFillColor(50, 50, 50);
      doc.rect(0, 0, 600, 80, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24); doc.setFont('helvetica', 'bold');
      doc.text('HOSPITAL BILLING INVOICE', 40, 50);
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text(`Invoice ID: ${inv.id.toUpperCase()}`, 40, 110);
      doc.text(`Generated On: ${new Date(inv.created_at).toLocaleString()}`, 40, 125);
      
      // Patient Info Block
      doc.setDrawColor(240);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(40, 150, 515, 80, 10, 10, 'FD');
      
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 55, 175);
      doc.setFontSize(16);
      doc.text(patientName.toUpperCase(), 55, 200);
      
      // Details Table
      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION', 55, 270);
      doc.text('INSURANCE', 300, 270);
      doc.text('AMOUNT', 480, 270);
      
      doc.setDrawColor(200);
      doc.line(40, 280, 555, 280);
      
      doc.setFont('helvetica', 'normal');
      doc.text(inv.services, 55, 305);
      doc.text(inv.provider, 300, 305);
      doc.setFont('helvetica', 'bold');
      doc.text(`INR ${inv.amount.toLocaleString()}`, 480, 305);
      
      // Footer
      doc.setFontSize(22);
      doc.setTextColor(primaryColor);
      doc.text(`TOTAL DUE: INR ${inv.amount.toLocaleString()}`, 300, 400);
      
      doc.save(`BILL_${inv.id.slice(0,8)}.pdf`);
      removeToast(lid);
      addToast(`✓ PDF Document Downloaded.`, 'success');
    } catch (e) {
      removeToast(lid);
      addToast('PDF preparation failed.', 'error');
    }
  };

  const filtered = filterStatus === 'All' ? invoices : invoices.filter(i => i.status === filterStatus);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4" style={{ color: primaryColor }} />
        <p className="font-bold text-xs uppercase tracking-widest">Compiling Financial Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {showNewInvoice && (
        <NewInvoiceDialog 
          onAdd={handleCreate} 
          onClose={() => setShowNewInvoice(false)} 
          isProcessing={isProcessing}
          patientsList={patients}
          primaryColor={primaryColor}
        />
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Settled Revenue', val: `₹${totalRevenue.toLocaleString()}`, icon: ArrowUpRight, color: '#10b981', sub: 'Cumulative Total' },
          { label: 'Outpatient Balance', val: `₹${totalPending.toLocaleString()}`, icon: Clock, color: '#f59e0b', sub: 'Awaiting Settlement' },
          { label: 'Overdue Receivables', val: `₹${totalOverdue.toLocaleString()}`, icon: ArrowDownRight, color: '#ef4444', sub: 'Action Required' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: stat.color }}></div>
            <div className="flex justify-between items-start mb-4">
              <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center" style={{ color: stat.color }}>
                <stat.icon size={20}/>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-black mt-1 text-slate-900">{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} style={{ color: primaryColor }}/>
              Billing Registry
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Financial Audit Logs & Invoices</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            {['All', 'Paid', 'Pending', 'Overdue'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${filterStatus === s ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                style={{ background: filterStatus === s ? primaryColor : 'transparent' }}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewInvoice(true)}
            className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: primaryColor }}
          >
            <Plus size={14}/> Create Invoice
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[9px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-50 bg-white">
              <tr>
                <th className="px-8 py-5">Reference</th>
                <th className="px-4 py-5">Patient Holder</th>
                <th className="px-4 py-5">Coverage</th>
                <th className="px-4 py-5">Amount</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="py-20 flex flex-col items-center gap-3 text-center">
                    <div className="p-4 bg-slate-50 rounded-2xl"><FileText size={32} className="text-slate-200"/></div>
                    <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest italic">No financial records detected</p>
                  </div>
                </td></tr>
              ) : filtered.map(inv => (
                <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-900 text-xs">#{inv.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{new Date(inv.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="font-black text-slate-900 text-sm">{inv.patients?.full_name || 'Patient'}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">{inv.services}</p>
                  </td>
                  <td className="px-4 py-5">
                     <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[9px] font-black uppercase tracking-widest">{inv.provider}</span>
                  </td>
                  <td className="px-4 py-5 font-black text-slate-900 text-base">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-5">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${STATUS_STYLE[inv.status] || 'bg-slate-100 text-slate-500'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2 outline-none">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        title="Export PDF"
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                      >
                        <Download size={16}/>
                      </button>
                      
                      {inv.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(inv.id, 'Paid', inv.patients?.full_name)}
                          disabled={processingId === inv.id}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Mark Paid
                        </button>
                      )}

                      {inv.status === 'Paid' && (
                        <button
                          onClick={() => handleUpdateStatus(inv.id, 'Refunded', inv.patients?.full_name)}
                          disabled={processingId === inv.id}
                          className="p-2 text-slate-300 hover:text-slate-600 rounded-xl transition-all"
                        >
                          <RotateCcw size={16}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
