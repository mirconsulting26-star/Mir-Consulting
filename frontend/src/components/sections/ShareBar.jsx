import React from "react";
import { Link2, Linkedin, Facebook, MessageCircle, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

// X (formerly Twitter) brand glyph — lucide doesn't ship the new X logo.
function XIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

/**
 * Share control for published content (blog posts, case studies, videos).
 * Copies the canonical URL and offers LinkedIn / X / Facebook / WhatsApp
 * share intents, plus the native share sheet on mobile.
 */
export default function ShareBar({ title = "", testId = "share-bar", className = "" }) {
    const [copied, setCopied] = React.useState(false);
    const url = typeof window !== "undefined" ? window.location.href : "";
    const enc = encodeURIComponent(url);
    const encTitle = encodeURIComponent(title);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Couldn't copy the link — please copy it from the address bar.");
        }
    };

    const nativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch {
                /* user dismissed — no-op */
            }
        } else {
            copy();
        }
    };

    const links = [
        {
            key: "linkedin",
            label: "LinkedIn",
            Icon: Linkedin,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
        },
        {
            key: "x",
            label: "X",
            Icon: XIcon,
            href: `https://twitter.com/intent/tweet?url=${enc}&text=${encTitle}`,
        },
        {
            key: "facebook",
            label: "Facebook",
            Icon: Facebook,
            href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
        },
        {
            key: "whatsapp",
            label: "WhatsApp",
            Icon: MessageCircle,
            href: `https://wa.me/?text=${encTitle}%20${enc}`,
        },
    ];

    return (
        <div data-testid={testId} className={`flex flex-wrap items-center gap-2 ${className}`}>
            <span className="text-[11px] uppercase tracking-[0.2em] text-mir-muted mr-1">Share</span>
            <button
                type="button"
                onClick={copy}
                data-testid={`${testId}-copy`}
                aria-label="Copy link"
                className="inline-flex items-center gap-2 border border-mir-border hover:border-mir-blue hover:text-mir-blue text-mir-textSoft px-3 py-2 text-xs uppercase tracking-[0.15em] transition-colors"
            >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy link"}
            </button>
            {links.map(({ key, label, Icon, href }) => (
                <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Share on ${label}`}
                    data-testid={`${testId}-${key}`}
                    className="inline-flex items-center justify-center w-9 h-9 border border-mir-border hover:border-mir-blue hover:text-mir-blue text-mir-textSoft transition-colors"
                >
                    <Icon className="w-4 h-4" />
                </a>
            ))}
            <button
                type="button"
                onClick={nativeShare}
                data-testid={`${testId}-native`}
                aria-label="Share"
                className="sm:hidden inline-flex items-center justify-center w-9 h-9 border border-mir-border hover:border-mir-blue text-mir-textSoft transition-colors"
            >
                <Share2 className="w-4 h-4" />
            </button>
        </div>
    );
}
