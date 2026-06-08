"""Iteration 11 — Stripe removal + manual payment confirmation flow.

Covers:
- Stripe endpoints are gone (404)
- /api/site-settings exposes new payment fields
- PUT /api/admin/site-settings persists payment fields
- POST /api/invoices/public/{token}/confirm-payment (happy + validation + paid/void rejections)
- POST /api/admin/invoices/{id}/mark-paid (200 + idempotent)
- PDF contains 'HOW TO PAY' content (heuristically: bytes > 1000 + payment hint string visible
  in PDF stream — we don't parse PDF, but we render once with payment_settings and once
  with none and assert size differs.)
- Pre-existing public + admin invoice list/CRUD still work
"""
import os
import uuid

import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path("/app/backend/.env"))
load_dotenv(Path("/app/frontend/.env"))
BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_PASSWORD = "mir-admin-2026"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def invoice(auth_headers):
    """Create a fresh invoice for the payment flow."""
    payload = {
        "client_name": f"TEST_PayFlow {uuid.uuid4().hex[:6]}",
        "client_email": "test_payflow@example.com",
        "currency": "EUR",
        "issue_date": "2026-01-15",
        "due_date": "2026-02-15",
        "tax_rate": 10.0,
        "line_items": [{"description": "Consulting", "quantity": 2, "rate": 100.0}],
        "status": "draft",
    }
    r = requests.post(f"{BASE_URL}/api/admin/invoices", headers=auth_headers, json=payload)
    assert r.status_code in (200, 201), r.text
    inv = r.json()
    yield inv
    # cleanup
    requests.delete(f"{BASE_URL}/api/admin/invoices/{inv['id']}", headers=auth_headers)


# ---------------- Stripe gone ----------------
class TestStripeRemoved:
    def test_checkout_endpoint_gone(self, s):
        r = s.post(
            f"{BASE_URL}/api/invoices/public/anytoken/checkout",
            json={"origin_url": BASE_URL},
        )
        assert r.status_code == 404, f"expected 404, got {r.status_code} {r.text[:200]}"

    def test_checkout_status_endpoint_gone(self, s):
        r = s.get(f"{BASE_URL}/api/invoices/public/anytoken/checkout/cs_test")
        assert r.status_code == 404

    def test_stripe_webhook_gone(self, s):
        r = s.post(f"{BASE_URL}/api/webhook/stripe", json={})
        assert r.status_code == 404


# ---------------- Site settings ----------------
PAYMENT_FIELDS = [
    "bank_account_name", "bank_name", "bank_iban", "bank_swift_bic",
    "bank_account_number", "bank_routing_sort_code", "bank_address",
    "paypal_email", "paypal_me_url",
    "revolut_username", "revolut_link",
    "payment_contact_email", "payment_contact_message",
]


class TestSiteSettingsPaymentFields:
    def test_public_site_settings_includes_payment_fields(self, s):
        r = s.get(f"{BASE_URL}/api/site-settings")
        assert r.status_code == 200
        body = r.json()
        # All 14 fields must be present (value can be null)
        for f in PAYMENT_FIELDS:
            assert f in body, f"site-settings missing field: {f}"

    def test_admin_can_persist_payment_fields(self, s, auth_headers):
        suffix = uuid.uuid4().hex[:6]
        payload = {
            "bank_account_name": f"MIR Consulting {suffix}",
            "bank_name": "Test Bank",
            "bank_iban": f"DE00 0000 0000 0000 {suffix}",
            "bank_swift_bic": "TESTBIC",
            "paypal_email": f"pay-{suffix}@example.com",
            "paypal_me_url": f"https://paypal.me/test{suffix}",
            "revolut_username": f"@mir{suffix}",
            "revolut_link": f"https://revolut.me/mir{suffix}",
            "payment_contact_email": f"contact-{suffix}@example.com",
            "payment_contact_message": "Email us for wire/card invoicing.",
        }
        r = requests.put(
            f"{BASE_URL}/api/admin/site-settings",
            headers=auth_headers,
            json=payload,
        )
        assert r.status_code == 200, r.text

        # GET and verify
        r2 = s.get(f"{BASE_URL}/api/site-settings")
        assert r2.status_code == 200
        body = r2.json()
        for k, v in payload.items():
            assert body.get(k) == v, f"site-settings did not persist {k}: got {body.get(k)!r}"


