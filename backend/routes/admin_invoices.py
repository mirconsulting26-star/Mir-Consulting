"""Invoices — admin CRUD, PDF, email, public token view + manual payment confirmation.

Payment flow (Stripe-free):
1. Admin creates and emails the invoice. Client receives PDF + public link.
2. Client opens public link → sees bank / PayPal / Revolut details from site_settings.
3. Client pays via their preferred method then submits a confirmation reference here.
4. Admin reviews confirmation in the admin portal and clicks "Mark as Paid".
"""
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response

from deps import (
    COMPANY_EMAIL,
    INVOICE_STATUSES,
    db,
    public_invoice_url,
    require_admin,
    utc_now_iso,
)
from email_service import is_configured as smtp_is_configured
from email_service import send_invoice_email
from invoice_pdf import fmt_money, render_invoice_pdf
from models import Invoice, InvoiceCreate, PaymentConfirmationPayload

logger = logging.getLogger(__name__)
router = APIRouter()  # mixes /admin/invoices and /invoices/public paths

SITE_SETTINGS_KEY = "site"

_COMPANY = {
    "name": "MIR Consulting",
    "tagline": "Strategy · Technology · Intelligence",
    "email": COMPANY_EMAIL,
    "footer": "MIR Consulting — generated electronically. Valid without signature.",
}


async def _payment_settings() -> dict:
    """Site-wide payment instructions used by PDF + public invoice page."""
    doc = await db.site_settings.find_one({"key": SITE_SETTINGS_KEY}, {"_id": 0, "key": 0}) or {}
    # Strip logo_url and any non-payment fields; PDF/PublicInvoice only need payment ones.
    return {k: v for k, v in doc.items() if v and k != "logo_url"}


async def _next_invoice_number() -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"INV-{year}-"
    last = await db.invoices.find_one(
        {"number": {"$regex": f"^{prefix}"}},
        sort=[("number", -1)],
        projection={"_id": 0, "number": 1},
    )
    n = 1
    if last:
        try:
            n = int(last["number"].split("-")[-1]) + 1
        except (ValueError, IndexError):
            n = 1
    return f"{prefix}{n:04d}"


def _compute_totals(line_items: List[dict], tax_rate: float):
    enriched = []
    subtotal = 0.0
    for it in line_items:
        qty = float(it.get("quantity", 0))
        rate = float(it.get("rate", 0))
        amount = round(qty * rate, 2)
        enriched.append({
            "description": it.get("description", ""),
            "quantity": qty,
            "rate": rate,
            "amount": amount,
        })
        subtotal += amount
    subtotal = round(subtotal, 2)
    tax_amount = round(subtotal * (tax_rate / 100.0), 2)
    total = round(subtotal + tax_amount, 2)
    return enriched, subtotal, tax_amount, total


# -------------------- ADMIN --------------------
@router.get("/admin/invoices", response_model=List[Invoice])
async def list_invoices(
    status: Optional[str] = None,
    q: Optional[str] = None,
    _: bool = Depends(require_admin),
):
    query: dict = {}
    if status and status in INVOICE_STATUSES:
        query["status"] = status
    if q:
        regex = {"$regex": q, "$options": "i"}
        query["$or"] = [
            {"number": regex},
            {"client_name": regex},
            {"client_email": regex},
            {"client_company": regex},
        ]
    return await db.invoices.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.post("/admin/invoices", response_model=Invoice, status_code=201)
async def create_invoice(payload: InvoiceCreate, _: bool = Depends(require_admin)):
    line_items, subtotal, tax_amount, total = _compute_totals(
        [li.model_dump() for li in payload.line_items], payload.tax_rate
    )
    number = await _next_invoice_number()
    inv = Invoice(
        number=number,
        client_name=payload.client_name,
        client_email=payload.client_email,
        client_company=payload.client_company,
        client_address=payload.client_address,
        currency=payload.currency,
        issue_date=payload.issue_date,
        due_date=payload.due_date,
        line_items=line_items,
        subtotal=subtotal,
        tax_rate=payload.tax_rate,
        tax_amount=tax_amount,
        total=total,
        notes=payload.notes,
        status=payload.status,
        lead_id=payload.lead_id,
    )
    await db.invoices.insert_one(inv.model_dump())
    return inv


