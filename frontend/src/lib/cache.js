/**
 * Tiny in-memory + sessionStorage cache for public GET responses.
 *
 * Goal: mask Render free-tier cold starts (50s) without adding any heavy
 * dependency like React Query. The pattern is **stale-while-revalidate**:
 *
 *   1. If we have a cached value (in-memory or sessionStorage), return it
 *      IMMEDIATELY — the user sees content within a frame.
 *   2. In parallel, revalidate from the network. When it lands, update the
 *      cache and notify any subscribers so the UI can refresh quietly.
 *
 * Cold start path:
 *   - First visitor of the day: no cache → has to wait 50s. This is intrinsic
 *     to the Render free tier and can only be eliminated by paying or by an
 *     external keep-alive cron (see /backend/KEEP_ALIVE.md).
 *   - Every subsequent visit within the cache TTL: instant render.
 *   - If the server is sleeping again but we have stale cache: instant render
 *     with stale data + silent refresh in the background.
 *
 * sessionStorage is used so the cache survives full-page reloads within the
 * same tab (e.g. blog post → back to listing). It does NOT cross tabs by
 * design, which keeps memory usage predictable.
 */

const MEMORY_CACHE = new Map(); // key -> { value, fetchedAt }
const SUBSCRIBERS = new Map();  // key -> Set<fn>
const STORAGE_PREFIX = "mir_cache_v1::";

const DEFAULT_TTL_MS = 5 * 60 * 1000;       // 5 min: treat data as "fresh"
const MAX_STALE_MS = 60 * 60 * 1000;        // 60 min: drop stale data after this

function _readStorage(key) {
    try {
        const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.fetchedAt !== "number") return null;
        if (Date.now() - parsed.fetchedAt > MAX_STALE_MS) {
            sessionStorage.removeItem(STORAGE_PREFIX + key);
            return null;
        }
        return parsed;
    } catch (_e) { return null; }
}

function _writeStorage(key, entry) {
    try {
        sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch (_e) { /* quota / privacy mode → noop */ }
}

function _get(key) {
    return MEMORY_CACHE.get(key) || _readStorage(key);
}

function _set(key, value) {
    const entry = { value, fetchedAt: Date.now() };
    MEMORY_CACHE.set(key, entry);
    _writeStorage(key, entry);
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
 *   - Returns cached value immediately if available (any age up to MAX_STALE_MS).
 *   - Triggers background revalidation when data is older than ttl.
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
    try { sessionStorage.removeItem(STORAGE_PREFIX + key); } catch (_e) { /* noop */ }
}

/** Clear everything (e.g. on logout). */
export function clearCache() {
    MEMORY_CACHE.clear();
    try {
        Object.keys(sessionStorage)
            .filter((k) => k.startsWith(STORAGE_PREFIX))
            .forEach((k) => sessionStorage.removeItem(k));
    } catch (_e) { /* noop */ }
}
