---
name: orchestrate
description: "Start-of-day sweep across every connected surface — mail, calendar, tasks, chat, boards — reconciled into status.md. Reports what it could not reach instead of quietly returning less."
user-invocable: true
source: pandaos
---

# Orchestrate

The inbound half of the day. Sweep what the user is connected to, work out what
actually needs them, and rewrite the top of `status.md`.

`capture` is the outbound half. The two share one file and never write each
other's sections.

## Rules that make this trustworthy

**Discover connections, never assume them.** Do not assume Gmail. Do not assume
Slack. Check which app tools are actually available to you this session and sweep
those. A user on Outlook and Teams gets the same quality of brief as a user on
Gmail and Slack, because this skill names roles — mail, calendar, tasks, chat,
board — not vendors.

**A surface you could not reach is a finding, not a silence.** If chat tools are
unavailable, or a call fails, say so in the output. A brief that silently omits
half the day looks identical to a quiet day, and the user acts on it as if it
were one.

**Use the allow-list.** Without a curated list of what matters, a sweep drowns in
dead channels and newsletters, and the user stops reading the brief within a
week. The allow-list is what makes this survive past week one.

**You own `Today` and `Waiting On`. Nothing else.** Never touch `Open Loops`,
`Decisions`, or `Recently Done` — those belong to `capture`.

## Instructions

### Step 1: Get the real date and time

Before anything else, and before any date arithmetic. The date in your context was
stamped at session start and may be stale.

Get the wall clock from the system (`date` on macOS/Linux, `Get-Date` on Windows
PowerShell). You need today's date, the time, and the weekday to compute "since
yesterday", "overdue", and "waiting 4 days" correctly.

### Step 2: Load context

Read `status.md`, `.pandaos/knowledge/assistant-context.md`, and
`.pandaos/knowledge/assistant-sources.md`.

**If `assistant-sources.md` does not exist, build it before sweeping.** Ask the
user, in one round:

- Which chat spaces or channels actually matter (name them; everything else is
  ignored).
- Which mail deserves attention — specific senders, labels, or "anything
  addressed directly to me".
- Which board columns or task lists count as theirs.
- Which calendars matter, if more than one.

Write the answers to `.pandaos/knowledge/assistant-sources.md` and use them from
then on. Personal facts live in knowledge files, never in this skill.

If `status.md` does not exist, create it with the five standard sections empty.

### Step 3: Sweep, by role

Only the roles you actually have tools for. For each, collect what needs the user
— not everything that exists.

| Role | What to pull | What to ignore |
| --- | --- | --- |
| Mail | Unread or unanswered since the last sweep, within the allow-list scope. Anything the user was asked a direct question in. | Newsletters, notifications, automated reports, threads where the user is CC'd and not addressed. |
| Calendar | Today's events with times. Anything needing prep. Conflicts and back-to-backs. Tomorrow's first commitment if today ends late. | Declined events, all-day informational entries. |
| Tasks | Due today, overdue, or explicitly flagged. | Undated someday items. |
| Chat | Direct messages, and mentions inside allow-listed spaces only. | Everything in non-allow-listed spaces, and unmentioned channel chatter. |
| Board | Items assigned to the user, in columns the user owns. Anything blocked on them. | The rest of the board. |

Note the time of this sweep so the next one knows what "since" means.

### Step 4: Reconcile against what is already there

This is the step that stops the file becoming a pile.

- An item already in `Today` or `Waiting On` that is still live: leave it, update
  its age. Do not duplicate it under a new wording.
- An item in `Waiting On` that got a reply: move it to `Today` if it now needs
  action, or note it as unblocked.
- An item that is done: leave it. `capture` moves things to `Recently Done`.
- An item the user hand-added that you cannot source from any connection: **keep
  it**. Mark it as user-added. Never delete something just because you cannot see
  where it came from.

### Step 5: Rewrite `Today` and `Waiting On`

Order `Today` by when it must happen: fixed-time commitments first in time order,
then things due today, then everything else by consequence-of-not-doing-it.

Every item gets: what it is, where it came from, and what "done" means for it.
An item that reads "follow up with Chris" is worthless three hours later — write
"reply to Chris on the Q3 budget question (mail, Tuesday)".

`Waiting On` items carry who it is on and how long it has been waiting, in days.
Anything past a week gets flagged for a chase.

### Step 6: Report

Lead with the shape of the day: how many fixed commitments, where the free blocks
are, and the one thing that most needs to happen.

Then the brief itself, grouped by the sections you just wrote.

Close with what you could not reach — unavailable tools, failed calls, or
surfaces with no allow-list entry — and what the user would need to connect to
close that gap. If everything was reachable, say that too, in one line.

## Do not

- Reply to anything, send anything, accept an invitation, or move a card. This
  skill reads the world and writes one local file. Anything outbound is drafted
  and shown to the user first, and that is `capture`'s job or an explicit ask.
- Rewrite sections you do not own.
- Pad the brief. If it is a quiet day, a three-line brief is the correct output
  and is more useful than a page of filler.
