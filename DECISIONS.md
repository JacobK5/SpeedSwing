# DECISIONS.md

# Project Decision Log

## Purpose

This document records major project decisions.

Its purpose is to prevent the team from repeatedly revisiting the same discussions.

Whenever a significant design or technical decision is intentionally made, it should be recorded here.

Decisions should only be modified when there is compelling evidence that they should change.

Never delete old decisions.

Instead:

* Mark them as superseded.
* Explain why.
* Record the replacement.

This document is intended to provide historical context for both human developers and AI agents.

---

# Decision #001

## Title

Movement is the Primary Gameplay

## Status

Active

## Decision

The core gameplay revolves around movement.

Movement is not simply a way to reach gameplay.

Movement **is** the gameplay.

## Rationale

The project exists to create a highly satisfying movement system with a deep skill ceiling.

Additional mechanics should support movement rather than replace it.

## Consequences

Future mechanics should be evaluated primarily by how they improve movement, momentum, creativity, or player expression.

---

# Decision #002

## Title

Prototype Before Expanding

## Status

Active

## Decision

The project will validate the core movement system before introducing additional mechanics.

## Rationale

A fun movement system should not depend on large amounts of content.

Feature creep should be resisted until movement has been proven enjoyable through playtesting.

## Consequences

Many ideas are intentionally deferred rather than rejected.

---

# Decision #003

## Title

Grapple Nodes Are Permanent

## Status

Active

## Decision

Once placed, grapple nodes remain for the duration of the level.

They are never automatically removed.

## Rationale

Permanent nodes create long-term planning and resource management.

Players gradually build their own movement infrastructure throughout a level.

## Consequences

Players must carefully decide where to spend grapple ammunition.

Future routing becomes an important part of gameplay.

---

# Decision #004

## Title

Movement Values Are Configurable

## Status

Active

## Decision

Gameplay values should be loaded from configuration rather than hard-coded.

## Rationale

The project is expected to undergo extensive tuning.

Configuration-driven gameplay dramatically improves iteration speed.

## Consequences

The project requires an in-game tuning system capable of modifying and saving gameplay values.

---

# Decision #005

## Title

Version 0.1 Prioritizes Feel

## Status

Active

## Decision

Version 0.1 exists solely to evaluate movement quality.

## Rationale

The prototype should answer one question:

"Is moving around fun?"

Everything else can be added later.

## Consequences

Large gameplay systems are intentionally postponed.

---

# Decision #006

## Title

Browser First

## Status

Active

## Decision

The game will be developed as a browser-first HTML5 game.

## Rationale

Instant accessibility aligns with the project's goals and supports eventual release on browser game portals.

## Consequences

Desktop browsers are the primary target platform throughout early development.

---

# Decision #007

## Title

Speedrunning Is The Core Game Mode

## Status

Active

## Decision

Levels are designed around achieving the fastest completion time.

## Rationale

Speedrunning naturally encourages replayability, mastery, experimentation, and creative routing.

## Consequences

The gameplay loop should emphasize rapid restarts and continuous improvement.

---

# Decision #008

## Title

Resource Management Through Ammunition

## Status

Active

## Decision

Each level begins with a fixed amount of grapple node and explosive ammunition.

Resources do not regenerate.

## Rationale

Limited ammunition creates meaningful routing decisions without slowing the pace of gameplay.

## Consequences

Players must balance speed with resource efficiency.

---

# Decision #009

## Title

Rope Physics Over Instant Grappling

## Status

Active

## Decision

The grapple behaves as a physical rope rather than an instant pull mechanic.

Players may extend and retract the rope using W and S.

## Rationale

Rope physics create a much higher skill ceiling and allow momentum to become the defining mechanic of the game.

## Consequences

Swing mastery is expected to become a major source of player expression.

---

# Decision #010

## Title

Player Flow Takes Priority

## Status

Active

## Decision

Gameplay should minimize interruptions.

Whenever possible, actions should preserve movement rather than pause it.

## Rationale

Flow state is central to the intended player experience.

The player should spend as much time moving as possible.

## Consequences

