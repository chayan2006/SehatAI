import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { initAdminAgent } from '@/lib/adminAgent';
import { Bot, Send, X, Minimize2, Maximize2, Loader2, MessageCircle, Mic, MicOff } from 'lucide-react';

// ─── Initial Data ──────────────────────────────────────────────────────────────
const INITIAL_ESCALATIONS = [
    { id: '#PX-8812', risk: 'Anomalous Heart Rate Spike', agent: 'Vitals-Agent-04', time: '14:22:05 GMT', severity: 'critical', resolved: false },
    { id: '#PX-9004', risk: 'Contraindicated Rx Match', agent: 'Interaction-Lab', time: '14:21:50 GMT', severity: 'critical', resolved: false },
    { id: '#PX-7721', risk: 'Sudden O2 Desaturation', agent: 'Risk-Scanner', time: '14:19:12 GMT', severity: 'critical', resolved: false },
    { id: '#PX-6630', risk: 'Elevated Sepsis Biomarkers', agent: 'Vitals-Agent-02', time: '14:15:44 GMT', severity: 'warning', resolved: false },
    { id: '#PX-5512', risk: 'Blood Pressure Hypertensive', agent: 'Risk-Scanner', time: '14:10:02 GMT', severity: 'warning', resolved: false },
];

const INITIAL_AGENTS = [
    { name: 'Risk Assessment', load: 72, color: '#10b77f' },
    { name: 'Scheduler', load: 15, color: '#10b77f' },
    { name: 'Drug Interaction', load: 88, color: '#10b77f' },
    { name: 'Clinical Coding', load: 45, color: '#10b77f' },
    { name: 'Vitals Monitor', load: 61, color: '#10b77f' },
    { name: 'Lab Analyzer', load: 34, color: '#10b77f' },
    { name: 'Triage AI', load: 79, color: '#10b77f' },
    { name: 'Comms Relay', load: 22, color: '#10b77f' },
];

const NOTIFICATIONS = [
    { id: 1, icon: 'priority_high', color: '#ef4444', text: 'Patient #PX-8812 requires immediate intervention.', time: '2m ago', read: false },
    { id: 2, icon: 'medication', color: '#f59e0b', text: 'Drug interaction flagged for Patient #PX-9004.', time: '4m ago', read: false },
    { id: 3, icon: 'monitor_heart', color: '#10b77f', text: 'Agent throughput increased by 18% this hour.', time: '10m ago', read: true },
    { id: 4, icon: 'cloud_sync', color: '#6366f1', text: 'Cloud node US-EAST rebalanced. Latency optimal.', time: '22m ago', read: true },
    { id: 5, icon: 'verified_user', color: '#10b77f', text: 'System security posture: 100% Secure.', time: '1h ago', read: true },
];

// ─── Nav Items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'patients', label: 'Patient Monitoring', icon: 'group' },
    { id: 'agents', label: 'Agent Status', icon: 'memory' },
    { id: 'escalations', label: 'Escalations', icon: 'report_problem' },
    { id: 'security', label: 'Security', icon: 'verified_user' },
];

