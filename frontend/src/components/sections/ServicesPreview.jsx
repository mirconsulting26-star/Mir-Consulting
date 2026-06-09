import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Section, SectionHeader } from "@/components/sections/Section";
import { SERVICES } from "@/lib/content";
import {
    LineChart,
    BarChart3,
    Cpu,
    Workflow,
    Megaphone,
    ShoppingBag,
    Wand2,
} from "lucide-react";

const ICONS = {
    "business-consulting": LineChart,
    "analytics-bi": BarChart3,
    "it-consulting": Cpu,
    "process-automation": Workflow,
    "marketing-brand-growth": Megaphone,
    "ecommerce-online-sales": ShoppingBag,
    "digital-transformation": Wand2,
};

function StandardCard({ s, i }) {
    const Icon = ICONS[s.slug] || LineChart;
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
            className="group relative bg-white border border-mir-border hover:border-mir-blue/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(15,91,211,0.35)]"
            data-testid={`service-card-${s.slug}`}
        >
            {/* Top accent line that grows on hover */}
            <span className="absolute top-0 left-0 h-[2px] w-10 bg-mir-blue transition-all duration-500 group-hover:w-full" />

            {/* Ghost numeral */}
            <span
                aria-hidden
                className="pointer-events-none absolute top-4 right-6 font-heading text-6xl font-light leading-none text-mir-text/[0.045] select-none"
            >
                0{i + 1}
            </span>

            <div className="relative p-7 md:p-8 flex flex-col h-full">
                <div className="w-11 h-11 border border-mir-blue/25 flex items-center justify-center bg-mir-blue/[0.06] group-hover:bg-mir-blue group-hover:border-mir-blue transition-colors duration-300 mb-7">
                    <Icon className="w-5 h-5 text-mir-blue group-hover:text-white transition-colors duration-300" />
                </div>

                <h3 className="font-heading text-lg md:text-xl font-medium text-mir-text leading-snug">
                    {s.title}
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-mir-blue/90">
                    {s.tagline}
                </p>
                <p className="mt-4 text-sm text-mir-textSoft/85 leading-relaxed">
                    {s.summary}
                </p>

                <Link
                    to="/services"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-mir-text group-hover:text-mir-blue transition-colors self-start"
                    data-testid={`service-card-link-${s.slug}`}
                >
                    Explore practice
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
            </div>
        </motion.div>
    );
}

function SpotlightCard({ s, i }) {
    const Icon = ICONS[s.slug] || Wand2;
    return (
        <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden bg-mir-midnight text-white border border-mir-midnight"
            data-testid={`service-card-${s.slug}`}
        >
            {/* Decorative grid backdrop */}
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
            />
            {/* Soft glow */}
            <div
                aria-hidden
                className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-mir-blue/30 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"
            />

            <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 p-8 md:p-12 items-center">
                <div className="md:col-span-7 lg:col-span-8">
                    <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-mir-blueSoft mb-5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Our core practice · /0{i + 1}
                    </div>
                    <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-tight">
                        {s.title}
                    </h3>
                    <p className="mt-4 text-base md:text-lg text-mir-blueSoft max-w-2xl">
                        {s.tagline}
                    </p>
                    <p className="mt-5 text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
                        {s.summary}
                    </p>

                    <Link
                        to="/services"
                        className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.18em] bg-white text-mir-midnight hover:bg-mir-blue hover:text-white transition-colors"
                        data-testid={`service-card-link-${s.slug}`}
                    >
                        Explore the practice
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="md:col-span-5 lg:col-span-4 flex md:justify-end">
                    <div className="relative">
                        <div className="absolute -inset-4 border border-white/10" aria-hidden />
                        <div className="absolute -inset-8 border border-white/5" aria-hidden />
                        <div className="relative w-28 h-28 md:w-36 md:h-36 border border-mir-blue/40 bg-mir-blue/15 backdrop-blur-sm flex items-center justify-center">
                            <Icon className="w-12 h-12 md:w-14 md:h-14 text-mir-blueSoft" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function ServicesPreview() {
    // Business Consulting (first service) becomes the spotlight at the top —
    // it's the firm's core identity. The remaining 6 services sit below as a balanced 3×2 grid.
    const spotlight = SERVICES[0];
    const standard = SERVICES.slice(1);

    return (
        <Section testId="services-preview-section" className="border-t border-mir-border bg-mir-bg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14">
                <div className="lg:col-span-8">
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
                        subtitle="Seven integrated practice areas — engineered to translate strategy, technology, marketing and data into measurable operating performance."
                        testId="services-preview-header"
                    />
                </div>
                <div className="lg:col-span-4 flex lg:justify-end items-end">
                    <Link
                        to="/services"
                        data-testid="services-preview-cta"
                        className="group inline-flex items-center gap-2 border border-mir-text/15 hover:border-mir-blue hover:text-mir-blue px-6 py-3 text-sm text-mir-text transition-colors"
                    >
                        View all services
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Flagship spotlight — Business Consulting */}
            {spotlight && (
                <div className="mb-6">
                    <SpotlightCard s={spotlight} i={0} />
                </div>
            )}

            {/* 3 × 2 grid of remaining practice cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {standard.map((s, i) => (
                    <StandardCard key={s.slug} s={s} i={i + 1} />
                ))}
            </div>
        </Section>
    );
}
