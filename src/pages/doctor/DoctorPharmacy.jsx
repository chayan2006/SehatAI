import React, { useState } from 'react';
import { 
  TrendingUp, Clock, AlertTriangle, DollarSign, PlusCircle, ScanLine, Printer, 
  Package, Edit2, ClipboardList, User, CalendarX, Check, Brain, LineChart as LineChartIcon
} from 'lucide-react';

export default function DoctorPharmacy() {
  const [forecastMode, setForecastMode] = useState(false);
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
      burnRate: 4.2,
      predictedOutDays: 20
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
      burnRate: 2.1,
      predictedOutDays: 7
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
      burnRate: 8.5,
      predictedOutDays: 0
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
      burnRate: 3.8,
      predictedOutDays: 25
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
      burnRate: 15.0,
      predictedOutDays: 6
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
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setInventory(prev => prev.map(med => {
      if (med.name === medName) {
        return {
          ...med,
          stockLevel: 100,
          status: 'In Stock',
          predictedOutDays: 30
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pharmacy Intelligence</h2>
          <p className="text-slate-500 mt-1">AI-driven inventory forecasting and prescription management</p>
        </div>
        <Button 
          onClick={() => setForecastMode(!forecastMode)}
          className={`flex items-center gap-2 px-6 h-12 rounded-xl font-bold transition-all ${forecastMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          <Brain className={forecastMode ? 'animate-pulse' : ''} size={18} />
          {forecastMode ? 'Live Prediction Active' : 'Enable AI Forecast'}
        </Button>
      </div>

      {/* Summary Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Inventory', val: '1,284', icon: Package, color: 'indigo', sub: '+5.2% trend' },
          { label: 'Pending Requests', val: prescriptions.filter(p => p.status === 'Pending').length, icon: Clock, color: 'amber', sub: 'Urgent priority' },
          { label: 'Out of Stock', val: inventory.filter(i => i.status === 'Out Stock').length, icon: AlertTriangle, color: 'red', sub: 'Immediate order req.' },
          { label: 'Forecast Accuracy', val: '98.4%', icon: TrendingUp, color: 'emerald', sub: 'Model: Sehat-Forecaster v2' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
                 <stat.icon size={20} />
               </div>
               <span className={`text-[10px] font-black uppercase text-${stat.color}-500 tracking-widest`}>{stat.sub}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-black mt-1 text-slate-900">{stat.val}</h3>
          </div>
        ))}
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Inventory & Forecast */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Demand Forecast View (Feature 3) */}
          {forecastMode && (
            <Card className="border-indigo-100 bg-indigo-50/10 overflow-hidden animate-in slide-in-from-top-4 duration-500">
              <CardHeader className="bg-white border-b border-indigo-50 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-indigo-900 flex items-center gap-2">
                    <LineChartIcon className="text-indigo-600" size={20} />
                    Predictive Consumption Forecast
                  </CardTitle>
                  <CardDescription className="text-indigo-400">Next 30 days based on seasonal hospital visit trends</CardDescription>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 border-none font-black text-[10px]">REAL-TIME NEURAL MODEL</Badge>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-48 w-full flex items-end gap-2 px-4 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-0 bottom-0 border-b border-indigo-100 flex flex-col justify-between pointer-events-none opacity-50">
                    <div className="border-t border-indigo-50 w-full h-0"></div>
                    <div className="border-t border-indigo-50 w-full h-0"></div>
                    <div className="border-t border-indigo-50 w-full h-0"></div>
                  </div>
                  
                  {/* Forecast Bars */}
                  {[45, 52, 68, 72, 85, 92, 110, 95, 82, 75, 65, 58].map((h, i) => (
                    <div key={i} className="flex-1 group relative">
                      <div 
                        className={`w-full bg-indigo-${i > 6 ? '500' : '200'} rounded-t-md transition-all duration-1000 ease-out hover:bg-indigo-600 cursor-help`}
                        style={{ height: `${h}%` }}
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                           Day {i*3}: {h} units
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Today</span>
                  <span>+15 Days</span>
                  <span>+30 Days</span>
                </div>
                
                <div className="mt-8 bg-white border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="size-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                       <TrendingUp size={20} />
                     </div>
                     <div>
                       <h5 className="text-sm font-black text-indigo-900">Projected Surge Detected</h5>
                       <p className="text-xs text-slate-500">Antibiotic demand expected to rise by 22% in Week 3.</p>
                     </div>
                   </div>
                   <Button className="bg-indigo-600 text-white text-xs h-9 font-bold px-4">Pre-Order Batches</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medicine Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
               <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                 <Package size={16} className="text-[#00b289]" /> 
                 Smart Inventory Control
               </h3>
               <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest">In Stock</Button>
                 <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-red-500">Low/Out</Button>
               </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-50 bg-slate-50/30">
                  <th className="px-6 py-4">Medication & SKU</th>
                  <th className="px-4 py-4">Availability</th>
                  {forecastMode ? (
                    <th className="px-4 py-4 bg-indigo-50/50 text-indigo-600">AI Depletion Forecast</th>
                  ) : (
                    <th className="px-4 py-4">Price</th>
                  )}
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inventory.map(med => (
                  <tr key={med.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">{med.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {med.sku} • Exp: {med.expiry}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${getStockBadgeClass(med.status)}`}>{med.status}</span>
                          <span className="text-[10px] font-bold text-slate-500">{med.stockLevel}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full ${getStockColor(med.status)} transition-all duration-1000`} style={{ width: `${med.stockLevel}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {forecastMode ? (
                        <div className="flex items-center gap-3 animate-in fade-in duration-500">
                          <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${med.predictedOutDays < 5 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {med.predictedOutDays === 0 ? 'DEPLETED' : `OUT IN ${med.predictedOutDays} DAYS`}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">Rate: {med.burnRate}/day</span>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-900">{med.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                         <Edit2 size={14} />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Alerts & Prescriptions */}
        <div className="space-y-8">
           
           {/* Critical Alerts */}
           <div className="bg-white rounded-2xl border border-red-50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-red-50 flex items-center justify-between">
                <h4 className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={14} /> Critical Stock Feed
                </h4>
                <Badge className="bg-red-100 text-red-700 border-none font-black text-[10px] px-1.5">LIVE</Badge>
              </div>
              <div className="p-6 space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-4 bg-white border border-red-100 rounded-xl hover:shadow-sm transition-shadow group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-black text-slate-900 uppercase group-hover:text-red-600 transition-colors">{alert.name}</p>
                      <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{alert.message}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic mb-4">{alert.detail}</p>
                    <Button 
                      onClick={() => handleAlertAction(alert.id, alert.name)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1 h-8 text-[11px]"
                    >
                      Process Fulfillment
                    </Button>
                  </div>
                ))}
              </div>
           </div>

           {/* Pending Prescriptions */}
           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
             <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList size={14} className="text-[#00b289]" /> Pending RX Orders
                </h4>
             </div>
             <div className="p-2 space-y-1">
               {prescriptions.map(presc => (
                 <div key={presc.id} className="p-4 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-none mb-1">{presc.patient}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">By {presc.doctor} • {presc.time}</p>
                      </div>
                    </div>
                    {presc.status === 'Pending' ? (
                      <Button 
                        onClick={() => handlePrescriptionAction(presc.id)}
                        className="bg-[#00b289]/10 text-[#00b289] hover:bg-[#00b289] hover:text-white border-none h-7 text-[10px] font-black px-3"
                      >
                        Verify
                      </Button>
                    ) : (
                      <Check className="text-[#00b289]" size={16} />
                    )}
                 </div>
               ))}
             </div>
             <div className="p-4 bg-slate-50/50 text-center border-t border-slate-50">
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Batch Process All</button>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
