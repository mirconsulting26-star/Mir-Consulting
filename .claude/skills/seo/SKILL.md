---
name: seo
description: "SEO audit and implementation: meta tags, structured data, sitemap, robots.txt, Core Web Vitals, and crawlability."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: pandaos
allowed-tools: Read, Bash, Glob, Write
---

# SEO Audit and Implementation

Systematic SEO review covering technical SEO, on-page elements, and structured data.

## STEP 1: TECHNICAL SEO

Check the fundamentals:
- Does every page have a unique `<title>` (50-60 characters)?
- Does every page have a unique `<meta name="description">` (150-160 characters)?
- Is there a `<link rel="canonical">` on every page?
- Is the site served over HTTPS?
- Is there a `robots.txt` that allows crawling of important pages?
- Is there an XML sitemap at `/sitemap.xml`?

## STEP 2: OPEN GRAPH AND SOCIAL META

- `og:title`, `og:description`, `og:image`, `og:url` on every page
- `og:image` is at least 1200x630px
- Twitter card meta tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

## ON-PAGE OPTIMIZATION CHECKLIST

For each target page, verify the following before considering it optimized:

**Meta Tags**
- Title tag: primary keyword + modifier + brand, 50-60 characters
- Meta description: compelling copy with keyword + CTA, 150-160 characters
- Canonical URL: self-referencing canonical set correctly
- Open Graph tags: `og:title`, `og:description`, `og:image` configured

**Content Structure**
- H1: single, contains primary keyword, matches search intent
- H2-H3 hierarchy: logical outline covering subtopics and People Also Ask questions
- Keyword in first 100 words of body content
- Internal links: contextual links to related pillar or cluster content
- External links: citations to authoritative sources (E-E-A-T signal)

**E-E-A-T Author Schema**
For blog posts and articles, implement `author` schema with:
- Author name linked to an author entity (Person schema)
- Author credentials or expertise relevant to the topic
- `sameAs` property pointing to author social profiles or bio page
This signals Experience, Expertise, Authoritativeness, and Trustworthiness to Google.

**FAQ Schema**
For pages with Q&A sections:
- Add `FAQPage` schema with individual `Question` and `acceptedAnswer` entries
- Each question should target a People Also Ask query from the SERP
- Keep answers concise (40-60 words) for featured snippet eligibility
- Do not mark up questions that are not visible on the page

## STEP 3: STRUCTURED DATA

Check for JSON-LD structured data appropriate to the page type:
- Homepage: `Organization` or `WebSite`
- Blog posts: `Article`
- Product pages: `Product` with `offers`
- FAQ pages: `FAQPage`

Validate structure against schema.org specs.

## STEP 4: HEADING STRUCTURE

- One `<h1>` per page containing the primary keyword
- Logical heading hierarchy (`h1` → `h2` → `h3`), no skipping
- Headings are descriptive, not just "Section 1"

## STEP 5: IMAGE ALT TEXT

- All content images have descriptive alt text containing relevant keywords
- Decorative images use `alt=""`
- Image filenames are descriptive (`product-hero.webp` not `IMG_1234.jpg`)

## STEP 6: INTERNAL LINKING

- Important pages are reachable within 3 clicks from the homepage
- Internal links use descriptive anchor text (not "click here" or "read more")
- Broken internal links: none

## STEP 7: CORE WEB VITALS (SEO IMPACT)

Google uses CWV as ranking signals:
- LCP < 2.5s, INP < 200ms, CLS < 0.1
- Flag any pages likely to fail these thresholds

## STEP 8: REPORT

Categorized findings:
- **Blocking**: Issues that prevent indexing
- **Critical**: Issues with significant ranking impact
- **Improvements**: Best practices not yet implemented

## ANTI-PATTERNS

- Duplicate title or meta description across pages
- Dynamic content rendered only in JavaScript that Googlebot can't see
- Blocking CSS or JS in robots.txt that is needed to render the page
- Thin pages with less than 300 words of unique content
- Keyword stuffing in title or headings
