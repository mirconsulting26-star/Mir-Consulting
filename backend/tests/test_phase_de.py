"""Phase D/E backend tests: team slugs, extended profile fields, works-feed taxonomy."""
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
def auth():
    time.sleep(1)
    r = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code}")
    return {"Authorization": f"Bearer {r.json()['token']}"}


def test_team_member_slug_and_profile_fields(auth):
    payload = {
        "name": "Test Alpha Bravo",
        "role": "Principal Consultant",
        "bio": "Senior operator.",
        "headline": "20 years scaling operations",
        "career_story": "Started in retail ops...",
        "skills": ["SQL", "Forecasting"],
        "tools": ["Power BI", "Shopify"],
        "achievements": ["Cut costs 30%"],
        "email": "alpha@example.com",
        "service_slugs": ["analytics-bi", "process-automation"],
        "industry_slugs": ["retail"],
    }
    created = requests.post(f"{API}/admin/team", headers=auth, json=payload, timeout=15)
    assert created.status_code == 201, created.text
    m = created.json()
    tid, slug = m["id"], m["slug"]
    try:
        assert slug == "test-alpha-bravo"
        assert m["skills"] == ["SQL", "Forecasting"]
        assert m["service_slugs"] == ["analytics-bi", "process-automation"]
        # Public fetch by slug
        pub = requests.get(f"{API}/team/{slug}", timeout=10)
        assert pub.status_code == 200
        assert pub.json()["headline"] == "20 years scaling operations"
        # 404 for unknown slug
        assert requests.get(f"{API}/team/does-not-exist-xyz", timeout=10).status_code == 404
    finally:
        requests.delete(f"{API}/admin/team/{tid}", headers=auth, timeout=10)


def test_duplicate_team_names_get_unique_slugs(auth):
    body = {"name": "Dup Name Person", "role": "Consultant", "bio": "Bio here."}
    a = requests.post(f"{API}/admin/team", headers=auth, json=body, timeout=15).json()
    b = requests.post(f"{API}/admin/team", headers=auth, json=body, timeout=15).json()
    try:
        assert a["slug"] != b["slug"]
        assert a["slug"] == "dup-name-person"
    finally:
        requests.delete(f"{API}/admin/team/{a['id']}", headers=auth, timeout=10)
        requests.delete(f"{API}/admin/team/{b['id']}", headers=auth, timeout=10)


def test_works_feed_includes_taxonomy_fields(auth):
    payload = {
        "title": "QA_DE Tagged Post",
        "excerpt": "Tag test excerpt long enough.",
        "content": "<p>Body.</p>",
        "category": "QA",
        "status": "published",
        "service_slugs": ["analytics-bi"],
        "industry_slugs": ["retail"],
    }
    created = requests.post(f"{API}/admin/posts", headers=auth, json=payload, timeout=15).json()
    pid, slug = created["id"], created["slug"]
    try:
        works = requests.get(f"{API}/works", timeout=10).json()
        item = next((w for w in works if w.get("slug") == slug), None)
        assert item is not None
        assert item["service_slugs"] == ["analytics-bi"]
        assert item["industry_slugs"] == ["retail"]
    finally:
        requests.delete(f"{API}/admin/posts/{pid}", headers=auth, timeout=10)
