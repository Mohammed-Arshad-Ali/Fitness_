'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, Check, Shield } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/store';

export default function SignupPage() {
    const router = useRouter();
    const { setUser, setIsAuthenticated } = useAuthStore();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Password strength calculation
    const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
        if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
        return { score, label: 'Strong', color: 'bg-bio-green' };
    };

    const passwordStrength = calculatePasswordStrength(formData.password);

    // Form validation
    const validateForm = (): string | null => {
        if (!formData.firstName || !formData.lastName) {
            return 'First and last name are required';
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            return 'Please enter a valid email address';
        }
        if (formData.password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            return 'Passwords do not match';
        }
        if (!acceptTerms) {
            return 'You must accept the terms and privacy policy';
        }
        return null;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    acceptTerms,
                    deviceFingerprint: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.error?.message || 'Signup failed');
                setIsSubmitting(false);
                return;
            }

            // Set user in store
            setUser(data.data.user);
            setIsAuthenticated(true);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            console.error('Signup error:', err);
            setError('An error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Handle OAuth sign in
    const handleOAuthSignUp = async (provider: 'google' | 'apple') => {
        setError('');
        setIsSubmitting(true);

        try {
            // For demo purposes, we'll create a mock OAuth flow
            const mockUserData = {
                email: provider === 'google' ? `user${Date.now()}@gmail.com` : `user${Date.now()}@icloud.com`,
                firstName: provider === 'google' ? 'Google' : 'Apple',
                lastName: 'User',
                id: `${provider}-${Date.now()}`,
            };

            const response = await fetch('/api/auth/oauth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    userData: mockUserData,
                    deviceFingerprint: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.error?.message || `${provider} sign-up failed`);
                setIsSubmitting(false);
                return;
            }

            // Set user in store
            setUser(data.data.user);
            setIsAuthenticated(true);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            console.error('OAuth error:', err);
            setError('OAuth authentication failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Update form field
    const updateField = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-surface-950 flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-accent-900/50 via-surface-900 to-primary-900/50">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bio-green/10 rounded-full blur-3xl animate-float" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <Activity className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-display font-bold text-white tracking-tight">
                            VITA<span className="text-primary-400">:</span>ON
                        </span>
                    </Link>

                    {/* Center Content */}
                    <div className="space-y-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl font-display font-bold text-white leading-tight"
                        >
                            Create your
                            <span className="block bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                                Digital Twin
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-surface-300 max-w-md"
                        >
                            Join thousands of biohackers and health optimizers who use VITA:ON to unlock their peak performance every day.
                        </motion.p>
                    </div>

                    {/* Features */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                    >
                        {[
                            'Personalized AI health recommendations',
                            'Real-time biometric tracking',
                            'Science-backed protocols',
                            'HIPAA-compliant data security',
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-bio-green/20 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-bio-green" />
                                </div>
                                <span className="text-surface-300">{feature}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <Link href="/" className="flex lg:hidden items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-display font-bold text-white tracking-tight">
                            VITA<span className="text-primary-400">:</span>ON
                        </span>
                    </Link>

                    <Card variant="glass" className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-display font-bold text-white">Create Account</h2>
                            <p className="text-surface-400 mt-2">Start your optimization journey</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-400">{error}</p>
                            </motion.div>
                        )}

                        {/* Signup Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    leftIcon={<User className="w-5 h-5" />}
                                    value={formData.firstName}
                                    onChange={updateField('firstName')}
                                    required
                                    disabled={isSubmitting}
                                />
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={updateField('lastName')}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <Input
                                type="email"
                                label="Email"
                                placeholder="you@example.com"
                                leftIcon={<Mail className="w-5 h-5" />}
                                value={formData.email}
                                onChange={updateField('email')}
                                required
                                disabled={isSubmitting}
                            />

                            <div className="space-y-2">
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        label="Password"
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="w-5 h-5" />}
                                        value={formData.password}
                                        onChange={updateField('password')}
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-9 text-surface-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5, 6].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`flex-1 h-1 rounded-full transition-colors ${level <= passwordStrength.score ? passwordStrength.color : 'bg-surface-700'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs ${passwordStrength.label === 'Strong' ? 'text-bio-green' :
                                                passwordStrength.label === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                                            }`}>
                                            Password strength: {passwordStrength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    label="Confirm Password"
                                    placeholder="••••••••"
                                    leftIcon={<Lock className="w-5 h-5" />}
                                    value={formData.confirmPassword}
                                    onChange={updateField('confirmPassword')}
                                    required
                                    disabled={isSubmitting}
                                    error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-9 text-surface-400 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Terms Checkbox */}
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="w-5 h-5 mt-0.5 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-surface-400">
                                    I agree to the{' '}
                                    <Link href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</Link>
                                    ,{' '}
                                    <Link href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</Link>
                                    , and consent to health data processing under HIPAA guidelines.
                                </span>
                            </label>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={isSubmitting}
                                rightIcon={<ArrowRight className="w-5 h-5" />}
                            >
                                Create Account
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-surface-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-surface-900/80 text-surface-500">Or sign up with</span>
                            </div>
                        </div>

                        {/* OAuth Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleOAuthSignUp('google')}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-surface-700 bg-surface-800/50 hover:bg-surface-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-sm font-medium text-white">Google</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleOAuthSignUp('apple')}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-surface-700 bg-surface-800/50 hover:bg-surface-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <span className="text-sm font-medium text-white">Apple</span>
                            </button>
                        </div>

                        {/* Login Link */}
                        <p className="mt-8 text-center text-sm text-surface-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </Card>

                    {/* Security Note */}
                    <div className="mt-6 p-4 rounded-xl bg-surface-900/50 border border-surface-800/50">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-bio-green flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-surface-300">Your data is secure</p>
                                <p className="text-xs text-surface-500 mt-1">
                                    VITA:ON is HIPAA-compliant with end-to-end encryption. Your health data is never sold or shared without explicit consent.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
