---
name: workflow-automate
description: "Automate development workflows: CI/CD pipelines, git hooks, scripts, and task automation."
source: community
allowed-tools: "*"
user-invocable: true
---

# Workflow Automation

Design and implement automated development workflows: CI/CD pipelines, git hooks, build scripts, and task automation.

## STEP 1: IDENTIFY MANUAL WORKFLOWS

Parse $ARGUMENTS for workflows to automate. Common candidates:

- Build, test, and deploy pipelines
- Code quality checks (linting, formatting, type checking)
- Release processes (versioning, changelog, tagging)
- Database migrations
- Environment setup and provisioning
- Dependency updates and auditing
- Documentation generation
- Notification and reporting

## STEP 2: DESIGN THE AUTOMATION

For each workflow:

- **Trigger**: What starts it (push, PR, schedule, manual, webhook)
- **Steps**: Sequential and parallel steps
- **Inputs**: What configuration or parameters are needed
- **Outputs**: What artifacts or results are produced
- **Error handling**: What happens when a step fails
- **Notifications**: Who gets notified on success/failure

## STEP 3: IMPLEMENT

Create the automation using the project's preferred tools:

### CI/CD (GitHub Actions, GitLab CI, etc.)
- Workflow files with proper triggers and conditions
- Caching for faster builds
- Secret management
- Matrix builds for multi-platform/version testing
- Conditional steps based on changed files

### Git Hooks (Husky, pre-commit)
- Pre-commit: linting, formatting, type checking
- Commit-msg: conventional commit validation
- Pre-push: test suite, build verification

### Scripts
- npm/make/bash scripts for common tasks
- Idempotent and cross-platform where possible
- Clear error messages and exit codes

## STEP 4: DOCUMENT

For each automation:
- What it does and when it runs
- How to modify or extend it
- How to run it manually
- Known limitations

## STEP 5: VERIFY

Test the automation:
- Trigger each workflow and verify it runs correctly
- Test failure scenarios
- Verify notifications work
- Check that caching improves subsequent runs
