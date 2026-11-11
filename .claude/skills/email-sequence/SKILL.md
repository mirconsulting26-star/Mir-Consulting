---
name: email-sequence
description: "Create a complete email sequence: onboarding, nurture, or sales drip. Each email has a purpose, a hook, and a clear CTA."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: corey-haines
---

# Email Sequence Creator

Creates a complete, cohesive email sequence with clear goals, timing, and progression from awareness to action.

## STEP 1: DEFINE THE SEQUENCE

Parse $ARGUMENTS for:
- Sequence type: onboarding, nurture, sales drip, re-engagement, post-purchase
- Audience: who enters this sequence, at what trigger
- Goal: what action should the recipient take by the end?
- Number of emails (default: 5-7)
- Sending cadence (default: Day 0, 2, 4, 7, 10, 14)

## STEP 2: MAP THE SEQUENCE ARC

Design the emotional and informational journey:

```
Email 1 (Day 0): Welcome / Hook — establish why they should pay attention
Email 2 (Day 2): Problem awareness — articulate the pain you solve
Email 3 (Day 4): Solution intro — introduce your approach, not a pitch
Email 4 (Day 7): Social proof — specific customer story or result
Email 5 (Day 10): Objection handling — address the top reason people don't act
Email 6 (Day 14): CTA — direct, time-sensitive ask
Email 7 (Day 17): Breakup / last chance (if no action taken)
```

Adjust the arc for the sequence type.

### Multi-Channel Outbound Sequence (for sales prospecting sequences)

When the sequence type is outbound sales (not onboarding or nurture), use the 10-touch multi-channel architecture:

```
Day 1:  Email — signal-based opening + specific value prop + soft CTA
Day 3:  LinkedIn — connection request with personalized note (no pitch)
Day 5:  Email — share relevant insight or data point tied to their situation
Day 8:  Phone + voicemail — reference the email thread
Day 10: LinkedIn — engage with their content or share relevant content
Day 14: Email — case study from similar company/situation + clear CTA
Day 17: Loom video — 60-second personalized video showing something specific to them
Day 21: Email — new angle (different pain point or stakeholder perspective)
Day 24: Phone — final call attempt
Day 28: Email — breakup email, honest and brief, leave the door open
```

Each touch must add a new value angle. Repeating the same ask with different words is not a sequence — it is nagging.

## ICP TIERING (for outbound sequences)

Before building the sequence, tier the account to calibrate effort:

**Tier 1 (Top 50-100 accounts) — Deep, multi-threaded, highly personalized:**
- Full account research: 10-K/annual reports, earnings calls, strategic initiatives
- Multi-thread across 3-5 contacts per account (economic buyer, champion, influencer, end user, coach)
- Custom messaging per persona referencing account-specific initiatives
- Integrated plays: direct mail, warm introductions, event-based outreach

**Tier 2 (Next 200-500 accounts) — Semi-personalized:**
- Industry-specific messaging with account-level personalization in the opening line
- 2-3 contacts per account
- Signal-triggered enrollment; quarterly re-evaluation to promote or demote

**Tier 3 (Remaining ICP-fit) — Automated with light personalization:**
- Industry and role-based sequences with dynamic personalization tokens
- Single primary contact per account; signal-triggered enrollment only

## STEP 3: WRITE EACH EMAIL

For each email:
- **Subject line**: Preview what's inside. No misleading subjects.
- **Preview text**: First sentence that appears in inbox preview (50-100 chars)
- **Body**: 150-300 words. One topic. One CTA.
- **CTA**: Single link or action. Specific, not generic.

Maintain a consistent voice throughout the sequence. Each email should feel like it came from the same person.

## STEP 4: TIMING AND TRIGGERS

Specify:
- Entry trigger (signed up, purchased, clicked link, no activity for 30 days)
- Exit conditions (replied, purchased, unsubscribed)
- Delays between emails

## STEP 5: OUTPUT FORMAT

Present the full sequence as:

```
SEQUENCE: [Name]
AUDIENCE: [Who enters]
GOAL: [Desired outcome]
CADENCE: [Schedule]

--- EMAIL 1 ---
Trigger: [Entry event]
Delay: Immediately
Subject: [Subject line]
Preview: [Preview text]
Body:
[Full email body]
CTA: [Call to action]

--- EMAIL 2 ---
...
```

## ANTI-PATTERNS

- Every email feeling like a sales pitch — the sequence must provide value first
- Inconsistent voice between emails
- Sending too frequently (daily emails kill deliverability)
- No exit conditions — everyone should exit the sequence when they convert
- Generic CTAs ("learn more", "click here") instead of specific ones
