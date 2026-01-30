/**
 * VITA:ON Signup API Route
 * 
 * Handles new user registration with validation.
 * Automatically logs in the user after successful registration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
    createUser,
    findUserByEmail,
    createSession,
    initializeDemoUser
} from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'vitaon-dev-jwt-secret-2026';

// Password validation
function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
}

// Email validation
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
    try {
        // Ensure demo user is initialized
        await initializeDemoUser();

        const body = await request.json();
        const { email, password, confirmPassword, firstName, lastName, acceptTerms, deviceFingerprint } = body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'INVALID_INPUT', message: 'All fields are required' }
                },
                { status: 400 }
            );
        }

        // Validate email format
        if (!validateEmail(email)) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email address' }
                },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' }
                },
                { status: 409 }
            );
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'WEAK_PASSWORD',
                        message: passwordValidation.errors.join('. ')
                    }
                },
                { status: 400 }
            );
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' }
                },
                { status: 400 }
            );
        }

        // Check terms acceptance
        if (!acceptTerms) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'TERMS_NOT_ACCEPTED', message: 'You must accept the terms and conditions' }
                },
                { status: 400 }
            );
        }

        // Create user
        const user = await createUser({
            email,
            password,
            firstName,
            lastName,
        });

        // Generate device ID
        const deviceId = deviceFingerprint || uuidv4();

        // Get device info
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'Unknown';

        // Create session (auto-login after signup)
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
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        console.log(`[AUTH] New user registered and logged in: ${user.email}`);

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
                message: 'Account created successfully',
            },
        });
    } catch (error: any) {
        console.error('[AUTH] Signup error:', error);

        // Handle duplicate email error
        if (error.message === 'Email already registered') {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' }
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'An error occurred during registration' }
            },
            { status: 500 }
        );
    }
}
