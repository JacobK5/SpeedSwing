# 04-physics-tuning.md

# Physics & Gameplay Tuning System

## Purpose

This document defines the tuning philosophy for the project.

Version 0.1 is expected to undergo extensive playtesting.

To support rapid iteration, nearly every gameplay parameter should be adjustable while the game is running.

The goal is to make changing gameplay values easier than changing source code.

---

# Philosophy

Movement feel is discovered through iteration.

Not theory.

Not mathematics.

Not guessing.

Every value should therefore be considered temporary until validated through playtesting.

The codebase should make experimentation extremely inexpensive.

---

# Primary Goals

The tuning system should allow developers to:

* modify gameplay values live
* immediately observe the effects
* compare different configurations
* save configurations
* load previous configurations
* restore defaults

No recompilation should be required.

---

# Categories

Gameplay values should be organized into logical categories.

Example:

Movement

Grapple

Momentum

Camera

Weapons

Physics

Debug

Future categories may be added as necessary.

---

# Movement Settings

Examples include:

Movement speed

Acceleration

Ground deceleration

Ground friction

Air acceleration

Air control multiplier

Jump velocity

Gravity

Maximum fall speed

Coyote time

Jump buffer duration

Landing friction

Landing velocity threshold

---

# Grapple Settings

Examples include:

Maximum rope length

Minimum rope length

Default rope length

Retraction speed

Extension speed

Rope stiffness

Rope damping

Maximum attach distance (player-to-node reach; a cursor forgiveness radius was
tried and rejected in playtesting — targeting is nearest-node-to-cursor instead)

Release behavior

---

# Momentum Settings

Examples include:

Momentum preservation multiplier

Bunny-hop timing window

Minimum velocity required

Momentum loss on landing

Momentum loss while changing direction

Momentum transfer during swings

---

# Camera Settings

Examples include:

Follow smoothing

Look-ahead distance

Vertical offset

Dead zone size

Zoom level

Maximum camera speed

---

# Weapon Settings

Examples include:

Starting grapple ammo

Starting explosive ammo

Projectile speed

Projectile lifetime

Explosion radius

Explosion force

Explosion delay

---

# Debug Settings

Examples include:

Draw collision shapes

Draw grapple nodes

Draw rope

Draw velocity vectors

Draw collision normals

Show FPS

Show frame time

Show current movement state

Display player speed

Display rope tension

These tools are for development only and should not appear in release builds.

---

# User Interface

The tuning panel should be easy to navigate.

Suggested layout:

Collapsible sections.

Search.

Reset individual value.

Reset category.

Reset everything.

Numeric sliders where appropriate.

Direct numeric entry.

Keyboard-friendly navigation.

The interface should encourage experimentation.

---

# Saving

Developers should be able to:

Save current configuration.

Load previous configuration.

Duplicate configuration.

Rename configuration.

Delete configuration.

The active configuration should persist between sessions.

---

# Default Values

Every configurable value should have a documented default.

Defaults should never be overwritten accidentally.

Developers should always be able to restore the original baseline.

---

# Live Updates

Whenever possible, changes should take effect immediately.

Examples:

Gravity

Acceleration

Jump height

Rope length

Camera smoothing

No restart should be required unless technically unavoidable.

---

# Configuration Files

Gameplay configuration should exist outside the source code.

Prefer readable formats such as JSON.

Each category should have its own configuration file.

Example:

physics.json

movement.json

camera.json

weapons.json

Future systems should continue this pattern.

---

# Playtesting Workflow

Recommended workflow:

1. Launch game.

2. Load test level.

3. Adjust one value.

4. Play for several minutes.

5. Observe how the change feels.

6. Repeat.

Avoid changing many values simultaneously.

Small changes are easier to evaluate than large redesigns.

---

# Documentation

Every configuration value should include:

Name

Purpose

Expected range

Default value

Short description

Future developers should understand every value without reading gameplay code.

---

# Design Principles

The tuning system should encourage curiosity.

Developers should feel comfortable experimenting because every change is reversible.

Changing gameplay should be fast enough that tuning becomes enjoyable rather than tedious.

The easier it is to experiment, the more polished the final movement system is likely to become.

---

# Out of Scope

The tuning system is not intended to become a generic editor.

It should focus only on gameplay feel.

Level editing, scripting, and content creation belong in future tooling.

---

# Success Criteria

The tuning system is successful if a developer can:

Adjust movement.

Adjust grappling.

Adjust momentum.

Save a configuration.

Reload the game.

Continue using the same configuration.

...all without modifying gameplay code.

At that point, the project is optimized for rapid iteration rather than slow development.
