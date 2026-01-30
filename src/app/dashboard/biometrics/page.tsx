'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Heart,
    Activity,
    Moon,
    Droplets,
    Thermometer,
    Wind,
    TrendingUp,
    TrendingDown,
    Clock,
    Calendar,
    Smartphone,
    Watch,
    RefreshCw
} from 'lucide-react';
import { Card, Badge, Button, ProgressRing } from '@/components/ui';
import { generateMockHeartRateData, generateMockGlucoseData, formatTime } from '@/lib/utils';

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

// Mock connected devices
const connectedDevices = [
    { name: 'Apple Watch Series 9', type: 'watch', status: 'connected', lastSync: '2 min ago' },
    { name: 'Oura Ring Gen 3', type: 'ring', status: 'connected', lastSync: '5 min ago' },
    { name: 'Dexcom G7', type: 'cgm', status: 'connected', lastSync: 'Real-time' },
];

// Mock biometric history
const biometricCards = [
    {
        title: 'Heart Rate',
        icon: Heart,
        color: 'red',
        current: 68,
        unit: 'bpm',
        stats: [
            { label: 'Resting', value: 52 },
            { label: 'Max Today', value: 156 },
            { label: 'Average', value: 72 },
        ],
        trend: 'stable' as const,
        chartData: generateMockHeartRateData(24),
    },
    {
        title: 'Heart Rate Variability',
        icon: Activity,
        color: 'purple',
        current: 58,
        unit: 'ms',
        stats: [
            { label: '7-day Avg', value: 54 },
            { label: 'Best', value: 72 },
            { label: 'Lowest', value: 38 },
        ],
        trend: 'up' as const,
        chartData: [],
    },
    {
        title: 'Blood Glucose',
        icon: Droplets,
        color: 'yellow',
        current: 95,
        unit: 'mg/dL',
        stats: [
            { label: 'Time in Range', value: '87%' },
            { label: 'Average', value: 102 },
            { label: 'Variability', value: 'Low' },
        ],
        trend: 'stable' as const,
        chartData: generateMockGlucoseData(24),
    },
    {
        title: 'Sleep Analysis',
        icon: Moon,
        color: 'indigo',
        current: 85,
        unit: 'score',
        stats: [
            { label: 'Duration', value: '7h 32m' },
            { label: 'Deep Sleep', value: '1h 48m' },
            { label: 'REM', value: '1h 24m' },
        ],
        trend: 'up' as const,
        chartData: [],
    },
    {
        title: 'Body Temperature',
        icon: Thermometer,
        color: 'orange',
        current: 98.2,
        unit: '°F',
        stats: [
            { label: 'Baseline', value: '98.4°F' },
            { label: 'Deviation', value: '-0.2°F' },
            { label: 'Trend', value: 'Normal' },
        ],
        trend: 'stable' as const,
        chartData: [],
    },
    {
        title: 'Respiratory Rate',
        icon: Wind,
        color: 'cyan',
        current: 14,
        unit: 'br/min',
        stats: [
            { label: 'Sleep Avg', value: 12 },
            { label: 'Active Avg', value: 18 },
            { label: 'Trend', value: 'Normal' },
        ],
        trend: 'stable' as const,
        chartData: [],
    },
];

const colorMap: Record<string, string> = {
    red: 'from-red-500/20 to-red-600/10',
    purple: 'from-purple-500/20 to-purple-600/10',
    yellow: 'from-yellow-500/20 to-yellow-600/10',
    indigo: 'from-indigo-500/20 to-indigo-600/10',
    orange: 'from-orange-500/20 to-orange-600/10',
    cyan: 'from-cyan-500/20 to-cyan-600/10',
};

const iconColorMap: Record<string, string> = {
    red: 'text-red-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-500',
    indigo: 'text-indigo-500',
    orange: 'text-orange-500',
    cyan: 'text-cyan-500',
};

