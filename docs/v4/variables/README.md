# Variables

> Status: final

## Purpose

Reference for v4 **global variables** — kit-scoped design tokens (colors, fonts, sizes) used in atomic styles and exposed to agents via REST and MCP.

## Files

| File | Covers |
|------|--------|
| [overview.md](./overview.md) | Design tokens, experiments, kit storage, CSS output |
| [types.md](./types.md) | Registering variable types (`Variable_Types_Registry`, `elementor/variables/register`) |
| [usage-in-styles.md](./usage-in-styles.md) | `var(--label)` in raw CSS, longhand, `custom_css` caveat |
| [usage-in-props.md](./usage-in-props.md) | PropValue bindings (`global-*-variable`) |
| [api.md](./api.md) | REST, kit export, MCP abilities and resources |

## Reading order

1. [overview.md](./overview.md)
2. [types.md](./types.md)
3. [usage-in-props.md](./usage-in-props.md)
4. [usage-in-styles.md](./usage-in-styles.md)
5. [api.md](./api.md) — integrators and agents

## Related

- [../getting-started/experiments.md](../getting-started/experiments.md) — `e_variables`, `e_variables_manager`
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue shape
- [../fundamentals/style-schema.md](../fundamentals/style-schema.md) — style keys that accept variable unions
- [../fundamentals/transformers.md](../fundamentals/transformers.md) — `Global_Variable_Transformer`
- [../global-classes/applying-classes.md](../global-classes/applying-classes.md) — classes can reference variables in styles
- [../css-converter/overview.md](../css-converter/overview.md) — promotes `var(--label)` to PropValues
- [../mcp/abilities/manage-global-variable.md](../mcp/abilities/manage-global-variable.md) — MCP CRUD ability
- [../editor-packages/core-packages.md](../editor-packages/core-packages.md) — `editor-variables` package
