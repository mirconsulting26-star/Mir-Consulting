---
name: ab-testing
description: "Design and analyze A/B tests: hypothesis formation, sample size calculation, significance testing, and result interpretation."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: pandaos
---

# A/B Testing

Rigorous A/B test design and analysis — from hypothesis to statistically valid conclusions.

## STEP 1: DEFINE THE TEST

Parse $ARGUMENTS for:
- What is being tested (headline, CTA, layout, email subject, ad creative)
- Current metric (baseline conversion rate)
- Minimum detectable effect (how much improvement are you looking for?)
- Traffic volume per day/week

## STEP 2: FORM A TESTABLE HYPOTHESIS

Structure the hypothesis as:
"If we change [X] to [Y], then [metric] will [increase/decrease] by [N]% because [reason]."

The hypothesis must be:
- Falsifiable: a clear outcome that can be confirmed or denied
- Grounded in a reason: not just "let's try it"
- Measuring one variable: do not test two things simultaneously

## STEP 3: CALCULATE REQUIRED SAMPLE SIZE

Use a two-proportion z-test power calculation:

Given:
- Baseline conversion rate (p1)
- Minimum detectable effect (p2 = p1 * (1 + MDE))
- Statistical power: 80% (standard)
- Significance level: 95% (alpha = 0.05)

Formula (approximate):
```
n = 2 * ((z_alpha + z_power)^2 * p_avg * (1 - p_avg)) / (p1 - p2)^2
```

Where z_alpha = 1.96, z_power = 0.84 for 80% power.

Output: minimum sample size per variant and estimated days to reach significance.

## STEP 4: RUN CHECKLIST

Before launching the test:
- [ ] Only one variable changed
- [ ] Test runs for full business cycles (minimum 1 full week, ideally 2)
- [ ] Both variants served in parallel, not sequentially
- [ ] No other major changes during the test period
- [ ] Sample size target confirmed before stopping

## STEP 5: ANALYZE RESULTS

When data is provided:
- Calculate conversion rates for A and B
- Calculate p-value using chi-square or z-test
- If p < 0.05: statistically significant
- Report: uplift percentage, confidence interval, p-value
- Check for segment interactions (does the winner vary by device, source, etc.?)

## STEP 6: INTERPRET AND DECIDE

- **Winner**: p < 0.05, uplift is positive — implement the winner
- **No significant difference**: p > 0.05 — the variants are equivalent; keep the simpler one
- **Loser**: p < 0.05, uplift is negative — keep control

Never stop a test early because the results look good — p-values fluctuate and early stopping inflates false positives.

## ANTI-PATTERNS

- Testing multiple variables at once (you won't know which caused the change)
- Stopping early when you see a winning trend
- Running tests without calculating required sample size first
- Ignoring novelty effects (first-week engagement often inflates results)
- Declaring a winner at 90% confidence instead of 95%
