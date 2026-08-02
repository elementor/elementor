# CSS Converter

> Status: final

## Purpose

Reference for the CSS-to-PropValue pipeline in `modules/atomic-widgets/css-converter/`. Converts raw CSS declarations (from users, LLMs, or REST/MCP callers) into atomic style props that can be deep-merged into the v4 style tree.

## Files

| File | Covers |
|------|--------|
| [overview.md](./overview.md) | Entry point, return shape, REST endpoint, MCP `Style_Applier` usage |
| [pipeline.md](./pipeline.md) | Internal conversion stages: parse through `cleanup_props` |
| [extension.md](./extension.md) | Expanders, converters, null/reset semantics, `covered_properties()` |

## Reading order

1. [overview.md](./overview.md) — what the converter does and how to call it
2. [pipeline.md](./pipeline.md) — stage-by-stage internals (contributors)
3. [extension.md](./extension.md) — how to add shorthand expanders and property converters

## Related

- [../fundamentals/style-schema.md](../fundamentals/style-schema.md) — canonical style prop keys the converter targets
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue shape in `props`
- [../variables/usage-in-styles.md](../variables/usage-in-styles.md) — `var(--label)` conventions and variable resolution
- [../mcp/abilities/manage-elements.md](../mcp/abilities/manage-elements.md) — MCP ability that applies styles via the converter
- [../mcp/abilities/manage-classes.md](../mcp/abilities/manage-classes.md) — global-class variant CSS via the same converter
