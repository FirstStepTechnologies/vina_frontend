/**
 * Browser session ID utility.
 *
 * Generates a UUID once per browser tab session (stored in sessionStorage).
 * This groups all analytics events that occurred within the same login window,
 * enabling session-level analysis (e.g. session duration, event flow per session).
 *
 * Note: sessionStorage is cleared when the tab is closed, so a new session ID
 * is generated on each new tab or after a browser restart.
 */

let _cachedSessionId: string | null = null;

/**
 * Returns the current browser session ID, generating one if it doesn't exist.
 */
export function getSessionId(): string {
    if (typeof window === 'undefined') return 'ssr'; // SSR safety

    if (_cachedSessionId) return _cachedSessionId;

    const key = 'vina_session_id';
    let id = sessionStorage.getItem(key);
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(key, id);
    }
    _cachedSessionId = id;
    return id;
}

/**
 * Reset the session ID (call on logout to start a fresh session next login).
 */
export function resetSessionId(): void {
    if (typeof window === 'undefined') return;
    _cachedSessionId = null;
    sessionStorage.removeItem('vina_session_id');
}
