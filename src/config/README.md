# Gameplay Configuration

Every tunable gameplay value lives here as JSON, **not** in source code
(AGENTS.md "Configuration First"; DECISIONS.md #004). Systems read these values
at runtime so movement can be tuned without recompiling.

## Files

| File            | Category | Purpose                                                        |
| --------------- | -------- | -------------------------------------------------------------- |
| `physics.json`  | Physics  | World gravity and the player Matter body's material properties |
| `movement.json` | Movement | Run/jump/air-control feel (highest-priority tuning surface)    |
| `grapple.json`  | Grapple  | Grapple projectile, rope simulation, attach forgiveness        |
| `camera.json`   | Camera   | Smooth-follow camera behaviour                                 |
| `debug.json`    | Debug    | Developer debug-visualisation toggles                          |
| `surfaces.json` | Surfaces | Terrain surface-type table (colour + collision/node rules)     |

The full meaning, units and expected range of every value is documented inline
as JSDoc in [`types.ts`](./types.ts). Canonical defaults live in
[`defaults.ts`](./defaults.ts) and are the "restore defaults" baseline.

## How loading works

`loadConfig.ts` imports the JSON and passes it through `resolveConfig.ts`, which
merges each file over its defaults and validates types. Invalid or missing
values fall back to the default and emit a `console.warn` — a bad edit degrades
gracefully instead of crashing the game.

`resolveConfig` is pure (no Phaser, no I/O) and unit tested in
`resolveConfig.test.ts`.

## Editing

During `npm run dev`, editing any JSON file hot-reloads the game. Keep the field
set in sync with `types.ts`/`defaults.ts`; unknown keys are ignored with a
warning.

> A live in-game tuning panel (sliders + save/load) is planned but intentionally
> deferred — see the handoff notes. This config layout is the foundation it will
> build on.
