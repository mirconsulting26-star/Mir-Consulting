# Degraded modes

Use the first applicable mode and state it plainly.

## No subagent capability

Run angles sequentially. Read 10 to 20 pages per angle, append the complete
evidence records immediately, and keep only the current angle in context. Report
the real page count and say the run was sequential.

## No dedicated page reader, safe CLI HTTP available

Prefer a dedicated fetch tool. Use CLI HTTP only for literal public HTTP(S) URLs
passed as argument values, never interpolated shell text. Reject userinfo,
loopback, private, link-local, file, and non-HTTP(S) targets. Send no cookies,
credentials, authentication headers, or ambient configuration. Cap redirects,
time, and response size. Never download or execute an artifact. Record this
fallback in the run statistics.

If safe search is also absent, stop instead of guessing URLs.

## Search works but page bodies cannot be read

Do not create the standard report. Search snippets are not sources. Produce only
`.pandaos/research/<safe-slug>-source-leads-<date>.md`, a clearly labeled list of search
result titles and public URLs with `Pages read: 0` and `Verification: not run`.
Do not synthesize factual claims. Offer to resume the full run when page reading
is available.

## No web search

Stop. Explain that current web search is required and unavailable. Offer to work
from user-provided documents or give an uncited memory-based orientation that is
explicitly not a research report. Never fabricate or reconstruct citations.
