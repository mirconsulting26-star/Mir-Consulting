"""Generate the two lead-magnet PDFs for MIR Consulting.

Each PDF is structured as a self-directed worksheet — a one-shot "quick check"
the prospect can run on their own business in 15-30 minutes. This positions
MIR Consulting as expert, gives the prospect immediate value, and makes the
follow-up call easier (they arrive having already done the homework).

Run:  python backend/scripts/gen_lead_magnet_pdfs.py
Output: /app/frontend/public/resources/{marketing-quick-check,ecommerce-audit}.pdf
"""
import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT_DIR = "/app/frontend/public/resources"
LOGO_PATH = "/app/frontend/src/assets/logo.png"
os.makedirs(OUT_DIR, exist_ok=True)

# Match the website palette exactly (frontend/src/config/branding.js +
# tailwind.config.js). Keeping these in sync is what makes the PDF feel
# branded rather than generic.
MIR_BLUE = colors.HexColor("#0F4C8F")
MIR_MIDNIGHT = colors.HexColor("#0B1220")
MIR_BORDER = colors.HexColor("#E5E7EB")
MIR_MUTED = colors.HexColor("#64748B")


def make_styles():
    ss = getSampleStyleSheet()
    return {
        "eyebrow": ParagraphStyle(
            "eyebrow", parent=ss["Normal"],
            fontName="Helvetica", fontSize=8, leading=11,
            textColor=MIR_BLUE, spaceAfter=4,
        ),
        "h1": ParagraphStyle(
            "h1", parent=ss["Heading1"],
            fontName="Helvetica-Bold", fontSize=28, leading=32,
            textColor=MIR_MIDNIGHT, spaceAfter=16,
        ),
        "h2": ParagraphStyle(
            "h2", parent=ss["Heading2"],
            fontName="Helvetica-Bold", fontSize=14, leading=18,
            textColor=MIR_MIDNIGHT, spaceBefore=18, spaceAfter=8,
        ),
        "h3": ParagraphStyle(
            "h3", parent=ss["Heading3"],
            fontName="Helvetica-Bold", fontSize=11, leading=15,
            textColor=MIR_BLUE, spaceBefore=12, spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body", parent=ss["Normal"],
            fontName="Helvetica", fontSize=10, leading=15,
            textColor=MIR_MIDNIGHT, spaceAfter=6,
        ),
        "muted": ParagraphStyle(
            "muted", parent=ss["Normal"],
            fontName="Helvetica", fontSize=8, leading=12,
            textColor=MIR_MUTED, spaceAfter=4,
        ),
        "check": ParagraphStyle(
            "check", parent=ss["Normal"],
            fontName="Helvetica", fontSize=10, leading=16,
            textColor=MIR_MIDNIGHT, leftIndent=14, spaceAfter=2,
        ),
    }


