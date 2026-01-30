// ==========================================
// VITA:ON - Utility Functions
// ==========================================

import { clsx, type ClassValue } from 'clsx';

// ============ Class Name Utilities ============
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

// ============ Date Formatting ============
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    });
}

export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(d);
}

// ============ Number Formatting ============
export function formatNumber(num: number, decimals = 0): string {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatPercentage(value: number, decimals = 0): string {
    return `${formatNumber(value, decimals)}%`;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

// ============ Biometric Utilities ============
export function getHeartRateZone(hr: number, maxHr = 190): { zone: number; name: string; color: string } {
    const percentage = (hr / maxHr) * 100;

    if (percentage < 50) return { zone: 1, name: 'Rest', color: '#94a3b8' };
    if (percentage < 60) return { zone: 2, name: 'Warm Up', color: '#3b82f6' };
    if (percentage < 70) return { zone: 3, name: 'Fat Burn', color: '#10b981' };
    if (percentage < 80) return { zone: 4, name: 'Cardio', color: '#f59e0b' };
    if (percentage < 90) return { zone: 5, name: 'Peak', color: '#ef4444' };
    return { zone: 6, name: 'Max', color: '#dc2626' };
}

export function getGlucoseStatus(value: number): { status: string; color: string; description: string } {
    if (value < 70) return {
        status: 'Low',
        color: '#ef4444',
        description: 'Blood sugar is low. Consider having a snack.'
    };
    if (value < 100) return {
        status: 'Optimal',
        color: '#10b981',
        description: 'Blood sugar is in the optimal range.'
    };
    if (value < 140) return {
        status: 'Elevated',
        color: '#f59e0b',
        description: 'Blood sugar is slightly elevated.'
    };
    return {
        status: 'High',
        color: '#ef4444',
        description: 'Blood sugar is high. Consider activity or hydration.'
    };
}

export function getHRVStatus(value: number): { status: string; color: string; grade: string } {
    if (value >= 65) return { status: 'Excellent', color: '#10b981', grade: 'A' };
    if (value >= 50) return { status: 'Good', color: '#3b82f6', grade: 'B' };
    if (value >= 35) return { status: 'Fair', color: '#f59e0b', grade: 'C' };
    return { status: 'Low', color: '#ef4444', grade: 'D' };
}

export function getSleepScoreGrade(score: number): { grade: string; label: string; color: string } {
    if (score >= 85) return { grade: 'A', label: 'Excellent', color: '#10b981' };
    if (score >= 70) return { grade: 'B', label: 'Good', color: '#3b82f6' };
    if (score >= 55) return { grade: 'C', label: 'Fair', color: '#f59e0b' };
    return { grade: 'D', label: 'Poor', color: '#ef4444' };
}

// ============ Validation ============
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain an uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain a lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain a number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain a special character');
    }

    return { valid: errors.length === 0, errors };
}

// ============ Data Simulation ============
export function generateMockHeartRateData(hours = 24): { time: string; value: number }[] {
    const data: { time: string; value: number }[] = [];
    const now = new Date();

    for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        const hour = time.getHours();

        // Simulate circadian rhythm
        let baseHR = 65;
        if (hour >= 0 && hour < 6) baseHR = 52; // Deep sleep
        else if (hour >= 6 && hour < 9) baseHR = 68; // Morning
        else if (hour >= 9 && hour < 12) baseHR = 75; // Active morning
        else if (hour >= 12 && hour < 14) baseHR = 72; // Post-lunch
        else if (hour >= 14 && hour < 18) baseHR = 78; // Afternoon
        else if (hour >= 18 && hour < 21) baseHR = 70; // Evening
        else baseHR = 62; // Night wind down

        const variation = Math.random() * 10 - 5;

        data.push({
            time: time.toISOString(),
            value: Math.round(baseHR + variation),
        });
    }

    return data;
}

export function generateMockGlucoseData(hours = 24): { time: string; value: number }[] {
    const data: { time: string; value: number }[] = [];
    const now = new Date();

    for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        const hour = time.getHours();

        // Simulate meal spikes
        let baseGlucose = 95;
        if (hour === 8) baseGlucose = 120; // Breakfast
        else if (hour === 9) baseGlucose = 105;
        else if (hour === 13) baseGlucose = 130; // Lunch
        else if (hour === 14) baseGlucose = 115;
        else if (hour === 19) baseGlucose = 125; // Dinner
        else if (hour === 20) baseGlucose = 110;
        else if (hour >= 0 && hour < 6) baseGlucose = 85; // Fasted

        const variation = Math.random() * 15 - 7.5;

        data.push({
            time: time.toISOString(),
            value: Math.round(baseGlucose + variation),
        });
    }

    return data;
}

// ============ Tier Information ============
export const subscriptionTiers = {
    free: {
        name: 'Free',
        price: 0,
        features: [
            'Basic biometric tracking',
            'Daily protocol reminders',
            'Weekly progress reports',
            'Community access',
        ],
    },
    essential: {
        name: 'Essential',
        price: 29,
        features: [
            'Everything in Free',
            'AI-powered recommendations',
            'Advanced analytics',
            'Device integrations (5)',
            'Priority support',
        ],
    },
    protocol: {
        name: 'Protocol',
        price: 49,
        features: [
            'Everything in Essential',
            'Digital Twin predictions',
            'Custom protocol builder',
            'Commitment deposits',
            'Real-time interventions',
            'Unlimited device integrations',
        ],
    },
    concierge: {
        name: 'Concierge',
        price: 199,
        features: [
            'Everything in Protocol',
            'Personal health coach',
            '24/7 support',
            'Quarterly health reviews',
            'Custom protocol design',
            'White-glove onboarding',
        ],
    },
};

// ============ Local Storage ============
export function getLocalStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;

    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

export function setLocalStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

export function removeLocalStorage(key: string): void {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}
