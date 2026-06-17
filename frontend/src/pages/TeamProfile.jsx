import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Linkedin, Mail, Loader2, Check, Calendar } from "lucide-react";
import { Section } from "@/components/sections/Section";
import CTASection from "@/components/sections/CTASection";
import RelatedRail from "@/components/sections/RelatedRail";
import Seo from "@/lib/Seo";
import { fetchTeamMember, fetchWorks } from "@/lib/api";

/* 📝 EDITING THIS PAGE — see /app/docs/CONTENT_EDITING_GUIDE.md
   Team content is ADMIN-managed (Admin → Team tab), stored in MongoDB
   (backend/models.py → TeamMember). To add a new section here, render
   another field from `m` below; to add a new FIELD, also update the
   TeamMember model and the TeamPanel.jsx admin editor. */

function TagBlock({ label, items }) {
    return (
        <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-4">{label}</div>
            <div className="flex flex-wrap gap-2">
                {items.map((t, i) => (
                    <span
                        key={i}
                        className="text-xs text-mir-textSoft border border-mir-border bg-white px-3 py-1.5"
                    >
                        {t}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function TeamProfile() {
    const { slug } = useParams();
    const [m, setM] = React.useState(null);
    const [works, setWorks] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        fetchTeamMember(slug)
            .then((d) => setM(d))
            .catch((e) => setError(e?.response?.status === 404 ? "not-found" : "error"))
            .finally(() => setLoading(false));
        fetchWorks().then((d) => setWorks(d || [])).catch(() => {});
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-mir-bg">
                <Loader2 className="w-6 h-6 animate-spin text-mir-blue" />
            </div>
        );
    }

    if (error || !m) {
        return (
            <Section testId="team-profile-not-found" className="bg-mir-bg">
                <div className="text-center max-w-xl mx-auto">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-4">
                        Profile not found
                    </div>
                    <h1 className="font-heading text-4xl text-mir-text mb-6">
                        This profile isn&apos;t available.
                    </h1>
                    <Link
                        to="/about"
                        data-testid="team-profile-back"
                        className="inline-flex items-center gap-2 border border-mir-border hover:border-mir-blue px-6 py-3 text-sm text-mir-text"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to About
                    </Link>
                </div>
            </Section>
        );
    }

    const sset = new Set(m.service_slugs || []);
    const iset = new Set(m.industry_slugs || []);
    const related = (works || []).filter(
        (w) =>
            (w.service_slugs || []).some((s) => sset.has(s)) ||
            (w.industry_slugs || []).some((s) => iset.has(s))
    );
    const firstName = (m.name || "").split(" ")[0];

    return (
        <div data-testid="team-profile-page" className="bg-mir-bg">
            <Seo title={m.name} description={m.headline || (m.bio || "").slice(0, 160)} path={`/team/${slug}`} />

            <section className="relative bg-mir-midnight text-white overflow-hidden">
                <div className="absolute inset-0 grid-backdrop-dark opacity-20 pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-mir-blue/20 blur-[140px] pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-24">
                    <Link
                        to="/about"
                        data-testid="team-profile-back"
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-10"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to team
                    </Link>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
                        <div className="lg:col-span-3">
                            <div className="aspect-square bg-white/5 border border-white/15 overflow-hidden">
                                {m.photo ? (
                                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/40 text-5xl font-heading">
                                        {m.name?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-9">
                            <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blueSoft mb-4">
                                {m.role}
                            </div>
                            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light tracking-tighter leading-[1.05]">
                                {m.name}
                            </h1>
                            {m.headline && (
                                <p className="mt-6 text-white/80 text-lg max-w-3xl leading-relaxed">
                                    {m.headline}
                                </p>
                            )}
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Link
                                    to={`/contact?consultant=${encodeURIComponent(m.name)}`}
                                    data-testid="team-profile-book-call"
                                    className="inline-flex items-center gap-2 bg-mir-blue hover:bg-mir-blueSoft text-white px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors"
                                >
                                    <Calendar className="w-3.5 h-3.5" /> Book a call with {firstName}
                                </Link>
                                {m.linkedin && (
                                    <a
                                        href={m.linkedin}
                                        target="_blank"
                                        rel="noreferrer"
                                        data-testid="team-profile-linkedin"
                                        className="inline-flex items-center gap-2 border border-white/20 hover:border-mir-blueSoft px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors"
                                    >
                                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                    </a>
                                )}
                                {m.email && (
                                    <a
                                        href={`mailto:${m.email}`}
                                        data-testid="team-profile-email"
                                        className="inline-flex items-center gap-2 border border-white/20 hover:border-mir-blueSoft px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5" /> Email
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Section testId="team-profile-body" className="bg-mir-bg">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-10">
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-4">
                                About
                            </div>
                            <p className="text-mir-textSoft leading-relaxed whitespace-pre-wrap">{m.bio}</p>
                        </div>
                        {m.career_story && (
                            <div data-testid="team-profile-career">
                                <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-4">
                                    Career story
                                </div>
                                <p className="text-mir-textSoft leading-relaxed whitespace-pre-wrap">
                                    {m.career_story}
                                </p>
                            </div>
                        )}
                        {m.achievements?.length > 0 && (
                            <div data-testid="team-profile-achievements">
                                <div className="text-[11px] uppercase tracking-[0.25em] text-mir-muted mb-4">
                                    Achievements
                                </div>
                                <ul className="space-y-3">
                                    {m.achievements.map((a, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-mir-text">
                                            <Check className="w-4 h-4 text-mir-blue mt-0.5 shrink-0" />
                                            {a}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-5 space-y-8">
                        {m.expertise?.length > 0 && <TagBlock label="Expertise" items={m.expertise} />}
                        {m.skills?.length > 0 && <TagBlock label="Skills" items={m.skills} />}
                        {m.tools?.length > 0 && <TagBlock label="Tools" items={m.tools} />}
                        {m.industries_served?.length > 0 && (
                            <TagBlock label="Industries served" items={m.industries_served} />
                        )}
                    </div>
                </div>
            </Section>

            <RelatedRail works={related} workHeading={`Work involving ${firstName}`} />

            <CTASection
                title={`Want to work with ${firstName}?`}
                subtitle="Start a conversation and we'll connect you with the right senior practitioner."
                secondaryLabel="Meet the team"
                secondaryTo="/about"
            />
        </div>
    );
}
