import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarClock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/sections/Section";
import { subscribe } from "@/lib/api";

function formatDate(d) {
    if (!d) return null;
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) return d;
    return parsed.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export default function ComingSoon({
    title,
    category,
    scheduledFor,
    backTo = "/our-work",
    backLabel = "Back to Our Work",
    source = "coming-soon",
}) {
    const [email, setEmail] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const dateLabel = formatDate(scheduledFor);

    const onSubmit = async (e) => {
        e.preventDefault();
        const val = email.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setBusy(true);
        try {
            await subscribe({ email: val, source });
            setDone(true);
            toast.success("We'll notify you when it goes live.");
        } catch (err) {
            const detail = err?.response?.data?.detail;
            toast.error(typeof detail === "string" ? detail : "Something went wrong. Try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div data-testid="coming-soon-page" className="bg-mir-bg">
            <Section testId="coming-soon" className="bg-mir-bg !py-20 md:!py-28">
                <Link
                    to={backTo}
                    data-testid="coming-soon-back"
                    className="inline-flex items-center gap-2 text-sm text-mir-muted hover:text-mir-text mb-10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {backLabel}
                </Link>

                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-6">
                        <CalendarClock className="w-3.5 h-3.5" />
                        Coming soon{category ? ` · ${category}` : ""}
                    </div>
                    <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-light tracking-tighter leading-[1.05] text-mir-text">
                        {title}
                    </h1>
                    {dateLabel && (
                        <p className="mt-8 text-lg text-mir-muted leading-relaxed" data-testid="coming-soon-date">
                            This piece is scheduled to publish on{" "}
                            <span className="text-mir-text font-medium">{dateLabel}</span>.
                        </p>
                    )}
                    <p className="mt-3 text-mir-muted">
                        Leave your email and we'll let you know the moment it's live.
                    </p>

                    <div className="divider-line-soft my-10" />

                    {done ? (
                        <div
                            data-testid="coming-soon-success"
                            className="inline-flex items-center gap-2 text-mir-blue"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            You're on the list — thank you.
                        </div>
                    ) : (
                        <form
                            onSubmit={onSubmit}
                            data-testid="coming-soon-form"
                            className="flex flex-col sm:flex-row gap-3 max-w-md"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                aria-label="Email address"
                                data-testid="coming-soon-email"
                                className="flex-1 bg-white border border-mir-border px-4 py-3 text-sm text-mir-text focus:outline-none focus:border-mir-blue transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={busy}
                                data-testid="coming-soon-submit"
                                className="inline-flex items-center justify-center gap-2 bg-mir-midnight hover:bg-mir-blue disabled:opacity-60 text-white px-6 py-3 text-sm font-medium transition-colors"
                            >
                                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Notify me
                            </button>
                        </form>
                    )}
                </div>
            </Section>
        </div>
    );
}
