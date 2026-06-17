import React from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/sections/Section";
import HeroImageLayer from "@/components/sections/HeroImageLayer";
import CTASection from "@/components/sections/CTASection";
import Seo from "@/lib/Seo";
import { fetchCaseStudies } from "@/lib/api";
import { useLiveData } from "@/lib/useLiveData";
import { formatScheduleShort } from "@/components/sections/ComingSoonBadge";
import { PAGE_HERO_IMAGES } from "@/lib/content";

const FALLBACK = [
    {
        sector: "Hospitality",
        title: "Group-Wide Operational Reporting for a Multi-Property Hotel Chain",
        summary:
            "Engineering a single source of operational truth across 12+ properties, with occupancy, revenue and F&B KPIs unified into a leadership-grade dashboard.",
    },
    {
        sector: "Retail",
        title: "Inventory Intelligence Across Online & Physical Channels",
        summary:
            "Reducing stock-outs by 38% and freeing margin via channel-aware inventory and replenishment intelligence.",
    },
    {
        sector: "Logistics",
        title: "Live SLA & Vendor Performance Visibility Platform",
        summary:
            "Real-time exception monitoring, vendor scorecards, and movement-level visibility — replacing weeks-old spreadsheets.",
    },
    {
        sector: "Manufacturing",
        title: "Production KPI Architecture for a Mid-Market Plant Network",
        summary:
            "OEE, throughput-vs-plan, and quality analytics rolled up into an executive operating dashboard across four plants.",
    },
];

export default function CaseStudies() {
    const data = useLiveData("case_studies", fetchCaseStudies);
    const items = data && data.length > 0 ? data : data === undefined ? null : FALLBACK;
    const usingFallback = items === FALLBACK;

    const list = items || [];

    return (
        <div data-testid="case-studies-page" className="bg-mir-bg">
            <Seo
                title="Case Studies"
                description="Selected MIR Consulting engagements — marketing, e-commerce (Shopify, WooCommerce, Wix, Amazon, eBay, Etsy), strategy, automation and analytics work for D2C brands, marketplace sellers, hospitality, retail, logistics and manufacturing."
                path="/case-studies"
            />
            <Section testId="case-studies-hero" className="relative grain-overlay bg-mir-bg">
                <HeroImageLayer src={PAGE_HERO_IMAGES.caseStudies} side="left" />
                <div className="absolute inset-0 grid-backdrop opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_top_left,_black_30%,_transparent_70%)]" />
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full halo blur-2xl pointer-events-none" />
                <div className="relative">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-6">
                        Case Studies
                    </div>
                    <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.05] max-w-5xl text-mir-text">
                        Engagements ship.{" "}
                        <span className="text-mir-blue">Stories follow.</span>
                    </h1>
                    <p className="mt-10 text-lg sm:text-xl text-mir-muted max-w-3xl leading-relaxed">
                        MIR Consulting&apos;s full case studies are published as client
                        engagements complete confidentiality reviews. A curated preview
                        of upcoming case studies is shared below.
                    </p>
                </div>
            </Section>

            <Section testId="case-studies-list" className="border-t border-mir-border bg-mir-surface">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-mir-border border border-mir-border">
                    {list.map((c, i) => {
                        const scheduled = !!c.is_scheduled;
                        const inner = (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue">
                                        {c.sector}
                                    </div>
                                    {usingFallback || scheduled ? (
                                        <div className="inline-flex items-center gap-2 border border-mir-blue/30 bg-mir-blue/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-mir-blue">
                                            <Clock className="w-3 h-3" />
                                            Coming soon
                                            {scheduled && c.scheduled_for
                                                ? ` · ${formatScheduleShort(c.scheduled_for)}`
                                                : ""}
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 text-mir-blue text-sm font-medium">
                                            Read case
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-heading text-xl md:text-2xl font-medium text-mir-text leading-snug">
                                    {c.title}
                                </h3>
                                <p className="mt-4 text-sm text-mir-muted leading-relaxed">
                                    {c.summary || c.excerpt}
                                </p>
                            </>
                        );
                        const cls = "bg-white p-10 hover:bg-mir-surface transition-colors relative";
                        const key = c.slug || c.id || i;
                        return usingFallback || !c.slug ? (
                            <div
                                key={key}
                                data-testid={`case-study-card-${key}`}
                                className={cls}
                            >
                                {inner}
                            </div>
                        ) : (
                            <Link
                                key={key}
                                to={`/case-studies/${c.slug}`}
                                data-testid={`case-study-card-${key}`}
                                className={`${cls} block`}
                            >
                                {inner}
                            </Link>
                        );
                    })}
                </div>
            </Section>

            <CTASection
                title="Curious how MIR would approach your engagement?"
                subtitle="We share an anonymized case-walkthrough during our intro consultations — relevant to your industry and operating context."
                ctaLabel="Request a walkthrough"
                secondaryLabel="See industries"
                secondaryTo="/industries"
            />
        </div>
    );
}
