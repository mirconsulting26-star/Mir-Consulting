"""GitHub Contents API storage backend.

Used as a private CDN-like storage for uploaded media (team photos,
cover images, logos, etc.). The repo is private — we never share GitHub
URLs directly; instead the backend proxies file reads with in-memory
caching and serves them under /api/media/{path}.
"""
from __future__ import annotations

import base64
import logging
import mimetypes
import os
import re
import time
import uuid
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"
DEFAULT_BRANCH = "main"
CACHE_TTL_SECONDS = 60 * 60  # 1 hour read cache
MAX_CACHE_ENTRIES = 200

# Slugify-ish: keep letters, digits, dash, underscore; collapse the rest.
_FILENAME_SAFE = re.compile(r"[^A-Za-z0-9._-]+")

_read_cache: dict[str, tuple[float, bytes, str]] = {}


def _config() -> tuple[str, str, str]:
    token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPO")
    branch = os.environ.get("GITHUB_BRANCH", DEFAULT_BRANCH)
    if not token or not repo:
        raise RuntimeError(
            "GitHub storage is not configured. Set GITHUB_TOKEN and GITHUB_REPO in backend/.env"
        )
    return token, repo, branch


def is_configured() -> bool:
    return bool(os.environ.get("GITHUB_TOKEN") and os.environ.get("GITHUB_REPO"))


