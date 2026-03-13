import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Loader2, MessageCircle, Mic, MicOff, Image as ImageIcon, Paperclip } from 'lucide-react';

/**
 * Reusable AI Chat Component for SehatAI.
 * Supports Text, Voice (STT/TTS), and Image Uploads.
 */
export default function AIChat({ 
    agentExecutor, 
    initialMessage = "Hello! I am your SehatAI assistant. How can I help you today?",
    title = "SehatAI Assistant",
    themeColor = "#10b77f",
    welcomeTitle = "SehatAI Agentic Engine",
    showImageUpload = true
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: initialMessage, timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const recognitionRef = useRef(null);
    const voiceModeRef = useRef(false);
    const transcriptRef = useRef('');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Sync voiceModeRef
    useEffect(() => {
        voiceModeRef.current = voiceMode;
        if (!voiceMode) {
            recognitionRef.current?.stop();
            window.speechSynthesis?.cancel();
            setIsListening(false);
        }
    }, [voiceMode]);

    // Initialize Speech Recognition
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
            setInput(t);
            transcriptRef.current = t;
        };

        r.onend = () => {
            setIsListening(false);
            const captured = transcriptRef.current.trim();
            if (captured && voiceModeRef.current) {
                transcriptRef.current = '';
                setInput('');
                handleSend(captured);
            }
        };

        r.onerror = () => setIsListening(false);
        recognitionRef.current = r;
    }, [agentExecutor]); // Reinitalize if executor changes

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const startListening = () => {
        if (!recognitionRef.current) return;
        transcriptRef.current = '';
        setInput('');
        try { recognitionRef.current.start(); setIsListening(true); } catch (_) { }
    };

    const toggleVoiceMode = () => {
        if (voiceMode) {
            setVoiceMode(false);
        } else {
            if (!recognitionRef.current) return;
            setVoiceMode(true);
            setTimeout(() => startListening(), 300);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async (textOverride) => {
        const text = textOverride || input;
        if ((!text.trim() && !imagePreview) || isTyping) return;

        const userMsg = { role: 'human', text: text || "Analyzed attachment", timestamp: Date.now(), image: imagePreview };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        const currentImage = imagePreview;
        setImagePreview(null);
        setSelectedImage(null);

        setIsTyping(true);
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        try {
            const response = await agentExecutor.invoke({
                input: text,
                chat_history: messages.map(m => [m.role, m.text]).slice(-10),
                image_data: currentImage
            });

            const aiMsg = { role: 'assistant', text: response.output, timestamp: Date.now() };
            setMessages(prev => [...prev, aiMsg]);

            // TTS
            if ('speechSynthesis' in window && (voiceMode || textOverride)) {
                window.speechSynthesis.cancel();
                const cleanText = response.output.replace(/[*_#`]/g, '');
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = 'en-US';
                utterance.rate = 1.05;
                utterance.pitch = 1.2;

                utterance.onend = () => {
                    if (voiceModeRef.current) setTimeout(() => startListening(), 400);
                };
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${error.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
            {isOpen ? (
                <div style={{ width: 380, height: 550, background: 'white', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease-out' }}>
                    {/* Header */}
                    <div style={{ padding: '16px 20px', background: themeColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h4>
                                <span style={{ fontSize: 10, opacity: 0.8 }}>{welcomeTitle}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ alignSelf: msg.role === 'human' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                {msg.image && (
                                    <img src={msg.image} alt="Upload" style={{ width: '100%', borderRadius: 12, marginBottom: 8, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                )}
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: msg.role === 'human' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: msg.role === 'human' ? themeColor : 'white',
                                    color: msg.role === 'human' ? 'white' : '#334155',
                                    fontSize: 13.5,
                                    lineHeight: 1.6,
                                    boxShadow: msg.role === 'human' ? '0 4px 12px ' + themeColor + '30' : '0 2px 5px rgba(0,0,0,0.05)',
                                    border: msg.role === 'human' ? 'none' : '1px solid #e2e8f0'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', border: '1px solid #e2e8f0', display: 'flex', gap: 8, alignItems: 'center' }}>
                                <Loader2 size={16} className="animate-spin" style={{ color: themeColor }} />
                                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Image Preview Area */}
                    {imagePreview && (
                        <div style={{ padding: '8px 16px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={imagePreview} alt="Preview" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />

                            <span style={{ fontSize: 12, color: '#64748b', flex: 1 }}>Image ready for analysis</span>
                            <button onClick={() => {setImagePreview(null); setSelectedImage(null);}} style={{ color: '#ef4444' }}><X size={16}/></button>
                        </div>
                    )}

                    {/* Input */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        style={{ padding: 16, borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', gap: 10, alignItems: 'center' }}
                    >
                        {showImageUpload && (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ color: '#64748b', transition: 'color 0.2s' }}>

                                    <ImageIcon size={20} />
                                </button>
                            </>
                        )}
                        
                        <button
                            type="button"
                            onClick={toggleVoiceMode}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 36, height: 36, borderRadius: 18, border: 'none', cursor: 'pointer',
                                background: voiceMode ? '#fee2e2' : '#f1f5f9',
                                color: voiceMode ? '#dc2626' : '#64748b',
                                transition: 'all 0.2s'
                            }}
                        >
                            {voiceMode ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>

                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? 'Listening...' : 'Type a message...'}
                            style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: 13, outline: 'none', background: '#f8fafc' }}
                        />

                        <button
                            type="submit"
                            disabled={(!input.trim() && !imagePreview) || isTyping}
                            style={{ width: 40, height: 40, borderRadius: 12, background: themeColor, color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (!input.trim() && !imagePreview || isTyping) ? 0.5 : 1, transition: 'all 0.2s' }}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{ width: 60, height: 60, borderRadius: 30, background: themeColor, color: 'white', border: 'none', boxShadow: '0 10px 25px ' + themeColor + '40', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MessageCircle size={30} />
                </button>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