def draw_brand_header(canvas, title):
    """Draws the website-matching brand bar at the top of every page.

    Layout (mirrors Navbar.jsx):
        [logo image]  MIR  Consulting          PAGE TITLE
    where 'MIR' is bold dark and 'Consulting' is light muted, on one line.
    """
    page_w, page_h = A4

    # Thin blue rule across the very top.
    canvas.setFillColor(MIR_BLUE)
    canvas.rect(0, page_h - 4 * mm, page_w, 4 * mm, fill=1, stroke=0)

    # Logo + wordmark area (top-left).
    y_baseline = page_h - 16 * mm
    x_cursor = 20 * mm
    logo_h_mm = 10  # matches the navbar's h-9 visual weight in print
    logo_w_drawn = 0
    try:
        img = ImageReader(LOGO_PATH)
        iw, ih = img.getSize()
        ratio = iw / float(ih) if ih else 1.0
        logo_w_mm = max(8, min(28, logo_h_mm * ratio))  # clamp width
        # Y baseline-align with the wordmark
        canvas.drawImage(
            img,
            x_cursor,
            y_baseline - (logo_h_mm * mm * 0.20),
            width=logo_w_mm * mm,
            height=logo_h_mm * mm,
            mask="auto",
            preserveAspectRatio=True,
        )
        logo_w_drawn = logo_w_mm * mm
        x_cursor += logo_w_drawn + 3 * mm
    except Exception:
        # Logo missing — fall back to a small "M" mark.
        canvas.setStrokeColor(MIR_BLUE)
        canvas.setFillColor(MIR_BLUE)
        canvas.rect(x_cursor, y_baseline - 1 * mm, 8 * mm, 8 * mm, stroke=1, fill=0)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.drawString(x_cursor + 2.4 * mm, y_baseline + 1.2 * mm, "M")
        x_cursor += 11 * mm

    # Wordmark "MIR" (bold/dark) + "Consulting" (light/muted).
    canvas.setFillColor(MIR_MIDNIGHT)
    canvas.setFont("Helvetica-Bold", 13)
    canvas.drawString(x_cursor, y_baseline + 1.5 * mm, "MIR")
    mir_w = canvas.stringWidth("MIR", "Helvetica-Bold", 13)

    canvas.setFillColor(MIR_MUTED)
    canvas.setFont("Helvetica", 13)
    canvas.drawString(x_cursor + mir_w + 2 * mm, y_baseline + 1.5 * mm, "Consulting")

    # Tiny eyebrow under the wordmark — same line of text as the website nav.
    canvas.setFillColor(MIR_BLUE)
    canvas.setFont("Helvetica", 6.5)
    canvas.drawString(
        x_cursor,
        y_baseline - 2.8 * mm,
        "STRATEGY · MARKETING · E-COMMERCE · INTELLIGENCE",
    )

    # Document title on the right side of the header.
    canvas.setFillColor(MIR_MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawRightString(page_w - 20 * mm, y_baseline + 1.5 * mm, title.upper())


def draw_footer(canvas, doc):
    page_w, _ = A4
    canvas.setFillColor(MIR_BORDER)
    canvas.rect(20 * mm, 15 * mm, page_w - 40 * mm, 0.4, fill=1, stroke=0)
    canvas.setFillColor(MIR_MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(
        20 * mm, 9 * mm,
        "MIR Consulting  ·  Strategy · Marketing · E-commerce · Intelligence",
    )
    canvas.drawRightString(page_w - 20 * mm, 9 * mm, f"Page {doc.page}")


def header_footer(canvas, doc, title):
    canvas.saveState()
    draw_brand_header(canvas, title)
    draw_footer(canvas, doc)
    canvas.restoreState()


def cta_box(styles, body):
    tbl = Table(
        [[Paragraph(body, styles["body"])]],
        colWidths=[A4[0] - 40 * mm],
    )
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ("BOX", (0, 0), (-1, -1), 0.5, MIR_BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return tbl


def checkbox_list(items, styles):
    flow = []
    for it in items:
        flow.append(Paragraph(f"&#9744;&nbsp;&nbsp;{it}", styles["check"]))
    return flow


def build_marketing_quick_check():
    out = os.path.join(OUT_DIR, "marketing-quick-check.pdf")
    s = make_styles()
    doc = SimpleDocTemplate(
        out, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=28 * mm, bottomMargin=22 * mm,
        title="MIR Consulting — Free Marketing Quick-Check",
        author="MIR Consulting",
    )

    flow = []
    flow.append(Paragraph("THE 15-MINUTE MARKETING QUICK-CHECK", s["eyebrow"]))
    flow.append(Paragraph("Is your marketing actually compounding?", s["h1"]))
    flow.append(Paragraph(
        "Run this worksheet on your own business in 15 minutes. Score yourself "
        "honestly. Then book a free 30-minute discovery call with MIR Consulting "
        "and we'll walk you through the three highest-leverage moves for the "
        "next 90 days — at no cost, no commitment.",
        s["body"],
    ))

    flow.append(cta_box(s,
        "<b>How to use this worksheet.</b> &nbsp;Tick the boxes you can answer "
        "with a confident <i>yes</i>. Leave the rest blank. Count unticked boxes. "
        "That's your improvement surface."
    ))

    flow.append(Paragraph("1. POSITIONING & MESSAGING", s["h2"]))
    flow.append(Paragraph(
        "If you can't say it in one sentence, prospects can't repeat it.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "We can describe our offer in one sentence a 12-year-old would understand.",
        "We have a documented Ideal Customer Profile (industry, size, role, pain).",
        "Our homepage hero clearly states <b>who we serve</b> and <b>what changes</b> for them.",
        "We have at least 3 named competitors and know how we're different from each.",
        "Our pricing strategy is intentional (not just a number we settled on).",
    ], s))

    flow.append(Paragraph("2. ACQUISITION CHANNELS", s["h2"]))
    flow.append(Paragraph(
        "Most businesses leak revenue because they treat marketing as a series "
        "of unrelated experiments instead of a portfolio.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "We know our top-3 channels by <b>contribution to revenue</b> (not just clicks).",
        "We know our blended CAC and LTV — and the ratio is documented.",
        "We have an organic engine (SEO, content, or referral) that isn't paused.",
        "We have a paid engine with a documented daily/weekly spend cap.",
        "We can name a specific channel we've tested in the last 90 days.",
        "We retire under-performing channels rather than letting them rot.",
    ], s))

    flow.append(Paragraph("3. BRAND, CONTENT & SOCIAL", s["h2"]))
    flow.append(Paragraph(
        "Your brand isn't your logo — it's the consistent experience a stranger "
        "encounters across every touchpoint.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "Our visual identity is documented (colours, type, logo usage).",
        "We publish on at least one channel weekly without breaking cadence.",
        "Our content has a documented angle (e.g. \"the practitioner POV\", not generic).",
        "We repurpose long-form content into 3+ shorter formats.",
        "Our email list grew in the last quarter, with a measurable open rate &gt; 25%.",
    ], s))

    flow.append(PageBreak())

    flow.append(Paragraph("4. FUNNEL & CONVERSION", s["h2"]))
    flow.append(Paragraph(
        "Acquisition without conversion is theatre. This is where most growth "
        "actually hides.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "Our website's conversion rate (visit → enquiry) is measured monthly.",
        "We A/B test at least one element of the conversion path each quarter.",
        "We have a documented hand-off between marketing and sales/customer-care.",
        "We follow up with new leads within 1 business day, every time.",
        "We have a written nurture sequence for leads that don't convert immediately.",
        "We measure churn / repeat-purchase rate, not just first sale.",
    ], s))

    flow.append(Paragraph("5. MEASUREMENT & DECISION-MAKING", s["h2"]))
    flow.append(Paragraph(
        "If marketing isn't on the same weekly review as ops and finance, "
        "it will always lose budget battles.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "We have one weekly marketing dashboard reviewed by leadership.",
        "We can attribute revenue to a campaign or channel within 30 days.",
        "Our key marketing KPIs are written down (and not just \"more traffic\").",
        "We've made one decision in the last 90 days that was driven by data.",
        "Our marketing budget is sized against a target — not last year's number.",
    ], s))

    flow.append(Paragraph("YOUR SCORE", s["h2"]))
    flow.append(Paragraph(
        "Count the boxes you ticked across all five sections (28 total).",
        s["body"],
    ))

    score_data = [
        ["Score", "What it means", "Suggested next move"],
        ["22 — 28", "Mature marketing engine", "Optimise. Quarterly strategy review."],
        ["15 — 21", "Working but leaking", "Audit funnel + measurement first."],
        ["8 — 14", "Tactical, not strategic", "Pause. Re-position. Then re-build channels."],
        ["0 — 7", "Marketing is incidental", "Start with positioning + one channel."],
    ]
    tbl = Table(score_data, colWidths=[25 * mm, 55 * mm, 85 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), MIR_MIDNIGHT),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("GRID", (0, 0), (-1, -1), 0.3, MIR_BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    flow.append(tbl)

    flow.append(Spacer(1, 10 * mm))
    flow.append(Paragraph("WHAT'S NEXT", s["h2"]))
    flow.append(cta_box(s,
        "<b>Free 30-minute discovery call.</b> &nbsp;Bring this worksheet. We'll "
        "spend 30 minutes — no slide deck, no pitch — walking through your three "
        "biggest unticked boxes and turning them into a 90-day action plan. "
        "No commitment to engage afterwards. Book at "
        "<font color='#0F4C8F'><b>mirconsulting.com/contact</b></font>."
    ))

    doc.build(
        flow,
        onFirstPage=lambda c, d: header_footer(c, d, "Free Marketing Quick-Check"),
        onLaterPages=lambda c, d: header_footer(c, d, "Free Marketing Quick-Check"),
    )
    print(f"Wrote {out}")


def build_ecommerce_audit():
    out = os.path.join(OUT_DIR, "ecommerce-audit.pdf")
    s = make_styles()
    doc = SimpleDocTemplate(
        out, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=28 * mm, bottomMargin=22 * mm,
        title="MIR Consulting — Free E-commerce Audit",
        author="MIR Consulting",
    )

    flow = []
    flow.append(Paragraph("THE 30-MINUTE E-COMMERCE AUDIT", s["eyebrow"]))
    flow.append(Paragraph("Find the leaks in your online store — before you spend on ads.", s["h1"]))
    flow.append(Paragraph(
        "Whether you're on Shopify, WooCommerce, Wix, Amazon, eBay or Etsy — "
        "this worksheet walks you through the 30 highest-leverage checks. "
        "Most stores can find 3-5 immediate wins in under an hour.",
        s["body"],
    ))

    flow.append(cta_box(s,
        "<b>How to use this audit.</b> &nbsp;Open your store in another tab. "
        "Walk through each section. Tick boxes you pass. Note specific items "
        "you don't — that's your shortlist for the next 30 days."
    ))

    flow.append(Paragraph("1. STOREFRONT FUNDAMENTALS", s["h2"]))
    flow.append(Paragraph(
        "The first 7 seconds. Most carts are lost before the customer even browses.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "Page loads in under 3 seconds on mobile (test on a real 4G connection).",
        "Hero clearly states what you sell and to whom (not just \"Welcome\").",
        "Logo, navigation and search are visible without scrolling.",
        "There is a visible value proposition (e.g. shipping, returns, guarantee).",
        "Phone, email or chat is visible on every page.",
    ], s))

    flow.append(Paragraph("2. PRODUCT PAGES", s["h2"]))
    flow.append(Paragraph(
        "Product page conversion rate is the single biggest lever in e-commerce.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "Every product has at least 4 photos including a lifestyle shot.",
        "First photo is on a clean background (Amazon requires this — others reward it).",
        "Product title follows a documented format (brand · product · attribute · size).",
        "Description leads with benefits, not specifications.",
        "Reviews are visible above the fold (or social proof if you're new).",
        "Stock status and shipping ETA are honest and visible.",
        "Cross-sells / bundles are shown but don't crowd the buy button.",
    ], s))

    flow.append(Paragraph("3. CART & CHECKOUT", s["h2"]))
    flow.append(Paragraph(
        "Industry average cart abandonment is ~70%. Each removed step lifts conversion.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "Guest checkout is available (no forced account creation).",
        "Shipping cost is visible <b>before</b> the customer enters card details.",
        "At least 3 payment methods are offered (card + wallet + one local).",
        "Checkout is a single page (or 2 steps max).",
        "Form fields are reduced to the minimum (no \"how did you hear about us\" at checkout).",
        "Abandoned-cart email/SMS is configured and triggered within 1 hour.",
    ], s))

    flow.append(PageBreak())

    flow.append(Paragraph("4. MARKETPLACES (AMAZON, EBAY, ETSY)", s["h2"]))
    flow.append(Paragraph(
        "Marketplaces are a different game. The algorithm is your customer.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "Listing titles are front-loaded with the most-searched keywords.",
        "Bullet points are written for the algorithm <i>and</i> the buyer.",
        "Backend keywords / search terms are filled (Amazon, eBay).",
        "A+ Content / Enhanced Brand Content is in place (if eligible).",
        "Review velocity is monitored weekly (drop &gt; 0.2 stars is a red flag).",
        "FBA / fulfilment SKUs are sized to demand, not just stocked once.",
        "Pricing tracks competitors automatically (manual price wars lose).",
    ], s))

    flow.append(Paragraph("5. ACQUISITION & RETENTION", s["h2"]))
    flow.append(Paragraph(
        "Repeat customers are 5× cheaper than acquired ones — but most stores under-invest in them.",
        s["muted"],
    ))
    flow.extend(checkbox_list([
        "We collect emails before checkout (welcome pop-up or footer form).",
        "Email open rate is &gt; 25% and click rate &gt; 2%.",
        "We have at least one SMS or WhatsApp channel collecting opt-ins.",
        "Reviews are requested automatically 7-14 days post-delivery.",
        "Repeat-customer rate is measured monthly.",
        "We segment customers (VIPs, lapsed, new) and treat them differently.",
        "We know our Customer Lifetime Value with reasonable confidence.",
    ], s))

    flow.append(Paragraph("YOUR SCORE", s["h2"]))
    flow.append(Paragraph(
        "Count the boxes you ticked across all five sections (32 total).",
        s["body"],
    ))

    score_data = [
        ["Score", "What it means", "Suggested next move"],
        ["26 — 32", "Mature store", "Optimise margins, expand channels."],
        ["18 — 25", "Working but leaking", "Fix product pages + checkout first."],
        ["10 — 17", "Tactical only", "Re-platform decisions become unavoidable."],
        ["0 — 9", "Foundational issues", "Start with positioning + storefront basics."],
    ]
    tbl = Table(score_data, colWidths=[25 * mm, 55 * mm, 85 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), MIR_MIDNIGHT),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("GRID", (0, 0), (-1, -1), 0.3, MIR_BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    flow.append(tbl)

    flow.append(Spacer(1, 10 * mm))
    flow.append(Paragraph("WHAT'S NEXT", s["h2"]))
    flow.append(cta_box(s,
        "<b>Free 30-minute store walk-through.</b> &nbsp;We'll share-screen with you, "
        "go through your store live, and identify the three highest-impact fixes "
        "you can ship this week. No deck. No pitch. No commitment. Book at "
        "<font color='#0F4C8F'><b>mirconsulting.com/contact</b></font>."
    ))

    doc.build(
        flow,
        onFirstPage=lambda c, d: header_footer(c, d, "Free E-commerce Audit"),
        onLaterPages=lambda c, d: header_footer(c, d, "Free E-commerce Audit"),
    )
    print(f"Wrote {out}")


if __name__ == "__main__":
    build_marketing_quick_check()
    build_ecommerce_audit()