Avoid long animations, unnecessary menus, excessive downtime, and mechanics that interrupt momentum.

---

# Decision #011

## Title

Playtesting Drives Design

## Status

Active

## Decision

Major gameplay changes should be guided by repeated playtesting observations rather than speculation.

## Rationale

Movement quality is difficult to predict theoretically.

The best solutions will emerge through iteration.

## Consequences

New mechanics should generally follow successful playtests rather than precede them.

---

# Decision #012

## Title

Bunny Hop Is a Deferred-Penalty Timing Window, Not an Auto-Hop

## Status

Active

## Decision

Landing opens a short timing window (`movement.bunnyHopWindow`). Jumping inside
that window with enough horizontal speed (`bunnyHopMinSpeed`) preserves — and
optionally boosts (`bunnyHopMomentumMultiplier`) — horizontal momentum. Letting
the window lapse while staying grounded instead applies a one-time horizontal
multiplier (`landingMomentumPreservation`). Walking off a ledge before the window
ends keeps full speed (no penalty).

The jump itself always still requires being grounded or within coyote time, so
this can never auto-jump for the player and can never become a mid-air double
jump.

## Rationale

This rewards intentional rhythm (the project's mastery goal) without ever taking
control from the player. Modelling it as a *deferred* penalty means a successful
hop launches from full landing speed, and a missed hop is what costs speed —
which is exactly the "skilled players preserve momentum better than beginners"
property the design asks for.

## Consequences

All five momentum values are configurable and exposed in the tuning panel.
Defaults (window 0.15s, min speed 3.5, multiplier 1.0, preservation 0.9) are
first guesses and explicitly NOT validated; they must be tuned through human
playtesting (see docs/07-playtesting-notes.md). An automatic low-speed "recovery
assist" was intentionally NOT added: recovery is provided by the bunny hop,
momentum preservation, and level design (recovery paths), keeping mastery in the
player's hands.

---

# Decision #013

## Title

Ammo Is Consumed On Firing; Explosives Are Routing Tools

## Status

Active

## Decision

Both weapons consume one unit of ammunition when **fired**, not when a node is
successfully placed or an explosive hits something useful. A shot that misses, or
hits a no-node surface, still costs ammo. Explosives detonate on terrain contact
(or at end of life), destroy destructible terrain within a configurable radius,
and by default apply **no** force to the player (`explosionPlayerForce` defaults
to 0).

## Rationale

Consuming on fire makes every shot a real decision and keeps the rule trivial to
reason about, which is what gives the fixed ammo (DECISIONS.md #008) its routing
weight. Explosives exist to open routes through destructible terrain, not to
fight — so knockback is opt-in tuning rather than a default behaviour.

## Consequences

Players must aim deliberately. Explosion radius, projectile speed/lifetime, and
the optional player knockback are all configurable in `weapons.json` / the tuning
panel and are NOT playtest-validated. Destroyed terrain resets on restart because
the scene is rebuilt from the level data.

---

# Decision #014

## Title

The Run Clock Starts On First Input, Not On Spawn

## Status

Active

## Decision

The speedrun timer starts the first time the player commits to an action
(movement key, jump, fire, or grapple) and stops the instant the goal is touched.
Pausing (Esc) removes paused time from the clock. Restart (R) is instant from any
state, including the run-complete and pause screens.

## Rationale

Starting on first input lets a player settle, read the level, and plan a route
without the clock punishing them — the timer measures the run, not the staring.
This protects flow (DECISIONS.md #010): nothing about timing interrupts movement,
and retries are always one key away.

## Consequences

The timer is driven by a paused-time-adjusted game clock so pauses never inflate
a time. Personal bests are stored per level in local storage. What exact action
should start the clock, and whether bests should be visible mid-run, are open
playtesting questions.

---

# Future Decisions

When adding a new decision:

1. Assign the next sequential number.
2. Give the decision a short descriptive title.
3. Record the current status.
4. State the decision clearly.
5. Explain why it was made.
6. Describe the long-term consequences.

Only record decisions that meaningfully influence the direction of the project.

This document should remain concise and easy to scan.

It should capture the project's guiding choices, not every implementation detail.
