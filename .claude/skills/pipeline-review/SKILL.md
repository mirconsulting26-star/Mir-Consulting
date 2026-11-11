---
name: pipeline-review
description: "Pipeline health report: weighted value by stage, stale deals (no activity 14+ days), past-due close dates, top risks."
disable-model-invocation: true
user-invocable: true
allowed-tools: hubspot_*
model: sonnet
source: pandaos
---

# HubSpot Pipeline Review

Generate a comprehensive pipeline health report from HubSpot CRM deal data. The report covers weighted pipeline value by stage, stale deals, past-due close dates, at-risk opportunities, and top deals.

## Definitions

- **Stale deal**: A deal with no recorded activity (note, email, call, meeting, or property change) in the last 14 calendar days.
- **Past-due deal**: A deal whose `closedate` property is before today's date and the deal is still in an open stage (not "closedwon" or "closedlost").
- **At-risk deal**: Any deal that is stale OR past-due OR has an amount >= $50,000 with no associated contact activity in the last 14 days.
- **Weighted value**: `deal amount * stage probability`. Use the default HubSpot stage probabilities below unless the pipeline uses custom values.

### Default Stage Probabilities

| Stage ID                    | Label                  | Probability |
|-----------------------------|------------------------|-------------|
| appointmentscheduled        | Appointment Scheduled  | 0.20        |
| qualifiedtobuy              | Qualified to Buy       | 0.40        |
| presentationscheduled       | Presentation Scheduled | 0.60        |
| decisionmakerboughtin       | Decision Maker Bought-In | 0.80      |
| contractsent                | Contract Sent          | 0.90        |
| closedwon                   | Closed Won             | 1.00        |
| closedlost                  | Closed Lost            | 0.00        |

If a deal's `dealstage` does not match any of these IDs, use a fallback probability of 0.50.

## Instructions

Execute the following steps in order. After each step, record the intermediate data so it can be referenced in later steps. Do NOT skip steps or combine them — each one produces distinct output that feeds the final report.

### Step 1 — Pipeline Snapshot

Fetch all open deals from HubSpot. Use `hubspot_list_deals` with pagination (follow the `after` cursor) until all deals are retrieved. Filter out deals in stages `closedwon` and `closedlost` — only open/active deals are in scope.

For each deal, record:
- `id` (deal ID)
- `dealname`
- `amount` (parse to number; treat missing/empty as 0)
- `dealstage`
- `pipeline`
- `closedate` (ISO string)
- `hubspot_owner_id`
- `notes_last_updated` or `hs_lastmodifieddate` (whichever is available, for staleness check)

Group the deals by `dealstage`. Count the number of deals and sum the raw amount per stage.

Format as a table:

```
Stage               | # Deals | Total Amount
--------------------|---------|-------------
Appointment Sched.  |      12 |    $340,000
Qualified to Buy    |       8 |    $520,000
...
```

### Step 2 — Weighted Pipeline Value

For each stage group from Step 1, calculate:
- `weighted_value = sum_of_amounts * stage_probability`

Then calculate the **total weighted pipeline value** across all stages.

Format as a table:

```
Stage               | Raw Amount  | Probability | Weighted Value
--------------------|-------------|-------------|---------------
Appointment Sched.  |    $340,000 |        0.20 |       $68,000
Qualified to Buy    |    $520,000 |        0.40 |      $208,000
...
--------------------|-------------|-------------|---------------
TOTAL               |  $1,860,000 |             |      $876,000
```

### Step 3 — Stale Deals

From the deals collected in Step 1, identify stale deals: any deal whose most recent activity timestamp (`notes_last_updated` or `hs_lastmodifieddate`) is more than 14 days before today.

For borderline cases, fetch the individual deal with `hubspot_get_deal` to check `hs_last_activity_date` or `notes_last_updated` more precisely.

For each stale deal, record:
- Deal name, ID, amount, stage, owner
- Days since last activity
- Associated company (use `hubspot_get_company` if a company association exists)

Sort by days-since-last-activity descending (most stale first). List up to 25 deals.

Format:

```
Deal Name          | Amount    | Stage            | Days Stale | Owner       | Company
-------------------|-----------|------------------|------------|-------------|--------
Acme Renewal       | $120,000  | Contract Sent    |         42 | Jane Smith  | Acme Corp
...
```

