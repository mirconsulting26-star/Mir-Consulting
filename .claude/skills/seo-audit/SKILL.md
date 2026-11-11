---
name: seo-audit
description: "SEO audit for a marketing site: technical SEO, keyword positioning, content gaps, backlink profile review, and competitor analysis."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: pandaos
allowed-tools: Read, Bash, Glob
---

# SEO Marketing Audit

A marketing-focused SEO audit covering organic search visibility, content strategy, and competitive positioning.

## STEP 1: DEFINE SCOPE

Parse $ARGUMENTS for:
- Target URL or domain
- Primary keywords to evaluate
- Competitors to benchmark against (optional)

## STEP 2: TECHNICAL SEO HEALTH

Check foundational technical issues:
- Page speed (Core Web Vitals: LCP < 2.5s, CLS < 0.1)
- Mobile-friendliness
- HTTPS
- Sitemap and robots.txt
- No crawl errors (404s on important pages, redirect chains)
- Canonical tags on all pages

## STEP 3: ON-PAGE SEO

For the primary landing pages:
- Title tags (unique, 50-60 chars, contains primary keyword)
- Meta descriptions (unique, 150-160 chars, compelling, contains keyword)
- H1 contains primary keyword, one per page
- Content length: minimum 1,000 words for competitive keywords
- Keyword density: 1-2% for primary keyword (not stuffed)
- Internal links to related content

## STEP 4: CONTENT GAP ANALYSIS

Identify keywords relevant to the business that the site is NOT currently ranking for:
- Informational queries related to the product (how-to, what-is)
- Comparison queries (product vs. competitor)
- Long-tail keywords with clear buyer intent

For each gap, propose a content piece that would capture the traffic.

## STEP 5: COMPETITOR COMPARISON

For each competitor in $ARGUMENTS:
- Compare page count (more indexed pages = more surface area)
- Compare domain authority signals (backlink count, referring domains)
- Identify keywords they rank for that the target site does not

## STEP 6: BACKLINK PROFILE

Review inbound link quality:
- Are there links from relevant, authoritative domains?
- Are there spammy or toxic links that should be disavowed?
- What is the anchor text distribution?

## STEP 7: RECOMMENDATIONS REPORT

Prioritized action list:
1. Technical fixes (blocking issues first)
2. On-page optimizations for existing pages
3. New content to create (by estimated traffic opportunity)
4. Link building opportunities

## KEYWORD STRATEGY FRAMEWORK

**Pillar/Cluster Architecture**
Build content around pillar pages targeting high-volume head terms, supported by cluster content targeting long-tail variations. Each cluster page links back to the pillar to concentrate topical authority.

**Keyword Classification Matrix**

| Category | Example | Intent | Priority |
|----------|---------|--------|----------|
| Core (head term) | "project management software" | Transactional | Pillar page |
| Long-tail | "free project management software for startups" | Informational | Cluster content |
| Brand | "[Brand] reviews" | Navigational | Brand page |
| Competitor | "[Competitor] alternative" | Comparative | Comparison page |
| Q&A | "how to choose project management software" | Informational | Blog/FAQ |

**Four Search Intent Categories Mapped to Content Types**
- **Informational** (top of funnel): how-to guides, what-is explainers, glossary → blog posts
- **Commercial investigation** (mid-funnel): comparisons, reviews, case studies → landing pages
- **Transactional** (bottom funnel): pricing, trial, buy → product/pricing pages
- **Navigational**: brand + product name queries → homepage, brand pages

**Prioritization Criteria**
Rank keyword opportunities by: (1) business relevance, (2) estimated traffic volume, (3) keyword difficulty vs. current domain authority, (4) commercial intent signal. Target low-difficulty / high-intent gaps first.

## LINK BUILDING TARGETS

Monthly targets by source type:

| Source Type | Target Links/Month | Minimum DR | Approach |
|-------------|-------------------|------------|----------|
| Digital PR (data stories, original research) | 5-10 | 60+ | Journalist outreach, HARO/Connectively responses |
| Content assets (guides, tools, calculators) | 10-15 | 40+ | Resource link building, broken link reclamation |
| Strategic outreach (brand mentions, resource pages) | 5-8 | 50+ | Unlinked mention conversion, resource page inclusion |

Toxic link ratio above 5% warrants a disavow file. Anchor text distribution should be natural — branded anchors should dominate, with exact-match anchors kept below 5%.

## ANTI-PATTERNS

- Optimizing for keywords with no buyer intent
- Targeting the same keyword on multiple pages (keyword cannibalization)
- Publishing thin content under 500 words on competitive topics
- Ignoring Core Web Vitals (Google uses them as ranking signals)
