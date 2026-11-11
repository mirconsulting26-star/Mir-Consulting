---
name: security-hardening
description: "Security hardening review: OWASP Top 10 prevention, boundary trust analysis, input validation, and verification gates."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: pandaos
allowed-tools: Read, Grep, Glob, Bash
---

# Security Hardening

A structured security review that systematically evaluates code against OWASP Top 10, trust boundaries, and defense-in-depth principles.

## STEP 1: MAP TRUST BOUNDARIES

Classify every interface in the codebase into three tiers:

| Tier | Description | Validation Required |
|------|-------------|-------------------|
| **External** | User input, API requests, webhooks, file uploads | Full validation, sanitization, rate limiting |
| **Internal** | Service-to-service, IPC, bridge server calls | Schema validation, auth token verification |
| **Trusted** | Same-process function calls, type-safe boundaries | Type safety only (TypeScript strict mode) |

Identify ALL entry points where data crosses from a higher-trust to lower-trust tier. These are your attack surface.

## STEP 2: OWASP TOP 10 CHECKLIST

Review each changed file against these categories. Check the box only when verified:

1. **Injection** (SQL, NoSQL, OS command, LDAP)
   - All queries use parameterized statements or ORMs
   - No string concatenation in queries
   - User input never passed to `exec`, `execSync`, `shell.openExternal` without validation

2. **Broken Authentication**
   - Session tokens have proper expiry and rotation
   - Password/credential storage uses bcrypt/argon2 (never SHA/MD5)
   - Auth bypass paths (dev mode) are gated by `!app.isPackaged` or equivalent

3. **Sensitive Data Exposure**
   - No secrets in source code, logs, or error messages
   - Environment variables not leaked to client bundles
   - API keys, tokens, credentials use proper secret management

4. **XXE / Broken Access Control**
   - Authorization checks exist at every endpoint, not just authentication
   - No IDOR (Insecure Direct Object Reference) - users can only access their own data
   - RLS policies enforced at database level (Supabase)

5. **Security Misconfiguration**
   - No debug endpoints in production
   - CORS properly configured (not `*` in production)
   - Security headers set (CSP, X-Frame-Options, etc.)

6. **XSS**
   - No `dangerouslySetInnerHTML` with user content
   - All user-rendered content is escaped
   - CSP headers restrict inline scripts

7. **Insecure Dependencies**
   - `npm audit` shows no critical/high vulnerabilities
   - No deprecated packages with known CVEs

## STEP 3: INPUT VALIDATION AUDIT

For every external-tier entry point:
- Is input validated against a schema (Zod, Joi, etc.) before processing?
- Are there length limits, type checks, and allowlist patterns?
- Is validation happening at the boundary (not deep inside business logic)?

## STEP 4: VERIFICATION GATES

Before marking review complete, confirm:

| Gate | Status |
|------|--------|
| All external inputs validated at the boundary | |
| No secrets in code, logs, or error messages | |
| Auth checks on every endpoint | |
| No SQL/command injection vectors | |
| No XSS vectors in rendered content | |
| Dependencies have no critical CVEs | |

## ANTI-RATIONALIZATION TABLE

| Shortcut | Why It Fails | Do This Instead |
|----------|-------------|-----------------|
| "It's internal, no one will hit this endpoint" | Internal endpoints get exposed through bugs, misconfig, or scope creep | Validate at every boundary regardless of trust level |
| "We'll add auth later" | Unauthenticated endpoints are discovered within hours of deployment | Add auth before the endpoint goes live |
| "It's just a dev tool" | Dev tools ship to production more often than you think | Gate with `!app.isPackaged` and verify it's not bundled |
| "The framework handles sanitization" | Frameworks have gaps (React's `dangerouslySetInnerHTML`, raw SQL in ORMs) | Verify explicitly, never assume |
| "We trust this data source" | Supply chain attacks, compromised APIs, data corruption | Validate even trusted sources at integration boundaries |

## STEP 5: REPORT

Output findings grouped by severity:
- **Critical**: Active vulnerability exploitable in production
- **Significant**: Defense gap that could be exploited with effort
- **Hardening**: Defense-in-depth improvement, not currently exploitable

Fix Critical issues immediately. Significant issues should be addressed before merge.

---

## Security Headers Configuration

Every HTTP server must set the following headers. Use this Nginx block as the canonical reference:

```nginx
server {
    # Prevent MIME type sniffing
    add_header X-Content-Type-Options "nosniff" always;

    # Clickjacking protection
    add_header X-Frame-Options "DENY" always;

    # XSS filter (legacy browsers)
    add_header X-XSS-Protection "1; mode=block" always;

    # Strict Transport Security — 1 year, include subdomains, preload-ready
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Content Security Policy — tighten per-app; this is a safe restrictive default
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

    # Referrer Policy
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Permissions Policy — deny all sensitive APIs by default
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;

    # Remove server version disclosure
    server_tokens off;
}
```

When reviewing an existing deployment, flag any of the above that are absent as **Hardening** findings. Flag an absent HSTS header as **Significant** if the application handles authenticated sessions over HTTPS.

---

## CI/CD Security Pipeline

Every repository must have automated security scanning in its CI/CD pipeline. The three required stages are:

```yaml
# GitHub Actions — security scanning (runs on every PR to main)
name: Security Scan

on:
  pull_request:
    branches: [main]

jobs:
  sast:
    name: Static Analysis (SAST)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/owasp-top-ten
            p/cwe-top-25

  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy (filesystem)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'   # Block merge on CRITICAL or HIGH

  secrets-scan:
    name: Secrets Detection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # Full history required for Gitleaks
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Stage responsibilities:**
- **SAST (Semgrep)**: Detects injection, XSS, insecure deserialization, and CWE Top 25 patterns in source code
- **Dependency scan (Trivy)**: Detects known CVEs in third-party packages; blocks on CRITICAL/HIGH
- **Secrets scan (Gitleaks)**: Detects hardcoded credentials, API keys, tokens across the full git history

Flag the absence of any of these three stages as a **Significant** finding during hardening review.
