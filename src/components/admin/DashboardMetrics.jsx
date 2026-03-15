import React from 'react';

function formatNum(n) { return n.toLocaleString(); }

function MiniBarChart() {
    return (
        <div style={{ width: 96, height: 48, background: '#f0fdf8', borderRadius: 8, display: 'flex', alignItems: 'flex-end', padding: '4px 4px', gap: 2, overflow: 'hidden' }}>
            {[4, 6, 8, 5, 9, 7, 10].map((h, i) => (
                <div key={i} style={{ flex: 1, background: `rgba(16,183,127,${0.2 + i * 0.1})`, height: `${h * 10}%`, borderRadius: '2px 2px 0 0', transition: 'height 1s ease' }} />
            ))}
        </div>
    );
}

function GaugeRing({ pct }) {
    return (
        <div style={{ width: 48, height: 48, borderRadius: 24, border: '4px solid #f1f5f9', borderTopColor: '#10b77f', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <span style={{ fontSize: 10, fontWeight: 700 }}>{pct}%</span>
        </div>
    );
}

function MetricCard({ label, value, sub, subIcon, subColor, chart }) {
    return (
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #10b77f0d', boxShadow: '0 1px 4px #0001' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 8 }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: 30, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>{value}</p>
                    <span style={{ color: subColor, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        {subIcon && <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{subIcon}</span>}
                        {sub}
                    </span>
                </div>
                {chart}
            </div>
        </div>
    );
}

export default function DashboardMetrics({ patientCount, throughput, throughputPct, cloudDist, latencyData, escalations, exportPDF, showToast }) {
    return (
        <>
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-4 mb-1 flex-wrap">
                        <h3 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
                            System Pulse Overview
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf8', padding: '4px 12px', borderRadius: 20, border: '1px solid #10b77f33' }}>
                            <div className="vital-pulse" />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#10b77f', textTransform: 'uppercase', letterSpacing: 3 }}>Live Heartbeat: Active</span>
                        </div>
                    </div>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>HIPAA Compliant Real-time Telemetry</p>
                </div>
                <button
                    onClick={() => {
                        const dashboardData = {
                            head: ['Patient ID', 'Detected Risk', 'Agent Responsible', 'Timestamp', 'Status'],
                            body: escalations.map(e => [e.id, e.risk, e.agent, e.time, e.resolved ? 'Resolved' : 'Active'])
                        };
                        exportPDF(dashboardData, 'Dashboard Overview Report');
                        showToast('Report exported as PDF!');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#10b77f', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px #10b77f40' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                    Export Report
                </button>
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                <MetricCard
                    label="Active Patient Monitoring"
                    value={formatNum(patientCount)}
                    sub="+12% vs last hour"
                    subIcon="trending_up"
                    subColor="#10b77f"
                    chart={<MiniBarChart />}
                />
                <MetricCard
                    label="Agent Throughput"
                    value={<>{(throughput / 1000).toFixed(1)}k <span style={{ fontSize: 16, fontWeight: 400, color: '#94a3b8' }}>req/sec</span></>}
                    sub="Optimized Performance"
                    subIcon="bolt"
                    subColor="#10b77f"
                    chart={<GaugeRing pct={throughputPct} />}
                />
                <MetricCard
                    label="Security Posture"
                    value="100% Secure"
                    sub="Encrypted Pipelines"
                    subIcon="lock"
                    subColor="#94a3b8"
                    chart={
                        <div style={{ width: 40, height: 40, background: '#f0fdf8', color: '#10b77f', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>verified</span>
                        </div>
                    }
                />
            </div>
            
            {/* Footer Panels included here for layout convenience since they are part of the main Dashboard View */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, paddingBottom: 40, marginTop: 24 }}>
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #10b77f0d', boxShadow: '0 1px 4px #0001' }}>
                    <h5 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16 }}>Cloud Node Distribution</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 32 }}>
                        <div style={{ flex: cloudDist.usEast / 100, background: '#10b77f', height: '100%', borderRadius: '6px 0 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, transition: 'flex 1s ease' }}>US-E ({cloudDist.usEast}%)</div>
                        <div style={{ flex: cloudDist.euWest / 100, background: '#10b77fb3', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, transition: 'flex 1s ease' }}>EU-W ({cloudDist.euWest}%)</div>
                        <div style={{ flex: cloudDist.asSouth / 100, background: '#10b77f66', height: '100%', borderRadius: '0 6px 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, transition: 'flex 1s ease' }}>AS-S ({cloudDist.asSouth}%)</div>
                    </div>
                </div>
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #10b77f0d', boxShadow: '0 1px 4px #0001' }}>
                    <h5 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16 }}>API Latency Heatmap (Live)</h5>
                    <div style={{ display: 'flex', gap: 4, height: 32, alignItems: 'flex-end' }}>
                        {latencyData.map((v, i) => (
                            <div key={i} style={{ flex: 1, background: v > 70 ? '#ef444466' : v > 40 ? '#f59e0b66' : '#10b77f66', borderRadius: 4, height: `${v}%`, transition: 'height 1s ease' }} title={`${v}ms`} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#94a3b8' }}>
                        <span>low latency</span><span>high latency →</span>
                    </div>
                </div>
            </div>
        </>
    );
}
