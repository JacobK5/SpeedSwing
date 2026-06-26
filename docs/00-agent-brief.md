# 00-agent-brief.md

# Browser Grappling Game

## Agent Onboarding Brief

Welcome to the project.

This document provides a high-level overview of the project, its philosophy, current development stage, technical direction, and immediate objectives.

Read this document first.

Then read:

1. AGENTS.md
2. 01-design-bible.md
3. 02-v0.1-technical-spec.md
4. 03-core-mechanics.md

Only begin implementation after understanding all four documents.

---

# Project Vision

The goal is to create a browser-based speedrunning platformer centered around satisfying movement.

This is **not** a combat game.

It is **not** a puzzle game.

It is **not** a traditional platformer.

Movement is the primary source of enjoyment.

The player should gradually become more skilled through practice rather than through character progression.

The game should naturally produce moments where players think:

* "One more try."
* "I can't believe that worked."
* "I didn't know you could do that."
* "Watch this."

Those moments define success.

---

# High-Level Gameplay

The player traverses levels as quickly as possible using:

* Running
* Jumping
* Momentum
* A grappling hook
* Grapple nodes that the player places themselves
* Rope extension/retraction
* Limited ammunition
* Environmental interactions

The objective is to complete each level as quickly as possible.

The intended audience includes players who enjoy:

* Speedrunning
* Skill mastery
* Physics-based movement
* Creative routing
* Discovering advanced techniques

---

# Current Development Stage

Prototype.

The game is currently validating one question:

**Is movement alone fun?**

Nothing else should distract from answering that question.

Presentation, progression, content, and polish are intentionally being deferred.

---

# Current Scope

Version 0.1 should contain only enough systems to evaluate movement quality.

The prototype should consist of:

* One test level
* Placeholder graphics
* Core movement
* Grappling
* Rope physics
* Two projectile types
* Speedrun timer
* Developer tuning tools

No additional gameplay systems should be introduced without explicit approval.

---

# Guiding Philosophy

Every implementation should support one or more of these goals:

* Improve movement feel.
* Increase player creativity.
* Reward mastery.
* Preserve momentum.
* Encourage experimentation.

Avoid implementing mechanics that merely increase complexity.

---

# Technology Stack

Current planned stack:

Frontend:

* TypeScript
* Phaser 3
* Vite

Physics:

* Matter.js

Build Target:

* HTML5 browser game

Primary Target Platforms:

* itch.io
* CrazyGames
* Poki
* Other HTML5 browser portals

Architecture priorities:

* Modular
* Configurable
* Easily testable
* AI-agent friendly

---

# Technical Priorities

The most important technical objective is **feel**.

Everything related to movement should be configurable.

Examples:

* gravity
* jump velocity
* acceleration
* friction
* rope stiffness
* rope damping
* rope retraction speed
* bunny-hop timing window
* camera smoothing

These values should not require recompilation to adjust.

The game should support live tuning through a developer panel.

---

# Current Gameplay Loop

1. Spawn.
2. Move.
3. Place grapple nodes.
4. Swing through the level.
5. Reach the goal.
6. View completion time.
7. Instantly restart.
8. Try to improve.

This loop should remain extremely fast.

Downtime should be minimized.

---

# Development Priorities

Priority 1

Movement quality.

Priority 2

Physics consistency.

Priority 3

Control responsiveness.

Priority 4

Level experimentation.

Priority 5

Everything else.

---

# Things We Are Explicitly Avoiding

Do not add:

* Enemy AI
* Bosses
* Inventory systems
* Experience points
* Skill trees
* Story
* Dialogue
* Quests
* Crafting
* Multiplayer
* Procedural generation
* Cosmetic systems

These are future considerations and are intentionally excluded from the prototype.

---

# Working With Existing Code

When modifying code:

Prefer extending existing systems over replacing them.

Avoid introducing unnecessary abstraction.

Refactor when appropriate, but do not redesign working systems without strong justification.

Maintain readability for future AI agents.

---

# Definition of Success

Version 0.1 is successful if a player can load the game, enter a simple test level, and enjoy moving around for 20–30 minutes without needing additional mechanics.

That is the benchmark.

Everything else is secondary.

---

# Open Questions

These questions should be answered through playtesting rather than speculation:

* How much air control feels best?
* How forgiving should grapple attachment be?
* What rope stiffness feels satisfying?
* What bunny-hop timing window feels best?
* How many grapple nodes should players receive?
* How large should levels be?
* What amount of momentum should be preserved after landing?
* Should rope extension/retraction have acceleration or be instantaneous?
* How much camera smoothing feels comfortable?

Do not answer these questions by guessing.

Build systems that allow them to be explored efficiently.

---

# Final Reminder

This project is deliberately resisting feature creep.

A smaller game with incredible movement is preferred over a larger game with mediocre movement.

Every line of code should move the project toward discovering the most satisfying movement system possible.
