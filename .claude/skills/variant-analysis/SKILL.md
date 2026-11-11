---
name: variant-analysis
description: "Find similar vulnerability patterns across the codebase after discovering a security issue. Ensures one fix addresses all instances."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: trail-of-bits
allowed-tools: Read, Grep, Glob, Bash
---

# Variant Analysis

When a security vulnerability is found, variant analysis searches the entire codebase for similar patterns to ensure the fix is applied everywhere.

## STEP 1: CHARACTERIZE THE VULNERABILITY

Parse $ARGUMENTS for the original vulnerability. Document:
- The vulnerable pattern (e.g., "unsanitized user input passed to SQL query")
- The specific code construct involved (e.g., string concatenation in `db.query()` calls)
- The root cause (e.g., "raw string interpolation instead of parameterized query")

## STEP 2: EXTRACT THE SEARCH PATTERN

Translate the vulnerability into searchable code patterns. For example:
- SQL injection: search for `db.query(`, `pool.query(`, `connection.execute(` followed by template literals or string concatenation
- Command injection: search for `exec(`, `execSync(`, `spawn(` with template literal arguments
- XSS: search for `dangerouslySetInnerHTML`, `innerHTML =`, `.html(` with user variables
- Path traversal: search for `path.join(`, `readFile(`, `createReadStream(` with user-controlled strings

## STEP 3: SYSTEMATIC SEARCH

Run targeted searches across the codebase:

```bash
# Example for SQL injection pattern
grep -rn "\.query(\`\|\.query('" src/ --include="*.ts" --include="*.js"
grep -rn "\.execute(\`\|\.execute('" src/ --include="*.ts" --include="*.js"
```

Read each match in context. Determine:
- Is this an actual instance of the vulnerability?
- Is this a safe usage that merely resembles the pattern?

## STEP 4: CLASSIFY FINDINGS

For each match found:
- **Confirmed vulnerable**: same root cause, exploitable in same way
- **Variant**: similar pattern but different context — may or may not be vulnerable
- **False positive**: resembles the pattern but is actually safe

## STEP 5: FIX ALL CONFIRMED VULNERABILITIES

Apply the same fix to every confirmed vulnerable instance:
- Use the same remediation pattern
- Do not leave any confirmed instance unfixed
- Add defensive comments explaining why the fix is necessary

## STEP 6: REPORT

```
ORIGINAL VULNERABILITY: [description]
SEARCH PATTERNS USED: [list]
INSTANCES FOUND: [N]

CONFIRMED VULNERABLE: [list with file:line]
VARIANTS (needs review): [list with file:line]
FALSE POSITIVES: [count]

FIXES APPLIED: [list]
```

## ANTI-PATTERNS

- Fixing only the reported instance without checking for variants
- Searching only in the same file or module — vulnerabilities often span the codebase
- Treating structurally similar code as safe without reading it in context
- Closing the issue after fixing one instance without confirming all variants are addressed