async def verify_config() -> dict:
    """Diagnostic ping: check token + repo + branch + write permission without uploading a real file.

    Returns a structured dict the admin UI can render. Never raises — every failure
    is encoded in the response so the frontend can show the exact GitHub error.
    """
    token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPO")
    branch = os.environ.get("GITHUB_BRANCH", DEFAULT_BRANCH)

    result: dict = {
        "ok": False,
        "configured": bool(token and repo),
        "repo": repo or None,
        "branch": branch,
        "token_present": bool(token),
        "token_preview": (f"{token[:4]}…{token[-4:]}" if token and len(token) >= 10 else None),
        "checks": [],
    }

    def _add(name: str, ok: bool, detail: str = "", hint: str = ""):
        result["checks"].append({"name": name, "ok": ok, "detail": detail, "hint": hint})

    if not token:
        _add("Token configured", False, "GITHUB_TOKEN env var is missing.",
             "Add GITHUB_TOKEN to your backend environment (Render → Environment).")
    if not repo:
        _add("Repo configured", False, "GITHUB_REPO env var is missing.",
             "Set GITHUB_REPO to 'owner/repo-name' in your backend environment.")
    if not token or not repo:
        return result

    headers = _headers(token)
    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. Token validity + identity
        try:
            r = await client.get(f"{GITHUB_API}/user", headers=headers)
        except Exception as e:  # noqa: BLE001
            _add("Token reaches GitHub", False, f"Network error: {e}",
                 "Backend host can't reach api.github.com — check outbound network.")
            return result
        if r.status_code == 401:
            _add("Token is valid", False, "GitHub returned 401 Unauthorized.",
                 "Token is invalid or expired. Generate a new fine-grained PAT.")
            return result
        if r.status_code == 403:
            # Could be SSO not authorised, or rate-limit
            msg = (r.json() or {}).get("message", "")
            _add("Token is valid", False, f"403 Forbidden — {msg}",
                 "If your org uses SSO, click 'Configure SSO' next to the token and authorise it for the org.")
            return result
        if r.status_code != 200:
            _add("Token is valid", False, f"Unexpected HTTP {r.status_code} from /user.",
                 "Generate a new token and retry.")
            return result
        login = (r.json() or {}).get("login", "?")
        _add("Token is valid", True, f"Authenticated as @{login}")

        # 2. Repo exists & token has access
        repo_url = f"{GITHUB_API}/repos/{repo}"
        rr = await client.get(repo_url, headers=headers)
        if rr.status_code == 404:
            _add("Repo accessible", False, f"Repo '{repo}' not found (404).",
                 "Either the repo name is wrong, or your token is a fine-grained PAT that doesn't include this repo. "
                 "Edit the token → 'Repository access' → add this repo.")
            return result
        if rr.status_code == 403:
            msg = (rr.json() or {}).get("message", "")
            _add("Repo accessible", False, f"403 Forbidden — {msg}",
                 "Token can't see this repo. Add the repo under your PAT's 'Repository access'.")
            return result
        if rr.status_code != 200:
            _add("Repo accessible", False, f"Unexpected HTTP {rr.status_code} reading repo.",
                 "Check repo name and token permissions.")
            return result
        repo_data = rr.json() or {}
        perms = repo_data.get("permissions") or {}
        default_branch = repo_data.get("default_branch", "")
        _add("Repo accessible", True,
             f"Found {repo_data.get('full_name')} (default branch: {default_branch}, private: {repo_data.get('private')})")

        # 3. Branch exists
        br = await client.get(f"{GITHUB_API}/repos/{repo}/branches/{branch}", headers=headers)
        if br.status_code == 404:
            _add("Branch exists", False, f"Branch '{branch}' not found.",
                 f"Set GITHUB_BRANCH to '{default_branch}' (the repo's default) or create the branch.")
            return result
        if br.status_code != 200:
            _add("Branch exists", False, f"Unexpected HTTP {br.status_code} reading branch.",
                 "Check GITHUB_BRANCH value.")
            return result
        _add("Branch exists", True, f"Branch '{branch}' is reachable.")

        # 4. Write permission — check 'push' perm OR do a dry-run via creating then deleting a tiny probe file.
        if perms and not perms.get("push", False):
            _add("Write permission", False,
                 "Token can read this repo but does NOT have push/write access.",
                 "Fine-grained PAT → Repository permissions → set 'Contents' to 'Read and write'. "
                 "Classic PAT → tick the 'repo' scope.")
            return result

        # Actually attempt a probe write + delete to be 100% sure.
        probe_path = f"_diagnostics/probe-{uuid.uuid4().hex[:8]}.txt"
        probe_api = f"{GITHUB_API}/repos/{repo}/contents/{probe_path}"
        put_payload = {
            "message": "mir: github connectivity probe",
            "content": base64.b64encode(b"mir-probe").decode("ascii"),
            "branch": branch,
        }
        pr = await client.put(probe_api, headers=headers, json=put_payload)
        if pr.status_code not in (200, 201):
            gh_msg = ""
            try:
                gh_msg = (pr.json() or {}).get("message", "") or ""
            except Exception:
                gh_msg = pr.text[:200]
            _add("Write permission (live probe)", False,
                 f"HTTP {pr.status_code}: {gh_msg}",
                 "Token is missing write access. Fine-grained PAT → Repository permissions → 'Contents: Read and write'.")
            return result

        # Clean up the probe
        sha = (pr.json() or {}).get("content", {}).get("sha")
        if sha:
            await client.request(
                "DELETE", probe_api, headers=headers,
                json={"message": "mir: cleanup probe", "sha": sha, "branch": branch},
            )
        _add("Write permission (live probe)", True,
             "Successfully created and deleted a probe file — uploads will work.")

    result["ok"] = all(c["ok"] for c in result["checks"])
    return result


def _headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _safe_filename(original: str) -> str:
    name = (original or "file").strip().split("/")[-1]
    if "." in name:
        stem, ext = name.rsplit(".", 1)
        ext = _FILENAME_SAFE.sub("", ext).lower()[:8] or "bin"
    else:
        stem, ext = name, "bin"
    stem = _FILENAME_SAFE.sub("-", stem).strip("-_.")[:60] or "file"
    return f"{stem}-{uuid.uuid4().hex[:8]}.{ext}"


