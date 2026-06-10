import React from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageview } from "@/lib/analytics";

/**
 * Mount inside <BrowserRouter>. Fires a pageview to GA4 and Clarity on every
 * SPA route change (since React Router doesn't trigger a real page load).
 */
export default function AnalyticsRouter() {
    const location = useLocation();

    React.useEffect(() => {
        initAnalytics();
    }, []);

    React.useEffect(() => {
        // Defer to next tick so the new route's <Seo> title has applied.
        const id = window.setTimeout(() => {
            trackPageview(location.pathname + location.search);
        }, 50);
        return () => window.clearTimeout(id);
    }, [location.pathname, location.search]);

    return null;
}
