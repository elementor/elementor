# Components

> Status: draft

## Purpose

Reference for Elementor v4 reusable component documents — kit-scoped building blocks that can be placed on pages as instances, with overridable props and nested composition rules.

## Files

| File | Covers |
|------|--------|
| [overview.md](./overview.md) | What components are; experiment gate; editor package; Pro access tiers |
| [document-model.md](./document-model.md) | CPT `elementor_component`; document type; repository; REST API; meta keys |
| [instances-and-overrides.md](./instances-and-overrides.md) | `component-instance`, `overridable`, `override` prop types; transformers; instance editing panel |
| [nesting-rules.md](./nesting-rules.md) | Circular dependency validator; lock manager; nested element ID formatting; global classes on component docs |

## Reading order

1. [overview.md](./overview.md)
2. [document-model.md](./document-model.md)
3. [instances-and-overrides.md](./instances-and-overrides.md)
4. [nesting-rules.md](./nesting-rules.md) — internal contributors

## Related

- [../getting-started/experiments.md](../getting-started/experiments.md) — `e_components` experiment matrix
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue shape and overridable wrapping
- [../fundamentals/transformers.md](../fundamentals/transformers.md) — settings transformer registry
- [../global-classes/applying-classes.md](../global-classes/applying-classes.md) — `classes` prop on atomic elements
- [../architecture/packages-map.md](../architecture/packages-map.md) — PHP module ↔ JS package mapping
- [../mcp/abilities/README.md](../mcp/abilities/README.md) — MCP abilities (no component-specific ability; use REST)
