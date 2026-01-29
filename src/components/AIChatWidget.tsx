import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    aiProvider?: string;
    feedback?: {
        rating: number;
    };
}

export const AIChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize session
    useEffect(() => {
        const initSession = async () => {
            let sessionId = localStorage.getItem('support_session_id');
            if (!sessionId) {
                sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('support_session_id', sessionId);
            }

            // Get user ID from auth (if available)
            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : undefined;

            try {
                // Start or resume conversation
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/support/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, sessionId })
                });

                const data = await res.json();
                setConversationId(data.id);

                // Load history
                const historyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/support/history/${data.id}`);
                const history = await historyRes.json();

                setMessages(history.map((msg: any) => ({
                    ...msg,
                    role: msg.role === 'assistant' ? 'assistant' : 'user', // normalize role
                    timestamp: new Date(msg.timestamp)
                })));
            } catch (error) {
                console.error('Failed to init chat session:', error);
            }
        };

        if (isOpen && !conversationId) {
            initSession();
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !conversationId) return;

        const userMsg: Message = {
            id: `temp_${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setIsLoading(true);

        try {
            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : undefined;

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/support/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    message: userMsg.content,
                    userId
                })
            });

            const data = await res.json();

            const aiMsg: Message = {
                id: data.messageId, // Use real ID from backend
                role: 'assistant',
                content: data.content,
                timestamp: new Date(),
                aiProvider: data.provider
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, {
                id: `err_${Date.now()}`,
                role: 'assistant',
                content: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeedback = async (messageId: string, rating: number) => {
        try {
            // Find message to get real ID if possible, or we assume messageId is valid from DB reload
            // In this simple version, we might not have the DB ID for just-sent messages unless we reload or return it
            // For now, let's assume we can only rate loaded messages or valid IDs

            // Optimistic update
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, feedback: { rating } } : msg
            ));

            await fetch(`${import.meta.env.VITE_API_URL}/api/support/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, rating })
            });
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[380px] h-[600px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Suporte IA</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-gray-400">Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-8 space-y-2">
                                <Bot className="w-12 h-12 mx-auto opacity-50" />
                                <p>Olá! Como posso ajudar você hoje?</p>
                                <div className="flex flex-wrap justify-center gap-2 mt-4 px-4">
                                    {["Preços", "Como agendar?", "Integrações"].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setMessage(tag)}
                                            className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-slate-700 text-gray-300'
                                    }`}>
                                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div className={`group max-w-[80%] space-y-1`}>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-gray-200 border border-slate-700 rounded-tl-none'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>

                                    {/* Footer Info */}
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-gray-500 uppercase">
                                                {msg.aiProvider || 'AI'}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => !msg.id.startsWith('ai_') && handleFeedback(msg.id, 5)}
                                                    className={`hover:text-green-400 transition-colors ${msg.feedback?.rating === 5 ? 'text-green-400' : 'text-gray-600'}`}
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => !msg.id.startsWith('ai_') && handleFeedback(msg.id, 1)}
                                                    className={`hover:text-red-400 transition-colors ${msg.feedback?.rating === 1 ? 'text-red-400' : 'text-gray-600'}`}
                                                >
                                                    <ThumbsDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-none">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-slate-800 border-t border-slate-700">
                        <div className="relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Digite sua dúvida..."
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || isLoading}
                                className="absolute right-2 top-2 p-1.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${isOpen
                    ? 'bg-slate-700 rotate-90'
                    : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-110 animate-bounce-subtle'
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-7 h-7 text-white" />
                )}

                {/* Ping animation when closed */}
                {!isOpen && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-20 animate-ping" />
                )}
            </button>
        </div>
    );
};
