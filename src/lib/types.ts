// ==========================================
// VITA:ON - AI Biological Operating System
// Core Type Definitions
// ==========================================

// ============ User & Authentication ============
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    tier: SubscriptionTier;
    createdAt: Date;
    updatedAt: Date;
    onboardingComplete: boolean;
    hipaaConsentGiven: boolean;
    biometricLoginEnabled: boolean;
    mfaEnabled: boolean;
    activeDeviceId?: string; // Single device enforcement
    lastActiveAt?: Date;
}

export interface Session {
    id: string;
    userId: string;
    deviceId: string;
    deviceInfo: DeviceInfo;
    token: string;
    createdAt: Date;
    expiresAt: Date;
    isActive: boolean;
}

export interface DeviceInfo {
    id: string;
    name: string;
    type: 'mobile' | 'tablet' | 'desktop' | 'wearable';
    os: string;
    browser?: string;
    lastIp?: string;
    fingerprint: string;
}

export type SubscriptionTier = 'free' | 'essential' | 'protocol' | 'concierge';

export interface Subscription {
    tier: SubscriptionTier;
    price: number;
    features: string[];
    commitmentDeposit?: number;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
}

// ============ Biometrics ============
export interface BiometricReading {
    id: string;
    userId: string;
    type: BiometricType;
    value: number;
    unit: string;
    timestamp: Date;
    source: BiometricSource;
    quality?: number; // 0-100 signal quality
    metadata?: Record<string, unknown>;
}

export type BiometricType =
    | 'heart_rate'
    | 'heart_rate_variability'
    | 'blood_oxygen'
    | 'blood_glucose'
    | 'blood_pressure_systolic'
    | 'blood_pressure_diastolic'
    | 'body_temperature'
    | 'respiratory_rate'
    | 'steps'
    | 'calories_burned'
    | 'sleep_score'
    | 'sleep_duration'
    | 'deep_sleep_duration'
    | 'rem_sleep_duration'
    | 'recovery_score'
    | 'strain_score'
    | 'stress_level'
    | 'readiness_score'
    | 'energy_level'
    | 'hydration_level';

export type BiometricSource =
    | 'manual'
    | 'apple_health'
    | 'google_fit'
    | 'oura'
    | 'whoop'
    | 'dexcom'
    | 'fitbit'
    | 'garmin'
    | 'polar'
    | 'withings'
    | 'vital';

export interface BiometricSummary {
    heartRate: {
        current: number;
        resting: number;
        max: number;
        min: number;
        trend: 'up' | 'down' | 'stable';
    };
    hrv: {
        current: number;
        average: number;
        trend: 'up' | 'down' | 'stable';
    };
    glucose: {
        current: number;
        average: number;
        timeInRange: number;
        trend: 'up' | 'down' | 'stable';
    };
    sleep: {
        score: number;
        duration: number;
        deepSleep: number;
        remSleep: number;
        efficiency: number;
    };
    recovery: {
        score: number;
        strain: number;
        recommendation: string;
    };
    readiness: {
        score: number;
        factors: ReadinessFactor[];
    };
}

export interface ReadinessFactor {
    name: string;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
}

// ============ Digital Twin ============
export interface DigitalTwin {
    userId: string;
    lastUpdated: Date;
    predictions: TwinPrediction[];
    currentState: TwinState;
    recommendations: TwinRecommendation[];
}

export interface TwinState {
    energyLevel: number; // 0-100
    stressLevel: number; // 0-100
    recoveryStatus: number; // 0-100
    metabolicState: 'fasted' | 'fed' | 'post_absorptive' | 'ketogenic';
    circadianPhase: 'peak' | 'trough' | 'rising' | 'falling';
    cognitiveLoad: number; // 0-100
    physicalReadiness: number; // 0-100
}

export interface TwinPrediction {
    id: string;
    type: 'glucose' | 'energy' | 'sleep_quality' | 'performance' | 'stress';
    predictedValue: number;
    confidence: number; // 0-1
    timestamp: Date;
    horizon: number; // minutes into future
}

export interface TwinRecommendation {
    id: string;
    type: 'workout' | 'nutrition' | 'sleep' | 'stress' | 'recovery';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    timing: string;
    expectedImpact: {
        metric: string;
        improvement: number;
    };
}

// ============ Protocols ============
export interface Protocol {
    id: string;
    userId: string;
    name: string;
    description: string;
    type: ProtocolType;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    schedule: ProtocolSchedule[];
    progress: number; // 0-100
    commitmentDeposit?: number;
    streakDays: number;
    totalCompletions: number;
    missedDays: number;
}

export type ProtocolType =
    | 'workout'
    | 'nutrition'
    | 'sleep'
    | 'fasting'
    | 'meditation'
    | 'cold_exposure'
    | 'breathwork'
    | 'supplement'
    | 'custom';

export interface ProtocolSchedule {
    id: string;
    protocolId: string;
    dayOfWeek?: number; // 0-6
    time: string; // HH:mm
    duration: number; // minutes
    activity: ProtocolActivity;
    reminder: boolean;
    completed?: boolean;
    completedAt?: Date;
}

export interface ProtocolActivity {
    type: string;
    name: string;
    description?: string;
    instructions?: string[];
    targetMetrics?: {
        name: string;
        target: number;
        unit: string;
    }[];
}

// ============ Commitment System ============
export interface Commitment {
    id: string;
    userId: string;
    protocolId: string;
    amount: number;
    status: 'held' | 'returned' | 'forfeited' | 'partial_return';
    createdAt: Date;
    resolvedAt?: Date;
    resolution?: CommitmentResolution;
}

export interface CommitmentResolution {
    completionRate: number;
    amountReturned: number;
    amountForfeited: number;
    charityDonation?: {
        charity: string;
        amount: number;
    };
}

// ============ Notifications ============
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    read: boolean;
    createdAt: Date;
    actionUrl?: string;
    actionLabel?: string;
}

export type NotificationType =
    | 'protocol_reminder'
    | 'protocol_missed'
    | 'biometric_alert'
    | 'achievement'
    | 'insight'
    | 'recommendation'
    | 'system'
    | 'payment';

// ============ API Response Types ============
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

// ============ Dashboard ============
export interface DashboardData {
    user: User;
    biometricSummary: BiometricSummary;
    digitalTwin: DigitalTwin;
    activeProtocols: Protocol[];
    todaySchedule: ProtocolSchedule[];
    recentNotifications: Notification[];
    weeklyProgress: WeeklyProgress;
}

export interface WeeklyProgress {
    protocolCompletion: number;
    workoutsCompleted: number;
    sleepAverage: number;
    recoveryAverage: number;
    streakDays: number;
}
