import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";

const LINKS = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/industries", label: "Industries" },
    { to: "/insights", label: "Insights" },
    { to: "/case-studies", label: "Case Studies" },
    { to: "/contact", label: "Contact" },
];

export default function Navbar() {
    const [open, setOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            data-testid="site-navbar"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "backdrop-blur-xl bg-white/85 border-b border-mir-border shadow-[0_1px_0_0_rgba(15,23,42,0.04)]"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link
                    to="/"
                    data-testid="navbar-logo-link"
                    className="flex items-center gap-3 group"
                    onClick={() => setOpen(false)}
                >
                    <div className="w-9 h-9 border border-mir-blue/40 flex items-center justify-center bg-mir-blue/8 group-hover:bg-mir-blue/15 transition-colors">
                        <span className="font-heading font-bold text-mir-blue text-sm tracking-tighter">
                            M
                        </span>
                    </div>
                    <div className="leading-none">
                        <div className="font-heading text-lg font-semibold text-mir-text tracking-tight">
                            MIR <span className="text-mir-muted font-light">Consulting</span>
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.25em] text-mir-blue mt-1">
                            Strategy · Technology · Intelligence
                        </div>
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-1" data-testid="navbar-desktop-nav">
                    {LINKS.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.to === "/"}
                            data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                            className={({ isActive }) =>
                                `px-4 py-2 text-sm tracking-wide transition-colors ${
                                    isActive
                                        ? "text-mir-blue"
                                        : "text-mir-textSoft/85 hover:text-mir-text"
                                }`
                            }
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-3">
                    <Link
                        to="/contact"
                        data-testid="navbar-cta-book"
                        className="group inline-flex items-center gap-2 bg-mir-midnight hover:bg-mir-blue text-white px-5 py-3 text-sm font-medium transition-colors"
                    >
                        Book Consultation
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>

                <button
                    data-testid="navbar-mobile-toggle"
                    className="lg:hidden text-mir-text p-2"
                    onClick={() => setOpen((o) => !o)}
                    aria-label="Toggle menu"
                >
                    {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {open && (
                <div
                    data-testid="navbar-mobile-menu"
                    className="lg:hidden border-t border-mir-border bg-white/95 backdrop-blur-xl"
                >
                    <div className="px-6 py-6 flex flex-col gap-1">
                        {LINKS.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                end={l.to === "/"}
                                onClick={() => setOpen(false)}
                                data-testid={`mobile-nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                                className={({ isActive }) =>
                                    `px-2 py-3 text-base tracking-wide border-b border-mir-border ${
                                        isActive
                                            ? "text-mir-blue"
                                            : "text-mir-textSoft"
                                    }`
                                }
                            >
                                {l.label}
                            </NavLink>
                        ))}
                        <Link
                            to="/contact"
                            onClick={() => setOpen(false)}
                            data-testid="mobile-cta-book"
                            className="mt-4 inline-flex items-center justify-center gap-2 bg-mir-midnight text-white px-5 py-3 text-sm font-medium"
                        >
                            Book Consultation
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
