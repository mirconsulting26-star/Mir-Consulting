"""Generate the two branded Lead Magnet PDFs.

Run from anywhere:
    python /app/backend/scripts/generate_lead_magnets.py

Outputs are written to /app/frontend/public/resources/.
Each PDF has a hardcoded header with the MIR Consulting logo and brand name.
"""
from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
)

ROOT = Path("/app")
LOGO_PATH = ROOT / "frontend" / "src" / "assets" / "logo.png"
OUT_DIR = ROOT / "frontend" / "public" / "resources"

BRAND_NAVY = colors.HexColor("#0A1A2F")
BRAND_BLUE = colors.HexColor("#0F5BD3")
BRAND_MUTED = colors.HexColor("#5B6B82")
BRAND_RULE = colors.HexColor("#D7DEE8")


def _header_footer(canv: canvas.Canvas, doc):
    canv.saveState()
    # Header band
    page_w, page_h = A4
    header_h = 24 * mm
    canv.setFillColor(colors.white)
    canv.rect(0, page_h - header_h, page_w, header_h, stroke=0, fill=1)

    # Logo
    if LOGO_PATH.exists():
        try:
            canv.drawImage(
                str(LOGO_PATH),
                15 * mm,
                page_h - header_h + 4 * mm,
                width=16 * mm,
                height=16 * mm,
                preserveAspectRatio=True,
                mask="auto",
            )
        except Exception:
            pass

    # Wordmark
    canv.setFillColor(BRAND_NAVY)
    canv.setFont("Helvetica-Bold", 13)
    canv.drawString(35 * mm, page_h - header_h + 12 * mm, "Mir Consulting")
    canv.setFillColor(BRAND_MUTED)
    canv.setFont("Helvetica", 8)
    canv.drawString(35 * mm, page_h - header_h + 7 * mm, "Marketing • E-commerce • Strategy")

    # Header rule
    canv.setStrokeColor(BRAND_RULE)
    canv.setLineWidth(0.5)
    canv.line(15 * mm, page_h - header_h - 1, page_w - 15 * mm, page_h - header_h - 1)

    # Footer rule + text
    canv.line(15 * mm, 18 * mm, page_w - 15 * mm, 18 * mm)
    canv.setFillColor(BRAND_MUTED)
    canv.setFont("Helvetica", 8)
    canv.drawString(15 * mm, 12 * mm, "© Mir Consulting — mirconsulting26@gmail.com")
    canv.drawRightString(page_w - 15 * mm, 12 * mm, f"Page {doc.page}")
    canv.restoreState()


def _styles():
    base = getSampleStyleSheet()
    return {
        "kicker": ParagraphStyle(
            "Kicker", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=8, textColor=BRAND_BLUE, spaceAfter=4, leading=10,
        ),
        "title": ParagraphStyle(
            "Title", parent=base["Title"], fontName="Helvetica-Bold",
            fontSize=24, textColor=BRAND_NAVY, spaceAfter=10, leading=28, alignment=TA_LEFT,
        ),
        "intro": ParagraphStyle(
            "Intro", parent=base["Normal"], fontName="Helvetica",
            fontSize=11, textColor=BRAND_NAVY, spaceAfter=14, leading=16,
        ),
        "section": ParagraphStyle(
            "Section", parent=base["Heading2"], fontName="Helvetica-Bold",
            fontSize=13, textColor=BRAND_NAVY, spaceBefore=12, spaceAfter=6, leading=16,
        ),
        "item": ParagraphStyle(
            "Item", parent=base["Normal"], fontName="Helvetica",
            fontSize=10, textColor=BRAND_NAVY, leftIndent=14, spaceAfter=4, leading=14,
        ),
        "cta": ParagraphStyle(
            "CTA", parent=base["Normal"], fontName="Helvetica-Oblique",
            fontSize=10, textColor=BRAND_MUTED, spaceBefore=14, leading=14,
        ),
    }


def _build_doc(path: Path, story: list):
    doc = BaseDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=32 * mm,
        bottomMargin=22 * mm,
        title="Mir Consulting",
        author="Mir Consulting",
    )
    frame = Frame(
        doc.leftMargin, doc.bottomMargin,
        doc.width, doc.height, id="body",
    )
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=_header_footer)])
    doc.build(story)


def _checklist(s, sections: list[tuple[str, list[str]]]):
    story = []
    for heading, items in sections:
        story.append(Paragraph(heading, s["section"]))
        for it in items:
            story.append(Paragraph(f"☐ &nbsp; {it}", s["item"]))
    return story


