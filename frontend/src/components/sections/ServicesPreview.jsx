import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/sections/Section";
import { SERVICES } from "@/lib/content";
import {
    LineChart,
    BarChart3,
    Cpu,
    Workflow,
    Layers,
    Wand2,
} from "lucide-react";

const ICONS = {
    "business-consulting": LineChart,
    "analytics-bi": BarChart3,
    "it-consulting": Cpu,
    "process-automation": Workflow,
    "software-architecture": Layers,
    "digital-transformation": Wand2,
};

export default function ServicesPreview() {
    return (
        <Section testId="services-preview-section" className="border-t border-mir-border bg-mir-bg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                <div className="lg:col-span-7">
                    <SectionHeader
                        overline="Core Services"
                        title={
                            <>
                                A consulting platform built for{" "}
                                <span className="text-mir-blue">
                                    operationally complex
                                </span>{" "}
                                businesses.
                            </>
                        }
                        subtitle="Six integrated practice areas — engineered to translate strategy, technology and data into measurable operating performance."
                        testId="services-preview-header"
                    />
                </div>
                <div className="lg:col-span-5 flex lg:justify-end items-end">
                    <Link
                        to="/services"
                        data-testid="services-preview-cta"
                        className="group inline-flex items-center gap-2 border border-mir-text/15 hover:border-mir-blue px-6 py-3 text-sm text-mir-text transition-colors"
                    >
                        View all services
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-mir-border border border-mir-border">
                {SERVICES.map((s, i) => {
                    const Icon = ICONS[s.slug] || Layers;
                    return (
                        <motion.div
                            key={s.slug}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                            className="group relative bg-white p-8 md:p-10 hover:bg-mir-surface transition-colors"
                            data-testid={`service-card-${s.slug}`}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-12 h-12 border border-mir-blue/30 flex items-center justify-center bg-mir-blue/8 group-hover:bg-mir-blue/15 transition-colors">
                                    <Icon className="w-5 h-5 text-mir-blue" />
                                </div>
                                <span className="font-heading text-xs text-mir-muted tracking-widest">
                                    /0{i + 1}
                                </span>
                            </div>
                            <h3 className="font-heading text-xl md:text-2xl font-medium text-mir-text leading-tight">
                                {s.title}
                            </h3>
                            <p className="mt-3 text-sm text-mir-blueInk">
                                {s.tagline}
                            </p>
                            <p className="mt-5 text-sm text-mir-textSoft/85 leading-relaxed">
                                {s.summary}
                            </p>
                            <Link
                                to="/services"
                                className="mt-8 inline-flex items-center gap-2 text-sm text-mir-blue group/link font-medium"
                                data-testid={`service-card-link-${s.slug}`}
                            >
                                Explore practice
                                <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </Section>
    );
}
