import React from 'react';

export default function AgentPerformancePanel({ agents, title = 'Agent Performance Monitor' }) {
    return (
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #10b77f0d', boxShadow: '0 1px 4px #0001' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: '#10b77f' }}>analytics</span>
                    {title}
                </h4>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{agents.length} Agents Operational</span>
            </div>
            <div style={{ display: 'grid', gap: 18 }}>
                {agents.map((a, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 4fr 80px', gap: 16, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{a.name}</span>
                        <div style={{ background: '#f1f5f9', borderRadius: 8, height: 10, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${a.load}%`, background: a.load > 80 ? '#ef4444' : '#10b77f', borderRadius: 8, transition: 'width 1.5s ease' }} />
                        </div>
                        <span style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: a.load > 80 ? '#ef4444' : '#10b77f' }}>{a.load}% Load</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
