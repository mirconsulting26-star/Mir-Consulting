"""Seed real, on-brand Blog posts & Case Studies (published + tagged with
services/industries). Idempotent: skips items whose slug already exists.

Usage:
    cd /app/backend && python scripts/seed_content.py [BASE_URL] [ADMIN_PASSWORD]
Defaults: BASE_URL=http://localhost:8001, ADMIN_PASSWORD=mir-admin-2026
"""
import json
import sys
import urllib.request
from datetime import datetime, timedelta, timezone

BASE_URL = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8001").rstrip("/")
ADMIN_PASSWORD = sys.argv[2] if len(sys.argv) > 2 else "mir-admin-2026"
API = f"{BASE_URL}/api"

# Future publish dates so seeded scheduled items render as "Coming soon" teasers.
FUTURE_ISO = (datetime.now(timezone.utc) + timedelta(days=12)).strftime("%Y-%m-%dT09:00:00+00:00")
FUTURE_ISO_2 = (datetime.now(timezone.utc) + timedelta(days=26)).strftime("%Y-%m-%dT09:00:00+00:00")


def _req(method, path, body=None, token=None):
    headers = {"Content-Type": "application/json", "User-Agent": "mir-seed/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{API}{path}", data=data, method=method, headers=headers)
    with urllib.request.urlopen(req) as r:
        return json.load(r)