def build_marketing():
    s = _styles()
    story = [
        Paragraph("15-MINUTE WORKSHEET", s["kicker"]),
        Paragraph("Marketing Quick-Check", s["title"]),
        Paragraph(
            "28 honest questions to find the leaks in your marketing. Tick the boxes you "
            "can confidently answer <b>yes</b> to. Anything left blank is a place to dig "
            "deeper — bring this worksheet to a free 30-minute call with us.",
            s["intro"],
        ),
    ]
    story += _checklist(s, [
        ("1. Positioning &amp; Messaging", [
            "We can name our ideal customer in one sentence.",
            "Our website headline tells a visitor what we do in under 5 seconds.",
            "We can list three reasons a customer picks us over the next-best alternative.",
            "Our brand story is documented and used consistently across channels.",
            "We have a tested elevator pitch under 30 seconds.",
            "Pricing rationale is clear (value-based, not just cost-plus).",
            "We know which one customer segment drives most of our revenue.",
        ]),
        ("2. Acquisition Channels", [
            "We know our top 3 lead sources by volume and by quality.",
            "Each active channel has a tracked cost-per-lead.",
            "We have at least one organic channel (SEO, referral, content) that is growing.",
            "Paid channels have a defined break-even CAC, not just a budget cap.",
            "We have a testing calendar — not just always-on ads.",
            "Email / SMS list growth rate is tracked monthly.",
        ]),
        ("3. Funnel Conversion", [
            "Landing page conversion rate is measured and benchmarked.",
            "Forms have been A/B tested in the last 12 months.",
            "We follow up with new leads within 24 hours.",
            "We have a documented nurture sequence for cold leads.",
            "We measure offer-to-meeting and meeting-to-close ratios.",
            "We re-engage no-show and lost-deal leads on a schedule.",
            "Sales and marketing share one definition of a qualified lead.",
        ]),
        ("4. Measurement &amp; Maturity", [
            "We have one dashboard senior leadership actually opens weekly.",
            "Attribution model is defined (not just last-click).",
            "We can answer 'what worked best last month?' in under 5 minutes.",
            "We have a retention / churn metric, not just acquisition.",
            "Customer lifetime value is calculated by segment.",
            "We review marketing performance with finance every quarter.",
            "There is a documented annual marketing plan with budget &amp; KPIs.",
            "Someone owns marketing analytics specifically.",
        ]),
    ])
    story.append(Paragraph(
        "Done? Count the blanks. More than 8? You're leaving money on the table — "
        "book a free 30-minute call at mirconsulting.com and we'll prioritise the fixes "
        "with the fastest payback.",
        s["cta"],
    ))
    out = OUT_DIR / "marketing-quick-check.pdf"
    _build_doc(out, story)
    return out


def build_ecommerce():
    s = _styles()
    story = [
        Paragraph("30-MINUTE STORE WALK-THROUGH", s["kicker"]),
        Paragraph("E-commerce Audit", s["title"]),
        Paragraph(
            "32 conversion checks across Shopify, WooCommerce, Wix and the big "
            "marketplaces (Amazon, eBay, Etsy). Walk through your store with this in hand. "
            "Each unchecked box is a leak worth plugging before you spend another euro on ads.",
            s["intro"],
        ),
    ]
    story += _checklist(s, [
        ("1. Storefront Fundamentals", [
            "Homepage above-the-fold tells a visitor what you sell and for whom.",
            "Mobile load time is under 3 seconds (use PageSpeed Insights).",
            "Site navigation has fewer than 7 top-level items.",
            "Search bar is visible on every page and returns useful results.",
            "Trust signals visible: reviews, badges, return policy, contact.",
            "404 and empty-search pages route the visitor somewhere useful.",
            "All images are compressed and lazy-loaded.",
            "Cookie / consent banner doesn't block conversion.",
        ]),
        ("2. Product Page Conversion", [
            "Hero image is high-resolution; multiple angles available.",
            "Title includes the most-searched keyword for that product.",
            "Bullet benefits sit above the fold, features below.",
            "Stock / shipping ETA visible before add-to-cart.",
            "Cross-sell / 'frequently bought with' present and relevant.",
            "Reviews shown with photo and rating distribution.",
            "Size / fit / spec guide is one click away.",
            "Add-to-cart button uses brand colour, not a default theme tint.",
        ]),
        ("3. Cart &amp; Checkout Flow", [
            "Cart is reachable from every page (sticky icon).",
            "Free-shipping threshold is shown progressively in the cart.",
            "Guest checkout is available — no forced account creation.",
            "Payment options include local methods (Klarna, PayPal, Apple Pay, etc.).",
            "Address autocomplete is enabled.",
            "Checkout has fewer than 3 steps OR is a single page.",
            "Abandoned-cart email + SMS sequence is live.",
            "Post-purchase upsell or thank-you page is optimised, not default.",
        ]),
        ("4. Marketplace Algorithm Signals", [
            "Listing keywords are researched (Helium 10 / Marmalead / etc.).",
            "Main image meets marketplace policy (white background, fills frame).",
            "A+ / Enhanced content is used wherever supported.",
            "Backend search terms / tags are filled completely.",
            "Review count and rating beat your top 3 competitors.",
            "Inventory health (IPI / sell-through) is tracked weekly.",
            "Ad ACOS is below your contribution margin.",
            "Brand registry / Etsy Star Seller / Top-Rated status applied for.",
        ]),
    ])
    story.append(Paragraph(
        "Tally the unchecked boxes. More than 10 blanks usually means a 20–40% "
        "conversion lift is achievable in 90 days. Bring this audit to a free call "
        "at mirconsulting.com and we'll map a fix sequence to it.",
        s["cta"],
    ))
    out = OUT_DIR / "ecommerce-audit.pdf"
    _build_doc(out, story)
    return out


if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    a = build_marketing()
    b = build_ecommerce()
    print(f"Wrote: {a} ({a.stat().st_size} bytes)")
    print(f"Wrote: {b} ({b.stat().st_size} bytes)")
