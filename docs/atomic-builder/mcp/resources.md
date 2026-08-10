# MCP resources (v4)

> Audience: external  
> Module: `modules/mcp/abilities/*-resource-ability.php`, `packages/packages/core/editor-canvas/src/mcp/resources/`  
> Related: [overview.md](overview.md), [abilities/README.md](abilities/README.md), [../dynamic-tags/discovery.md](../dynamic-tags/discovery.md)

## What it is

Read-only MCP URIs agents fetch before mutating data. Resources are read by URI; abilities are invoked by ID with input.

## Public API

| URI | Ability ID | MIME | Source class |
|-----|------------|------|--------------|
| `elementor://global-classes` | `elementor/global-classes-resource` | `application/json` | `Global_Classes_Resource_Ability` |
| `elementor://global-variables` | `elementor/global-variables-resource` | `application/json` | `Global_Variables_Resource_Ability` |
| `elementor://style/best-practices` | `elementor/style-best-practices` | `text/markdown` | `Style_Best_Practices_Ability` |
| `elementor://wordpress/best-practices` | `elementor/wordpress-best-practices` | `text/markdown` | `Wordpress_Best_Practices_Ability` |
| `elementor://interactions/schema` | `elementor/interactions-schema-resource` | `application/json` | `Interactions_Schema_Resource_Ability` |
| `elementor://dynamic-tags` | *(JS only)* | `application/json` | `dynamic-tags-resource.ts` |
| `elementor://variables/tools/manage-global-variable-guide` | `elementor/manage-global-variable-guide` | `text/plain` | `Manage_Variable_Guide_Ability` |

All PHP resource abilities extend `Abstract_Ability` → `register()` + `execute()` returning string content.

Verified: `*-resource-ability.php`, `style-best-practices-ability.php`, `manage-variable-guide-ability.php`.

## When to use it

Read **before** styling or composing:

1. `elementor://global-variables`
2. `elementor://global-classes`
3. `elementor://dynamic-tags` (when using dynamic values)
4. `elementor://style/best-practices` (design context)

External hosts: `elementor/read-resource` with URI. In-editor: `resource()` on MCP domain or WebMCP `editor-resource-getter`.

## Key concepts

### Label vs internal id

Resources expose **labels** for author-facing references. Do not use internal prefixes (`g-*`, `e-gv-*`) in `classes` maps or `var(--...)` sent to abilities.

- Classes: labels from `elementor://global-classes`
- Variables: `var(--label)` from `elementor://global-variables`

### Payload shapes

| URI | Payload |
|-----|---------|
| `global-classes` | `{ priority_description, classes }`, where `classes` is an ordered `[{ id, label }]` list from highest to lowest CSS priority |
| `global-variables` | `{ variables, total, watermark }` |
| `style/best-practices` | Markdown from `static-resources/style/best-practices.md` |
| `wordpress/best-practices` | Markdown from `static-resources/wordpress/best-practices.md` |
| `interactions/schema` | LLM JSON Schema for interaction items |
| `dynamic-tags` | `[{ name, label, categories, settings }]` via `list-dynamic-tags` proxy |

Cache `watermark` from global-variables to detect stale reads.

For global classes, the earliest class in `classes` wins when multiple classes on the same element set the same CSS property. Use `elementor/reorder-classes` to change this order.

## Extension

**In-editor:** `resource()` on `MCPRegistryEntry` — see [registering-editor-tools.md](registering-editor-tools.md).

## Internals

`Read_Resource_Ability` maps URIs to executors. `elementor://dynamic-tags` is editor-only (not in PHP executor map).

## See also

- [design-guidance.md](design-guidance.md)
- [composition-workflow.md](composition-workflow.md)
