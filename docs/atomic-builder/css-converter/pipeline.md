# CSS Converter Pipeline

> Audience: internal
> Module: `modules/atomic-widgets/css-converter/css-converter.php`
> Related: [overview.md](./overview.md), [extension.md](./extension.md), [../fundamentals/validation.md](../fundamentals/validation.md)

## What it is

Ordered transformation inside `$converter->convert()`. Implementation: `css-converter.php`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Css_Converter` | `convert( string $css ): array` | Runs full pipeline below |
| `Conversion_Context` | `get_prop( string $p )`, `set_prop( string $p, $v )` | Shared accumulator for converters |
| `Conversion_Context` | `reject( string $declaration )` | Route declaration to `rejected` bucket |
| `Variable_Prop_Value_Transformer` | `transform( array $props, array $schema ): array` | Promote `var()` to variable PropValues |
| `Variable_Prop_Value_Transformer` | `eject_unresolved_var_props( ... ): array` | Move failures to `customCss` / `rejected` |

Verified: `css-converter.php`, `conversion-context.php`, `variable-prop-value-transformer.php`.

## When to use it

Debug conversion output, add a pipeline stage, or trace why a declaration landed in `props` vs `customCss` vs `rejected`. Pair with [extension.md](./extension.md) for expander/converter fixes.

## Key concepts

### Stage diagram

```
raw CSS → parse() → expand_shorthands() → dedupe() → converter loop
  → [variable_transformer] → cleanup_props() → { props, customCss, rejected }
```

| Stage | Method | Behavior |
|-------|--------|----------|
| Parse | `parse()` | `;` split, first `:` separates property/value; lowercases names |
| Expand | `expand_shorthands()` | First matching expander wins; decline → rule kept |
| Dedupe | `dedupe()` | Last declaration per property name wins |
| Convert | `try_convert()` | First supporting converter returning `true` wins |
| Variables | `Variable_Prop_Value_Transformer` | Optional; requires `Variables_Service` |
| Validate | `validate_props()` | Only when transformer injected; null-leaf props bypass |
| Cleanup | `cleanup_props()` | All-null object children collapse to top-level `null` |

### Output routing

| Outcome | Destination |
|---------|-------------|
| Converter returns `true` | `props` |
| No converter / returns `false` (`Noop_Converter`) | `customCss` |
| `Rejected_Converter` | `rejected` |
| Unknown variable label | `customCss` |
| Known variable, wrong type | `rejected` |

`Noop_Converter` claims schema properties without converting (e.g. `stroke*`) so they intentionally route to `customCss`.

### Conversion_Context

Mutable accumulator shared across converters. Merge converters (`Object_Field_Merge_Converter`, `Object_Side_Merge_Converter`) read-modify-write aggregate props (`background`, `padding`) via `get_prop()` / `set_prop()`.

## Extension

See [extension.md](./extension.md).

## Internals

**Expanders** (`Expander_Registry_Factory::create()`): `Physical_To_Logical_Expander`, `Background_Shorthand_Expander`, `Outline_Shorthand_Expander`, `Border_Shorthand_Expander`. First match wins.

**Converters** (`Converter_Registry_Factory::create()`): `real_converters()`, then `Rejected_Converter`, then `Noop_Converter` for uncovered `covered_properties()` entries.

**Blocked input** — `BLOCKED_PROPERTIES` (`behavior`, `-moz-binding`) and `BLOCKED_VALUE_NEEDLES` (`expression(`, `javascript:`) dropped at parse.

## See also

- [overview.md](./overview.md) — REST and MCP entry points
- [extension.md](./extension.md) — base classes
- [../fundamentals/style-schema.md](../fundamentals/style-schema.md)
