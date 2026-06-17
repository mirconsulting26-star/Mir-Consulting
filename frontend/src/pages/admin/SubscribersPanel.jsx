import React from "react";
import { toast } from "sonner";
import { Download, Trash2, Mail } from "lucide-react";
import { fetchSubscribers, deleteSubscriber, downloadSubscribersCsv } from "@/lib/api";

export default function SubscribersPanel({ token, onAuthExpired, onChange }) {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const load = React.useCallback(async () => {
        setLoading(true);
        try {
            setItems(await fetchSubscribers(token));
        } catch (e) {
            if (e?.response?.status === 401) onAuthExpired?.();
            else toast.error("Failed to load subscribers.");
        } finally {
            setLoading(false);
        }
    }, [token, onAuthExpired]);

    React.useEffect(() => {
        load();
    }, [load]);

    const remove = async (id) => {
        if (!window.confirm("Remove this subscriber?")) return;
        try {
            await deleteSubscriber(token, id);
            setItems((p) => p.filter((x) => x.id !== id));
            toast.success("Subscriber removed.");
            onChange?.();
        } catch (e) {
            if (e?.response?.status === 401) onAuthExpired?.();
            else toast.error("Delete failed.");
        }
    };

    const exportCsv = async () => {
        try {
            await downloadSubscribersCsv(token);
        } catch (e) {
            if (e?.response?.status === 401) onAuthExpired?.();
            else toast.error("Export failed.");
        }
    };

    return (
        <div data-testid="subscribers-panel" className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-heading text-2xl text-mir-text">Subscribers</h2>
                    <p className="text-sm text-mir-muted mt-1">
                        People who opted in via the footer or a "Coming soon" page.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={exportCsv}
                    disabled={items.length === 0}
                    data-testid="subscribers-export-btn"
                    className="inline-flex items-center gap-2 border border-mir-border hover:border-mir-blue disabled:opacity-50 text-mir-text px-5 py-3 text-xs uppercase tracking-[0.15em] transition-colors bg-white"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {loading ? (
                <div className="text-sm text-mir-muted">Loading…</div>
            ) : items.length === 0 ? (
                <div
                    className="border border-dashed border-mir-border p-12 text-center text-mir-muted text-sm"
                    data-testid="subscribers-empty"
                >
                    No subscribers yet.
                </div>
            ) : (
                <div className="border border-mir-border bg-white overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-mir-border text-left text-[11px] uppercase tracking-[0.2em] text-mir-muted">
                                <th className="px-5 py-3 font-medium">Email</th>
                                <th className="px-5 py-3 font-medium">Source</th>
                                <th className="px-5 py-3 font-medium">Subscribed</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((s) => (
                                <tr
                                    key={s.id}
                                    data-testid={`subscriber-row-${s.id}`}
                                    className="border-b border-mir-border last:border-0"
                                >
                                    <td className="px-5 py-3">
                                        <a
                                            href={`mailto:${s.email}`}
                                            className="inline-flex items-center gap-2 text-mir-text hover:text-mir-blue"
                                        >
                                            <Mail className="w-3.5 h-3.5 text-mir-muted" />
                                            {s.email}
                                        </a>
                                    </td>
                                    <td className="px-5 py-3 text-mir-muted">{s.source || "—"}</td>
                                    <td className="px-5 py-3 text-mir-muted">
                                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button
                                            onClick={() => remove(s.id)}
                                            data-testid={`subscriber-delete-${s.id}`}
                                            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] text-red-600 hover:underline"
                                        >
                                            <Trash2 className="w-3 h-3" /> Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
