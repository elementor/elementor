# Component instances and overrides

> Audience: both
> Module: `modules/components/prop-types/`, `modules/components/transformers/`, `packages/packages/core/editor-components/`
> Status: draft
> Related: [document-model.md](./document-model.md), [../fundamentals/prop-value.md](../fundamentals/prop-value.md), [../fundamentals/transformers.md](../fundamentals/transformers.md)

## What it is

A **component instance** is an `e-component` widget whose sole settings prop is `component_instance` — a `component-instance` PropValue referencing a component document and optional per-instance overrides. Overrides target **overridable** props defined on the source component's inner elements.

## When to use it

- Author or parse instance JSON in templates, MCP compositions, or migrations.
- Understand how exposed props flow from component definition → instance override → rendered output.
- Build tooling that reads/writes override values without detaching the instance.

## Key concepts

### Prop type keys

| `$$type` | PHP class | Shape |
|----------|-----------|-------|
| `component-instance` | `Component_Instance_Prop_Type` | `{ component_id, overrides? }` |
| `overridable` | `Overridable_Prop_Type` | `{ override_key, origin_value }` |
| `override` | `Override_Prop_Type` | `{ override_key, override_value, schema_source }` |
| `overrides` | `Overrides_Prop_Type` | Array of `override` items (`define_item_type`); `overridable` entries are also accepted in validation/sanitization for nested component-in-component overrides |

### Example: instance with one override

```json
{
  "component_instance": {
    "$$type": "component-instance",
    "value": {
      "component_id": { "$$type": "number", "value": 42 },
      "overrides": {
        "$$type": "overrides",
        "value": [
          {
            "$$type": "override",
            "value": {
              "override_key": "hero-heading",
              "override_value": { "$$type": "string", "value": "Summer Sale" },
              "schema_source": { "type": "component", "id": 42 }
            }
          }
        ]
      }
    }
  }
}
```

Use **labels** (e.g. `hero-heading`) as `override_key` values in author-facing examples — these are the sanitized keys from the component's overridable-props metadata.

### Overridable wrapping

`Overridable_Schema_Extender` hooks `elementor/atomic-widgets/props-schema` and wraps every eligible atomic prop type with an `overridable` union. Props can opt out via `Overridable_Prop_Type::ignore()` meta (the `component_instance` prop itself uses this). The `classes` prop is also excluded.

On the component document, inner element settings store the `overridable` wrapper; the document-level `_elementor_component_overridable_props` meta holds the registry (override key, label, element id, origin value, optional group).

### Override schema source

`Override_Prop_Type` validates `schema_source.type`. Resolution is a **hardcoded switch** in `Override_Prop_Type::get_parser()` — only `component` maps to `Component_Override_Parser::get_override_type()`. The parser resolves the override value's prop type from the component's overridable-props metadata via `Parsing_Utils::get_prop_type()`. All `schema_source.id` values must match the parent instance's `component_id`.

### Settings transformers

Registered on `elementor/atomic-widgets/settings/transformers/register`:

| Key | Transformer | Role |
|-----|-------------|------|
| `component-instance` | `Component_Instance_Transformer` | Loads component document, formats inner element IDs, renders HTML |
| `overridable` | `Overridable_Transformer` | Applies matching override from render context by `override_key` |
| `override` | `Override_Transformer` | Passes through `override_key` + `override_value` |

The `Component_Instance` widget sets render context for `Overridable_Transformer` with merged overrides from the instance's `overrides` array. A rendering stack in `Component_Instance_Transformer` prevents circular references at render time.

JS mirrors these registrations in `editor-components/src/init.ts` via `settingsTransformersRegistry`.

### Override UI

When a user selects a component instance on the canvas, the default editing panel is replaced by `InstanceEditingPanel` (`registerEditingPanelReplacement`, condition: `elementType.key === 'e-component'`).

The panel reads overridable props from the component document (via REST `overridable-props` or store) and renders an `OverridePropControl` per exposed prop. Each control:

1. Resolves the origin prop type from the overridable metadata.
2. Renders the matching atomic control for the override value.
3. Writes changes back to `component_instance.overrides`.

Users can **detach** an instance (context menu or panel action), which expands the component's inner elements inline and resolves overrides into local settings.

## Extension

To prevent a custom atomic prop from being overridable, add meta when defining the prop type:

```php
String_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() )
```

There is no public hook or registry to register additional `schema_source` types — extend `Override_Prop_Type::get_parser()` internally to add a new parser class extending `Override_Parser`.

## Internals

- **Nested overrides:** when an overridable's `origin_value` is itself an `override` PropValue (component-inside-component), `Overridable_Transformer` delegates to `Override_Transformer` for the inner key while applying the outer override value.
- **Sanitization:** `Overrides_Prop_Type::sanitize_value()` filters out null override values and stale keys whose overridable prop was removed from the source component.
- **LLM schema:** `Overridable_LLM_Filter` hooks `elementor/atomic-widgets/llm-json-schema` to expose overridable fields in exported schemas.

## See also

- [document-model.md](./document-model.md) — overridable-props meta storage
- [nesting-rules.md](./nesting-rules.md) — nested instance ID formatting
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md) — prop type taxonomy
- [../global-classes/applying-classes.md](../global-classes/applying-classes.md) — `classes` prop (excluded from overridable wrapping)
- [../mcp/abilities/get-widget-schema.md](../mcp/abilities/get-widget-schema.md) — widget schema ability (`e-component` excluded)
