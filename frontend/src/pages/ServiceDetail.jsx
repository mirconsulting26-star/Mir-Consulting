import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { Section } from "@/components/sections/Section";
import CTASection from "@/components/sections/CTASection";
import RelatedRail from "@/components/sections/RelatedRail";
import Seo from "@/lib/Seo";
import { SERVICES, SERVICE_HERO_IMAGES } from "@/lib/content";
import { fetchWorks, fetchTeam } from "@/lib/api";

export default function ServiceDetail() {
    const { slug } = useParams();
    const service = SERVICES.find((s) => s.slug === slug);
    const [works, setWorks] = React.useState([]);
    const [team, setTeam] = React.useState([]);

    React.useEffect(() => {
        fetchWorks().then((d) => setWorks(d || [])).catch(() => {});
        fetchTeam().then((d) => setTeam(d || [])).catch(() => {});
    }, []);

    if (!service) return <Navigate to="/services" replace />;

    const relatedWorks = (works || []).filter((w) => (w.service_slugs || []).includes(slug));
    const relatedTeam = (team || []).filter((m) => (m.service_slugs || []).includes(slug));
    const img = SERVICE_HERO_IMAGES[slug];

    return (
        <div data-testid="service-detail-page" className="bg-mir-bg">
            <Seo
                title={service.title}
                description={service.summary}
                path={`/services/${slug}`}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Service",
                    name: service.title,
                    description: service.summary,
                    provider: { "@type": "Organization", name: "MIR Consulting" },
                    areaServed: "Worldwide",
                }}
            />

            <section data-testid="service-hero" className="relative bg-mir-midnight text-white overflow-hidden">
                {img && (
                    <img
                        src={img}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover opacity-25"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-mir-midnight via-mir-midnight/85 to-mir-midnight/40" />
                <div className="absolute inset-0 grid-backdrop-dark opacity-20 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
                    <Link
                        to="/services"
                        data-testid="service-back"
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-10"
                    >
                        <ArrowLeft className="w-4 h-4" /> All services
                    </Link>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blueSoft mb-6">
                        Service
                    </div>
                    <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.05] max-w-4xl">
                        {service.title}
                    </h1>
                    <p className="mt-6 text-mir-blueSoft text-lg">{service.tagline}</p>
                    <p className="mt-6 text-white/75 text-lg max-w-3xl leading-relaxed">
                        {service.summary}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-2">
                        {service.industries.map((ind) => (
                            <span
                                key={ind}
                                className="text-[11px] uppercase tracking-[0.15em] text-white/70 border border-white/20 px-3 py-1.5"
                            >
                                {ind}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <Section testId="service-detail-body" className="bg-mir-bg border-t border-mir-border">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-5">
                            Problems we solve
                        </div>
                        <ul className="space-y-3">
                            {service.problems.map((p) => (
                                <li key={p} className="flex items-start gap-3 text-sm text-mir-textSoft">
                                    <span className="w-1.5 h-1.5 rounded-full bg-mir-blue mt-2 shrink-0" />
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-5">
                            Offerings
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {service.offerings.map((o) => (
                                <span
                                    key={o}
                                    className="text-xs text-mir-textSoft border border-mir-border bg-white px-3 py-1.5"
                                >
                                    {o}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-5">
                            Outcomes
                        </div>
                        <ul className="space-y-4">
                            {service.outcomes.map((o) => (
                                <li key={o} className="flex items-start gap-3 text-sm text-mir-text">
                                    <Check className="w-4 h-4 text-mir-blue mt-0.5 shrink-0" />
                                    {o}
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/contact"
                            data-testid="service-detail-cta"
                            className="mt-10 group inline-flex items-center gap-2 border border-mir-text/15 hover:border-mir-blue px-5 py-3 text-sm text-mir-text transition-colors"
                        >
                            Discuss this practice
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </Section>

            <RelatedRail
                works={relatedWorks}
                team={relatedTeam}
                workHeading="Related work"
                teamHeading="Practitioners in this practice"
            />

            <CTASection
                title={`Talk to us about ${service.title}.`}
                subtitle="A short, senior-led conversation to map this practice to your operating context."
                secondaryLabel="All services"
                secondaryTo="/services"
            />
        </div>
    );
}
