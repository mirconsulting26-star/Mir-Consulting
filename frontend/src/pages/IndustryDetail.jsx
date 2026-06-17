import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/sections/Section";
import CTASection from "@/components/sections/CTASection";
import RelatedRail from "@/components/sections/RelatedRail";
import Seo from "@/lib/Seo";
import { INDUSTRIES, INDUSTRY_HERO_IMAGES } from "@/lib/content";
import { fetchWorks, fetchTeam } from "@/lib/api";

export default function IndustryDetail() {
    const { slug } = useParams();
    const industry = INDUSTRIES.find((i) => i.slug === slug);
    const [works, setWorks] = React.useState([]);
    const [team, setTeam] = React.useState([]);

    React.useEffect(() => {
        fetchWorks().then((d) => setWorks(d || [])).catch(() => {});
        fetchTeam().then((d) => setTeam(d || [])).catch(() => {});
    }, []);

    if (!industry) return <Navigate to="/industries" replace />;

    const relatedWorks = (works || []).filter((w) => (w.industry_slugs || []).includes(slug));
    const relatedTeam = (team || []).filter((m) => (m.industry_slugs || []).includes(slug));
    const img = INDUSTRY_HERO_IMAGES[slug];

    const cols = [
        { label: "Challenges", items: industry.challenges },
        { label: "Our solutions", items: industry.solutions },
        { label: "Use cases", items: industry.useCases },
    ];

    return (
        <div data-testid="industry-detail-page" className="bg-mir-bg">
            <Seo
                title={industry.title}
                description={industry.summary}
                path={`/industries/${slug}`}
            />

            <section data-testid="industry-hero" className="relative bg-mir-midnight text-white overflow-hidden">
                {img && (
                    <img
                        src={img}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-mir-midnight via-mir-midnight/80 to-mir-midnight/30" />
                <div className="absolute inset-0 grid-backdrop-dark opacity-20 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
                    <Link
                        to="/industries"
                        data-testid="industry-back"
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-10"
                    >
                        <ArrowLeft className="w-4 h-4" /> All industries
                    </Link>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blueSoft mb-6">
                        Industry
                    </div>
                    <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.05] max-w-4xl">
                        {industry.title}
                    </h1>
                    <p className="mt-8 text-white/75 text-lg max-w-3xl leading-relaxed">
                        {industry.summary}
                    </p>
                </div>
            </section>

            <Section testId="industry-detail-body" className="bg-mir-bg border-t border-mir-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {cols.map((c) => (
                        <div key={c.label}>
                            <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-5">
                                {c.label}
                            </div>
                            <ul className="space-y-3">
                                {c.items.map((it) => (
                                    <li key={it} className="flex items-start gap-3 text-sm text-mir-textSoft">
                                        <span className="w-1.5 h-1.5 rounded-full bg-mir-blue mt-2 shrink-0" />
                                        {it}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <Link
                    to="/contact"
                    data-testid="industry-detail-cta"
                    className="mt-12 group inline-flex items-center gap-2 border border-mir-text/15 hover:border-mir-blue px-5 py-3 text-sm text-mir-text transition-colors"
                >
                    Discuss your {industry.title.split(/&| /)[0].toLowerCase()} operation
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </Section>

            <RelatedRail
                works={relatedWorks}
                team={relatedTeam}
                workHeading="Related work in this sector"
                teamHeading="Team with sector experience"
            />

            <CTASection
                title={`Operating in ${industry.title}?`}
                subtitle="Tell us about your context — we'll respond with a tailored, senior-led perspective."
                secondaryLabel="All industries"
                secondaryTo="/industries"
            />
        </div>
    );
}
