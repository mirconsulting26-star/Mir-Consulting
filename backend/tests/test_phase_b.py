"""Phase B backend tests: Subscribers, Scheduled publishing masking, stats."""
import os
import time

import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL", "https://mir-consulting-next.preview.emergentagent.com"
).rstrip("/")
ADMIN_PASSWORD = "mir-admin-2026"
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def token():
    time.sleep(2)
    r = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


class TestSubscribers:
    email = f"qa.phaseb.{int(time.time())}@example.com"

    def test_subscribe_creates(self):
        r = requests.post(f"{API}/subscribe", json={"email": self.email, "source": "test"}, timeout=15)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["email"] == self.email
        assert body["source"] == "test"

    def test_subscribe_is_idempotent(self):
        r = requests.post(f"{API}/subscribe", json={"email": self.email}, timeout=15)
        assert r.status_code in (200, 201)
        assert r.json()["email"] == self.email

    def test_subscribe_rejects_bad_email(self):
        r = requests.post(f"{API}/subscribe", json={"email": "not-an-email"}, timeout=15)
        assert r.status_code == 422

    def test_admin_list_requires_auth(self):
        r = requests.get(f"{API}/admin/subscribers", timeout=10)
        assert r.status_code == 401

    def test_admin_list_and_cleanup(self, auth):
        r = requests.get(f"{API}/admin/subscribers", headers=auth, timeout=10)
        assert r.status_code == 200
        subs = r.json()
        mine = [s for s in subs if s["email"] == self.email]
        assert len(mine) == 1
        # CSV export
        c = requests.get(f"{API}/admin/subscribers-export.csv", headers=auth, timeout=10)
        assert c.status_code == 200
        assert "text/csv" in c.headers.get("content-type", "")
        assert self.email in c.text
        # cleanup
        d = requests.delete(f"{API}/admin/subscribers/{mine[0]['id']}", headers=auth, timeout=10)
        assert d.status_code == 200

    def test_stats_has_subscribers_total(self, auth):
        r = requests.get(f"{API}/admin/stats", headers=auth, timeout=10)
        assert r.status_code == 200
        assert "subscribers_total" in r.json()


class TestScheduledPublishing:
    def test_future_scheduled_post_is_masked(self, auth):
        payload = {
            "title": "QA_PhaseB Future Scheduled",
            "excerpt": "Teaser excerpt that stays visible.",
            "content": "<p>Hidden secret body content.</p>",
            "category": "QA",
            "status": "published",
            "scheduled_for": "2099-01-01",
        }
        created = requests.post(f"{API}/admin/posts", headers=auth, json=payload, timeout=15)
        assert created.status_code == 201, created.text
        doc = created.json()
        slug, pid = doc["slug"], doc["id"]
        try:
            # Detail: masked
            detail = requests.get(f"{API}/posts/{slug}", timeout=10)
            assert detail.status_code == 200
            d = detail.json()
            assert d.get("is_scheduled") is True
            assert d.get("content") == ""
            assert d.get("title") == payload["title"]
            # List: excluded
            lst = requests.get(f"{API}/posts", timeout=10).json()
            assert all(p["slug"] != slug for p in lst)
            # Works feed: excluded
            works = requests.get(f"{API}/works", timeout=10).json()
            assert all(w.get("slug") != slug for w in works)
        finally:
            requests.delete(f"{API}/admin/posts/{pid}", headers=auth, timeout=10)

    def test_past_scheduled_post_is_live(self, auth):
        payload = {
            "title": "QA_PhaseB Past Scheduled",
            "excerpt": "Teaser excerpt visible now.",
            "content": "<p>Visible body content.</p>",
            "category": "QA",
            "status": "published",
            "scheduled_for": "2020-01-01",
        }
        created = requests.post(f"{API}/admin/posts", headers=auth, json=payload, timeout=15)
        assert created.status_code == 201, created.text
        doc = created.json()
        slug, pid = doc["slug"], doc["id"]
        try:
            detail = requests.get(f"{API}/posts/{slug}", timeout=10)
            assert detail.status_code == 200
            d = detail.json()
            assert not d.get("is_scheduled")
            assert "Visible body content" in d.get("content", "")
            lst = requests.get(f"{API}/posts", timeout=10).json()
            assert any(p["slug"] == slug for p in lst)
        finally:
            requests.delete(f"{API}/admin/posts/{pid}", headers=auth, timeout=10)
