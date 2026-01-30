'use client';

/**
 * VITA:ON Liquid Biology 3D Components
 * 
 * Living, breathing 3D interface components for the biological operating system.
 * These components create an immersive, spatial experience for biometric visualization.
 * 
 * Design Philosophy: "Organismic Glass" - The interface behaves like a living organism,
 * breathing with HRV, pulsing with heartbeat, morphing based on stress levels.
 * 
 * Color Palette:
 * - Cyan Plasma (#00f0ff) — Neural pathways, active thoughts
 * - Purple Genesis (#b829dd) — Protocol locked/commitment active  
 * - Emergent Green (#00ff9d) — Optimal biological state
 * - Crimson Warning (#ff3366) — Cortisol spike/glucose crash
 */

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    Float,
    MeshDistortMaterial,
    Sphere,
    Text,
    Html,
    Environment,
    ContactShadows,
    MeshTransmissionMaterial
} from '@react-three/drei';
import * as THREE from 'three';

// Color constants for Liquid Biology design
export const BIO_COLORS = {
    cyanPlasma: '#00f0ff',
    purpleGenesis: '#b829dd',
    emergentGreen: '#00ff9d',
    crimsonWarning: '#ff3366',
    deepVoid: '#0a0a1a',
    glassBase: '#1a1a2e',
};

// Types for biometric data
interface BiometricState {
    heartRate: number;
    hrv: number;
    glucose: number;
    sleepScore: number;
    recoveryScore: number;
    stressLevel: 'low' | 'moderate' | 'high';
}

// ============================================
// BIOMETRIC PARTICLES
// Floating data points representing live biometrics
// ============================================
interface ParticleFieldProps {
    count?: number;
    biometrics: Partial<BiometricState>;
}

