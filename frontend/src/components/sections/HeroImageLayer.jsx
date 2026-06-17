import React from "react";

/**
 * Subtle, masked background-image layer for page heroes.
 *
 * Renders BEHIND the existing grid/halo decorations so hero text stays readable.
 * If the image URL fails to load it simply hides itself (the grid/halo remain),
 * so a broken stock-photo link never breaks the layout.
 *
 * Props:
 *   src     image URL (usually from PAGE_HERO_IMAGES in src/lib/content.js)
 *   side    "left" | "right" — which corner the radial mask focuses on
 *           (match it to the hero's existing halo position)
 *   opacity 0–1, default 0.08 (very subtle on the light theme)
 */
export default function HeroImageLayer({ src, side = "right", opacity = 0.08 }) {
    if (!src) return null;
    const mask =
        side === "left"
            ? "radial-gradient(ellipse at top left, black 15%, transparent 70%)"
            : "radial-gradient(ellipse at top right, black 15%, transparent 70%)";
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <img
                src={src}
                alt=""
                className="w-full h-full object-cover grayscale"
                style={{ opacity, WebkitMaskImage: mask, maskImage: mask }}
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
            />
        </div>
    );
}
