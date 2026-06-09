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
const BAR_HEIGHT = 40; // keep in sync with the h-10 wrapper below

export default function AnnouncementBar() {
    const [visible, setVisible] = React.useState(false);
    const [pastBar, setPastBar] = React.useState(false);

    React.useEffect(() => {
        try {
            const dismissed = window.localStorage.getItem(DISMISS_KEY);
            if (!dismissed) setVisible(true);
        } catch {
            setVisible(true);
        }
    }, []);

    // Track scroll so the fixed navbar can snap flush to the viewport top
    // once the bar has scrolled away — otherwise you see a gap through which
    // the page body scrolls.
    React.useEffect(() => {
        if (!visible) {
            setPastBar(false);
            return undefined;
        }
        const onScroll = () => setPastBar(window.scrollY >= BAR_HEIGHT - 1);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [visible]);

    React.useEffect(() => {
        // Expose effective bar offset to the rest of the layout via a CSS
        // variable so sticky/fixed elements (navbar) can sit just below it
        // while it's in view and snap to top:0 once scrolled past.
        const root = document.documentElement;
        const effective = visible && !pastBar ? `${BAR_HEIGHT}px` : "0px";
        root.style.setProperty("--announcement-bar-h", effective);
        // The main padding-top needs to account for the bar's actual layout
        // height (not the dynamic offset) so the hero doesn't jump when the
        // bar scrolls away.
        root.style.setProperty(
            "--announcement-bar-layout-h",
            visible ? `${BAR_HEIGHT}px` : "0px",
        );
        return () => {
            root.style.setProperty("--announcement-bar-h", "0px");
            root.style.setProperty("--announcement-bar-layout-h", "0px");
        };
    }, [visible, pastBar]);

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
