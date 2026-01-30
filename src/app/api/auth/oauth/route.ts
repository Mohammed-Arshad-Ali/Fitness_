/**
 * VITA:ON OAuth API Route
 * 
 * Handles Google and Apple OAuth authentication.
 * This route receives OAuth tokens and creates/finds users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
    findOrCreateOAuthUser,
    createSession,
    initializeDemoUser
} from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'vitaon-dev-jwt-secret-2026';

// Google OAuth verification (using Google's token info endpoint)
async function verifyGoogleToken(idToken: string): Promise<{
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
} | null> {
    try {
        // ============================================
        // PRODUCTION: Use Google's token verification
        // For now, we'll use a simulated verification
        // ============================================

        const response = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );

        if (!response.ok) {
            console.error('[OAUTH] Google token verification failed');
            return null;
        }

        const data = await response.json();

        return {
            email: data.email,
            firstName: data.given_name || '',
            lastName: data.family_name || '',
            googleId: data.sub,
        };
    } catch (error) {
        console.error('[OAUTH] Google verification error:', error);
        return null;
    }
}

// Apple OAuth verification
async function verifyAppleToken(idToken: string): Promise<{
    email: string;
    firstName: string;
    lastName: string;
    appleId: string;
} | null> {
    try {
        // ============================================
        // PRODUCTION: Use Apple's token verification
        // Apple tokens are JWTs that need to be verified
        // with Apple's public keys
        // ============================================

        // Decode Apple JWT (verification would require Apple's public keys)
        const parts = idToken.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        return {
            email: payload.email,
            firstName: payload.given_name || 'Apple',
            lastName: payload.family_name || 'User',
            appleId: payload.sub,
        };
    } catch (error) {
        console.error('[OAUTH] Apple verification error:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        await initializeDemoUser();

        const body = await request.json();
        const { provider, idToken, accessToken, userData, deviceFingerprint } = body;

        // Validate provider
        if (!provider || !['google', 'apple'].includes(provider)) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'INVALID_PROVIDER', message: 'Invalid OAuth provider' }
                },
                { status: 400 }
            );
        }

        let userInfo: { email: string; firstName: string; lastName: string; providerId: string } | null = null;

        // Process based on provider
        if (provider === 'google') {
            if (idToken) {
                // Verify real Google token
                const googleUser = await verifyGoogleToken(idToken);
                if (googleUser) {
                    userInfo = {
                        email: googleUser.email,
                        firstName: googleUser.firstName,
                        lastName: googleUser.lastName,
                        providerId: googleUser.googleId,
                    };
                }
            } else if (userData) {
                // Use provided user data (for demo/development)
                userInfo = {
                    email: userData.email,
                    firstName: userData.firstName || 'Google',
                    lastName: userData.lastName || 'User',
                    providerId: userData.id || uuidv4(),
                };
            }
        } else if (provider === 'apple') {
            if (idToken) {
                // Verify real Apple token
                const appleUser = await verifyAppleToken(idToken);
                if (appleUser) {
                    userInfo = {
                        email: appleUser.email,
                        firstName: appleUser.firstName,
                        lastName: appleUser.lastName,
                        providerId: appleUser.appleId,
                    };
                }
            } else if (userData) {
                // Use provided user data (for demo/development)
                userInfo = {
                    email: userData.email,
                    firstName: userData.firstName || 'Apple',
                    lastName: userData.lastName || 'User',
                    providerId: userData.id || uuidv4(),
                };
            }
        }

        // If no user info could be extracted
        if (!userInfo) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'OAUTH_FAILED', message: 'Could not authenticate with OAuth provider' }
                },
                { status: 401 }
            );
        }

        // Find or create user
        const user = await findOrCreateOAuthUser({
            email: userInfo.email,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            provider: provider as 'google' | 'apple',
            providerId: userInfo.providerId,
        });

        // Generate device ID
        const deviceId = deviceFingerprint || uuidv4();

        // Get device info
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'Unknown';

        // Create session (single-device enforcement applies)
        const session = await createSession({
            userId: user.id,
            deviceId,
            deviceInfo: { userAgent, ip, fingerprint: deviceFingerprint },
            expiresInDays: 7,
        });

        // Generate JWT
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

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('vitaon_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        console.log(`[OAUTH] User ${user.email} logged in via ${provider}`);

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
                message: `Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
            },
        });
    } catch (error) {
        console.error('[OAUTH] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'OAuth authentication failed' }
            },
            { status: 500 }
        );
    }
}
