---
name: shipping-and-launch
description: "Pre-launch checklists, feature flag lifecycle, staged rollouts, rollback procedures, and monitoring setup."
user-invocable: true
disable-model-invocation: false
source: pandaos
allowed-tools: Read, Write, Glob, Grep, Bash
---

# Shipping & Launch

Structured process for shipping features safely. Covers pre-launch validation, staged rollouts, and rollback readiness.
## STEP 0: CONFIG

> Project paths and settings are available in your context from `.pandaos/config.yaml`. Use those values. If not present, use the defaults noted in each step.

## STEP 1: PRE-LAUNCH ASSESSMENT

From $ARGUMENTS, identify what is being shipped. Classify the launch:

| Launch Type | Signal | Risk Level |
|-------------|--------|-----------|
| **Patch** | Bug fix, minor tweak, copy change | Low |
| **Feature** | New capability, new UI surface | Medium |
| **Infrastructure** | Schema change, architecture change, dependency upgrade | High |
| **Breaking** | API change, data migration, removal of functionality | Critical |

## STEP 2: PRE-LAUNCH CHECKLIST

Generate a checklist appropriate to the risk level. All items must be verified:

### All launches (Patch+):
- [ ] All tests pass (`npm run test`, `npm run test:renderer`)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] No console warnings or errors in dev mode
- [ ] Changes committed with clear commit messages
- [ ] No hardcoded development values (localhost URLs, test tokens, debug flags)

### Feature launches (Medium+):
- [ ] Feature works end-to-end in dev mode (manually verified)
- [ ] Edge cases tested (empty state, error state, maximum data)
- [ ] Cross-platform impact assessed (Electron + web app if applicable)
- [ ] Feature flag in place if gradual rollout needed
- [ ] No performance regressions (bundle size, render time, memory)
- [ ] Accessibility basics checked (keyboard navigation, screen reader labels)

### Infrastructure launches (High+):
- [ ] Database migration tested on a copy of production data
- [ ] Backward compatibility maintained (old clients can still function)
- [ ] Rollback procedure documented and tested
- [ ] Monitoring alerts configured for key metrics
- [ ] Load/stress testing completed if applicable
- [ ] Data backup verified before deployment

### Breaking launches (Critical):
- [ ] All consumers notified and given migration timeline
- [ ] Migration guide written and tested
- [ ] Old and new versions can coexist during transition
- [ ] Rollback does not cause data loss
- [ ] Communication plan drafted (changelog, release notes, in-app notification)

## STEP 3: FEATURE FLAG LIFECYCLE

For features that need gradual rollout:

### Feature flag stages:
```
1. DEVELOPMENT: Flag exists, always OFF in production
   - Feature is being built behind the flag
   - Only enabled in dev mode or for internal testers

2. CANARY: Flag ON for small percentage / internal users
   - Monitor error rates, performance, user feedback
   - Minimum canary period: 24 hours for low-risk, 72 hours for high-risk

3. ROLLOUT: Flag ON for increasing percentages
   - 10% → 25% → 50% → 100%
   - Monitor at each stage before increasing
   - Rollback trigger: error rate >2x baseline OR performance >50% degraded

4. GENERAL AVAILABILITY: Flag removed, feature is default
   - Remove the flag AND the old code path
   - Do not leave flags in "always on" state indefinitely

5. CLEANUP: Dead code from old path removed
   - Remove conditional checks, old components, unused types
   - This step is mandatory - stale flags are tech debt
```

### Anti-rationalization check:

| Shortcut | Why it fails |
|----------|-------------|
| "Ship it, we'll fix issues as they come" | Users hit bugs you could have caught. Trust erodes faster than it builds |
| "The feature flag can stay forever" | Permanent flags become unmaintainable branching. Remove within 2 weeks of GA |
| "We tested in dev, that's enough" | Dev environment hides production-only issues (auth, data volume, network) |
| "Rollback is just reverting the commit" | Rollback may need data migration reversal, cache invalidation, client updates |
| "It's a small change, no checklist needed" | Small changes cause big outages. The checklist takes 5 minutes |
| "We'll add monitoring later" | If you can't monitor it, you can't know if it's broken |

## STEP 4: DATABASE ASSESSMENT

If the launch involves database changes:

### Migration safety checklist:
- [ ] Migration is reversible (has a down migration)
- [ ] Migration does not lock tables for extended periods
- [ ] New columns have defaults (no NOT NULL without DEFAULT on existing tables)
- [ ] Indexes added for new query patterns
- [ ] RLS policies updated for new tables/columns
- [ ] Migration tested against production data volume

### Data integrity checks:
- [ ] Existing data is not silently corrupted by the migration
- [ ] Foreign key relationships are preserved
- [ ] No orphaned records after migration
- [ ] Enum changes are backward compatible

## STEP 5: ROLLBACK PROCEDURE

Document the rollback procedure BEFORE shipping:

```markdown
# Rollback: [Feature Name]

## Trigger conditions
- [Specific condition that warrants rollback]

## Steps
1. [Exact command or action]
2. [Next step]
3. [Verification step]

## Data considerations
- [Does rollback affect user data?]
- [Are there database changes to reverse?]
- [Is there cached/persisted state to clear?]

## Time estimate
- Rollback execution: [X minutes]
- Full recovery: [Y minutes]

## Post-rollback
- [ ] Verify system is stable
- [ ] Notify affected users if applicable
- [ ] Create post-mortem issue
```

