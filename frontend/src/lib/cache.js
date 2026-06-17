/**
 * Lightweight in-memory stale-while-revalidate cache for public GET responses.
 *
 * IMPORTANT — why memory-only (no sessionStorage):
 *   Persisting lists to sessionStorage caused a recurring, hard-to-debug class
 *   of "I published content but the public site still shows the old list" bugs:
 *   a stale snapshot survived full-page reloads inside the tab and kept being
 *   served. Memory-only cache eliminates that entirely:
 *
 *     • Full page reload  → MEMORY_CACHE starts empty → ALWAYS fetches fresh.
 *     • In-session SPA nav → instant render from memory + background revalidate.
 *
 *   So listing pages can never get "stuck" on stale data across reloads, while
 *   navigation within a session stays snappy.
 *
 * Pattern: stale-while-revalidate.
 *   1. If we have a cached value in memory, return it immediately.
 *   2. In parallel, revalidate from the network when older than ttl. When fresh
 *      data lands, update the cache and notify subscribers so the UI refreshes.
 */

const MEMORY_CACHE = new Map(); // key -> { value, fetchedAt }
const SUBSCRIBERS = new Map();  // key -> Set<fn>

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 min: treat data as "fresh"

function _get(key) {
    return MEMORY_CACHE.get(key) || null;
}

function _set(key, value) {
    const entry = { value, fetchedAt: Date.now() };
    MEMORY_CACHE.set(key, entry);
    const subs = SUBSCRIBERS.get(key);
    if (subs) subs.forEach((fn) => { try { fn(value); } catch (_e) { /* noop */ } });
}

/**
 * SWR fetch wrapper.
 *
 * @param {string} key         Cache key, e.g. "posts" or "post:my-slug".
 * @param {() => Promise<any>} fetcher  Function that performs the real network call.
 * @param {object} [opts]      { ttl?: number, onUpdate?: (value) => void }
 * @returns {Promise<any>}     Resolves with cached-or-fresh value.
 *
 * Behaviour:
 *   - Returns cached value immediately if present and younger than ttl.
 *   - With ttl: 0 (used by listing pages via useLiveData) it always revalidates,
 *     so freshly published/edited/removed content shows on the next round-trip.
 *   - Calls opts.onUpdate(newValue) when revalidation finishes with new data.
 */
export async function swrFetch(key, fetcher, opts = {}) {
    const ttl = opts.ttl ?? DEFAULT_TTL_MS;
    const cached = _get(key);
    const now = Date.now();

    const refresh = async () => {
        try {
            const fresh = await fetcher();
            _set(key, fresh);
            if (opts.onUpdate) opts.onUpdate(fresh);
            return fresh;
        } catch (e) {
            // Network failed but we have cached data — keep using it.
            if (cached) return cached.value;
            throw e;
        }
    };

    if (cached && now - cached.fetchedAt < ttl) {
        // Fresh enough — no refetch.
        return cached.value;
    }
    if (cached) {
        // Stale-while-revalidate: return stale + refresh in background.
        refresh();
        return cached.value;
    }
    // No cache → must wait for network.
    return refresh();
}

/** Subscribe to background updates of a cache key. */
export function subscribeCache(key, fn) {
    if (!SUBSCRIBERS.has(key)) SUBSCRIBERS.set(key, new Set());
    SUBSCRIBERS.get(key).add(fn);
    return () => SUBSCRIBERS.get(key)?.delete(fn);
}

/** Manually invalidate a cache key (e.g. after admin mutation). */
export function invalidateCache(key) {
    MEMORY_CACHE.delete(key);
}

/** Clear everything (e.g. on logout). */
export function clearCache() {
    MEMORY_CACHE.clear();
}
