import React, { useState, useEffect, useRef } from 'react';
import { authService, patientService, hospitalService, chatService } from '@/database';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { initAdminAgent } from '@/lib/adminAgent';
import { Bot, Send, X, Minimize2, Maximize2, Loader2, MessageCircle, Mic, MicOff } from 'lucide-react';
import AnalyticsView from '../components/admin/AnalyticsView';
import ResourcesView from '../components/admin/ResourcesView';
import AuditView from '../components/admin/AuditView';
import DashboardMetrics from '../components/admin/DashboardMetrics';
import EscalationsTable from '../components/admin/EscalationsTable';
import AdminProfileView from '../components/admin/AdminProfileView';
import AdminChatWidget from '../components/admin/AdminChatWidget';
import SecurityView from '../components/admin/SecurityView';
import AgentPerformancePanel from '../components/admin/AgentPerformancePanel';

const INITIAL_ESCALATIONS = [];
const INITIAL_AGENTS = [];
const INITIAL_PATIENT_COUNT = 1200;
const INITIAL_STAFF_COUNT = 45;

const NOTIFICATIONS = [
    { id: 1, icon: 'priority_high', color: '#ef4444', text: 'Patient #PX-8812 requires immediate intervention.', time: '2m ago', read: false },
    { id: 2, icon: 'medication', color: '#f59e0b', text: 'Drug interaction flagged for Patient #PX-9004.', time: '4m ago', read: false },
    { id: 3, icon: 'monitor_heart', color: '#10b77f', text: 'Agent throughput increased by 18% this hour.', time: '10m ago', read: true },
    { id: 4, icon: 'cloud_sync', color: '#6366f1', text: 'Cloud node US-EAST rebalanced. Latency optimal.', time: '22m ago', read: true },
    { id: 5, icon: 'verified_user', color: '#10b77f', text: 'System security posture: 100% Secure.', time: '1h ago', read: true },
];

const NAV_ITEMS = [
    { id: 'dashboard', label: 'System Pulse', icon: 'grid_view' },
    { id: 'analytics', label: 'Advanced Analytics', icon: 'insights' },
    { id: 'security', label: 'Security & Monitoring', icon: 'verified_user' },
    { id: 'resources', label: 'Cloud Infrastructure', icon: 'cloud' },
    { id: 'audit', label: 'Audit History', icon: 'history' },
];

// ─── Utility ───────────────────────────────────────────────────────────────────

function formatNum(n) { return n.toLocaleString(); }
function randomDelta(val, min, max, floor, ceil) {
    const next = val + Math.floor(Math.random() * (max - min + 1)) + min;
    return Math.min(ceil, Math.max(floor, next));
}
function now() { return new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' GMT'; }

