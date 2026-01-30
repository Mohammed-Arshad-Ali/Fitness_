'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    Bell,
    Smartphone,
    CreditCard,
    Shield,
    Trash2,
    Eye,
    EyeOff,
    Check,
    ChevronRight,
    AlertTriangle,
    LogOut,
    Watch,
    Activity
} from 'lucide-react';
import { Card, Button, Input, Badge, Modal, Avatar } from '@/components/ui';
import { useAuthStore } from '@/store';
import { subscriptionTiers } from '@/lib/utils';

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

// Settings sections
const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeSection, setActiveSection] = useState('profile');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form states
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });

    const [notifications, setNotifications] = useState({
        protocolReminders: true,
        biometricAlerts: true,
        weeklyReports: true,
        productUpdates: false,
        marketingEmails: false,
    });

    const currentTier = subscriptionTiers[user?.tier || 'free'];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Settings</h1>
                <p className="text-surface-400 mt-1">Manage your account and preferences</p>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <Card variant="glass" className="p-2">
                        <nav className="space-y-1">
                            {settingsSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeSection === section.id
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                                        }`}
                                >
                                    <section.icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{section.label}</span>
                                </button>
                            ))}
                        </nav>
                    </Card>
                </motion.div>

                {/* Content Area */}
                <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <Card variant="glass" className="p-6">
                            <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-6 mb-8">
                                <Avatar
                                    fallback={`${user?.firstName} ${user?.lastName}`}
                                    size="xl"
                                />
                                <div>
                                    <Button variant="secondary" size="sm">Change Avatar</Button>
                                    <p className="text-xs text-surface-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                            </div>

                            {/* Profile Form */}
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <Input
                                    label="First Name"
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                />
                                <Input
                                    label="Last Name"
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                />
                                <Input
                                    type="email"
                                    label="Email Address"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="md:col-span-2"
                                />
                            </div>

                            <Button>Save Changes</Button>
                        </Card>
                    )}

                    {/* Security Section */}
                    {activeSection === 'security' && (
                        <>
                            <Card variant="glass" className="p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">Password</h2>
                                <div className="space-y-4 max-w-md">
                                    <Input type="password" label="Current Password" />
                                    <Input type="password" label="New Password" />
                                    <Input type="password" label="Confirm New Password" />
                                    <Button>Update Password</Button>
                                </div>
                            </Card>

                            <Card variant="glass" className="p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">Two-Factor Authentication</h2>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-surface-300">Add an extra layer of security to your account</p>
                                        <p className="text-sm text-surface-500 mt-1">Recommended for all users</p>
                                    </div>
                                    <Badge variant={user?.mfaEnabled ? 'success' : 'default'}>
                                        {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </div>
                                <Button variant="secondary" className="mt-4">
                                    {user?.mfaEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                                </Button>
                            </Card>

                            <Card variant="glass" className="p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">Active Sessions</h2>
                                <p className="text-surface-400 text-sm mb-4">
                                    <Smartphone className="w-4 h-4 inline mr-2" />
                                    Single device login is enforced. Only one session can be active at a time.
                                </p>

                                <div className="p-4 rounded-xl bg-surface-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                            <Smartphone className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Current Device</p>
                                            <p className="text-xs text-surface-500">Windows - Chrome • Active now</p>
                                        </div>
                                    </div>
                                    <Badge variant="success">Current</Badge>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <Card variant="glass" className="p-6">
                            <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>

                            <div className="space-y-4">
                                {[
                                    { key: 'protocolReminders', label: 'Protocol Reminders', desc: 'Get reminders before your scheduled protocols' },
                                    { key: 'biometricAlerts', label: 'Biometric Alerts', desc: 'Alerts when metrics are outside normal range' },
                                    { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly progress summaries' },
                                    { key: 'productUpdates', label: 'Product Updates', desc: 'News about new features and improvements' },
                                    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips, offers, and health insights' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50">
                                        <div>
                                            <p className="text-sm font-medium text-white">{item.label}</p>
                                            <p className="text-xs text-surface-500">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-primary-500' : 'bg-surface-600'
                                                }`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Devices Section */}
                    {activeSection === 'devices' && (
                        <Card variant="glass" className="p-6">
                            <h2 className="text-lg font-semibold text-white mb-6">Connected Devices</h2>

                            <div className="space-y-4">
                                {[
                                    { name: 'Apple Watch Series 9', type: 'watch', status: 'connected' },
                                    { name: 'Oura Ring Gen 3', type: 'ring', status: 'connected' },
                                    { name: 'Dexcom G7', type: 'cgm', status: 'connected' },
                                ].map((device, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                                {device.type === 'watch' && <Watch className="w-5 h-5 text-primary-400" />}
                                                {device.type === 'ring' && <Activity className="w-5 h-5 text-primary-400" />}
                                                {device.type === 'cgm' && <Activity className="w-5 h-5 text-primary-400" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{device.name}</p>
                                                <p className="text-xs text-surface-500">Last synced 5 min ago</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                            Disconnect
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button variant="secondary" className="mt-6">
                                Connect New Device
                            </Button>
                        </Card>
                    )}

                    {/* Billing Section */}
                    {activeSection === 'billing' && (
                        <>
                            <Card variant="glass" className="p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">Current Plan</h2>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-white capitalize">{user?.tier}</h3>
                                            <Badge variant="info">Current Plan</Badge>
                                        </div>
                                        <p className="text-surface-400 text-sm mt-1">
                                            ${currentTier.price}/month
                                        </p>
                                    </div>
                                    <Button variant="secondary">
                                        Upgrade Plan
                                    </Button>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-surface-400 mb-3">Plan Features</h4>
                                    <ul className="space-y-2">
                                        {currentTier.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm text-surface-300">
                                                <Check className="w-4 h-4 text-bio-green" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>

                            <Card variant="glass" className="p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">Payment Method</h2>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 rounded bg-surface-700 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-surface-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">•••• •••• •••• 4242</p>
                                            <p className="text-xs text-surface-500">Expires 12/26</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Update</Button>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* Privacy Section */}
                    {activeSection === 'privacy' && (
                        <>
                            <Card variant="glass" className="p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">Data & Privacy</h2>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-surface-800/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-white">HIPAA Consent</p>
                                            <Badge variant={user?.hipaaConsentGiven ? 'success' : 'warning'}>
                                                {user?.hipaaConsentGiven ? 'Granted' : 'Required'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-surface-500">
                                            Required for health data processing
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-surface-800/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-white">Export My Data</p>
                                                <p className="text-xs text-surface-500">Download all your health data</p>
                                            </div>
                                            <Button variant="secondary" size="sm">Export</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card variant="glass" className="p-6 border-red-500/20">
                                <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>

                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">Delete Account</p>
                                            <p className="text-xs text-surface-500">Permanently delete your account and all data</p>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Delete Account Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-400">This action is irreversible</p>
                                <p className="text-xs text-surface-400 mt-1">
                                    All your data including biometrics, protocols, and account information will be permanently deleted.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Input
                        label="Type 'DELETE' to confirm"
                        placeholder="DELETE"
                    />

                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button variant="danger" className="flex-1">
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
