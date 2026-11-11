---
name: dependency-audit
description: "Supply chain security audit: CVE scanning, typosquatting detection, license compliance, and transitive dependency review."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: trail-of-bits
allowed-tools: Bash, Read
---

# Supply Chain Security Audit

A security-focused dependency audit targeting supply chain attack vectors, CVEs, and risky transitive dependencies.

## STEP 1: CVE SCAN

Run the package manager's security audit:
```
npm audit --json
```

For each finding with severity `critical` or `high`:
- Package name and version
- CVE identifier and CVSS score
- Vulnerable code path (which of your direct dependencies pulls it in)
- Whether a patched version is available
- Whether the vulnerable code is reachable in your application's usage

## STEP 2: TYPOSQUATTING DETECTION

Review `package.json` dependencies for packages that:
- Have names similar to popular packages but with slight misspellings
- Were published very recently (last 30 days) with high download counts
- Have minimal source code but request filesystem or network access

Flag suspicious packages for manual review.

## STEP 3: DEPENDENCY PROVENANCE

For each direct dependency, check:
- Is the package actively maintained (last publish within 2 years)?
- Does the package have a published security policy?
- Are there known abandoned packages that should be replaced?

## STEP 4: PERMISSION SCOPE REVIEW

For Node.js, review scripts that run at install time:
- `preinstall`, `postinstall`, `prepare` scripts in direct and transitive deps
- Scripts that access the filesystem, network, or spawn child processes

Flag any postinstall scripts from packages not widely trusted.

## STEP 5: LICENSE COMPLIANCE

Scan for licenses that create legal obligations:
- **Copyleft (GPL/LGPL/AGPL)**: requires your code to be open-sourced if you distribute the software
- **Creative Commons**: check specific variant (NC, ND restrictions)
- **Unlicensed or missing license**: legally ambiguous — cannot use commercially

List all production dependencies (`dependencies`, not `devDependencies`) with their SPDX license identifiers.

## STEP 6: LOCKFILE INTEGRITY

- Confirm `package-lock.json` or `yarn.lock` is committed and up to date
- Check that lockfile integrity hashes are present for all packages
- Verify the lockfile was not manually modified (check git blame for suspicious edits)

## STEP 7: REPORT

```
CRITICAL CVEs: [N]
HIGH CVEs: [N]
SUSPICIOUS PACKAGES: [list]
ABANDONED PACKAGES: [list]
LICENSE FLAGS: [list]
LOCKFILE: [OK / issues]

RECOMMENDED ACTIONS (in priority order):
1. ...
```

## ANTI-PATTERNS

- Running `npm install` without reviewing the lockfile diff
- `npm audit fix --force` without reviewing what it changes
- Ignoring `devDependencies` CVEs (they execute in CI pipelines)
- Pinning to a vulnerable version because "it works"
