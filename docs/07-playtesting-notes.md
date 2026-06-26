# 07-playtesting-notes.md

# Playtesting Journal

## Purpose

This document records observations made throughout development.

It exists to capture:

* discoveries
* failed ideas
* successful experiments
* tuning decisions
* unexpected player behavior
* future ideas

The purpose is **not** to record every change.

The purpose is to preserve the reasoning behind important decisions.

---

# Philosophy

The game should evolve based on evidence.

Not assumptions.

Not intuition alone.

Every major gameplay decision should ideally be supported by repeated observations from playtesting.

---

# General Rules

When recording notes:

Prefer observations over opinions.

Instead of:

"The grapple feels weird."

Write:

"Players consistently overshot the intended landing platform after releasing the grapple."

Whenever possible, describe:

* what happened
* why it might have happened
* what should be tested next

---

# Playtest Entry Template

## Date

YYYY-MM-DD

---

## Build

Example:

v0.1.12

---

## Participants

Who tested?

Developer

Friends

New players

Experienced players

Approximate number of participants.

---

## Goal

What question are we trying to answer?

Examples:

Does rope retraction feel intuitive?

Is the bunny-hop timing window too strict?

Are grapple nodes too limited?

Keep each playtest focused.

---

## Hypothesis

What do we expect?

Example:

Increasing rope damping will improve player control.

---

## Changes

What changed since the previous playtest?

List only meaningful gameplay changes.

---

## Observations

Describe what actually happened.

Avoid explaining why until later.

Examples:

Players consistently missed grapple attachments.

Experienced players ignored the intended route.

Most players immediately experimented with rope retraction.

Nobody noticed the destructible shortcut.

---

## Unexpected Behavior

One of the most valuable sections.

Examples:

Players discovered an unintended shortcut.

Players intentionally saved grapple nodes.

Players repeatedly attempted a mechanic that doesn't exist.

Players found a faster route than expected.

Unexpected behavior often reveals the best ideas.

---

## Player Quotes

Whenever possible, record exact quotes.

Examples:

"I wonder if I can..."

"Oh!"

"I almost had it."

"I didn't know that worked."

"One more try."

These often reveal more than direct questions.

---

## Metrics

If measured:

Completion time

Restart count

Average speed

Ammo usage

Route choice

Deaths

Number of successful bunny hops

Only collect metrics that will influence future decisions.

---

## Conclusions

Summarize what was learned.

Keep conclusions grounded in observations.

Example:

Reducing rope stiffness improved consistency without noticeably reducing player expression.

---

## Action Items

Small list.

Examples:

Increase grapple forgiveness.

Test lower gravity.

Reduce camera smoothing.

Increase starting grapple nodes.

Avoid making multiple major changes before the next playtest.

---

# Failed Experiments

This section is intentionally permanent.

Record ideas that were tested and rejected.

Examples:

Wall running.

Automatic momentum preservation.

Infinite grapple ammunition.

Even unsuccessful experiments provide valuable historical context.

---

# Ideas Parking Lot

Interesting ideas that should NOT be implemented yet.

Examples:

Magnets

Fans

Ice

Conveyor belts

Procedural generation

Multiplayer

New weapon types

Do not evaluate these until the current milestone is complete.

---

# Design Questions

Maintain a running list of unanswered questions.

Examples:

How much air control feels best?

Should rope retraction accelerate?

How forgiving should grapple attachment be?

How many grapple nodes create the most interesting decisions?

Questions should gradually disappear as evidence accumulates.

---

# Things We Learned

A growing list of principles discovered through development.

Examples:

Players enjoy recovering from mistakes more than avoiding them.

Higher momentum creates more memorable moments.

Removing friction increased creativity.

This section should become more valuable over time.

---

# Decision Log

Whenever a major decision is finalized, record:

Decision

Reason

Supporting observations

Date

This prevents the same debates from happening repeatedly months later.

---

# Success Criteria

This document is successful if, six months from now, a developer can understand:

Why the game feels the way it does.

Why major mechanics exist.

Why certain mechanics were rejected.

What still needs investigation.

Without relying on memory.

The playtesting journal should become the historical record of the project's evolution.

Every important gameplay decision should be traceable back to observations made during playtesting.
