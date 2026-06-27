# 01-design-bible.md

# Design Bible

## Purpose

This document is the single, scannable reference for *what kind of game this is*
and the principles every implementation decision is measured against.

It does **not** introduce new design canon. It consolidates the pillars already
established in [`VISION.md`](../VISION.md), [`AGENTS.md`](../AGENTS.md),
[`docs/00-agent-brief.md`](./00-agent-brief.md) and
[`docs/03-core-mechanics.md`](./03-core-mechanics.md). Where this summary and
those documents disagree, **those documents win** and this file should be
corrected.

---

# The One Sentence

A browser speedrunning game whose entire appeal is that *moving is fun*, built
around grappling, momentum and the player's own creativity.

> **Movement is the game.** Everything else exists to support that.

---

# Design Pillars

These are the load-bearing principles. A feature that does not serve at least one
of them probably does not belong.

## 1. Movement is the game
Moving should be enjoyable in an empty room. If movement is not fun on its own,
no amount of extra mechanics will save it — and none should be added until it is.

## 2. Momentum is sacred
Players should constantly create, preserve, and recover momentum. Avoid mechanics
that needlessly stop or reset the player. Recovering from a mistake should feel
as good as never making it.

## 3. Flow over realism
Physics should be internally consistent, but when realism fights satisfaction,
satisfaction wins. The player should feel clever, not fought by the simulation.

## 4. Player creativity matters
Prefer systems with many uses and many solutions. The best moments should emerge
from simple systems interacting, not from one scripted intended path.

## 5. Simplicity beats quantity
Every mechanic adds complexity. Add one only if it creates genuinely new,
interesting decisions. The smallest game that produces endless interesting
choices beats a large game of shallow ones.

## 6. Discovery and mastery
Teach through experimentation, not tutorials. Let techniques feel obvious in
hindsight. Beginners and experts use the *same* mechanics yet should look like
they are playing different games.

---

# The Feeling We Are Chasing

Success looks like a player thinking, unprompted:

- "One more try."
- "I almost had that."
- "I wonder if I can…"
- "No way — I can't believe that worked."
- "Watch this."

If the prototype reliably produces those thoughts, it is working.

---

# Core Gameplay Loop

1. Spawn.
2. Move — run, jump, swing.
3. Place grapple nodes to build your own movement infrastructure.
4. Chain momentum through the level toward the goal.
5. See your time.
6. Instantly restart.
7. Try to do it faster.

This loop must stay fast. Downtime and interruptions are the enemy of flow, so
restarts are near-instant and menus are minimal.

---

# What This Game Is / Is Not

It **is**: a movement-first, physics-based speedrunning platformer about skill,
routing, and self-expression.

It is **not**: a combat game, a puzzle game, a traditional content-driven
platformer, or a progression/RPG game. The player gets better; the character
does not.

---

# Mechanics at a Glance (v0.1 scope)

The prototype intentionally contains only what is needed to evaluate movement:

- Running, jumping, air control, momentum.
- A grappling hook with real rope physics (extend/retract, swing).
- Player-placed, permanent grapple nodes (a limited resource — plan their use).
- Explosives + destructible / no-node terrain for routing decisions.
- A goal, a speedrun timer, and instant restart.
- Developer tuning tools for rapid iteration.

Anything not on this list (enemies, progression, multiplayer, cosmetics, etc.) is
deferred by design. See [`docs/03-core-mechanics.md`](./03-core-mechanics.md) for
the authoritative behaviour spec and
[`docs/06-development-roadmap.md`](./06-development-roadmap.md) for the order in
which these arrive. Current build status lives in [`README.md`](../README.md).

---

# The Design Litmus Test

Before adding or changing anything, ask:

1. Does this improve movement?
2. Does this preserve momentum?
3. Does this create interesting player decisions?
4. Will skilled players use this differently than beginners?
5. Could this create a memorable "I can't believe that worked" moment?

If the answer to most of these is "no," reconsider whether it belongs.
