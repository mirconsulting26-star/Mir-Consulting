---
name: exploratory-data-analysis
description: "Explore tabular, event, warehouse, spreadsheet, or operational data to answer open-ended questions. Use for profiling datasets, defining analysis grain, finding trends and segments, reconciling conflicting numbers, testing data quality, and separating supported findings from hypotheses."
---

# Exploratory Data Analysis

## Establish the question

1. Restate the decision or question the analysis must support.
2. Identify the unit of analysis, population, time window, dimensions, and measures.
3. Write metric formulas and inclusion rules before querying.
4. Inventory available sources. Never assume a named vendor or unavailable dataset.

## Profile before interpreting

Check schema, row counts, date coverage, freshness, nulls, duplicates, units, category cardinality, and join keys. Reconcile totals against a trusted source when one exists. Record every filter, join, transformation, and exclusion that can change the answer.

Stop when a quality defect is material enough to invalidate the question or answer. Otherwise document exclusions, imputation, or sensitivity analysis and explain how each choice affects interpretation. Do not silently repair observations or invent substitutes.

## Analyze reproducibly

- Start with counts, distributions, rates, and time trends.
- Segment only where the sample and business question justify it.
- Compare like with like. Normalize units, time zones, currencies, and denominators.
- Test alternate definitions when a metric is ambiguous.
- Preserve the query, formula, or transformation needed to reproduce each material result.
- Treat correlation, temporal order, and causation as different claims.

## Deliver findings

Return:

1. Direct answer to the question.
2. Evidence with relevant values and comparisons.
3. Metric definitions and analysis grain.
4. Data sources and reproducible query or transformation provenance.
5. Assumptions, quality issues, uncertainty, and limitations.
6. Recommended next step, clearly separated from observed facts.
