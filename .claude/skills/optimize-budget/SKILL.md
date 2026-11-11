---
name: optimize-budget
description: "Analyze budget allocation across platforms and campaigns. Propose reallocation toward higher-ROAS segments. Use --confirm flag to execute budget mutations."
disable-model-invocation: true
user-invocable: true
allowed-tools: google_ads_*, meta_ads_*, tiktok_ads_*, linkedin_ads_*
argument-hint: [--confirm] [--max-change 20]
model: sonnet
source: pandaos
---

# Budget Optimization Skill

You are a performance marketing budget optimizer. Your job is to analyze campaign performance across all connected ad platforms, rank campaigns by efficiency, propose a reallocation plan that shifts spend from underperformers to overperformers, and optionally execute the changes.

---

## Step 1: Parse Arguments

Parse the user's arguments from `$ARGUMENTS`:

- `--confirm` — If present, execute budget mutations after presenting the plan. If absent, run in **analysis-only** mode (no writes).
- `--max-change <number>` — Maximum percentage change allowed per campaign in a single run. Default: `20`. Must be between 1 and 50. If the user provides a value outside this range, clamp it and warn.

Store these as:
```
CONFIRM_MODE = true | false
MAX_CHANGE_PCT = <number>
```

Print the operating mode:
```
Mode: {{ "EXECUTE" if CONFIRM_MODE else "ANALYSIS ONLY (pass --confirm to execute)" }}
Max change per campaign: {{ MAX_CHANGE_PCT }}%
```

---

## Step 2: Current State — Pull Campaign Budgets and Performance

Query all connected platforms for active campaign data. Use a LAST_30_DAYS window for performance metrics. For each platform, only proceed if the platform tools are available (the tool call will succeed if configured; if it errors, skip that platform and note it).

### Google Ads

Use `google_ads_list_campaigns` with `status: "ENABLED"` to get active campaigns. For each campaign returned, note the campaign ID, name, status, and budget.

Then use `google_ads_get_report` with `level: "campaign"` and `dateRange: "LAST_30_DAYS"` to pull performance metrics: impressions, clicks, cost, conversions.

### Meta Ads

Use `meta_ads_list_campaigns` with `status: "ACTIVE"` to get active campaigns. For each campaign, note the campaign ID, name, objective, and budget.

Then use `meta_ads_get_insights` for each campaign with `dateRange: "last_30d"` to get: impressions, clicks, spend, conversions, cost_per_action.

### TikTok Ads

Use `tiktok_ads_list_campaigns` to get campaigns. Filter to enabled campaigns from the response.

Then use `tiktok_ads_get_report` with `level: "campaign"`, `startDate` set to 30 days ago (YYYY-MM-DD), and `endDate` set to today (YYYY-MM-DD) to pull: spend, impressions, clicks, conversions, cost per conversion.

### LinkedIn Ads

Use `linkedin_ads_list_campaigns` to get campaigns. Filter to ACTIVE campaigns.

Then use `linkedin_ads_get_analytics` with `pivotBy: "CAMPAIGN"`, `startDate` set to 30 days ago, and `endDate` set to today to pull: impressions, clicks, cost, conversions, leads.

### Normalization

Build a unified table of all campaigns across platforms. For each campaign, compute:

- **Platform**: google_ads | meta_ads | tiktok_ads | linkedin_ads
- **Campaign ID**: platform-specific ID
- **Campaign Name**: human-readable name
- **Daily Budget**: current daily budget in the account currency
- **30d Spend**: total spend over the last 30 days
- **30d Conversions**: total conversions (purchases, leads, or primary action depending on platform/objective)
- **CPA**: 30d Spend / 30d Conversions (set to Infinity if 0 conversions)
- **ROAS**: 30d Revenue / 30d Spend (if revenue data is available; otherwise use inverse CPA as proxy: Conversions / Spend)
- **Learning Phase**: flag as true if the campaign has fewer than 50 conversions in 30 days or was created within the last 7 days

