/**
 * VITA:ON In-Memory Database (Development)
 * 
 * This singleton pattern ensures the database survives Next.js hot reloads.
 * In production, replace with PostgreSQL/Prisma.
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// User type
export interface DBUser {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    tier: 'free' | 'essential' | 'protocol' | 'concierge';
    createdAt: Date;
    activeDeviceId: string | null;
    mfaEnabled: boolean;
    hipaaConsentGiven: boolean;
}

// Session type
export interface DBSession {
    id: string;
    userId: string;
    deviceId: string;
    deviceInfo: {
        userAgent?: string;
        ip?: string;
        fingerprint?: string;
    };
    createdAt: Date;
    expiresAt: Date;
    isActive: boolean;
}

// Database interface
interface Database {
    users: Map<string, DBUser>;
    sessions: Map<string, DBSession>;
    deviceSessionMap: Map<string, string>; // userId -> sessionId (for single-device enforcement)
    emailToUserId: Map<string, string>; // email -> userId lookup
    initialized: boolean;
}

// Global database instance (survives hot reloads)
const globalForDb = globalThis as unknown as {
    vitaonDb: Database | undefined;
};

function createDatabase(): Database {
    const db: Database = {
        users: new Map(),
        sessions: new Map(),
        deviceSessionMap: new Map(),
        emailToUserId: new Map(),
        initialized: false,
    };
    return db;
}

// Get or create database
export function getDatabase(): Database {
    if (!globalForDb.vitaonDb) {
        globalForDb.vitaonDb = createDatabase();
    }
    return globalForDb.vitaonDb;
}

// Initialize demo user
export async function initializeDemoUser(): Promise<void> {
    const db = getDatabase();

    if (db.initialized) {
        return;
    }

    // Check if demo user exists
    const existingDemoId = db.emailToUserId.get('demo@vitaon.ai');
    if (existingDemoId) {
        db.initialized = true;
        return;
    }

    // Create demo user
    const demoUserId = uuidv4();
    const passwordHash = await bcrypt.hash('Demo123!', 12);

    const demoUser: DBUser = {
        id: demoUserId,
        email: 'demo@vitaon.ai',
        passwordHash,
        firstName: 'Demo',
        lastName: 'User',
        tier: 'protocol',
        createdAt: new Date(),
        activeDeviceId: null,
        mfaEnabled: false,
        hipaaConsentGiven: true,
    };

    db.users.set(demoUserId, demoUser);
    db.emailToUserId.set('demo@vitaon.ai', demoUserId);
    db.initialized = true;

    console.log('[DB] Demo user initialized: demo@vitaon.ai / Demo123!');
}

// User operations
export async function createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}): Promise<DBUser> {
    const db = getDatabase();
    await initializeDemoUser();

    // Check if email exists
    if (db.emailToUserId.has(data.email.toLowerCase())) {
        throw new Error('Email already registered');
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user: DBUser = {
        id: userId,
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        tier: 'free',
        createdAt: new Date(),
        activeDeviceId: null,
        mfaEnabled: false,
        hipaaConsentGiven: true,
    };

    db.users.set(userId, user);
    db.emailToUserId.set(data.email.toLowerCase(), userId);

    console.log(`[DB] User created: ${user.email}`);
    return user;
}

export async function findUserByEmail(email: string): Promise<DBUser | null> {
    const db = getDatabase();
    await initializeDemoUser();

    const userId = db.emailToUserId.get(email.toLowerCase());
    if (!userId) return null;
    return db.users.get(userId) || null;
}

export async function findUserById(id: string): Promise<DBUser | null> {
    const db = getDatabase();
    await initializeDemoUser();
    return db.users.get(id) || null;
}

export async function verifyPassword(user: DBUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
}

export async function updateUser(userId: string, updates: Partial<DBUser>): Promise<DBUser | null> {
    const db = getDatabase();
    const user = db.users.get(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    db.users.set(userId, updatedUser);
    return updatedUser;
}

// Session operations
export async function createSession(data: {
    userId: string;
    deviceId: string;
    deviceInfo: DBSession['deviceInfo'];
    expiresInDays?: number;
}): Promise<DBSession> {
    const db = getDatabase();
    await initializeDemoUser();

    // SINGLE-DEVICE ENFORCEMENT: Invalidate any existing session for this user
    const existingSessionId = db.deviceSessionMap.get(data.userId);
    if (existingSessionId) {
        const existingSession = db.sessions.get(existingSessionId);
        if (existingSession) {
            existingSession.isActive = false;
            db.sessions.set(existingSessionId, existingSession);
            console.log(`[DB] Previous session ${existingSessionId} terminated for user ${data.userId}`);
        }
    }

    // Create new session
    const sessionId = uuidv4();
    const session: DBSession = {
        id: sessionId,
        userId: data.userId,
        deviceId: data.deviceId,
        deviceInfo: data.deviceInfo,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (data.expiresInDays || 7) * 24 * 60 * 60 * 1000),
        isActive: true,
    };

    db.sessions.set(sessionId, session);
    db.deviceSessionMap.set(data.userId, sessionId);

    // Update user's active device
    const user = db.users.get(data.userId);
    if (user) {
        user.activeDeviceId = data.deviceId;
        db.users.set(data.userId, user);
    }

    console.log(`[DB] Session ${sessionId} created for user ${data.userId}`);
    return session;
}

export async function findSessionById(sessionId: string): Promise<DBSession | null> {
    const db = getDatabase();
    await initializeDemoUser();
    return db.sessions.get(sessionId) || null;
}

export async function invalidateSession(sessionId: string): Promise<boolean> {
    const db = getDatabase();
    const session = db.sessions.get(sessionId);
    if (!session) return false;

    session.isActive = false;
    db.sessions.set(sessionId, session);

    // Remove from device session map
    if (db.deviceSessionMap.get(session.userId) === sessionId) {
        db.deviceSessionMap.delete(session.userId);
    }

    console.log(`[DB] Session ${sessionId} invalidated`);
    return true;
}

export async function isSessionValid(sessionId: string): Promise<{ valid: boolean; session?: DBSession; reason?: string }> {
    const db = getDatabase();
    await initializeDemoUser();

    const session = db.sessions.get(sessionId);

    if (!session) {
        return { valid: false, reason: 'Session not found' };
    }

    if (!session.isActive) {
        return { valid: false, reason: 'Session has been terminated (logged in from another device)' };
    }

    if (new Date() > session.expiresAt) {
        return { valid: false, reason: 'Session expired' };
    }

    // Check if this is still the active session for this user
    const activeSessionId = db.deviceSessionMap.get(session.userId);
    if (activeSessionId !== sessionId) {
        return { valid: false, reason: 'Session superseded by login from another device' };
    }

    return { valid: true, session };
}

// OAuth user creation (for Google/Apple sign-in)
export async function findOrCreateOAuthUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    provider: 'google' | 'apple';
    providerId: string;
}): Promise<DBUser> {
    const db = getDatabase();
    await initializeDemoUser();

    // Check if user exists
    const existingUserId = db.emailToUserId.get(data.email.toLowerCase());
    if (existingUserId) {
        const user = db.users.get(existingUserId);
        if (user) return user;
    }

    // Create new OAuth user (no password)
    const userId = uuidv4();
    const user: DBUser = {
        id: userId,
        email: data.email.toLowerCase(),
        passwordHash: '', // OAuth users don't have passwords
        firstName: data.firstName,
        lastName: data.lastName,
        tier: 'free',
        createdAt: new Date(),
        activeDeviceId: null,
        mfaEnabled: false,
        hipaaConsentGiven: true,
    };

    db.users.set(userId, user);
    db.emailToUserId.set(data.email.toLowerCase(), userId);

    console.log(`[DB] OAuth user created: ${user.email} via ${data.provider}`);
    return user;
}

// Get database stats (for debugging)
export function getDbStats(): { users: number; sessions: number; activeSessions: number } {
    const db = getDatabase();
    const activeSessions = Array.from(db.sessions.values()).filter(s => s.isActive).length;
    return {
        users: db.users.size,
        sessions: db.sessions.size,
        activeSessions,
    };
}
