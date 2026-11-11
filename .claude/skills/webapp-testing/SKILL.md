---
name: webapp-testing
description: "Web app testing workflow: unit tests, integration tests, and E2E smoke. Covers React components, API routes, and critical user flows."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: pandaos
allowed-tools: Read, Bash, Write, Glob, Grep
---

# Web App Testing

A structured testing workflow covering unit, integration, and end-to-end tests for web applications.

## STEP 1: AUDIT CURRENT COVERAGE

Run the existing test suite and report:
- Total tests and pass/fail status
- Coverage percentage (if coverage tooling is configured)
- Identify which areas have zero tests

Parse $ARGUMENTS for a specific component or feature to focus on, or default to all recently changed files.

## STEP 2: UNIT TESTS — PURE FUNCTIONS AND UTILITIES

For each utility function, data transformer, or business logic function:
- Write tests for happy path, edge cases, and error conditions
- Use table-driven tests (parameterized) for functions with multiple input variants
- No mocking of pure functions — they should be directly testable

## STEP 3: COMPONENT TESTS

For each React component or UI unit:
- Test that it renders without crashing with required props
- Test user interactions (clicks, form submissions, keyboard navigation)
- Test conditional rendering (loading states, error states, empty states)
- Use `@testing-library/react` — query by accessible role, not by CSS class or test ID
- Do not test implementation details (internal state, method calls)

## STEP 4: API/SERVER TESTS

For each API route or server action:
- Test valid inputs return correct status and body
- Test invalid inputs return appropriate error responses (400, 422)
- Test authentication/authorization gates
- Mock external services (databases, third-party APIs) at the boundary

## STEP 5: E2E SMOKE TEST

Write one or two end-to-end tests covering the most critical user flow:
- User can complete the primary action (sign up, create item, submit form)
- The application recovers gracefully from a network error

## STEP 6: RUN AND CONFIRM

Run the full test suite. All new tests must pass. Fix any regressions introduced by changes.

## BROWSER DEVTOOLS INTEGRATION

When testing web apps with Chrome DevTools MCP or similar browser automation:

**DOM Inspection:**
- Use `browser_snapshot` to get the accessibility tree (preferred over raw HTML)
- Query by accessible roles and labels, not CSS selectors
- Verify rendered content matches expected state

**Console Monitoring:**
- Capture `console.error` and `console.warn` during test flows
- Any unexpected console error during a test is a test failure
- Filter out known framework warnings (React strict mode double-render, etc.)

**Network Tracing:**
- Monitor network requests during E2E flows to verify API calls
- Check for failed requests (4xx/5xx) that the UI silently swallows
- Verify request payloads match expected data

**Performance Profiling:**
- Run Lighthouse audit on critical pages (target score > 90)
- Check for layout shifts during interaction (CLS < 0.1)
- Verify no memory leaks during repeated navigation

## TESTING METHODOLOGY

| What to Test | How to Test | Why |
|-------------|------------|-----|
| Pure logic | Unit tests (Vitest/Jest) | Fast, reliable, no setup |
| Component rendering | Testing Library with user events | Tests behavior, not implementation |
| API contracts | Integration tests with real/mock server | Catches boundary mismatches |
| User flows | E2E with browser automation | Catches what unit tests miss |
| Visual regressions | Screenshot comparison | Catches CSS-only bugs |

## ANTI-PATTERNS

- Testing implementation details instead of behavior
- Using `data-testid` when accessible roles are available
- Mocking the thing under test
- Tests that always pass (no assertions)
- Snapshot tests for dynamic content (they become stale immediately)

## ANTI-RATIONALIZATION TABLE

| Shortcut | Why It Fails | Do This Instead |
|----------|-------------|-----------------|
| "Manual testing is sufficient" | Manual testing doesn't scale and misses regressions | Automate the critical path, manually test edge cases |
| "E2E tests are flaky, let's skip them" | Flaky tests indicate real timing/state issues in the app | Fix the flakiness (add proper waits, stabilize state) |
| "We have 90% coverage so we're good" | Coverage measures execution, not correctness | Write meaningful assertions, not just line-visiting tests |
| "Mocking the database is fine" | Over-mocking hides real query bugs | Use a test database for integration tests |
