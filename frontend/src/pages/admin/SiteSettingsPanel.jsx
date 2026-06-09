import React from "react";
import { toast } from "sonner";
import { Save, Landmark, Send, Mail, Github, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { fetchSiteSettings, updateSiteSettings, verifyGitHubStorage } from "@/lib/api";

const PAYMENT_FIELDS = [
    // bank
    { key: "bank_account_name", label: "Account name", group: "bank", placeholder: "MIR Consulting Ltd" },
    { key: "bank_name", label: "Bank name", group: "bank", placeholder: "Revolut Bank UAB" },
    { key: "bank_iban", label: "IBAN", group: "bank", placeholder: "GB12 REVO 0099 1234 5678 90" },
    { key: "bank_swift_bic", label: "SWIFT / BIC", group: "bank", placeholder: "REVOGB21" },
    { key: "bank_account_number", label: "Account number", group: "bank", placeholder: "Optional (US/UK domestic)" },
    { key: "bank_routing_sort_code", label: "Routing / Sort code", group: "bank", placeholder: "Optional" },
    { key: "bank_address", label: "Bank address", group: "bank", placeholder: "Bank's registered address", textarea: true },
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
    const [form, setForm] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        fetchSiteSettings()
            .then((data) => {
                const next = {};
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
            const payload = {};
            Object.entries(form).forEach(([k, v]) => {
                payload[k] = typeof v === "string" && v.trim() === "" ? null : v;
            });
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
                    Payment methods customers see on every invoice. Logo and
                    social links are hard-coded in the codebase
                    (<code className="text-xs bg-mir-surface px-1.5 py-0.5 border border-mir-border">src/config/branding.js</code>).
                </p>
            </div>

            {loading ? (
                <div className="text-sm text-mir-muted">Loading…</div>
            ) : (
                <>
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

                    <GitHubDiagnostics token={token} onAuthExpired={onAuthExpired} />

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

function GitHubDiagnostics({ token, onAuthExpired }) {
    const [running, setRunning] = React.useState(false);
    const [result, setResult] = React.useState(null);

    const run = async () => {
        setRunning(true);
        setResult(null);
        try {
            const data = await verifyGitHubStorage(token);
            setResult(data);
            if (data?.ok) toast.success("GitHub storage is healthy.");
            else toast.error("GitHub storage has issues — see details below.");
        } catch (e) {
            if (e?.response?.status === 401) {
                onAuthExpired?.();
                return;
            }
            const detail = e?.response?.data?.detail || e?.message || "Verification failed.";
            setResult({ ok: false, configured: false, checks: [{ name: "Request", ok: false, detail, hint: "" }] });
            toast.error("Verification request failed.");
        } finally {
            setRunning(false);
        }
    };

    return (
        <div data-testid="github-diagnostics" className="border border-mir-border p-6 bg-white">
            <div className="flex items-center gap-2 mb-1">
                <Github className="w-4 h-4 text-mir-blue" />
                <h4 className="font-heading text-base text-mir-text">GitHub media storage</h4>
            </div>
            <p className="text-xs text-mir-muted mb-4">
                Uploaded images (team photos, blog covers, video thumbnails) are pushed to your private
                GitHub repo via the API. If uploads fail in production, run this diagnostic — it tells
                you exactly which step is broken without you having to upload a real file.
            </p>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={run}
                    disabled={running}
                    data-testid="verify-github-btn"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.15em] border border-mir-midnight text-mir-midnight hover:bg-mir-midnight hover:text-white disabled:opacity-50 transition-colors"
                >
                    {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                    {running ? "Verifying…" : "Verify GitHub connection"}
                </button>
                {result && (
                    <span
                        data-testid="verify-github-status"
                        className={`inline-flex items-center gap-1.5 text-xs ${result.ok ? "text-green-700" : "text-red-700"
                            }`}
                    >
                        {result.ok ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" /> All checks passed
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4" /> Issues detected
                            </>
                        )}
                    </span>
                )}
            </div>

            {result && (
                <div className="mt-5 space-y-3" data-testid="verify-github-results">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-mir-muted grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                            <span className="text-mir-text">Repo:</span>{" "}
                            <code className="text-xs text-mir-text">{result.repo || "—"}</code>
                        </div>
                        <div>
                            <span className="text-mir-text">Branch:</span>{" "}
                            <code className="text-xs text-mir-text">{result.branch || "—"}</code>
                        </div>
                        <div>
                            <span className="text-mir-text">Token:</span>{" "}
                            <code className="text-xs text-mir-text">{result.token_preview || (result.token_present ? "set" : "missing")}</code>
                        </div>
                    </div>

                    <ul className="space-y-2">
                        {(result.checks || []).map((c, i) => (
                            <li
                                key={i}
                                data-testid={`verify-check-${i}`}
                                className={`border p-3 text-sm ${c.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    {c.ok ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium text-mir-text">{c.name}</div>
                                        {c.detail && (
                                            <div className="text-xs text-mir-muted mt-0.5 break-words">{c.detail}</div>
                                        )}
                                        {!c.ok && c.hint && (
                                            <div className="mt-2 flex items-start gap-1.5 text-xs text-mir-text">
                                                <AlertCircle className="w-3.5 h-3.5 text-mir-blue mt-0.5 flex-shrink-0" />
                                                <span>{c.hint}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
