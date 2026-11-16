# CSS Converter Extension

> Audience: internal
> Module: `modules/atomic-widgets/css-converter/`
> Related: [pipeline.md](./pipeline.md), [../fundamentals/style-schema.md](../fundamentals/style-schema.md), [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md)

## What it is

How to extend the CSS converter with shorthand expanders and property converters. Extension is **factory registration in core** — no public WordPress filter for converter/expander discovery.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Shorthand_Expander_Base` | `get_supported_properties(): array`, `do_expand( array $rule ): array` | Subclass for shorthand → longhand |
| `Shorthand_Expander_Base` | `expand_null( array $rule ): array` | Override null-reset fan-out |
| `Property_Converter_Base` | `get_supported_properties(): array`, `do_convert( ... ): bool` | Subclass for longhand → PropValue |
| `Property_Converter_Base` | `convert_null( ... ): bool` | Override null-reset on aggregate props |
| `Converter_Registry_Factory` | `create( ?Variables_Service ): Converter_Registry` | Register converters in `real_converters()` |
| `Converter_Registry_Factory` | `covered_properties(): array` | Manual coverage list (CI vs `Style_Schema`) |
| `Expander_Registry_Factory` | `create( ?Variables_Service ): Expander_Registry` | Register expanders in `create()` |

Verified: `shorthand-expander-base.php`, `property-converter-base.php`, `converter-registry-factory.php`, `expander-registry-factory.php`.

## When to use it

- New CSS shorthand → `Shorthand_Expander_Base` subclass
- New `Style_Schema` property → `Property_Converter_Base` subclass + `covered_properties()` update
- Custom null-reset on aggregate prop → override `expand_null()` or `convert_null()`

## Key concepts

### Shorthand expanders

| Class | Input → output |
|-------|----------------|
| `Physical_To_Logical_Expander` | `top`/`right`/`bottom`/`left` → logical inset longhands |
| `Border_Shorthand_Expander` | `border`, `border-{side}` → width/style/color per side |
| `Background_Shorthand_Expander` | `background` → color/image/… longhands |
| `Outline_Shorthand_Expander` | `outline` → width/style/color/offset |

`expand()` dispatches `null` → `expand_null()`, else `do_expand()`. First matching expander wins.

### Property converters (representative)

| Converter | Role |
|-----------|------|
| `Dimensions_Property_Converter` | padding/margin/border-width shorthands |
| `Object_Side_Merge_Converter` | Per-side longhands → aggregate (`padding-top` → `padding`) |
| `Object_Field_Merge_Converter` | Per-field longhands → object (`background-color` → `background.color`) |
| `Size_Property_Converter` / `Color_Property_Converter` | Leaf PropValues |
| `Noop_Converter` | Claims property, declines → `customCss` |
| `Rejected_Converter` | Claims property → `rejected` (e.g. `animation*`) |

`convert()` returns `true` to claim, `false` to try next converter.

### `covered_properties()`

Manual set of Style_Schema keys the converter claims. CI diffs against live schema (`test-css-converter-rest-api.php`). Side longhands (e.g. `padding-top`) register in `real_converters()` but are not top-level `covered_properties()` entries — they merge into aggregates.

### Null / reset semantics

| Stage | Null behavior |
|-------|---------------|
| `parse()` | `"null"` → PHP `null` |
| `dedupe()` | Later value wins per property |
| Expanders | `expand_null()` fans out to longhands |
| Converters | `convert_null()` sets prop or field to `null` |
| `cleanup_props()` | All-null object children → top-level `null` |

## Extension

### Add expander

1. Subclass `Shorthand_Expander_Base` in `expanders/`
2. Register in `Expander_Registry_Factory::create()` (order matters)
3. Add unit tests under `tests/phpunit/.../css-converter/`

### Add converter

1. Subclass `Property_Converter_Base` in `converters/`
2. Register in `Converter_Registry_Factory::real_converters()`
3. Add property to `covered_properties()` (or appropriate constant)
4. Run coverage tests

Third-party extension requires a core PR to the factories, or constructing a custom `Css_Converter` with hand-built registries.

## Internals

N/A

## See also

- [pipeline.md](./pipeline.md) — where expanders/converters run
- [overview.md](./overview.md) — `convert()` return shape
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md)
