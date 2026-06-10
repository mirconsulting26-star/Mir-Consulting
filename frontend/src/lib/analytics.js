/**
 * Analytics utility — Google Analytics 4 + Microsoft Clarity.
 *
 * Both providers are loaded ONLY if their env var is set at build time, so
 * local dev and preview builds without the vars stay clean.
 *
 *  - REACT_APP_GA_MEASUREMENT_ID  (e.g. G-XXXXXXXXXX)
 *  - REACT_APP_CLARITY_PROJECT_ID (e.g. abcdefghij)
 *
 * Public API:
 *   initAnalytics()                       // call once on app mount
 *   trackPageview(path, title?)           // SPA route change
 *   trackEvent(name, params?)             // any user interaction
 *   identifyUser(userId, customProps?)    // optional, used after lead submit
 */

const GA_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || "";
const CLARITY_ID = process.env.REACT_APP_CLARITY_PROJECT_ID || "";

let _initialised = false;

function _injectGA() {
    if (!GA_ID) return;
    // Loader script
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    // Bootstrap gtag()
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    // anonymize_ip is implicit in GA4 but we send the flag explicitly to be safe.
    // send_page_view: false — we'll fire pageviews manually on SPA route change.
    gtag("config", GA_ID, {
        send_page_view: false,
        anonymize_ip: true,
    });
}

function _injectClarity() {
    if (!CLARITY_ID) return;
    // Official Clarity loader, inlined.
    (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () {
            (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r); t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
}

export function initAnalytics() {
    if (_initialised || typeof window === "undefined") return;
    _initialised = true;
    try {
        _injectGA();
        _injectClarity();
    } catch (e) {
        // Never let analytics crash the app
        console.warn("Analytics init failed", e);
    }
}

export function trackPageview(path, title) {
    if (typeof window === "undefined") return;
    const page_path = path || window.location.pathname + window.location.search;
    const page_title = title || document.title;
    try {
        if (GA_ID && typeof window.gtag === "function") {
            window.gtag("event", "page_view", {
                page_path,
                page_title,
                page_location: window.location.href,
            });
        }
        // Clarity records SPA navigation if we just nudge it with a custom tag.
        if (CLARITY_ID && typeof window.clarity === "function") {
            window.clarity("set", "page", page_path);
        }
    } catch (_e) { /* noop */ }
}

export function trackEvent(name, params = {}) {
    if (typeof window === "undefined" || !name) return;
    try {
        if (GA_ID && typeof window.gtag === "function") {
            window.gtag("event", name, params);
        }
        if (CLARITY_ID && typeof window.clarity === "function") {
            // Clarity 'event' API stores friction-tag-style events on the session.
            window.clarity("event", name);
            // Mirror up to a couple of useful params as Clarity tags for filtering.
            Object.entries(params).slice(0, 5).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                    window.clarity("set", k, String(v).slice(0, 100));
                }
            });
        }
    } catch (_e) { /* noop */ }
}

export function identifyUser(userId, customProps = {}) {
    if (typeof window === "undefined" || !userId) return;
    try {
        if (GA_ID && typeof window.gtag === "function") {
            window.gtag("set", "user_properties", { user_id: userId, ...customProps });
        }
        if (CLARITY_ID && typeof window.clarity === "function") {
            window.clarity("identify", String(userId));
        }
    } catch (_e) { /* noop */ }
}

export const isAnalyticsEnabled = () => Boolean(GA_ID || CLARITY_ID);
