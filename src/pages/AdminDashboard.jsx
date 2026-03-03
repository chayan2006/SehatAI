import React from 'react';

export default function AdminDashboard() {
    return (
        <div className="bg-background-light text-slate-900 font-display min-h-screen flex overflow-hidden">
            <style>
                {`
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .vital-pulse {
                    position: relative;
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    background-color: #10b77f;
                    border-radius: 50%;
                }
                .vital-pulse::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 50%;
                    border: 2px solid #10b77f;
                    animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.33); opacity: 1; }
                    80%, 100% { transform: scale(3); opacity: 0; }
                }
                `}
            </style>

            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-primary/10 flex flex-col z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">shield_with_heart</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-none">Aegis AI</h1>
                        <p className="text-xs text-primary font-medium mt-1">Health Monitoring</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary cursor-pointer">
                        <span className="material-symbols-outlined text-xl">grid_view</span>
                        <span className="text-sm font-semibold">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-xl">group</span>
                        <span className="text-sm font-medium">Patient Monitoring</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-xl">memory</span>
                        <span className="text-sm font-medium">Agent Status</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-xl">report_problem</span>
                        <span className="text-sm font-medium">Escalations</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-xl">verified_user</span>
                        <span className="text-sm font-medium">Security</span>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                        <div className="size-8 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5fqLfyJ-nJu2cirLYb5p2JEuSv0z0rLM4Fu0KZXmyhgTHzxRHLHSkqgrjB3tmW6QAa1E8guwgKuipBvSc9bNAjRquaraaWll_H7ephvC-s6rk7MtLahZLD1P03jXEhZ1wO4kk2hUL1FQQWtHwzHdwPCrssqaXrQ8i6t_JCmUrCN-b9BOjMM3gGtHPH0fKCEWCPI-s9B3LpSHFQb0jjDZ6UcPG-qEZblQ3Fgj9N6g8qWx44A-z9hqGJz05VnfjEyfMRE0RZngk2x0')" }}></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">Dr. Sarah Chen</p>
                            <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">Sr. AI Architect</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-background-light">
                {/* Header */}
                <header className="h-16 flex-shrink-0 border-b border-primary/5 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                        <h2 className="text-lg font-bold">Admin Pulse Overview</h2>
                        <nav className="hidden md:flex items-center gap-6">
                            <a className="text-sm font-medium text-slate-500 hover:text-primary" href="#">Systems</a>
                            <a className="text-sm font-medium text-slate-500 hover:text-primary" href="#">Reports</a>
                            <a className="text-sm font-medium text-slate-500 hover:text-primary" href="#">Audit Logs</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary w-64" placeholder="Search telemetry..." type="text" />
                        </div>
                        <button className="size-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                        </button>
                        <button className="size-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <span className="material-symbols-outlined text-xl">settings</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 space-y-8">
                    {/* Dynamic Header */}
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h3 className="text-3xl font-black tracking-tight">System Pulse Overview</h3>
                                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                    <div className="vital-pulse"></div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Heartbeat: Active</span>
                                </div>
                            </div>
                            <p className="text-slate-500 font-medium">HIPAA Compliant Real-time Telemetry</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export Report
                        </button>
                    </div>

                    {/* Data Grid (3x1) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="bg-white p-6 rounded-xl border border-primary/5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500 mb-2">Active Patient Monitoring</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold font-mono tracking-tight">1,284</p>
                                    <span className="text-primary text-xs font-bold flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-xs">trending_up</span>
                                        +12% vs last hour
                                    </span>
                                </div>
                                <div className="w-24 h-12 bg-primary/5 rounded flex items-end px-1 py-1 overflow-hidden">
                                    <div className="flex-1 bg-primary/20 h-4 mx-0.5 rounded-t-sm"></div>
                                    <div className="flex-1 bg-primary/30 h-6 mx-0.5 rounded-t-sm"></div>
                                    <div className="flex-1 bg-primary/40 h-8 mx-0.5 rounded-t-sm"></div>
                                    <div className="flex-1 bg-primary/50 h-5 mx-0.5 rounded-t-sm"></div>
                                    <div className="flex-1 bg-primary/60 h-9 mx-0.5 rounded-t-sm"></div>
                                    <div className="flex-1 bg-primary/80 h-7 mx-0.5 rounded-t-sm"></div>
                                    <div className="flex-1 bg-primary h-10 mx-0.5 rounded-t-sm"></div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-6 rounded-xl border border-primary/5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500 mb-2">Agent Throughput</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold font-mono tracking-tight">2.4k <span className="text-lg font-normal text-slate-400 font-sans">req/sec</span></p>
                                    <span className="text-primary text-xs font-bold flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-xs">bolt</span>
                                        Optimized Performance
                                    </span>
                                </div>
                                <div className="size-12 rounded-full border-4 border-slate-100 border-t-primary flex items-center justify-center">
                                    <span className="text-[10px] font-bold">84%</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-6 rounded-xl border border-primary/5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500 mb-2">Security Posture</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold tracking-tight">100% Secure</p>
                                    <span className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-xs">lock</span>
                                        Encrypted Pipelines
                                    </span>
                                </div>
                                <div className="size-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agent Status Monitor */}
                    <div className="bg-white p-6 rounded-xl border border-primary/5 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                                Agent Performance Monitor
                            </h4>
                            <span className="text-xs text-slate-500 font-medium">8 Agents Operational</span>
                        </div>
                        <div className="space-y-6">
                            {/* Agent Rows */}
                            <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-12 sm:col-span-2 text-sm font-bold text-slate-700">Risk Assessment</div>
                                <div className="col-span-9 sm:col-span-8 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div className="bg-primary h-full" style={{ width: "72%" }}></div>
                                </div>
                                <div className="col-span-3 sm:col-span-2 text-right font-mono text-xs font-bold text-primary">72% Load</div>
                            </div>

                            <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-12 sm:col-span-2 text-sm font-bold text-slate-700">Scheduler</div>
                                <div className="col-span-9 sm:col-span-8 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div className="bg-primary/40 h-full" style={{ width: "15%" }}></div>
                                </div>
                                <div className="col-span-3 sm:col-span-2 text-right font-mono text-xs font-bold text-primary">15% Load</div>
                            </div>

                            <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-12 sm:col-span-2 text-sm font-bold text-slate-700">Drug Interaction</div>
                                <div className="col-span-9 sm:col-span-8 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div className="bg-primary/80 h-full" style={{ width: "88%" }}></div>
                                </div>
                                <div className="col-span-3 sm:col-span-2 text-right font-mono text-xs font-bold text-primary">88% Load</div>
                            </div>

                            <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-12 sm:col-span-2 text-sm font-bold text-slate-700">Clinical Coding</div>
                                <div className="col-span-9 sm:col-span-8 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div className="bg-primary/60 h-full" style={{ width: "45%" }}></div>
                                </div>
                                <div className="col-span-3 sm:col-span-2 text-right font-mono text-xs font-bold text-primary">45% Load</div>
                            </div>
                        </div>
                    </div>

                    {/* Active Escalations Table */}
                    <div className="bg-white rounded-xl border border-primary/5 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h4 className="font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-emergency-red">priority_high</span>
                                Active Escalations (Requires Intervention)
                            </h4>
                            <span className="bg-emergency-red/10 text-emergency-red text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">3 Critical</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                                        <th className="px-6 py-3 whitespace-nowrap">Patient ID</th>
                                        <th className="px-6 py-3 whitespace-nowrap">Detected Risk</th>
                                        <th className="px-6 py-3 whitespace-nowrap">Agent Responsible</th>
                                        <th className="px-6 py-3 whitespace-nowrap">Timestamp</th>
                                        <th className="px-6 py-3 text-right whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm font-bold whitespace-nowrap">#PX-8812</td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">Anomalous Heart Rate Spike</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase">Vitals-Agent-04</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">14:22:05 GMT</td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button className="px-4 py-1.5 bg-emergency-red text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">OVERRIDE</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm font-bold whitespace-nowrap">#PX-9004</td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">Contraindicated Rx Match</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase">Interaction-Lab</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">14:21:50 GMT</td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button className="px-4 py-1.5 bg-emergency-red text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">OVERRIDE</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm font-bold whitespace-nowrap">#PX-7721</td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">Sudden O2 Desaturation</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase">Risk-Scanner</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">14:19:12 GMT</td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button className="px-4 py-1.5 bg-emergency-red text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">OVERRIDE</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Infrastructure Health Footer */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                        <div className="bg-white p-6 rounded-xl border border-primary/5 shadow-sm">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Cloud Node Distribution</h5>
                            <div className="flex items-center gap-1">
                                <div className="flex-[0.45] bg-primary h-8 rounded-l-md flex items-center justify-center text-[10px] text-white font-bold">US-EAST (45%)</div>
                                <div className="flex-[0.30] bg-primary/70 h-8 flex items-center justify-center text-[10px] text-white font-bold">EU-WEST (30%)</div>
                                <div className="flex-[0.25] bg-primary/40 h-8 rounded-r-md flex items-center justify-center text-[10px] text-white font-bold text-nowrap">AS-S (25%)</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-primary/5 shadow-sm">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">API Latency Heatmap</h5>
                            <div className="flex gap-1 h-8">
                                <div className="flex-1 bg-primary/20 rounded-sm"></div>
                                <div className="flex-1 bg-primary/30 rounded-sm"></div>
                                <div className="flex-1 bg-primary/20 rounded-sm"></div>
                                <div className="flex-1 bg-primary/40 rounded-sm"></div>
                                <div className="flex-1 bg-primary rounded-sm"></div>
                                <div className="flex-1 bg-primary/80 rounded-sm"></div>
                                <div className="flex-1 bg-primary/20 rounded-sm"></div>
                                <div className="flex-1 bg-primary/10 rounded-sm"></div>
                                <div className="flex-1 bg-primary/40 rounded-sm"></div>
                                <div className="flex-1 bg-primary/60 rounded-sm"></div>
                                <div className="flex-1 bg-primary/20 rounded-sm"></div>
                                <div className="flex-1 bg-primary rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
