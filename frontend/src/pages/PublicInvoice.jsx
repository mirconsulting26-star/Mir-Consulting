import React from "react";
import { useParams, Link } from "react-router-dom";
import {
    Loader2,
    Download,
    CheckCircle2,
    AlertTriangle,
    Landmark,
    Copy,
    Mail,
    Send,
} from "lucide-react";
import { toast } from "sonner";
import Seo from "@/lib/Seo";
import {
    API,
    fetchPublicInvoice,
    fetchSiteSettings,
    submitPaymentConfirmation,
} from "@/lib/api";

const fmt = (amount, currency) => {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
        }).format(amount || 0);
    } catch {
        return `${(amount || 0).toFixed(2)} ${currency || ""}`.trim();
    }
};

const STATUS_BADGE = {
    draft: { label: "Draft", cls: "bg-mir-surface text-mir-textSoft border-mir-border" },
    sent: { label: "Awaiting payment", cls: "bg-blue-50 text-mir-blue border-blue-200" },
    paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    overdue: { label: "Overdue", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    void: { label: "Void", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

const copy = async (txt, label) => {
    try {
        await navigator.clipboard.writeText(txt);
        toast.success(`${label} copied`);
    } catch {
        toast.error("Could not copy to clipboard");
    }
};

const Detail = ({ label, value }) =>
    !value ? null : (
        <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
            <span className="text-mir-muted text-xs uppercase tracking-[0.18em]">{label}</span>
            <span className="text-mir-text text-right font-mono">{value}</span>
            <button
                onClick={() => copy(value, label)}
                className="text-mir-muted hover:text-mir-blue shrink-0"
                title={`Copy ${label}`}
            >
                <Copy className="w-3.5 h-3.5" />
            </button>
        </div>
    );

function MethodCard({ id, label, icon: Icon, available, active, onClick, children }) {
    return (
        <div
            data-testid={`pay-method-${id}`}
            className={`border ${
                active ? "border-mir-blue shadow-sm" : "border-mir-border"
            } bg-white transition-colors`}
        >
            <button
                onClick={onClick}
                disabled={!available}
                data-testid={`pay-method-${id}-toggle`}
                className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left ${
                    available
                        ? "hover:bg-mir-surface"
                        : "opacity-50 cursor-not-allowed"
                }`}
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-mir-blue shrink-0" />
                    <span className="text-sm font-medium text-mir-text">{label}</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-mir-muted">
                    {!available ? "Not configured" : active ? "Selected" : "Select"}
                </span>
            </button>
            {active && available && (
                <div className="px-5 pb-5 pt-1 border-t border-mir-border space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
}

export default function PublicInvoice() {
    const { token } = useParams();
    const [invoice, setInvoice] = React.useState(null);
    const [settings, setSettings] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [selected, setSelected] = React.useState(null);
    const [reference, setReference] = React.useState("");
    const [note, setNote] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    const load = React.useCallback(() => {
        fetchPublicInvoice(token)
            .then(setInvoice)
            .catch((e) =>
                setError(e?.response?.data?.detail || "Invoice not found."),
            );
        fetchSiteSettings()
            .then(setSettings)
            .catch(() => setSettings({}));
    }, [token]);

    React.useEffect(() => {
        load();
    }, [load]);

    const onSubmitConfirmation = async (e) => {
        e.preventDefault();
        if (!selected) {
            toast.error("Please select a payment method first.");
            return;
        }
        if (selected !== "contact" && !reference.trim()) {
            toast.error(
                "Please enter a transaction reference or confirmation code.",
            );
            return;
        }
        setSubmitting(true);
        try {
            const updated = await submitPaymentConfirmation(token, {
                method: selected,
                reference: reference.trim() || undefined,
                note: note.trim() || undefined,
            });
            setInvoice(updated);
            toast.success(
                "Confirmation submitted. We'll verify and update the invoice shortly.",
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.detail || "Could not submit confirmation.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (error) {
        return (
            <div
                className="min-h-[70vh] flex items-center justify-center bg-mir-bg px-6"
                data-testid="public-invoice-error"
            >
                <Seo title="Invoice not found" noIndex />
                <div className="max-w-md text-center">
                    <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                    <h1 className="font-heading text-2xl text-mir-text mb-2">
                        Invoice unavailable
                    </h1>
                    <p className="text-mir-muted text-sm mb-6">{error}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-5 py-2.5 border border-mir-text text-mir-text text-xs uppercase tracking-[0.2em] hover:bg-mir-text hover:text-white transition-colors"
                    >
                        Back to MIR Consulting
                    </Link>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div
                className="min-h-[70vh] flex items-center justify-center bg-mir-bg"
                data-testid="public-invoice-loading"
            >
                <Loader2 className="w-6 h-6 animate-spin text-mir-blue" />
            </div>
        );
    }

    const isPaid = invoice.status === "paid";
    const status = STATUS_BADGE[invoice.status] || STATUS_BADGE.sent;
    const pdfUrl = `${API}/invoices/public/${token}/pdf`;
    const ps = settings || {};

    const hasBank =
        ps.bank_account_name ||
        ps.bank_iban ||
        ps.bank_account_number ||
        ps.bank_swift_bic;
    const hasPaypal = ps.paypal_email || ps.paypal_me_url;
    const hasRevolut = ps.revolut_username || ps.revolut_link;
    const hasContact = ps.payment_contact_email || ps.payment_contact_message;

    const alreadySubmitted = !!invoice.payment_confirmation_submitted_at;

    return (
        <div className="min-h-screen bg-mir-bg" data-testid="public-invoice-page">
            <Seo
                title={`Invoice ${invoice.number}`}
                description={`MIR Consulting invoice ${invoice.number}`}
                noIndex
            />

            <div className="max-w-3xl mx-auto px-6 py-16">
                <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-3">
                    MIR Consulting
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-10">
                    <h1 className="font-heading text-4xl sm:text-5xl font-light tracking-tighter text-mir-text">
                        Invoice {invoice.number}
                    </h1>
                    <span
                        data-testid="public-invoice-status"
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] border ${status.cls}`}
                    >
                        {status.label}
                    </span>
                </div>

                <div className="bg-white border border-mir-border p-8 sm:p-10 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.25em] text-mir-muted mb-2">
                                Billed to
                            </div>
                            <div className="font-heading text-lg text-mir-text">
                                {invoice.client_name}
                            </div>
                            {invoice.client_company && (
                                <div className="text-sm text-mir-textSoft">
                                    {invoice.client_company}
                                </div>
                            )}
                            {invoice.client_address && (
                                <div className="text-sm text-mir-textSoft whitespace-pre-line mt-1">
                                    {invoice.client_address}
                                </div>
                            )}
                        </div>
                        <div className="sm:text-right">
                            <div className="text-[10px] uppercase tracking-[0.25em] text-mir-muted mb-2">
                                Dates
                            </div>
                            <div className="text-sm text-mir-text">
                                <span className="text-mir-muted">Issued:</span>{" "}
                                {invoice.issue_date}
                            </div>
                            <div className="text-sm text-mir-text">
                                <span className="text-mir-muted">Due:</span>{" "}
                                {invoice.due_date}
                            </div>
                        </div>
                    </div>

                    <table className="w-full text-sm border-t border-mir-border">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-mir-muted">
                                <th className="py-3">Description</th>
                                <th className="py-3 text-right w-20">Qty</th>
                                <th className="py-3 text-right w-28">Rate</th>
                                <th className="py-3 text-right w-32">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(invoice.line_items || []).map((li, i) => (
                                <tr key={i} className="border-t border-mir-border">
                                    <td className="py-4 pr-4 text-mir-text">
                                        {li.description}
                                    </td>
                                    <td className="py-4 text-right text-mir-textSoft">
                                        {li.quantity}
                                    </td>
                                    <td className="py-4 text-right text-mir-textSoft">
                                        {fmt(li.rate, invoice.currency)}
                                    </td>
                                    <td className="py-4 text-right text-mir-text font-medium">
                                        {fmt(li.amount, invoice.currency)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t border-mir-border">
                            <tr>
                                <td colSpan={3} className="py-2 text-right text-mir-muted text-sm">
                                    Subtotal
                                </td>
                                <td className="py-2 text-right text-mir-text">
                                    {fmt(invoice.subtotal, invoice.currency)}
                                </td>
                            </tr>
                            {invoice.tax_rate > 0 && (
                                <tr>
                                    <td colSpan={3} className="py-2 text-right text-mir-muted text-sm">
                                        Tax ({invoice.tax_rate}%)
                                    </td>
                                    <td className="py-2 text-right text-mir-text">
                                        {fmt(invoice.tax_amount, invoice.currency)}
                                    </td>
                                </tr>
                            )}
                            <tr className="border-t border-mir-border">
                                <td
                                    colSpan={3}
                                    className="py-3 text-right text-[10px] uppercase tracking-[0.25em] text-mir-muted"
                                >
                                    Total due
                                </td>
                                <td
                                    data-testid="public-invoice-total"
                                    className="py-3 text-right font-heading text-2xl text-mir-blue"
                                >
                                    {fmt(invoice.total, invoice.currency)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {invoice.notes && (
                        <div className="mt-8 pt-6 border-t border-mir-border">
                            <div className="text-[10px] uppercase tracking-[0.25em] text-mir-muted mb-2">
                                Notes
                            </div>
                            <p className="text-sm text-mir-textSoft whitespace-pre-line">
                                {invoice.notes}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 mb-10">
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        data-testid="public-invoice-download"
                        className="inline-flex items-center gap-2 px-5 py-3 border border-mir-text text-mir-text text-xs uppercase tracking-[0.2em] hover:bg-mir-text hover:text-white transition-colors"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </a>
                    {isPaid && (
                        <span
                            data-testid="public-invoice-paid"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs uppercase tracking-[0.2em]"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Payment received — thank you
                        </span>
                    )}
                </div>

                {/* ===================== HOW TO PAY ===================== */}
                {!isPaid && (
                    <section
                        data-testid="public-invoice-payment-section"
                        className="bg-white border border-mir-border p-8 sm:p-10 mb-8"
                    >
                        <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-2">
                            Step 1
                        </div>
                        <h2 className="font-heading text-2xl text-mir-text mb-2">
                            How to pay
                        </h2>
                        <p className="text-sm text-mir-textSoft mb-6">
                            Choose a method below to view payment details. After paying, fill in the
                            confirmation form so we can mark the invoice as settled.
                        </p>

                        <div className="space-y-3">
                            <MethodCard
                                id="bank"
                                label="Bank transfer"
                                icon={Landmark}
                                available={!!hasBank}
                                active={selected === "bank"}
                                onClick={() => setSelected("bank")}
                            >
                                <Detail label="Account name" value={ps.bank_account_name} />
                                <Detail label="Bank" value={ps.bank_name} />
                                <Detail label="IBAN" value={ps.bank_iban} />
                                <Detail label="SWIFT / BIC" value={ps.bank_swift_bic} />
                                <Detail label="Account #" value={ps.bank_account_number} />
                                <Detail label="Routing / Sort" value={ps.bank_routing_sort_code} />
                                <Detail label="Bank address" value={ps.bank_address} />
                                {ps.bank_reference_hint && (
                                    <p className="pt-2 text-xs text-mir-muted">
                                        Reference to include: <span className="text-mir-text">{ps.bank_reference_hint}</span>
                                    </p>
                                )}
                            </MethodCard>

                            <MethodCard
                                id="paypal"
                                label="PayPal"
                                icon={Send}
                                available={!!hasPaypal}
                                active={selected === "paypal"}
                                onClick={() => setSelected("paypal")}
                            >
                                <Detail label="PayPal email" value={ps.paypal_email} />
                                {ps.paypal_me_url && (
                                    <div className="pt-2">
                                        <a
                                            href={ps.paypal_me_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            data-testid="pay-paypal-link"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-mir-blue text-white text-xs uppercase tracking-[0.2em] hover:bg-mir-blueDark transition-colors"
                                        >
                                            Open PayPal.Me
                                        </a>
                                    </div>
                                )}
                            </MethodCard>

                            <MethodCard
                                id="revolut"
                                label="Revolut"
                                icon={Send}
                                available={!!hasRevolut}
                                active={selected === "revolut"}
                                onClick={() => setSelected("revolut")}
                            >
                                <Detail
                                    label="Revtag"
                                    value={ps.revolut_username ? `@${ps.revolut_username.replace(/^@/, "")}` : null}
                                />
                                {ps.revolut_link && (
                                    <div className="pt-2">
                                        <a
                                            href={ps.revolut_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            data-testid="pay-revolut-link"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-mir-blue text-white text-xs uppercase tracking-[0.2em] hover:bg-mir-blueDark transition-colors"
                                        >
                                            Open Revolut link
                                        </a>
                                    </div>
                                )}
                            </MethodCard>

                            <MethodCard
                                id="contact"
                                label="Contact us to arrange payment"
                                icon={Mail}
                                available={!!hasContact}
                                active={selected === "contact"}
                                onClick={() => setSelected("contact")}
                            >
                                {ps.payment_contact_message && (
                                    <p className="text-sm text-mir-textSoft">
                                        {ps.payment_contact_message}
                                    </p>
                                )}
                                {ps.payment_contact_email && (
                                    <Detail label="Email" value={ps.payment_contact_email} />
                                )}
                            </MethodCard>
                        </div>

                        {/* Confirmation form */}
                        <div className="mt-10 pt-8 border-t border-mir-border">
                            <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-2">
                                Step 2
                            </div>
                            <h3 className="font-heading text-xl text-mir-text mb-2">
                                Confirm your payment
                            </h3>
                            <p className="text-sm text-mir-textSoft mb-5">
                                Once you&apos;ve sent the payment, enter your transaction reference (or
                                confirmation code) below. We&apos;ll verify it and mark the invoice as
                                paid.
                            </p>

                            {alreadySubmitted && (
                                <div
                                    data-testid="payment-confirmation-acknowledged"
                                    className="bg-emerald-50 border border-emerald-200 px-5 py-4 mb-5 text-sm text-emerald-800"
                                >
                                    <div className="font-medium mb-1">
                                        Confirmation received — thank you.
                                    </div>
                                    <div className="text-xs text-emerald-700">
                                        Method: <span className="font-mono">{invoice.payment_method_chosen}</span>
                                        {invoice.payment_confirmation_reference && (
                                            <> · Ref: <span className="font-mono">{invoice.payment_confirmation_reference}</span></>
                                        )}
                                        <br />
                                        We&apos;ll mark the invoice as paid after we verify the transaction on our end.
                                    </div>
                                </div>
                            )}

                            <form onSubmit={onSubmitConfirmation} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-mir-muted mb-2">
                                        Transaction reference / confirmation code
                                        {selected !== "contact" && (
                                            <span className="text-rose-500"> *</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        placeholder="e.g. TXN-2026-04-19-AB123"
                                        data-testid="payment-confirmation-reference"
                                        className="w-full bg-white border border-mir-border focus:outline-none focus:border-mir-blue px-4 py-3 text-sm text-mir-text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-mir-muted mb-2">
                                        Note (optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Anything you'd like us to know about this payment…"
                                        data-testid="payment-confirmation-note"
                                        className="w-full bg-white border border-mir-border focus:outline-none focus:border-mir-blue px-4 py-3 text-sm text-mir-text resize-y"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting || !selected}
                                    data-testid="payment-confirmation-submit"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-mir-midnight text-white text-xs uppercase tracking-[0.2em] hover:bg-mir-blue transition-colors disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}
                                    {alreadySubmitted ? "Submit updated confirmation" : "I've sent the payment"}
                                </button>
                            </form>
                        </div>
                    </section>
                )}

                <p className="text-xs text-mir-muted">
                    All payment processing is handled by you and your bank / wallet provider. MIR
                    Consulting does not store any card details.
                </p>
            </div>
        </div>
    );
}
