import React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Download, Loader2, FileText, ShoppingBag } from "lucide-react";
import { Section, SectionHeader } from "@/components/sections/Section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { submitLead } from "@/lib/api";

/**
 * Lead-magnet section.
 *
 * Two free assets gate a lightweight email-capture form. On submit we POST to
 * the existing /api/leads endpoint (which already sends an admin Gmail
 * notification), then immediately offer the PDF download — so the prospect
 * gets value in <30 seconds and we get a warm lead in the pipeline tagged
 * with the asset they wanted.
 */
const ASSETS = {
    "marketing-quick-check": {
        title: "Free Marketing Quick-Check",
        kicker: "15-MINUTE WORKSHEET",
        blurb:
            "28 hard-honest questions across positioning, channels, funnel and measurement. Score yourself. Find the leaks. Bring it to a free 30-minute call.",
        bullets: [
            "Positioning & messaging audit",
            "Acquisition channel scorecard",
            "Funnel conversion checklist",
            "Measurement maturity matrix",
        ],
        icon: FileText,
        pdf: "/resources/marketing-quick-check.pdf",
        accent: "blue",
        interest: "Lead magnet — Marketing Quick-Check",
    },
    "ecommerce-audit": {
        title: "Free E-commerce Audit",
        kicker: "30-MINUTE STORE WALK-THROUGH",
        blurb:
            "32 checks across Shopify, WooCommerce, Wix and Amazon / eBay / Etsy. Find the conversion leaks before you spend another euro on ads.",
        bullets: [
            "Storefront fundamentals",
            "Product page conversion",
            "Cart & checkout flow",
            "Marketplace algorithm signals",
        ],
        icon: ShoppingBag,
        pdf: "/resources/ecommerce-audit.pdf",
        accent: "midnight",
        interest: "Lead magnet — E-commerce Audit",
    },
};

const STAGES = [
    "Just exploring — not sure yet",
    "We have a business but marketing is patchy",
    "We have a store and want it to convert better",
    "We're growing fast and need a senior partner",
];

