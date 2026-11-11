---
name: audit-tracking
description: "Audit conversion tracking health: GA4 events firing, platform-vs-GA4 conversion discrepancies, UTM consistency check across all ad URLs."
disable-model-invocation: true
user-invocable: true
allowed-tools: ga4_*, google_ads_*, meta_ads_*, tiktok_ads_*, linkedin_ads_*
argument-hint: [7d|14d|30d]
source: pandaos
model: sonnet
---

# Conversion Tracking Audit

Audit the health of conversion tracking across GA4 and all connected ad platforms. Identify discrepancies between platform-reported and GA4-reported conversions, check UTM consistency, and verify events are currently firing.

---

## Step 1: Parse Arguments

Parse the user-provided period argument. Accepted values: `7d`, `14d`, `30d`. Default to `7d` if no argument is provided or the argument is not recognized.

Compute the date range:
- For `7d`: startDate = `7daysAgo`, endDate = `today` (GA4 relative format), and compute YYYY-MM-DD equivalents for ad platform APIs.
- For `14d`: startDate = `14daysAgo`, endDate = `today`.
- For `30d`: startDate = `30daysAgo`, endDate = `today`.

For Google Ads GAQL date ranges, map to: `LAST_7_DAYS`, `LAST_14_DAYS`, `LAST_30_DAYS`.
For Meta Ads date presets, map to: `last_7d`, `last_14d`, `last_30d`.
For TikTok and LinkedIn, use the computed YYYY-MM-DD start and end dates.

Store the period label for the report header.

---

## Step 2: GA4 Conversion Events

Pull all conversion events from GA4 for the audit period.

**Tool call:** `ga4_conversions`
- `startDate`: the GA4-relative start date (e.g. `7daysAgo`)
- `endDate`: `today`

This returns event names, event counts, and event values for conversion-class events (purchase, sign_up, generate_lead, add_to_cart, begin_checkout, complete_payment, subscribe, etc.).

Store the results as `ga4ConversionData`. Build a lookup map: `{ eventName -> { count, value } }`.

Key events to track for cross-platform comparison:
- `purchase` or `complete_payment` -- the primary conversion event
- `generate_lead` or `sign_up` -- lead generation events
- `add_to_cart`, `begin_checkout` -- funnel events

If the GA4 conversion data is empty or returns an error, flag this immediately as a RED status: "No GA4 conversion events found in the last {period}. Tracking may be completely broken."

**Also run:** `ga4_run_report` to get conversion counts broken down by source/medium:
- `dimensions`: `["sessionSource", "sessionMedium", "eventName"]`
- `metrics`: `["eventCount", "eventValue"]`
- `startDate` / `endDate`: same as above
- `limit`: 200

This gives per-source conversion attribution in GA4, which is critical for the platform comparison.

Store as `ga4SourceConversions`. Build a nested map: `{ source/medium -> { eventName -> count } }`.

---

## Step 3: Platform Conversion Counts

Pull conversion metrics from each connected ad platform for the same period. Only call platforms that are available (tools will error if not connected; catch and note as "not connected").

### Google Ads
**Tool call:** `google_ads_get_report`
- `level`: `campaign`
- `dateRange`: the GAQL date range (e.g. `LAST_7_DAYS`)

Extract total conversions and conversion value across all campaigns. Store as `googleAdsConversions`.

### Meta Ads (Facebook/Instagram)
**Tool call:** `meta_ads_get_insights`
- `objectId`: use the ad account ID (the account-level object)
- `dateRange`: the Meta date preset (e.g. `last_7d`)

Extract `actions` array for conversion events (offsite_conversion.fb_pixel_purchase, lead, etc.), total spend, impressions, and clicks. Store as `metaConversions`.

If account-level ID is not known, fall back to listing campaigns with `meta_ads_list_campaigns`, then call `meta_ads_campaign_insights` for each active campaign and aggregate.

### TikTok Ads
**Tool call:** `tiktok_ads_get_report`
- `level`: `campaign`
- `startDate` / `endDate`: YYYY-MM-DD dates

Extract conversions, spend, and other metrics. Store as `tiktokConversions`.

### LinkedIn Ads
**Tool call:** `linkedin_ads_get_analytics`
- `pivotBy`: `CAMPAIGN`
- `startDate` / `endDate`: YYYY-MM-DD dates

Extract conversions (externalWebsiteConversions, oneClickLeads), spend, impressions, clicks. Store as `linkedinConversions`.

---

## Step 4: Discrepancy Analysis

For each platform, compare platform-reported conversions against GA4-reported conversions from the matching source/medium.

### Source/Medium Mapping

