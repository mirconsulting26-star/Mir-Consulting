import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, ArrowRight } from "lucide-react";

const DISMISS_KEY = "mir-promo-free-consult-v1";

/**
 * Site-wide announcement bar advertising the free initial consultation.
 * - Renders above the navbar (Layout slots it in).
 * - Dismissible per-browser via localStorage so returning visitors aren't nagged.
 * - Bumps Navbar's `top` offset using a CSS custom property so the sticky nav
 *   sits flush under it.
 */
export default function AnnouncementBar() {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        try {
            const dismissed = window.localStorage.getItem(DISMISS_KEY);
            if (!dismissed) setVisible(true);
        } catch {
            setVisible(true);
        }
    }, []);

    React.useEffect(() => {
        // Expose bar height to the rest of the layout via a CSS variable so
        // sticky elements (navbar) can sit just below it on every viewport.
        const root = document.documentElement;
        root.style.setProperty(
            "--announcement-bar-h",
            visible ? "40px" : "0px",
        );
        return () => root.style.setProperty("--announcement-bar-h", "0px");
    }, [visible]);

    const dismiss = () => {
        try {
            window.localStorage.setItem(DISMISS_KEY, "1");
        } catch {
            // ignore
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            data-testid="announcement-bar"
            className="relative bg-gradient-to-r from-mir-midnight via-mir-blueInk to-mir-midnight text-white"
        >
            <div className="absolute inset-0 grid-backdrop-dark opacity-20 pointer-events-none" />
            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-center gap-3 h-10 text-[12.5px] sm:text-sm">
                    <Sparkles className="w-3.5 h-3.5 text-mir-blueSoft shrink-0" />
                    <span className="hidden sm:inline text-white/90">
                        <span className="font-medium tracking-wide">Free initial consultation</span>
                        {" "}— every new client. No commitment.
                    </span>
                    <span className="sm:hidden text-white/90 font-medium tracking-wide">
                        Free initial consultation
                    </span>
                    <Link
                        to="/contact"
                        data-testid="announcement-bar-cta"
                        className="inline-flex items-center gap-1.5 text-mir-blueSoft hover:text-white font-medium underline-offset-4 hover:underline transition-colors"
                    >
                        Book a 30-min call
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                data-testid="announcement-bar-dismiss"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 transition-colors"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