Write the rollback procedure to `{rollback_playbooks_path}/rollback-{feature-name}.md`.

## STEP 6: MONITORING SETUP

Define what to monitor post-launch:

### Key metrics:
- **Error rate**: Baseline vs. post-launch (alert if >2x)
- **Performance**: Response time / render time (alert if >50% slower)
- **Usage**: Is the feature being used as expected?
- **Rollback triggers**: Specific thresholds that auto-trigger rollback consideration

### For Electron apps:
- Crash reports (if crash reporting is enabled)
- Auto-update success rate
- Memory usage trends

### For web apps:
- HTTP error rates (4xx, 5xx)
- Core Web Vitals changes
- API response times

## STEP 7: RELEASE NOTES

Draft release notes following the project's format and write them to `RELEASE_NOTES.md` in the repo root:

```markdown
## New
- **[Feature Name]**: [One sentence describing what it does for the user]

## Improved
- [Enhancement description]

## Fixed
- Fixed issue where [problem] when [condition]
```

Rules:
- User-facing language only - no "refactored X" or "upgraded dependency Y"
- Each item is one sentence
- Bug fixes describe the symptom that was fixed, not the code change
- The file MUST be written before tagging — the CI workflow reads it as a fallback to populate the GitHub release body before the n8n webhook fires

## STEP 8: VERSION TAGGING

When creating a release tag, first ask:

> **Is this a beta release or a stable release?**
>
> - **Stable** — shipped to all users via auto-update (tag: `vX.Y.Z`)
> - **Beta** — only visible to internal users who opted in to the beta channel (tag: `vX.Y.Z-beta`)

### Version numbering (semver)

```
MAJOR.MINOR.PATCH[-beta]

PATCH  (0.2.6 → 0.2.7)    Bug fixes, small tweaks
MINOR  (0.2.7 → 0.3.0)    New features, non-breaking changes
MAJOR  (0.3.0 → 1.0.0)    Breaking changes, major milestones
```

### Beta releases

- Beta tags follow **standard semver**: the version is the **next stable target**, not the last shipped stable. Example: after `v0.3.3` stable, the next beta is `v0.3.4-beta.1` (or `v0.4.0-beta.1` for a minor bump). It must NOT be `v0.3.3-beta.1` — that would sort *before* the already-shipped `v0.3.3` stable.
- Picking the X.Y.Z when the next stable target is unclear:
  - Default to a **PATCH** beta (`v0.3.4-beta.1`) if the change set looks like fixes + minor tweaks.
  - Use a **MINOR** beta (`v0.4.0-beta.1`) if there are new features or refactors that wouldn't fit a patch.
  - Use a **MAJOR** beta only when actually committing to a major milestone.
  - If you later decide the scope grew, ship a new beta channel at the bigger version (`v0.4.0-beta.1` after a few `v0.3.4-beta.N`) — the smaller channel is simply abandoned.
- Append `-beta.N` starting at `.1` and increment per beta: `v0.3.4-beta.1`, `v0.3.4-beta.2`, …
- **The separator before the counter is a dot, never a hyphen.** Semver compares dot-separated pre-release identifiers numerically, but `-beta-10` is a single alphanumeric identifier compared lexically — so it sorts *below* `-beta-9` and the 10th build of a cycle is invisible to everyone on the 9th.
- The CI workflow (`.github/workflows/release.yml`) automatically:
  - Marks the GitHub release as **prerelease**
  - Skips overwriting stable download aliases (PandaOS-arm64.dmg etc.)
- The update proxy excludes `-beta` releases from the default channel
- Only internal users with **Beta Channel** enabled in Settings > About see beta updates
- Beta updates are **never auto-downloaded** — the user must manually click "Update Now"
- A beta is promoted to stable by releasing the same X.Y.Z without `-beta.N` (e.g. `v0.3.4-beta.3` → `v0.3.4` stable)

### Tagging process

Check the project's own release conventions first (its rules, knowledge files, or
`docs/`) — which branch each release stream is cut from varies per project, and a
release branch is often protected against direct pushes.

1. Bump version in `package.json`: `npm version <version> --no-git-tag-version`
   (`--no-git-tag-version` is deliberate — plain `npm version patch` auto-commits
   and auto-tags, and cannot express a pre-release counter)
2. Commit: `git add package.json package-lock.json RELEASE_NOTES.md && git commit -m "chore: bump version to <version>"`
3. Push that commit to the branch this stream releases from
4. Tag: `git tag v<version>`
5. Push the tag: `git push origin v<version>`

Always confirm with the user before pushing. For beta releases, remind them:
> This will create tag `v<version>` and trigger a beta build. Only users with Beta Channel enabled will see it.

## STEP 9: LAUNCH CHECKLIST OUTPUT

Write the complete launch checklist to `{launch_checklists_path}/launch-{feature-name}-{date}.md`.

Present a summary with:
- Launch type and risk level
- Number of checklist items (passed / remaining)
- Rollback procedure location
- Any blocking items that must be resolved before shipping

## BEHAVIORAL RULES

1. Never ship without a rollback plan
2. Never skip the checklist, even for "small" changes
3. Feature flags must be temporary - set a cleanup date when creating them
4. Monitor before, during, and after launch
5. Release notes are mandatory for every user-facing change
6. If any checklist item fails, do not ship until resolved
7. Always ask beta vs stable before tagging — never assume
8. Never push tags without explicit user confirmation
