"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Plus,
    MessageSquare,
    Plane,
    Train,
    Bike,
    Car,
    Clock,
    DollarSign,
    Star,
    ArrowLeft,
    Sparkles,
    Loader2
} from "lucide-react";
import Link from "next/link";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    optimization?: {
        recommendation: string;
        metrics: {
            time: number;
            cost: number;
            comfort: number;
        };
        journey_params?: {
            origin: string;
            destination: string;
        };
    };
    timestamp: Date;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SUGGESTIONS = [
    { icon: "🛬", text: "How do I get from JFK to Manhattan?" },
    { icon: "💰", text: "What's the cheapest way from Newark to Brooklyn?" },
    { icon: "⏱️", text: "Fastest route from LaGuardia to Midtown?" },
    { icon: "🚂", text: "Should I take the train or Uber from EWR?" },
];

const getRecommendationIcon = (rec: string) => {
    switch (rec) {
        case "UBER_DIRECT": return <Car className="w-5 h-5" />;
        case "TRAIN+UBER": return <><Train className="w-5 h-5" /><Car className="w-4 h-4" /></>;
        case "TRAIN+BIKE": return <><Train className="w-5 h-5" /><Bike className="w-4 h-4" /></>;
        case "WAIT+TRAIN": return <><Clock className="w-5 h-5" /><Train className="w-4 h-4" /></>;
        default: return <Plane className="w-5 h-5" />;
    }
};

