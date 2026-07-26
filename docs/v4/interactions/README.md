# Interactions

> Status: draft

## Purpose

Reference for Elementor v4 element interactions — motion and animation attached to atomic elements via triggers, effects, timing, and breakpoint rules. Covers the PHP module, interactions schema, editor package, and frontend runtime.

## Files

| File | Covers |
|------|--------|
| [overview.md](./overview.md) | What interactions are; experiment `e_interactions`; module ↔ package map |
| [schema.md](./schema.md) | `Interactions_Schema`; triggers, effects, presets, timing, breakpoints; extension filter |
| [editor.md](./editor.md) | `editor-interactions` package; interactions tab; controls registry; MCP registration |
| [frontend.md](./frontend.md) | Motion.js; `Interactions_Frontend_Handler`; postmeta cache; collector |

## Reading order

1. [overview.md](./overview.md) — start here for scope and experiment gates
2. [schema.md](./schema.md) — data model and extension point
3. [editor.md](./editor.md) — editor UI and controls (internal)
4. [frontend.md](./frontend.md) — runtime pipeline (internal)

## Related

- [../getting-started/experiments.md](../getting-started/experiments.md) — experiment matrix including `e_interactions`
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue shape used by interaction items
- [../architecture/packages-map.md](../architecture/packages-map.md) — PHP module ↔ JS package mapping
- [../editor-packages/core-packages.md](../editor-packages/core-packages.md) — `editor-interactions` in the v4 package snapshot
- [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md) — `getMCPByDomain` registration API