POSTS = [
    {
        "title": "Building a KPI Architecture Executives Actually Use",
        "category": "Analytics & BI",
        "read_time": "6 min read",
        "excerpt": "Most dashboards die from neglect because they report numbers, not decisions. Here is how we design a KPI layer leaders open every morning.",
        "content": (
            "<p>The fastest way to kill a business intelligence programme is to ship a dashboard nobody opens. "
            "It usually happens for the same reason: the metrics describe activity rather than decisions.</p>"
            "<h2>Start from the decision, not the data</h2>"
            "<p>We begin every engagement by mapping the recurring decisions a leadership team makes — weekly trading reviews, "
            "monthly capacity planning, quarterly investment calls — and only then ask which numbers actually move those decisions.</p>"
            "<h2>Three layers that survive contact with reality</h2>"
            "<ul>"
            "<li><strong>North-star metrics</strong> — the 3-5 outcomes the business is judged on.</li>"
            "<li><strong>Driver metrics</strong> — the levers a team can pull this week.</li>"
            "<li><strong>Diagnostic metrics</strong> — the breadcrumbs you follow when a driver moves unexpectedly.</li>"
            "</ul>"
            "<p>When the hierarchy is explicit, dashboards stop being wallpaper and start being the first tab people open.</p>"
        ),
        "service_slugs": ["analytics-bi", "business-consulting"],
        "industry_slugs": ["smes", "manufacturing"],
    },
    {
        "title": "From Spreadsheets to Automation: A Pragmatic Roadmap",
        "category": "Automation",
        "read_time": "7 min read",
        "excerpt": "You don't automate a mess — you redesign it, then automate the parts that earn their keep. A staged roadmap that avoids the rip-and-replace trap.",
        "content": (
            "<p>Spreadsheets are where good operations go to scale until they can't. The instinct to 'automate everything' "
            "is how teams end up with brittle scripts nobody trusts. We take a staged approach.</p>"
            "<h2>Stage 1 — Stabilise the source of truth</h2>"
            "<p>Before automating, we consolidate the data into one governed place. Automation on top of inconsistent inputs simply "
            "produces wrong answers faster.</p>"
            "<h2>Stage 2 — Automate the high-frequency, low-judgement work</h2>"
            "<p>Reconciliations, status reports, and routine exports are the first wins: high volume, clear rules, immediate hours saved.</p>"
            "<h2>Stage 3 — Augment the judgement work</h2>"
            "<p>Only once the plumbing is reliable do we layer in alerting, exception routing and decision support — the parts that "
            "make a team feel genuinely faster.</p>"
        ),
        "service_slugs": ["process-automation", "digital-transformation"],
        "industry_slugs": ["logistics", "retail"],
    },
    {
        "title": "Marketplace vs. D2C: Where Should Your Next Growth Euro Go?",
        "category": "E-commerce",
        "read_time": "8 min read",
        "excerpt": "Marketplaces buy you reach; D2C buys you margin and data. The right split depends on three numbers most brands never calculate.",
        "content": (
            "<p>The marketplace-versus-direct debate is rarely either/or. It's a portfolio decision — and like any portfolio, "
            "it should be driven by contribution, not ideology.</p>"
            "<h2>The three numbers that decide it</h2>"
            "<ul>"
            "<li><strong>Fully-loaded contribution margin</strong> per channel, after fees, fulfilment and returns.</li>"
            "<li><strong>Customer data ownership</strong> — what you can re-market to, and what you can't.</li>"
            "<li><strong>Incrementality</strong> — how much of each channel's sales you'd lose if you turned it off.</li>"
            "</ul>"
            "<p>Marketplaces are unmatched for discovery and velocity. Direct-to-consumer compounds: every order improves your data, "
            "your retention economics and your brand. Most ambitious brands should run both — but fund them from a shared, honest P&L.</p>"
        ),
        "service_slugs": ["ecommerce-online-sales", "marketing-brand-growth"],
        "industry_slugs": ["d2c-brands", "marketplace-sellers"],
    },
    {
        "title": "Why Shopify Replatforming Stalls — and How to De-Risk Yours",
        "category": "E-commerce",
        "read_time": "7 min read",
        "excerpt": "Most replatforming projects don't fail on technology — they fail on data, scope and cutover. A practical checklist to ship without losing rankings or revenue.",
        "content": (
            "<p>Replatforming onto Shopify (or off it) rarely stalls because the platform can't do the job. It stalls because "
            "the migration plan underestimates the unglamorous parts: data integrity, URL continuity and a clean cutover.</p>"
            "<h2>Protect what already works</h2>"
            "<p>Before anything else we inventory the URLs, redirects and structured data that earn your organic traffic today, and we "
            "build a 1:1 redirect map. Losing rankings on launch day is an avoidable, self-inflicted wound.</p>"
            "<h2>Migrate decisions, not just records</h2>"
            "<p>Product, customer and order data carry business rules — tax logic, fulfilment routing, discount stacking. We migrate the "
            "rules deliberately rather than hoping an importer guesses them correctly.</p>"
            "<h2>Rehearse the cutover</h2>"
            "<p>A dry-run cutover on a staging store surfaces the surprises while they're cheap. By go-live, the team is executing a "
            "checklist they've already run twice.</p>"
        ),
        "service_slugs": ["ecommerce-online-sales", "digital-transformation"],
        "industry_slugs": ["retail", "d2c-brands"],
    },
    {
        "title": "The Operating Cadence That Separates Scaling Teams From Stuck Ones",
        "category": "Business",
        "read_time": "6 min read",
        "excerpt": "Strategy fails quietly in the gap between the plan and the week. A lightweight operating cadence turns ambition into accountable, visible progress.",
        "content": (
            "<p>Most teams don't lack strategy — they lack a rhythm for executing it. The companies that compound are the ones whose "
            "weekly and monthly cadence makes progress (and slippage) impossible to ignore.</p>"
            "<h2>Weekly: the trading review</h2>"
            "<p>A short, data-led session on the handful of driver metrics the team can actually move this week. No status theatre — "
            "just what changed, why, and what we'll do about it.</p>"
            "<h2>Monthly: the operating review</h2>"
            "<p>A step back to the north-star outcomes: are the drivers translating into results, and where do we reallocate effort?</p>"
            "<h2>The point is the loop</h2>"
            "<p>When the cadence is consistent, decisions get made on time, problems surface early, and the strategy stops living only "
            "in a slide deck.</p>"
        ),
        "service_slugs": ["business-consulting", "analytics-bi"],
        "industry_slugs": ["smes", "logistics"],
    },
    {
        "title": "AI in the Back Office: A Grounded Reality Check for SMEs",
        "category": "Automation",
        "read_time": "8 min read",
        "excerpt": "Cutting past the hype: where AI genuinely earns its keep in finance, ops and support today — and where it quietly burns budget.",
        "content": (
            "<p>For most SMEs the question isn't whether to use AI — it's where it pays back without creating new risk. The honest "
            "answer is narrower, and more useful, than the headlines suggest.</p>"
            "<h2>Where it earns its keep today</h2>"
            "<p>Drafting, classification, summarisation and first-line triage — high-volume work with a human checkpoint — is where we "
            "see real, measurable hours returned to the team.</p>"
            "<h2>Where it quietly burns budget</h2>"
            "<p>Anything that demands perfect accuracy with no human in the loop, or that's bolted onto messy data, tends to cost more "
            "in clean-up than it saves.</p>"
            "<p>Start where the work is repetitive and the cost of a mistake is low — then expand as trust and data quality improve.</p>"
        ),
        "service_slugs": ["process-automation", "digital-transformation"],
        "industry_slugs": ["smes", "logistics"],
        "scheduled_for": FUTURE_ISO,
    },
]