Map GA4 source/medium values to platforms:
- **Google Ads**: source contains `google` AND medium is `cpc` or `paid` or `ppc`
- **Meta Ads**: source contains `facebook` or `instagram` or `fb` or `ig`, medium is `cpc` or `paid` or `paidsocial`
- **TikTok Ads**: source contains `tiktok`, medium is `cpc` or `paid`
- **LinkedIn Ads**: source contains `linkedin`, medium is `cpc` or `paid` or `paidsocial`

### Discrepancy Calculation

For each platform:
```
platform_conversions = total conversions reported by the ad platform
ga4_conversions = sum of conversion events in GA4 attributed to that platform's source/medium
discrepancy_pct = abs(platform_conversions - ga4_conversions) / max(platform_conversions, ga4_conversions, 1) * 100
```

### Thresholds
- **GREEN** (healthy): discrepancy <= 15%
- **YELLOW** (warning): discrepancy 15% - 30%
- **RED** (critical): discrepancy > 30%

### Common Discrepancy Causes

When discrepancies are found, annotate with likely causes:

**Platform reports MORE conversions than GA4:**
- **View-through conversions**: Platform counts users who saw (but didn't click) an ad and later converted. GA4 only tracks click-through by default. Google Ads default window is 1 day view-through; Meta is 1 day view-through. This is the single most common cause of inflation.
- **Cross-device attribution**: Platform SDKs (especially Meta Pixel with Advanced Matching) can track users across devices via logged-in identity graphs. GA4 relies on cookies/device IDs unless Google Signals is enabled and user is logged into Google.
- **Attribution window mismatch**: Google Ads defaults to 30-day click / 1-day view. Meta defaults to 7-day click / 1-day view. GA4 uses last-click by default with a 30-day lookback. Conversions attributed by the platform within its window but outside GA4's model will diverge.
- **Conversion lag**: Platforms often restate conversion numbers for 7-14 days after the event as they reconcile delayed signals (server-side events, offline conversions). GA4 processes events in near-realtime but may also have a 24-48h processing delay.
- **Duplicate events**: Platform may fire both client-side pixel and server-side CAPI/Conversions API, leading to double-counting if deduplication (event_id) is not properly configured. Common with Meta CAPI + Pixel and Google Ads Enhanced Conversions + gtag.
- **Modeled conversions**: Google Ads and Meta both model conversions when they cannot directly observe them (consent mode, iOS ATT opt-outs). These modeled numbers inflate platform totals but have no GA4 counterpart.

**GA4 reports MORE conversions than platform:**
- **Organic/direct misattribution**: GA4 may attribute conversions to organic or direct that the platform would claim via its broader attribution model.
- **UTM stripping**: If UTMs are stripped (by redirects, link shorteners, or app deep links), GA4 loses the source/medium and attributes to direct/organic, undercounting the platform.
- **Multiple conversion events**: GA4 may be counting multiple events per session (e.g., both `generate_lead` and `purchase`) while the platform only tracks one conversion action.
- **Bot/invalid traffic filtering**: Platforms filter invalid clicks from their conversion counts; GA4 may not filter the same traffic, especially for non-Google sources.

---

## Step 5: UTM Consistency Check

Use the GA4 traffic sources data from Step 2 to audit UTM parameter consistency.

**Tool call:** `ga4_traffic_sources`
- `startDate` / `endDate`: same period

Analyze the returned source/medium combinations. Flag the following issues:

### Non-Standard UTM Patterns
- **Missing UTMs from paid traffic**: Any traffic from known ad platform domains (google, facebook, instagram, tiktok, linkedin) with medium `referral` instead of `cpc`/`paid` indicates ads are running without UTM parameters.
- **Inconsistent casing**: source or medium values with mixed case (e.g., `Facebook` vs `facebook`, `CPC` vs `cpc`). GA4 treats these as separate sources.
- **Inconsistent naming**: Multiple variations of the same source (e.g., `fb`, `facebook`, `facebook.com`, `ig`, `instagram`). These fragment attribution.
- **Generic or missing medium**: Medium values like `(none)`, `(not set)`, or `referral` for traffic that should be `cpc` or `paid`.
- **Auto-tagged without UTMs**: Google Ads traffic showing as `google / cpc` via auto-tagging is fine, but if there are also `google / organic` entries with high conversion counts, verify that auto-tagging is enabled and UTMs aren't overriding gclid.

### UTM Best Practices Check
Flag if any of these are detected:
- Source values containing spaces or special characters
- Medium values that don't follow the standard taxonomy (`cpc`, `paid`, `paidsocial`, `email`, `organic`, `referral`, `display`, `video`)
- Campaign names with inconsistent delimiters (mixing `_`, `-`, spaces)

Assign a UTM health status:
- **GREEN**: All paid sources use consistent, standard UTM parameters
- **YELLOW**: Minor inconsistencies (casing, naming variants) but core tracking works
- **RED**: Paid traffic arriving without UTMs or with broken parameters

---

## Step 6: Realtime Firing Check

Verify that conversion tracking is actively firing right now.

**Tool call:** `ga4_realtime_report`
- `dimensions`: `["eventName"]`
- `metrics`: `["eventCount"]`

Check if any conversion-class events appear in the realtime data (last 30 minutes):
- `purchase`, `complete_payment`, `generate_lead`, `sign_up`, `add_to_cart`, `begin_checkout`, `submit_form`, `subscribe`

Also check for the presence of core pageview/session events (`page_view`, `session_start`, `first_visit`) to confirm GA4 is receiving data at all.

Assign a realtime status:
- **GREEN**: Core events AND conversion events are firing in realtime
- **YELLOW**: Core events are firing but no conversion events in the last 30 minutes (could be normal for low-traffic sites)
- **RED**: No events at all in realtime -- GA4 tag may be broken or the site has zero traffic

---

## Step 7: Report

Generate a structured tracking health report with the following format:

```
========================================
  CONVERSION TRACKING AUDIT
  Period: Last {period} | Generated: {today's date}
========================================

--- REALTIME STATUS ---
{GREEN/YELLOW/RED} GA4 Event Firing
  Core events (page_view, session_start): {firing/not firing}
  Conversion events: {list of events seen in realtime, or "none in last 30 min"}

--- GA4 CONVERSION SUMMARY ---
Total conversion events: {count}
Top events:
  1. {event_name}: {count} events, ${value} value
  2. {event_name}: {count} events, ${value} value
  ...

--- PLATFORM vs GA4 DISCREPANCY ---

Google Ads: {GREEN/YELLOW/RED}
  Platform-reported conversions: {count}
  GA4-attributed conversions:   {count}
  Discrepancy: {pct}%  ({direction}: platform reports {more/fewer})
  {If YELLOW/RED: Likely causes: {list relevant causes from Step 4}}

Meta Ads: {GREEN/YELLOW/RED}
  Platform-reported conversions: {count}
  GA4-attributed conversions:   {count}
  Discrepancy: {pct}%  ({direction}: platform reports {more/fewer})
  {If YELLOW/RED: Likely causes: {list relevant causes from Step 4}}

TikTok Ads: {GREEN/YELLOW/RED}
  Platform-reported conversions: {count}
  GA4-attributed conversions:   {count}
  Discrepancy: {pct}%  ({direction}: platform reports {more/fewer})
  {If YELLOW/RED: Likely causes: {list relevant causes from Step 4}}

LinkedIn Ads: {GREEN/YELLOW/RED}
  Platform-reported conversions: {count}
  GA4-attributed conversions:   {count}
  Discrepancy: {pct}%  ({direction}: platform reports {more/fewer})
  {If YELLOW/RED: Likely causes: {list relevant causes from Step 4}}

{Skip any platform that is not connected}

--- UTM CONSISTENCY ---
{GREEN/YELLOW/RED} UTM Health

Issues found:
  - {issue description}
  - {issue description}
  ...

{If GREEN: "All paid traffic sources use consistent, standard UTM parameters."}

--- RECOMMENDATIONS ---
{Numbered list of specific, actionable recommendations based on findings. Examples:}
1. [If Meta discrepancy > 30%] Check Meta CAPI deduplication. Ensure event_id is passed in both Pixel and CAPI events to prevent double-counting.
2. [If UTM issues] Standardize UTM source values: use "facebook" (not "fb"), "instagram" (not "ig"). Use lowercase consistently.
3. [If no realtime conversions] Verify the GA4 conversion tag fires on the thank-you/confirmation page. Check GTM preview mode.
4. [If Google Ads discrepancy] Verify auto-tagging is enabled in Google Ads settings. Check that UTM parameters are not overriding gclid.
5. [If view-through inflation] Consider aligning attribution windows: set Meta to 7-day click only (disable view-through) for cleaner GA4 comparison.
6. [If cross-device gap] Enable Google Signals in GA4 and consider implementing User-ID for better cross-device matching.
7. [If conversion lag suspected] Re-run this audit in 7 days and compare to confirm numbers have stabilized.

========================================
  OVERALL TRACKING HEALTH: {GREEN/YELLOW/RED}
  {One-sentence summary}
========================================
```

### Overall Health Determination
- **GREEN**: All platforms within 15% discrepancy, UTMs consistent, realtime events firing
- **YELLOW**: Any platform 15-30% discrepancy OR minor UTM issues OR no realtime conversion events (but core events fire)
- **RED**: Any platform >30% discrepancy OR paid traffic without UTMs OR no GA4 events firing at all

The report should be concise but complete. Do not omit platforms or sections. For platforms that are not connected, note them as "Not connected -- skipped" rather than omitting them entirely.
