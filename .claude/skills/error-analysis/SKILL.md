---
name: error-analysis
description: "Analyze error patterns across a codebase: categorize, prioritize, and recommend systematic fixes."
source: community
allowed-tools: "*"
user-invocable: true
---

# Error Analysis

Analyze error handling patterns across a codebase to find gaps, inconsistencies, and areas where errors are silently swallowed or poorly handled.

## STEP 1: SCOPE

Parse $ARGUMENTS for:
- Specific modules, services, or layers to analyze
- Known error types or patterns to focus on
- Whether to analyze runtime errors (logs) or code-level error handling

## STEP 2: AUDIT ERROR HANDLING

Scan the codebase for error handling patterns:

- **Try/catch blocks**: Are they catching too broadly? Too narrowly? Are caught errors handled or silently swallowed?
- **Promise chains**: Are `.catch()` handlers present? Do `async` functions have proper error boundaries?
- **Error propagation**: Do errors bubble up with context, or are they re-thrown without additional information?
- **Error types**: Are custom error classes used, or is everything a generic `Error`?
- **HTTP error responses**: Are API errors returned with appropriate status codes and messages?
- **Logging**: Are errors logged with sufficient context for debugging?

## STEP 3: CATEGORIZE FINDINGS

Group issues by severity:

### Critical
- Errors silently swallowed (empty catch blocks, `.catch(() => {})`)
- Missing error handling on I/O operations (file, network, database)
- Unhandled promise rejections
- Error handling that leaks sensitive information

### Significant
- Inconsistent error formats across API endpoints
- Generic error messages that don't help users or developers
- Missing error boundaries in UI components
- Retry logic without backoff or limits

### Minor
- Inconsistent error logging patterns
- Redundant try/catch blocks
- Error messages that could be more specific

## STEP 4: RECOMMEND FIXES

For each category, provide:
- The pattern to adopt (with code examples)
- Files that need updating
- Priority order for fixes
- Whether the fix can be automated or needs manual review
