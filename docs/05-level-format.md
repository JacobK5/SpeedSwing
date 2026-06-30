# 05-level-format.md

# Level Format Specification

## Purpose

This document defines the structure of a game level.

It specifies **what information a level contains**, not how that information is stored internally.

Version 0.1 uses JSON as the storage format, but the conceptual structure should remain stable even if the serialization format changes in the future.

---

Levels can be authored by hand or with the developer-only level editor
([10-level-editor.md](./10-level-editor.md)), which reads and writes this exact
format.

# Design Philosophy

Levels should be lightweight.

A level should describe **what exists**, not **how the game behaves**.

Gameplay rules belong in code.

Level files should contain data only.

---

# Guiding Principles

Levels should be:

* Human readable
* Easy to diff in Git
* Easy to generate
* Easy to validate
* Easy to extend

Avoid unnecessary complexity.

---

# Level Structure

Every level should contain:

## Metadata

Examples:

* Name
* Author
* Description
* Version
* Creation date (optional)
* Tags (optional)

Metadata should not affect gameplay.

---

## Player Spawn

Exactly one player spawn location.

Defines:

* Position
* Initial facing direction (optional)

---

## Goal

Exactly one goal.

Defines:

* Position
* Radius / size
* Completion trigger

Touching the goal immediately completes the level.

---

# World Geometry

Version 0.1 supports static geometry only.

Geometry should consist of simple convex shapes wherever possible.

Future support for curved or dynamic geometry may be added later.

---

# Surface Types

Every piece of geometry should define its surface type.

Current supported types:

## Standard

* Normal collision
* Allows grapple node placement

---

## No-Node

* Normal collision
* Prevents grapple node placement

---

## Destructible

* Normal collision
* Destroyed by explosive projectiles

Destroyed terrain remains destroyed until the level restarts.

---

## Kill Zone

Immediately restarts the level.

Examples:

* Lava
* Void
* Spikes

Visual appearance is independent of behavior.

---

# Starting Resources

Levels define:

Starting Grapple Node Ammo

Starting Explosive Ammo

Future resource types should follow the same pattern.

---

# Camera

Levels may optionally specify:

Starting zoom

Camera bounds

Default values should be used when omitted.

---

# Visual Theme

Version 0.1 should keep this intentionally simple.

Examples:

Background color

Grid visibility

Placeholder palette

No gameplay should depend on visual styling.

---

# Future Extension Points

The level format should be designed so future additions do not require redesign.

Possible future additions include:

Moving platforms

One-way platforms

Ice

Conveyor belts

Fans

Bounce surfaces

Enemies

Collectibles

Checkpoints

Trigger volumes

Lighting

Weather

These should be additive rather than breaking existing levels.

---

# Level Validation

Before loading, every level should be validated.

Validation should check:

Exactly one player spawn.

Exactly one goal.

No invalid surface types.

No malformed geometry.

No missing required fields.

Meaningful error messages should be produced when validation fails.

---

# Design Guidelines

Good levels should encourage:

Experimentation

Creative routing

Momentum preservation

Resource optimization

Recovery from mistakes

Levels should avoid requiring pixel-perfect execution unless intentionally designed for advanced players.

---

# Versioning

Each level should include a format version.

Future versions should preserve backward compatibility whenever practical.

Migration utilities may be added later if required.

---

# Serialization

JSON is the preferred format for Version 0.1.

Reasons:

* Human readable
* Easy to edit
* Git-friendly
* Easy to generate programmatically

The exact JSON schema may evolve, but the conceptual structure defined in this document should remain stable.

---

# Out of Scope

Version 0.1 does not include:

Procedural generation

Embedded scripts

Custom gameplay logic

NPC behavior

Dialogue

Cutscenes

Progression data

Save-state information

These belong to higher-level game systems rather than individual levels.

---

# Success Criteria

A level should be understandable by reading the file alone.

A new developer should be able to:

* Identify where the player starts.
* Identify where the goal is.
* Understand all terrain types.
* Understand the player's starting resources.
* Predict how the level will play.

Without needing to inspect gameplay code.

If that is true, the level format has achieved its purpose.