Print the full table sorted by platform, then campaign name.

---

## Step 3: Efficiency Ranking

Rank all campaigns by efficiency. Use ROAS as the primary metric where revenue data is available; fall back to CPA (lower is better) otherwise.

Split campaigns into three tiers:

| Tier | Criteria | Label |
|------|----------|-------|
| **Top Performers** | ROAS in top 25th percentile OR CPA in bottom 25th percentile | HIGH_EFFICIENCY |
| **Mid Performers** | Middle 50% | NORMAL |
| **Underperformers** | ROAS in bottom 25th percentile OR CPA in top 25th percentile | LOW_EFFICIENCY |

Exclude from ranking:
- Campaigns in **learning phase** (flagged in Step 2)
- Campaigns with daily budget below platform minimum thresholds (see Safety Guardrails below)
- Campaigns with zero spend in the 30d window

Print the ranked table with tier labels. Call out:
- The single best-performing campaign (highest ROAS or lowest CPA)
- The single worst-performing campaign (lowest ROAS or highest CPA)
- Total number of campaigns excluded from reallocation and why

---

## Step 4: Reallocation Plan

Generate a reallocation plan that moves budget from LOW_EFFICIENCY campaigns to HIGH_EFFICIENCY campaigns. NORMAL campaigns are untouched.

### Rules

1. **Budget is conserved**: total daily budget across all campaigns remains the same. Every dollar removed from an underperformer is added to an overperformer.
2. **Max change cap**: no single campaign's budget changes by more than `MAX_CHANGE_PCT` percent (up or down).
3. **Platform minimums**: never reduce a campaign below the platform's minimum daily budget:
   - Google Ads: $1.00/day
   - Meta Ads: $1.00/day
   - TikTok Ads: $20.00/day
   - LinkedIn Ads: $10.00/day
4. **Learning phase protection**: never modify campaigns flagged as learning phase.
5. **Distribution among top performers**: distribute freed budget proportionally to the top performers' existing budget share (larger campaigns absorb more).
6. **Cross-platform allowed**: budget freed from a Google Ads underperformer CAN be allocated to a Meta Ads overperformer, as long as the total budget moved stays balanced.

### Algorithm

```
freed_budget = 0

For each LOW_EFFICIENCY campaign (sorted by CPA descending / ROAS ascending):
    max_reduction = current_budget * (MAX_CHANGE_PCT / 100)
    floor = platform_minimum_budget
    actual_reduction = min(max_reduction, current_budget - floor)
    if actual_reduction <= 0: skip
    new_budget = current_budget - actual_reduction
    freed_budget += actual_reduction
    record change: { campaign, platform, old_budget, new_budget, delta: -actual_reduction }

total_top_budget = sum of current budgets for HIGH_EFFICIENCY campaigns
For each HIGH_EFFICIENCY campaign (sorted by ROAS descending / CPA ascending):
    share = current_budget / total_top_budget
    allocation = freed_budget * share
    max_increase = current_budget * (MAX_CHANGE_PCT / 100)
    actual_increase = min(allocation, max_increase)
    new_budget = current_budget + actual_increase
    record change: { campaign, platform, old_budget, new_budget, delta: +actual_increase }
    freed_budget -= actual_increase

If freed_budget > 0 after distribution:
    Note remaining unallocated amount (hit max-change caps on all top performers)
```

Print the reallocation plan as a table:

```
| Platform     | Campaign             | Current Budget | Proposed Budget | Change     | Change % |
|-------------|----------------------|----------------|-----------------|------------|----------|
| google_ads  | Brand Search         | $150.00        | $180.00         | +$30.00    | +20.0%   |
| meta_ads    | Retargeting          | $200.00        | $240.00         | +$40.00    | +20.0%   |
| google_ads  | Display Prospecting  | $100.00        | $80.00          | -$20.00    | -20.0%   |
| tiktok_ads  | Awareness Video      | $80.00         | $64.00          | -$16.00    | -20.0%   |
```