const formatRecommendation = (rec: string) => {
    switch (rec) {
        case "UBER_DIRECT": return "Uber Direct";
        case "TRAIN+UBER": return "Train + Uber";
        case "TRAIN+BIKE": return "Train + CitiBike";
        case "WAIT+TRAIN": return "Wait + Train";
        default: return rec;
    }
};

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation?.messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [activeConversation]);

    const createNewConversation = () => {
        const newConv: Conversation = {
            id: Date.now().toString(),
            title: "New conversation",
            messages: [],
            createdAt: new Date(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversation(newConv);
    };

    const sendMessage = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading) return;

        let currentConv = activeConversation;
        if (!currentConv) {
            const newConv: Conversation = {
                id: Date.now().toString(),
                title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
                messages: [],
                createdAt: new Date(),
            };
            setConversations((prev) => [newConv, ...prev]);
            currentConv = newConv;
            setActiveConversation(newConv);
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        const updatedMessages = [...currentConv.messages, userMessage];
        const updatedConv = { ...currentConv, messages: updatedMessages };
        setActiveConversation(updatedConv);
        setConversations((prev) =>
            prev.map((c) => (c.id === currentConv!.id ? updatedConv : c))
        );
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response,
                optimization: data.optimization,
                timestamp: new Date(),
            };

            const finalMessages = [...updatedMessages, assistantMessage];
            const finalConv = {
                ...currentConv,
                messages: finalMessages,
                title: currentConv.messages.length === 0 ? text.slice(0, 30) : currentConv.title
            };
            setActiveConversation(finalConv);
            setConversations((prev) =>
                prev.map((c) => (c.id === currentConv!.id ? finalConv : c))
            );
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I couldn't connect to the server. Make sure the backend is running on localhost:8000.",
                timestamp: new Date(),
            };
            const finalMessages = [...updatedMessages, errorMessage];
            const finalConv = { ...currentConv, messages: finalMessages };
            setActiveConversation(finalConv);
            setConversations((prev) =>
                prev.map((c) => (c.id === currentConv!.id ? finalConv : c))
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-screen chat-page">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="chat-sidebar flex flex-col overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/10">
                            <button
                                onClick={createNewConversation}
                                className="w-full glass hover:bg-white/10 rounded-xl p-3 flex items-center gap-3 transition-all duration-200"
                            >
                                <Plus className="w-5 h-5 text-emerald-500" />
                                <span className="font-medium">New Chat</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`w-full text-left p-3 rounded-xl mb-1 flex items-center gap-3 transition-all duration-200 ${activeConversation?.id === conv.id
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate text-sm">{conv.title}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 border-t border-white/10">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Link>
                            <div className="mt-3 text-xs text-white/30">
                                TravelMate • On-Device AI
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="glass border-b border-white/10 p-4 flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            ✈️
                        </div>
                        <div>
                            <h1 className="font-semibold">TravelMate</h1>
                            <p className="text-xs text-white/50">AI Travel Assistant</p>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!activeConversation || activeConversation.messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-4xl mb-6"
                            >
                                ✈️
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl font-bold mb-3"
                            >
                                How can I help you travel today?
                            </motion.h2>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-white/50 mb-8"
                            >
                                Ask me about optimal routes, cost comparisons, or travel recommendations
                            </motion.p>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
                            >
                                {SUGGESTIONS.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(suggestion.text)}
                                        className="glass hover:bg-white/10 p-4 rounded-xl text-left transition-all duration-200 group"
                                    >
                                        <span className="text-xl mr-2">{suggestion.icon}</span>
                                        <span className="text-sm text-white/70 group-hover:text-white">
                                            {suggestion.text}
                                        </span>
                                    </button>
                                ))}
                            </motion.div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {activeConversation.messages.map((message, idx) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${message.role === "assistant"
                                            ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                                            : "glass"
                                            }`}
                                    >
                                        {message.role === "assistant" ? "🤖" : "👤"}
                                    </div>

                                    <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                                        <div
                                            className={`inline-block p-4 rounded-2xl max-w-[85%] ${message.role === "user"
                                                ? "chat-message-user text-white"
                                                : "chat-message-ai"
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>

                                        {/* Optimization Card */}
                                        {message.optimization && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="mt-4 glass rounded-2xl p-5 max-w-md"
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center gap-1 text-teal-500">
                                                        {getRecommendationIcon(message.optimization.recommendation)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-white">
                                                            {formatRecommendation(message.optimization.recommendation)}
                                                        </div>
                                                        <div className="text-xs text-white/50">
                                                            Recommended Route
                                                        </div>
                                                    </div>
                                                    <Sparkles className="w-4 h-4 text-purple-400 ml-auto" />
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                                        <Clock className="w-4 h-4 text-teal-500 mx-auto mb-1" />
                                                        <div className="text-lg font-bold">
                                                            {Math.round(message.optimization.metrics.time)}
                                                        </div>
                                                        <div className="text-xs text-white/50">mins</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                                        <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                                                        <div className="text-lg font-bold">
                                                            ${message.optimization.metrics.cost}
                                                        </div>
                                                        <div className="text-xs text-white/50">cost</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                                        <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                                                        <div className="text-lg font-bold">
                                                            {message.optimization.metrics.comfort}/10
                                                        </div>
                                                        <div className="text-xs text-white/50">comfort</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                        🤖
                                    </div>
                                    <div className="chat-message-ai p-4 rounded-2xl">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-white/50 rounded-full typing-dot" />
                                            <span className="w-2 h-2 bg-white/50 rounded-full typing-dot" />
                                            <span className="w-2 h-2 bg-white/50 rounded-full typing-dot" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10">
                    <div className="max-w-3xl mx-auto">
                        <div className="glass rounded-2xl p-2 flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about travel routes..."
                                rows={1}
                                className="flex-1 bg-transparent border-none resize-none p-3 text-white placeholder:text-white/40 focus:outline-none max-h-32"
                                style={{ minHeight: "24px" }}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={isLoading || !input.trim()}
                                className={`p-3 rounded-xl transition-all duration-200 ${input.trim() && !isLoading
                                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90"
                                    : "bg-white/10 text-white/30"
                                    }`}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <p className="text-center text-xs text-white/30 mt-3">
                            TravelMate uses DQN + LLM • Runs entirely on-device
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
