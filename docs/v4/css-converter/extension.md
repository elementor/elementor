# CSS Converter Extension

> Audience: external
> Module: `modules/atomic-widgets/css-converter/`
> Status: final
> Related: [pipeline.md](./pipeline.md), [../fundamentals/style-schema.md](../fundamentals/style-schema.md), [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md)

## What it is

How to extend the CSS converter with new shorthand expanders and property converters. Extension today is **factory registration in core** — there is no public WordPress filter for converter or expander discovery. The only `apply_filters` call under `modules/atomic-widgets/css-converter/` is indirect: `Css_Converter::style_schema()` calls `Style_Schema::get()`, which applies `elementor/atomic-widgets/styles/schema` to the validation target (not to register converters).

## When to use it

- A new CSS shorthand needs splitting before converters run → add a `Shorthand_Expander_Base` subclass.
- A new or existing `Style_Schema` property needs CSS longhand support → add a `Property_Converter_Base` subclass and register it.
- You need custom null-reset behavior for an aggregate prop → override `expand_null()` or `convert_null()`.

Always update `Converter_Registry_Factory::covered_properties()` when adding schema-backed coverage — CI diffs it against the live `Style_Schema`.

## Key concepts

### Shorthand expanders (`Shorthand_Expander_Base`)

Split one shorthand rule into longhand rules **before** the converter loop. Registered in `Expander_Registry_Factory`.

| Class | Input | Output |
|-------|-------|--------|
| `Physical_To_Logical_Expander` | `top`, `right`, `bottom`, `left` | `inset-block-start`, `inset-inline-end`, … |
| `Border_Shorthand_Expander` | `border`, `border-{side}` | `border-width`, `border-style`, `border-color` (per side) |
| `Background_Shorthand_Expander` | `background` | `background-color`, `background-image`, … |
| `Outline_Shorthand_Expander` | `outline` | `outline-width`, `outline-style`, `outline-color`, `outline-offset` |

Template method on `Shorthand_Expander_Base`:

- `expand()` → `null` value dispatches to `expand_null()`, else `do_expand()`.
- `is_supported()` checks `get_supported_properties()` (exact property name list).
- Default `expand_null()` re-emits the same property with `null`; override to fan out to all longhands.

### Property converters (`Property_Converter_Base`)

Map one longhand rule to a PropValue in `Conversion_Context`. Registered in `Converter_Registry_Factory::real_converters()`.

Representative converters (snapshot — not exhaustive):

| Converter | Role |
|-----------|------|
| `Dimensions_Property_Converter` | `padding` / `margin` / `border-width` shorthands → Dimensions |
| `Border_Radius_Property_Converter` | `border-radius` shorthand |
| `Object_Side_Merge_Converter` | Per-side longhands → merge one side into aggregate (`padding-top` → `padding`) |
| `Object_Field_Merge_Converter` | Per-field longhands → merge into object (`background-color` → `background.color`) |
| `Size_Property_Converter` | Length values → Size PropValue |
| `Color_Property_Converter` | Color strings → Color PropValue |
| `String_Property_Converter` | Enum / free strings → String PropValue |
| `Noop_Converter` | Claims property, declines → `customCss` |
| `Rejected_Converter` | Claims property, rejects → `rejected` (e.g. `animation*`) |

Template method on `Property_Converter_Base`:

- `convert()` → `null` value dispatches to `convert_null()` (default: `context->set_prop(property, null)`), else `do_convert()`.
- Return `true` to claim the rule, `false` to decline (next converter tried).

**Merge pattern** (shared by `Object_Field_Merge_Converter` and `Object_Side_Merge_Converter`):

```
existing = context->get_prop(target)
fields   = extract current fields/sides from existing (or start fresh)
fields[my_key] = new leaf value
context->set_prop(target, ObjectPropType::generate(fields))
```

### `covered_properties()` and Style_Schema

`Converter_Registry_Factory::covered_properties()` is the **manual** set of Style_Schema keys (plus a few intentional non-schema longhands such as `background-color`) the converter claims. It is intentionally **not** auto-derived from `Style_Schema` — `test-css-converter-rest-api.php::test_coverage__every_style_schema_property_is_hardcoded_as_covered` diffs live schema keys against this list so new schema props fail CI until wired.

Side longhands such as `padding-top` are registered in `real_converters()` via `DIMENSIONS_SIDE_SPECS` but are **not** listed in `covered_properties()` because they are not top-level schema keys; they merge into aggregate props (`padding`, `margin`).

To add coverage:

1. Add the property (or family) to the appropriate constant array in `converter-registry-factory.php`, or to `covered_properties()` merge list.
2. Register a real converter in `real_converters()` **or** rely on `Noop_Converter` fallback for intentional `customCss` passthrough.
3. Run css-converter tests — `test-converter-registry-factory.php` and REST API coverage tests enforce alignment.

`Style_Schema` source: `modules/atomic-widgets/styles/style-schema.php` (filtered at runtime via `elementor/atomic-widgets/styles/schema`).

### Null / reset semantics

`null` (PHP) or the string `"null"` means **delete this prop from the style tree**.

| Stage | Null behavior |
|-------|---------------|
| `parse()` | Normalises `"null"` → PHP `null` |
| `dedupe()` | Later `null` supersedes earlier value for same property (and vice versa) |
| Expanders | `expand_null()` fans out to longhands |
| Converters | `convert_null()` sets prop to `null`; merge converters set one field/side to `null` |
| `validate_props()` | Props with any null leaf bypass `Props_Parser` |
| `cleanup_props()` | Object where every present sub-value is `null` collapses to top-level `null` |

**Example:** `padding: null` → `{ "padding": null }`.

**Example:** `padding: 10px; padding-top: null` → after dedupe only `padding-top: null` remains → partial Dimensions with `block-start: null`.

## Extension

### Add a shorthand expander

1. Subclass `Shorthand_Expander_Base` in `expanders/`.
2. Implement `get_supported_properties()` and `do_expand()`; override `expand_null()` if the shorthand maps to multiple longhands.
3. Register in `Expander_Registry_Factory::create()` **before** less-specific expanders if order matters.
4. Add unit tests under `tests/phpunit/elementor/modules/atomic-widgets/css-converter/`.

### Add a property converter

1. Subclass `Property_Converter_Base` in `converters/`.
2. Implement `get_supported_properties()` and `do_convert()`; override `convert_null()` for aggregate props.
3. Register in `Converter_Registry_Factory::real_converters()`.
4. Add the CSS property name(s) to `covered_properties()` (via the appropriate constant or direct merge entry).
5. Confirm the target prop exists in `Style_Schema` and add/adjust schema if needed.
6. Run coverage tests to ensure no schema/converter drift.

**No public registration hook.** Searched `modules/atomic-widgets/css-converter/` — no `apply_filters`/`do_action` for registering expanders or converters, and neither factory is instantiated through a filterable factory elsewhere. `Converter_Registry` and `Expander_Registry` expose `register()` for tests and manual wiring, but production callers use `Converter_Registry_Factory::create()` / `Expander_Registry_Factory::create()` only. Third-party extension requires a core PR to those factories (or constructing a custom `Css_Converter` with hand-built registries outside the REST/MCP paths).

## Internals

N/A

## See also

- [pipeline.md](./pipeline.md) — where expanders and converters run in the flow
- [overview.md](./overview.md) — `$converter->convert()` return shape
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue structure converters emit
- [../variables/usage-in-styles.md](../variables/usage-in-styles.md) — variable token conventions
