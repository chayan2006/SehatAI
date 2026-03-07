import React, { useState } from 'react';

const INITIAL_STAFF = [
    { id: 'S-1049', name: 'Dr. Sarah Chen', role: 'Chief AI Architect', dept: 'Administration', status: 'active', contact: '+1 555-0192' },
    { id: 'S-8821', name: 'Dr. James Wilson', role: 'Attending Physician', dept: 'Emergency', status: 'busy', contact: '+1 555-0219' },
    { id: 'S-7734', name: 'Nurse Emily Rodriguez', role: 'Head Nurse', dept: 'ICU', status: 'active', contact: '+1 555-0814' },
    { id: 'A-0012', name: 'Agent-Rho', role: 'Autonomous AI', dept: 'Pharmacy', status: 'active', contact: 'Internal Network' },
    { id: 'S-4492', name: 'Dr. Michael Chang', role: 'Surgeon', dept: 'OR', status: 'offline', contact: '+1 555-0991' },
];

export default function StaffView({ onBroadcast }) {
    const [staff, setStaff] = useState(INITIAL_STAFF);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastDept, setBroadcastDept] = useState('all');

    const handleBroadcast = (e) => {
        e.preventDefault();
        if (!broadcastMsg.trim()) return;
        if (typeof onBroadcast === 'function') {
            onBroadcast(broadcastMsg, broadcastDept);
        } else {
            alert(`BROADCAST SENT to ${broadcastDept.toUpperCase()}:\n"${broadcastMsg}"`);
        }
        setBroadcastMsg('');
    };

    return (
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
                    Staff &amp; Communications Hub
                </h1>
                <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Manage hospital personnel, track AI agent deployments, and issue emergency broadcasts.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'flex-start' }}>

                {/* Staff Directory */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>badge</span>
                            Active Network Directory
                        </h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#f0fdf8', color: '#10b77f', padding: '4px 10px', borderRadius: 20 }}>4 Active</span>
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: 20 }}>1 Offline</span>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, background: '#f8fafc' }}>
                                    <th style={{ padding: '12px 24px' }}>Name / ID</th>
                                    <th style={{ padding: '12px 24px' }}>Role</th>
                                    <th style={{ padding: '12px 24px' }}>Status</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'right' }}>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map(person => (
                                    <tr key={person.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{person.name}</div>
                                            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{person.id} • {person.dept}</div>
                                        </td>
                                        <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 500, color: '#334155' }}>
                                            {person.role}
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                                background: person.status === 'active' ? '#ecfdf5' : person.status === 'busy' ? '#fffbeb' : '#f1f5f9',
                                                color: person.status === 'active' ? '#10b77f' : person.status === 'busy' ? '#d97706' : '#94a3b8'
                                            }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: person.status === 'active' ? '#10b77f' : person.status === 'busy' ? '#d97706' : '#94a3b8' }} />
                                                {person.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                                            <button style={{ padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#3b82f6' }}>
                                                {person.contact}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Emergency Broadcast */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px 0' }}>
                        <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>campaign</span>
                        Emergency Broadcast
                    </h3>
                    <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Target Department</label>
                            <select
                                value={broadcastDept}
                                onChange={(e) => setBroadcastDept(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, backgroundColor: '#f8fafc', outline: 'none' }}
                            >
                                <option value="all">All Departments Network-wide</option>
                                <option value="icu">ICU &amp; Critical Care</option>
                                <option value="er">Emergency Room</option>
                                <option value="surgery">Surgery &amp; OR</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Message to Broadcast</label>
                            <textarea
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                placeholder="E.g. Code Blue in Ward 4. Immediate trauma team required."
                                rows={4}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, resize: 'none', outline: 'none' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!broadcastMsg.trim()}
                            style={{
                                marginTop: 8, padding: '12px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: broadcastMsg.trim() ? 'pointer' : 'not-allowed',
                                background: broadcastMsg.trim() ? '#ef4444' : '#fef2f2',
                                color: broadcastMsg.trim() ? 'white' : '#fca5a5',
                                transition: 'all 0.2s',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rss_feed</span>
                            Send Broadcast Alert
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
