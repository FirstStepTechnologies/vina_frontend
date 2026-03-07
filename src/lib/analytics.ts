/**
 * Analytics client for Vina.
 *
 * Usage:
 *   import { trackEvent } from '@/lib/analytics';
 *   await trackEvent('lesson_started', { lesson_id: 'l01', difficulty: 3 });
 *
 * Design decisions:
 *  - Fire-and-forget: all exceptions are caught so analytics NEVER breaks UX.
 *  - Uses the user's JWT from localStorage ('vina_token') for auth.
 *  - Skips silently when user is not authenticated (no token present).
 *  - Groups all events within the same browser tab session via `app_session_id`.
 */

import { getSessionId } from './session';

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "https://vina-backend-6snh.onrender.com/api/v1";

/**
 * Send a single analytics event to the backend.
 *
 * @param eventType - Event name, e.g. "lesson_started"
 * @param eventData - Arbitrary JSON-serialisable payload
 */
export async function trackEvent(
    eventType: string,
    eventData: Record<string, unknown> = {}
): Promise<void> {
    try {
        const token =
            typeof window !== 'undefined' ? localStorage.getItem('vina_token') : null;
        if (!token) return; // Don't track unauthenticated events

        await fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                event_type: eventType,
                event_data: eventData,
                app_session_id: getSessionId(),
            }),
        });
    } catch {
        // Silently swallow — analytics must never break UX
    }
}
