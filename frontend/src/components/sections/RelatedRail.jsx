import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Briefcase, PlayCircle } from "lucide-react";
import { Section } from "@/components/sections/Section";

const TYPE_ICON = { insight: BookOpen, case_study: Briefcase, video: PlayCircle };
const TYPE_LABEL = { insight: "Insight", case_study: "Case Study", video: "Video" };

const hrefForWork = (it) =>
    it.type === "video"
        ? `/our-work/video/${it.slug}`
        : it.type === "case_study"
        ? `/case-studies/${it.slug}`
        : `/blog/${it.slug}`;

/**
 * Reusable "related content" rail used by Service/Industry detail and Team profile pages.
 * Renders a grid of work items and/or a grid of team members. Returns null when both empty.
 */
export default function RelatedRail({
    works = [],
    team = [],
    workHeading = "Related work",
    teamHeading = "Relevant team",
}) {
    if (works.length === 0 && team.length === 0) return null;
    return (
        <Section testId="related-rail" className="bg-mir-surface border-t border-mir-border">
            {works.length > 0 && (
                <div className="mb-16" data-testid="related-rail-works">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-8">
                        {workHeading}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mir-border border border-mir-border">
                        {works.slice(0, 6).map((it, i) => {
                            const Icon = TYPE_ICON[it.type] || BookOpen;
                            return (
                                <Link
                                    key={`${it.type}-${it.slug || i}`}
                                    to={hrefForWork(it)}
                                    data-testid={`related-work-${it.slug || i}`}
                                    className="group bg-white p-6 hover:bg-mir-bg transition-colors flex flex-col"
                                >
                                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-mir-blue mb-3">
                                        <Icon className="w-3.5 h-3.5" />
                                        {TYPE_LABEL[it.type]} · {it.category}
                                    </div>
                                    <h3 className="font-heading text-lg text-mir-text leading-snug group-hover:text-mir-blue transition-colors">
                                        {it.title}
                                    </h3>
                                    <p className="mt-3 text-sm text-mir-muted line-clamp-3 flex-1">
                                        {it.excerpt}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] text-mir-text">
                                        Open
                                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {team.length > 0 && (
                <div data-testid="related-rail-team">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-8">
                        {teamHeading}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-mir-border border border-mir-border">
                        {team.slice(0, 8).map((m) => (
                            <ProfileCard key={m.id} m={m} />
                        ))}
                    </div>
                </div>
            )}
        </Section>
    );
}

function ProfileCard({ m }) {
    const inner = (
        <div className="bg-white p-6 h-full flex flex-col">
            <div className="w-16 h-16 bg-mir-surface border border-mir-border overflow-hidden mb-4">
                {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-mir-muted text-xs">
                        {m.name?.[0] || "?"}
                    </div>
                )}
            </div>
            <div className="font-medium text-mir-text">{m.name}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-mir-blue mt-1">{m.role}</div>
            {m.slug && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] text-mir-blue">
                    View profile
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
            )}
        </div>
    );
    return m.slug ? (
        <Link
            to={`/team/${m.slug}`}
            data-testid={`related-team-${m.slug}`}
            className="group hover:bg-mir-bg transition-colors"
        >
            {inner}
        </Link>
    ) : (
        <div data-testid={`related-team-${m.id}`}>{inner}</div>
    );
}
