import { useEffect, useState } from "react";
import { subscribeCache } from "@/lib/cache";

/**
 * Subscribe a component to a cached public resource so it ALWAYS reflects the
 * latest server data.
 *
 * This fixes the "I published content but it doesn't show on the site" issue:
 * the SWR cache (lib/cache.js) returns stale data instantly for great UX, then
 * revalidates in the background. Previously list pages read the stale value once
 * and never reacted to the background refresh, so freshly published items stayed
 * hidden until several reloads.
 *
 * With this hook:
 *   • `ttl: 0` forces a background revalidation on every mount.
 *   • `onUpdate` + `subscribeCache` push the fresh data into component state the
 *     moment it lands — so new/edited/removed content appears within one round-trip.
 *
 * @param {string} cacheKey  the SWR cache key (e.g. "posts", "case_studies", "works:all")
 * @param {(opts) => Promise<any>} fetcher  a fetcher that accepts swrFetch opts
 * @returns the latest value (undefined while the very first fetch is in flight)
 */
export function useLiveData(cacheKey, fetcher) {
    const [data, setData] = useState(undefined);

    useEffect(() => {
        let mounted = true;
        const apply = (value) => {
            if (mounted) setData(value);
        };
        fetcher({ ttl: 0, onUpdate: apply })
            .then(apply)
            .catch(() => apply(null));
        const unsubscribe = subscribeCache(cacheKey, apply);
        return () => {
            mounted = false;
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey]);

    return data;
}