function BiometricParticle({ position, color, scale, speed }: {
    position: [number, number, number];
    color: string;
    scale: number;
    speed: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const initialY = position[1];

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.5;
            meshRef.current.rotation.x += 0.01;
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <mesh ref={meshRef} position={position} scale={scale}>
            <icosahedronGeometry args={[0.1, 1]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
}

export function BiometricParticles({ count = 50, biometrics }: ParticleFieldProps) {
    const particles = useMemo(() => {
        const temp: { position: [number, number, number]; color: string; scale: number; speed: number }[] = [];

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 3 + Math.random() * 2;
            const height = (Math.random() - 0.5) * 4;

            // Determine color based on biometric state
            let color = BIO_COLORS.cyanPlasma;
            if (biometrics.stressLevel === 'high') {
                color = Math.random() > 0.5 ? BIO_COLORS.crimsonWarning : BIO_COLORS.purpleGenesis;
            } else if (biometrics.recoveryScore && biometrics.recoveryScore > 80) {
                color = BIO_COLORS.emergentGreen;
            }

            temp.push({
                position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
                color,
                scale: 0.5 + Math.random() * 0.5,
                speed: 0.5 + Math.random() * 0.5,
            });
        }
        return temp;
    }, [count, biometrics.stressLevel, biometrics.recoveryScore]);

    return (
        <group>
            {particles.map((particle, i) => (
                <BiometricParticle key={i} {...particle} />
            ))}
        </group>
    );
}

// ============================================
// DIGITAL TWIN AVATAR
// Central holographic representation of the user
// ============================================
interface DigitalTwinProps {
    heartRate?: number;
    hrv?: number;
    glucose?: number;
    recoveryScore?: number;
    stressLevel?: 'low' | 'moderate' | 'high';
    size?: number;
}

export function DigitalTwin({
    heartRate = 72,
    hrv = 55,
    glucose = 100,
    recoveryScore = 75,
    stressLevel = 'low',
    size = 1.5
}: DigitalTwinProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    // Calculate distortion based on biometrics
    const distortAmount = useMemo(() => {
        if (stressLevel === 'high') return 0.4;
        if (stressLevel === 'moderate') return 0.2;
        return 0.1;
    }, [stressLevel]);

    // Color based on state
    const twinColor = useMemo(() => {
        if (stressLevel === 'high') return BIO_COLORS.crimsonWarning;
        if (recoveryScore > 80) return BIO_COLORS.emergentGreen;
        return BIO_COLORS.cyanPlasma;
    }, [stressLevel, recoveryScore]);

    // Breathing animation synced to HRV
    const breathingSpeed = 0.4 + (hrv / 100) * 0.2;

    useFrame((state) => {
        if (meshRef.current) {
            // Breathing effect
            const breathScale = 1 + Math.sin(state.clock.elapsedTime * breathingSpeed) * 0.05;
            meshRef.current.scale.setScalar(size * breathScale);

            // Heartbeat pulse
            const heartbeatInterval = 60 / heartRate;
            const pulse = Math.sin(state.clock.elapsedTime * Math.PI * 2 / heartbeatInterval);
            if (pulse > 0.95) {
                meshRef.current.scale.multiplyScalar(1.02);
            }

            // Gentle rotation
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        }

        if (glowRef.current) {
            const glowPulse = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
            glowRef.current.scale.setScalar(size * 1.2 * glowPulse);
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
            <group>
                {/* Outer glow */}
                <mesh ref={glowRef} scale={size * 1.2}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial
                        color={twinColor}
                        transparent
                        opacity={0.1}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* Main Digital Twin sphere */}
                <mesh ref={meshRef} scale={size}>
                    <sphereGeometry args={[1, 64, 64]} />
                    <MeshDistortMaterial
                        color={twinColor}
                        distort={distortAmount}
                        speed={2}
                        transparent
                        opacity={0.9}
                        metalness={0.3}
                        roughness={0.2}
                    />
                </mesh>

                {/* Core energy */}
                <mesh scale={size * 0.4}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial color={twinColor} transparent opacity={0.8} />
                </mesh>

                {/* HRV indicator ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]} scale={size * 1.3}>
                    <torusGeometry args={[1, 0.02, 16, 100]} />
                    <meshBasicMaterial color={BIO_COLORS.cyanPlasma} transparent opacity={0.6} />
                </mesh>
            </group>
        </Float>
    );
}

// ============================================
// ORBITING DATA MOON
// Floating 3D widget showing a single biometric
// ============================================
interface OrbitingMoonProps {
    label: string;
    value: string | number;
    color: string;
    radius: number;
    speed: number;
    phase?: number;
    type: 'heart' | 'glucose' | 'sleep' | 'protocol';
}

function OrbitingMoon({ label, value, color, radius, speed, phase = 0, type }: OrbitingMoonProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (groupRef.current) {
            const angle = state.clock.elapsedTime * speed + phase;
            groupRef.current.position.x = Math.cos(angle) * radius;
            groupRef.current.position.z = Math.sin(angle) * radius;
            groupRef.current.position.y = Math.sin(angle * 2) * 0.3;
        }

        if (meshRef.current && type === 'heart') {
            // Heartbeat animation
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
            meshRef.current.scale.setScalar(0.4 * pulse);
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
                {/* Glass sphere */}
                <mesh ref={meshRef} scale={0.4}>
                    {type === 'sleep' ? (
                        <icosahedronGeometry args={[1, 2]} />
                    ) : type === 'protocol' ? (
                        <octahedronGeometry args={[1]} />
                    ) : (
                        <sphereGeometry args={[1, 32, 32]} />
                    )}
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.7}
                        metalness={0.5}
                        roughness={0.2}
                    />
                </mesh>

                {/* HTML Label */}
                <Html center distanceFactor={8}>
                    <div className="text-center pointer-events-none select-none">
                        <div className="text-2xl font-display font-bold" style={{ color }}>
                            {value}
                        </div>
                        <div className="text-xs text-surface-400 uppercase tracking-wider">
                            {label}
                        </div>
                    </div>
                </Html>
            </Float>
        </group>
    );
}

// ============================================
// ORBITAL SYSTEM
// Complete system of orbiting data moons
// ============================================
interface OrbitalSystemProps {
    heartRate?: number;
    glucose?: number;
    sleepScore?: number;
    protocolProgress?: number;
}

export function OrbitalSystem({
    heartRate = 72,
    glucose = 95,
    sleepScore = 85,
    protocolProgress = 40
}: OrbitalSystemProps) {
    return (
        <group>
            <OrbitingMoon
                label="BPM"
                value={heartRate}
                color={BIO_COLORS.crimsonWarning}
                radius={3}
                speed={0.3}
                phase={0}
                type="heart"
            />
            <OrbitingMoon
                label="mg/dL"
                value={glucose}
                color="#f59e0b"
                radius={3.5}
                speed={0.25}
                phase={Math.PI / 2}
                type="glucose"
            />
            <OrbitingMoon
                label="Sleep"
                value={sleepScore}
                color="#6366f1"
                radius={4}
                speed={0.2}
                phase={Math.PI}
                type="sleep"
            />
            <OrbitingMoon
                label="Protocol"
                value={`${protocolProgress}%`}
                color={BIO_COLORS.purpleGenesis}
                radius={4.5}
                speed={0.15}
                phase={Math.PI * 1.5}
                type="protocol"
            />
        </group>
    );
}

// ============================================
// CIRCADIAN RING
// 24-hour cycle visualization
// ============================================
interface CircadianRingProps {
    currentHour: number;
    events?: { hour: number; type: 'meal' | 'workout' | 'sleep' | 'protocol' }[];
}

export function CircadianRing({ currentHour = 12 }: CircadianRingProps) {
    const ringRef = useRef<THREE.Mesh>(null);

    // Calculate current position on the ring
    const currentAngle = (currentHour / 24) * Math.PI * 2 - Math.PI / 2;

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <group position={[0, 0, -2]}>
            {/* Main ring */}
            <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
                <torusGeometry args={[5, 0.1, 16, 100]} />
                <meshStandardMaterial
                    color={BIO_COLORS.cyanPlasma}
                    transparent
                    opacity={0.3}
                    emissive={BIO_COLORS.cyanPlasma}
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Current time indicator */}
            <mesh
                position={[
                    Math.cos(currentAngle) * 5,
                    Math.sin(currentAngle) * 5 * Math.cos(Math.PI / 4),
                    Math.sin(currentAngle) * 5 * Math.sin(Math.PI / 4) - 2
                ]}
            >
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color={BIO_COLORS.emergentGreen} />
            </mesh>
        </group>
    );
}

