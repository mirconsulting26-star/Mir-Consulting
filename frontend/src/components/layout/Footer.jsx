import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Linkedin, Facebook, ArrowUpRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { LOGO_SRC, SOCIAL_LINKS } from "@/config/branding";
import { subscribe } from "@/lib/api";

// X (formerly Twitter) — Lucide doesn't ship an X icon, so we render the
// official wordmark glyph as an inline SVG sized like the others.
function XIcon({ className = "" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.65l-5.214-6.817-5.965 6.817H1.69l7.73-8.83L1.25 2.25h6.815l4.713 6.231 5.466-6.231Zm-1.161 17.52h1.834L7.084 4.126H5.117l11.966 15.644Z" />
        </svg>
    );
}

const SOCIALS = [
    { key: "linkedin", url: SOCIAL_LINKS.linkedin, Icon: Linkedin, label: "LinkedIn" },
    { key: "facebook", url: SOCIAL_LINKS.facebook, Icon: Facebook, label: "Facebook" },
    { key: "x", url: SOCIAL_LINKS.x, Icon: XIcon, label: "X" },
];

function SubscribeForm() {
    const [email, setEmail] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [done, setDone] = React.useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        const val = email.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setBusy(true);
        try {
            await subscribe({ email: val, source: "footer" });
            setDone(true);
            toast.success("You're subscribed — thank you!");
        } catch (err) {
            const detail = err?.response?.data?.detail;
            toast.error(typeof detail === "string" ? detail : "Subscription failed. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    if (done) {
        return (
            <div
                data-testid="footer-subscribe-success"
                className="inline-flex items-center gap-2 text-sm text-mir-blueSoft"
            >
                <CheckCircle2 className="w-4 h-4" />
                You're on the list. We'll be in touch.
            </div>
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            data-testid="footer-subscribe-form"
            className="flex flex-col sm:flex-row gap-3 max-w-md"
        >
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                aria-label="Email address"
                data-testid="footer-subscribe-email"
                className="flex-1 bg-white/5 border border-white/15 text-white placeholder:text-white/40 px-4 py-3 text-sm focus:outline-none focus:border-mir-blueSoft transition-colors"
            />
            <button
                type="submit"
                disabled={busy}
                data-testid="footer-subscribe-submit"
                className="inline-flex items-center justify-center gap-2 bg-mir-blue hover:bg-mir-blueSoft disabled:opacity-60 text-white px-5 py-3 text-sm font-medium transition-colors"
            >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Subscribe
            </button>
        </form>
    );
}

export default function Footer() {
    const visibleSocials = SOCIALS.filter((s) => !!s.url);
    return (
        <footer
            data-testid="site-footer"
            className="bg-mir-midnight text-white mt-24 relative overflow-hidden"
        >
            <div className="absolute inset-0 grid-backdrop-dark opacity-20 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-mir-blue/20 blur-[140px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3 mb-6">
                            {LOGO_SRC ? (
                                <img
                                    src={LOGO_SRC}
                                    alt="MIR Consulting"
                                    data-testid="footer-logo-img"
                                    className="h-10 w-auto max-w-[160px] object-contain"
                                />
                            ) : (
                                <div
                                    data-testid="footer-logo-placeholder"
                                    className="w-10 h-10 border border-mir-blue/60 flex items-center justify-center bg-mir-blue/15"
                                >
                                    <span className="font-heading font-bold text-mir-blueSoft tracking-tighter">
                                        M
                                    </span>
                                </div>
                            )}
                            <div>
                                <div className="font-heading text-xl font-semibold tracking-tight text-white">
                                    MIR{" "}
                                    <span className="text-white/60 font-light">
                                        Consulting
                                    </span>
                                </div>
                                <div className="text-[10px] uppercase tracking-[0.25em] text-mir-blueSoft mt-1">
                                    Strategy · Technology · Intelligence
                                </div>
                            </div>
                        </div>
                        <p className="text-white/65 text-sm leading-relaxed max-w-md">
                            MIR Consulting helps organizations modernize operations
                            through business consulting, analytics, automation
                            and intelligent systems engineered for scale.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 text-sm text-white/65">
                            <a
                                href="mailto:mirconsulting26@gmail.com"
                                data-testid="footer-email"
                                className="inline-flex items-center gap-3 hover:text-white transition-colors"
                            >
                                <Mail className="w-4 h-4 text-mir-blueSoft" />
                                mirconsulting26@gmail.com
                            </a>
                            <div className="inline-flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-mir-blueSoft" />
                                Global remote · Engagements worldwide
                            </div>
                        </div>

                        {visibleSocials.length > 0 && (
                            <div
                                className="mt-8 flex items-center gap-3"
                                data-testid="footer-socials"
                            >
                                {visibleSocials.map(({ key, url, Icon, label }) => (
                                    <a
                                        key={key}
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={label}
                                        data-testid={`footer-social-${key}`}
                                        className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-mir-blueSoft transition-colors"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-mir-blueSoft mb-4">
                            Company
                        </div>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    to="/about"
                                    data-testid="footer-link-about"
                                    className="text-white/75 hover:text-white transition-colors"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/our-work"
                                    data-testid="footer-link-our-work"
                                    className="text-white/75 hover:text-white transition-colors"
                                >
                                    Our Work
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    data-testid="footer-link-contact"
                                    className="text-white/75 hover:text-white transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-3">
                        <div className="text-xs uppercase tracking-[0.2em] text-mir-blueSoft mb-4">
                            Services
                        </div>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    to="/services"
                                    className="text-white/75 hover:text-white transition-colors"
                                >
                                    Business Consulting
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/services"
                                    className="text-white/75 hover:text-white transition-colors"
                                >
                                    Analytics &amp; BI
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/services"
                                    className="text-white/75 hover:text-white transition-colors"
                                >
                                    Marketing &amp; Brand Growth
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/services"
                                    className="text-white/75 hover:text-white transition-colors"
                                >
                                    E-commerce &amp; Online Sales
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/services"
                                    className="text-white/75 hover:text-white transition-colors"
                                >
                                    Process Automation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/services"
                                    className="text-white/75 hover:text-white transition-colors"
                                >
                                    Digital Transformation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-mir-blueSoft mb-4">
                            Engage
                        </div>
                        <Link
                            to="/contact"
                            data-testid="footer-cta-book"
                            className="group inline-flex items-center gap-2 bg-mir-blue hover:bg-mir-blueSoft text-white px-4 py-3 text-sm font-medium transition-colors w-full justify-center"
                        >
                            Book Consultation
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="divider-line mt-16" />
                <div className="py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6" data-testid="footer-subscribe">
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-mir-blueSoft mb-2">
                            Stay informed
                        </div>
                        <p className="text-white/70 text-sm max-w-md">
                            Get occasional insights on strategy, marketing and e-commerce growth — no spam, unsubscribe anytime.
                        </p>
                    </div>
                    <SubscribeForm />
                </div>

                <div className="divider-line" />
                <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-white/55 tracking-wide gap-3">
                    <div>
                        © {new Date().getFullYear()} MIR Consulting. All rights reserved.
                    </div>
                    <div className="flex items-center gap-6">
                        <span>Premium enterprise consulting</span>
                        <Link to="/admin" data-testid="footer-admin-link" className="hover:text-white/85 transition-colors">
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
