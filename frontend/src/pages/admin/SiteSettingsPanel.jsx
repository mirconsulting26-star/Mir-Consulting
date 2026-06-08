import React from "react";
import { toast } from "sonner";
import { Save, Landmark, Send, Mail } from "lucide-react";
import { fetchSiteSettings, updateSiteSettings } from "@/lib/api";
import { MediaUpload } from "@/components/admin/MediaUpload";

const PAYMENT_FIELDS = [
    // bank
    { key: "bank_account_name", label: "Account name", group: "bank", placeholder: "MIR Consulting Ltd" },
    { key: "bank_name", label: "Bank name", group: "bank", placeholder: "Revolut Bank UAB" },
    { key: "bank_iban", label: "IBAN", group: "bank", placeholder: "GB12 REVO 0099 1234 5678 90" },
    { key: "bank_swift_bic", label: "SWIFT / BIC", group: "bank", placeholder: "REVOGB21" },
    { key: "bank_account_number", label: "Account number", group: "bank", placeholder: "Optional (US/UK domestic)" },
    { key: "bank_routing_sort_code", label: "Routing / Sort code", group: "bank", placeholder: "Optional" },
    { key: "bank_address", label: "Bank address", group: "bank", placeholder: "Bank's registered address", textarea: true },
    { key: "bank_reference_hint", label: "Reference to include", group: "bank", placeholder: "Invoice number" },
    // paypal
    { key: "paypal_email", label: "PayPal email", group: "paypal", placeholder: "you@example.com" },
    { key: "paypal_me_url", label: "PayPal.Me URL", group: "paypal", placeholder: "https://paypal.me/yourbusiness" },
    // revolut
    { key: "revolut_username", label: "Revtag (without @)", group: "revolut", placeholder: "yourbusiness" },
    { key: "revolut_link", label: "Revolut payment link", group: "revolut", placeholder: "https://revolut.me/yourbusiness" },
    // contact
    { key: "payment_contact_email", label: "Contact email", group: "contact", placeholder: "billing@yourbusiness.com" },
    { key: "payment_contact_message", label: "Message shown to client", group: "contact", placeholder: "Reach out and we'll share any alternate payment method.", textarea: true },
];

const GROUPS = [
    { id: "bank", label: "Bank transfer", icon: Landmark, blurb: "Shown to clients as the default payment method. Leave blank to hide." },
    { id: "paypal", label: "PayPal", icon: Send, blurb: "Either a PayPal email, a PayPal.Me link, or both." },
    { id: "revolut", label: "Revolut", icon: Send, blurb: "Public Revtag and/or shareable Revolut link." },
    { id: "contact", label: "Contact us fallback", icon: Mail, blurb: "Shown when the client prefers to arrange payment manually." },
];

const inputCls =
    "w-full bg-white border border-mir-border focus:outline-none focus:border-mir-blue px-3 py-2 text-sm text-mir-text rounded-none";

export default function SiteSettingsPanel({ token, onAuthExpired }) {
    const [form, setForm] = React.useState({ logo_url: "" });
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        fetchSiteSettings()
            .then((data) => {
                const next = { logo_url: data.logo_url || "" };
                PAYMENT_FIELDS.forEach((f) => {
                    next[f.key] = data[f.key] || "";
                });
                setForm(next);
            })
            .catch(() => {
                toast.error("Failed to load settings.");
            })
            .finally(() => setLoading(false));
    }, []);

    const setField = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const save = async () => {
        setSaving(true);
        try {
            // Send nulls for empty strings so backend stores clean data
            const payload = {};
            Object.entries(form).forEach(([k, v]) => {
                payload[k] = typeof v === "string" && v.trim() === "" ? null : v;
            });
            payload.logo_url = form.logo_url || "";
            await updateSiteSettings(token, payload);
            toast.success("Site settings saved.");
        } catch (e) {
            if (e?.response?.status === 401) onAuthExpired?.();
            else toast.error("Save failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div data-testid="site-settings-panel" className="space-y-10 max-w-3xl">
            <div>
                <h2 className="font-heading text-2xl text-mir-text">Site Settings</h2>
                <p className="text-sm text-mir-muted mt-1">
                    Branding + the payment methods customers see on every invoice.
                </p>
            </div>

            {loading ? (
                <div className="text-sm text-mir-muted">Loading…</div>
            ) : (
                <>
                    {/* Logo */}
                    <section className="space-y-3 border-b border-mir-border pb-8">
                        <label className="block text-xs uppercase tracking-[0.2em] text-mir-muted">
                            Company logo
                        </label>
                        <p className="text-xs text-mir-muted">
                            Square or wide PNG/SVG. Falls back to the &quot;M&quot; placeholder when empty.
                        </p>
                        <MediaUpload
                            token={token}
                            folder="logos"
                            aspect="square"
                            value={form.logo_url || null}
                            onChange={(url) => setField("logo_url", url || "")}
                            testIdPrefix="logo"
                        />
                    </section>

                    {/* Payment settings */}
                    <div>
                        <h3 className="font-heading text-xl text-mir-text">Payment details</h3>
                        <p className="text-sm text-mir-muted mt-1 mb-6">
                            These appear on the public invoice page <span className="text-mir-text">and</span>{" "}
                            inside every generated PDF. Customers pick a method and submit a confirmation
                            code after paying — you then click <span className="text-mir-text">Mark as Paid</span> in
                            the Invoices tab.
                        </p>

                        <div className="space-y-8">
                            {GROUPS.map((g) => {
                                const Icon = g.icon;
                                const fields = PAYMENT_FIELDS.filter((f) => f.group === g.id);
                                return (
                                    <div
                                        key={g.id}
                                        data-testid={`payment-group-${g.id}`}
                                        className="border border-mir-border p-6 bg-white"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-4 h-4 text-mir-blue" />
                                            <h4 className="font-heading text-base text-mir-text">
                                                {g.label}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-mir-muted mb-4">{g.blurb}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {fields.map((f) => (
                                                <div
                                                    key={f.key}
                                                    className={f.textarea ? "sm:col-span-2" : ""}
                                                >
                                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-mir-muted mb-1">
                                                        {f.label}
                                                    </label>
                                                    {f.textarea ? (
                                                        <textarea
                                                            rows={2}
                                                            value={form[f.key] || ""}
                                                            placeholder={f.placeholder}
                                                            onChange={(e) =>
                                                                setField(f.key, e.target.value)
                                                            }
                                                            data-testid={`payment-field-${f.key}`}
                                                            className={`${inputCls} resize-y`}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={form[f.key] || ""}
                                                            placeholder={f.placeholder}
                                                            onChange={(e) =>
                                                                setField(f.key, e.target.value)
                                                            }
                                                            data-testid={`payment-field-${f.key}`}
                                                            className={inputCls}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={save}
                            disabled={saving}
                            data-testid="site-settings-save"
                            className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.15em] bg-mir-midnight text-white hover:bg-mir-blue disabled:opacity-50 transition-colors"
                        >
                            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save settings"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
