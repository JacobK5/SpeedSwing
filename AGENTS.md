# AGENTS.md

# Project Philosophy

Welcome to the project.

This game is being developed with a philosophy of **movement-first game design**. Every implementation decision should preserve or improve the player's feeling of movement, momentum, creativity, and flow.

This document should be read before making any changes to the codebase.

---

# Core Goal

We are **not** trying to build a feature-rich game.

We are trying to build one of the most satisfying movement systems possible for a browser game.

If a choice must be made between:

* more features
* better movement

always choose better movement.

---

# Development Philosophy

The project follows a strict iterative design process.

Current stage:

**Prototype / Feel First**

Nothing is considered finalized until it has been playtested.

The primary objective is to discover what feels fun.

Not to complete features.

---

# Guiding Principles

## Movement is the game.

Movement should be enjoyable in an empty room.

If movement is not fun, no additional mechanics should be added.

---

## Momentum is sacred.

Players should constantly be trying to preserve, create, and recover momentum.

Avoid mechanics that unnecessarily stop or reset player movement.

---

## Flow over realism.

Physics should be internally consistent.

However, if realism conflicts with satisfying gameplay, choose satisfying gameplay.

The player should feel clever, not frustrated.

---

## Player creativity matters.

Prefer systems that allow multiple solutions.

Avoid mechanics with only one intended use.

The best gameplay should emerge naturally from interacting systems.

---

## Simplicity beats quantity.

Every mechanic increases complexity.

New mechanics should only be added if they create meaningful new decisions.

Do not add mechanics simply because they seem interesting.

---

# Scope Discipline

Unless explicitly requested, DO NOT add:

* New weapons
* New movement abilities
* Enemies
* Upgrade systems
* Collectibles
* Story
* Cosmetics
* Multiplayer
* Progression systems
* UI polish
* Audio polish

The current objective is movement.

Everything else can wait.

---

# Code Philosophy

Code should prioritize:

* readability
* maintainability
* configurability
* modularity

Avoid clever implementations.

Future AI agents should easily understand every system.

---

# Configuration First

Almost every gameplay value should live in configuration rather than code.

Examples include:

* gravity
* acceleration
* air control
* jump velocity
* grapple properties
* rope properties
* friction
* damping
* ammo counts
* weapon values
* camera settings

Avoid hard-coded gameplay constants whenever possible.

---

# Live Tuning

The game should support a developer tuning panel.

The tuning panel should allow gameplay values to be modified while the game is running.

Changes should be saveable and reloadable.

The tuning system is considered a core development tool, not a debugging utility.

---

# Performance

Target:

* 60 FPS minimum
* Desktop browsers first
* Efficient physics
* Minimal garbage generation during gameplay

Avoid premature optimization, but keep systems clean.

---

# Placeholder Assets

Placeholder graphics are preferred.

Grey boxes are acceptable.

Programmer art is acceptable.

Fun comes before presentation.

---

# Testing Philosophy

Small iterations.

Implement.

Play.

Observe.

Adjust.

Repeat.

Avoid implementing multiple major systems before testing.

---

# Decision Making

When uncertain, ask these questions:

1. Does this improve movement?

2. Does this create interesting player decisions?

3. Does this preserve flow?

4. Will skilled players use this differently than beginners?

5. Could this create a memorable "I can't believe that worked" moment?

If the answer to most of these is "no", reconsider the implementation.

---

# Coding Style

* Small focused classes.
* Single responsibility where practical.
* Keep systems decoupled.
* Avoid giant manager classes.
* Prefer composition over tightly coupled inheritance.
* Write self-documenting code.
* Comment *why*, not *what*.

---

# Working With AI

When implementing a feature:

* Finish it completely.
* Refactor immediately if necessary.
* Leave the codebase cleaner than you found it.
* Do not leave TODOs unless explicitly requested.
* If assumptions must be made, document them.

---

# Out of Scope

For the current prototype:

* Procedural generation
* Multiplayer
* Steam support
* Browser portal SDK integration
* Mobile controls
* Achievements
* Cosmetics
* User accounts
* Level editor

These will come later.

---

# Success Criteria

The prototype is successful when:

A player can spend 20–30 minutes simply moving around an unfinished test level and still have fun.

That is the primary goal.

Everything else is secondary.