### Step 4 — Past-Due Deals

From the deals in Step 1, identify deals whose `closedate` is strictly before today and whose stage is not `closedwon` or `closedlost`.

For each past-due deal, record:
- Deal name, ID, amount, stage, owner
- Close date and how many days overdue
- Associated company

Sort by days-overdue descending. List up to 25 deals.

Format:

```
Deal Name          | Amount    | Stage            | Close Date  | Days Overdue | Owner
-------------------|-----------|------------------|-------------|--------------|------
Beta Expansion     | $85,000   | Qualified to Buy | 2026-01-15  |           32 | ...
...
```

### Step 5 — At-Risk Deals

Combine the results from Steps 3 and 4 to build the at-risk list. A deal is at-risk if ANY of the following are true:
1. It appears in the stale deals list (Step 3).
2. It appears in the past-due deals list (Step 4).
3. It has `amount >= 50000` AND no associated contact with recent activity.

For condition 3, use `hubspot_list_contacts` or `hubspot_get_contact` to check whether the deal's associated contacts have recent engagement. If the deal has no associated contact at all, it qualifies as at-risk.

Deduplicate deals that appear in multiple categories. For each at-risk deal, note which risk flags apply (stale, past-due, large-no-contact).

Sort by amount descending (highest-value risk first). List all at-risk deals.

Format:

```
Deal Name          | Amount    | Stage            | Risk Flags                  | Owner
-------------------|-----------|------------------|-----------------------------|------
Mega Enterprise    | $250,000  | Presentation     | stale, past-due             | ...
Acme Renewal       | $120,000  | Contract Sent    | stale                       | ...
NewCo Pilot        | $75,000   | Qualified to Buy | large-no-contact, past-due  | ...
...
```

### Step 6 — Top 10 Deals

From all open deals in Step 1, select the top 10 by `amount` (descending). For each deal, provide a brief status summary indicating:
- Current stage
- Days until close (or days overdue if past-due)
- Whether it carries any risk flags from Step 5
- Associated company name

Format:

```
# | Deal Name          | Amount    | Stage              | Close In     | Risk        | Company
--|--------------------|-----------|--------------------|--------------|-------------|--------
1 | Mega Enterprise    | $250,000  | Presentation Sched | 12 days OVER | stale       | MegaCo
2 | GlobalTech Upsell  | $200,000  | Decision Maker     | 18 days left | --          | GlobalTech
...
```

### Step 7 — Final Report

Compile the full pipeline review report with the following sections. Use markdown formatting throughout.

```
# Pipeline Review — {today's date}

## Executive Summary
- Total open deals: {count}
- Total pipeline value (raw): ${total}
- Total pipeline value (weighted): ${weighted_total}
- Stale deals (14+ days inactive): {count} totaling ${sum}
- Past-due deals: {count} totaling ${sum}
- At-risk deals: {count} totaling ${sum}

## Pipeline by Stage
{Table from Step 2 — include both raw and weighted columns}

## Top 10 Deals
{Table from Step 6}

## At-Risk Deals
{Table from Step 5}

### Stale Deals Detail
{Table from Step 3, if any deals not already shown in at-risk}

### Past-Due Deals Detail
{Table from Step 4, if any deals not already shown in at-risk}

## Recommended Actions
Generate 3-7 specific, actionable recommendations based on the data. Examples:
- "Follow up on {deal name} ($X) — no activity in {N} days, close date was {date}."
- "Review {stage} stage — {N} deals totaling $X are stale. Consider pipeline cleanup."
- "Escalate {deal name} — $X deal with no associated contact. Assign an owner or contact."
- "Update close dates for {N} past-due deals to reflect realistic timelines."

Each recommendation should reference specific deals or stages by name and include dollar amounts.
```

After producing the report, call `hubspot_navigate` with `view: "deals"` to open the deals view in the workspace so the user can immediately act on the findings.

## Error Handling

- If `hubspot_list_deals` returns an authentication error or empty result, stop and report: "Unable to fetch deals from HubSpot. Please check that the HubSpot integration is connected and has CRM read permissions."
- If pagination fails mid-way, report how many deals were successfully fetched and produce a partial report with a warning.
- If a deal has no `amount` property, treat it as $0 for calculations but flag it in the report as "amount missing."
- If `closedate` is missing, exclude the deal from past-due analysis but include it in other sections.
