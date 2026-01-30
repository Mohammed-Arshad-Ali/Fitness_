'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Target,
    Plus,
    Play,
    Pause,
    CheckCircle2,
    Clock,
    TrendingUp,
    Dumbbell,
    Apple,
    Moon,
    Brain,
    Snowflake,
    Wind,
    Pill,
    Settings2,
    MoreVertical,
    Flame,
    Calendar,
    DollarSign
} from 'lucide-react';
import { Card, Badge, Button, ProgressRing, Modal } from '@/components/ui';
import { formatPercentage, formatCurrency } from '@/lib/utils';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Protocol type icons
const protocolIcons: Record<string, React.ElementType> = {
    workout: Dumbbell,
    nutrition: Apple,
    sleep: Moon,
    meditation: Brain,
    cold_exposure: Snowflake,
    breathwork: Wind,
    supplement: Pill,
    fasting: Clock,
    custom: Settings2,
};

const protocolColors: Record<string, { bg: string; text: string }> = {
    workout: { bg: 'bg-red-500/20', text: 'text-red-500' },
    nutrition: { bg: 'bg-green-500/20', text: 'text-green-500' },
    sleep: { bg: 'bg-indigo-500/20', text: 'text-indigo-500' },
    meditation: { bg: 'bg-purple-500/20', text: 'text-purple-500' },
    cold_exposure: { bg: 'bg-cyan-500/20', text: 'text-cyan-500' },
    breathwork: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
    supplement: { bg: 'bg-orange-500/20', text: 'text-orange-500' },
    fasting: { bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
    custom: { bg: 'bg-surface-500/20', text: 'text-surface-400' },
};

// Mock active protocols
const mockProtocols = [
    {
        id: '1',
        name: 'Strength Training Program',
        description: '12-week progressive overload program',
        type: 'workout',
        status: 'active' as const,
        progress: 67,
        streakDays: 23,
        totalCompletions: 42,
        nextSession: '5:00 PM Today',
        commitmentDeposit: 50,
        schedule: 'Mon, Wed, Fri',
    },
    {
        id: '2',
        name: '16:8 Intermittent Fasting',
        description: 'Daily eating window 12pm - 8pm',
        type: 'fasting',
        status: 'active' as const,
        progress: 85,
        streakDays: 30,
        totalCompletions: 58,
        nextSession: 'Ends at 12:00 PM',
        commitmentDeposit: 25,
        schedule: 'Daily',
    },
    {
        id: '3',
        name: 'Sleep Optimization',
        description: 'Consistent bedtime routine',
        type: 'sleep',
        status: 'active' as const,
        progress: 72,
        streakDays: 14,
        totalCompletions: 28,
        nextSession: '10:00 PM',
        commitmentDeposit: 0,
        schedule: 'Daily',
    },
    {
        id: '4',
        name: 'Morning Meditation',
        description: '20 min guided mindfulness',
        type: 'meditation',
        status: 'paused' as const,
        progress: 45,
        streakDays: 0,
        totalCompletions: 15,
        nextSession: 'Paused',
        commitmentDeposit: 0,
        schedule: 'Daily',
    },
    {
        id: '5',
        name: 'Cold Exposure',
        description: '3 min cold shower protocol',
        type: 'cold_exposure',
        status: 'active' as const,
        progress: 38,
        streakDays: 7,
        totalCompletions: 12,
        nextSession: '6:30 AM Tomorrow',
        commitmentDeposit: 30,
        schedule: 'Mon, Wed, Fri, Sun',
    },
];

// Protocol templates for creating new ones
const protocolTemplates = [
    { type: 'workout', name: 'Strength Training', description: 'Build muscle and strength' },
    { type: 'nutrition', name: 'Clean Eating', description: 'Whole foods nutrition plan' },
    { type: 'fasting', name: 'Intermittent Fasting', description: 'Time-restricted eating' },
    { type: 'sleep', name: 'Sleep Protocol', description: 'Optimize sleep quality' },
    { type: 'meditation', name: 'Mindfulness', description: 'Daily meditation practice' },
    { type: 'cold_exposure', name: 'Cold Therapy', description: 'Cold exposure routine' },
    { type: 'breathwork', name: 'Breathing Exercises', description: 'Wim Hof or Box Breathing' },
    { type: 'supplement', name: 'Supplement Stack', description: 'Daily supplement routine' },
];

export default function ProtocolsPage() {
    const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
    const [showNewProtocolModal, setShowNewProtocolModal] = useState(false);

    const filteredProtocols = mockProtocols.filter(p => {
        if (filter === 'all') return true;
        return p.status === filter;
    });

    const activeCount = mockProtocols.filter(p => p.status === 'active').length;
    const totalCommitment = mockProtocols.reduce((sum, p) => sum + p.commitmentDeposit, 0);
    const avgProgress = Math.round(mockProtocols.reduce((sum, p) => sum + p.progress, 0) / mockProtocols.length);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Protocols</h1>
                    <p className="text-surface-400 mt-1">Manage your health optimization routines</p>
                </div>
                <Button
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowNewProtocolModal(true)}
                >
                    New Protocol
                </Button>
            </motion.div>

            {/* Stats Overview */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card variant="gradient" className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-display font-bold text-white">{activeCount}</p>
                            <p className="text-sm text-surface-400">Active Protocols</p>
                        </div>
                    </div>
                </Card>

                <Card variant="gradient" className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-display font-bold text-white">23</p>
                            <p className="text-sm text-surface-400">Day Streak</p>
                        </div>
                    </div>
                </Card>

                <Card variant="gradient" className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-display font-bold text-white">{avgProgress}%</p>
                            <p className="text-sm text-surface-400">Avg Progress</p>
                        </div>
                    </div>
                </Card>

                <Card variant="gradient" className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-accent-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-display font-bold text-white">{formatCurrency(totalCommitment)}</p>
                            <p className="text-sm text-surface-400">Committed</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div variants={itemVariants} className="flex gap-2">
                {(['all', 'active', 'paused', 'completed'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${filter === tab
                                ? 'bg-primary-500 text-white'
                                : 'bg-surface-800/50 text-surface-400 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </motion.div>

            {/* Protocols Grid */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                {filteredProtocols.map((protocol) => {
                    const Icon = protocolIcons[protocol.type] || Settings2;
                    const colors = protocolColors[protocol.type] || protocolColors.custom;

                    return (
                        <Card
                            key={protocol.id}
                            variant="glass"
                            className={`p-6 ${protocol.status === 'paused' ? 'opacity-70' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${colors.text}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{protocol.name}</h3>
                                        <p className="text-sm text-surface-400">{protocol.description}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <ProgressRing
                                    progress={protocol.progress}
                                    size={60}
                                    strokeWidth={6}
                                    color={protocol.status === 'active' ? '#10b981' : '#64748b'}
                                >
                                    <span className="text-sm font-bold text-white">{protocol.progress}%</span>
                                </ProgressRing>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-surface-400">Next session</span>
                                        <span className="text-white">{protocol.nextSession}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-surface-400">Schedule</span>
                                        <span className="text-white">{protocol.schedule}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm text-white">{protocol.streakDays} day streak</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-white">{protocol.totalCompletions} completed</span>
                                </div>
                            </div>

                            {protocol.commitmentDeposit > 0 && (
                                <div className="p-3 rounded-lg bg-accent-500/10 border border-accent-500/20 mb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-accent-400" />
                                            <span className="text-sm text-accent-300">Commitment Deposit</span>
                                        </div>
                                        <span className="text-sm font-semibold text-white">
                                            {formatCurrency(protocol.commitmentDeposit)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                {protocol.status === 'active' ? (
                                    <>
                                        <Button variant="primary" size="sm" leftIcon={<Play className="w-4 h-4" />} className="flex-1">
                                            Start Session
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Pause className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="secondary" size="sm" leftIcon={<Play className="w-4 h-4" />} className="flex-1">
                                        Resume Protocol
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </motion.div>

            {/* New Protocol Modal */}
            <Modal
                isOpen={showNewProtocolModal}
                onClose={() => setShowNewProtocolModal(false)}
                title="Create New Protocol"
                size="lg"
            >
                <div className="space-y-4">
                    <p className="text-surface-400">Choose a protocol template to get started</p>
                    <div className="grid grid-cols-2 gap-3">
                        {protocolTemplates.map((template, index) => {
                            const Icon = protocolIcons[template.type];
                            const colors = protocolColors[template.type];

                            return (
                                <button
                                    key={index}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 hover:border-primary-500/50 transition-colors text-left"
                                    onClick={() => setShowNewProtocolModal(false)}
                                >
                                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${colors.text}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{template.name}</p>
                                        <p className="text-xs text-surface-400">{template.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