CASE_STUDIES = [
    {
        "title": "Group-Wide Operational Reporting for a Multi-Property Hotel Chain",
        "sector": "Hospitality",
        "client_name": "12-property hotel group (confidential)",
        "summary": "A single source of operational truth across 12+ properties, unifying occupancy, revenue and F&B KPIs into a leadership-grade dashboard.",
        "content": (
            "<p>A growing hotel group was running each property on its own spreadsheets, making group-level decisions on numbers that "
            "were always a week stale and rarely comparable.</p>"
            "<h2>What we did</h2>"
            "<p>We modelled a shared KPI definition across properties, automated the nightly data consolidation, and built a leadership "
            "dashboard covering occupancy, RevPAR, and food &amp; beverage performance with property-level drill-downs.</p>"
            "<h2>Outcome</h2>"
            "<p>Leadership moved from monthly retrospectives to weekly, like-for-like operating reviews — and spotted underperforming "
            "properties weeks earlier than before.</p>"
        ),
        "outcomes": [
            "Single, comparable KPI set across 12+ properties",
            "Weekly operating reviews replaced monthly retrospectives",
            "Hours of manual report assembly eliminated each week",
        ],
        "service_slugs": ["analytics-bi", "business-consulting"],
        "industry_slugs": ["hospitality"],
    },
    {
        "title": "Inventory Intelligence Across Online & Physical Channels",
        "sector": "Retail",
        "client_name": "Omnichannel retailer (confidential)",
        "summary": "Reducing stock-outs by 38% and freeing margin via channel-aware inventory and replenishment intelligence.",
        "content": (
            "<p>A retailer selling across its own store, its website and two marketplaces had no unified view of stock, leading to "
            "simultaneous stock-outs and overstocks across channels.</p>"
            "<h2>What we did</h2>"
            "<p>We unified inventory across channels, built channel-aware replenishment signals, and surfaced movement-level visibility "
            "so buyers could act before a line sold out.</p>"
            "<h2>Outcome</h2>"
            "<p>Stock-outs on key lines fell sharply while working capital tied up in slow movers was released.</p>"
        ),
        "outcomes": [
            "38% reduction in stock-outs on key lines",
            "Channel-aware replenishment signals",
            "Working capital released from slow-moving stock",
        ],
        "service_slugs": ["analytics-bi", "ecommerce-online-sales"],
        "industry_slugs": ["retail", "d2c-brands"],
    },
    {
        "title": "Production KPI Architecture for a Mid-Market Plant Network",
        "sector": "Manufacturing",
        "client_name": "Four-plant manufacturer (confidential)",
        "summary": "OEE, throughput-vs-plan and quality analytics rolled into an executive operating dashboard across four plants.",
        "content": (
            "<p>A manufacturer with four plants measured performance differently at each site, making network-level improvement "
            "impossible to prioritise.</p>"
            "<h2>What we did</h2>"
            "<p>We standardised OEE and quality definitions, automated shop-floor data capture into a governed model, and delivered an "
            "executive dashboard with throughput-versus-plan and quality trends across all plants.</p>"
            "<h2>Outcome</h2>"
            "<p>The leadership team could finally compare plants like-for-like and direct improvement effort where it paid back fastest.</p>"
        ),
        "outcomes": [
            "Standardised OEE & quality definitions network-wide",
            "Automated shop-floor data capture",
            "Like-for-like plant comparison for capital prioritisation",
        ],
        "service_slugs": ["analytics-bi", "process-automation"],
        "industry_slugs": ["manufacturing"],
    },
    {
        "title": "Marketing Attribution Rebuild for a Multi-Brand D2C Group",
        "sector": "E-commerce",
        "client_name": "Multi-brand D2C group (confidential)",
        "summary": "Replacing last-click guesswork with a blended attribution model that reallocated spend and lifted blended ROAS by 24%.",
        "content": (
            "<p>A group running several D2C brands was making spend decisions on last-click reports that flattered lower-funnel channels "
            "and starved the activity that actually created demand.</p>"
            "<h2>What we did</h2>"
            "<p>We consolidated spend and revenue across brands and channels, built a blended attribution and incrementality view, and "
            "gave each brand lead a weekly allocation dashboard tied to contribution, not vanity ROAS.</p>"
            "<h2>Outcome</h2>"
            "<p>Spend shifted toward genuinely incremental channels and blended ROAS rose meaningfully without increasing total budget.</p>"
        ),
        "outcomes": [
            "24% lift in blended ROAS at flat budget",
            "Cross-brand spend and revenue consolidated",
            "Weekly contribution-based allocation per brand",
        ],
        "service_slugs": ["marketing-brand-growth", "analytics-bi"],
        "industry_slugs": ["d2c-brands", "marketplace-sellers"],
    },
    {
        "title": "Finance Close Automation for a Fast-Growing SaaS",
        "sector": "Technology",
        "client_name": "Series-B SaaS company (confidential)",
        "summary": "Cutting the monthly close from 11 days to 4 by automating reconciliations and standardising the reporting pack.",
        "content": (
            "<p>A scaling SaaS business was closing its books in eleven painful days, with finance buried in manual reconciliations and "
            "a reporting pack rebuilt by hand every month.</p>"
            "<h2>What we did</h2>"
            "<p>We automated bank and billing reconciliations, standardised the chart of accounts and templated the board reporting pack "
            "so it regenerates from a single governed dataset.</p>"
            "<h2>Outcome</h2>"
            "<p>The close dropped from eleven days to four, freeing the finance team to spend its time on analysis rather than assembly.</p>"
        ),
        "outcomes": [
            "Monthly close cut from 11 days to 4",
            "Automated bank & billing reconciliations",
            "Board reporting pack regenerated from one dataset",
        ],
        "service_slugs": ["process-automation", "analytics-bi"],
        "industry_slugs": ["smes"],
        "scheduled_for": FUTURE_ISO_2,
    },
]


