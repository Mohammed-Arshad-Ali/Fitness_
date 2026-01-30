'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, Check, Zap, Brain, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { DNAHelixLoader } from '@/components/3d/LiquidBiology';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Splash Screen Simulation
  useEffect(() => {
    // Simulate initial loading sequence
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500); // Slight delay after 100%
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <DNAHelixLoader progress={loadingProgress} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-surface-950 text-white overflow-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight">
                VITA<span className="text-primary-400">:</span>ON
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-surface-300">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="#tech" className="hover:text-white transition-colors">Technology</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-white hover:text-primary-400 transition-colors">
                Sign In
              </Link>
              <Link href="/signup">
                <Button size="sm" className="hidden md:flex">Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 center w-full h-[800px] bg-gradient-radial from-primary-900/40 to-transparent opacity-50" />
            <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-bio-green/10 rounded-full blur-3xl animate-float" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }} // Delay for after splash
              >
                <Badge variant="outline" className="mb-4 backdrop-blur-md bg-surface-900/50 border-primary-500/30">
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse mr-2" />
                  VITA:ON 2.0 Now Live
                </Badge>
                <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight">
                  Your Biological <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 animate-shimmer bg-[length:200%_100%]">
                    Operating System
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl md:text-2xl text-surface-300 max-w-2xl mx-auto leading-relaxed"
              >
                Unify fitness, nutrition, and recovery under one intelligent umbrella.
                Powered by a <span className="text-white font-semibold">Digital Twin AI</span> that learns from your biology.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/signup">
                  <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto">
                    Initialize System
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="xl" variant="secondary" className="w-full sm:w-auto">
                    View Demo Protocol
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-surface-900/50 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Complete Biological Integration</h2>
              <p className="text-surface-400 max-w-xl mx-auto">
                Stop managing your health in silos. VITA:ON connects every aspect of your physiology.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: 'Digital Twin AI',
                  desc: 'A personal biological simulation that predicts your energy levels 24 hours ahead.',
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10'
                },
                {
                  icon: Zap,
                  title: 'Smart Protocols',
                  desc: 'Workout and nutrition plans that adapt in real-time to your HRV and recovery.',
                  color: 'text-yellow-400',
                  bg: 'bg-yellow-500/10'
                },
                {
                  icon: Shield,
                  title: 'Single-Device Security',
                  desc: 'Bank-grade security with single-device enforcement to protect your biometric data.',
                  color: 'text-bio-green',
                  bg: 'bg-bio-green/10'
                }
              ].map((feature, i) => (
                <Card key={i} variant="glass" className="p-8 hover:bg-surface-800 transition-colors group">
                  <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-surface-400 leading-relaxed">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Select Your Protocol</h2>
              <p className="text-surface-400">Choose the level of biological optimization you need.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Essential */}
              <Card variant="glass" className="p-8 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-surface-300">Essential</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-display font-bold">$29</span>
                    <span className="text-surface-500">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Basic biometric tracking', 'Daily reminders', 'Weekly reports', 'Community access'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-surface-300">
                      <Check className="w-4 h-4 text-surface-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full">Start Essential</Button>
              </Card>

              {/* Protocol (Popular) */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-500 to-accent-500 rounded-3xl blur-xl opacity-20" />
                <Card variant="glass" className="p-8 flex flex-col relative border-primary-500/50 bg-surface-900/80">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-xs font-bold text-white uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white">Protocol</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-display font-bold text-white">$49</span>
                      <span className="text-surface-500">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {[
                      'Everything in Essential',
                      'Digital Twin AI Predictions',
                      'Real-time Interventions',
                      'Commitment Deposits',
                      'Unlimited Integrations'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-white">
                        <Check className="w-4 h-4 text-primary-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 border-none shadow-lg shadow-primary-900/20">
                    Join Protocol
                  </Button>
                </Card>
              </div>

              {/* Concierge */}
              <Card variant="glass" className="p-8 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-surface-300">Concierge</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-display font-bold">$199</span>
                    <span className="text-surface-500">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    'Everything in Protocol',
                    'Dedicated Health Coach',
                    'Quarterly Blood Panel Analysis',
                    'Custom Supplement Stack',
                    '24/7 Priority Support'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-surface-300">
                      <Check className="w-4 h-4 text-surface-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full">Apply for Concierge</Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-surface-800 bg-surface-950">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-surface-500" />
              <span className="text-lg font-display font-bold text-surface-300">VITA:ON</span>
            </div>
            <div className="text-sm text-surface-500">
              © 2026 VITA:ON Inc. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-surface-400">
              <Link href="#" className="hover:text-white">Privacy</Link>
              <Link href="#" className="hover:text-white">Terms</Link>
              <Link href="#" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
