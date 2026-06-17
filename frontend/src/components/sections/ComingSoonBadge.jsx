import React from "react";
import { Clock } from "lucide-react";

/** Short, locale-aware label for a schedule ISO (or legacy date-only). */
export function formatScheduleShort(iso) {
    if (!iso) return null;
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
    const d = new Date(dateOnly ? `${iso}T00:00` : iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(
        "en-US",
        dateOnly
            ? { month: "short", day: "numeric", year: "numeric" }
            : { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    );
}

/** "Coming soon · <date>" pill shown on listing cards for scheduled content. */
export default function ComingSoonBadge({ scheduledFor, className = "", testId }) {
    const label = formatScheduleShort(scheduledFor);
    return (
        <span
            data-testid={testId}
            className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-mir-blue border border-mir-blue/30 bg-mir-blue/5 px-2.5 py-1 ${className}`}
        >
            <Clock className="w-3 h-3" />
            Coming soon{label ? ` · ${label}` : ""}
        </span>
    );
}
