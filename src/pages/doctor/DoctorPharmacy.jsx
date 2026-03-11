import React, { useState } from 'react';
import { 
  TrendingUp, Clock, AlertTriangle, DollarSign, PlusCircle, ScanLine, Printer, 
  Package, Edit2, ClipboardList, User, CalendarX, Check
} from 'lucide-react';

export default function DoctorPharmacy() {
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: 'Amoxicillin 500mg',
      sku: 'AMX-500-12',
      category: 'Antibiotic',
      stockLevel: 85,
      status: 'In Stock',
      expiry: '12/2025',
      price: '$12.50',
    },
    {
      id: 2,
      name: 'Lipitor 20mg',
      sku: 'LIP-020-05',
      category: 'Cholesterol',
      stockLevel: 15,
      status: 'Low Stock',
      expiry: '08/2024',
      price: '$45.00',
    },
    {
      id: 3,
      name: 'Insulin Aspart',
      sku: 'INS-ASP-01',
      category: 'Diabetes',
      stockLevel: 0,
      status: 'Out Stock',
      expiry: '05/2026',
      price: '$89.00',
    },
    {
      id: 4,
      name: 'Metformin 850mg',
      sku: 'MET-850-22',
      category: 'Diabetes',
      stockLevel: 95,
      status: 'In Stock',
      expiry: '11/2025',
      price: '$18.25',
    }
  ]);

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patient: 'James Wilson',
      doctor: 'Dr. Emily Blunt',
      time: '15 mins ago',
      status: 'Pending'
    },
    {
      id: 2,
      patient: 'Sarah Adams',
      doctor: 'Dr. Robert Fox',
      time: '45 mins ago',
      status: 'Ready'
    }
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'critical',
      name: 'Insulin Aspart',
      message: 'ZERO STOCK',
      detail: 'Hospital demand: High',
      action: 'Order Now'
    },
    {
      id: 2,
      type: 'warning',
      name: 'Lipitor 20mg',
      message: '5 UNITS LEFT',
      detail: 'Reorder threshold: 15 units',
      action: 'Add to Order'
    }
  ]);

  const addNewMedication = () => {
    const newMed = {
      id: inventory.length + 1,
      name: 'Paracetamol 500mg (New)',
      sku: `PAR-500-${Math.floor(Math.random() * 100)}`,
      category: 'Painkiller',
      stockLevel: 100,
      status: 'In Stock',
      expiry: '12/2026',
      price: '$5.00',
    };
    setInventory(prev => [newMed, ...prev]);
  };

  const handlePrescriptionAction = (id) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id === id && p.status === 'Pending') {
        return { ...p, status: 'Ready' };
      }
      return p;
    }));
  };

  const handleAlertAction = (alertId, medName) => {
    // Remove the alert
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    
    // Simulate updating the inventory
    setInventory(prev => prev.map(med => {
      if (med.name === medName) {
        return {
          ...med,
          stockLevel: 100,
          status: 'In Stock'
        };
      }
      return med;
    }));
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-[#00b289]';
      case 'Low Stock': return 'bg-amber-500';
      case 'Out Stock': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getStockBadgeClass = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-[#00b289]/10 text-[#00b289]';
      case 'Low Stock': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      case 'Out Stock': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Medications</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">1,284</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[#00b289] text-sm font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>+5.2% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Prescriptions</p>
            <h3 className="text-3xl font-bold mt-1 text-amber-500">
              {prescriptions.filter(p => p.status === 'Pending').length}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-amber-600 text-sm font-bold">
            <Clock className="h-4 w-4" />
            <span>Urgent requests</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-3xl font-bold mt-1 text-red-500">
              {inventory.filter(i => i.status === 'Out Stock').length}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-red-600 text-sm font-bold">
            <AlertTriangle className="h-4 w-4" />
            <span>Requires immediate order</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Monthly Sales</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">$12,450</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[#00b289] text-sm font-bold">
            <DollarSign className="h-4 w-4" />
            <span>Target: 92% achieved</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex flex-wrap gap-4 items-center">
        <button 
          onClick={addNewMedication}
          className="flex items-center gap-2 px-6 py-3 bg-[#00b289] text-white rounded-lg font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-[#00b289]/20"
        >
          <PlusCircle className="h-5 w-5" />
          Add New Medication
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <ScanLine className="h-5 w-5" />
          Scan Prescription
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <Printer className="h-5 w-5" />
          Print Label
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Drug Inventory Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="h-6 w-6 text-[#00b289]" />
              Medicine Inventory
            </h2>
            <button className="text-sm text-[#00b289] font-bold hover:underline">View All</button>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Stock Level</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inventory.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{med.name}</p>
                      <p className="text-xs text-slate-500">SKU: {med.sku}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{med.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${getStockColor(med.status)}`} style={{ width: `${med.stockLevel}%` }}></div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStockBadgeClass(med.status)}`}>
                          {med.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{med.expiry}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{med.price}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 text-slate-400 hover:text-[#00b289] transition-colors">
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Prescription Management Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-[#00b289]" />
                Recent Prescriptions
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map(presc => (
                <div key={presc.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[#00b289]/10 flex items-center justify-center text-[#00b289]">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{presc.patient}</p>
                      <p className="text-xs text-slate-500">{presc.doctor} • {presc.time}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          presc.status === 'Pending' 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        }`}>
                          {presc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {presc.status === 'Pending' ? (
                    <button 
                      onClick={() => handlePrescriptionAction(presc.id)}
                      className="px-3 py-1 bg-[#00b289] text-white text-xs font-bold rounded hover:brightness-110"
                    >
                      Fill Order
                    </button>
                  ) : (
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded flex items-center gap-1">
                      <Check className="h-3 w-3" /> Ready
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Alerts Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden shadow-sm">
            <div className="bg-red-50 dark:bg-red-900/10 px-6 py-4 flex items-center gap-2 border-b border-red-100 dark:border-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-sm font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">Critical Stock Alerts</h3>
            </div>
            <div className="p-6 space-y-4">
              {alerts.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4">No critical alerts to display.</div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' ? 'bg-red-50/50 dark:bg-red-900/10 border-red-500' : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{alert.name}</p>
                      <span className={`text-[10px] font-black ${
                        alert.type === 'critical' ? 'text-red-600' : 'text-amber-600'
                      }`}>{alert.message}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{alert.detail}</p>
                    <button 
                      onClick={() => handleAlertAction(alert.id, alert.name)}
                      className={`w-full mt-3 py-1.5 text-white text-xs font-bold rounded transition-colors ${
                        alert.type === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {alert.action}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Expiring Batches</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <CalendarX className="h-4 w-4 text-[#00b289]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Paracetamol 500mg</p>
                  <p className="text-[10px] text-red-500 font-medium">Expires in 12 days (Batch #104)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <CalendarX className="h-4 w-4 text-[#00b289]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Atorvastatin 10mg</p>
                  <p className="text-[10px] text-amber-500 font-medium">Expires in 28 days (Batch #982)</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-200 dark:border-slate-800">
              <button className="text-xs font-bold text-[#00b289] hover:underline">Download Expiry Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
