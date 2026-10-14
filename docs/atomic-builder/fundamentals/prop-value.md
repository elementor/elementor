# PropValue

> Audience: both
> Module: atomic-widgets (shared contract)
> Related: [prop-types.md](prop-types.md), [transformers.md](transformers.md), [../components/instances-and-overrides.md](../components/instances-and-overrides.md), [../getting-started/glossary.md](../getting-started/glossary.md)

## What it is

A **PropValue** is the atomic unit of typed data in v4 element JSON:

```json
{ "$$type": "color", "value": "#wc26-gold" }
```

| Field | Meaning |
|-------|---------|
| `$$type` | Prop type key (`string`, `size`, `color`, …) |
| `value` | Payload shape for that type |
| `disabled` (optional) | When `true`, skipped during render resolution |

Persisted element data almost always uses the envelope, even for primitives.

## When to use it

- Authoring or mutating `settings` and style `props` (REST, MCP, import/export)
- Reading saved JSON vs frontend render output
- Building agents — emit `{ $$type, value }`, not raw CSS or bare scalars

Use **labels** in examples (e.g. `wc26-gold`), not internal ids.

## Key concepts

### Transformable envelope

PHP (`Has_Transformable_Validation`) and TS (`isTransformable`) require `$$type`, `value`, and optional boolean `disabled`.

Generate in PHP: `Some_Prop_Type::generate( $inner_value )` — pass `true` as second arg to set `disabled`.

### Plain vs transformable

| | Plain | Transformable |
|---|-------|---------------|
| Shape | Raw scalar | `{ $$type, value [, disabled] }` |
| Validation | Type check | Envelope + inner `validate_value()` |
| Render | Passthrough | `Render_Props_Resolver` + transformer |

Primitives still use the envelope when stored.

### `disabled`

- `Render_Props_Resolver::resolve_item()` returns `null` — no CSS/output
- Value may persist and show in editor
- Transformers can read `Props_Resolver_Context::is_disabled()`

### Null and reset semantics

| Situation | Meaning |
|-----------|---------|
| Key **absent** | Use prop type default |
| Value **`null`** | Explicit reset; omitted from sanitized output |
| `null` leaf inside object `value` | Partial reset of one sub-field |
| `disabled: true` | Suppress at render (distinct from reset) |

CSS converter treats top-level `null` and partial-null objects as reset signals.

### Overridable wrapping

Component instances wrap settings in an `overridable` envelope:

```json
{
  "$$type": "overridable",
  "value": {
    "override_key": "hero-title",
    "origin_value": { "$$type": "string", "value": "Welcome" }
  }
}
```

Resolved by `Overridable_Transformer`. See [../components/instances-and-overrides.md](../components/instances-and-overrides.md).

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Transformable_Prop_Type::generate()` | `static generate( $value, $disable = false ): array` | Build envelope in PHP (`has-generate.php`) |
| `isTransformable()` | `isTransformable( value: unknown ): value is TransformablePropValue` | Check envelope in TS (`is-transformable.ts`) |
| `createPropUtils().create()` | `create( value, options? ): Prop` | Build envelope in TS (`create-prop-utils.ts`) |
| `isOverridable()` | `isOverridable( value ): boolean` | Detect overridable wrapper (`is-overridable.ts`) |
| `rewrapOverridableValue()` | `rewrapOverridableValue( prop, newValue )` | Re-wrap after dependency cascade |

## Extension

1. Create prop type (PHP + TS) — [prop-types.md](prop-types.md)
2. Register transformer if render output differs — [transformers.md](transformers.md)
3. Reference in `define_props_schema()` or `elementor/atomic-widgets/props-schema`

## Internals

`Plain_Prop_Type::validate()` treats empty `value` as valid when not required. `Render_Props_Resolver::resolve_item()` handles `disabled` and depth-limited chaining.

## See also

- [prop-types.md](prop-types.md)
- [validation.md](validation.md)
- [../dynamic-tags/binding-propvalues.md](../dynamic-tags/binding-propvalues.md)