def _evict_cache_if_needed() -> None:
    if len(_read_cache) <= MAX_CACHE_ENTRIES:
        return
    # drop oldest
    oldest = sorted(_read_cache.items(), key=lambda kv: kv[1][0])[: len(_read_cache) // 4]
    for k, _ in oldest:
        _read_cache.pop(k, None)


async def upload_file(folder: str, filename: str, file_bytes: bytes, content_type: Optional[str] = None) -> dict:
    """Push file to GitHub via Contents API. Returns {path, url}.

    `folder` is normalised to a slash-separated path inside the repo.
    """
    token, repo, branch = _config()
    folder = (folder or "uploads").strip("/")
    safe_name = _safe_filename(filename)
    path = f"{folder}/{safe_name}"
    api_url = f"{GITHUB_API}/repos/{repo}/contents/{path}"
    payload = {
        "message": f"upload: {path}",
        "content": base64.b64encode(file_bytes).decode("ascii"),
        "branch": branch,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.put(api_url, headers=_headers(token), json=payload)
    if r.status_code not in (200, 201):
        logger.error("GitHub upload failed %s %s: %s", r.status_code, path, r.text[:300])
        # Extract the actual GitHub message so the admin sees something actionable.
        gh_msg = ""
        try:
            gh_msg = (r.json() or {}).get("message", "") or ""
        except Exception:
            gh_msg = r.text[:200]

        if r.status_code == 401:
            hint = "GITHUB_TOKEN is invalid or expired — generate a new fine-grained PAT."
        elif r.status_code == 403:
            hint = (
                "Your PAT does not have permission to write to this repo. "
                "Open GitHub → Settings → Developer settings → Personal access tokens → "
                "your token → make sure 'Repository access' includes the repo and "
                "'Repository permissions › Contents' is set to 'Read and write'."
            )
        elif r.status_code == 404:
            hint = (
                f"Repository '{repo}' or branch '{branch}' was not found. "
                "Check GITHUB_REPO and GITHUB_BRANCH in your backend .env."
            )
        elif r.status_code == 422:
            hint = "GitHub rejected the file (validation error). Try a different filename."
        else:
            hint = "Try again in a moment, or check the backend logs."

        raise RuntimeError(
            f"GitHub upload failed ({r.status_code}). {gh_msg}. {hint}".strip()
        )
    return {"path": path, "url": f"/api/media/{path}"}


async def fetch_file(path: str) -> tuple[bytes, str]:
    """Return (bytes, content_type) for the file at `path`. Cached for 1h."""
    path = path.lstrip("/")
    now = time.time()
    cached = _read_cache.get(path)
    if cached and now - cached[0] < CACHE_TTL_SECONDS:
        return cached[1], cached[2]
    token, repo, branch = _config()
    api_url = f"{GITHUB_API}/repos/{repo}/contents/{path}?ref={branch}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Use raw media type to avoid base64 + 1MB limit on large files
        headers = _headers(token).copy()
        headers["Accept"] = "application/vnd.github.raw"
        r = await client.get(api_url, headers=headers)
    if r.status_code == 404:
        raise FileNotFoundError(path)
    if r.status_code != 200:
        logger.error("GitHub fetch failed %s %s: %s", r.status_code, path, r.text[:200])
        raise RuntimeError(f"GitHub fetch failed ({r.status_code})")
    content_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
    data = r.content
    _read_cache[path] = (now, data, content_type)
    _evict_cache_if_needed()
    return data, content_type


async def delete_file(path: str) -> bool:
    """Delete a file from the repo. Returns True if deleted, False if missing."""
    token, repo, branch = _config()
    path = path.lstrip("/")
    api_url = f"{GITHUB_API}/repos/{repo}/contents/{path}?ref={branch}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        head = await client.get(api_url, headers=_headers(token))
        if head.status_code == 404:
            return False
        if head.status_code != 200:
            raise RuntimeError(f"GitHub head failed ({head.status_code})")
        sha = head.json().get("sha")
        if not sha:
            return False
        del_url = f"{GITHUB_API}/repos/{repo}/contents/{path}"
        r = await client.request(
            "DELETE",
            del_url,
            headers=_headers(token),
            json={"message": f"delete: {path}", "sha": sha, "branch": branch},
        )
    _read_cache.pop(path, None)
    return r.status_code in (200, 204)
