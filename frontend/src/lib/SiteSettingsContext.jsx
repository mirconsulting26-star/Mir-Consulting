import React from "react";
import { fetchSiteSettings } from "@/lib/api";

/**
 * SiteSettingsContext — caches the public `/api/site-settings` response in
 * memory for the lifetime of the SPA so individual pages (PublicInvoice,
 * Footer, lead-magnet form, etc.) don't each refetch on every navigation.
 *
 * The cache lives at module scope (not in React state) so a single in-flight
 * fetch is shared across consumers and navigations. `refresh()` invalidates
 * and re-fetches on demand.
 */

let cachedPromise = null;

function loadSettings() {
    if (!cachedPromise) {
        cachedPromise = fetchSiteSettings().catch((e) => {
            // On failure, drop the cache so the next consumer can retry.
            cachedPromise = null;
            throw e;
        });
    }
    return cachedPromise;
}

const SiteSettingsContext = React.createContext({
    settings: null,
    loading: true,
    error: null,
    refresh: () => Promise.resolve(null),
});

export function SiteSettingsProvider({ children }) {
    const [settings, setSettings] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const refresh = React.useCallback(async () => {
        cachedPromise = null;
        setLoading(true);
        try {
            const data = await loadSettings();
            setSettings(data);
            setError(null);
            return data;
        } catch (e) {
            setError(e);
            setSettings(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        let cancelled = false;
        loadSettings()
            .then((data) => {
                if (!cancelled) {
                    setSettings(data);
                    setLoading(false);
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setError(e);
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <SiteSettingsContext.Provider
            value={{ settings, loading, error, refresh }}
        >
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    return React.useContext(SiteSettingsContext);
}
