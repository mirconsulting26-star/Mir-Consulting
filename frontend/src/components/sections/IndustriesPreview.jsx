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

export default function IndustriesPreview() {
    return (
        <Section testId="industries-preview-section" className="border-t border-mir-border bg-mir-surface">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
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
                        className="group inline-flex items-center gap-2 border border-mir-text/15 hover:border-mir-blue px-6 py-3 text-sm text-mir-text transition-colors"
                    >
                        Browse all industries
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {INDUSTRIES.map((ind, i) => {
                    const sizes = [
                        "md:col-span-7 md:row-span-2",
                        "md:col-span-5",
                        "md:col-span-5",
                        "md:col-span-7",
                        "md:col-span-6",
                        "md:col-span-6",
                    ];
                    const span = sizes[i] || "md:col-span-6";
                    return (
                        <motion.div
                            key={ind.slug}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                            className={`relative group overflow-hidden border border-mir-border bg-mir-midnight min-h-[260px] ${span}`}
                            data-testid={`industry-card-${ind.slug}`}
                        >
                            <div
                                className="absolute inset-0 opacity-60 group-hover:opacity-70 transition-opacity bg-cover bg-center"
                                style={{ backgroundImage: `url(${IMAGE_MAP[ind.slug]})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-mir-midnight via-mir-midnight/85 to-mir-midnight/30" />
                            <div className="relative h-full p-8 md:p-10 flex flex-col justify-end">
                                <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blueSoft mb-3">
                                    Sector / 0{i + 1}
                                </div>
                                <h3 className="font-heading text-2xl md:text-3xl font-medium tracking-tight text-white">
                                    {ind.title}
                                </h3>
                                <p className="mt-3 text-sm text-white/75 max-w-xl">
                                    {ind.summary}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </Section>
    );
}
