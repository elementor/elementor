# get-widget-schema

> Audience: external  
> Module: `modules/mcp/abilities/get-widget-schema-ability.php`  
> Status: draft  
> Related: [list-widget-schemas.md](list-widget-schemas.md), [build-composition.md](build-composition.md), [../../atomic-widgets/elements-catalog.md](../../atomic-widgets/elements-catalog.md)

## What it is

Ability ID: **`elementor/get-widget-schema`**

Returns the live JSON schema for a single widget or element type, including property definitions and `llm_guidance` for agent authoring. This is the **source of truth** for `element_config` in `build-composition` — do not rely on static catalog dumps.

Annotations: `readonly: true`, `idempotent: true`, `destructive: false`.  
Permission: `edit_posts`.

## When to use it

- Before building `element_config` for a widget type in `build-composition`
- To check nesting rules (`allowed_child_types`, `required_direct_children`)
- To see which props accept dynamic tag bindings

Call once per widget type in your composition. For discovery of available types, use [list-widget-schemas.md](list-widget-schemas.md) first.

## Key concepts

### Input

| Field | Required | Description |
|-------|----------|-------------|
| `widget_type` | yes | Registry identifier, e.g. `e-heading`, `e-flexbox` |

### Output (v4 atomic widget)

For widgets with `atomic_props_schema`:

```json
{
  "type": "object",
  "properties": { /* prop key → JSON schema */ },
  "description": "Widget description from meta",
  "llm_guidance": {
    "can_have_children": true,
    "instructions": "...",
    "default_styles": { },
    "default_settings": { },
    "nesting": {
      "allowed_child_types": ["e-heading", "e-button"],
      "allowed_parents": ["e-flexbox", "document"]
    },
    "required_direct_children": ["e-tab-content"]
  }
}
```

### `llm_guidance` fields

Built by `Llm_Guidance_Builder` from widget config:

| Field | Meaning |
|-------|---------|
| `can_have_children` | Whether the widget is a container (`meta.is_container`) |
| `instructions` | When to omit `default_styles` / `default_settings` from `element_config` |
| `default_styles` | CSS map of base styles — override only when needed |
| `default_settings` | Base settings — omit from `element_config` unless user requests change |
| `nesting.allowed_child_types` | Valid child widget types |
| `nesting.allowed_parents` | Valid parent types (from parents index) |
| `required_direct_children` | Child types that must appear as direct XML children |

Props in `NON_CONFIGURABLE_PROP_KEYS` (`classes`, `attributes`, etc.) are excluded unless `llm_configurable` meta is set. Base settings props get a hint in their schema description.

### v3 fallback

Widgets without `atomic_props_schema` but with legacy controls return:

```json
{
  "widget_version": "v3",
  "message": "This widget exists in the editor but has no atomic props schema (V4)...",
  "fields_note": "All settings are optional...",
  "properties": { /* control_metadata hints */ }
}
```

`build-composition` targets v4 elements; v3 fallback is informational.

### Errors

- `invalid_input` — missing `widget_type`
- `elementor_not_found` — unknown type or widget with `meta.llm_support: false`

## Extension

Widget authors enable LLM support via widget config `meta.llm_support` and `define_props_schema()`. Schema filters: `elementor/atomic-widgets/llm-json-schema`. See [../../atomic-widgets/hooks.md](../../atomic-widgets/hooks.md).

## Internals

- `Widget_Context_Helper::get_widget_config()` → `build_widget_schema()`
- Eligibility: `is_widget_eligible_for_llm()` checks `llm_support`, excludes Component widget title
- Properties converted via `Plain_Llm_Schema_Converter` for agent-friendly plain schemas

## See also

- [list-widget-schemas.md](list-widget-schemas.md) — bulk discovery
- [build-composition.md](build-composition.md) — consumes this schema
- [../../fundamentals/prop-types.md](../../fundamentals/prop-types.md) — prop type taxonomy
