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
