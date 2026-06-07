import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { CAPABILITIES } from "@/lib/content";

const HERO_BG =
    "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGJsdWUlMjBnZW9tZXRyaWMlMjBuZXR3b3JrJTIwZGF0YXxlbnwwfHx8fDE3ODA4NDQ1NTF8MA&ixlib=rb-4.1.0&q=85";

export default function Hero() {
    return (
        <section
            data-testid="hero-section"
            className="relative overflow-hidden grain-overlay bg-mir-bg"
        >
            <div className="absolute inset-0 grid-backdrop opacity-50 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,_black_30%,_transparent_75%)]" />
            <div
                className="absolute top-0 right-0 w-1/2 h-full opacity-25 pointer-events-none"
                style={{
                    backgroundImage: `url(${HERO_BG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center right",
                    mixBlendMode: "multiply",
                    maskImage:
                        "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
                    WebkitMaskImage:
                        "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
                }}
            />
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full halo blur-2xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-28 md:pt-36 pb-24 md:pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="max-w-4xl"
                >
                    <div className="inline-flex items-center gap-3 border border-mir-blue/30 bg-white/60 backdrop-blur-sm px-4 py-2 mb-10">
                        <span className="w-1.5 h-1.5 bg-mir-blue rounded-full animate-pulse-soft" />
                        <span className="text-[11px] uppercase tracking-[0.25em] text-mir-text">
                            Premium Enterprise Consulting
                        </span>
                    </div>

                    <h1
                        data-testid="hero-headline"
                        className="font-heading text-4xl sm:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.02] text-mir-text"
                    >
                        Transforming Business
                        <br />
                        through{" "}
                        <span className="text-mir-blue">Strategy</span>,
                        <br />
                        <span className="text-mir-text">Technology </span>
                        <span className="text-mir-muted font-light">&amp;</span>{" "}
                        <span className="text-mir-blue">Intelligence</span>.
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="mt-10 text-lg sm:text-xl text-mir-muted max-w-2xl leading-relaxed"
                    >
                        MIR Consulting helps organizations modernize operations
                        through business consulting, analytics, automation and
                        intelligent systems — engineered for enterprise scale.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="mt-12 flex flex-col sm:flex-row gap-4"
                    >
                        <Link
                            to="/contact"
                            data-testid="hero-cta-primary"
                            className="group inline-flex items-center gap-3 bg-mir-midnight hover:bg-mir-blue text-white px-8 py-4 text-sm font-medium tracking-wide transition-colors"
                        >
                            Book a Consultation
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                        <Link
                            to="/services"
                            data-testid="hero-cta-secondary"
                            className="group inline-flex items-center gap-3 border border-mir-text/20 hover:border-mir-text/50 text-mir-text px-8 py-4 text-sm font-medium tracking-wide transition-colors"
                        >
                            Explore Services
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-24 border-t border-mir-border pt-10"
                    data-testid="hero-capabilities"
                >
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-6">
                        Capabilities
                    </div>
                    <div className="flex flex-wrap gap-x-10 gap-y-4">
                        {CAPABILITIES.map((c, i) => (
                            <div
                                key={c}
                                className="flex items-center gap-3 text-mir-textSoft text-sm tracking-wide"
                            >
                                <span className="font-heading text-mir-blue/70 text-xs">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                {c}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
