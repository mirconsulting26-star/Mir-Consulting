import React from "react";

export function SectionHeader({ overline, title, subtitle, align = "left", testId, dark = false }) {
    const textPrimary = dark ? "text-white" : "text-mir-text";
    const textMuted = dark ? "text-white/70" : "text-mir-muted";
    return (
        <div
            data-testid={testId}
            className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
        >
            {overline && (
                <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-4 font-medium">
                    {overline}
                </div>
            )}
            <h2 className={`font-heading text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight ${textPrimary} leading-[1.05]`}>
                {title}
            </h2>
            {subtitle && (
                <p className={`mt-6 ${textMuted} text-base sm:text-lg leading-relaxed`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export function Section({ children, className = "", id, testId }) {
    return (
        <section
            id={id}
            data-testid={testId}
            className={`py-20 md:py-28 ${className}`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">{children}</div>
        </section>
    );
}

export function StatBlock({ value, label, testId, dark = false }) {
    return (
        <div data-testid={testId} className={`border-t ${dark ? "border-white/15" : "border-mir-border"} pt-5`}>
            <div className={`font-heading text-3xl sm:text-4xl ${dark ? "text-white" : "text-mir-text"} font-light tracking-tight`}>
                {value}
            </div>
            <div className={`text-xs uppercase tracking-[0.2em] ${dark ? "text-white/60" : "text-mir-muted"} mt-2`}>
                {label}
            </div>
        </div>
    );
}
