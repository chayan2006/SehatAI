import React from 'react';
import { Search, DollarSign, FileText, AlertTriangle, MoreVertical, Plus, Bell, ChevronDown } from 'lucide-react';

export default function DoctorBilling() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:-translate-y-1 transition-transform duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#00b289]/10 rounded-lg text-[#00b289]">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">+12.5%</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-slate-100">$45,280.00</p>
          <p className="text-xs text-slate-400 mt-2">vs last 30 days</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:-translate-y-1 transition-transform duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">Active</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Pending Claims</h3>
          <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-slate-100">128</p>
          <p className="text-xs text-slate-400 mt-2">Avg processing: 4 days</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:-translate-y-1 transition-transform duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-full">-5.4%</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Outstanding Invoices</h3>
          <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-slate-100">$12,450.00</p>
          <p className="text-xs text-slate-400 mt-2">vs 42 active patients</p>
        </div>
      </div>

      {/* Middle Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Collections Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Daily Collections</h3>
              <p className="text-sm text-slate-500">Last 7 days performance</p>
            </div>
            <div className="flex gap-2">
              <button className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">CSV</button>
              <button className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">PDF</button>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-48 gap-2 xs:gap-4 px-2 xs:px-4">
            {/* Chart Bars */}
            {[
              { label: 'Mon', value: '$4.2k', height: '60%', color: 'bg-[#00b289]/20' },
              { label: 'Tue', value: '$6.8k', height: '85%', color: 'bg-[#00b289]/40' },
              { label: 'Wed', value: '$3.1k', height: '45%', color: 'bg-[#00b289]/20' },
              { label: 'Thu', value: '$5.5k', height: '70%', color: 'bg-[#00b289]/60' },
              { label: 'Fri', value: '$4.4k', height: '55%', color: 'bg-[#00b289]/30' },
              { label: 'Sat', value: '$8.2k', height: '100%', color: 'bg-[#00b289]' },
              { label: 'Sun', value: '$2.9k', height: '40%', color: 'bg-[#00b289]/50' }
            ].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                <div className={`${day.color} w-full max-w-[40px] rounded-t-lg relative transition-all duration-300 group-hover:bg-[#00b289]/80`} style={{ height: day.height }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {day.value}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance Claims Status Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-100">Provider Status</h3>
          <p className="text-sm text-slate-500 mb-6">Claims approval rate</p>
          
          <div className="space-y-6">
            {[
              { name: 'Blue Cross', rate: '82%', color: 'bg-[#00b289]' },
              { name: 'Aetna', rate: '45%', color: 'bg-blue-500' },
              { name: 'Medicare', rate: '68%', color: 'bg-indigo-500' },
              { name: 'Cigna', rate: '23%', color: 'bg-red-500' }
            ].map((provider, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2 text-slate-700 dark:text-slate-200">
                  <span className="font-medium">{provider.name}</span>
                  <span className="font-bold">{provider.rate}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`${provider.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: provider.rate }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Invoices</h3>
          <button className="bg-[#00b289] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00b289]/90 transition-colors w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Patient Name</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Provider</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Invoice Date</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Amount</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { initials: 'JS', name: 'James Sullivan', provider: 'Blue Cross', date: 'Oct 24, 2023', amount: '$1,240.00', status: 'Paid', statusClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
                { initials: 'AM', name: 'Amara Miller', provider: 'Aetna', date: 'Oct 23, 2023', amount: '$450.00', status: 'Partial', statusClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
                { initials: 'RT', name: 'Robert Taylor', provider: 'Medicare', date: 'Oct 21, 2023', amount: '$2,800.00', status: 'Overdue', statusClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
                { initials: 'EH', name: 'Elena Huang', provider: 'Cigna', date: 'Oct 20, 2023', amount: '$890.00', status: 'Paid', statusClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                        {row.initials}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.provider}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{row.date}</td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">{row.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                    <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#00b289] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00b289]/50">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