// ============================================
// LIVING GLASS CARD (BioCard)
// 3D floating glass panel for data display
// ============================================
interface BioCardProps {
    position?: [number, number, number];
    children: React.ReactNode;
    width?: number;
    height?: number;
}

export function BioCard({ position = [0, 0, 0], children, width = 2, height = 1.5 }: BioCardProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Subtle breathing effect
            const breath = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
            meshRef.current.scale.x = width * breath;
            meshRef.current.scale.y = height * breath;
        }
    });

    return (
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
            <group position={position}>
                {/* Glass background */}
                <mesh ref={meshRef}>
                    <planeGeometry args={[1, 1]} />
                    <meshPhysicalMaterial
                        color={BIO_COLORS.glassBase}
                        transparent
                        opacity={0.3}
                        roughness={0.1}
                        metalness={0.1}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                    />
                </mesh>

                {/* Border glow */}
                <mesh scale={[width * 1.02, height * 1.02, 1]} position={[0, 0, -0.01]}>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial
                        color={BIO_COLORS.cyanPlasma}
                        transparent
                        opacity={0.2}
                    />
                </mesh>

                {/* Content */}
                <Html center transform scale={0.3} position={[0, 0, 0.01]}>
                    {children}
                </Html>
            </group>
        </Float>
    );
}

