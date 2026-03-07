import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';

// Mock data for Patient Admissions over 30 days
const admissionsData = Array.from({ length: 30 }, (_, i) => ({
    name: `Day ${i + 1}`,
    admissions: Math.floor(Math.random() * 50) + 120,
    discharges: Math.floor(Math.random() * 40) + 110,
}));

// Mock Data for Cloud Node Load Comparison
const cloudLoadData = [
    { name: '00:00', usEast: 45, euWest: 30, asSouth: 25 },
    { name: '04:00', usEast: 30, euWest: 50, asSouth: 20 },
    { name: '08:00', usEast: 65, euWest: 40, asSouth: 45 },
    { name: '12:00', usEast: 85, euWest: 60, asSouth: 70 },
    { name: '16:00', usEast: 95, euWest: 75, asSouth: 80 },
    { name: '20:00', usEast: 70, euWest: 45, asSouth: 50 },
];

export default function AnalyticsView() {
    return (
        <div className="p-8 space-y-8" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
                    Advanced Analytics
                </h1>
                <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Historical trends, predictive capacity, and deep infrastructure telemetry.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                {/* 30-Day Admissions Trend */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-symbols-outlined" style={{ color: '#10b77f' }}>insights</span>
                        30-Day Admissions vs Discharges
                    </h3>
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={admissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b77f" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b77f" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDischarges" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} minTickGap={30} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: 13, fontWeight: 600 }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                <Area type="monotone" dataKey="admissions" name="Admissions" stroke="#10b77f" strokeWidth={3} fillOpacity={1} fill="url(#colorAdmissions)" />
                                <Area type="monotone" dataKey="discharges" name="Discharges" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDischarges)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cloud Load Heatmap/BarChart */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>dns</span>
                        24hr Cloud Region Load Distribution
                    </h3>
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cloudLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                <Bar dataKey="usEast" name="US-East" stackId="a" fill="#10b77f" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="euWest" name="EU-West" stackId="a" fill="#60a5fa" />
                                <Bar dataKey="asSouth" name="Asia-South" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Predictive Staffing Heatmap */}
                <div style={{ gridColumn: '1 / -1', background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>query_stats</span>
                            Predictive Staffing Needs (Next 7 Days)
                        </h3>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', background: '#f8fafc', padding: '4px 8px', borderRadius: 8 }}>
                            AI Generated Forecast
                        </span>
                    </div>
                    {/* CSS Grid Heatmap representation */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'min-content repeat(7, 1fr)', gap: 4 }}>
                        {/* Headers */}
                        <div />
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                            <div key={d} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textAlign: 'center', paddingBottom: 8 }}>{d}</div>
                        ))}

                        {/* Rows */}
                        {['Morning (08-16)', 'Evening (16-00)', 'Night (00-08)'].map((shift, rIndex) => (
                            <React.Fragment key={shift}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', paddingRight: 16, whiteSpace: 'nowrap' }}>
                                    {shift}
                                </div>
                                {Array.from({ length: 7 }).map((_, cIndex) => {
                                    // Generate a mock intensity value (0 to 100)
                                    // Make weekends/evenings slightly higher
                                    const base = (cIndex > 4 ? 40 : 20) + (rIndex === 1 ? 30 : 0);
                                    const intensity = Math.min(100, base + Math.floor(Math.random() * 40));

                                    let bgColor = '#f1f5f9';
                                    let color = '#94a3b8';
                                    if (intensity > 80) { bgColor = '#f87171'; color = 'white'; }
                                    else if (intensity > 60) { bgColor = '#fbbf24'; color = 'white'; }
                                    else if (intensity > 40) { bgColor = '#34d399'; color = 'white'; }
                                    else { bgColor = '#a7f3d0'; color = '#065f46'; }

                                    return (
                                        <div key={cIndex} style={{
                                            background: bgColor,
                                            color: color,
                                            height: 48,
                                            borderRadius: 6,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            cursor: 'pointer'
                                        }}
                                            title={`Predicted Load: ${intensity}%`}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            {intensity}%
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                        <span>Legend:</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#a7f3d0', borderRadius: 2 }} /> Minimal</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#34d399', borderRadius: 2 }} /> Normal</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#fbbf24', borderRadius: 2 }} /> Elevated</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#f87171', borderRadius: 2 }} /> Critical</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
