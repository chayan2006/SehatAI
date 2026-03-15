import React from 'react';

export default function SecurityView({ 
    auditEvents, 
    reviewedEvents, 
    setReviewedEvents, 
    safetyAgents, 
    securityScan, 
    setSecurityScan, 
    patientCount, 
    throughput, 
    throughputPct, 
    exportPDF, 
    showToast,
    formatNum 
}) {
    return (
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1200, margin: '0 auto', width: '100%' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Security &amp; Compliance</h1>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#ecfdf5', color: '#059669', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', borderRadius: 20, letterSpacing: 2 }}>
                            <div className="vital-pulse" />
                            Live Heartbeat: Active
                        </span>
                    </div>
                    <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>HIPAA Compliant Real-time Telemetry &amp; Pipeline Monitoring</p>
                </div>
                <button
                    onClick={() => {
                        const secData = {
                            head: ['Event ID', 'Detected Risk', 'Agent Source', 'Time'],
                            body: auditEvents.map(e => [e.id, e.risk, e.agent, e.time])
                        };
                        exportPDF(secData, 'Security Audit Report');
                        showToast('Compliance audit exported!');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#10b77f', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px #10b77f30' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                    Export Compliance Audit
                </button>
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>

                {/* Active Monitoring */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, margin: 0 }}>Active Monitoring</p>
                        <span className="material-symbols-outlined" style={{ color: 'rgba(16,183,127,0.15)', fontSize: 40, position: 'absolute', top: -4, right: -4 }}>analytics</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 16 }}>
                        <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatNum(patientCount)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#10b77f', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
                            12% vs last hr
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 40 }}>
                        {[16, 24, 32, 40, 28, 36].map((h, i) => (
                            <div key={i} style={{ flex: 1, borderRadius: 2, height: h, background: i < 2 ? `rgba(16,183,127,${0.15 + i * 0.1})` : i < 4 ? '#10b77f' : '#10b77f99' }} />
                        ))}
                    </div>
                </div>

                {/* Encrypted Pipelines */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Encrypted Pipelines</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em' }}>{(throughput / 1000).toFixed(1)}k</span>
                            <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>req/sec</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b77f', fontSize: 11, fontWeight: 700 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bolt</span>
                            Optimized Performance
                        </div>
                    </div>
                    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="40" cy="40" r="34" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                            <circle cx="40" cy="40" r="34" fill="transparent" stroke="#10b77f" strokeWidth="6"
                                strokeDasharray="213.6"
                                strokeDashoffset={213.6 - (213.6 * throughputPct) / 100}
                                style={{ transition: 'stroke-dashoffset 1s ease' }}
                            />
                        </svg>
                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{throughputPct}%</span>
                    </div>
                </div>

                {/* Security Posture */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Security Posture</p>
                        <h3 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.01em' }}>100% Secure</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: 11, fontWeight: 500 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
                            End-to-End Encrypted
                        </div>
                    </div>
                    <div style={{ width: 56, height: 56, background: '#f0fdf8', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ color: '#10b77f', fontSize: 30 }}>verified</span>
                    </div>
                </div>
            </div>

            {/* Real-time Safety Load Monitor */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(248,250,252,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-symbols-outlined" style={{ color: '#10b77f', fontSize: 20 }}>assessment</span>
                        <h3 style={{ fontWeight: 700, margin: 0 }}>Real-time Safety Load Monitor</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>8 Compliance Agents Operational</span>
                        <button
                            onClick={() => { setSecurityScan(true); showToast('Vulnerability scan initiated…'); setTimeout(() => { setSecurityScan(false); showToast('Scan complete — 0 vulnerabilities found!'); }, 4000); }}
                            disabled={securityScan}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: securityScan ? '#94a3b8' : '#10b77f', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 12, border: 'none', cursor: securityScan ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{securityScan ? 'hourglass_top' : 'security_update_good'}</span>
                            {securityScan ? 'Scanning…' : 'Run Scan'}
                        </button>
                    </div>
                </div>
                <div style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {safetyAgents.map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <div style={{ width: 160, flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{a.name}</div>
                            <div style={{ flex: 1, background: '#f1f5f9', height: 10, borderRadius: 8, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: securityScan ? '100%' : `${a.load}%`,
                                    background: securityScan ? '#f59e0b' : (a.load > 80 ? '#ef4444' : a.load > 30 ? '#10b77f' : '#6ee7b7'),
                                    borderRadius: 8,
                                    transition: 'width 1.5s ease, background 0.3s ease'
                                }} />
                            </div>
                            <div style={{ width: 64, textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#10b77f' }}>
                                {securityScan ? '...' : `${a.load}%`} <span style={{ color: '#94a3b8', fontWeight: 400 }}>Load</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active System Audit & Escalations */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f43f5e' }}>
                        <span className="material-symbols-outlined">priority_high</span>
                        <h3 style={{ fontWeight: 700, margin: 0 }}>Active System Audit &amp; Escalations</h3>
                    </div>
                    <span style={{ padding: '2px 10px', background: '#fff1f2', color: '#f43f5e', fontSize: 10, fontWeight: 700, borderRadius: 6, textTransform: 'uppercase', letterSpacing: 1 }}>3 Critical</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '12px 24px' }}>Patient ID</th>
                                <th style={{ padding: '12px 24px' }}>Detected Risk</th>
                                <th style={{ padding: '12px 24px' }}>Agent Responsible</th>
                                <th style={{ padding: '12px 24px' }}>Timestamp</th>
                                <th style={{ padding: '12px 24px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditEvents.map((e) => (
                                <tr key={e.id} style={{ borderTop: '1px solid #f8fafc', opacity: reviewedEvents.includes(e.id) ? 0.45 : 1, transition: 'opacity 0.3s' }}>
                                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#475569' }}>{e.id}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: 4, background: e.dotColor, flexShrink: 0 }} />
                                            <span style={{ fontSize: 14, fontWeight: 500 }}>{e.risk}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#475569' }}>{e.agentIcon}</span>
                                            </div>
                                            <span style={{ fontSize: 14 }}>{e.agent}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, color: '#94a3b8' }}>{e.time}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {reviewedEvents.includes(e.id)
                                            ? <span style={{ color: '#10b77f', fontWeight: 700, fontSize: 12 }}>✓ Reviewed</span>
                                            : <button onClick={() => { setReviewedEvents(prev => [...prev, e.id]); showToast(`Event ${e.id} marked as reviewed.`); }} style={{ color: '#10b77f', fontWeight: 700, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>Review Event</button>
                                        }
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
