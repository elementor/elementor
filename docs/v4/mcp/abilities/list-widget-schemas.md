# list-widget-schemas

> Audience: external  
> Module: `modules/mcp/abilities/list-widget-schemas-ability.php`  
> Status: final  
> Related: [get-widget-schema.md](get-widget-schema.md), [build-composition.md](build-composition.md)

## What it is

Ability ID: **`elementor/list-widget-schemas`**

Discovers v4 atomic widgets eligible for LLM authoring. Returns either lightweight summaries or full schemas for every v4 widget.

Annotations: `readonly: true`, `idempotent: true`, `destructive: false`.  
Permission: `edit_posts`.

## When to use it

- **First pass discovery** — call with `summary: true` to list available v4 widget types and descriptions
- **Bulk schema fetch** — call without `summary` (or `summary: false`) to get full schemas for all v4 widgets (heavier payload)
- Before `build-composition` when you need to know valid container/child types

For a single widget's full schema, prefer [get-widget-schema.md](get-widget-schema.md) — smaller and always current.

## Key concepts

### Input

| Field | Default | Description |
|-------|---------|-------------|
| `summary` | `false` | When `true`, return `{ type, description }[]` only |

### Output — summary mode (`summary: true`)

```json
{
  "widgets": [
    { "type": "e-heading", "description": "Heading widget" },
    { "type": "e-flexbox", "description": "Flexbox container" }
  ]
}
```

### Output — full mode (`summary: false`)

Object keyed by widget type:

```json
{
  "e-heading": { "type": "object", "properties": { }, "llm_guidance": { } },
  "e-flexbox": { "type": "object", "properties": { }, "llm_guidance": { } }
}
```

Same shape as `get-widget-schema` per widget, including `llm_guidance`.

### v4 filter

Only widgets where `Widget_Context_Helper::get_widget_version()` returns `v4` (has `atomic_props_schema`). v3-only widgets are excluded from this list.

Eligibility also requires `meta.llm_support !== false` and excludes the Component widget by title.

## Extension

N/A — discovery ability. New v4 widgets appear automatically when registered with `llm_support` and an atomic props schema.

## Internals

- Filters `Widget_Context_Helper::get_llm_eligible_widgets()` to v4 only
- `build_summaries()` → `build_widget_summary()` per widget
- `build_schemas()` → shared `build_parents_index()` for nesting guidance across all widgets

## See also

- [get-widget-schema.md](get-widget-schema.md) — single-widget schema (preferred for composition)
- [../../atomic-widgets/elements-catalog.md](../../atomic-widgets/elements-catalog.md) — snapshot catalog (secondary)
- [../composition-workflow.md](../composition-workflow.md) — step 5 in workflow
