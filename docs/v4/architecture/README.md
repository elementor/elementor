# Architecture

> Status: draft

## Purpose

Map how Elementor v4 PHP modules, Editor V2 JS packages, and frontend rendering connect — the starting point for internal contributors and anyone tracing a feature across the stack.

## Files

| File | Covers |
|------|--------|
| [overview.md](overview.md) | High-level diagram; experiment gates; PHP ↔ JS ↔ frontend |
| [data-flow.md](data-flow.md) | Edit → save → resolve → CSS → frontend; REST/MCP paths |
| [packages-map.md](packages-map.md) | Docs area → PHP path → JS package → tests |

## Reading order

1. [overview.md](overview.md) — start here for the big picture
2. [packages-map.md](packages-map.md) — lookup table when you know the feature area
3. [data-flow.md](data-flow.md) — deep dive on persistence and rendering

## Related

- [../README.md](../README.md) — global index
- [../getting-started/experiments.md](../getting-started/experiments.md) — what gates each module
- [../editor-packages/overview.md](../editor-packages/overview.md) — micro-frontend details (planned)
- `packages/docs/architecture.md` — Editor V2 architecture source doc
