import React from "react";

const pad = (n) => String(n).padStart(2, "0");

/** Convert a stored ISO datetime (or legacy date-only) to the value a
 *  <input type="datetime-local"> expects, in the viewer's LOCAL timezone. */
export function isoToLocalInput(iso) {
    if (!iso) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return `${iso}T00:00`; // legacy date-only
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
}

/** Convert the local-time input value back to a full UTC ISO string for storage. */
export function localInputToIso(local) {
    if (!local) return "";
    const d = new Date(local); // parsed as local time
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/**
 * A date + time picker for scheduling. Stores a full UTC ISO string so the
 * backend can decide publish/mask down to the minute. Shows/edits in the
 * admin's local timezone.
 */
export default function DateTimeField({ value, onChange, testId }) {
    return (
        <input
            type="datetime-local"
            value={isoToLocalInput(value)}
            onChange={(e) => onChange(localInputToIso(e.target.value))}
            data-testid={testId}
            className="w-full px-3 py-2 border border-mir-border text-sm bg-white text-mir-text focus:outline-none focus:border-mir-blue"
        />
    );
}
