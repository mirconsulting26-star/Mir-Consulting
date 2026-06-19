"""Tests for the Open Graph prerender endpoint (/api/og/{kind}/{slug}).

Run: cd /app/backend && python -m pytest tests/test_og.py -v
Hits the live origin (http://localhost:8001) so the seeded content must exist.
"""
import urllib.request

BASE = "http://localhost:8001/api"


def _get(path: str) -> tuple[int, str]:
    try:
        with urllib.request.urlopen(f"{BASE}{path}") as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:  # noqa
        return e.code, e.read().decode()


def _first_slug(path: str, exclude_scheduled=True) -> str:
    import json

    with urllib.request.urlopen(f"{BASE}{path}") as r:
        data = json.load(r)
    for item in data:
        if not (exclude_scheduled and item.get("is_scheduled")):
            return item["slug"]
    return data[0]["slug"]


def test_blog_og_card_has_per_page_tags():
    slug = _first_slug("/posts")
    status, body = _get(f"/og/blog/{slug}")
    assert status == 200
    assert 'property="og:title"' in body
    assert 'property="og:description"' in body
    assert 'property="og:image"' in body
    assert 'name="twitter:card" content="summary_large_image"' in body
    # canonical + redirect both point at the human SPA URL
    assert f"/blog/{slug}" in body
    assert "http-equiv=\"refresh\"" in body
    assert "window.location.replace" in body


def test_case_study_og_card():
    slug = _first_slug("/case-studies")
    status, body = _get(f"/og/case-study/{slug}")
    assert status == 200
    assert 'property="og:type" content="article"' in body
    assert f"/case-studies/{slug}" in body


def test_video_og_card_uses_video_type():
    slug = _first_slug("/videos")
    status, body = _get(f"/og/video/{slug}")
    assert status == 200
    assert 'property="og:type" content="video.other"' in body
    assert f"/our-work/video/{slug}" in body


def test_missing_slug_redirects_gracefully():
    status, body = _get("/og/blog/this-slug-does-not-exist-zzz")
    assert status == 200
    assert "http-equiv=\"refresh\"" in body
    assert "/blog/this-slug-does-not-exist-zzz" in body


def test_unknown_kind_redirects():
    status, body = _get("/og/widget/whatever")
    assert status == 200
    assert "refresh" in body
