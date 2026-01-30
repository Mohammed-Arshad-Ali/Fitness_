'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Brain,
    Wind,
    Play,
    CheckCircle2,
    Plus,
    Maximize2,
    Sparkles,
    MessageSquare
} from 'lucide-react';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { useAuthStore } from '@/store';
import LiquidBiologyScene from '@/components/3d/LiquidBiology';
import GeminiService from '@/lib/gemini';

// ============================================
// GEMINI PLACEHOLDER NOTE
// The Digital Twin AI features below use Gemini Flash 2.0.
// Make sure to set GEMINI_API_KEY in your .env.local file.
// ============================================

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [showAiChat, setShowAiChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isChatting, setIsChatting] = useState(false);

    // Biometric State
    const [biometrics, setBiometrics] = useState({
        heartRate: 72,
        hrv: 58,
        glucose: 98,
        sleepScore: 85,
        recoveryScore: 82,
        stressLevel: 'low' as 'low' | 'moderate' | 'high',
        steps: 8432,
        bodyTemperature: 98.2,
        respiratoryRate: 14,
    });

    // AI Predictions State
    const [aiPrediction, setAiPrediction] = useState<any>(null);

    // Load data and generate AI predictions
    useEffect(() => {
        const loadData = async () => {
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get AI predictions using Gemini
            // This will use the mock fallback if API key is missing
            const prediction = await GeminiService.generateDigitalTwinPredictions(biometrics);
            setAiPrediction(prediction);

            setIsLoading(false);
        };

        loadData();

        // Simulate real-time biometric updates
        const interval = setInterval(() => {
            setBiometrics(prev => ({
                ...prev,
                heartRate: 60 + Math.floor(Math.random() * 20),
                hrv: prev.hrv + (Math.random() - 0.5) * 5,
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Handle AI Chat
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const userMsg = chatMessage;
        setChatMessage('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsChatting(true);

        try {
            // Call Gemini for chat
            const response = await GeminiService.chatWithDigitalTwin(userMsg, biometrics, chatHistory);
            setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setIsChatting(false);
        }
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center bg-surface-950">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative z-10 w-full h-full rounded-full border-2 border-cyan-500/50 border-t-cyan-400 animate-spin" />
                    </div>
                    <h2 className="text-xl font-display font-medium text-white mb-2">Initializing Digital Twin</h2>
                    <p className="text-surface-400 text-sm">Syncing biological data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-80px)] overflow-hidden">
            {/* 
        3D LIQUID BIOLOGY SCENE 
        The core of the interface - a living, breathing spatial visualization 
      */}
            <div className="absolute inset-0 z-0">
                <LiquidBiologyScene
                    biometrics={biometrics}
                    showTwin={true}
                    showParticles={true}
                    showOrbit={true}
                    showRing={true}
                />
            </div>

            {/* 
        HUD OVERLAYS (Z-Layer +1)
        Floating UI elements on top of the 3D world
      */}

            {/* Top Left: Header & Status */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="pointer-events-auto"
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                        {greeting()}, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                            {user?.firstName}
                        </span>
                    </h1>

                    <div className="mt-4 flex items-center gap-3">
                        <Badge
                            variant={biometrics.stressLevel === 'high' ? 'danger' : 'success'}
                            className="backdrop-blur-md bg-surface-900/40 border-surface-700/50"
                        >
                            <div className={`w-2 h-2 rounded-full mr-2 ${biometrics.stressLevel === 'high' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                                }`} />
                            System Status: {biometrics.stressLevel === 'high' ? 'Elevated Stress' : 'Optimal'}
                        </Badge>

                        <Badge variant="info" className="backdrop-blur-md bg-surface-900/40 border-surface-700/50">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Active
                        </Badge>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Left: Digital Twin Insights */}
            <div className="absolute bottom-8 left-4 z-10 w-full max-w-sm pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="pointer-events-auto"
                >
                    <Card variant="glass" className="p-5 backdrop-blur-xl bg-surface-950/60 border-surface-800/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-purple-400" />
                            <h3 className="font-semibold text-white">Digital Twin Forecast</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Energy Prediction */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-surface-300">Projected Energy (24h)</span>
                                    <span className="text-white font-medium">{aiPrediction?.energyLevel}%</span>
                                </div>
                                <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${aiPrediction?.energyLevel}%` }}
                                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Recommendation */}
                            {aiPrediction?.recommendations?.[0] && (
                                <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                                    <div className="flex gap-2">
                                        <Zap className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-surface-200 leading-relaxed">
                                            {aiPrediction.recommendations[0]}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Trigger */}
                        <Button
                            size="sm"
                            variant="secondary"
                            className="w-full mt-4 bg-surface-800/80 hover:bg-surface-700"
                            leftIcon={<MessageSquare className="w-4 h-4" />}
                            onClick={() => setShowAiChat(true)}
                        >
                            Talk to your Twin
                        </Button>
                    </Card>
                </motion.div>
            </div>

            {/* Right Side: Active Protocols (Floating Stack) */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 flex flex-col gap-4 pointer-events-none">
                <div className="pointer-events-auto">
                    {['Morning Workout', 'Deep Work', 'Circadian Reset'].map((protocol, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                            className="mb-4"
                        >
                            <div
                                className="group relative w-64 p-4 rounded-xl bg-surface-950/40 backdrop-blur-md border border-surface-700/30 hover:bg-surface-900/60 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden"
                            >
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" size="sm" className="bg-surface-900/50 border-surface-700">
                                        {i === 0 ? 'Active Now' : 'Upcoming'}
                                    </Badge>
                                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                </div>

                                <h4 className="font-medium text-white mb-1">{protocol}</h4>
                                <div className="flex items-center text-xs text-surface-400 gap-2">
                                    <Wind className="w-3 h-3" />
                                    <span>Protocol Tier</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="flex justify-end"
                    >
                        <Button
                            size="sm"
                            className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-purple-500/20"
                        >
                            <Plus className="w-6 h-6 text-white" />
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* AI Chat Modal */}
            <Modal
                isOpen={showAiChat}
                onClose={() => setShowAiChat(false)}
                title="Neural Link: Digital Twin"
                size="lg"
            >
                <div className="h-[400px] flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-surface-900/50 mb-4">
                        {chatHistory.length === 0 && (
                            <div className="text-center text-surface-400 py-8">
                                <Brain className="w-12 h-12 mx-auto mb-3 text-surface-600" />
                                <p>Establishing neural link...</p>
                                <p className="text-sm mt-2">Ask me about your recovery, energy, or protocols.</p>
                            </div>
                        )}

                        {chatHistory.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-primary-600 text-white rounded-tr-sm'
                                            : 'bg-surface-800 text-surface-200 rounded-tl-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isChatting && (
                            <div className="flex justify-start">
                                <div className="bg-surface-800 p-3 rounded-2xl rounded-tl-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-surface-500 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-surface-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-2 h-2 bg-surface-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Ask your Digital Twin..."
                            className="flex-1 bg-surface-800 border-none rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-cyan-500 placeholder-surface-500"
                        />
                        <Button type="submit" disabled={!chatMessage.trim() || isChatting}>
                            Send
                        </Button>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