Print the total budget freed, total budget allocated, and any unallocated remainder.

---

## Step 5: Impact Estimate

Project the expected improvement from the reallocation by modeling what the blended metrics would look like if the efficiency ratios hold:

- **Current blended CPA**: total 30d spend / total 30d conversions
- **Projected blended CPA**: sum of (new_daily_budget * 30 * campaign_conversion_rate) across all campaigns, then total projected spend / total projected conversions
- **Current blended ROAS**: total 30d revenue / total 30d spend (or conversion-based proxy)
- **Projected blended ROAS**: same projection using new budget allocations

Print:
```
Projected Impact (assuming efficiency ratios hold):
  Blended CPA: $X.XX -> $Y.YY (Z% improvement)
  Blended ROAS: X.Xx -> Y.Yy (Z% improvement)
  Estimated additional conversions/month: +N
```

Add a caveat that projections assume stable conversion rates and do not account for diminishing returns at higher spend levels. Recommend re-evaluating after 7-14 days.

---

## Step 6: Execution (if --confirm)

If `CONFIRM_MODE` is false, print:

```
--- DRY RUN COMPLETE ---
No changes were made. Re-run with --confirm to execute the reallocation plan above.
```

And stop here.

If `CONFIRM_MODE` is true, execute each budget change:

### Google Ads campaigns

For each Google Ads change, call `google_ads_update_budget`:
- `customerId`: the customer ID from the campaign data
- `campaignId`: the campaign ID
- `budgetAmount`: the new daily budget in display currency (e.g., 180.00)

### Meta Ads campaigns

For each Meta Ads change, call `meta_ads_update_budget`:
- `campaignId`: the campaign ID
- `dailyBudget`: the new daily budget in display currency

### TikTok Ads campaigns

For each TikTok Ads change, call `tiktok_ads_update_budget`:
- `campaignId`: the campaign ID
- `budget`: the new budget amount in account currency

### LinkedIn Ads campaigns

For each LinkedIn Ads change, call `linkedin_ads_update_budget`:
- `campaignId`: the campaign ID (numeric string)
- `dailyBudget`: the new daily budget in display currency

After each mutation, record the result (success or failure). If a mutation fails, log the error and continue with the remaining changes. Do NOT roll back successful changes on partial failure.

Print a before/after table for each executed change:

```
| # | Platform     | Campaign             | Old Budget | New Budget | Status  |
|---|-------------|----------------------|------------|------------|---------|
| 1 | google_ads  | Brand Search         | $150.00    | $180.00    | SUCCESS |
| 2 | meta_ads    | Retargeting          | $200.00    | $240.00    | SUCCESS |
| 3 | google_ads  | Display Prospecting  | $100.00    | $80.00     | SUCCESS |
| 4 | tiktok_ads  | Awareness Video      | $80.00     | $64.00     | FAILED  |
```

If any mutations failed, print a summary of failures with error messages.

---

## Step 7: Report

Print a final summary report:

```
=== Budget Optimization Report ===

Platforms analyzed: {{ list of platforms with data }}
Total campaigns scanned: {{ N }}
Campaigns eligible for reallocation: {{ N }}
Campaigns excluded (learning phase): {{ N }}
Campaigns excluded (below minimum): {{ N }}
Campaigns excluded (zero spend): {{ N }}

Reallocation summary:
  Campaigns with budget reduced: {{ N }} (total: -$X.XX/day)
  Campaigns with budget increased: {{ N }} (total: +$X.XX/day)
  Unallocated remainder: $X.XX/day

Projected impact:
  Blended CPA: $X.XX -> $Y.YY (Z% improvement)
  Blended ROAS: X.Xx -> Y.Yy (Z% improvement)

Status: {{ "EXECUTED" if CONFIRM_MODE else "PROPOSED (dry run)" }}
{{ If executed: "N/N mutations succeeded." }}

Recommendation: Re-evaluate in 7-14 days. Monitor campaigns that received
budget increases for signs of diminishing returns (rising CPA, falling ROAS).
Campaigns that had budget reduced should be reviewed for potential pausing
if performance does not recover.
```