// ─── Utility ───────────────────────────────────────────────────────────────────
function randomDelta(val, min = -3, max = 3, lo = 0, hi = 100) {
    return Math.min(hi, Math.max(lo, val + Math.floor(Math.random() * (max - min + 1)) + min));
}
function formatNum(n) { return n.toLocaleString(); }
function now() { return new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' GMT'; }
function exportPDF(data, title = 'Aegis System Report') {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    let head = [['ID', 'Risk / Detail', 'Agent / System', 'Time', 'Status']];
    let body = [];

    if (data && data.head && data.body) {
        head = [data.head];
        body = data.body;
    } else if (data && data.length > 0) {
        if (data[0].risk) {
            head = [['Patient ID', 'Detected Risk', 'Agent Responsible', 'Timestamp', 'Status']];
            body = data.map(e => [e.id, e.risk, e.agent, e.time, e.resolved ? 'Resolved' : 'Active']);
        } else {
            body = data.map(e => Object.values(e).map(v => String(v)));
        }
    }

    autoTable(doc, {
        startY: 34,
        head: head,
        body: body,
        headStyles: { fillColor: [16, 183, 127] },
    });
    doc.save('aegis_report.pdf');
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
    const [activeNav, setActiveNav] = useState('dashboard');
    const [escalations, setEscalations] = useState(INITIAL_ESCALATIONS);
    const [agents, setAgents] = useState(INITIAL_AGENTS);
    const [patientCount, setPatientCount] = useState(1284);
    const [throughput, setThroughput] = useState(2400);
    const [throughputPct, setThroughputPct] = useState(84);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifications, setNotifications] = useState(NOTIFICATIONS);
    const [showSettings, setShowSettings] = useState(false);
    const [overrideModal, setOverrideModal] = useState(null); // escalation id
    const [toast, setToast] = useState(null);
    const [auditLog, setAuditLog] = useState([]);
    const [securityScan, setSecurityScan] = useState(false);
    const [resolvedAgentEscalations, setResolvedAgentEscalations] = useState([]);
    const [resolvedPatientEscalations, setResolvedPatientEscalations] = useState([]);
    const [escalationIntervened, setEscalationIntervened] = useState([]);
    const [escalationReviewed, setEscalationReviewed] = useState([]);
    const [escalationPage, setEscalationPage] = useState(1);
    const [reviewedSecurityEvents, setReviewedSecurityEvents] = useState([]);
    const [showAdminProfile, setShowAdminProfile] = useState(false);
    // ── Profile page states (lifted to survive 3s re-renders) ─────────────────────
    const [profileNotifSms, setProfileNotifSms] = useState(true);
    const [profileNotifEmail, setProfileNotifEmail] = useState(false);
    const [profileNotifPush, setProfileNotifPush] = useState(true);
    const [profileEditMode, setProfileEditMode] = useState(false);
    const [profileRole, setProfileRole] = useState('Chief AI Architect');
    const [profileEmail, setProfileEmail] = useState('s.chen@st-jude.health.ai');
    const [profilePhone, setProfilePhone] = useState('+1 (555) 942-0192');
    const [showHardwareKeys, setShowHardwareKeys] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState(true);
    const [revokedKeys, setRevokedKeys] = useState([]);
    const [hardwareKeys, setHardwareKeys] = useState([
        { name: 'YubiKey 5C NFC', serial: 'SN-7742-A', regDate: 'Jan 12, 2026' },
        { name: 'YubiKey 5 Nano', serial: 'SN-4419-B', regDate: 'Feb 28, 2026' },
    ]);
    const [iotServices, setIotServices] = useState([
        { id: 'aws-s3', icon: 'cloud', iconBg: '#eff6ff', iconColor: '#3b82f6', name: 'AWS Medical Imaging S3', detail: 'Connected to Bucket: us-east-1-health-sarah', connected: true },
        { id: 'bedside-iot', icon: 'vital_signs', iconBg: '#fff7ed', iconColor: '#f97316', name: 'Bedside Monitor IoT Hub', detail: '12 devices connected in NICU Ward', connected: true },
    ]);
    const [latencyData, setLatencyData] = useState(
        Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 10)
    );
    const [cloudDist, setCloudDist] = useState({ usEast: 45, euWest: 30, asSouth: 25 });

    // ── Agent States ─────────────────────────────────────────────────────────────
    const [isAgentOpen, setIsAgentOpen] = useState(false);
    const [agentMessages, setAgentMessages] = useState([
        { role: 'assistant', text: 'Hello Sarah. I am the Aegis Admin Assistant. How can I help you manage the system today?' }
    ]);
    const [agentInput, setAgentInput] = useState('');
    const [isAgentTyping, setIsAgentTyping] = useState(false);
    const [agentExecutor, setAgentExecutor] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false);
    const recognitionRef = useRef(null);
    const handleMessageRef = useRef(null); // always points to latest handleAgentMessage
    const voiceModeRef = useRef(false); // ref version to avoid stale closures inside callbacks
    const transcriptRef = useRef('');   // captures transcript for auto-submit inside onend

    const notifRef = useRef(null);
    const settingsRef = useRef(null);

    // ── Toast helper ─────────────────────────────────────────────────────────────
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Override handler ─────────────────────────────────────────────────────────
    const handleOverride = (id) => {
        setEscalations(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
        setAuditLog(prev => [{ id, action: 'OVERRIDE', time: now(), user: 'Dr. Sarah Chen' }, ...prev]);
        setOverrideModal(null);
        showToast(`Escalation ${id} overridden and resolved.`);
        setNotifications(prev => [{
            id: Date.now(), icon: 'check_circle', color: '#10b77f',
            text: `Escalation ${id} manually overridden by Dr. Sarah Chen.`, time: 'just now', read: false
        }, ...prev]);
    };

    // ── Ref-based handlers for stable agent re-initialization ───────────────────
    const stateRef = useRef({
        patientCount,
        throughput,
        throughputPct,
        agents,
        escalations,
        setProfileRole,
        setProfileEmail,
        setProfilePhone,
        handleOverride,
        exportPDF,
        showToast,
        setSearchQuery
    });

    useEffect(() => {
        stateRef.current = {
            patientCount,
            throughput,
            throughputPct,
            agents,
            escalations,
            setProfileRole,
            setProfileEmail,
            setProfilePhone,
            handleOverride,
            exportPDF,
            showToast,
            setSearchQuery
        };
    }, [patientCount, throughput, throughputPct, agents, escalations]);

    // ── Live metrics tick ────────────────────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            setPatientCount(p => randomDelta(p, -5, 12, 1200, 1400));
            setThroughput(p => randomDelta(p, -50, 80, 2000, 3000));
            setThroughputPct(p => randomDelta(p, -2, 2, 70, 99));
            setAgents(prev => prev.map(a => ({ ...a, load: randomDelta(a.load, -4, 4, 5, 99) })));
            setLatencyData(prev => {
                const next = [...prev.slice(1), Math.floor(Math.random() * 80) + 10];
                return next;
            });
            setCloudDist(prev => {
                const usEast = randomDelta(prev.usEast, -1, 1, 40, 55);
                const euWest = randomDelta(prev.euWest, -1, 1, 25, 35);
                const asSouth = 100 - usEast - euWest;
                return { usEast, euWest, asSouth };
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // ── 2-Way Voice Chat ─────────────────────────────────────────────────
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const r = new SR();
        r.continuous = false;
        r.interimResults = true;
        r.lang = 'en-US';
        r.onresult = (e) => {
            let t = '';
            for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
            setAgentInput(t);
            transcriptRef.current = t;
        };
        r.onerror = (e) => {
            setIsListening(false);
            if (e.error !== 'no-speech') showToast('Mic error: ' + e.error, 'error');
        };
        r.onend = () => {
            setIsListening(false);
            const captured = transcriptRef.current.trim();
            if (captured && voiceModeRef.current) {
                transcriptRef.current = '';
                setAgentInput('');
                // Use ref to avoid stale closure — always calls current handleAgentMessage
                handleMessageRef.current?.(captured);
            }
        };
        recognitionRef.current = r;
    }, []); // eslint-disable-line

    // Keep voiceModeRef in sync with voiceMode state
    useEffect(() => {
        voiceModeRef.current = voiceMode;
        if (!voiceMode) {
            recognitionRef.current?.stop();
            window.speechSynthesis?.cancel();
            setIsListening(false);
            setAgentInput('');
        }
    }, [voiceMode]);

    const startListeningOnce = () => {
        if (!recognitionRef.current) return;
        transcriptRef.current = '';
        setAgentInput('');
        try { recognitionRef.current.start(); setIsListening(true); } catch (_) {}
    };

    const toggleVoiceMode = () => {
        if (voiceMode) {
            setVoiceMode(false);
            showToast('Voice chat ended.', 'info');
        } else {
            if (!recognitionRef.current) { showToast('Voice not supported in this browser.', 'error'); return; }
            setVoiceMode(true);
            showToast('Voice chat started! Say something…', 'success');
            setTimeout(() => startListeningOnce(), 300);
        }
    };

    const toggleListening = () => {
        if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
        else startListeningOnce();
    };

    // ── Agent Initialization ─────────────────────────────────────────────────────
    useEffect(() => {
        const setupAgent = async () => {
            const apiKey = import.meta.env.VITE_GROQ_API_KEY || (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY : undefined);
            console.log("Loaded GROQ API Key length:", apiKey?.length);
            if (!apiKey) {
                console.error("GROQ API KEY IS MISSING!");
                setAgentMessages([{ role: 'assistant', text: "Error: GROQ API Key is missing from your .env file." }]);
                return;
            }

            try {
                const executor = await initAdminAgent({
                    apiKey,
                    handlers: {
                        getStats: () => ({
                            patientCount: stateRef.current.patientCount,
                            throughput: stateRef.current.throughput,
                            throughputPct: stateRef.current.throughputPct,
                            securityStatus: '100% Secure',
                            activeAgents: stateRef.current.agents.length
                        }),
                        getEscalations: () => stateRef.current.escalations,
                        resolveEscalation: (id) => {
                            const s = stateRef.current;
                            const exists = s.escalations.find(e => e.id === id && !e.resolved);
                            if (exists) {
                                s.handleOverride(id);
                                return true;
                            }
                            return false;
                        },
                        updateProfile: (params) => {
                            const s = stateRef.current;
                            if (params.role) s.setProfileRole(params.role);
                            if (params.email) s.setProfileEmail(params.email);
                            if (params.phone) s.setProfilePhone(params.phone);
                        },
                        exportReport: (view) => {
                            const s = stateRef.current;
                            if (view === 'dashboard') {
                                const data = {
                                    head: ['Patient ID', 'Detected Risk', 'Agent Responsible', 'Timestamp', 'Status'],
                                    body: s.escalations.map(e => [e.id, e.risk, e.agent, e.time, e.resolved ? 'Resolved' : 'Active'])
                                };
                                s.exportPDF(data, 'Dashboard Overview Report');
                            } else {
                                s.exportPDF(s.escalations, `${view} Report`);
                            }
                            s.showToast(`Exporting ${view} report...`);
                        },
                        setSearchQuery: (query) => stateRef.current.setSearchQuery(query),
                        // Resource & Facility Management
                        checkBedAvailability: (ward) => {
                            const beds = { "ICU": 12, "ER": 5, "General": 45, "Maternity": 8 };
                            return `There are currently ${beds[ward] || 0} beds available in the ${ward} ward.`;
                        },
                        checkInventory: (item) => {
                            const inv = { "Oxygen": "85% capacity", "O-Negative Blood": "12 units (Low)", "Saline": "400 units (Good)" };
                            return `Current inventory for ${item}: ${inv[item] || "Unknown status"}.`;
                        },
                        orderSupplies: (item, quantity) => {
                            stateRef.current.showToast(`Ordered ${quantity}x ${item}`);
                            return `Order placed for ${quantity}x ${item}.`;
                        },
                        // Staff & Agent Coordination
                        getStaffRoster: (department) => {
                            const roster = { "Cardiology": "Dr. Sarah Chen (Senior), Dr. Mike Lin", "ER": "Dr. Emily Wong, Nurse John Doe" };
                            return `Staff in ${department}: ${roster[department] || "Not found"}.`;
                        },
                        assignAgent: (agentName, assignment) => {
                            stateRef.current.showToast(`Assigned ${agentName} to ${assignment}`);
                            return `Successfully assigned ${agentName} to ${assignment}.`;
                        },
                        sendUrgentAlert: (message, recipient) => {
                            stateRef.current.showToast(`Alert sent to ${recipient}: ${message}`, 'error');
                            return `Alert dispatched to ${recipient}.`;
                        },
                        // Advanced Patient Actions
                        getPatientSummary: (patientId) => {
                            return `Patient ${patientId}: Admitted for observation. Vitals stable. No outstanding risks flagged.`;
                        },
                        scheduleAppointment: (patientId, doctor, date) => {
                            stateRef.current.showToast(`Scheduled ${patientId} with ${doctor} on ${date}`);
                            return `Appointment confirmed for ${patientId} with ${doctor} on ${date}.`;
                        },
                        updatePatientStatus: (patientId, status) => {
                            stateRef.current.showToast(`Updated ${patientId} status to ${status}`);
                            return `Patient ${patientId} status updated to ${status}.`;
                        },
                        // Analytics
                        analyzeBottlenecks: () => {
                            return `Analysis: The primary bottleneck is in the ER triage queue, causing a drop in throughput. Recommended action: Re-assign 2 available agents from General to ER.`;
                        },
                        generateShiftSummary: () => {
                            return `Shift Summary: 12 escalations resolved (2 critical). System throughput averaged 2,240 patients/hr. No security incidents.`;
                        },
                        // System Controls
                        toggleMaintenance: (system, duration) => {
                            stateRef.current.showToast(`Maintenance mode enabled for ${system} (${duration} mins)`, 'warning');
                            return `Maintenance mode activated for ${system} for ${duration} minutes.`;
                        },
                        managePermissions: (user, role) => {
                            stateRef.current.showToast(`Permissions updated: ${user} -> ${role}`);
                            return `Granular permissions updated for ${user}. New role: ${role}.`;
                        }
                    }
                });
                setAgentExecutor(executor);
            } catch (err) {
                console.error("Groq Init Error:", err);
                setAgentMessages([{ role: 'assistant', text: `Failed to connect to Groq: ${err.message}` }]);
            }
        };
        setupAgent();
    }, []); // Run only once

    // Always keep handleMessageRef pointing to the current handleAgentMessage
    // This ensures the STT callback always calls the up-to-date version even after
    // agentExecutor has been set asynchronously
    useEffect(() => {
        handleMessageRef.current = (text) => {
            if (!agentExecutor) {
                console.warn('Voice: agentExecutor not ready yet, ignoring:', text);
                return;
            }
            handleAgentMessage(text);
        };
    }); // No deps array - runs after EVERY render to stay in sync

    const handleAgentMessage = async (text) => {
        if (!agentExecutor) return;
        // Sync the ref so the STT callback always has the latest version
        handleMessageRef.current = handleAgentMessage;
        setIsAgentTyping(true);
        setAgentMessages(prev => [...prev, { role: 'human', text }]);

        try {
            const response = await agentExecutor.invoke({
                input: text,
                chat_history: agentMessages.map(m =>
                    m.role === 'human' ? ["human", m.text] : ["assistant", m.text]
                ).slice(-10) // Keep last 10 messages for context
            });

            setAgentMessages(prev => [...prev, { role: 'assistant', text: response.output }]);

            // ── Text-to-Speech (TTS) ──
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // Stop current speech if any
                // Clean up markdown characters so it sounds natural
                const cleanText = response.output.replace(/[*_#`]/g, '');
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = 'en-US';
                utterance.rate = 1.0;

                // Try to grab a more natural voice if available
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v =>
                    v.name.includes('Google US English') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Zira') ||
                    (v.lang === 'en-US' && v.name.includes('Female'))
                );
                if (preferredVoice) utterance.voice = preferredVoice;

                // Restart mic after AI finishes speaking (2-way loop)
                utterance.onend = () => { if (voiceModeRef.current) setTimeout(() => startListeningOnce(), 400); };
                window.speechSynthesis.speak(utterance);
            }

        } catch (error) {
            console.error("Agent Error:", error);
            setAgentMessages(prev => [...prev, { role: 'assistant', text: `Error: ${error.message || JSON.stringify(error)}` }]);
        } finally {
            setIsAgentTyping(false);
        }
    };

    // ── Close dropdowns on outside click ────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
            if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);


    // ── Mark all notifications read ──────────────────────────────────────────────
    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const unreadCount = notifications.filter(n => !n.read).length;

    // ── Search filter ────────────────────────────────────────────────────────────
    const filteredEscalations = escalations.filter(e =>
        !searchQuery ||
        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.risk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.agent.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const activeEscalations = filteredEscalations.filter(e => !e.resolved);
    const criticalCount = escalations.filter(e => !e.resolved && e.severity === 'critical').length;

    // ─── Render Page Content ──────────────────────────────────────────────────────
    const renderContent = () => {
        switch (activeNav) {
            case 'dashboard': return <DashboardView />;
            case 'patients': return <PatientMonitoringView />;
            case 'agents': return <AgentStatusView />;
            case 'escalations': return <EscalationsView />;
            case 'security': return <SecurityView />;
            case 'profile': return <ProfileView />;
            default: return <DashboardView />;
        }
    };

    // ─── DASHBOARD ────────────────────────────────────────────────────────────────
    function DashboardView() {
        return (
            <div className="p-8 space-y-8">
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

                {/* Agent Performance */}
                <AgentPerformancePanel agents={agents} />

                {/* Escalations Table */}
                <EscalationsTable />

                {/* Footer Panels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, paddingBottom: 40 }}>
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
            </div>
        );
    }

    // ─── PATIENT MONITORING ───────────────────────────────────────────────────────
    function PatientMonitoringView() {
        const patients = [
            { id: '#PX-8812', name: 'Marcus Webb', age: 54, ward: 'ICU-A', vitals: 'HR: 142bpm • O2: 94% • BP: 165/98', status: 'critical' },
            { id: '#PX-9004', name: 'Priya Nair', age: 38, ward: 'ICU-B', vitals: 'HR: 88bpm • O2: 97% • BP: 130/82', status: 'warning' },
            { id: '#PX-7721', name: 'James Okafor', age: 67, ward: 'ICU-C', vitals: 'HR: 95bpm • O2: 88% • BP: 120/76', status: 'critical' },
            { id: '#PX-6630', name: 'Elena Rossi', age: 45, ward: 'Ward-2', vitals: 'HR: 102bpm • O2: 96% • BP: 155/92', status: 'warning' },
            { id: '#PX-5512', name: 'David Park', age: 60, ward: 'Ward-3', vitals: 'HR: 79bpm • O2: 98% • BP: 180/110', status: 'warning' },
            { id: '#PX-4401', name: 'Sophie Laurent', age: 29, ward: 'Ward-1', vitals: 'HR: 72bpm • O2: 99% • BP: 118/76', status: 'stable' },
            { id: '#PX-3310', name: 'Rahul Mehta', age: 51, ward: 'Ward-4', vitals: 'HR: 80bpm • O2: 98% • BP: 125/80', status: 'stable' },
        ];
        const statusColor = { critical: '#ef4444', warning: '#f59e0b', stable: '#10b77f' };
        const statusBg = { critical: '#fef2f2', warning: '#fffbeb', stable: '#f0fdf8' };

        const pmEscalations = [
            { id: '#PA-9022', risk: 'Cardiac Arrhythmia Detection', agent: 'VitalPulse-AI v2', time: '2 min ago' },
            { id: '#PA-4511', risk: 'Hypoglycemic Trend Prediction', agent: 'EndoGuard-4', time: '8 min ago' },
            { id: '#PA-1108', risk: 'Acute Respiratory Stress', agent: 'BreathSafe-OS', time: '14 min ago' },
        ];

        const streamPatients = [
            { name: 'John Doe', room: 'RM 402 • Post-Op', hr: 72, spo2: 98, hrPct: 66, status: 'stable' },
            { name: 'Sarah Jenkins', room: 'RM 108 • ICU', hr: 112, spo2: 94, hrPct: 90, status: 'critical' },
            { name: 'Robert Miller', room: 'RM 215 • General', hr: 68, spo2: 99, hrPct: 50, status: 'stable' },
            { name: 'Elena Rodriguez', room: 'RM 312 • Observation', hr: 75, spo2: 97, hrPct: 60, status: 'stable' },
        ];

        const pmAgents = [
            { name: 'Risk Assessment', load: agents[0]?.load ?? 72 },
            { name: 'Scheduler', load: agents[1]?.load ?? 15 },
            { name: 'Drug Interaction', load: agents[2]?.load ?? 88 },
            { name: 'Clinical Coding', load: agents[3]?.load ?? 45 },
        ];

        const intercepted = resolvedPatientEscalations;
        const handleIntercept = (id) => {
            setResolvedPatientEscalations(prev => [...prev, id]);
            showToast(`Escalation ${id} intercepted successfully.`);
        };

        return (
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* ── Page Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>System Pulse Overview</h2>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#ecfdf5', color: '#059669', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', borderRadius: 20, letterSpacing: 2 }}>
                                <span className="vital-pulse" />
                                Live Heartbeat: Active
                            </span>
                        </div>
                        <p style={{ color: '#64748b', margin: 0 }}>HIPAA Compliant Real-time Telemetry Dashboard</p>
                    </div>
                    <button
                        onClick={() => {
                            const patientData = {
                                head: ['Patient ID', 'Name', 'Age', 'Ward', 'Vitals', 'Status'],
                                body: patients.map(p => [p.id, p.name, p.age, p.ward, p.vitals, p.status.toUpperCase()])
                            };
                            exportPDF(patientData, 'Patient Monitoring Report');
                            showToast('Patient report exported!');
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#10b77f', color: 'white', borderRadius: 12, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px #10b77f40' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                        Export Report
                    </button>
                </div>

                {/* ── Metric Cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Active Patient Monitoring</p>
                            <h3 style={{ fontSize: 32, fontWeight: 700, margin: '4px 0' }}>{formatNum(patientCount)}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b77f', marginTop: 8 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>+12% vs last hour</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
                            {['50%', '66%', '75%', '50%', '100%', '66%'].map((h, i) => (
                                <div key={i} style={{ width: 6, height: h, background: `rgba(16,185,129,${0.2 + i * 0.15})`, borderRadius: 3 }} />
                            ))}
                        </div>
                    </div>
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Agent Throughput</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                <h3 style={{ fontSize: 32, fontWeight: 700, margin: '4px 0' }}>{(throughput / 1000).toFixed(1)}k</h3>
                                <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>req/sec</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b77f', marginTop: 8 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bolt</span>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>Optimized Performance</span>
                            </div>
                        </div>
                        <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#10b77f" strokeWidth="6"
                                    strokeDasharray="176"
                                    strokeDashoffset={176 - (176 * throughputPct) / 100}
                                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                                />
                            </svg>
                            <span style={{ position: 'absolute', fontSize: 11, fontWeight: 700 }}>{throughputPct}%</span>
                        </div>
                    </div>
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Security Posture</p>
                            <h3 style={{ fontSize: 28, fontWeight: 700, margin: '4px 0' }}>100% Secure</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', marginTop: 8 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
                                <span style={{ fontSize: 12, fontWeight: 500 }}>Encrypted Pipelines</span>
                            </div>
                        </div>
                        <div style={{ width: 48, height: 48, background: '#f0fdf8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ color: '#10b77f', fontSize: 30 }}>verified</span>
                        </div>
                    </div>
                </div>

                {/* ── Agent Performance Monitor ── */}
                <div style={{ background: 'white', padding: 32, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ color: '#10b77f' }}>analytics</span>
                            </div>
                            <h4 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Agent Performance Monitor</h4>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>8 Agents Operational</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {pmAgents.map((a, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500 }}>
                                    <span>{a.name}</span>
                                    <span style={{ color: '#10b77f', fontWeight: 700 }}>
                                        {a.load}% <span style={{ color: '#94a3b8', fontWeight: 400 }}>Load</span>
                                    </span>
                                </div>
                                <div style={{ width: '100%', background: '#f1f5f9', height: 10, borderRadius: 8, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${a.load}%`, background: a.load > 80 ? '#ef4444' : a.load > 60 ? '#10b77f' : 'rgba(16,183,127,0.45)', borderRadius: 8, transition: 'width 1.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Active Escalations ── */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>priority_high</span>
                            <h4 style={{ fontWeight: 700, margin: 0 }}>Active Escalations (Requires Intervention)</h4>
                        </div>
                        <span style={{ padding: '4px 12px', background: '#fef2f2', color: '#ef4444', fontSize: 10, fontWeight: 700, borderRadius: 20, textTransform: 'uppercase', letterSpacing: 2 }}>3 Critical</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3 }}>
                                    <th style={{ padding: '14px 24px' }}>Patient ID</th>
                                    <th style={{ padding: '14px 24px' }}>Detected Risk</th>
                                    <th style={{ padding: '14px 24px' }}>Agent Responsible</th>
                                    <th style={{ padding: '14px 24px' }}>Timestamp</th>
                                    <th style={{ padding: '14px 24px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pmEscalations.map((e) => (
                                    <tr key={e.id} style={{ borderTop: '1px solid #f1f5f9', fontSize: 14, opacity: intercepted.includes(e.id) ? 0.45 : 1, transition: 'opacity 0.4s' }}>
                                        <td style={{ padding: '16px 24px', fontWeight: 700 }}>{e.id}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                                                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#ef4444', flexShrink: 0 }} />
                                                {e.risk}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#475569' }}>{e.agent}</td>
                                        <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{e.time}</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            {intercepted.includes(e.id)
                                                ? <span style={{ color: '#10b77f', fontWeight: 700, fontSize: 13 }}>✓ Intercepted</span>
                                                : <button onClick={() => handleIntercept(e.id)} style={{ color: '#10b77f', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 2 }}>Intercept</button>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Real-time Patient Streams ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Real-time Patient Streams</h4>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => showToast('Filter view active', 'info')} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#64748b' }}>filter_list</span>
                            </button>
                            <button onClick={() => showToast('Grid view toggled', 'info')} style={{ padding: 8, border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#64748b' }}>view_module</span>
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
                        {streamPatients.map((p, i) => {
                            const isCrit = p.status === 'critical';
                            const bColor = isCrit ? '#ef4444' : '#10b77f';
                            return (
                                <div key={i} style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: `4px solid ${bColor}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            <h5 style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>{p.name}</h5>
                                            <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '2px 0 0' }}>{p.room}</p>
                                        </div>
                                        <span className="material-symbols-outlined" style={{ color: bColor, fontSize: 18 }}>
                                            {isCrit ? 'warning' : 'favorite'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                                            <span style={{ color: '#64748b' }}>Heart Rate</span>
                                            <span style={{ fontWeight: 700, color: isCrit ? '#ef4444' : 'inherit' }}>{p.hr} BPM</span>
                                        </div>
                                        <div style={{ width: '100%', background: '#f8fafc', height: 4, borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${p.hrPct}%`, background: isCrit ? '#ef4444' : '#10b77f', borderRadius: 4 }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                                            <span style={{ color: '#64748b' }}>SpO2</span>
                                            <span style={{ fontWeight: 700 }}>{p.spo2}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── All Admitted Patients ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 40 }}>
                    <h4 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>All Admitted Patients</h4>
                    {patients.map(p => (
                        <div key={p.id} style={{ background: 'white', borderLeft: `4px solid ${statusColor[p.status]}`, border: `1px solid ${statusColor[p.status]}22`, borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 19, background: statusBg[p.status], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ color: statusColor[p.status], fontSize: 20 }}>person</span>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{p.id}</span>
                                    </div>
                                    <span style={{ fontSize: 12, color: '#64748b' }}>Age {p.age} · {p.ward}</span>
                                </div>
                            </div>
                            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#334155', background: '#f8fafc', padding: '6px 12px', borderRadius: 8 }}>{p.vitals}</span>
                            <span style={{ background: statusBg[p.status], color: statusColor[p.status], fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 8, textTransform: 'uppercase' }}>{p.status}</span>
                        </div>
                    ))}
                </div>

            </div>
        );
    }

    // ─── AGENT STATUS ─────────────────────────────────────────────────────────────
    function AgentStatusView() {
        const asEscalations = [
            { id: '#PT-8291', risk: 'Complex Contraindication', riskColor: '#d97706', riskBg: '#fef3c7', agent: 'Drug Interaction Agent', time: '14:28:01.002' },
            { id: '#PT-0128', risk: 'Vital Sign Divergence', riskColor: '#dc2626', riskBg: '#fee2e2', agent: 'Risk Assessment Agent', time: '14:27:45.110' },
            { id: '#PT-4421', risk: 'Ambiguous Coding', riskColor: '#475569', riskBg: '#f1f5f9', agent: 'Clinical Coding Agent', time: '14:25:12.890' },
        ];

        const perfAgents = [
            { name: 'Risk Assessment', load: agents[0]?.load ?? 72 },
            { name: 'Scheduler', load: agents[1]?.load ?? 15 },
            { name: 'Drug Interaction', load: agents[2]?.load ?? 88 },
            { name: 'Clinical Coding', load: agents[3]?.load ?? 45 },
        ];

        const resolved = resolvedAgentEscalations;
        const handleResolve = (id) => {
            setResolvedAgentEscalations(prev => [...prev, id]);
            showToast(`Escalation ${id} resolved.`);
        };

        return (
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1200, margin: '0 auto', width: '100%' }}>

                {/* ── Page Header ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Unified Agent Status</h1>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#ecfdf5', color: '#059669', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', borderRadius: 20, letterSpacing: 2, border: '1px solid #a7f3d0' }}>
                                    <span className="vital-pulse" />
                                    Live Heartbeat: Active
                                </span>
                            </div>
                            <p style={{ color: '#64748b', margin: 0 }}>HIPAA Compliant Real-time Telemetry Pipeline</p>
                        </div>
                        <button
                            onClick={() => {
                                const agentData = {
                                    head: ['Agent Name', 'Current Load %'],
                                    body: perfAgents.map(a => [a.name, a.load])
                                };
                                exportPDF(agentData, 'Agent Status Report');
                                showToast('Agent report exported!');
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#10b77f', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px #10b77f40' }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                            Export Report
                        </button>
                    </div>
                </div>

                {/* ── Metric Cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                    {/* Pipeline Capacity */}
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 }}>Pipeline Capacity</p>
                                <h3 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 8px' }}>{formatNum(patientCount)}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b77f', fontWeight: 700, fontSize: 13 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
                                    +12% vs last hour
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
                                {[16, 24, 32, 48, 40].map((h, i) => (
                                    <div key={i} style={{ width: 8, borderRadius: '2px 2px 0 0', height: h, background: i < 3 ? `rgba(16,185,129,${0.15 + i * 0.08})` : i === 3 ? '#10b77f' : '#10b77f99' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Throughput */}
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 }}>Throughput (Avg)</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                                    <h3 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>{(throughput / 1000).toFixed(1)}k</h3>
                                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>req/sec</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b77f', fontWeight: 700, fontSize: 13 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bolt</span>
                                    Optimized Performance
                                </div>
                            </div>
                            <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#10b77f" strokeWidth="4"
                                        strokeDasharray="175"
                                        strokeDashoffset={175 - (175 * throughputPct) / 100}
                                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                                    />
                                </svg>
                                <span style={{ position: 'absolute', fontSize: 10, fontWeight: 700 }}>{throughputPct}%</span>
                            </div>
                        </div>
                    </div>
                    {/* Security */}
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 }}>Security Posture</p>
                            <h3 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>100% Secure</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: 13 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
                                Encrypted Pipelines
                            </div>
                        </div>
                        <div style={{ width: 48, height: 48, background: '#f0fdf8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ color: '#10b77f', fontSize: 26 }}>verified</span>
                        </div>
                    </div>
                </div>

                {/* ── Agent Performance Monitor ── */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-symbols-outlined" style={{ color: '#10b77f' }}>analytics</span>
                            <h3 style={{ fontWeight: 700, margin: 0 }}>Agent Performance Monitor</h3>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>8 Agents Operational</span>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {perfAgents.map((a, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: 180, flexShrink: 0 }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>{a.name}</span>
                                </div>
                                <div style={{ flex: 1, padding: '0 32px' }}>
                                    <div style={{ height: 8, width: '100%', background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${a.load}%`,
                                            background: a.load > 80 ? '#ef4444' : a.load > 60 ? '#10b77f' : a.load > 30 ? '#6ee7b7' : '#a7f3d0',
                                            borderRadius: 8,
                                            transition: 'width 1.5s ease'
                                        }} />
                                    </div>
                                </div>
                                <div style={{ width: 96, textAlign: 'right' }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#10b77f' }}>
                                        {a.load}% <span style={{ color: '#94a3b8', fontWeight: 400 }}>Load</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Active Escalations ── */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', paddingBottom: 40 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(248,250,252,0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444' }}>
                            <span className="material-symbols-outlined">priority_high</span>
                            <h3 style={{ fontWeight: 700, margin: 0 }}>Active Escalations (Requires Intervention)</h3>
                        </div>
                        <span style={{ padding: '4px 12px', background: '#fee2e2', color: '#dc2626', fontSize: 10, fontWeight: 700, borderRadius: 6, textTransform: 'uppercase', letterSpacing: 1 }}>3 Critical</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '14px 24px' }}>Patient ID</th>
                                    <th style={{ padding: '14px 24px' }}>Detected Risk</th>
                                    <th style={{ padding: '14px 24px' }}>Agent Responsible</th>
                                    <th style={{ padding: '14px 24px' }}>Timestamp</th>
                                    <th style={{ padding: '14px 24px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asEscalations.map((e) => (
                                    <tr key={e.id} style={{ borderTop: '1px solid #f1f5f9', opacity: resolved.includes(e.id) ? 0.4 : 1, transition: 'opacity 0.4s' }}>
                                        <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700 }}>{e.id}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 6, background: e.riskBg, color: e.riskColor }}>
                                                {e.risk}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748b' }}>{e.agent}</td>
                                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>{e.time}</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            {resolved.includes(e.id)
                                                ? <span style={{ color: '#10b77f', fontWeight: 700, fontSize: 13 }}>✓ Resolved</span>
                                                : <button onClick={() => handleResolve(e.id)} style={{ color: '#10b77f', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 2 }}>Resolve</button>
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

    // ─── ESCALATIONS PAGE ─────────────────────────────────────────────────────────
    function EscalationsView() {
        const ALL_ESCALATIONS = [
            // Page 1
            { id: 'PX-9821', ward: 'ICU', risk: 'Arterial Desaturation (SpO2 < 85%)', agent: 'Alpha-9 Agent', time: '14:23:02 PM', severity: 'critical' },
            { id: 'PX-7740', ward: 'POST-OP', risk: 'Acute Tachycardia Spike (145 BPM)', agent: 'Delta-2 Agent', time: '14:21:45 PM', severity: 'critical' },
            { id: 'PX-8219', ward: 'ER', risk: 'Potential Drug Interaction Detected', agent: 'Pharmacology-AI', time: '14:19:33 PM', severity: 'critical' },
            { id: 'PX-3302', ward: 'GEN-POP', risk: 'Abnormal Sleep Pattern Pattern', agent: 'Monitor-B2', time: '14:05:12 PM', severity: 'warning' },
            // Page 2
            { id: 'PX-4401', ward: 'ICU', risk: 'Severe Bradycardia (38 BPM)', agent: 'Vitals-Agent-01', time: '14:18:55 PM', severity: 'critical' },
            { id: 'PX-6612', ward: 'ER', risk: 'Anaphylactic Shock Indicators', agent: 'Alpha-9 Agent', time: '14:17:30 PM', severity: 'critical' },
            { id: 'PX-2200', ward: 'POST-OP', risk: 'Post-op Hemorrhage Risk Elevated', agent: 'Risk-Scanner', time: '14:16:44 PM', severity: 'critical' },
            { id: 'PX-8831', ward: 'GEN-POP', risk: 'Elevated Blood Glucose (>400 mg/dL)', agent: 'EndoGuard-4', time: '14:14:02 PM', severity: 'warning' },
            // Page 3
            { id: 'PX-1145', ward: 'ICU', risk: 'Sepsis Biomarker Spike Detected', agent: 'Vitals-Agent-02', time: '14:13:22 PM', severity: 'critical' },
            { id: 'PX-3389', ward: 'ER', risk: 'Acute Renal Failure (Creatinine >8)', agent: 'LabAnalyzer-AI', time: '14:12:10 PM', severity: 'critical' },
            { id: 'PX-5567', ward: 'POST-OP', risk: 'Deep Vein Thrombosis Risk', agent: 'Risk-Scanner', time: '14:11:05 PM', severity: 'warning' },
            { id: 'PX-7723', ward: 'GEN-POP', risk: 'Hypertensive Crisis (BP 210/130)', agent: 'Vitals-Agent-01', time: '14:09:48 PM', severity: 'critical' },
            // Page 4
            { id: 'PX-0091', ward: 'ICU', risk: 'Neurological Deterioration Alert', agent: 'Neuro-Watch', time: '14:08:33 PM', severity: 'critical' },
            { id: 'PX-2244', ward: 'ER', risk: 'Pulmonary Embolism Probability >80%', agent: 'BreathSafe-OS', time: '14:07:21 PM', severity: 'critical' },
            { id: 'PX-4499', ward: 'POST-OP', risk: 'Wound Infection Markers Detected', agent: 'Pharmacology-AI', time: '14:05:50 PM', severity: 'warning' },
            { id: 'PX-6678', ward: 'GEN-POP', risk: 'Hypoglycemic Episode (Glucose <45)', agent: 'EndoGuard-4', time: '14:04:11 PM', severity: 'warning' },
            // Page 5
            { id: 'PX-8801', ward: 'ICU', risk: 'Cardiac Tamponade Suspicion', agent: 'Alpha-9 Agent', time: '14:03:02 PM', severity: 'critical' },
            { id: 'PX-1122', ward: 'ER', risk: 'Multi-Drug Resistance Flagged', agent: 'Pharmacology-AI', time: '14:01:44 PM', severity: 'critical' },
            { id: 'PX-3355', ward: 'POST-OP', risk: 'Elevated Troponin (MI Risk)', agent: 'Vitals-Agent-02', time: '14:00:30 PM', severity: 'critical' },
            { id: 'PX-5589', ward: 'GEN-POP', risk: 'Irregular Sleep & Vitals Correlation', agent: 'Monitor-B2', time: '13:58:55 PM', severity: 'warning' },
            // Page 6
            { id: 'PX-7714', ward: 'ICU', risk: 'Ventilator Dependency Trend', agent: 'BreathSafe-OS', time: '13:57:20 PM', severity: 'critical' },
            { id: 'PX-9900', ward: 'ER', risk: 'Stroke Probability Elevated (>75%)', agent: 'Neuro-Watch', time: '13:55:05 PM', severity: 'critical' },
            { id: 'PX-2233', ward: 'POST-OP', risk: 'Fluid Overload – Edema Detected', agent: 'Risk-Scanner', time: '13:53:40 PM', severity: 'warning' },
            { id: 'PX-4466', ward: 'GEN-POP', risk: 'Ambiguous Lab Values – Review Needed', agent: 'LabAnalyzer-AI', time: '13:51:15 PM', severity: 'warning' },
            // Page 7
            { id: 'PX-6699', ward: 'ICU', risk: 'Acute Liver Failure (ALT >500)', agent: 'LabAnalyzer-AI', time: '13:50:02 PM', severity: 'critical' },
            { id: 'PX-8811', ward: 'ER', risk: 'Rhabdomyolysis (CK Spike Detected)', agent: 'Vitals-Agent-01', time: '13:48:44 PM', severity: 'critical' },
            { id: 'PX-1100', ward: 'POST-OP', risk: 'Ileus Suspected – No Bowel Sounds', agent: 'Monitor-B2', time: '13:46:30 PM', severity: 'warning' },
            { id: 'PX-3344', ward: 'GEN-POP', risk: 'Orthostatic Hypotension Pattern', agent: 'Risk-Scanner', time: '13:44:55 PM', severity: 'warning' },
            // Page 8
            { id: 'PX-5577', ward: 'ICU', risk: 'ARDS Onset – O2 Ratio Declining', agent: 'BreathSafe-OS', time: '13:43:22 PM', severity: 'critical' },
            { id: 'PX-7711', ward: 'ER', risk: 'Toxic Ingestion Suspected', agent: 'Pharmacology-AI', time: '13:41:11 PM', severity: 'critical' },
            { id: 'PX-9988', ward: 'POST-OP', risk: 'Fever Spike >40°C (Post-Op)', agent: 'Vitals-Agent-02', time: '13:39:45 PM', severity: 'critical' },
            { id: 'PX-2211', ward: 'GEN-POP', risk: 'QT Prolongation – Arrhythmia Risk', agent: 'Alpha-9 Agent', time: '13:37:20 PM', severity: 'warning' },
            // Page 9
            { id: 'PX-4455', ward: 'ICU', risk: 'Pneumothorax – Tracheal Deviation', agent: 'BreathSafe-OS', time: '13:35:02 PM', severity: 'critical' },
            { id: 'PX-6688', ward: 'ER', risk: 'Aortic Dissection Indicators', agent: 'Vitals-Agent-01', time: '13:33:40 PM', severity: 'critical' },
            { id: 'PX-8822', ward: 'POST-OP', risk: 'Coagulopathy (INR >5) Detected', agent: 'LabAnalyzer-AI', time: '13:31:25 PM', severity: 'warning' },
            { id: 'PX-1199', ward: 'GEN-POP', risk: 'Infection Marker – WBC >18k', agent: 'Risk-Scanner', time: '13:29:00 PM', severity: 'warning' },
            // Page 10
            { id: 'PX-3366', ward: 'ICU', risk: 'GI Bleed – Haemoglobin Drop', agent: 'Vitals-Agent-02', time: '13:27:44 PM', severity: 'critical' },
            { id: 'PX-5500', ward: 'ER', risk: 'Hypercapnia – CO2 Retention', agent: 'BreathSafe-OS', time: '13:25:33 PM', severity: 'critical' },
            { id: 'PX-7755', ward: 'POST-OP', risk: 'Anastomotic Leak Suspicion', agent: 'Monitor-B2', time: '13:23:15 PM', severity: 'warning' },
            { id: 'PX-9922', ward: 'GEN-POP', risk: 'Hypernatremia (Na+ >155 mEq/L)', agent: 'EndoGuard-4', time: '13:21:02 PM', severity: 'warning' },
            // Page 11
            { id: 'PX-2255', ward: 'ICU', risk: 'Subarachnoid Haemorrhage Suspected', agent: 'Neuro-Watch', time: '13:18:40 PM', severity: 'critical' },
            { id: 'PX-4488', ward: 'ER', risk: 'Eclampsia Risk – BP & Proteinuria', agent: 'Vitals-Agent-01', time: '13:16:20 PM', severity: 'critical' },
            { id: 'PX-6611', ward: 'POST-OP', risk: 'Aspiration Pneumonia Signs', agent: 'BreathSafe-OS', time: '13:14:05 PM', severity: 'warning' },
            { id: 'PX-8844', ward: 'GEN-POP', risk: 'Pressure Ulcer Risk Score Critical', agent: 'Monitor-B2', time: '13:11:55 PM', severity: 'warning' },
            // Page 12
            { id: 'PX-1177', ward: 'ICU', risk: 'Cardiogenic Shock – MAP <50 mmHg', agent: 'Alpha-9 Agent', time: '13:09:33 PM', severity: 'critical' },
            { id: 'PX-3300', ward: 'ER', risk: 'Necrotizing Fasciitis Indicators', agent: 'Risk-Scanner', time: '13:07:11 PM', severity: 'critical' },
            { id: 'PX-5544', ward: 'POST-OP', risk: 'Bile Duct Injury – Elevated Bilirubin', agent: 'LabAnalyzer-AI', time: '13:04:50 PM', severity: 'warning' },
            { id: 'PX-7788', ward: 'GEN-POP', risk: 'Recurrent Falls – Injury Risk High', agent: 'Monitor-B2', time: '13:02:22 PM', severity: 'warning' },
        ];
        const ITEMS_PER_PAGE = 4;
        const totalPages = Math.ceil(ALL_ESCALATIONS.length / ITEMS_PER_PAGE);
        const hubEscalations = ALL_ESCALATIONS.slice((escalationPage - 1) * ITEMS_PER_PAGE, escalationPage * ITEMS_PER_PAGE);
        const intervened = escalationIntervened;
        const reviewed = escalationReviewed;
        const page = escalationPage;
        const sourceAgents = [
            { name: 'Risk Assessment Agent', load: agents[0]?.load ?? 72 },
            { name: 'Clinical Workflow Scheduler', load: agents[1]?.load ?? 15 },
            { name: 'Pharmacology Agent', load: agents[2]?.load ?? 88 },
            { name: 'Clinical Entity Recognition', load: agents[3]?.load ?? 45 },
        ];
        const handleIntervene = (id) => { setEscalationIntervened(prev => [...prev, id]); showToast(`Intervention recorded for ${id}.`); };
        const handleReview = (id) => { setEscalationReviewed(prev => [...prev, id]); showToast(`Review started for ${id}.`, 'info'); };

        return (
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1200, margin: '0 auto', width: '100%' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Unified Escalations Hub</h1>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#ecfdf5', color: '#059669', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', borderRadius: 20, letterSpacing: 2 }}>
                                <span className="vital-pulse" />Live Intelligence
                            </span>
                        </div>
                        <p style={{ color: '#64748b', margin: 0 }}>HIPAA Compliant Real-time Telemetry &amp; Risk Intervention</p>
                    </div>
                    <button onClick={() => {
                        const escData = {
                            head: ['Patient ID', 'Detected Risk', 'Agent Responsible', 'Timestamp', 'Severity'],
                            body: ALL_ESCALATIONS.map(e => [e.id, e.risk, e.agent, e.time, e.severity.toUpperCase()])
                        };
                        exportPDF(escData, 'Escalations Report');
                        showToast('Escalations report exported!');
                    }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#10b77f', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px #10b77f40' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>Export Full Report
                    </button>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, margin: 0 }}>Urgent Attention</p>
                            <span style={{ padding: 8, background: '#fef2f2', borderRadius: 10 }}><span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: 20, display: 'block' }}>priority_high</span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 40, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>{criticalCount}</span>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Critical</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ef4444' }}>trending_up</span>Higher than previous hour
                        </p>
                    </div>
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, margin: 0 }}>Avg. Response Time</p>
                            <span style={{ padding: 8, background: '#eff6ff', borderRadius: 10 }}><span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: 20, display: 'block' }}>timer</span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>1.8</span>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>min</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#10b77f' }}>trending_down</span>Optimized performance
                        </p>
                    </div>
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, margin: 0 }}>Encryption Status</p>
                            <span style={{ padding: 8, background: '#f0fdf8', borderRadius: 10 }}><span className="material-symbols-outlined" style={{ color: '#10b77f', fontSize: 20, display: 'block' }}>lock</span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>100%</span>
                            <span style={{ color: '#64748b', fontWeight: 500, fontSize: 14 }}>Active</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#10b77f' }}>verified</span>AES-256 Encrypted
                        </p>
                    </div>
                </div>

                {/* Escalations Table */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ padding: 8, background: '#fef2f2', borderRadius: 10, display: 'flex' }}><span className="material-symbols-outlined" style={{ color: '#ef4444' }}>error_outline</span></span>
                            <h3 style={{ fontWeight: 700, margin: 0 }}>Active Escalations (Requires Intervention)</h3>
                        </div>
                        <span style={{ padding: '4px 14px', background: '#fee2e2', color: '#ef4444', fontSize: 10, fontWeight: 900, borderRadius: 20, textTransform: 'uppercase', letterSpacing: 2 }}>3 Critical</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(248,250,252,0.5)', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3 }}>
                                    <th style={{ padding: '14px 32px' }}>Patient ID</th>
                                    <th style={{ padding: '14px 32px' }}>Detected Risk</th>
                                    <th style={{ padding: '14px 32px' }}>Agent Responsible</th>
                                    <th style={{ padding: '14px 32px' }}>Timestamp</th>
                                    <th style={{ padding: '14px 32px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hubEscalations.map((e) => {
                                    const isCrit = e.severity === 'critical';
                                    const isActed = isCrit ? intervened.includes(e.id) : reviewed.includes(e.id);
                                    return (
                                        <tr key={e.id} style={{ borderTop: '1px solid #f1f5f9', borderLeft: `4px solid ${isCrit ? '#ef4444' : '#fbbf24'}`, opacity: isActed ? 0.45 : 1, transition: 'opacity 0.4s' }}>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontWeight: 700, fontSize: 14 }}>{e.id}</span>
                                                    <span style={{ fontSize: 10, padding: '2px 6px', background: '#f1f5f9', color: '#64748b', borderRadius: 4, fontWeight: 600 }}>{e.ward}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ width: 8, height: 8, borderRadius: 4, flexShrink: 0, background: isCrit ? '#ef4444' : '#fbbf24', boxShadow: isCrit ? '0 0 8px rgba(239,68,68,0.5)' : 'none' }} />
                                                    <span style={{ fontSize: 14, fontWeight: isCrit ? 600 : 500, color: isCrit ? '#1e293b' : '#475569' }}>{e.risk}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#10b77f' }}>smart_toy</span>
                                                    </div>
                                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{e.agent}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px', fontSize: 14, color: '#64748b' }}>{e.time}</td>
                                            <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                                {isActed
                                                    ? <span style={{ color: '#10b77f', fontWeight: 700, fontSize: 13 }}>✓ {isCrit ? 'Intervened' : 'Reviewed'}</span>
                                                    : isCrit
                                                        ? <button onClick={() => handleIntervene(e.id)} style={{ padding: '6px 16px', background: '#ef4444', color: 'white', fontSize: 12, fontWeight: 700, borderRadius: 6, border: 'none', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>Intervene</button>
                                                        : <button onClick={() => handleReview(e.id)} style={{ padding: '6px 16px', background: '#1e293b', color: 'white', fontSize: 12, fontWeight: 700, borderRadius: 6, border: 'none', cursor: 'pointer' }}>Review</button>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '14px 32px', background: 'rgba(248,250,252,0.3)', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>All data transmitted via Encrypted VPN Tunnel (TLS 1.3)</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => setEscalationPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: 6, background: 'none', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#cbd5e1' : '#64748b', display: 'flex', alignItems: 'center' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
                            </button>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Page {page} of {totalPages}</span>
                            <button onClick={() => setEscalationPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: 6, background: 'none', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#cbd5e1' : '#64748b', display: 'flex', alignItems: 'center' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Escalation Source Load */}
                <div style={{ background: 'white', padding: 32, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', paddingBottom: 48 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-symbols-outlined" style={{ color: '#10b77f' }}>monitoring</span>
                            <h3 style={{ fontWeight: 700, margin: 0 }}>Escalation Source Load</h3>
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>8 Agents Operational</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {sourceAgents.map((a, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                                    <span style={{ color: '#334155' }}>{a.name}</span>
                                    <span style={{ color: '#10b77f' }}>{a.load}% Load</span>
                                </div>
                                <div style={{ height: 8, width: '100%', background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${a.load}%`, background: a.load > 80 ? '#ef4444' : a.load > 30 ? '#10b77f' : '#6ee7b7', borderRadius: 8, transition: 'width 1.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Log */}
                {auditLog.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', paddingBottom: 40 }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                            <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                                <span className="material-symbols-outlined" style={{ color: '#10b77f' }}>history</span>Audit Log
                            </h4>
                        </div>
                        <div style={{ padding: 24, display: 'grid', gap: 8 }}>
                            {auditLog.map((entry, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#334155', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                                    <span className="material-symbols-outlined" style={{ color: '#10b77f', fontSize: 16 }}>check_circle</span>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{entry.id}</span>
                                    <span>was <strong>{entry.action}</strong> by {entry.user}</span>
                                    <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 12 }}>{entry.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── SECURITY ─────────────────────────────────────────────────────────────────
    function SecurityView() {
        const auditEvents = [
            { id: '#PX-9021-B', risk: 'Potential Contraindication', dotColor: '#f43f5e', agent: 'Agent-Rho (Drug Int.)', agentIcon: 'smart_toy', time: '2 min ago' },
            { id: '#PX-8812-C', risk: 'Abnormal Vital Drift', dotColor: '#f97316', agent: 'Agent-Sigma (Vitals)', agentIcon: 'smart_toy', time: '14 min ago' },
            { id: '#PX-1102-A', risk: 'Critical PII Access Log', dotColor: '#f43f5e', agent: 'Audit-Sentry-01', agentIcon: 'shield', time: '28 min ago' },
        ];
        const [reviewedEvents, setReviewedEvents] = [reviewedSecurityEvents, setReviewedSecurityEvents];
        const safetyAgents = [
            { name: 'Risk Assessment', load: agents[0]?.load ?? 72 },
            { name: 'Scheduler', load: agents[1]?.load ?? 15 },
            { name: 'Drug Interaction', load: agents[2]?.load ?? 88 },
            { name: 'Clinical Coding', load: agents[3]?.load ?? 45 },
        ];

        return (
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1200, margin: '0 auto', width: '100%' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Security &amp; Compliance</h1>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#ecfdf5', color: '#059669', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', borderRadius: 20, letterSpacing: 2 }}>
                                <span className="vital-pulse" />
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
                    <div style={{ padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={() => setActiveNav('escalations')} style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 3, background: 'none', border: 'none', cursor: 'pointer' }}>View Full Audit Log</button>
                    </div>
                </div>

            </div>
        );
    }

    // ─── Shared: Escalations Table ────────────────────────────────────────────────
    function EscalationsTable({ showAll = false }) {
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
                                <tr key={e.id} style={{ borderTop: '1px solid #f1f5f9', opacity: e.resolved ? 0.45 : 1, transition: 'opacity 0.4s' }}>
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
                                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                        {e.resolved
                                            ? <span style={{ color: '#10b77f', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>Resolved</span>
                                            : <button
                                                onClick={() => setOverrideModal(e.id)}
                                                style={{ padding: '6px 16px', background: '#ef4444', color: 'white', fontSize: 12, fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer' }}
                                            >OVERRIDE</button>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // ─── Shared: Agent Performance Panel ─────────────────────────────────────────
    function AgentPerformancePanel({ agents: list, title = 'Agent Performance Monitor' }) {
        return (
            <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #10b77f0d', boxShadow: '0 1px 4px #0001' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-symbols-outlined" style={{ color: '#10b77f' }}>analytics</span>
                        {title}
                    </h4>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{list.length} Agents Operational</span>
                </div>
                <div style={{ display: 'grid', gap: 18 }}>
                    {list.map((a, i) => (
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

    // ─── Mini Charts ──────────────────────────────────────────────────────────────
    function MiniBarChart() {
        return (
            <div style={{ width: 96, height: 48, background: '#f0fdf8', borderRadius: 8, display: 'flex', alignItems: 'flex-end', padding: '4px 4px', gap: 2, overflow: 'hidden' }}>
                {[4, 6, 8, 5, 9, 7, 10].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: `rgba(16,183,127,${0.2 + i * 0.1})`, height: `${h * 10}%`, borderRadius: '2px 2px 0 0', transition: 'height 1s ease' }} />
                ))}
            </div>
        );
    }

    function GaugeRing() {
        return (
            <div style={{ width: 48, height: 48, borderRadius: 24, border: '4px solid #f1f5f9', borderTopColor: '#10b77f', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ fontSize: 10, fontWeight: 700 }}>{throughputPct}%</span>
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

    // ─── Override Confirmation Modal ──────────────────────────────────────────────
    const OverrideModal = () => {
        const e = escalations.find(x => x.id === overrideModal);
        if (!e) return null;
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 420, width: '90%', boxShadow: '0 20px 60px #0003' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: 28 }}>warning</span>
                        <h3 style={{ fontSize: 20, fontWeight: 800 }}>Confirm Override</h3>
                    </div>
                    <p style={{ color: '#64748b', marginBottom: 8, fontSize: 14 }}>You are about to manually override and resolve:</p>
                    <div style={{ background: '#fef2f2', borderRadius: 10, padding: 16, marginBottom: 24, border: '1px solid #ef444422' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, marginBottom: 4 }}>{e.id}</div>
                        <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{e.risk}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Agent: {e.agent}</div>
                    </div>
                    <p style={{ background: '#fffbeb', padding: 12, borderRadius: 8, fontSize: 13, color: '#92400e', marginBottom: 24, border: '1px solid #fde68a' }}>
                        <strong>⚠ Warning:</strong> This action will be logged in the HIPAA audit trail.
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setOverrideModal(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={() => handleOverride(e.id)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Confirm Override</button>
                    </div>
                </div>
            </div>
        );
    };

    // ─── Notifications Dropdown ───────────────────────────────────────────────────
    const NotifDropdown = () => (
        <div ref={notifRef} style={{ position: 'relative' }}>
            <button
                onClick={() => { setShowNotifs(s => !s); setShowSettings(false); }}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', position: 'relative' }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#475569' }}>notifications</span>
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 8, background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{unreadCount}</span>
                )}
            </button>
            {showNotifs && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 340, background: 'white', borderRadius: 14, boxShadow: '0 8px 32px #0002', border: '1px solid #e2e8f0', zIndex: 200 }}>
                    <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                        {unreadCount > 0 && <button onClick={markAllRead} style={{ fontSize: 12, color: '#10b77f', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>Mark all read</button>}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {notifications.map(n => (
                            <div key={n.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, background: n.read ? 'white' : '#f0fdf8', borderBottom: '1px solid #f1f5f9' }}>
                                <span className="material-symbols-outlined" style={{ color: n.color, fontSize: 18, marginTop: 2 }}>{n.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{n.text}</p>
                                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{n.time}</p>
                                </div>
                                {!n.read && <div style={{ width: 6, height: 6, borderRadius: 3, background: '#10b77f', marginTop: 6, flexShrink: 0 }} />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // ─── Settings Dropdown ────────────────────────────────────────────────────────
    const SettingsDropdown = () => (
        <div ref={settingsRef} style={{ position: 'relative' }}>
            <button
                onClick={() => { setShowSettings(s => !s); setShowNotifs(false); }}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#475569' }}>settings</span>
            </button>
            {showSettings && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 240, background: 'white', borderRadius: 14, boxShadow: '0 8px 32px #0002', border: '1px solid #e2e8f0', zIndex: 200 }}>
                    {[
                        { icon: 'account_circle', label: 'Admin Profile', action: () => { setActiveNav('profile'); setShowSettings(false); } },
                        {
                            icon: 'download', label: 'Export Report', action: () => {
                                const genData = {
                                    head: ['Patient ID', 'Detected Risk', 'Agent Responsible', 'Timestamp', 'Status'],
                                    body: escalations.map(e => [e.id, e.risk, e.agent, e.time, e.resolved ? 'Resolved' : 'Active'])
                                };
                                exportPDF(genData, 'Aegis System Status Report');
                                showToast('Report exported!');
                                setShowSettings(false);
                            }
                        },
                        { icon: 'lock_reset', label: 'Reset Token', action: () => { showToast('Session token rotated — sign-in link sent to your email.', 'info'); setShowSettings(false); } },
                        { icon: 'logout', label: 'Sign Out', action: () => window.location.reload() },
                    ].map((item, i) => (
                        <button key={i} onClick={item.action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', fontSize: 14, color: '#334155', fontWeight: 500 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#64748b' }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // ─── Profile Page ─────────────────────────────────────────────────────────────
    function ProfileView() {
        // Aliases to parent-level states (stable across re-renders)
        const notifSms = profileNotifSms; const setNotifSms = setProfileNotifSms;
        const notifEmail = profileNotifEmail; const setNotifEmail = setProfileNotifEmail;
        const notifPush = profileNotifPush; const setNotifPush = setProfileNotifPush;
        const editMode = profileEditMode; const setEditMode = setProfileEditMode;
        const role = profileRole; const setRole = setProfileRole;
        const email = profileEmail; const setEmail = setProfileEmail;
        const phone = profilePhone; const setPhone = setProfilePhone;

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
                                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dr. Sarah Chen</h2>
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
                                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{twoFAEnabled ? 'Enabled via Aegis Auth App' : 'Disabled — your account is less secure'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setTwoFAEnabled(v => !v); showToast(twoFAEnabled ? '2FA disabled. Account security reduced.' : '2FA enabled via Aegis Auth App.'); }}
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
                                        <button onClick={() => {
                                            const newKey = { name: 'YubiKey Bio', serial: `SN-${Math.floor(1000 + Math.random() * 9000)}-C`, regDate: 'Today' };
                                            setHardwareKeys(prev => [...prev, newKey]);
                                            showToast(`New key ${newKey.name} registered successfully.`, 'info');
                                        }} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', background: 'none', border: '1px dashed #e2e8f0', borderRadius: 8, padding: '8px 0', cursor: 'pointer', textAlign: 'center' }}>
                                            + Register New Key
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
                        onClick={() => { const id = `svc-${Date.now()}`; setIotServices(prev => [...prev, { id, icon: 'device_hub', iconBg: '#f5f3ff', iconColor: '#7c3aed', name: 'New Healthcare Endpoint', detail: 'Pending configuration…', connected: false }]); showToast('New endpoint added. Configure it to connect.', 'info'); }}
                        style={{ marginTop: 16, width: '100%', padding: '12px 0', border: '2px dashed #e2e8f0', borderRadius: 10, background: 'none', color: '#94a3b8', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#10b77f'; e.currentTarget.style.borderColor = '#10b77f'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>Link New Healthcare Endpoint
                    </button>
                </div>

                {/* ── Footer ── */}
                <div style={{ paddingTop: 24, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>&copy; 2024 Aegis AI Systems. All medical data is end-to-end encrypted.</p>
                    <button onClick={() => showToast('Account deactivation requires admin approval.', 'info')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>no_accounts</span>Deactivate Institutional Account
                    </button>
                </div>

            </div >
        );
    }
    const Toast = () => toast && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, background: toast.type === 'info' ? '#1e293b' : '#10b77f', color: 'white', padding: '14px 22px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 8px 32px #0003', zIndex: 2000, display: 'flex', alignItems: 'center', gap: 10, animation: 'slideUp 0.3s ease' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{toast.type === 'info' ? 'info' : 'check_circle'}</span>
            {toast.msg}
        </div>
    );

    // ─── MAIN RENDER ──────────────────────────────────────────────────────────────
    return (
        <div style={{ background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .vital-pulse { position:relative; display:inline-block; width:10px; height:10px; background:#10b77f; border-radius:50%; flex-shrink:0; }
        .vital-pulse::after { content:''; position:absolute; top:0;left:0;right:0;bottom:0; border-radius:50%; border:2px solid #10b77f; animation:pulse-ring 2s cubic-bezier(.455,.03,.515,.955) infinite; }
        @keyframes pulse-ring { 0%{transform:scale(.33);opacity:1} 80%,100%{transform:scale(3);opacity:0} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#f1f5f9; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
      `}</style>

            {/* Sidebar */}
            <aside style={{ width: 240, flexShrink: 0, background: 'white', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
                <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#10b77f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <span className="material-symbols-outlined">shield_with_heart</span>
                    </div>
                    <div>
                        <h1 style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>Aegis AI</h1>
                        <p style={{ fontSize: 11, color: '#10b77f', fontWeight: 600, marginTop: 2 }}>Health Monitoring</p>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {NAV_ITEMS.map(item => {
                        const active = activeNav === item.id;
                        const hasBadge = item.id === 'escalations' && criticalCount > 0;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveNav(item.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: active ? '#f0fdf8' : 'transparent', color: active ? '#10b77f' : '#64748b', fontWeight: active ? 700 : 500, fontSize: 14, width: '100%', transition: 'all .15s', position: 'relative' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
                                {item.label}
                                {hasBadge && <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 7px' }}>{criticalCount}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div style={{ padding: 12, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, background: '#f8fafc' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 16, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#64748b' }}>person</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. Sarah Chen</p>
                            <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Sr. AI Architect</p>
                        </div>
                        <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} title="Sign out">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', background: '#f8fafc' }}>
                {/* Header */}
                <header style={{ height: 64, flexShrink: 0, borderBottom: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                            {NAV_ITEMS.find(n => n.id === activeNav)?.label || 'Admin Pulse Overview'}
                        </h2>
                        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            {(
                                activeNav === 'dashboard' ? [['Systems', 'agents'], ['Reports', 'dashboard'], ['Audit Logs', 'escalations']] :
                                    activeNav === 'patients' ? [['Overview', 'dashboard'], ['Systems', 'agents'], ['Audit Logs', 'escalations']] :
                                        activeNav === 'agents' ? [['Systems', 'agents'], ['Reports', 'dashboard'], ['Audit Logs', 'escalations']] :
                                            activeNav === 'escalations' ? [['Overview', 'dashboard'], ['Systems', 'agents'], ['Audit Logs', 'escalations']] :
                                                activeNav === 'security' ? [['Systems', 'agents'], ['Reports', 'dashboard'], ['Audit Logs', 'escalations']] :
                                                    [['Systems', 'agents'], ['Reports', 'dashboard'], ['Audit Logs', 'escalations']]
                            ).map(([label, target]) => (
                                <button
                                    key={label}
                                    onClick={() => setActiveNav(target)}
                                    style={{ fontSize: 13, fontWeight: activeNav === target ? 700 : 500, color: activeNav === target ? '#10b77f' : '#64748b', border: 'none', background: 'none', cursor: 'pointer', padding: '2px 0', borderBottom: activeNav === target ? '2px solid #10b77f' : '2px solid transparent', transition: 'all 0.15s' }}
                                >{label}</button>
                            ))}
                        </nav>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }}>search</span>
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search telemetry..."
                                style={{ paddingLeft: 36, paddingRight: 14, paddingTop: 7, paddingBottom: 7, background: '#f1f5f9', border: 'none', borderRadius: 10, fontSize: 13, outline: 'none', width: 220 }}
                            />
                        </div>
                        <NotifDropdown />
                        <SettingsDropdown />
                    </div>
                </header>

                {renderContent()}
            </main>

            {/* ── Agent Floating Chat ── */}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
                {isAgentOpen ? (
                    <div style={{ width: 380, height: 500, background: 'white', borderRadius: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
                        {/* Header */}
                        <div style={{ padding: '16px 20px', background: '#10b77f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Aegis Assistant</h4>
                                    <span style={{ fontSize: 10, opacity: 0.8 }}>Powered by Gemini 1.5 Pro</span>
                                </div>
                            </div>
                            <button onClick={() => setIsAgentOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
                            {agentMessages.map((msg, i) => (
                                <div key={i} style={{ alignSelf: msg.role === 'human' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                    <div style={{
                                        padding: '10px 14px',
                                        borderRadius: msg.role === 'human' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                        background: msg.role === 'human' ? '#10b77f' : 'white',
                                        color: msg.role === 'human' ? 'white' : '#334155',
                                        fontSize: 13,
                                        lineHeight: 1.5,
                                        boxShadow: msg.role === 'human' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                                        border: msg.role === 'human' ? 'none' : '1px solid #e2e8f0'
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isAgentTyping && (
                                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '10px 14px', borderRadius: '16px 16px 16px 2px', border: '1px solid #e2e8f0', display: 'flex', gap: 4 }}>
                                    <Loader2 size={14} className="animate-spin" style={{ color: '#10b77f' }} />
                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Aegis is thinking...</span>
                                </div>
                            )}
                            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!agentInput.trim() || isAgentTyping) return;
                                const text = agentInput;
                                setAgentInput('');
                                if (isListening) {
                                    recognitionRef.current?.stop();
                                    setIsListening(false);
                                }
                                handleAgentMessage(text);
                            }}
                            style={{ padding: 16, borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', gap: 10, alignItems: 'center' }}
                        >
                            {/* Voice Chat Toggle */}
                            <button
                                type="button"
                                onClick={toggleVoiceMode}
                                title={voiceMode ? 'End Voice Chat' : 'Start 2-way Voice Chat'}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px',
                                    height: 36, borderRadius: 20, border: 'none', cursor: 'pointer',
                                    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.3s',
                                    background: voiceMode
                                        ? (isListening ? '#fee2e2' : (isAgentTyping ? '#fef9c3' : '#dcfce7'))
                                        : '#f1f5f9',
                                    color: voiceMode
                                        ? (isListening ? '#dc2626' : (isAgentTyping ? '#ca8a04' : '#16a34a'))
                                        : '#64748b',
                                    animation: isListening ? 'pulse 1.2s infinite' : 'none',
                                }}
                            >
                                {voiceMode
                                    ? isListening
                                        ? <><Mic size={14} /> Listening...</>
                                        : isAgentTyping
                                            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Speaking...</>
                                            : <><Mic size={14} /> Voice On</>
                                    : <><MicOff size={14} /> Voice Chat</>
                                }
                            </button>
                            <input
                                value={agentInput}
                                onChange={(e) => setAgentInput(e.target.value)}
                                placeholder={isListening ? 'Listening... speak now' : voiceMode ? 'Voice active — or type' : 'Ask Aegis to do something...'}
                                style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', fontSize: 13, outline: 'none' }}
                            />
                            <button
                                type="submit"
                                disabled={!agentInput.trim() || isAgentTyping}
                                style={{ width: 36, height: 36, borderRadius: 10, background: '#10b77f', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (!agentInput.trim() || isAgentTyping) ? 0.5 : 1 }}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAgentOpen(true)}
                        style={{ width: 56, height: 56, borderRadius: 28, background: '#10b77f', color: 'white', border: 'none', boxShadow: '0 8px 24px rgba(16,183,127,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
                    >
                        <MessageCircle size={28} />
                    </button>
                )}
            </div>

            {overrideModal && <OverrideModal />}
            {showAdminProfile && <AdminProfileModal />}
            <Toast />
        </div>
    );
}
