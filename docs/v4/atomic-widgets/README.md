# Atomic widgets

> Status: draft

## Purpose

Reference for the `modules/atomic-widgets/` PHP module and its built-in v4 elements — layout containers, content widgets, rendering, and extension hooks. Start with [authoring-widgets.md](authoring-widgets.md) for how to register new types; use [elements-catalog.md](elements-catalog.md) only as a snapshot lookup.

## Files

| File | Covers |
|------|--------|
| [overview.md](overview.md) | Module role, `e_atomic_elements` experiment, widget vs element, built-in summary |
| [authoring-widgets.md](authoring-widgets.md) | **Primary** — extend bases, props schema, controls, registration |
| [elements-catalog.md](elements-catalog.md) | Snapshot table of built-in types, nesting rules, `llm_guidance` |
| [rendering.md](rendering.md) | Twig templates, prop resolution, CSS output (internal) |
| [hooks.md](hooks.md) | `elementor/atomic-widgets/*` filters and actions |

## Reading order

1. [overview.md](overview.md)
2. [authoring-widgets.md](authoring-widgets.md)
3. [elements-catalog.md](elements-catalog.md) — snapshot only; prefer MCP `get-widget-schema` for live schemas
4. [hooks.md](hooks.md) — when extending schemas, transformers, or styles
5. [rendering.md](rendering.md) — when debugging frontend output

## Related

- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue shape
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md) — prop type taxonomy
- [../fundamentals/transformers.md](../fundamentals/transformers.md) — transformer registry contexts
- [../global-classes/applying-classes.md](../global-classes/applying-classes.md) — `classes` prop
- [../getting-started/experiments.md](../getting-started/experiments.md) — `e_atomic_elements` gate
- [../architecture/packages-map.md](../architecture/packages-map.md) — PHP ↔ JS package mapping
- [../mcp/abilities/get-widget-schema.md](../mcp/abilities/get-widget-schema.md) — live widget JSON schema
