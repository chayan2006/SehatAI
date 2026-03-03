import React from 'react';

export default function AdminDashboard() {
    return (
        <div className="bg-background-light font-display text-slate-900">
            <style>
                {`
                .vital-pulse {
                    position: relative;
                }
                .vital-pulse::after {
                    content: '';
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background-color: #10B981;
                    border-radius: 50%;
                    right: -2px;
                    top: -2px;
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
            `}
            </style>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">shield</span>
                        </div>
                        <div>
                            <h1 className="font-clash font-bold text-lg leading-tight">Aegis AI</h1>
                            <p className="text-xs text-slate-500 font-medium">Global Admin Control</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 py-2 space-y-1">
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium" href="#">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-sm">Overview</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50:bg-slate-800 transition-colors" href="#">
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-sm">Users</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50:bg-slate-800 transition-colors" href="#">
                            <span className="material-symbols-outlined">smart_toy</span>
                            <span className="text-sm">Agents</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50:bg-slate-800 transition-colors" href="#">
                            <span className="material-symbols-outlined">payments</span>
                            <span className="text-sm">Billing</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50:bg-slate-800 transition-colors" href="#">
                            <span className="material-symbols-outlined">verified_user</span>
                            <span className="text-sm">Compliance</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50:bg-slate-800 transition-colors" href="#">
                            <span className="material-symbols-outlined">terminal</span>
                            <span className="text-sm">API</span>
                        </a>
                    </nav>
                    <div className="p-4 border-t border-slate-200">
                        <div className="flex items-center gap-3 p-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200" data-alt="Admin user profile avatar" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-pZUzwh6wOUlSxZqTMMrEmFJzev4v6PGMjIQhA1Y6HepVs1H_rIMJWg3gc8SktefQafT8vhM4PqmO5nUwyv2WDpiMjyDpTor7hvreg9xFo2vwjexZfLz2HxU1pOflUeEtEV7lrlGSOWGqm81ERK_ELNQV-ByguscHj2RA1q25NTBqNM1DeuCfH0eYFsCN4IRhipgPdXcHH8X--D3pHEueelmU_qI9jhn-wOKGDm0a_Zj59UnJtwXueAVpi7xuNBkx_8kmxxFq34M')", backgroundSize: "cover" }}></div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold truncate">Senior Architect</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">HIPAA Certified</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 text-sm cursor-pointer">settings</span>
                        </div>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto relative">
                    {/* Header/Action Bar Area */}
                    <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-slate-200">
                        <h2 className="font-clash text-2xl font-bold tracking-tight">System Command Center</h2>
                        <div className="flex gap-3">
                            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all">
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                Add New Patient
                            </button>
                            <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50:bg-slate-700 transition-all">
                                <span className="material-symbols-outlined text-sm">description</span>
                                Export Audit Log
                            </button>
                            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all">
                                <span className="material-symbols-outlined text-sm">sync</span>
                                Global Sync
                            </button>
                        </div>
                    </header>
                    <div className="p-8 space-y-8 max-w-7xl mx-auto">
                        {/* 1. System Health Ribbon */}
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Active Agents</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold font-clash">1,240</span>
                                    <span className="text-vital-green text-sm font-bold pb-1 flex items-center"><span className="material-symbols-outlined text-xs">trending_up</span> 5.2%</span>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Patients</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold font-clash">4,892</span>
                                    <span className="text-vital-green text-sm font-bold pb-1 flex items-center"><span className="material-symbols-outlined text-xs">trending_up</span> 1.8%</span>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">System Uptime</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold font-clash">99.9%</span>
                                    <span className="text-slate-400 text-sm font-medium pb-1">Stable</span>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-vital-green/30 shadow-sm ring-1 ring-vital-green/10">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">HIPAA Compliance</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold font-clash text-vital-green">Active</span>
                                    <div className="w-2.5 h-2.5 bg-vital-green rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </section>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* 2. User Management Table (Left 2/3) */}
                            <section className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-clash text-xl font-bold">User Management</h3>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                                        <input className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-primary focus:border-primary" placeholder="Search staff or patients..." type="text" />
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr className="hover:bg-slate-50:bg-slate-800/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary text-xs">SC</div>
                                                        <span className="text-sm font-semibold">Dr. Sarah Chen</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">Doctor</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-vital-green">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-vital-green"></span> Active
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary hover:text-primary/80 font-bold text-xs">MANAGE</button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50:bg-slate-800/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary text-xs">JW</div>
                                                        <span className="text-sm font-semibold">James Wilson</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">Caregiver</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-vital-green">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-vital-green"></span> Active
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary hover:text-primary/80 font-bold text-xs">MANAGE</button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50:bg-slate-800/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary text-xs">ER</div>
                                                        <span className="text-sm font-semibold">Elena Rodriguez</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">Patient</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary hover:text-primary/80 font-bold text-xs">MANAGE</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                            {/* 4. Subscription Revenue Widget (Right 1/3) */}
                            <section className="space-y-4">
                                <h3 className="font-clash text-xl font-bold">Subscription Revenue</h3>
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">MRR Growth</p>
                                        <p className="text-3xl font-bold font-clash text-slate-900">$142,800</p>
                                    </div>
                                    {/* Simple visual chart using Tailwind bars */}
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold uppercase">
                                                <span>Enterprise Tier</span>
                                                <span>65%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full" style={{ width: "65%" }}></div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold uppercase">
                                                <span>Clinic Pro</span>
                                                <span>25%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-vital-green h-full rounded-full opacity-60" style={{ width: "25%" }}></div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold uppercase">
                                                <span>Individual Docs</span>
                                                <span>10%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-slate-300 h-full rounded-full" style={{ width: "10%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <button className="w-full py-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
                                            VIEW DETAILED ANALYTICS <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                        {/* 3. Multi-Agent Orchestrator View */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-clash text-xl font-bold">Multi-Agent Orchestrator</h3>
                                <span className="text-xs font-bold text-vital-green flex items-center gap-1 bg-vital-green/10 px-2 py-1 rounded">
                                    <span className="material-symbols-outlined text-xs">bolt</span>
                                    ALL SYSTEMS NOMINAL
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Agent Card 1 */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                        </div>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" />
                                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                                        Patient Scheduler
                                        <span className="vital-pulse"></span>
                                    </h4>
                                    <p className="text-xs text-slate-500">Automated intake &amp; scheduling</p>
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                        <span>Latency: 45ms</span>
                                        <span className="text-vital-green">Online</span>
                                    </div>
                                </div>
                                {/* Agent Card 2 */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                            <span className="material-symbols-outlined">warning</span>
                                        </div>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" />
                                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                                        Risk Analyzer
                                        <span className="vital-pulse"></span>
                                    </h4>
                                    <p className="text-xs text-slate-500">Early symptom risk detection</p>
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                        <span>Latency: 120ms</span>
                                        <span className="text-vital-green">Online</span>
                                    </div>
                                </div>
                                {/* Agent Card 3 */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <span className="material-symbols-outlined">medication</span>
                                        </div>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" />
                                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                                        Pharma Bot
                                        <span className="vital-pulse"></span>
                                    </h4>
                                    <p className="text-xs text-slate-500">Medication interaction checks</p>
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                        <span>Latency: 32ms</span>
                                        <span className="text-vital-green">Online</span>
                                    </div>
                                </div>
                                {/* Agent Card 4 */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group border-l-4 border-l-emergency">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-red-100 rounded-lg text-emergency">
                                            <span className="material-symbols-outlined">hub</span>
                                        </div>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input className="sr-only peer" type="checkbox" />
                                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 text-emergency">Network Orchestrator</h4>
                                    <p className="text-xs text-slate-500">Multi-agent data routing</p>
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-emergency">
                                        <span>Latency: TIMEOUT</span>
                                        <span>Offline</span>
                                    </div>
                                </div>
                                {/* Additional Agent Cards (8 total as requested) */}
                                {/* 5 */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" />
                                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2">Report Generator <span className="vital-pulse"></span></h4>
                                    <p className="text-xs text-slate-500">Automated clinical notes</p>
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                        <span>Latency: 210ms</span>
                                        <span className="text-vital-green">Online</span>
                                    </div>
                                </div>
                                {/* 6 */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                            <span className="material-symbols-outlined">monitoring</span>
                                        </div>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" />
                                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2">Vital Tracker <span className="vital-pulse"></span></h4>
                                    <p className="text-xs text-slate-500">Real-time IoT stream processing</p>
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                        <span>Latency: 15ms</span>
                                        <span className="text-vital-green">Online</span>
                                    </div>
                                </div>
                                {/* 7 */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                            <span className="material-symbols-outlined">security</span>
                                        </div>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" />
                                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2">Compliance Guard <span className="vital-pulse"></span></h4>
                                    <p className="text-xs text-slate-500">PII scrubbing &amp; audit logs</p>
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                        <span>Latency: 8ms</span>
                                        <span className="text-vital-green">Online</span>
                                    </div>
                                </div>
                                {/* 8 */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                            <span className="material-symbols-outlined">forum</span>
                                        </div>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" />
                                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2">Billing Assistant <span className="vital-pulse"></span></h4>
                                    <p className="text-xs text-slate-500">ICD-10 code extraction</p>
                                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                        <span>Latency: 64ms</span>
                                        <span className="text-vital-green">Online</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <footer className="pt-8 pb-12 border-t border-slate-200 flex justify-between items-center">
                            <p className="text-xs text-slate-400 font-medium">© 2024 Aegis AI Health Monitoring. HIPAA Secure Access Protocol v4.2.0</p>
                            <div className="flex gap-4">
                                <a className="text-xs font-bold text-slate-400 hover:text-primary" href="#">SUPPORT</a>
                                <a className="text-xs font-bold text-slate-400 hover:text-primary" href="#">SECURITY CENTER</a>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    )
}
