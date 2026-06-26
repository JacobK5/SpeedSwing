# 03-core-mechanics.md

# Version 0.1 Core Mechanics

## Purpose

This document defines the gameplay mechanics that make up Version 0.1.

It intentionally does **not** describe implementation.

Instead, it describes how the game should behave from the player's perspective.

Everything listed here is considered part of the minimum playable prototype.

Anything not listed is outside the scope of Version 0.1.

---

# Gameplay Goal

The objective of every level is simple:

Reach the goal as quickly as possible.

The player is encouraged to:

* preserve momentum
* discover faster routes
* improve execution
* optimize resource usage

Time is the primary measure of success.

---

# Player Movement

The player can:

* Run left and right.
* Jump.
* Control movement while airborne.
* Preserve momentum through skilled movement.

Movement should feel responsive and predictable.

The player should quickly build intuition for how movement behaves.

Movement should reward mastery without becoming unnecessarily difficult.

---

# Momentum

Momentum is one of the core systems of the game.

Players should naturally gain speed by:

* swinging
* falling
* chaining movement together

The game should avoid unnecessarily removing momentum.

Momentum should feel valuable.

Recovering momentum after mistakes should be satisfying.

---

# Bunny Hop / Momentum Jump

When landing with sufficient momentum, the player has a short timing window to jump again.

Successfully timing this jump preserves significantly more momentum than a normal landing.

This mechanic rewards timing and rhythm rather than button mashing.

The game should never automatically perform this action for the player.

---

# Grapple Nodes

The player possesses ammunition for Grapple Nodes.

When fired:

* a node permanently attaches to a valid surface
* the node remains for the duration of the level
* nodes do not expire
* nodes are never automatically removed

Every node is therefore a strategic resource.

Players should think carefully about where they place them.

---

# Grappling

The player may grapple to nearby placed nodes.

The grapple behaves as a rope.

It should:

* swing naturally
* preserve momentum
* allow release at any time
* immediately reattach to another node

The grapple is primarily a movement tool.

It is not intended to function as a weapon.

---

# Rope Length

While grappling:

W

Retract rope.

S

Extend rope.

Changing rope length should occur smoothly.

Players should be able to use rope length to manipulate swing paths and maintain momentum.

This mechanic is expected to become an important source of advanced movement techniques.

---

# Weapons

Version 0.1 contains exactly two projectile types.

## Grapple Node

Purpose:

Create permanent grapple anchors.

Consumes one ammunition.

---

## Explosive

Purpose:

Destroy destructible terrain.

Consumes one ammunition.

Explosives exist to create routing decisions rather than combat.

---

# Ammunition

Every level begins with a fixed amount of ammunition.

Ammunition does not regenerate.

Nodes remain after placement.

Running out of ammunition does not prevent level completion.

Instead, it reduces the player's available movement options.

Efficient ammunition usage is expected to become part of route optimization.

---

# Terrain Types

Version 0.1 supports only a small number of terrain types.

## Standard Terrain

Normal collision.

Allows grapple node placement.

---

## No-Node Terrain

Normal collision.

Does not allow grapple node placement.

Used to influence routing and puzzle design.

---

## Destructible Terrain

Normal collision.

Destroyed by explosive projectiles.

Creates optional routes and shortcuts.

---

## Goal

Touching the goal completes the level.

Completion time is immediately recorded.

---

## Kill Zone

Immediately restarts the level.

Restart should occur with minimal delay.

---

# Speedrunning

The gameplay loop is centered around replayability.

Players should naturally repeat levels to:

* improve execution
* optimize routes
* conserve ammunition
* reduce completion time

Restarting should always be fast.

Downtime should be minimal.

---

# Camera

The camera should smoothly follow the player.

It should never become the source of difficulty.

The player should always have enough information to make movement decisions.

---

# Things Version 0.1 Deliberately Does NOT Include

The following mechanics are intentionally excluded.

Movement

* wall running
* double jump
* dash
* teleportation

Environment

* ice
* conveyor belts
* fans
* moving platforms
* portals

Gameplay

* enemies
* combat
* bosses
* collectibles
* checkpoints
* procedural generation

Weapons

* magnets
* repulsors
* bounce shots
* portals
* special ammunition

These mechanics may be explored after movement has been validated.

---

# Design Philosophy

Every mechanic included in Version 0.1 exists because it directly contributes to movement.

Nothing should distract from discovering whether movement alone is compelling.

If the prototype is already fun with only these mechanics, additional mechanics can later expand the design space without changing the game's identity.

If the prototype is not fun, additional mechanics should not be used to compensate.

The movement must succeed first.

---

# Success Criteria

A successful Version 0.1 should create situations where players naturally think:

"I bet I can do that faster."

"What if I place my grapple here instead?"

"I think I can save an explosive."

"I almost had that."

"One more try."

If the prototype consistently creates those thoughts, it has successfully demonstrated the core gameplay loop.
