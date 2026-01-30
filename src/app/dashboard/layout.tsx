'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Activity,
    LayoutDashboard,
    Heart,
    Target,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
    ChevronRight,
    Moon,
    Sun,
    User,
    CreditCard,
    HelpCircle,
    Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Badge, Button } from '@/components/ui';
import { useAuthStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';

// Navigation Items
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Heart, label: 'Biometrics', href: '/dashboard/biometrics' },
    { icon: Target, label: 'Protocols', href: '/dashboard/protocols' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, isLoading, setUser, logout, setSessionError } = useAuthStore();
    const { sidebarOpen, mobileMenuOpen, theme, setSidebarOpen, setMobileMenuOpen, setTheme } = useUIStore();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifications, setNotifications] = useState(3); // Mock notification count

    // Validate session on mount
    useEffect(() => {
        const validateSession = async () => {
            try {
                const response = await fetch('/api/auth/validate');
                const data = await response.json();

                if (!data.success) {
                    // Session invalid - possibly logged in from another device
                    setSessionError(data.error?.message || 'Session expired');
                    logout();
                    router.push('/login');
                    return;
                }

                setUser(data.data.user);
            } catch (error) {
                console.error('Session validation error:', error);
                logout();
                router.push('/login');
            }
        };

        validateSession();

        // Periodically check session validity (single-device enforcement)
        const interval = setInterval(validateSession, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
        logout();
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center animate-pulse">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-surface-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-950">
            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 bottom-0 z-50 w-64 bg-surface-900/95 backdrop-blur-xl border-r border-surface-800/50 transform transition-transform duration-300 lg:translate-x-0',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 p-6 border-b border-surface-800/50">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <span className="text-xl font-display font-bold tracking-tight text-white">
                        VITA<span className="text-primary-400">:</span>ON
                    </span>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="ml-auto lg:hidden p-2 text-surface-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    'sidebar-link',
                                    isActive && 'sidebar-link-active'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Upgrade Card */}
                {user?.tier === 'free' && (
                    <div className="absolute bottom-20 left-4 right-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30">
                            <h4 className="font-semibold text-white mb-1">Upgrade to Protocol</h4>
                            <p className="text-xs text-surface-400 mb-3">Unlock Digital Twin AI predictions</p>
                            <Button size="sm" className="w-full">Upgrade Now</Button>
                        </div>
                    </div>
                )}

                {/* User Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-800/50">
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Navigation */}
                <header className="sticky top-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
                    <div className="flex items-center justify-between h-16 px-4 lg:px-8">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 text-surface-400 hover:text-white lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Page Title */}
                        <div className="hidden lg:flex items-center gap-2 text-sm text-surface-400">
                            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
                            {pathname !== '/dashboard' && (
                                <>
                                    <ChevronRight className="w-4 h-4" />
                                    <span className="text-white capitalize">
                                        {pathname.split('/').pop()}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex-1 lg:hidden" />

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 text-surface-400 hover:text-white transition-colors"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Notifications */}
                            <button className="relative p-2 text-surface-400 hover:text-white transition-colors">
                                <Bell className="w-5 h-5" />
                                {notifications > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                                        {notifications}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-800/50 transition-colors"
                                >
                                    <Avatar
                                        fallback={user ? `${user.firstName} ${user.lastName}` : 'U'}
                                        size="sm"
                                    />
                                    <div className="hidden md:block text-left">
                                        <div className="text-sm font-medium text-white">
                                            {user?.firstName} {user?.lastName}
                                        </div>
                                        <div className="text-xs text-surface-400 capitalize flex items-center gap-1">
                                            <span>{user?.tier}</span>
                                            <Smartphone className="w-3 h-3" />
                                        </div>
                                    </div>
                                </button>

                                {/* User Dropdown */}
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-56 bg-surface-900 border border-surface-800 rounded-xl shadow-2xl overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-surface-800">
                                                <div className="font-medium text-white">
                                                    {user?.firstName} {user?.lastName}
                                                </div>
                                                <div className="text-sm text-surface-400">{user?.email}</div>
                                                <Badge variant="info" size="sm" className="mt-2 capitalize">
                                                    {user?.tier} Plan
                                                </Badge>
                                            </div>
                                            <div className="p-2">
                                                <Link
                                                    href="/dashboard/settings"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-surface-300 hover:bg-surface-800 rounded-lg transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Profile Settings
                                                </Link>
                                                <Link
                                                    href="/dashboard/settings"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-surface-300 hover:bg-surface-800 rounded-lg transition-colors"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Billing
                                                </Link>
                                                <Link
                                                    href="#"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-surface-300 hover:bg-surface-800 rounded-lg transition-colors"
                                                >
                                                    <HelpCircle className="w-4 h-4" />
                                                    Help & Support
                                                </Link>
                                            </div>
                                            <div className="p-2 border-t border-surface-800">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 px-3 py-2 w-full text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