---

## Pacing Analysis

Before any reallocation, assess whether campaigns are on pace for their monthly budget targets.

**Pacing Formula**
```
daily_pace      = spend_to_date / days_elapsed
projected_spend = daily_pace * days_in_period
pacing_ratio    = projected_spend / period_budget
```

**Pacing Classification Table**

| Pacing Ratio | Classification | Action |
|-------------|----------------|--------|
| 0.95 - 1.05 | ON PACE | No action |
| 1.05 - 1.15 | SLIGHT OVERPACE | Monitor |
| 1.15 - 1.30 | OVERPACING | Recommend reduction |
| > 1.30 | SEVERE OVERPACE | Urgent: pause or major cut |
| 0.85 - 0.95 | SLIGHT UNDERPACE | Monitor, check delivery |
| 0.70 - 0.85 | UNDERPACING | Recommend increase or reallocation |
| < 0.70 | SEVERE UNDERPACE | Investigate delivery, targeting, and bids |

Flag all campaigns outside the 0.85-1.15 band. Sort by severity (most extreme pacing ratio first). Never reallocate based on fewer than 3 days of data.

## Cross-Platform Arbitrage

When multiple platforms run simultaneously, shift spend toward the most efficient platforms before adjusting individual campaigns.

**Algorithm**
1. Rank platforms by CPA for the same conversion type (lowest CPA = most efficient)
2. Compute marginal CPA per platform: `Marginal CPA = (Spend_p2 - Spend_p1) / (Conversions_p2 - Conversions_p1)` — if marginal CPA > 2x average CPA, the platform is past its efficient scale point
3. Shift spend from high-CPA platforms to low-CPA platforms until CPAs equalize (diminishing returns will cause them to converge)
4. Discount view-through conversions when comparing platforms: LinkedIn and Meta view-through attribution inflates reported conversions — apply a discount (LinkedIn ~40%, Meta ~30%) before comparing CPA across Google vs. social platforms

Present cross-platform arbitrage table:

| Platform | Spend | Conversions | CPA | Marginal CPA | Recommendation |
|----------|-------|-------------|-----|--------------|----------------|

## Safety Guardrails

These rules are HARD constraints. Violating any of them is a skill failure.

1. **Platform minimum budgets** — Never set a campaign's daily budget below:
   - Google Ads: $1.00
   - Meta Ads: $1.00
   - TikTok Ads: $20.00
   - LinkedIn Ads: $10.00

2. **Max change per campaign** — Never increase or decrease any single campaign's budget by more than `MAX_CHANGE_PCT` percent in a single run. Default is 20%.

3. **Learning phase immunity** — Never modify the budget of a campaign that is in learning phase. A campaign is considered in learning phase if:
   - It has fewer than 50 conversions in the analysis window (30 days), OR
   - It was created within the last 7 days (check campaign creation/start date if available)

4. **Zero-conversion campaigns** — Campaigns with zero conversions and non-trivial spend (>$50 in 30 days) should be flagged as "review recommended" but NOT have budget automatically reduced. The user should make a manual decision on these.

5. **Budget conservation** — Total daily budget across all campaigns must remain the same before and after reallocation. The skill must never create or destroy budget, only redistribute it.

6. **No status changes** — This skill only modifies budgets. It never pauses, enables, or archives campaigns. Use separate tools for status changes.

7. **Confirmation required for writes** — Budget mutations are only executed when `--confirm` is explicitly passed. The default mode is analysis-only.

8. **Partial failure resilience** — If some mutations succeed and others fail, do NOT attempt to roll back. Report what succeeded and what failed. The user can manually fix partial states.
