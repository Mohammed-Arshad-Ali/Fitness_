/**
 * VITA:ON Logout API Route
 * 
 * Terminates the current session and clears cookies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { invalidateSession, initializeDemoUser } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'vitaon-dev-jwt-secret-2026';

export async function POST(request: NextRequest) {
    try {
        // Initialize demo user
        await initializeDemoUser();

        // Get session token
        const cookieStore = await cookies();
        const token = cookieStore.get('vitaon_session')?.value;

        if (token) {
            try {
                // Verify and decode JWT to get session ID
                const payload = jwt.verify(token, JWT_SECRET) as { sessionId: string };

                // Invalidate session in database
                await invalidateSession(payload.sessionId);

                console.log(`[AUTH] Session ${payload.sessionId} logged out`);
            } catch (error) {
                // Token might be expired or invalid, just proceed to clear cookie
                console.log('[AUTH] Token invalid during logout, clearing cookie');
            }
        }

        // Clear the session cookie
        cookieStore.delete('vitaon_session');

        return NextResponse.json({
            success: true,
            data: { message: 'Logged out successfully' },
        });
    } catch (error) {
        console.error('[AUTH] Logout error:', error);

        // Still try to clear the cookie even on error
        const cookieStore = await cookies();
        cookieStore.delete('vitaon_session');

        return NextResponse.json({
            success: true,
            data: { message: 'Logged out' },
        });
    }
}