function MagnetCard({ asset, onOpen, testIdSuffix }) {
    const Icon = asset.icon;
    const isDark = asset.accent === "midnight";
    return (
        <motion.button
            type="button"
            onClick={onOpen}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            data-testid={`lead-magnet-card-${testIdSuffix}`}
            className={`group text-left border ${
                isDark
                    ? "bg-mir-text border-mir-text text-white"
                    : "bg-white border-mir-border text-mir-text"
            } p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
        >
            <div
                className={`inline-flex h-12 w-12 items-center justify-center border ${
                    isDark
                        ? "border-white/20 text-white"
                        : "border-mir-blue/30 text-mir-blue"
                } mb-6`}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div
                className={`text-[10px] uppercase tracking-[0.28em] font-medium mb-3 ${
                    isDark ? "text-white/60" : "text-mir-blue"
                }`}
            >
                {asset.kicker}
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-light leading-tight">
                {asset.title}
            </h3>
            <p
                className={`mt-4 text-sm leading-relaxed ${
                    isDark ? "text-white/75" : "text-mir-muted"
                }`}
            >
                {asset.blurb}
            </p>
            <ul
                className={`mt-6 space-y-2 text-sm ${
                    isDark ? "text-white/80" : "text-mir-text"
                }`}
            >
                {asset.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                        <span
                            className={`mt-2 h-px w-3 ${
                                isDark ? "bg-white/40" : "bg-mir-blue/60"
                            }`}
                        />
                        <span>{b}</span>
                    </li>
                ))}
            </ul>
            <div
                className={`mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-medium ${
                    isDark ? "text-white" : "text-mir-blue"
                } group-hover:gap-3 transition-all`}
            >
                Get the PDF
                <ArrowRight className="h-3.5 w-3.5" />
            </div>
        </motion.button>
    );
}

export default function LeadMagnetSection() {
    const [openKey, setOpenKey] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [downloadUrl, setDownloadUrl] = React.useState(null);
    const [form, setForm] = React.useState({
        full_name: "",
        email: "",
        company: "",
        stage: "",
    });

    const active = openKey ? ASSETS[openKey] : null;

    const reset = () => {
        setOpenKey(null);
        setDownloadUrl(null);
        setLoading(false);
        setForm({ full_name: "", email: "", company: "", stage: "" });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!active) return;
        if (!form.full_name.trim() || form.full_name.trim().length < 2) {
            toast.error("Please enter your full name.");
            return;
        }
        if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            const message = [
                `Lead magnet requested: ${active.title}`,
                form.stage ? `Stage: ${form.stage}` : null,
                form.company ? `Company: ${form.company}` : null,
                "",
                "Sent automatically by the lead-magnet form on the public site.",
            ]
                .filter(Boolean)
                .join("\n");

            await submitLead({
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                company: form.company.trim() || undefined,
                service_interest: active.interest,
                message,
            });
            setDownloadUrl(active.pdf);
            toast.success(`${active.title} is ready below.`);
        } catch (err) {
            const raw = err?.response?.data?.detail;
            let detail = "Couldn't submit just now — please try again or email us directly.";
            if (typeof raw === "string") {
                detail = raw;
            } else if (Array.isArray(raw) && raw.length) {
                // FastAPI validation errors come back as an array of objects.
                detail = raw
                    .map((d) => (typeof d === "string" ? d : d?.msg || ""))
                    .filter(Boolean)
                    .join("; ") || detail;
            }
            toast.error(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Section testId="lead-magnet-section" className="bg-mir-bg-soft">
            <SectionHeader
                overline="Free, no commitment"
                title="Two quick-checks you can run on your business today."
                subtitle="Self-directed worksheets used by our senior partners — yours to download in exchange for an email. We'll only follow up if you ask us to."
                testId="lead-magnet-header"
            />

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(ASSETS).map(([key, asset]) => (
                    <MagnetCard
                        key={key}
                        asset={asset}
                        testIdSuffix={key}
                        onOpen={() => {
                            setOpenKey(key);
                            setDownloadUrl(null);
                        }}
                    />
                ))}
            </div>

            <Dialog
                open={!!openKey}
                onOpenChange={(o) => {
                    if (!o) reset();
                }}
            >
                <DialogContent
                    data-testid="lead-magnet-dialog"
                    className="sm:max-w-md"
                >
                    <DialogHeader>
                        <div className="text-[10px] uppercase tracking-[0.28em] text-mir-blue mb-2">
                            {active?.kicker}
                        </div>
                        <DialogTitle className="font-heading text-2xl font-light leading-tight">
                            {active?.title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-mir-muted">
                            Tell us where to send it. No spam — we send at most one
                            short, useful follow-up.
                        </DialogDescription>
                    </DialogHeader>

                    {!downloadUrl ? (
                        <form
                            onSubmit={onSubmit}
                            className="space-y-4"
                            data-testid="lead-magnet-form"
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="lm-name">Full name *</Label>
                                <Input
                                    id="lm-name"
                                    data-testid="lead-magnet-name"
                                    value={form.full_name}
                                    onChange={(e) =>
                                        setForm({ ...form, full_name: e.target.value })
                                    }
                                    autoComplete="name"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lm-email">Email *</Label>
                                <Input
                                    id="lm-email"
                                    data-testid="lead-magnet-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lm-company">Company (optional)</Label>
                                <Input
                                    id="lm-company"
                                    data-testid="lead-magnet-company"
                                    value={form.company}
                                    onChange={(e) =>
                                        setForm({ ...form, company: e.target.value })
                                    }
                                    autoComplete="organization"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lm-stage">
                                    Where are you today? (optional)
                                </Label>
                                <Textarea
                                    id="lm-stage"
                                    data-testid="lead-magnet-stage"
                                    rows={2}
                                    value={form.stage}
                                    onChange={(e) =>
                                        setForm({ ...form, stage: e.target.value })
                                    }
                                    placeholder={STAGES[0]}
                                    className="resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                data-testid="lead-magnet-submit"
                                className="w-full inline-flex items-center justify-center gap-2 bg-mir-text text-white px-6 py-3 text-sm uppercase tracking-[0.22em] font-medium hover:bg-mir-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending…
                                    </>
                                ) : (
                                    <>
                                        Send me the PDF
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                            <p className="text-[11px] text-mir-muted leading-relaxed">
                                By submitting, you agree to receive this PDF and an
                                occasional follow-up from MIR Consulting. Unsubscribe any
                                time.
                            </p>
                        </form>
                    ) : (
                        <div
                            data-testid="lead-magnet-success"
                            className="space-y-5 pt-2"
                        >
                            <div className="text-sm text-mir-text leading-relaxed">
                                Thanks{form.full_name ? `, ${form.full_name.split(" ")[0]}` : ""} —
                                your copy is ready. We&apos;ve also flagged it to our team in
                                case you&apos;d like a follow-up call.
                            </div>
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                download
                                data-testid="lead-magnet-download"
                                className="w-full inline-flex items-center justify-center gap-2 bg-mir-blue text-white px-6 py-3 text-sm uppercase tracking-[0.22em] font-medium hover:bg-mir-text transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Download the PDF
                            </a>
                            <button
                                type="button"
                                onClick={reset}
                                className="w-full text-xs uppercase tracking-[0.22em] text-mir-muted hover:text-mir-text transition-colors"
                                data-testid="lead-magnet-close"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Section>
    );
}
