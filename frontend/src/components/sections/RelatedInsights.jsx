import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { fetchPosts } from "@/lib/api";

function overlaps(a = [], b = []) {
    if (!a.length || !b.length) return 0;
    const set = new Set(a);
    return b.filter((x) => set.has(x)).length;
}

/**
 * "Related insights" rail. Ranks other published posts by shared
 * service_slugs / industry_slugs, falling back to most-recent posts.
 */
export default function RelatedInsights({ current, limit = 3 }) {
    const [posts, setPosts] = React.useState([]);

    React.useEffect(() => {
        let cancelled = false;
        fetchPosts()
            .then((data) => {
                if (!cancelled) setPosts(Array.isArray(data) ? data : []);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    const related = React.useMemo(() => {
        const others = posts.filter((p) => p.slug !== current?.slug && !p.is_scheduled);
        const scored = others
            .map((p) => ({
                p,
                score:
                    overlaps(p.service_slugs, current?.service_slugs) * 2 +
                    overlaps(p.industry_slugs, current?.industry_slugs),
            }))
            .sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map((s) => s.p);
    }, [posts, current, limit]);

    if (related.length === 0) return null;

    return (
        <section
            data-testid="related-insights"
            className="border-t border-mir-border bg-mir-surface py-16 md:py-20"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-8">
                    Related insights
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mir-border border border-mir-border">
                    {related.map((p) => (
                        <Link
                            key={p.id || p.slug}
                            to={`/blog/${p.slug}`}
                            data-testid={`related-insight-${p.slug}`}
                            className="group bg-white p-6 hover:bg-mir-bg transition-colors flex flex-col"
                        >
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-mir-blue mb-3">
                                <BookOpen className="w-3.5 h-3.5" />
                                {p.category}
                            </div>
                            <h3 className="font-heading text-lg text-mir-text leading-snug group-hover:text-mir-blue transition-colors">
                                {p.title}
                            </h3>
                            <p className="mt-3 text-sm text-mir-muted line-clamp-3 flex-1">
                                {p.excerpt}
                            </p>
                            <span className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] text-mir-text">
                                Read
                                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
