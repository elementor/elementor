# Dynamic tags

> Status: draft

## Purpose

Reference for binding legacy Elementor dynamic tags to atomic (v4) PropValues, discovering available tags via MCP, and extending the tag registry for custom plugins.

## Files

| File | Covers |
|------|--------|
| [overview.md](./overview.md) | v3 `modules/dynamic-tags/` vs v4 bridge in `modules/atomic-widgets/dynamic-tags/` |
| [binding-propvalues.md](./binding-propvalues.md) | `{ $$type: dynamic }` shape; `name` + `settings`; no author-facing `group` field |
| [discovery.md](./discovery.md) | MCP `list-dynamic-tags` ability and `elementor://dynamic-tags` resource |
| [extending.md](./extending.md) | Register a legacy tag and map it to atomic props via `Dynamic_Prop_Types_Mapping` |

## Reading order

1. [overview.md](./overview.md) — understand the two-layer architecture
2. [binding-propvalues.md](./binding-propvalues.md) — how dynamic values appear in element JSON
3. [discovery.md](./discovery.md) — look up tag names and settings schemas (agents/integrators)
4. [extending.md](./extending.md) — add a new tag from a plugin

## Related

- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue contract (`$$type`, `value`, `disabled`)
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md) — prop type taxonomy and unions
- [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md) — define props schemas on atomic widgets
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — using dynamics in MCP composition
- [../mcp/resources.md](../mcp/resources.md) — v4 MCP resource URI catalog (includes `elementor://dynamic-tags`)
