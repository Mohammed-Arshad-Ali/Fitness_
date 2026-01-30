// ==========================================
// VITA:ON - Authentication & Session Management
// Single Device Login Enforcement
// ==========================================

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User, Session, DeviceInfo } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'vitaon-super-secret-key-change-in-production';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============ In-Memory Store (Replace with DB in production) ============
interface UserStore extends Omit<User, 'createdAt' | 'updatedAt' | 'lastActiveAt'> {
    passwordHash: string;
    createdAt: string;
    updatedAt: string;
    lastActiveAt?: string;
}

// Simulated database - Replace with PostgreSQL in production
const usersDB: Map<string, UserStore> = new Map();
const sessionsDB: Map<string, Session> = new Map();
const deviceSessionMap: Map<string, string> = new Map(); // userId -> sessionId (enforces single device)

// ============ Password Utilities ============
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ============ Device Fingerprinting ============
export function generateDeviceFingerprint(userAgent: string, ip: string): string {
    // In production, use a more sophisticated fingerprinting library
    const fingerprint = `${userAgent}-${ip}`;
    return Buffer.from(fingerprint).toString('base64').slice(0, 32);
}

export function parseDeviceInfo(userAgent: string, ip: string): DeviceInfo {
    // Basic device parsing - enhance with ua-parser-js in production
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMobile = isIOS || isAndroid || /Mobile/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);

    let type: DeviceInfo['type'] = 'desktop';
    if (isTablet) type = 'tablet';
    else if (isMobile) type = 'mobile';

    let os = 'Unknown';
    if (isIOS) os = 'iOS';
    else if (isAndroid) os = 'Android';
    else if (/Windows/.test(userAgent)) os = 'Windows';
    else if (/Mac/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';

    let browser = 'Unknown';
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Edge/.test(userAgent)) browser = 'Edge';

    return {
        id: uuidv4(),
        name: `${os} - ${browser}`,
        type,
        os,
        browser,
        lastIp: ip,
        fingerprint: generateDeviceFingerprint(userAgent, ip),
    };
}

// ============ JWT Token Management ============
export function generateToken(userId: string, sessionId: string, deviceId: string): string {
    return jwt.sign(
        {
            userId,
            sessionId,
            deviceId,
            iat: Date.now()
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export function verifyToken(token: string): { userId: string; sessionId: string; deviceId: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            sessionId: string;
            deviceId: string
        };
        return decoded;
    } catch {
        return null;
    }
}

// ============ Session Management ============
export interface CreateSessionResult {
    success: boolean;
    session?: Session;
    token?: string;
    error?: string;
    previousSessionTerminated?: boolean;
}

export async function createSession(
    userId: string,
    deviceInfo: DeviceInfo
): Promise<CreateSessionResult> {
    // Check for existing active session (Single Device Enforcement)
    const existingSessionId = deviceSessionMap.get(userId);
    let previousSessionTerminated = false;

    if (existingSessionId) {
        const existingSession = sessionsDB.get(existingSessionId);
        if (existingSession && existingSession.isActive) {
            // Terminate the existing session
            existingSession.isActive = false;
            sessionsDB.set(existingSessionId, existingSession);
            previousSessionTerminated = true;
            console.log(`[AUTH] Previous session ${existingSessionId} terminated for user ${userId}`);
        }
    }

    // Create new session
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION);

    const session: Session = {
        id: sessionId,
        userId,
        deviceId: deviceInfo.id,
        deviceInfo,
        token: '', // Will be set below
        createdAt: now,
        expiresAt,
        isActive: true,
    };

    const token = generateToken(userId, sessionId, deviceInfo.id);
    session.token = token;

    // Store session and update device mapping
    sessionsDB.set(sessionId, session);
    deviceSessionMap.set(userId, sessionId);

    // Update user's active device
    const user = usersDB.get(userId);
    if (user) {
        user.activeDeviceId = deviceInfo.id;
        user.lastActiveAt = now.toISOString();
        usersDB.set(userId, user);
    }

    console.log(`[AUTH] New session ${sessionId} created for user ${userId}`);

    return {
        success: true,
        session,
        token,
        previousSessionTerminated,
    };
}

export async function validateSession(token: string): Promise<{ valid: boolean; user?: User; session?: Session }> {
    const decoded = verifyToken(token);

    if (!decoded) {
        return { valid: false };
    }

    const session = sessionsDB.get(decoded.sessionId);

    if (!session || !session.isActive) {
        return { valid: false };
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
        session.isActive = false;
        sessionsDB.set(decoded.sessionId, session);
        deviceSessionMap.delete(decoded.userId);
        return { valid: false };
    }

    // Verify this is still the active session for this user
    const currentActiveSessionId = deviceSessionMap.get(decoded.userId);
    if (currentActiveSessionId !== decoded.sessionId) {
        // This session was superseded by a login on another device
        return { valid: false };
    }

    const userStore = usersDB.get(decoded.userId);

    if (!userStore) {
        return { valid: false };
    }

    const user: User = {
        id: userStore.id,
        email: userStore.email,
        firstName: userStore.firstName,
        lastName: userStore.lastName,
        tier: userStore.tier,
        createdAt: new Date(userStore.createdAt),
        updatedAt: new Date(userStore.updatedAt),
        onboardingComplete: userStore.onboardingComplete,
        hipaaConsentGiven: userStore.hipaaConsentGiven,
        biometricLoginEnabled: userStore.biometricLoginEnabled,
        mfaEnabled: userStore.mfaEnabled,
        activeDeviceId: userStore.activeDeviceId,
        lastActiveAt: userStore.lastActiveAt ? new Date(userStore.lastActiveAt) : undefined,
    };

    return { valid: true, user, session };
}