# ---------------- Confirm payment flow ----------------
class TestConfirmPayment:
    def test_confirm_payment_happy_path(self, invoice):
        token = invoice["public_token"]
        body = {"method": "bank", "reference": "TXN-123", "note": "paid this morning"}
        r = requests.post(f"{BASE_URL}/api/invoices/public/{token}/confirm-payment", json=body)
        assert r.status_code == 200, r.text
        inv = r.json()
        assert inv["payment_method_chosen"] == "bank"
        assert inv["payment_confirmation_reference"] == "TXN-123"
        assert inv["payment_confirmation_note"] == "paid this morning"
        assert inv.get("payment_confirmation_submitted_at"), "submitted_at not set"

    def test_confirm_payment_invalid_method(self):
        # Need a fresh invoice (different token) — reuse fixture via a separate creation
        # Use a random token; expect 404 first OR 422 if validation runs first.
        # Actually we need a real token to reach validation. Create on the fly.
        # But fixture is session-scoped & already-confirmed (not paid yet, so should still work).
        # Easier: hit a random token with bad method, expect 422 (Pydantic validates before db lookup? No, FastAPI validates body first, then runs handler. So 422 is correct.).
        r = requests.post(
            f"{BASE_URL}/api/invoices/public/randomtoken/confirm-payment",
            json={"method": "bitcoin", "reference": "X"},
        )
        assert r.status_code == 422, f"expected 422 for bad method, got {r.status_code}: {r.text[:200]}"

    def test_confirm_rejects_when_already_paid(self, invoice, auth_headers):
        # Mark paid first
        inv_id = invoice["id"]
        r = requests.post(
            f"{BASE_URL}/api/admin/invoices/{inv_id}/mark-paid",
            headers=auth_headers,
        )
        assert r.status_code == 200
        # Now confirm should 400
        token = invoice["public_token"]
        r2 = requests.post(
            f"{BASE_URL}/api/invoices/public/{token}/confirm-payment",
            json={"method": "paypal", "reference": "X"},
        )
        assert r2.status_code == 400, f"expected 400 when paid, got {r2.status_code} {r2.text[:200]}"

    def test_confirm_rejects_when_void(self, auth_headers):
        # Create a void invoice
        payload = {
            "client_name": f"TEST_Void {uuid.uuid4().hex[:6]}",
            "currency": "EUR",
            "issue_date": "2026-01-15",
            "due_date": "2026-02-15",
            "tax_rate": 0.0,
            "line_items": [{"description": "x", "quantity": 1, "rate": 10}],
            "status": "void",
        }
        r = requests.post(f"{BASE_URL}/api/admin/invoices", headers=auth_headers, json=payload)
        assert r.status_code in (200, 201), r.text
        inv = r.json()
        token = inv["public_token"]
        r2 = requests.post(
            f"{BASE_URL}/api/invoices/public/{token}/confirm-payment",
            json={"method": "bank", "reference": "X"},
        )
        assert r2.status_code == 400, f"expected 400 when void, got {r2.status_code}"
        # cleanup
        requests.delete(f"{BASE_URL}/api/admin/invoices/{inv['id']}", headers=auth_headers)


# ---------------- Mark as Paid ----------------
class TestMarkPaid:
    def test_mark_paid_sets_status_and_idempotent(self, auth_headers):
        # Fresh invoice
        payload = {
            "client_name": f"TEST_MarkPaid {uuid.uuid4().hex[:6]}",
            "currency": "EUR",
            "issue_date": "2026-01-15",
            "due_date": "2026-02-15",
            "tax_rate": 0.0,
            "line_items": [{"description": "x", "quantity": 1, "rate": 50}],
            "status": "sent",
        }
        r = requests.post(f"{BASE_URL}/api/admin/invoices", headers=auth_headers, json=payload)
        assert r.status_code in (200, 201)
        inv_id = r.json()["id"]

        r1 = requests.post(
            f"{BASE_URL}/api/admin/invoices/{inv_id}/mark-paid", headers=auth_headers
        )
        assert r1.status_code == 200
        assert r1.json()["status"] == "paid"
        paid_at = r1.json().get("paid_at")
        assert paid_at, "paid_at not set"
        assert "T" in paid_at, f"paid_at not ISO-like: {paid_at}"

        # Idempotent
        r2 = requests.post(
            f"{BASE_URL}/api/admin/invoices/{inv_id}/mark-paid", headers=auth_headers
        )
        assert r2.status_code == 200
        assert r2.json()["status"] == "paid"

        # cleanup
        requests.delete(f"{BASE_URL}/api/admin/invoices/{inv_id}", headers=auth_headers)

    def test_mark_paid_requires_auth(self, s):
        r = s.post(f"{BASE_URL}/api/admin/invoices/non-existent/mark-paid")
        assert r.status_code == 401

    def test_mark_paid_404_for_unknown(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/invoices/does-not-exist/mark-paid",
            headers=auth_headers,
        )
        assert r.status_code == 404