// ============================================
// COMPLETE 3D SCENE
// Main scene wrapper for the Liquid Biology interface
// ============================================
interface LiquidBiologySceneProps {
    biometrics?: Partial<BiometricState>;
    showTwin?: boolean;
    showParticles?: boolean;
    showOrbit?: boolean;
    showRing?: boolean;
    className?: string;
}

export function LiquidBiologyScene({
    biometrics = {},
    showTwin = true,
    showParticles = true,
    showOrbit = true,
    showRing = true,
    className = '',
}: LiquidBiologySceneProps) {
    const currentHour = new Date().getHours();

    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    {/* Lighting */}
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} color={BIO_COLORS.cyanPlasma} intensity={0.5} />
                    <pointLight position={[-10, -10, -10]} color={BIO_COLORS.purpleGenesis} intensity={0.3} />
                    <spotLight position={[0, 10, 0]} color="#ffffff" intensity={0.4} angle={0.5} />

                    {/* Digital Twin */}
                    {showTwin && (
                        <DigitalTwin
                            heartRate={biometrics.heartRate}
                            hrv={biometrics.hrv}
                            glucose={biometrics.glucose}
                            recoveryScore={biometrics.recoveryScore}
                            stressLevel={biometrics.stressLevel}
                        />
                    )}

                    {/* Orbiting Data Moons */}
                    {showOrbit && (
                        <OrbitalSystem
                            heartRate={biometrics.heartRate}
                            glucose={biometrics.glucose}
                            sleepScore={biometrics.sleepScore}
                            protocolProgress={40}
                        />
                    )}

                    {/* Floating Particles */}
                    {showParticles && (
                        <BiometricParticles count={30} biometrics={biometrics} />
                    )}

                    {/* Circadian Ring */}
                    {showRing && (
                        <CircadianRing currentHour={currentHour} />
                    )}

                    {/* Environment & Shadow */}
                    <ContactShadows
                        position={[0, -2, 0]}
                        opacity={0.3}
                        blur={2}
                        far={4}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}

// ============================================
// DNA HELIX LOADING ANIMATION
// Genesis Portal - Splash screen animation
// ============================================
export function DNAHelixLoader({ progress = 0 }: { progress?: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Points>(null);

    // DNA helix particle positions
    const helixParticles = useMemo(() => {
        const positions = new Float32Array(20000 * 3);
        const colors = new Float32Array(20000 * 3);

        for (let i = 0; i < 20000; i++) {
            const t = (i / 20000) * Math.PI * 8;
            const radius = 0.8;

            // Double helix pattern
            const strand = i % 2;
            const angle = t + (strand * Math.PI);

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (i / 20000 - 0.5) * 5;
            positions[i * 3 + 2] = Math.sin(angle) * radius;

            // Alternating colors
            const color = new THREE.Color(strand === 0 ? BIO_COLORS.cyanPlasma : BIO_COLORS.purpleGenesis);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        return { positions, colors };
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.3} />
                    <pointLight position={[5, 5, 5]} color={BIO_COLORS.cyanPlasma} intensity={1} />

                    <group ref={groupRef}>
                        <points ref={particlesRef}>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    count={20000}
                                    array={helixParticles.positions}
                                    itemSize={3}
                                />
                                <bufferAttribute
                                    attach="attributes-color"
                                    count={20000}
                                    array={helixParticles.colors}
                                    itemSize={3}
                                />
                            </bufferGeometry>
                            <pointsMaterial
                                size={0.02}
                                vertexColors
                                transparent
                                opacity={0.8}
                                sizeAttenuation
                            />
                        </points>
                    </group>
                </Suspense>
            </Canvas>

            {/* Loading overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-display font-bold text-white mb-4">
                    VITA<span className="text-cyan-400">:</span>ON
                </div>
                <div className="text-surface-400 text-sm">Initializing Digital Twin...</div>
                <div className="mt-4 w-48 h-1 bg-surface-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default LiquidBiologyScene;
