import React, { useState } from 'react';

// Generate some mock historical logs
const generateMockLogs = () => {
    const logs = [];
    const actions = ['SYSTEM_BOOT', 'AGENT_SPAWN', 'USER_LOGIN', 'DATA_EXPORT', 'CONFIG_CHANGE', 'OVERRIDE_AUTH', 'AI_CRITICAL_ANALYSIS'];
    const users = ['System', 'Dr. S. Chen', 'Root', 'LangChain Edge', 'Agent-Sigma'];

    for (let i = 0; i < 45; i++) {
        logs.push({
            id: `LOG-${Math.floor(1000 + Math.random() * 9000)}-${Date.now() - (i * 100000)}`,
            action: actions[Math.floor(Math.random() * actions.length)],
            time: new Date(Date.now() - (i * 3600000)).toLocaleString(),
            user: users[Math.floor(Math.random() * users.length)],
        });
    }
    return logs;
};

const INITIAL_LOGS = generateMockLogs();

export default function AuditView({ liveLogs = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    const allLogs = [...liveLogs, ...INITIAL_LOGS];

    const filteredLogs = allLogs.filter(log => {
        const matchesSearch = log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterAction === 'ALL' || log.action === filterAction;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1200, margin: '0 auto', width: '100%', height: 'calc(100vh - 64px)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
                        Compliance Audit Logs
                    </h1>
                    <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>
                        Chronological, immutable record of all system events, agent decisions, and access logs.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }}>search</span>
                        <input
                            type="text"
                            placeholder="Search user or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 200, outline: 'none' }}
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: 'white' }}
                    >
                        <option value="ALL">All Event Types</option>
                        <option value="USER_LOGIN">User Logins</option>
                        <option value="AI_CRITICAL_ANALYSIS">AI Analysis</option>
                        <option value="OVERRIDE_AUTH">Overrides</option>
                        <option value="DATA_EXPORT">Data Exports</option>
                    </select>
                </div>
            </div>

            {/* Log Feed */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: 13, color: '#334155', textTransform: 'uppercase', letterSpacing: 1 }}>
                        <span className="material-symbols-outlined" style={{ color: '#10b77f', fontSize: 18 }}>history</span>
                        Chronological Feed
                    </h4>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{filteredLogs.length} Events Found</span>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredLogs.map((entry, i) => {
                        const isAI = entry.action === 'AI_CRITICAL_ANALYSIS';
                        const isOverride = entry.action === 'OVERRIDE_AUTH';

                        return (
                            <div key={entry.id || i} style={{
                                display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#334155',
                                padding: '12px 16px', borderRadius: 8,
                                background: isOverride ? '#fff1f2' : isAI ? '#f0fdf8' : '#f8fafc',
                                borderLeft: `3px solid ${isOverride ? '#ef4444' : isAI ? '#10b77f' : '#cbd5e1'}`
                            }}>
                                <span className="material-symbols-outlined" style={{
                                    color: isOverride ? '#ef4444' : isAI ? '#10b77f' : '#94a3b8', fontSize: 18
                                }}>
                                    {isOverride ? 'warning' : isAI ? 'smart_toy' : 'check_circle'}
                                </span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, width: 150 }}>{entry.id}</span>
                                <span style={{ flex: 1 }}>
                                    <strong style={{
                                        color: isOverride ? '#ef4444' : isAI ? '#10b77f' : '#475569',
                                        marginRight: 6
                                    }}>{entry.action}</strong>
                                    executed by <span style={{ fontWeight: 600 }}>{entry.user}</span>
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                                    {entry.time}
                                </span>
                            </div>
                        );
                    })}
                    {filteredLogs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 8, display: 'block' }}>search_off</span>
                            No events match your current filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
