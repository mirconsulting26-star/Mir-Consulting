"""Seed real, on-brand Blog posts & Case Studies (published + tagged with
services/industries). Idempotent: skips items whose slug already exists.

Usage:
    cd /app/backend && python scripts/seed_content.py [BASE_URL] [ADMIN_PASSWORD]
Defaults: BASE_URL=http://localhost:8001, ADMIN_PASSWORD=mir-admin-2026
"""
import json
import sys
import urllib.request

BASE_URL = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8001").rstrip("/")
ADMIN_PASSWORD = sys.argv[2] if len(sys.argv) > 2 else "mir-admin-2026"
API = f"{BASE_URL}/api"


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
