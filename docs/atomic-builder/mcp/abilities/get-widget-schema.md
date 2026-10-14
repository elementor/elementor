# get-widget-schemas

> Audience: external  
> Module: `modules/mcp/abilities/get-widget-schema-ability.php`  
> Related: [list-widget-schemas.md](list-widget-schemas.md), [build-composition.md](build-composition.md), [../../atomic-widgets/elements-catalog.md](../../atomic-widgets/elements-catalog.md)

## What it is

Ability ID: **`elementor/get-widget-schemas`**

Live JSON schemas for the requested widget types, returned in one call — source of truth for `element_config`. Permission: `edit_posts`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Get_Widget_Schema_Ability` | `execute( array $input ): array\|\WP_Error` | Returns `{ schemas, errors }` keyed by widget type |
| Ability ID | `elementor/get-widget-schemas` | Stable MCP host identifier |

Verified: `get-widget-schema-ability.php`.

## When to use it

- Before building `element_config` for a widget type in `build-composition`
- To check nesting rules (`allowed_child_types`, `required_direct_children`)
- To see which props accept dynamic tag bindings

Pass every type in the composition as one `widget_type` array, including containers. For discovery of available types, use [list-widget-schemas.md](list-widget-schemas.md) first.

## Key concepts

### Input

| Field | Required | Description |
|-------|----------|-------------|
| `widget_type` | yes | Array of registry identifiers, e.g. `["e-heading", "e-flexbox"]`. A single string is also accepted and treated as a one-item array. |

### Output

```json
{
  "schemas": {
    "e-heading": { }
  },
  "errors": {
    "missing-type": {
      "code": "elementor_not_found",
      "message": "Unknown widget type: missing-type."
    }
  }
}
```

`errors` is present even when empty. One failing type does not fail the call. The parents index is built once per call, then reused for every v4 type.

### Schema (v4 atomic widget)

For widgets with `atomic_props_schema`, each value in `schemas` looks like:

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

`invalid_input` fails the whole call as a `WP_Error`: missing `widget_type`, a value that is neither an array nor a string, an empty array, or a non-string item.

The rest are per type, under `errors` with `code` and `message`, and the valid schemas still come back:

- `elementor_not_found` — unknown type or widget with `meta.llm_support: false`
- `elementor_v3_not_supported` — legacy V3 widget that is not allowlisted

## Extension

Widget authors enable LLM support via widget config `meta.llm_support` and `define_props_schema()`. Schema filters: `elementor/atomic-widgets/llm-json-schema`. See [../../atomic-widgets/hooks.md](../../atomic-widgets/hooks.md).

## Internals

- `Widget_Context_Helper::get_widget_config()` → `build_widget_schema()`
- `build_parents_index()` runs once per call and is reused for every type
- Eligibility: `is_widget_eligible_for_llm()` checks `llm_support`, excludes Component widget title
- Properties converted via `Plain_Llm_Schema_Converter` for agent-friendly plain schemas

## See also

- [list-widget-schemas.md](list-widget-schemas.md) — bulk discovery
- [build-composition.md](build-composition.md) — consumes this schema
- [../../fundamentals/prop-types.md](../../fundamentals/prop-types.md) — prop type taxonomy
