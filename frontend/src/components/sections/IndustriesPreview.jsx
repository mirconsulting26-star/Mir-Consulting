import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/sections/Section";
import { INDUSTRIES } from "@/lib/content";

const IMAGE_MAP = {
    hospitality:
        "https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&q=80&w=1400",
    retail:
        "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&q=80&w=1400",
    logistics:
        "https://images.unsplash.com/photo-1557761469-f29c6e201784?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbG9naXN0aWNzJTIwd2FyZWhvdXNlJTIwYWJzdHJhY3R8ZW58MHx8fHwxNzgwODQ0NTUyfDA&ixlib=rb-4.1.0&q=85",
    manufacturing:
        "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80&w=1400",
    technology:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1400",
    smes:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1400",
};

// Bento layout — 12-column grid, 6 cards, no empty cells.
// Row 1: 7 + 5      (big hero + tall)
// Row 2: 5 + 7      (tall continues + wide)
// Row 3: 6 + 6      (two equal)
const LAYOUT = [
    { span: "md:col-span-7 md:row-span-2", h: "min-h-[280px] md:min-h-[560px]", featured: true },
    { span: "md:col-span-5", h: "min-h-[260px] md:min-h-[270px]" },
    { span: "md:col-span-5", h: "min-h-[260px] md:min-h-[270px]" },
    { span: "md:col-span-6", h: "min-h-[260px] md:min-h-[300px]" },
    { span: "md:col-span-6", h: "min-h-[260px] md:min-h-[300px]" },
    { span: "md:col-span-12", h: "min-h-[220px] md:min-h-[240px]", wide: true },
];

function IndustryCard({ ind, i, cfg }) {
    const image = IMAGE_MAP[ind.slug];
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: (i % 3) * 0.07 }}
            className={`relative group overflow-hidden border border-mir-border bg-mir-midnight ${cfg.h} ${cfg.span}`}
            data-testid={`industry-card-${ind.slug}`}
        >
            {/* Image with zoom-on-hover */}
            <div
                className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                style={{ backgroundImage: `url(${image})` }}
            />

            {/* Permanent dark wash for readability */}
            <div className="absolute inset-0 bg-mir-midnight/55 group-hover:bg-mir-midnight/45 transition-colors duration-500" />

            {/* Bottom gradient for text legibility */}
            <div
                className={`absolute inset-0 ${cfg.wide
                    ? "bg-gradient-to-r from-mir-midnight via-mir-midnight/70 to-mir-midnight/10"
                    : "bg-gradient-to-t from-mir-midnight via-mir-midnight/80 to-mir-midnight/15"
                    }`}
            />

            {/* Thin top accent line */}
            <span className="absolute top-0 left-0 h-[2px] w-12 bg-mir-blue transition-all duration-700 group-hover:w-1/2" />

            {/* Sector chip */}
            <div className="absolute top-5 right-5 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-mir-blueSoft/90 bg-white/8 backdrop-blur-sm border border-white/15 px-2.5 py-1">
                    Sector /0{i + 1}
                </span>
            </div>

            {/* Content */}
            <div
                className={`relative h-full p-7 md:p-9 flex ${cfg.wide ? "flex-row items-center gap-8" : "flex-col justify-end"
                    }`}
            >
                <div className={cfg.wide ? "flex-1" : ""}>
                    <h3
                        className={`font-heading font-medium tracking-tight text-white leading-tight ${cfg.featured
                            ? "text-3xl md:text-4xl lg:text-5xl"
                            : cfg.wide
                                ? "text-2xl md:text-3xl"
                                : "text-xl md:text-2xl"
                            }`}
                    >
                        {ind.title}
                    </h3>
                    <p
                        className={`mt-3 text-sm text-white/75 leading-relaxed ${cfg.featured ? "max-w-xl" : "max-w-md"
                            }`}
                    >
                        {ind.summary}
                    </p>
                </div>

                <Link
                    to="/industries"
                    aria-label={`Explore ${ind.title}`}
                    data-testid={`industry-card-link-${ind.slug}`}
                    className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-white border-b border-white/30 hover:border-mir-blueSoft hover:text-mir-blueSoft pb-1 self-start transition-colors ${cfg.wide ? "ml-auto" : "mt-6"
                        }`}
                >
                    Explore sector
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
            </div>
        </motion.div>
    );
}

export default function IndustriesPreview() {
    return (
        <Section testId="industries-preview-section" className="border-t border-mir-border bg-mir-surface">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14">
                <div className="lg:col-span-8">
                    <SectionHeader
                        overline="Industries We Serve"
                        title={
                            <>
                                Operationally fluent across the sectors that
                                <span className="text-mir-blue"> move modern economies</span>.
                            </>
                        }
                        subtitle="Hospitality, retail, logistics, manufacturing, technology and growth-stage SMEs trust MIR Consulting to translate ambition into operational reality."
                    />
                </div>
                <div className="lg:col-span-4 flex lg:justify-end items-end">
                    <Link
                        to="/industries"
                        data-testid="industries-preview-cta"
                        className="group inline-flex items-center gap-2 border border-mir-text/15 hover:border-mir-blue hover:text-mir-blue px-6 py-3 text-sm text-mir-text transition-colors"
                    >
                        Browse all industries
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
                {INDUSTRIES.map((ind, i) => (
                    <IndustryCard
                        key={ind.slug}
                        ind={ind}
                        i={i}
                        cfg={LAYOUT[i] || { span: "md:col-span-6", h: "min-h-[260px]" }}
                    />
                ))}
            </div>
        </Section>
    );
}