def main():
    token = _req("POST", "/admin/login", {"password": ADMIN_PASSWORD})["token"]

    existing_posts = {p["slug"] for p in _req("GET", "/admin/posts", token=token)}
    existing_cs = {c["slug"] for c in _req("GET", "/admin/case-studies", token=token)}

    from urllib.parse import quote  # noqa: F401  (kept for clarity)
    import re

    def slugify(t):
        return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")

    created = {"posts": 0, "case_studies": 0, "skipped": 0}

    for p in POSTS:
        if slugify(p["title"]) in existing_posts:
            created["skipped"] += 1
            print(f"  skip post: {p['title']}")
            continue
        out = _req("POST", "/admin/posts", {**p, "status": "published"}, token=token)
        created["posts"] += 1
        print(f"  + post: {out['title']} -> /blog/{out['slug']}")

    for c in CASE_STUDIES:
        if slugify(c["title"]) in existing_cs:
            created["skipped"] += 1
            print(f"  skip case study: {c['title']}")
            continue
        out = _req("POST", "/admin/case-studies", {**c, "status": "published"}, token=token)
        created["case_studies"] += 1
        print(f"  + case study: {out['title']} -> /case-studies/{out['slug']}")

    print(json.dumps(created))


if __name__ == "__main__":
    main()
