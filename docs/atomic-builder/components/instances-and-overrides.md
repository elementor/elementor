# Component instances and overrides

> Audience: both
> Module: `modules/components/prop-types/`, `modules/components/transformers/`, `packages/packages/core/editor-components/`
> Related: [document-model.md](./document-model.md), [../fundamentals/prop-value.md](../fundamentals/prop-value.md), [../fundamentals/transformers.md](../fundamentals/transformers.md)

## What it is

A **component instance** is an `e-component` widget whose settings prop `component_instance` is a `component-instance` PropValue referencing a component document and optional overrides.

## When to use it

- Author or parse instance JSON in templates, MCP, or migrations.
- Understand how exposed props flow: definition → override → rendered output.
- Build tooling that reads/writes overrides without detaching.

## Key concepts

### Prop type keys

| `$$type` | PHP class | Shape |
|----------|-----------|-------|
| `component-instance` | `Component_Instance_Prop_Type` | `{ component_id, overrides? }` |
| `overridable` | `Overridable_Prop_Type` | `{ override_key, origin_value }` |
| `override` | `Override_Prop_Type` | `{ override_key, override_value, schema_source }` |
| `overrides` | `Overrides_Prop_Type` | Array of `override` items |

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

Use **labels** (e.g. `hero-heading`) as `override_key` — sanitized keys from overridable-props metadata.

### Overridable wrapping

`Overridable_Schema_Extender` hooks `elementor/atomic-widgets/props-schema` and wraps eligible atomic props with an `overridable` union. Opt out via `Overridable_Prop_Type::ignore()` meta (`component_instance` and `classes` use this).

Document-level `_elementor_component_overridable_props` meta holds the registry (key, label, element id, origin value, group).

### Override schema source

`Override_Prop_Type::get_parser()` maps only `schema_source.type === 'component'` to `Component_Override_Parser`. All `schema_source.id` values must match the instance's `component_id`.

### Settings transformers

Registered on `elementor/atomic-widgets/settings/transformers/register`:

| Key | Transformer | Role |
|-----|-------------|------|
| `component-instance` | `Component_Instance_Transformer` | Load document, format IDs, render HTML |
| `overridable` | `Overridable_Transformer` | Apply override from render context by `override_key` |
| `override` | `Override_Transformer` | Pass through key + value |

`Component_Instance` widget sets render context for `Overridable_Transformer`. `Component_Instance_Transformer` maintains a rendering stack to prevent circular references.

JS mirrors registrations in `editor-components/src/init.ts`.

### Override UI

Selecting an instance replaces the default editing panel with `InstanceEditingPanel` (`registerEditingPanelReplacement`, condition: `elementType.key === 'e-component'`).

Panel reads overridable props via REST or store, renders `OverridePropControl` per exposed prop. **Detach** expands inner elements inline and resolves overrides into local settings.

## Extension

Prevent overridable wrapping:

```php
String_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() )
```

No public hook for additional `schema_source` types — extend `Override_Prop_Type::get_parser()` internally.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Component_Instance_Prop_Type` | `::get_key()` → `'component-instance'` | Instance prop shape | `prop-types/component-instance-prop-type.php` |
| `Overridable_Prop_Type` | `::get_key()` → `'overridable'`, `::ignore()` | Overridable wrapper | `prop-types/overridable-prop-type.php` |
| `Override_Prop_Type` | `::get_key()` → `'override'` | Single override item | `prop-types/override-prop-type.php` |
| `Overrides_Prop_Type` | `::get_key()` → `'overrides'` | Override array | `prop-types/overrides-prop-type.php` |
| `Component_Instance_Transformer` | `transform( $value, $context )` | Render instance HTML | `transformers/component-instance-transformer.php` |
| `Overridable_Transformer` | `transform( $value, $context )` | Apply override by key | `transformers/overridable-transformer.php` |
| `Override_Transformer` | `transform( $value, $context )` | Pass through override | `transformers/override-transformer.php` |
| `Overridable_Schema_Extender` | `::make()` | Wrap props as overridable | `overridable-schema-extender.php` |
| `componentInstancePropTypeUtil` | prop-type util | JS instance prop helpers | `editor-components/src/prop-types/component-instance-prop-type.ts` |
| `resolveOverridePropValue` | `( override, overridableProps )` | Resolve override value | `editor-components/src/utils/resolve-override-prop-value.ts` |
| `getPropTypeForComponentOverride` | `( overrideKey, … )` | Resolve override prop type | `editor-components/src/utils/get-prop-type-for-component-override.ts` |
| `updateOverridableProp` | action | Update overridable in store | `editor-components/src/store/actions/update-overridable-prop.ts` |

## Internals

- **Nested overrides** — `Overridable_Transformer` delegates to `Override_Transformer` for component-inside-component chains.
- **Sanitization** — `Overrides_Prop_Type::sanitize_value()` drops null values and stale keys.
- **LLM schema** — `Overridable_LLM_Filter` on `elementor/atomic-widgets/llm-json-schema`.

## See also

- [document-model.md](./document-model.md) — overridable-props meta
- [nesting-rules.md](./nesting-rules.md) — nested instance ID formatting
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md) — prop type taxonomy
- [../global-classes/applying-classes.md](../global-classes/applying-classes.md) — `classes` prop (excluded from overridable)
