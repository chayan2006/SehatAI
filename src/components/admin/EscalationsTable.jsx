import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

export default function EscalationsTable({ 
    showAll = false, 
    activeEscalations, 
    filteredEscalations, 
    criticalCount, 
    handleAskAI, 
    aiInsights, 
    setOverrideModal, 
    handleOverride 
}) {
    const rows = showAll ? filteredEscalations : activeEscalations.slice(0, 5);
    const sevColor = { critical: '#ef4444', warning: '#f59e0b' };
    
    return (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #10b77f0d', overflow: 'hidden', boxShadow: '0 1px 4px #0001' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>priority_high</span>
                    Active Escalations (Requires Intervention)
                </h4>
                {criticalCount > 0 && (
                    <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 2 }}>{criticalCount} Critical</span>
                )}
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, background: '#f8fafc' }}>
                            <th style={{ padding: '10px 24px' }}>Patient ID</th>
                            <th style={{ padding: '10px 24px' }}>Detected Risk</th>
                            <th style={{ padding: '10px 24px' }}>Agent Responsible</th>
                            <th style={{ padding: '10px 24px' }}>Timestamp</th>
                            <th style={{ padding: '10px 24px', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', margin: '0 auto 8px' }}>check_circle</span>
                                All escalations resolved
                            </td></tr>
                        )}
                        {rows.map(e => (
                            <React.Fragment key={e.id}>
                                <tr style={{ borderTop: '1px solid #f1f5f9', opacity: e.resolved ? 0.45 : 1, transition: 'opacity 0.4s' }}>
                                    <td style={{ padding: '14px 24px', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{e.id}</td>
                                    <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 500 }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            {e.severity && <span style={{ width: 8, height: 8, borderRadius: 4, background: sevColor[e.severity] || '#94a3b8', flexShrink: 0 }} />}
                                            {e.risk}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 24px' }}>
                                        <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{e.agent}</span>
                                    </td>
                                    <td style={{ padding: '14px 24px', fontSize: 12, color: '#64748b' }}>{e.time}</td>
                                    <td style={{ padding: '14px 24px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                        {e.resolved
                                            ? <span style={{ color: '#10b77f', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>Resolved</span>
                                            : <>
                                                <button
                                                    onClick={() => handleAskAI(e)}
                                                    disabled={aiInsights?.[e.id]?.loading}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#fef3c7', color: '#d97706', fontSize: 12, fontWeight: 700, borderRadius: 8, border: 'none', cursor: aiInsights?.[e.id]?.loading ? 'wait' : 'pointer', opacity: aiInsights?.[e.id]?.loading ? 0.6 : 1 }}
                                                >
                                                    {aiInsights?.[e.id]?.loading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />} Analyze
                                                </button>
                                                <button
                                                    onClick={() => setOverrideModal(e.id)}
                                                    style={{ padding: '6px 16px', background: '#ef4444', color: 'white', fontSize: 12, fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer' }}
                                                >OVERRIDE</button>
                                            </>
                                        }
                                    </td>
                                </tr>
                                {aiInsights?.[e.id]?.text && (
                                    <tr style={{ background: '#fdfbbd1a' }}>
                                        <td colSpan={5} style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                                                    <Bot size={16} />
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 8px 0', fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 1 }}>AI Resolution Strategy</p>
                                                    <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{aiInsights[e.id].text}</p>
                                                    {!e.resolved && (
                                                        <button
                                                            onClick={() => handleOverride(e.id)}
                                                            style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#10b77f', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>task_alt</span> Execute AI Suggestion
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
