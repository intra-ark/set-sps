"use client";

import { useState, useEffect, useRef } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AIAssistantProps {
    selectedLineId?: number;
}

export default function AIAssistant({ selectedLineId }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Merhaba! Ben Intra Arc, Ahmet Mersin tarafından geliştirilmiş ileri seviye düşünce sistemiyim. SET SPS, ürünleriniz veya analizler hakkında her şeyi sorabilirsiniz. 🚀'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pulse, setPulse] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Pulse animation every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(true);
            setTimeout(() => setPulse(false), 2000);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: messages.slice(1),
                    lineId: selectedLineId
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Hata: ${data.error || 'Yanıt alınamadı'}`
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Jarvis-Style Floating Orb */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 z-50 group"
                    aria-label="AI Assistant"
                >
                    {/* Outer glow rings */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-75 blur-xl ${pulse ? 'animate-ping' : ''}`}></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-50 blur-md animate-pulse"></div>

                    {/* Main orb */}
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-[2px] transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center relative overflow-hidden">
                            {/* Inner animated gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-600/20 animate-spin-slow"></div>

                            {/* Center AI core */}
                            <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                                <div className="w-4 h-4 rounded-full bg-white animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Premium Chat Window */}
            {isOpen && (
                <div className="fixed bottom-0 right-0 md:bottom-8 md:right-8 z-50 w-full md:w-[420px] h-[100dvh] md:h-[600px] rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border-t md:border border-cyan-500/30">
                    {/* Jarvis-Style Header */}
                    <div className="relative p-5 border-b border-cyan-500/30">
                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10"></div>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 animate-pulse opacity-50 blur-sm"></div>
                                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg tracking-wide">Intra Arc</h3>
                                    <p className="text-cyan-400 text-xs font-mono">İleri seviye düşünce sistemi</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                            >
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                                        : 'bg-gray-800/80 text-gray-100 border border-cyan-500/20 backdrop-blur-sm'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-gray-800/80 border border-cyan-500/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Premium Input */}
                    <div className="p-4 border-t border-cyan-500/30 bg-gray-900/50 backdrop-blur-sm">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 rounded-xl"></div>
                            <div className="relative flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Bir şey sorun..."
                                    className="flex-1 p-3 bg-gray-800/80 border border-cyan-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm backdrop-blur-sm transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transform hover:scale-105"
                                >
                                    <span className="material-icons-outlined text-lg">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-thumb-cyan-500\\/50::-webkit-scrollbar-thumb {
                    background-color: rgba(6, 182, 212, 0.5);
                    border-radius: 9999px;
                }
                .scrollbar-track-transparent::-webkit-scrollbar-track {
                    background-color: transparent;
                }
            `}</style>
        </>
    );
}