# ---------------- PDF includes HOW TO PAY ----------------
class TestPdfHowToPay:
    def test_pdf_contains_how_to_pay(self, auth_headers):
        # Ensure site settings have at least one payment field set
        requests.put(
            f"{BASE_URL}/api/admin/site-settings",
            headers=auth_headers,
            json={
                "bank_account_name": "MIR Test",
                "bank_iban": "DE00 ZZZ 0000",
                "paypal_email": "pay@example.com",
            },
        )
        # Create an invoice
        payload = {
            "client_name": f"TEST_PDF {uuid.uuid4().hex[:6]}",
            "currency": "EUR",
            "issue_date": "2026-01-15",
            "due_date": "2026-02-15",
            "tax_rate": 0.0,
            "line_items": [{"description": "x", "quantity": 1, "rate": 10}],
            "status": "draft",
        }
        r = requests.post(f"{BASE_URL}/api/admin/invoices", headers=auth_headers, json=payload)
        assert r.status_code in (200, 201)
        inv_id = r.json()["id"]
        r2 = requests.get(
            f"{BASE_URL}/api/admin/invoices/{inv_id}/pdf", headers=auth_headers
        )
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("application/pdf")
        assert r2.content[:4] == b"%PDF"
        assert len(r2.content) > 1000
        # PDF stream is FlateDecode-compressed — extract text to check content.
        from io import BytesIO
        from pypdf import PdfReader

        reader = PdfReader(BytesIO(r2.content))
        full_text = "\n".join(page.extract_text() or "" for page in reader.pages)
        assert "HOW TO PAY" in full_text, f"PDF missing 'HOW TO PAY' block. text: {full_text[:500]}"
        # And at least one of the payment fields we set
        assert (
            "IBAN" in full_text
            or "PayPal" in full_text
            or "MIR Test" in full_text
        ), f"PDF HOW TO PAY block missing payment details. text: {full_text[:500]}"

        requests.delete(f"{BASE_URL}/api/admin/invoices/{inv_id}", headers=auth_headers)


# ---------------- Pre-existing flows still work ----------------
class TestPreExisting:
    def test_invoice_list_admin(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/invoices", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_send_invoice_endpoint_responds(self, auth_headers):
        # Create then attempt send. Should be 200 (sent) or 503 (SMTP not configured).
        payload = {
            "client_name": f"TEST_Send {uuid.uuid4().hex[:6]}",
            "client_email": "test_send@example.com",
            "currency": "EUR",
            "issue_date": "2026-01-15",
            "due_date": "2026-02-15",
            "tax_rate": 0.0,
            "line_items": [{"description": "x", "quantity": 1, "rate": 10}],
            "status": "draft",
        }
        r = requests.post(f"{BASE_URL}/api/admin/invoices", headers=auth_headers, json=payload)
        assert r.status_code in (200, 201)
        inv_id = r.json()["id"]
        r2 = requests.post(
            f"{BASE_URL}/api/admin/invoices/{inv_id}/send", headers=auth_headers, timeout=45
        )
        assert r2.status_code in (200, 503, 502), f"unexpected status: {r2.status_code} {r2.text[:200]}"
        if r2.status_code == 503:
            assert "Email is not configured" in r2.text
        # cleanup
        requests.delete(f"{BASE_URL}/api/admin/invoices/{inv_id}", headers=auth_headers)

    def test_public_invoice_fetch(self, invoice):
        r = requests.get(f"{BASE_URL}/api/invoices/public/{invoice['public_token']}")
        assert r.status_code == 200
        assert r.json()["id"] == invoice["id"]