@router.get("/admin/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str, _: bool = Depends(require_admin)):
    doc = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return doc


@router.put("/admin/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice(
    invoice_id: str, payload: InvoiceCreate, _: bool = Depends(require_admin)
):
    existing = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Invoice not found")
    line_items, subtotal, tax_amount, total = _compute_totals(
        [li.model_dump() for li in payload.line_items], payload.tax_rate
    )
    updates = {
        "client_name": payload.client_name,
        "client_email": payload.client_email,
        "client_company": payload.client_company,
        "client_address": payload.client_address,
        "currency": payload.currency,
        "issue_date": payload.issue_date,
        "due_date": payload.due_date,
        "line_items": line_items,
        "subtotal": subtotal,
        "tax_rate": payload.tax_rate,
        "tax_amount": tax_amount,
        "total": total,
        "notes": payload.notes,
        "status": payload.status,
        "lead_id": payload.lead_id,
        "updated_at": utc_now_iso(),
    }
    if payload.status == "paid" and existing.get("status") != "paid":
        updates["paid_at"] = utc_now_iso()
    await db.invoices.update_one({"id": invoice_id}, {"$set": updates})
    return await db.invoices.find_one({"id": invoice_id}, {"_id": 0})


@router.delete("/admin/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str, _: bool = Depends(require_admin)):
    result = await db.invoices.delete_one({"id": invoice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"deleted": True}


@router.post("/admin/invoices/{invoice_id}/mark-paid", response_model=Invoice)
async def mark_invoice_paid(invoice_id: str, _: bool = Depends(require_admin)):
    """One-click 'Mark as Paid' used by the admin after manually verifying payment."""
    existing = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if existing.get("status") == "paid":
        return existing
    now = utc_now_iso()
    await db.invoices.update_one(
        {"id": invoice_id},
        {"$set": {"status": "paid", "paid_at": now, "updated_at": now}},
    )
    return await db.invoices.find_one({"id": invoice_id}, {"_id": 0})


@router.get("/admin/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(invoice_id: str, _: bool = Depends(require_admin)):
    doc = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    pdf = render_invoice_pdf(doc, company=_COMPANY, payment_settings=await _payment_settings())
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{doc["number"]}.pdf"'},
    )


@router.post("/admin/invoices/{invoice_id}/send")
async def send_invoice(invoice_id: str, _: bool = Depends(require_admin)):
    doc = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if not doc.get("client_email"):
        raise HTTPException(status_code=400, detail="Client email is required to send")
    if not smtp_is_configured():
        raise HTTPException(
            status_code=503,
            detail="Email is not configured. Add SMTP_USER and SMTP_APP_PASSWORD to backend/.env",
        )
    pdf = render_invoice_pdf(doc, company=_COMPANY, payment_settings=await _payment_settings())
    ok = send_invoice_email(
        recipient=doc["client_email"],
        invoice_number=doc["number"],
        client_name=doc["client_name"],
        total_display=fmt_money(doc.get("total", 0), doc.get("currency", "EUR")),
        due_date=doc.get("due_date", ""),
        pdf_bytes=pdf,
        public_url=public_invoice_url(doc["public_token"]),
    )
    if not ok:
        raise HTTPException(status_code=502, detail="Failed to send email (check SMTP credentials)")
    await db.invoices.update_one(
        {"id": invoice_id},
        {"$set": {"status": "sent", "sent_at": utc_now_iso(), "updated_at": utc_now_iso()}},
    )
    return {"sent": True}


# -------------------- PUBLIC INVOICE VIEW --------------------
@router.get("/invoices/public/{token}")
async def public_invoice(token: str):
    doc = await db.invoices.find_one({"public_token": token}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return doc


@router.get("/invoices/public/{token}/pdf")
async def public_invoice_pdf(token: str):
    doc = await db.invoices.find_one({"public_token": token}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    pdf = render_invoice_pdf(doc, company=_COMPANY, payment_settings=await _payment_settings())
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{doc["number"]}.pdf"'},
    )


@router.post("/invoices/public/{token}/confirm-payment", response_model=Invoice)
async def submit_payment_confirmation(token: str, payload: PaymentConfirmationPayload):
    """Client submits proof/reference that they've paid. Admin reviews and marks paid."""
    doc = await db.invoices.find_one({"public_token": token}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if doc.get("status") == "paid":
        raise HTTPException(status_code=400, detail="Invoice is already marked as paid")
    if doc.get("status") == "void":
        raise HTTPException(status_code=400, detail="Invoice is void")
    now = utc_now_iso()
    await db.invoices.update_one(
        {"public_token": token},
        {"$set": {
            "payment_method_chosen": payload.method,
            "payment_confirmation_reference": (payload.reference or "").strip() or None,
            "payment_confirmation_note": (payload.note or "").strip() or None,
            "payment_confirmation_submitted_at": now,
            "updated_at": now,
        }},
    )
    return await db.invoices.find_one({"public_token": token}, {"_id": 0})
