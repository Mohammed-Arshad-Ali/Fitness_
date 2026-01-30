/**
 * VITA:ON Login API Route
 * 
 * Handles user authentication with single-device login enforcement.
 * When a user logs in from a new device, previous sessions are terminated.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
    findUserByEmail,
    verifyPassword,
    createSession,
    initializeDemoUser
} from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'vitaon-dev-jwt-secret-2026';

export async function POST(request: NextRequest) {
    try {
        // Ensure demo user is initialized
        await initializeDemoUser();

        const body = await request.json();
        const { email, password, deviceFingerprint } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'INVALID_INPUT', message: 'Email and password are required' }
                },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await findUserByEmail(email);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
                },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(user, password);

        if (!isValidPassword) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
                },
                { status: 401 }
            );
        }

        // Generate device ID (using fingerprint or generating new)
        const deviceId = deviceFingerprint || uuidv4();

        // Get device info from headers
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'Unknown';

        // Create session (this will automatically terminate any previous session - single-device enforcement)
        const session = await createSession({
            userId: user.id,
            deviceId,
            deviceInfo: { userAgent, ip, fingerprint: deviceFingerprint },
            expiresInDays: 7,
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                sessionId: session.id,
                deviceId,
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set('vitaon_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        console.log(`[AUTH] User ${user.email} logged in successfully`);

        // Return user data (without sensitive info)
        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    tier: user.tier,
                    mfaEnabled: user.mfaEnabled,
                    hipaaConsentGiven: user.hipaaConsentGiven,
                },
                session: {
                    id: session.id,
                    expiresAt: session.expiresAt.toISOString(),
                },
                message: 'Login successful',
            },
        });
    } catch (error) {
        console.error('[AUTH] Login error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'An error occurred during login' }
            },
            { status: 500 }
        );
    }
}
