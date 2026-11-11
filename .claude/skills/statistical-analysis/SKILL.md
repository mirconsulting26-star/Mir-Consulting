---
name: statistical-analysis
description: "Choose and apply defensible statistical methods to business, product, operational, or research data. Use for comparisons, experiments, relationships, forecasts, confidence intervals, effect sizes, power checks, uncertainty estimates, and requests that ask whether a difference is meaningful rather than merely visible."
---

# Statistical Analysis

## Frame the claim

Define the outcome, comparison, population, sampling process, time window, and estimand. State whether the task is descriptive, predictive, or causal. Do not upgrade observational evidence into a causal conclusion.

## Validate the design

Before choosing a method, inspect sample size, independence, missingness, outliers, censoring, repeated measures, selection bias, and distribution shape. For experiments, verify assignment, exposure, sample-ratio balance, stopping rules, and the predeclared primary metric when available.

## Choose the method

Use the simplest method that matches the design and data:

- Report descriptive summaries and robust quantiles for distributions.
- Use confidence intervals and effect sizes for comparisons, not p-values alone.
- Use paired or repeated-measure methods when observations are linked.
- Use nonparametric or resampling methods when parametric assumptions are not credible.
- Correct or constrain multiple comparisons when testing many hypotheses.
- Validate predictive models out of sample and distinguish prediction error from parameter uncertainty.
- For forecasts, use temporal validation, compare against a naive baseline, prevent future-data leakage, and report the horizon, seasonality, and backtest error.
- For experiment planning, define the primary metric, baseline rate or variance, minimum detectable effect, significance level, target power, and expected attrition before calculating sample size.

If assumptions cannot be checked, present sensitivity bounds or label the result exploratory.

## Report honestly

Include the estimate, unit, sample size, interval or uncertainty measure, method, assumptions, and practical interpretation. Report null and inconclusive results plainly. Distinguish statistical significance from business importance, and identify plausible confounders or validity threats.