export default function BiometricsPage() {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
    };

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
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Biometrics</h1>
                    <p className="text-surface-400 mt-1">Real-time health data from your connected devices</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Time Range Selector */}
                    <div className="flex rounded-xl bg-surface-800/50 p-1">
                        {(['24h', '7d', '30d', '90d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${timeRange === range
                                        ? 'bg-primary-500 text-white'
                                        : 'text-surface-400 hover:text-white'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="secondary"
                        leftIcon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
                        onClick={handleSync}
                    >
                        Sync
                    </Button>
                </div>
            </motion.div>

            {/* Connected Devices */}
            <motion.div variants={itemVariants}>
                <Card variant="glass" className="p-6">
                    <h3 className="font-semibold text-white mb-4">Connected Devices</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {connectedDevices.map((device, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                    {device.type === 'watch' && <Watch className="w-6 h-6 text-primary-400" />}
                                    {device.type === 'ring' && <Activity className="w-6 h-6 text-primary-400" />}
                                    {device.type === 'cgm' && <Droplets className="w-6 h-6 text-primary-400" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">{device.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-bio-green animate-pulse" />
                                        <span className="text-xs text-surface-400">{device.lastSync}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* Biometric Cards Grid */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biometricCards.map((metric, index) => (
                    <Card key={index} variant="gradient" className="p-6 hover:shadow-xl transition-shadow">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[metric.color]} flex items-center justify-center`}>
                                    <metric.icon className={`w-5 h-5 ${iconColorMap[metric.color]}`} />
                                </div>
                                <span className="font-medium text-white">{metric.title}</span>
                            </div>
                            {metric.trend === 'up' && <TrendingUp className="w-5 h-5 text-bio-green" />}
                            {metric.trend === 'down' && <TrendingDown className="w-5 h-5 text-bio-red" />}
                        </div>

                        {/* Current Value */}
                        <div className="mb-4">
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-display font-bold text-white">{metric.current}</span>
                                <span className="text-surface-500 mb-1">{metric.unit}</span>
                            </div>
                        </div>

                        {/* Mini Chart Placeholder */}
                        {metric.chartData.length > 0 && (
                            <div className="h-16 mb-4 flex items-end gap-0.5">
                                {metric.chartData.slice(-24).map((point, i) => {
                                    const height = ((point.value - 50) / 100) * 100;
                                    return (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-t bg-gradient-to-t ${colorMap[metric.color]} min-h-[4px]`}
                                            style={{ height: `${Math.max(10, Math.min(100, height))}%` }}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-surface-700/50">
                            {metric.stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-lg font-semibold text-white">{stat.value}</p>
                                    <p className="text-xs text-surface-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </motion.div>

            {/* Detailed Analysis Card */}
            <motion.div variants={itemVariants}>
                <Card variant="glass" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-white">Today&apos;s Biometric Summary</h3>
                        <Badge variant="success">All Metrics Normal</Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {/* Readiness Score */}
                        <div className="flex flex-col items-center p-4 rounded-xl bg-surface-800/50">
                            <ProgressRing
                                progress={82}
                                size={100}
                                strokeWidth={8}
                                color="#10b981"
                            >
                                <div className="text-center">
                                    <span className="text-2xl font-bold text-white">82</span>
                                    <span className="text-xs text-surface-400 block">Ready</span>
                                </div>
                            </ProgressRing>
                            <p className="mt-3 text-sm font-medium text-white">Readiness Score</p>
                        </div>

                        {/* Recovery */}
                        <div className="flex flex-col items-center p-4 rounded-xl bg-surface-800/50">
                            <ProgressRing
                                progress={78}
                                size={100}
                                strokeWidth={8}
                                color="#8b5cf6"
                            >
                                <div className="text-center">
                                    <span className="text-2xl font-bold text-white">78</span>
                                    <span className="text-xs text-surface-400 block">%</span>
                                </div>
                            </ProgressRing>
                            <p className="mt-3 text-sm font-medium text-white">Recovery</p>
                        </div>

                        {/* Sleep Quality */}
                        <div className="flex flex-col items-center p-4 rounded-xl bg-surface-800/50">
                            <ProgressRing
                                progress={85}
                                size={100}
                                strokeWidth={8}
                                color="#6366f1"
                            >
                                <div className="text-center">
                                    <span className="text-2xl font-bold text-white">85</span>
                                    <span className="text-xs text-surface-400 block">Score</span>
                                </div>
                            </ProgressRing>
                            <p className="mt-3 text-sm font-medium text-white">Sleep Quality</p>
                        </div>

                        {/* Strain */}
                        <div className="flex flex-col items-center p-4 rounded-xl bg-surface-800/50">
                            <ProgressRing
                                progress={62}
                                size={100}
                                strokeWidth={8}
                                color="#0ea5e9"
                            >
                                <div className="text-center">
                                    <span className="text-2xl font-bold text-white">12.4</span>
                                    <span className="text-xs text-surface-400 block">Strain</span>
                                </div>
                            </ProgressRing>
                            <p className="mt-3 text-sm font-medium text-white">Daily Strain</p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}