export async function terminateSession(sessionId: string): Promise<boolean> {
    const session = sessionsDB.get(sessionId);

    if (!session) {
        return false;
    }

    session.isActive = false;
    sessionsDB.set(sessionId, session);

    // Clear the device session mapping if this was the active session
    const currentActiveSessionId = deviceSessionMap.get(session.userId);
    if (currentActiveSessionId === sessionId) {
        deviceSessionMap.delete(session.userId);
    }

    // Clear user's active device
    const user = usersDB.get(session.userId);
    if (user) {
        user.activeDeviceId = undefined;
        usersDB.set(session.userId, user);
    }

    console.log(`[AUTH] Session ${sessionId} terminated`);

    return true;
}

export async function terminateAllUserSessions(userId: string): Promise<void> {
    // Clear the device session mapping
    deviceSessionMap.delete(userId);

    // Find and deactivate all sessions for this user
    for (const [sessionId, session] of sessionsDB) {
        if (session.userId === userId) {
            session.isActive = false;
            sessionsDB.set(sessionId, session);
        }
    }

    console.log(`[AUTH] All sessions terminated for user ${userId}`);
}

// ============ User Management ============
export interface SignupData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface SignupResult {
    success: boolean;
    user?: User;
    error?: string;
}

export async function createUser(data: SignupData): Promise<SignupResult> {
    // Check if email already exists
    for (const user of usersDB.values()) {
        if (user.email.toLowerCase() === data.email.toLowerCase()) {
            return { success: false, error: 'Email already registered' };
        }
    }

    const userId = uuidv4();
    const now = new Date().toISOString();
    const passwordHash = await hashPassword(data.password);

    const userStore: UserStore = {
        id: userId,
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        tier: 'free',
        createdAt: now,
        updatedAt: now,
        onboardingComplete: false,
        hipaaConsentGiven: false,
        biometricLoginEnabled: false,
        mfaEnabled: false,
    };

    usersDB.set(userId, userStore);

    const user: User = {
        id: userId,
        email: userStore.email,
        firstName: userStore.firstName,
        lastName: userStore.lastName,
        tier: userStore.tier,
        createdAt: new Date(userStore.createdAt),
        updatedAt: new Date(userStore.updatedAt),
        onboardingComplete: userStore.onboardingComplete,
        hipaaConsentGiven: userStore.hipaaConsentGiven,
        biometricLoginEnabled: userStore.biometricLoginEnabled,
        mfaEnabled: userStore.mfaEnabled,
    };

    console.log(`[AUTH] New user created: ${userId}`);

    return { success: true, user };
}

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResult {
    success: boolean;
    user?: User;
    token?: string;
    session?: Session;
    error?: string;
    previousSessionTerminated?: boolean;
}

export async function loginUser(
    data: LoginData,
    deviceInfo: DeviceInfo
): Promise<LoginResult> {
    // Find user by email
    let foundUser: UserStore | undefined;

    for (const user of usersDB.values()) {
        if (user.email.toLowerCase() === data.email.toLowerCase()) {
            foundUser = user;
            break;
        }
    }

    if (!foundUser) {
        return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const passwordValid = await verifyPassword(data.password, foundUser.passwordHash);

    if (!passwordValid) {
        return { success: false, error: 'Invalid email or password' };
    }

    // Create session (this will terminate any existing session - Single Device Enforcement)
    const sessionResult = await createSession(foundUser.id, deviceInfo);

    if (!sessionResult.success) {
        return { success: false, error: sessionResult.error };
    }

    const user: User = {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        tier: foundUser.tier,
        createdAt: new Date(foundUser.createdAt),
        updatedAt: new Date(foundUser.updatedAt),
        onboardingComplete: foundUser.onboardingComplete,
        hipaaConsentGiven: foundUser.hipaaConsentGiven,
        biometricLoginEnabled: foundUser.biometricLoginEnabled,
        mfaEnabled: foundUser.mfaEnabled,
        activeDeviceId: deviceInfo.id,
        lastActiveAt: new Date(),
    };

    return {
        success: true,
        user,
        token: sessionResult.token,
        session: sessionResult.session,
        previousSessionTerminated: sessionResult.previousSessionTerminated,
    };
}

// ============ Demo User Initialization ============
export async function initializeDemoUser(): Promise<void> {
    // Check if demo user already exists
    for (const user of usersDB.values()) {
        if (user.email === 'demo@vitaon.ai') {
            return;
        }
    }

    await createUser({
        email: 'demo@vitaon.ai',
        password: 'Demo123!',
        firstName: 'Alex',
        lastName: 'Johnson',
    });

    console.log('[AUTH] Demo user initialized: demo@vitaon.ai / Demo123!');
}

// Initialize demo user on module load
initializeDemoUser();
