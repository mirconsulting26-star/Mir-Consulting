import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function CTASection({
    overline = "Begin the engagement",
    title = "Ready to modernize how your business runs?",
    subtitle = "Talk to MIR Consulting. A short, structured conversation to map your operating challenges to a clear path forward.",
    ctaLabel = "Book a Consultation",
    secondaryLabel = "Explore Services",
    secondaryTo = "/services",
}) {
    return (
        <section
            data-testid="cta-section"
            className="relative py-24 md:py-32 bg-mir-midnight text-white overflow-hidden"
        >
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-mir-blue/25 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 grid-backdrop-dark opacity-20 pointer-events-none" />
            <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blueSoft mb-6">
                        {overline}
                    </div>
                    <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-light tracking-tighter text-white leading-tight">
                        {title}
                    </h2>
                    <p className="mt-8 text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            data-testid="cta-section-primary"
                            className="group inline-flex items-center justify-center gap-3 bg-mir-blue hover:bg-mir-blueSoft text-white px-8 py-4 text-sm font-medium tracking-wide transition-colors"
                        >
                            {ctaLabel}
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                        <Link
                            to={secondaryTo}
                            data-testid="cta-section-secondary"
                            className="inline-flex items-center justify-center gap-3 border border-white/25 hover:border-white/50 text-white px-8 py-4 text-sm font-medium tracking-wide transition-colors"
                        >
                            {secondaryLabel}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
