# CSS Converter Pipeline

> Audience: internal
> Module: `modules/atomic-widgets/css-converter/css-converter.php`
> Status: draft
> Related: [overview.md](./overview.md), [extension.md](./extension.md), [../fundamentals/validation.md](../fundamentals/validation.md)

## What it is

The ordered transformation inside `Css_Converter::convert()`. Raw CSS text becomes deduplicated rules, typed PropValues in a shared context, optional variable resolution, and finally cleaned props plus `customCss` / `rejected` leftovers.

Implementation: `modules/atomic-widgets/css-converter/css-converter.php`.

## When to use it

Read this when debugging conversion output, adding a pipeline stage, or tracing why a declaration landed in `props` vs `customCss` vs `rejected`. Pair with [extension.md](./extension.md) when the fix is a new expander or converter rather than orchestration logic.

## Key concepts

### Stage diagram

```
raw CSS string
  │
  ▼ parse()
list of rules  { property, value, declaration }
  │  'null' string → PHP null (reset sentinel)
  │  blocked properties/values dropped (e.g. behavior, expression())
  │
  ▼ expand_shorthands()
expanded rules  (e.g. border → border-width, border-style, border-color)
  │  each rule tries every registered Expander; first match wins
  │  expander declines (empty result) or throws → rule kept as-is
  │
  ▼ dedupe()
deduplicated rules  (last declaration wins per property name)
  │  superseded declarations dropped entirely — including invalid ones
  │
  ▼ converter loop  (try_convert per rule)
Conversion_Context  (accumulates props; last write wins)
  │  each rule tries every registered Converter; first match wins
  │  converter declines → declaration appended to leftover (customCss)
  │  Rejected_Converter → context.reject() → rejected bucket
  │
  ▼ variable_transformer  (only when injected)
  │  transform(): resolve var() tokens to typed variable PropValues
  │  eject_unresolved_var_props(): unknown → customCss; type mismatch → rejected
  │  validate_props(): Props_Parser on non-null leaves (partial-null bypass)
  │
  ▼ cleanup_props()  (always)
final props
  │  recursive: if ALL present sub-values of an object are null → collapse to null
  │  empty arrays are NOT collapsed
```

**Note:** `validate_props()` runs only inside the `if ( $this->variable_transformer )` block. Callers without a transformer skip validation in the converter (MCP `Style_Applier` validates again via `Style_Parser` after merge).

### Stage details

| Stage | Method | Behavior |
|-------|--------|----------|
| Parse | `parse()` | Naive `;` split, first `:` separates property/value. Lowercases property names. |
| Expand | `expand_shorthands()` → `expand_rule()` | Registry iteration; first supporting expander wins. |
| Dedupe | `dedupe()` | Keeps last index per `property` key — CSS cascade before conversion. |
| Convert | `try_convert()` | Registry iteration; first supporting converter that returns `true` wins. |
| Variables | `Variable_Prop_Value_Transformer` | Optional; requires `Variables_Service`. |
| Validate | `validate_props()` | Splits props with null leaves (bypass) vs full values (`Props_Parser`). |
| Cleanup | `cleanup_props()` | Collapses all-null object children to top-level `null`. |

### Conversion_Context

Mutable key-value accumulator shared across all converters in one pass. Converters read via `get_prop()` and write via `set_prop()` — essential for aggregate props (`background`, `border-width`) built from multiple longhands. Also collects `rejected` via `reject()`.

**Example — `background-color: red`**

1. No expander matches `background-color`.
2. `Object_Field_Merge_Converter` reads `context->get_prop('background')` (null), sets `color` field, writes `Background_Prop_Type::generate(...)`.
3. `cleanup_props()` leaves the prop unchanged (non-null leaf).

**Example — two longhands**

`background-color: red; background-image: url(img.png)` — two `Object_Field_Merge_Converter` instances each read-modify-write the same `background` object in cascade order.

### Variable promotion

When `Variable_Prop_Value_Transformer` is present:

1. During conversion, `Css_Var_Token_Resolver` can resolve var-only tokens at converter sites (e.g. size variables).
2. Post-loop, `transform()` walks props and promotes surviving `var()` references to typed variable PropValues.
3. `eject_unresolved_var_props()` moves failures to `customCss` (unknown label) or `rejected` (known variable, wrong type).

Use label-only references: `var(--wc26-gold)`, not internal ids.

### Output routing

| Outcome | Destination |
|---------|-------------|
| Converter returns `true`, prop set | `props` |
| Converter returns `false` (incl. `Noop_Converter`) | `customCss` |
| `Rejected_Converter` | `rejected` |
| Unresolved variable (unknown) | `customCss` |
| Unresolved variable (type mismatch) | `rejected` |

`Noop_Converter` explicitly claims schema properties without converting them (e.g. `stroke*`, fallback `background`) so they route to `customCss` by design.

## Extension

N/A — registration mechanics live in [extension.md](./extension.md).

## Internals

**Expander registry** (`Expander_Registry_Factory::create()`): `Physical_To_Logical_Expander`, `Background_Shorthand_Expander`, `Outline_Shorthand_Expander`, `Border_Shorthand_Expander` (all sides + per-side variants). Registration order matters — first match wins.

**Converter registry** (`Converter_Registry_Factory::create()`): real converters from `real_converters()`, then `Rejected_Converter` for `REJECTED_PROPERTIES`, then `Noop_Converter` for any `covered_properties()` entry without a real converter. Ensures exactly one handler per covered property.

**Failure reporting** — expander/converter exceptions are caught, reported via `Conversion_Failure_Reporter`, and treated as decline (rule passes through or next handler tried).

**Blocked input** — `BLOCKED_PROPERTIES` (`behavior`, `-moz-binding`) and `BLOCKED_VALUE_NEEDLES` (`expression(`, `javascript:`) are dropped at parse time.

## See also

- [overview.md](./overview.md) — REST and MCP entry points
- [extension.md](./extension.md) — `Shorthand_Expander_Base`, `Property_Converter_Base`
- [../fundamentals/style-schema.md](../fundamentals/style-schema.md) — validation target
- [../fundamentals/transformers.md](../fundamentals/transformers.md) — downstream prop resolution
