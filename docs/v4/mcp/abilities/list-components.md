# list-components

> Audience: external  
> Module: `modules/mcp/abilities/list-components-ability.php`  
> Related: [build-composition.md](build-composition.md), [list-widget-schemas.md](list-widget-schemas.md), [manage-elements.md](manage-elements.md)

## What it is

Ability ID: **`elementor/list-components`**

Discovers reusable components and optional `overridable_props` schemas. Requires `e_components`. Permission: `edit_posts`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `List_Components_Ability` | `execute( array $input ): array` | List components; pass `component_ids` for schemas |
| Ability ID | `elementor/list-components` | Stable MCP host identifier |

Verified: `list-components-ability.php`.

## When to use it

- **Discovery** — call with no arguments to list every component (`id`, `name`, `uid`, `is_archived`) without schemas
- **Schema fetch** — call with `component_ids` for the components you will place via `<e-component>` in `build-composition`
- Before composing pages that embed saved components

For widget discovery, use [list-widget-schemas.md](list-widget-schemas.md). For placing components, see [build-composition.md](build-composition.md).

## Key concepts

### Input

| Field | Description |
|-------|-------------|
| `component_ids` | Optional integer array. Omit for summary list; include ids to fetch `overridable_props` schemas |

### Two-step workflow

1. List all components without schemas (no `component_ids`)
2. Request schemas only for components you will embed (`component_ids: [42, 87]`)

Requesting schemas for every component is wasteful on sites with many components.

### Output fields

| Field | Description |
|-------|-------------|
| `id` | Numeric post ID — use as `component_id` in `element_config` |
| `name` | Human-readable component title |
| `uid` | Stable string identifier |
| `is_archived` | Archived components must not be placed in new compositions |
| `overridable_props` | Present only when requested via `component_ids`; maps `override_key` → `{ label, group_id?, origin_prop_schema }` |

Override values use plain-value JSON Schema (no `$$type` envelopes), same convention as `get-widget-schema`.

## See also

- Static prompt reference: `modules/mcp/static-resources/abilities/list-components.md`
- [../composition-workflow.md](../composition-workflow.md) — recommended call order
