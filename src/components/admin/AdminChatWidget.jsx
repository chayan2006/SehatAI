import React from 'react';
import { Bot, X, Loader2, Mic, MicOff, Send, MessageCircle } from 'lucide-react';

export default function AdminChatWidget({
    isAgentOpen,
    setIsAgentOpen,
    agentMessages,
    isAgentTyping,
    agentInput,
    setAgentInput,
    isListening,
    setIsListening,
    recognitionRef,
    voiceMode,
    toggleVoiceMode,
    handleAgentMessage
}) {
    return (
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
                                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>SehatAI Assistant</h4>
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
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>SehatAI is thinking...</span>
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
                            placeholder={isListening ? 'Listening... speak now' : voiceMode ? 'Voice active — or type' : 'Ask SehatAI to do something...'}
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
    );
}
