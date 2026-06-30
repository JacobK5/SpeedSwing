# 06-development-roadmap.md

# Development Roadmap

## Purpose

This document defines the planned development sequence for the project.

It is **not** intended to be a rigid schedule.

Instead, it identifies the major milestones, their goals, and the questions each phase is intended to answer.

Progression to the next phase should occur only after the current phase has been validated through playtesting.

---

# Guiding Philosophy

This project follows an iterative development process.

The order of development is intentional.

Each phase builds upon confidence gained in previous phases.

Avoid skipping ahead simply because later features seem exciting.

## Current status (2026-06-30)

Phases 0–2 are implemented. Phases 3 (Momentum) and 4 (Prototype Gameplay) have
also been **implemented in code**, but as a deliberate, time-boxed exception they
were built *ahead of* their playtesting gates. Their exit criteria — "players
discover advanced techniques" (Phase 3) and "players willingly replay to improve"
(Phase 4) — are therefore **not yet satisfied**: they require human playtesting,
which is the gating activity of Phase 5. All feel-sensitive values are configurable
so that tuning, not re-coding, closes the gap. See
[07-playtesting-notes.md](./07-playtesting-notes.md) for the open questions.

---

# Phase 0 — Foundation

## Goal

Create a stable technical foundation.

## Deliverables

* Project setup
* TypeScript
* Phaser
* Matter.js
* Build pipeline
* Basic scene management
* Configuration system
* Developer tuning panel
* JSON configuration loading

## Question

Can we iterate quickly?

## Exit Criteria

The project builds reliably.

Gameplay values can be modified without editing source code.

---

# Phase 1 — Movement Prototype

## Goal

Build the core movement sandbox.

## Deliverables

* Running
* Jumping
* Air control
* Gravity
* Camera
* Collision
* Placeholder level

## Question

Does moving around already feel good?

## Exit Criteria

Movement alone is enjoyable.

---

# Phase 2 — Grappling

## Goal

Introduce grappling.

## Deliverables

* Grapple nodes
* Rope simulation
* Attach
* Release
* Rope extension
* Rope retraction

## Question

Does grappling improve movement?

## Exit Criteria

Players naturally choose to use the grapple because it is enjoyable.

---

# Phase 3 — Momentum

## Goal

Refine movement depth.

## Deliverables

* Bunny-hop timing
* Landing preservation
* Rope tuning
* Swing tuning
* Recovery mechanics

## Question

Does mastering movement feel rewarding?

## Exit Criteria

Players begin discovering advanced techniques without being taught.

---

# Phase 4 — Prototype Gameplay

## Goal

Build the first real playable level.

## Deliverables

* Goal
* Timer
* Restart
* Destructible terrain
* No-node terrain
* Explosives
* Resource limits

## Question

Is the core gameplay loop fun?

## Exit Criteria

Players willingly replay levels to improve their time.

---

# Phase 5 — Internal Playtesting

## Goal

Validate the design.

## Activities

Repeated playtesting.

Physics tuning.

Level iteration.

Control refinement.

Observation.

## Question

What do players naturally attempt?

## Exit Criteria

Core movement feels polished.

No major mechanics require redesign.

---

# Phase 6 — Content Expansion

## Goal

Expand the game's design space.

Potential additions include:

* New surface types
* New movement interactions
* Additional level mechanics
* More difficult routing challenges

Nothing should be added unless it creates genuinely new decisions.

## Question

Can the game become deeper without becoming more complicated?

---

# Phase 7 — Production

## Goal

Create a complete game.

Potential work:

* Art
* Audio
* UI polish
* More levels
* Better menus
* Accessibility
* Performance optimization

Gameplay should already be largely finalized before entering this phase.

---

# Phase 8 — Release Preparation

## Goal

Prepare for public release.

Tasks include:

* Bug fixing
* Performance profiling
* Browser compatibility
* Save system (if required)
* Portal integration
* Documentation
* Marketing assets

---

# Phase 9 — Post Release

## Goal

Learn from real players.

Activities:

* Observe player behavior.
* Fix issues.
* Balance gameplay.
* Add carefully chosen features.
* Continue polishing movement.

Avoid reacting too quickly to isolated feedback.

Look for consistent patterns.

---

# Rules for Advancing Phases

A phase should only be considered complete when:

The core question has been answered.

The implementation is stable.

The system has been playtested.

The project is ready to build upon it.

Do not advance simply because code exists.

---

# Feature Requests

Whenever a new idea appears:

Ask:

Does it belong in the current phase?

If not:

Record it.

Return to the current objective.

Avoid interrupting progress for interesting distractions.

---

# Roadmap Philosophy

This roadmap is expected to evolve.

However, one principle should remain constant:

Movement quality comes before content quantity.

Every future feature should be built on a movement system that already feels exceptional.

---

# Success Criteria

The roadmap has succeeded if:

The project remains focused.

Feature creep is minimized.

Each milestone builds naturally on the previous one.

By release, the game feels cohesive because every major system was introduced intentionally rather than opportunistically.
