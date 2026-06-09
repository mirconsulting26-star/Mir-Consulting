import React from "react";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders Blog / Case-Study body content.
 *
 * Detection rule: if the content's first non-whitespace character is `<` we
 * treat it as HTML produced by the TipTap editor and sanitize it via
 * DOMPurify. Otherwise we fall back to react-markdown (covers any legacy
 * markdown posts created before the WYSIWYG upgrade).
 *
 * The class list mirrors the editor's prose styles so the preview, the
 * editor and the public page all look identical.
 */
export default function RichContent({ html, className = "" }) {
    const proseCls =
        "prose prose-lg prose-slate max-w-none " +
        "prose-headings:font-heading prose-headings:text-mir-text " +
        "prose-p:text-mir-textSoft prose-p:leading-relaxed " +
        "prose-a:text-mir-blue " +
        "prose-strong:text-mir-text " +
        "prose-img:border prose-img:border-mir-border prose-img:my-8 prose-img:rounded-none prose-img:max-w-full prose-img:h-auto " +
        "prose-blockquote:border-l-mir-blue prose-blockquote:text-mir-text " +
        "prose-code:text-mir-blueInk prose-code:bg-mir-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-none prose-code:before:content-none prose-code:after:content-none " +
        className;

    const trimmed = (html || "").trim();
    if (!trimmed) return null;

    const isHtml = trimmed.startsWith("<");
    if (isHtml) {
        const clean = DOMPurify.sanitize(trimmed, {
            ADD_ATTR: ["target", "rel"],
        });
        return (
            <div
                data-testid="rich-content-html"
                className={proseCls}
                dangerouslySetInnerHTML={{ __html: clean }}
            />
        );
    }

    return (
        <div data-testid="rich-content-md" className={proseCls}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{trimmed}</ReactMarkdown>
        </div>
    );
}
