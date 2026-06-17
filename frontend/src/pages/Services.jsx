import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { Section } from "@/components/sections/Section";
import HeroImageLayer from "@/components/sections/HeroImageLayer";
import CTASection from "@/components/sections/CTASection";
import LeadMagnetSection from "@/components/sections/LeadMagnetSection";
import Seo from "@/lib/Seo";
import { SERVICES, SERVICE_HERO_IMAGES, PAGE_HERO_IMAGES } from "@/lib/content";

export default function Services() {
    return (
        <div data-testid="services-page" className="bg-mir-bg">
            <Seo
                title="Services"
                path="/services"
                description="Senior-led MIR Consulting practices: strategy, marketing, e-commerce (Shopify, WooCommerce, Wix, Amazon, eBay, Etsy), analytics, automation, IT advisory and digital transformation — delivered by senior-only engagement teams. Free initial consultation."
                schema={{
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    name: "MIR Consulting Services",
                    itemListElement: SERVICES.map((s, i) => ({
                        "@type": "ListItem",
                        position: i + 1,
                        item: {
                            "@type": "Service",
                            name: s.title,
                            description: s.summary,
                            url: typeof window !== "undefined"
                                ? `${window.location.origin}/services#${s.slug}`
                                : `/services#${s.slug}`,
                            provider: { "@type": "Organization", name: "MIR Consulting" },
                            areaServed: "Worldwide",
                        },
                    })),
                }}
            />
            <Section testId="services-hero" className="relative grain-overlay bg-mir-bg">
                <HeroImageLayer src={PAGE_HERO_IMAGES.services} side="right" />
                <div className="absolute inset-0 grid-backdrop opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_top_right,_black_30%,_transparent_70%)]" />
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full halo blur-2xl pointer-events-none" />
                <div className="relative">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-6">
                        Services
                    </div>
                    <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.05] max-w-5xl text-mir-text">
                        Seven integrated practices.
                        <br />
                        <span className="text-mir-blue">One operating partner.</span>
                    </h1>
                    <p className="mt-10 text-lg sm:text-xl text-mir-muted max-w-3xl leading-relaxed">
                        Every MIR Consulting engagement is sized to the business
                        problem — from focused dashboard programs to full
                        operating-model transformation.
                    </p>
                    <div
                        data-testid="services-free-pill"
                        className="mt-8 inline-flex items-center gap-2 border border-mir-blue/30 bg-mir-blue/5 px-4 py-2 text-xs sm:text-sm text-mir-text"
                    >
                        <span className="w-1.5 h-1.5 bg-mir-blue rounded-full animate-pulse-soft" />
                        Not sure where to start?&nbsp;
                        <span className="text-mir-blue font-medium">Your first call is free</span>
                        &nbsp;— we&apos;ll help you scope it.
                    </div>
                </div>
            </Section>

            <Section testId="services-list" className="border-t border-mir-border !py-12 bg-mir-bg">
                <div className="space-y-px">
                    {SERVICES.map((s, i) => (
                        <motion.div
                            key={s.slug}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5 }}
                            data-testid={`service-detail-${s.slug}`}
                            className="grid grid-cols-1 lg:grid-cols-12 border border-mir-border bg-white"
                        >
                            {/* Image panel — mirrors the Industries list visual */}
                            <div className="lg:col-span-5 relative min-h-[320px] overflow-hidden border-b lg:border-b-0 lg:border-r border-mir-border bg-mir-midnight">
                                <div
                                    className="absolute inset-0 bg-cover bg-center opacity-70"
                                    style={{ backgroundImage: `url(${SERVICE_HERO_IMAGES[s.slug]})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-mir-midnight via-mir-midnight/70 to-transparent" />
                                <div className="relative h-full p-8 md:p-12 flex flex-col justify-end">
                                    <div className="font-heading text-mir-blueSoft text-sm tracking-widest mb-4">
                                        Practice /0{i + 1}
                                    </div>
                                    <Link
                                        to={`/services/${s.slug}`}
                                        data-testid={`service-link-${s.slug}`}
                                    >
                                        <h2 className="font-heading text-3xl md:text-4xl font-light tracking-tight text-white hover:text-mir-blueSoft transition-colors">
                                            {s.title}
                                        </h2>
                                    </Link>
                                    <p className="mt-3 text-mir-blueSoft text-sm tracking-wide">
                                        {s.tagline}
                                    </p>
                                    <p className="mt-4 text-white/80 text-sm max-w-md leading-relaxed">
                                        {s.summary}
                                    </p>
                                    <Link
                                        to={`/services/${s.slug}`}
                                        data-testid={`service-view-${s.slug}`}
                                        className="mt-6 group inline-flex items-center gap-2 text-sm text-mir-blueSoft font-medium"
                                    >
                                        View full practice
                                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                            {/* Details */}
                            <div className="lg:col-span-7 p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-5">
                                        Problems we solve
                                    </div>
                                    <ul className="space-y-3">
                                        {s.problems.map((p) => (
                                            <li
                                                key={p}
                                                className="flex items-start gap-3 text-sm text-mir-textSoft"
                                            >
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
                                        {s.offerings.map((o) => (
                                            <span
                                                key={o}
                                                className="text-xs text-mir-textSoft border border-mir-border bg-mir-surface px-3 py-1.5"
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
                                        {s.outcomes.map((o) => (
                                            <li
                                                key={o}
                                                className="flex items-start gap-3 text-sm text-mir-text"
                                            >
                                                <Check className="w-4 h-4 text-mir-blue mt-0.5 shrink-0" />
                                                {o}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        to="/contact"
                                        data-testid={`service-cta-${s.slug}`}
                                        className="mt-8 group inline-flex items-center gap-2 text-sm text-mir-blue font-medium"
                                    >
                                        Discuss this practice
                                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>

            <LeadMagnetSection />

            <CTASection
                title="Need a sharper view of which practice fits?"
                subtitle="Send a brief description of your operating context. We'll respond with a tailored, senior-led path forward."
                ctaLabel="Start the conversation"
                secondaryLabel="See industries"
                secondaryTo="/industries"
            />
        </div>
    );
}
