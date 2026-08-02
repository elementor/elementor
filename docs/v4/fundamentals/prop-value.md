# PropValue

> Audience: both
> Module: atomic-widgets (shared contract)
> Status: final
> Related: [prop-types.md](prop-types.md), [transformers.md](transformers.md), [../components/instances-and-overrides.md](../components/instances-and-overrides.md), [../getting-started/glossary.md](../getting-started/glossary.md)

## What it is

A **PropValue** is the atomic unit of typed data in v4 element JSON. Most values use the **transformable envelope**:

```json
{
  "$$type": "color",
  "value": "#wc26-gold"
}
```

- `$$type` — discriminator matching a prop type's `get_key()` (e.g. `string`, `size`, `color`, `link`)
- `value` — payload whose shape is defined by that prop type
- `disabled` (optional) — when `true`, the value is skipped during render resolution

Plain (non-transformable) scalars are also valid in some contexts, but persisted element data almost always uses the envelope.

## When to use it

- Authoring or mutating element `settings` and style `props` (REST, MCP, import/export)
- Reading saved JSON to understand what the editor stores vs what the frontend renders
- Building agents that compose element config — always emit `{ $$type, value }`, not raw CSS strings or bare scalars (unless the target prop type explicitly allows it)

Use **labels** in examples and agent output (e.g. `wc26-gold`), not internal ids (`e-gv-wc26-gold`).

## Key concepts

### Transformable envelope

PHP (`Has_Transformable_Validation`) and TS (`isTransformable`) both require:

- `$$type` and `value` keys present
- `$$type` matches the expected prop type key
- `disabled`, if present, is a boolean

Generate values in PHP via `Some_Prop_Type::generate( $inner_value )`; pass `true` as the second argument to set `disabled` (default is `false`).

### Plain vs transformable

| | Plain | Transformable |
|---|-------|---------------|
| Shape | Raw string/number/boolean | `{ $$type, value [, disabled] }` |
| Validation | Type check only | Envelope + inner `validate_value()` |
| Render | Passed through if not transformable | Resolved via `Render_Props_Resolver` + transformer |
| Examples | Rare in persisted data | All settings, all style props |

Primitives (`string`, `number`, `boolean`) are plain prop types but still use the envelope when stored.

### `disabled`

When `disabled: true`:

- `Render_Props_Resolver::resolve_item()` returns `null` — the prop produces no CSS/output
- The value may still be persisted and shown in the editor UI
- Transformers receive `Props_Resolver_Context::is_disabled()` for context-aware behavior

### Null and reset semantics

| Situation | Meaning |
|-----------|---------|
| Prop key **absent** from JSON | Use prop type default (may be `null`) |
| Prop value **`null`** at top level | Explicit reset; omit from sanitized output |
| `null` leaf inside an object `value` | Partial reset of one sub-field (see [validation.md](validation.md#partial-null-bypass)) |
| `disabled: true` | Suppress at render time (distinct from reset) |

The CSS converter treats top-level `null` and partial-null object props as reset signals; see [../css-converter/overview.md](../css-converter/overview.md).

### Overridable wrapping

Component instances wrap overridable settings in an `overridable` envelope:

```json
{
  "$$type": "overridable",
  "value": {
    "override_key": "hero-title",
    "origin_value": {
      "$$type": "string",
      "value": "Welcome"
    }
  }
}
```

- `override_key` — stable key defined on the component document
- `origin_value` — the underlying prop value (any transformable type)
- Resolved at render time by `Overridable_Transformer` (components module)

Mark a schema field as non-overridable with `->meta( Overridable_Prop_Type::ignore() )`. On component instances, eligible settings are schema-wrapped as `overridable` by `Overridable_Schema_Extender`; editor dependency checks unwrap `origin_value` when reading affecting props (see [style-schema.md](style-schema.md#dependencies)). See [../components/instances-and-overrides.md](../components/instances-and-overrides.md).

## Extension

Prop types define what goes inside `value`. To add a new typed value:

1. Create a prop type (PHP + TS) — see [prop-types.md](prop-types.md)
2. Register a transformer if render output differs from stored shape — see [transformers.md](transformers.md)
3. Reference the type in your widget's `define_props_schema()` or via `elementor/atomic-widgets/props-schema`

## Internals

| PHP | TS (`@elementor/editor-props`) |
|-----|-------------------------------|
| `PropTypes\Concerns\Has_Generate::generate()` | Prop type util `.create()` / manual object |
| `PropTypes\Concerns\Has_Transformable_Validation` | `isTransformable()` |
| `Render_Props_Resolver::resolve_item()` | N/A (server-side render) |
| `Overridable_Prop_Type` | `isOverridable()`, `rewrapOverridableValue()` |

`Plain_Prop_Type::validate()` treats empty `value` as valid when the prop is not required — useful for optional cleared fields.

## See also

- [prop-types.md](prop-types.md) — type taxonomy and schema hooks
- [validation.md](validation.md) — `Props_Parser` and `validatePropValue`
- [../dynamic-tags/binding-propvalues.md](../dynamic-tags/binding-propvalues.md) — `{ $$type: dynamic }` binding
