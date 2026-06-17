import React from "react";

const pad = (n) => String(n).padStart(2, "0");

/** Split a stored ISO datetime (or legacy date-only) into local date + time parts. */
function parseToParts(iso) {
    if (!iso) return { date: "", time: "" };
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return { date: iso, time: "" }; // legacy date-only
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: "", time: "" };
    return {
        date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
}

/** Combine local date + time into a full UTC ISO string. A date alone is enough
 *  (time defaults to 00:00) — so a schedule is never silently dropped. */
function combineToIso(date, time) {
    if (!date) return "";
    const d = new Date(`${date}T${time || "00:00"}`);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/** Human-friendly label of a stored schedule ISO, in the viewer's local timezone. */
export function formatScheduleLabel(iso) {
    if (!iso) return null;
    const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00` : iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function isFutureSchedule(iso) {
    if (!iso) return false;
    const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00` : iso);
    return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

/**
 * Schedule picker built from a separate date + time input.
 *
 * Why not <input type="datetime-local">? That control returns an EMPTY value
 * until BOTH date and time are filled, so picking only a date silently dropped
 * the schedule and the post published immediately. Here a date alone schedules
 * for 00:00; the time is optional.
 */
export default function DateTimeField({ value, onChange, testId }) {
    const { date, time } = parseToParts(value);
    return (
        <div className="flex flex-wrap items-center gap-2">
            <input
                type="date"
                value={date}
                data-testid={testId}
                onChange={(e) => onChange(combineToIso(e.target.value, time))}
                className="px-3 py-2 border border-mir-border text-sm bg-white text-mir-text focus:outline-none focus:border-mir-blue"
            />
            <input
                type="time"
                value={time}
                disabled={!date}
                data-testid={`${testId}-time`}
                onChange={(e) => onChange(combineToIso(date, e.target.value))}
                className="px-3 py-2 border border-mir-border text-sm bg-white text-mir-text focus:outline-none focus:border-mir-blue disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
}
