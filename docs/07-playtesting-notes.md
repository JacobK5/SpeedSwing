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

Increase grapple reach.

Test lower gravity.

Reduce camera smoothing.

Increase starting grapple nodes.

Avoid making multiple major changes before the next playtest.

---

# Outstanding Playtest Questions — Phase 3 Momentum (added 2026-06-30)

Phase 3 momentum mechanics were implemented **without** a playtesting gate (a
deliberate, time-boxed exception). The logic is unit-tested for correctness but
the *feel* is unvalidated. These must be answered by a human in a real browser:

- **Bunny-hop window (`bunnyHopWindow`, default 0.15s):** Does the window feel
  rewarding to hit, or either trivially easy / frustratingly strict? Tune up for
  forgiveness, down for a higher skill ceiling.
- **Min speed (`bunnyHopMinSpeed`, default 3.5):** Is the threshold for a hop to
  "count" at a natural speed, or does it gate too early/late?
- **Hop multiplier (`bunnyHopMomentumMultiplier`, default 1.0 = pure preserve):**
  Should a perfect hop *boost* speed (e.g. 1.05–1.1) or only preserve it? Watch
  for runaway speed if boosting.
- **Landing penalty (`landingMomentumPreservation`, default 0.9):** Does losing
  ~10% on a flubbed landing feel fair, or does it punish flow too much? 1.0
  disables the penalty entirely (momentum fully sacred).
- **Swing control (`swingControlMultiplier`, default 1.0):** Does scaling air
  control while grappling make swings feel steerable without killing the
  pendulum? Does retracting (W) near the bottom/end of a swing convert into the
  height/speed gain the design intends?
- **Overall:** Do players *discover* bunny-hopping and rope-pumping on their own
  (the design wants techniques to feel obvious in hindsight), or do they need to
  be told? Watch for "one more try" moments.

All five values are live-editable via the tuning panel (press **T**) and the
debug overlay (press **`**) shows the bunny-hop window, grounded state, speed and
momentum state to make tuning observable.

---

# Outstanding Playtest Questions — Phase 4 Prototype Loop (added 2026-06-30)

Phase 4 systems and the first greybox benchmark (`benchmark-01`) were also built
without a playtesting gate. Logic is unit-tested; the loop and level balance are
unvalidated. To answer with a human in a real browser:

- **Benchmark routes:** Do the high (swing) and low (platform) routes both feel
  viable? Is the expert ~30s / average ~60s target roughly right? Does the
  no-node anchor over gap 2 create an interesting choice or just annoyance? Do
  the recovery ledges actually save mistakes without trivialising the gaps?
- **Retract-for-height:** Does retracting (W) near the end of a swing onto the
  raised goal feel discoverable and satisfying (the level is built to test this)?
- **Ammo counts (6 nodes / 2 explosives):** Too tight, too generous? Does running
  low create real routing tension without dead-ending the run?
- **Explosive feel:** Is the explosion radius (90) sensible for the destructible
  barrier? Should `explosionPlayerForce` be enabled to allow explosive-jump tech,
  or does that invite chaos? Is detonate-on-contact the right trigger?
- **Timer start:** Starting on first input — does it feel fair, or should it
  start on spawn / a countdown? Does the live HUD clock distract from flow?
- **Kill zones / restart:** Is instant restart fast enough to sustain "one more
  try"? Do kill zones punish fairly?
- **Run-complete screen:** Does it show the right info (time, best, delta, ammo
  used) and get out of the way fast enough?

All weapon/explosion values live in `weapons.json` and the tuning panel.

---

# Outstanding Playtest Questions — Limp Rope Trial (added 2026-06-30)

Branch `feature/limp-rope` makes the rope one-sided: it goes limp (no force) when
slack and only pulls when taut, instead of the rigid two-sided rod. `ropeGoesLimp`
defaults on and is a live tuning-panel toggle, so limp vs. rigid can be A/B'd in
one build. Logic is unit-tested (`isRopeTaut`); feel is unvalidated. To answer in
a real browser:

- **Limp vs. rigid:** Which feels better overall? Does limp unlock the intended
  rope-dynamics (drop-and-catch, build-slack-for-a-yank, swing inward freely), or
  does it just feel mushy / unpredictable compared to the tight rigid rope?
- **Catch snap:** When a limp rope goes taut at speed, does the catch feel
  satisfying or jarring? Is `stiffness` 0.9 / `damping` 0.05 still right for limp,
  or does limp want softer/harder values than the rigid rod did?
- **Retract/extend interplay:** Does pumping (W/S) still read well when the rope
  can go slack, or does slack make length control feel disconnected?
- **Boundary jitter:** Any visible oscillation when hovering right at the taut
  distance? If so, does it hurt feel or is it unnoticeable in motion?
- **Default:** If limp wins, flip the default in `master`; if not, keep rigid and
  retire the flag (DECISIONS.md #016).

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
