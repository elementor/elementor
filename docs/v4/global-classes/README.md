# Global Classes

> Status: draft

## Purpose

Document Elementor v4 **Global Classes** — kit-scoped, reusable CSS class definitions that atomic elements reference via the `classes` prop. Covers the data model, application rules, REST/MCP APIs, and how the PHP module pairs with the `editor-global-classes` JS package.

## Files

| File | Covers |
|------|--------|
| [overview.md](./overview.md) | What global classes are; experiment `e_classes`; disambiguation from `Classes_Prop_Type` |
| [data-model.md](./data-model.md) | CPT storage, items + order, labels vs internal ids, kit binding |
| [applying-classes.md](./applying-classes.md) | `classes` prop on elements, prepend order, cascade rules, MCP `classes` map |
| [api.md](./api.md) | REST CRUD, kit import/export, usage tracking, MCP `manage-classes` ability |

## Reading order

1. [overview.md](./overview.md) — start here for terminology and scope
2. [data-model.md](./data-model.md) — how classes are stored and keyed
3. [applying-classes.md](./applying-classes.md) — attaching classes to elements
4. [api.md](./api.md) — programmatic create/read/update/delete

## Related

- [../getting-started/experiments.md](../getting-started/experiments.md) — `e_classes` experiment matrix
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue shape used by `classes`
- [../fundamentals/style-schema.md](../fundamentals/style-schema.md) — style variant schema for class definitions
- [../atomic-widgets/overview.md](../atomic-widgets/overview.md) — atomic elements that expose the `classes` prop
- [../variables/usage-in-styles.md](../variables/usage-in-styles.md) — variables referenced inside global class CSS
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — agent workflow using `classes` map
- [../mcp/abilities/manage-classes.md](../mcp/abilities/manage-classes.md) — MCP ability reference
- [../editor-packages/core-packages.md](../editor-packages/core-packages.md) — `editor-global-classes` package snapshot
