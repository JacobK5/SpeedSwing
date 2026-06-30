# 10-level-editor.md

# Developer Level Editor (dev-only)

A minimal greybox editor for authoring/iterating levels in the existing JSON
format ([05-level-format.md](./05-level-format.md)). It is a **development tool
only** — not a player-facing feature — and is approved as optional tooling in
[DECISIONS.md](../DECISIONS.md) #015. Keep it simple; it must never grow into a
production editor.

## Opening it

In a dev build (`npm run dev`), append the `?editor` flag to the URL:

```
http://localhost:5173/?editor
```

It is unreachable from release builds' normal flow (gated behind
`import.meta.env.DEV` in `BootScene`).

## Controls

| Action            | Input                                              |
| ----------------- | -------------------------------------------------- |
| New rectangle     | Left-drag on empty space                           |
| Select rectangle  | Left-click a rectangle                             |
| Move rectangle    | Drag a selected rectangle's body                   |
| Resize rectangle  | Drag the bottom-right handle of a selected rect    |
| Delete rectangle  | `Delete` / `Backspace` (with one selected)         |
| Surface type      | `1` standard, `2` no-node, `3` destructible, `4` killzone (also the panel buttons) |
| Grid snap size    | `[` smaller, `]` larger (0 = off)                  |
| Move goal         | `G` (places at cursor)                             |
| Move spawn        | `P` (places at cursor)                             |
| Pan camera        | Right-drag                                          |
| Zoom              | Mouse wheel                                         |
| Exit to title     | `Esc`                                               |

## Panel (left side)

- Surface buttons, grid size, level **name**, and starting **resources**
  (grapple nodes / explosives).
- **New** — blank level. **Validate** — runs the level validator and reports the
  first error. **Copy JSON** — writes the level JSON to the textarea and clipboard.
  **Play** — validates then test-plays the level (Esc on the run-complete screen
  returns to the editor).
- **Load level** — load a level from the registry to edit. **Load JSON** — parse
  and validate the JSON in the textarea, replacing the current level.

## Workflow

1. Build geometry by dragging rectangles; pick surfaces with `1`–`4`.
2. Set spawn (`P`) and goal (`G`); set resources in the panel.
3. **Validate**, then **Play** to feel it.
4. **Copy JSON** and paste into a new file under `src/levels/`, then register it
   in `src/levels/loadLevel.ts` to ship it.

The edited level is kept in `sessionStorage` across a test-play round-trip so you
don't lose work when you hit **Play**.

## Scope guardrails

- Reuses the level format and `validateLevel`; it does not invent fields.
- Dev-only; pure model logic lives in `src/editor/editorModel.ts` (unit tested).
- The canvas interaction is not playtest-validated — verify in a browser.
