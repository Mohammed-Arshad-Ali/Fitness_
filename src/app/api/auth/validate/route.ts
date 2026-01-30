/**
 * VITA:ON Session Validation API Route
 * 
 * Validates the current session and implements single-device enforcement.
 * Returns user data if session is valid.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { findUserById, isSessionValid, initializeDemoUser } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'vitaon-dev-jwt-secret-2026';

interface JWTPayload {
    userId: string;
    sessionId: string;
    deviceId: string;
    email: string;
    iat: number;
    exp: number;
}

export async function GET(request: NextRequest) {
    try {
        // Initialize demo user
        await initializeDemoUser();

        // Get session token from cookie
        const cookieStore = await cookies();
        const token = cookieStore.get('vitaon_session')?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NO_SESSION', message: 'No active session' }
                },
                { status: 401 }
            );
        }

        // Verify JWT
        let payload: JWTPayload;
        try {
            payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch (jwtError: any) {
            // Clear invalid cookie
            cookieStore.delete('vitaon_session');

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_TOKEN',
                        message: jwtError.name === 'TokenExpiredError'
                            ? 'Session expired. Please log in again.'
                            : 'Invalid session token'
                    }
                },
                { status: 401 }
            );
        }

        // Validate session in database (single-device enforcement check)
        const sessionCheck = await isSessionValid(payload.sessionId);

        if (!sessionCheck.valid) {
            // Clear the cookie since session is invalid
            cookieStore.delete('vitaon_session');

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'SESSION_INVALID',
                        message: sessionCheck.reason || 'Session is no longer valid',
                        // Specific flag for single-device logout detection
                        loggedOutFromOtherDevice: sessionCheck.reason?.includes('another device') || false,
                    }
                },
                { status: 401 }
            );
        }

        // Get user data
        const user = await findUserById(payload.userId);

        if (!user) {
            cookieStore.delete('vitaon_session');

            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'USER_NOT_FOUND', message: 'User account not found' }
                },
                { status: 401 }
            );
        }

        // Return valid session data
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
                    id: sessionCheck.session!.id,
                    deviceId: sessionCheck.session!.deviceId,
                    expiresAt: sessionCheck.session!.expiresAt.toISOString(),
                    isActive: true,
                },
            },
        });
    } catch (error) {
        console.error('[AUTH] Session validation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Error validating session' }
            },
            { status: 500 }
        );
    }
}