function exportPDF(data, title = 'SehatAI System Report') {
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
    doc.save('sehatai_report.pdf');
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard({ onLogout, user }) {
    const [activeNav, setActiveNav] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [escalations, setEscalations] = useState(INITIAL_ESCALATIONS);
    const [agents, setAgents] = useState(INITIAL_AGENTS);
    const [patientCount, setPatientCount] = useState(1284);
    const [throughput, setThroughput] = useState(2400);
    const [throughputPct, setThroughputPct] = useState(84);
    const [patients, setPatients] = useState([]);
    const [staff, setStaff] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
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
    const [aiInsights, setAiInsights] = useState({}); // Stores inline AI insights for escalations
    // ── Profile page states (lifted to survive 3s re-renders) ─────────────────────
    const [profileNotifSms, setProfileNotifSms] = useState(true);
    const [profileNotifEmail, setProfileNotifEmail] = useState(false);
    const [profileNotifPush, setProfileNotifPush] = useState(true);
    const [profileEditMode, setProfileEditMode] = useState(false);
    const [profileRole, setProfileRole] = useState(user?.user_metadata?.role || 'Chief AI Architect');
    const [profileEmail, setProfileEmail] = useState(user?.email || 's.chen@st-jude.health.ai');
    const [profilePhone, setProfilePhone] = useState(user?.user_metadata?.phone || '+1 (555) 942-0192');
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
    const [isKeyRegistering, setIsKeyRegistering] = useState(false);
    
    // Auto-close sidebar on screen resize if needed, though CSS handles most of it
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // ── Real-time Escalations ───────────────────────────────────────────────────
    useEffect(() => {
        let subscription;
        const setupRealtime = async () => {
            const hospital = await hospitalService.getMyHospital();
            if (!hospital) return;

            subscription = hospitalService.subscribeToEscalations(hospital.id, (payload) => {
                const newEsc = payload.new;
                const formattedEsc = {
                    id: newEsc.id || `#PX-${Math.floor(Math.random() * 9000 + 1000)}`,
                    risk: newEsc.risk_description || newEsc.risk || 'Unknown Emergency',
                    agent: newEsc.agent || 'AI-Monitor',
                    time: new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' GMT',
                    severity: newEsc.escalation_severity || newEsc.severity || 'warning',
                    resolved: false
                };
                
                setEscalations(prev => [formattedEsc, ...prev]);
                showToast(`Incoming Alert: ${formattedEsc.risk}`, 'info');
                
                if (formattedEsc.severity === 'critical') {
                    const msg = new SpeechSynthesisUtterance(`Critical Alert: ${formattedEsc.risk}. Immediate review required.`);
                    window.speechSynthesis.speak(msg);
                }
            });
        };

        setupRealtime();
        return () => { if (subscription) subscription.unsubscribe(); };
    }, []);

    // ── Fetch Initial Data ──────────────────────────────────────────────────────
    const loadGlobalStats = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            if (!currentUser) return;

            let hospital = null;
            try {
                hospital = await hospitalService.getHospitalByAdmin(currentUser.id);
            } catch (hospErr) {
                console.warn('Could not fetch hospital:', hospErr.message);
            }

            if (hospital) {
                const [pList, sList, escList, auditLogs] = await Promise.allSettled([
                    patientService.getPatients(hospital.id),
                    hospitalService.getStaff(hospital.id),
                    hospitalService.getEscalations(hospital.id),
                    hospitalService.getAuditLogs(hospital.id)
                ]);

                const patients = pList.status === 'fulfilled' ? (pList.value || []) : [];
                const staffList = sList.status === 'fulfilled' ? (sList.value || []) : [];
                const escalationList = escList.status === 'fulfilled' ? (escList.value || []) : [];
                const auditList = auditLogs.status === 'fulfilled' ? (auditLogs.value || []) : [];

                setPatientCount(patients.length || INITIAL_PATIENT_COUNT);
                setStaff(staffList);

                setEscalations(escalationList.map(e => ({
                    id: e.id,
                    risk: e.risk_description || e.risk || 'Unknown Emergency',
                    agent: e.agent || 'AI-Monitor',
                    time: new Date(e.created_at).toLocaleTimeString() + ' GMT',
                    severity: e.escalation_severity || e.severity || 'warning',
                    resolved: e.resolved || false
                })));

                const newNotifs = auditList.map(log => ({
                    id: log.id,
                    icon: log.action === 'OVERRIDE' ? 'verified_user' : 'info',
                    color: log.action === 'OVERRIDE' ? '#10b77f' : '#6366f1',
                    text: `${log.action || 'Action'}: ${log.table_affected || ''} ${log.record_id || ''}`.trim(),
                    time: new Date(log.created_at || log.timestamp || Date.now()).toLocaleTimeString() + ' ago',
                    read: true
                }));
                if (newNotifs.length > 0) setNotifications(newNotifs);
            } else {
                // No hospital record yet — use defaults, show friendly state
                setPatientCount(INITIAL_PATIENT_COUNT);
            }

            // Fetch Chats (safe)
            try {
                const chatHistory = await chatService.getAdminChats(currentUser.id);
                if (chatHistory && chatHistory.length > 0) {
                    setAgentMessages(chatHistory.map(c => ({ role: c.role, text: c.text })));
                }
            } catch (chatErr) {
                console.warn('Chat fetch failed:', chatErr.message);
            }

        } catch (err) {
            console.error('Global fetch error:', err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadGlobalStats();
    }, []);

    const [agentMessages, setAgentMessages] = useState([
        { role: 'assistant', text: 'Hello Sarah. I am the SehatAI Admin Assistant. How can I help you manage the system today?' }
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
    const handleOverride = async (id) => {
        try {
            // Updated to use persistent write simulation
            await hospitalService.resolveEscalation(id, {
                resolved: true,
                resolved_at: new Date().toISOString(),
                resolved_by: 'Dr. Sarah Chen'
            });

            setEscalations(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
            setAuditLog(prev => [{ id, action: 'OVERRIDE', time: now(), user: user?.user_metadata?.full_name || 'System Admin' }, ...prev]);
            setOverrideModal(null);
            showToast(`Escalation ${id} overridden and resolved.`);
            setNotifications(prev => [{
                id: Date.now(), icon: 'check_circle', color: '#10b77f',
                text: `Escalation ${id} manually overridden by ${user?.user_metadata?.full_name || 'Admin'}.`, time: 'just now', read: false
            }, ...prev]);
        } catch (err) {
            console.error("Override error:", err);
            showToast("Failed to override escalation.", "error");
        }
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
        try { recognitionRef.current.start(); setIsListening(true); } catch (_) { }
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

            const user = await authService.getCurrentUser();
            if (user) {
                await Promise.all([
                    chatService.addAdminChat(user.id, 'human', text),
                    chatService.addAdminChat(user.id, 'assistant', response.output)
                ]);
            }

            setAgentMessages(prev => [...prev, { role: 'assistant', text: response.output }]);

            // ── Text-to-Speech (TTS) ──
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // Stop current speech if any
                // Clean up markdown characters so it sounds natural
                const cleanText = response.output.replace(/[*_#`]/g, '');
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = 'en-US';
                utterance.rate = 1.05; // Slightly faster for an uplifting tone
                utterance.pitch = 1.4; // Higher pitch for a sweeter sound
                utterance.volume = 1.0;

                // Try to grab a sweet, female voice if available
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v =>
                    v.name.includes('Samantha') || // macOS natural sweet voice
                    v.name.includes('Google UK English Female') ||
                    v.name.includes('Microsoft Zira') || // Windows high-pitch female
                    (v.lang.includes('en-') && v.name.includes('Female'))
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

    const handleAskAI = async (e) => {
        if (!agentExecutor) {
            showToast('AI Agent is booting up, please wait.', 'error');
            return;
        }
        setAiInsights(prev => ({ ...prev, [e.id]: { loading: true } }));
        try {
            const response = await agentExecutor.invoke({
                input: `Analyze the risk: "${e.risk}" for patient ${e.id} reported by ${e.agent} right now. Provide 3 extremely brief, actionable steps to resolve this. Keep it under 3 sentences.`,
                chat_history: []
            });
            setAiInsights(prev => ({ ...prev, [e.id]: { loading: false, text: response.output } }));
            setAuditLog(prev => [{ id: e.id, action: 'AI CRITICAL ANALYSIS', time: now(), user: 'LangChain Edge' }, ...prev]);
        } catch (error) {
            setAiInsights(prev => ({ ...prev, [e.id]: { loading: false, text: 'Error computing analysis.' } }));
        }
    };

    const dispatchBroadcast = (msg, dept) => {
        setAuditLog(prev => [{ id: `BRD-${Date.now()}`, action: 'EMERGENCY_BROADCAST', time: now(), user: profileEmail }, ...prev]);
        showToast(`Broadcast sent to ${dept.toUpperCase()}`);
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
            case 'security': 
                const auditEvents = [
                    { id: '#PX-9021-B', risk: 'Potential Contraindication', dotColor: '#f43f5e', agent: 'Agent-Rho (Drug Int.)', agentIcon: 'smart_toy', time: '2 min ago' },
                    { id: '#PX-8812-C', risk: 'Abnormal Vital Drift', dotColor: '#f97316', agent: 'Agent-Sigma (Vitals)', agentIcon: 'smart_toy', time: '14 min ago' },
                    { id: '#PX-1102-A', risk: 'Critical PII Access Log', dotColor: '#f43f5e', agent: 'Audit-Sentry-01', agentIcon: 'shield', time: '28 min ago' },
                ];
                const safetyAgents = [
                    { name: 'Risk Assessment', load: agents[0]?.load ?? 72 },
                    { name: 'Scheduler', load: agents[1]?.load ?? 15 },
                    { name: 'Drug Interaction', load: agents[2]?.load ?? 88 },
                    { name: 'Clinical Coding', load: agents[3]?.load ?? 45 },
                ];
                return <SecurityView 
                    auditEvents={auditEvents}
                    reviewedEvents={reviewedSecurityEvents}
                    setReviewedEvents={setReviewedSecurityEvents}
                    safetyAgents={safetyAgents}
                    securityScan={securityScan}
                    setSecurityScan={setSecurityScan}
                    patientCount={patientCount}
                    throughput={throughput}
                    throughputPct={throughputPct}
                    exportPDF={exportPDF}
                    showToast={showToast}
                    formatNum={formatNum}
                />;
            case 'profile': return <ProfileView />;
            case 'analytics': return <AnalyticsView />;
            case 'resources': return <ResourcesView />;
            case 'audit': return <AuditView liveLogs={auditLog} />;
            default: return <DashboardView />;
        }
    };

    // ─── NEW EXPANSION VIEWS (Placeholders) ───────────────────────────────────────
    // Placeholder functions removed. Components are now imported natively.

    // ─── DASHBOARD ────────────────────────────────────────────────────────────────
    function DashboardView() {
        return (
            <div className="p-8 space-y-8">
                <DashboardMetrics 
                    patientCount={patientCount} 
                    throughput={throughput} 
                    throughputPct={throughputPct} 
                    cloudDist={cloudDist} 
                    latencyData={latencyData} 
                    escalations={escalations} 
                    exportPDF={exportPDF} 
                    showToast={showToast} 
                />

                {/* Agent Performance */}
                <AgentPerformancePanel agents={agents} />

                {/* Escalations Table */}
                <EscalationsTable 
                    showAll={false}
                    activeEscalations={activeEscalations}
                    filteredEscalations={filteredEscalations}
                    criticalCount={criticalCount}
                    handleAskAI={handleAskAI}
                    aiInsights={aiInsights}
                    setOverrideModal={setOverrideModal}
                    handleOverride={handleOverride}
                />
            </div>
        );
    }






    // ─── Shared: Agent Performance Panel ─────────────────────────────────────────


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
                                exportPDF(genData, 'SehatAI System Status Report');
                                showToast('Report exported!');
                                setShowSettings(false);
                            }
                        },
                        { icon: 'lock_reset', label: 'Reset Token', action: () => { showToast('Session token rotated — sign-in link sent to your email.', 'info'); setShowSettings(false); } },
                        { icon: 'logout', label: 'Sign Out', action: () => { if (onLogout) onLogout(); else window.location.reload(); } },
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
        return <AdminProfileView 
            notifSms={profileNotifSms} setNotifSms={setProfileNotifSms}
            notifEmail={profileNotifEmail} setNotifEmail={setProfileNotifEmail}
            notifPush={profileNotifPush} setNotifPush={setProfileNotifPush}
            editMode={profileEditMode} setEditMode={setProfileEditMode}
            role={profileRole} setRole={setProfileRole}
            email={profileEmail} setEmail={setProfileEmail}
            phone={profilePhone} setPhone={setProfilePhone}
            twoFAEnabled={twoFAEnabled} setTwoFAEnabled={setTwoFAEnabled}
            showHardwareKeys={showHardwareKeys} setShowHardwareKeys={setShowHardwareKeys}
            hardwareKeys={hardwareKeys} setHardwareKeys={setHardwareKeys}
            revokedKeys={revokedKeys} setRevokedKeys={setRevokedKeys}
            isKeyRegistering={isKeyRegistering} setIsKeyRegistering={setIsKeyRegistering}
            iotServices={iotServices} setIotServices={setIotServices}
            showToast={showToast}
        />;
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
        
        @media (max-width: 1024px) {
            .mobile-sidebar { 
                position: fixed !important; 
                left: -240px !important; 
                height: 100vh !important;
                z-index: 1000 !important; 
                transition: left 0.3s ease !important;
                box-shadow: 20px 0 60px rgba(0,0,0,0.1);
            }
            .mobile-sidebar.open { left: 0 !important; }
            .mobile-overlay { 
                position: fixed; 
                inset: 0; 
                background: rgba(0,0,0,0.4); 
                backdrop-filter: blur(4px);
                z-index: 999; 
                display: none; 
            }
            .mobile-overlay.open { display: block; }
            .desktop-sidebar-hide { display: none !important; }
            .hamburger-btn { display: flex !important; }
        }
        .hamburger-btn { display: none; }
      `}</style>

            {/* Mobile Overlay */}
            <div 
                className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} 
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside 
                className={`mobile-sidebar ${isSidebarOpen ? 'open' : ''}`}
                style={{ width: 240, flexShrink: 0, background: 'white', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', zIndex: 20 }}
            >
                <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#10b77f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <span className="material-symbols-outlined">shield_with_heart</span>
                    </div>
                    <div>
                        <h1 style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>SehatAI</h1>
                        <p style={{ fontSize: 11, color: '#10b77f', fontWeight: 600, marginTop: 2 }}>Health Monitoring</p>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {NAV_ITEMS.map(item => {
                        const active = activeNav === item.id;
                        const hasBadge = item.id === 'audit' && criticalCount > 0;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveNav(item.id);
                                    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
                                }}
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
                        <button onClick={() => { if (onLogout) onLogout(); else window.location.reload(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} title="Sign out">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', background: '#f8fafc' }}>
                {/* Header */}
                <header style={{ height: 64, flexShrink: 0, borderBottom: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button 
                            className="hamburger-btn"
                            onClick={() => setIsSidebarOpen(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>menu</span>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                                {NAV_ITEMS.find(n => n.id === activeNav)?.label || 'System Pulse Overview'}
                            </h2>
                        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            {(
                                activeNav === 'dashboard' ? [['Analytics', 'analytics'], ['Reports', 'dashboard'], ['Audit Logs', 'audit']] :
                                    activeNav === 'patients' ? [['Overview', 'dashboard'], ['Analytics', 'analytics'], ['Audit Logs', 'audit']] :
                                        activeNav === 'analytics' ? [['Analytics', 'analytics'], ['Reports', 'dashboard'], ['Audit Logs', 'audit']] :
                                            activeNav === 'audit' ? [['Overview', 'dashboard'], ['Analytics', 'analytics'], ['Audit Logs', 'audit']] :
                                                activeNav === 'security' ? [['Analytics', 'analytics'], ['Reports', 'dashboard'], ['Audit Logs', 'audit']] :
                                                    [['Analytics', 'analytics'], ['Reports', 'dashboard'], ['Audit Logs', 'audit']]
                            ).map(([label, target]) => (
                                <button
                                    key={label}
                                    onClick={() => setActiveNav(target)}
                                    style={{ fontSize: 13, fontWeight: activeNav === target ? 700 : 500, color: activeNav === target ? '#10b77f' : '#64748b', border: 'none', background: 'none', cursor: 'pointer', padding: '2px 0', borderBottom: activeNav === target ? '2px solid #10b77f' : '2px solid transparent', transition: 'all 0.15s' }}
                                >{label}</button>
                            ))}
                        </nav>
                    </div>
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
            <AdminChatWidget
                isAgentOpen={isAgentOpen}
                setIsAgentOpen={setIsAgentOpen}
                agentMessages={agentMessages}
                isAgentTyping={isAgentTyping}
                agentInput={agentInput}
                setAgentInput={setAgentInput}
                isListening={isListening}
                setIsListening={setIsListening}
                recognitionRef={recognitionRef}
                voiceMode={voiceMode}
                toggleVoiceMode={toggleVoiceMode}
                handleAgentMessage={handleAgentMessage}
            />

            {overrideModal && <OverrideModal />}
            {showAdminProfile && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAdminProfile(false)}><div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: 32, borderRadius: 20 }}>Profile feature coming soon</div></div>}
            <Toast />
        </div>
    );
}
