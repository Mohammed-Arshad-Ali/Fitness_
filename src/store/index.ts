// ==========================================
// VITA:ON - Global State Management (Zustand)
// ==========================================

import { create } from 'zustand';
import type { User, BiometricSummary, Protocol, Notification } from '@/lib/types';

// ============ Auth Store ============
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    sessionError: string | null;

    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setSessionError: (error: string | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    sessionError: null,

    setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        sessionError: null,
    }),

    setLoading: (isLoading) => set({ isLoading }),

    setSessionError: (sessionError) => set({ sessionError }),

    logout: () => set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionError: null,
    }),
}));

// ============ Dashboard Store ============
interface DashboardState {
    biometrics: BiometricSummary | null;
    activeProtocols: Protocol[];
    notifications: Notification[];
    isLoadingBiometrics: boolean;
    isLoadingProtocols: boolean;

    setBiometrics: (biometrics: BiometricSummary | null) => void;
    setActiveProtocols: (protocols: Protocol[]) => void;
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    markNotificationRead: (id: string) => void;
    setLoadingBiometrics: (loading: boolean) => void;
    setLoadingProtocols: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    biometrics: null,
    activeProtocols: [],
    notifications: [],
    isLoadingBiometrics: true,
    isLoadingProtocols: true,

    setBiometrics: (biometrics) => set({ biometrics, isLoadingBiometrics: false }),

    setActiveProtocols: (activeProtocols) => set({ activeProtocols, isLoadingProtocols: false }),

    setNotifications: (notifications) => set({ notifications }),

    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
    })),

    markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
        ),
    })),

    setLoadingBiometrics: (isLoadingBiometrics) => set({ isLoadingBiometrics }),

    setLoadingProtocols: (isLoadingProtocols) => set({ isLoadingProtocols }),
}));

// ============ UI Store ============
interface UIState {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    mobileMenuOpen: boolean;
    modalOpen: string | null;

    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleMobileMenu: () => void;
    setMobileMenuOpen: (open: boolean) => void;
    openModal: (modal: string) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    theme: 'dark',
    sidebarOpen: true,
    mobileMenuOpen: false,
    modalOpen: null,

    setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
            if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    },

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

    toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

    setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

    openModal: (modalOpen) => set({ modalOpen }),

    closeModal: () => set({ modalOpen: null }),
}));
