import React from "react";

/**
 * Multi-select chip selector for tagging content with service/industry slugs.
 * Props:
 *   label        section label
 *   options      [{ slug, title }]
 *   value        array of selected slugs
 *   onChange     (newArray) => void
 *   testIdPrefix data-testid namespace
 */
export default function TagSelector({ label, options = [], value = [], onChange, testIdPrefix = "tag" }) {
    const toggle = (slug) => {
        if (value.includes(slug)) onChange(value.filter((s) => s !== slug));
        else onChange([...value, slug]);
    };
    return (
        <div className="space-y-2" data-testid={`${testIdPrefix}-selector`}>
            {label && (
                <label className="block text-xs uppercase tracking-[0.2em] text-mir-muted">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2">
                {options.map((o) => {
                    const active = value.includes(o.slug);
                    return (
                        <button
                            key={o.slug}
                            type="button"
                            onClick={() => toggle(o.slug)}
                            aria-pressed={active}
                            data-testid={`${testIdPrefix}-${o.slug}`}
                            className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] border transition-colors ${
                                active
                                    ? "border-mir-blue bg-mir-blue/10 text-mir-blue"
                                    : "border-mir-border bg-white text-mir-textSoft hover:border-mir-text hover:text-mir-text"
                            }`}
                        >
                            {o.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
