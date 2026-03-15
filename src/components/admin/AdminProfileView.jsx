import React from 'react';

export default function AdminProfileView({
    notifSms, setNotifSms,
    notifEmail, setNotifEmail,
    notifPush, setNotifPush,
    editMode, setEditMode,
    role, setRole,
    email, setEmail,
    phone, setPhone,
    twoFAEnabled, setTwoFAEnabled,
    showHardwareKeys, setShowHardwareKeys,
    hardwareKeys, setHardwareKeys,
    revokedKeys, setRevokedKeys,
    isKeyRegistering, setIsKeyRegistering,
    iotServices, setIotServices,
    showToast
}) {
    const Toggle = ({ on, toggle }) => (
        <button onClick={toggle} style={{ position: 'relative', display: 'inline-flex', height: 20, width: 40, borderRadius: 10, border: 'none', background: on ? '#10b77f' : '#cbd5e1', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 16, height: 16, borderRadius: 8, background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
        </button>
    );

    return (
        <div style={{ padding: 32, maxWidth: 900, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── 1. Profile Identity Card ── */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 96, height: 96, borderRadius: 48, background: 'linear-gradient(135deg,#10b77f,#059669)', border: '4px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 52, color: 'white' }}>person</span>
                        </div>
                        <button style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#475569' }}>photo_camera</span>
                        </button>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{role === 'admin' ? (email?.includes('chen') ? 'Dr. Sarah Chen' : 'System Administrator') : 'Healthcare Professional'}</h2>
                            <span style={{ padding: '2px 10px', background: '#ecfdf5', color: '#10b77f', fontSize: 10, fontWeight: 700, borderRadius: 20, textTransform: 'uppercase', letterSpacing: 2, border: '1px solid rgba(16,183,127,0.2)' }}>Active</span>
                        </div>
                        <p style={{ color: '#64748b', margin: '0 0 14px', fontSize: 14 }}>Chief AI Architect</p>
                        <div style={{ display: 'flex', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
                                HIPAA Tier 3 Access
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                                Last Login: 14m ago
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setEditMode(e => !e)} style={{ padding: '8px 18px', background: '#f1f5f9', color: '#334155', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            {/* ── 2+3. Account Details + Security Hub ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

                {/* Account Details */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, margin: '0 0 20px' }}>Account Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                        {[{ label: 'Institutional Role', val: role, set: setRole, type: 'text' }, { label: 'Professional Email', val: email, set: setEmail, type: 'email' }, { label: 'Direct Line (Twilio Integrated)', val: phone, set: setPhone, type: 'tel' }].map((f, i) => (
                            <div key={i}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>{f.label}</label>
                                <input
                                    type={f.type}
                                    value={f.val}
                                    onChange={e => f.set(e.target.value)}
                                    disabled={!editMode}
                                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#334155', cursor: editMode ? 'text' : 'default' }}
                                />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setEditMode(false); showToast('Profile changes saved!'); }} style={{ marginTop: 20, padding: '11px 0', background: '#10b77f', color: 'white', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,183,127,0.25)', width: '100%' }}>
                        Save Changes
                    </button>
                </div>

                {/* Security Hub */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, margin: 0 }}>Security Hub</h3>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#10b77f' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>encrypted</span>HIPAA COMPLIANT
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                        {/* 2FA */}
                        <div style={{ padding: 16, background: twoFAEnabled ? '#f0fdf8' : '#f8fafc', border: `1px solid ${twoFAEnabled ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span className="material-symbols-outlined" style={{ color: twoFAEnabled ? '#10b77f' : '#94a3b8', fontSize: 22 }}>shield_person</span>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Two-Factor Authentication</p>
                                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{twoFAEnabled ? 'Enabled via SehatAI Auth App' : 'Disabled — your account is less secure'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setTwoFAEnabled(v => !v); showToast(twoFAEnabled ? '2FA disabled. Account security reduced.' : '2FA enabled via SehatAI Auth App.'); }}
                                style={{ padding: '5px 14px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer', background: twoFAEnabled ? '#fee2e2' : '#10b77f', color: twoFAEnabled ? '#ef4444' : 'white', transition: 'all 0.2s' }}
                            >
                                {twoFAEnabled ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                        {/* Hardware Keys */}
                        <div style={{ border: '1px dashed #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: 22 }}>key</span>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Hardware Keys</p>
                                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{hardwareKeys.filter(k => !revokedKeys.includes(k.serial)).length} YubiKeys Authorized</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowHardwareKeys(v => !v)} style={{ fontSize: 12, fontWeight: 700, color: '#10b77f', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    {showHardwareKeys ? 'Close ✕' : 'Manage'}
                                </button>
                            </div>
                            {showHardwareKeys && (
                                <div style={{ background: '#f8fafc', borderTop: '1px dashed #e2e8f0', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {hardwareKeys.filter(k => !revokedKeys.includes(k.serial)).map((k, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderRadius: 8, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#10b77f' }}>usb</span>
                                                <div>
                                                    <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{k.name}</p>
                                                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>Serial: {k.serial} · Added {k.regDate}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: '#10b77f' }}>Active</span>
                                                <button onClick={() => { setRevokedKeys(prev => [...prev, k.serial]); showToast(`${k.name} (${k.serial}) has been revoked.`, 'info'); }} style={{ fontSize: 10, fontWeight: 700, color: '#f43f5e', background: '#fff1f2', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>Revoke</button>
                                            </div>
                                        </div>
                                    ))}
                                    {revokedKeys.length > 0 && (
                                        <div style={{ padding: '8px 12px', background: '#fff1f2', borderRadius: 8, fontSize: 11, color: '#f43f5e', fontWeight: 600 }}>
                                            {revokedKeys.length} key{revokedKeys.length > 1 ? 's' : ''} revoked this session. Changes will apply on next sign-in.
                                        </div>
                                    )}
                                    <button 
                                        disabled={isKeyRegistering}
                                        onClick={async () => {
                                            setIsKeyRegistering(true);
                                            showToast("Initialing FIDO2 handshaking...", "info");
                                            await new Promise(r => setTimeout(r, 1500));
                                            showToast("Waiting for YubiKey physical touch...", "info");
                                            await new Promise(r => setTimeout(r, 2000));
                                            
                                            const newKey = { 
                                                name: 'YubiKey Bio (Primary)', 
                                                serial: `SN-${Math.floor(1000 + Math.random() * 9000)}-C`, 
                                                regDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                                            };
                                            
                                            setHardwareKeys(prev => [...prev, newKey]);
                                            setIsKeyRegistering(false);
                                            showToast(`Hardware key ${newKey.name} registered and synced.`, 'success');
                                        }} 
                                        style={{ fontSize: 11, fontWeight: 700, color: isKeyRegistering ? '#94a3b8' : '#10b77f', background: 'none', border: '1px dashed #e2e8f0', borderRadius: 8, padding: '8px 0', cursor: isKeyRegistering ? 'not-allowed' : 'pointer', textAlign: 'center', width: '100%' }}
                                    >
                                        {isKeyRegistering ? '⚡ Authenticating...' : '+ Register New Key'}
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Stats rows */}
                        <div style={{ padding: '0 4px' }}>
                            {[['Last Password Change', '24 days ago'], ['Active Sessions', '3 instances']].map(([k, v], i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 0', borderBottom: i === 0 ? '1px solid #f1f5f9' : 'none' }}>
                                    <span style={{ color: '#94a3b8' }}>{k}</span>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => showToast('Session token rotated — sign-in link sent to your email.', 'info')} style={{ marginTop: 20, padding: '11px 0', background: 'white', color: '#334155', borderRadius: 10, border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 13, cursor: 'pointer', width: '100%' }}>
                        Reset Security Token
                    </button>
                </div>
            </div>

            {/* ── 4. Notification Preferences ── */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, margin: '0 0 20px' }}>Notification Preferences</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {[
                        { label: 'Critical Alert SMS', desc: 'Instant telemetry spikes or agent failures.', on: notifSms, toggle: () => setNotifSms(v => !v) },
                        { label: 'Email Reports', desc: 'Daily and weekly compliance summaries.', on: notifEmail, toggle: () => setNotifEmail(v => !v) },
                        { label: 'Push Notifications', desc: 'Mobile app agent handoff requests.', on: notifPush, toggle: () => setNotifPush(v => !v) },
                    ].map((n, i) => (
                        <div key={i} style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>{n.label}</p>
                                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{n.desc}</p>
                            </div>
                            <Toggle on={n.on} toggle={n.toggle} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 5. Connected Cloud & Medical IoT ── */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, margin: '0 0 20px' }}>Connected Cloud &amp; Medical IoT</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {iotServices.map((s) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: `1px solid ${s.connected ? '#f1f5f9' : '#fee2e2'}`, borderRadius: 10, background: s.connected ? 'white' : '#fff9f9', opacity: s.connected ? 1 : 0.8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span className="material-symbols-outlined" style={{ color: s.iconColor, fontSize: 22 }}>{s.icon}</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{s.name}</p>
                                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{s.detail}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {s.connected ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#10b77f' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>STABLE
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#ef4444' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>cancel</span>DISCONNECTED
                                    </span>
                                )}
                                {s.connected ? (
                                    <button
                                        onClick={() => { setIotServices(prev => prev.map(x => x.id === s.id ? { ...x, connected: false } : x)); showToast(`${s.name} disconnected.`, 'info'); }}
                                        style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                                    >Disconnect</button>
                                ) : (
                                    <button
                                        onClick={() => { setIotServices(prev => prev.map(x => x.id === s.id ? { ...x, connected: true } : x)); showToast(`${s.name} reconnected!`); }}
                                        style={{ fontSize: 10, fontWeight: 700, color: '#10b77f', background: '#ecfdf5', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                                    >Reconnect</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => { 
                        const id = `svc-${Date.now()}`; 
                        setIotServices(prev => [...prev, { id, icon: 'device_hub', iconBg: '#f5f3ff', iconColor: '#7c3aed', name: 'New Healthcare Endpoint', detail: 'Pending configuration…', connected: false }]); 
                        showToast('New endpoint added. Configure it to connect.', 'info'); 
                    }}
                    style={{ marginTop: 16, width: '100%', padding: '12px 0', border: '2px dashed #e2e8f0', borderRadius: 10, background: 'none', color: '#94a3b8', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#10b77f'; e.currentTarget.style.borderColor = '#10b77f'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>Link New Healthcare Endpoint
                </button>
            </div>

            {/* ── Footer ── */}
            <div style={{ paddingTop: 24, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>&copy; 2024 SehatAI Systems. All medical data is end-to-end encrypted.</p>
                <button onClick={() => showToast('Account deactivation requires admin approval.', 'info')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>no_accounts</span>Deactivate Institutional Account
                </button>
            </div>

        </div >
    );
}
