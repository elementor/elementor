---
name: extend-css-converter
description: Extends Elementor atomic CSS converter — Shorthand_Expander_Base, Property_Converter_Base, Converter_Registry_Factory, Expander_Registry_Factory, covered_properties CI. Use when migrating legacy CSS to Style_Schema PropValues; no public discovery filter exists.
---

# Extend CSS converter

Read first: [css-converter/extension.md](../../../docs/atomic-builder/css-converter/extension.md). Pipeline: [pipeline.md](../../../docs/atomic-builder/css-converter/pipeline.md), [overview.md](../../../docs/atomic-builder/css-converter/overview.md).

## Checklist

1. **Confirm need** — converter maps legacy CSS longhands/shorthands → atomic `Style_Schema` PropValues; not the same as style transformers at render time.
2. **No public discovery hook** — extension is factory registration in core **or** a hand-built `Css_Converter` with custom registries.
3. **Shorthand → longhand** — subclass `Shorthand_Expander_Base`:
   - Implement `get_supported_properties()`, `do_expand( array $rule )`
   - Optional `expand_null()` for reset fan-out
   - Register in `Expander_Registry_Factory::create()` — **order matters** (first match wins)
4. **Longhand → PropValue** — subclass `Property_Converter_Base`:
   - `get_supported_properties()`, `do_convert()` returns `true` to claim
   - Optional `convert_null()` for aggregate props
   - Register in `Converter_Registry_Factory::real_converters()`
5. **Update `covered_properties()`** — manual list CI-diffed against live `Style_Schema` (`test-css-converter-rest-api.php`).
6. **PHPUnit** — add tests under `tests/phpunit/elementor/modules/atomic-widgets/css-converter/`.

## Public path (limited)

Third-party plugins **cannot** register via WordPress filter. Options:

- Open a **core PR** adding expander/converter to `Expander_Registry_Factory` / `Converter_Registry_Factory`.
- Instantiate custom `Css_Converter` with privately built registries for plugin-internal migration tooling (not wired into core import UI unless integrated upstream).

## Internal path

- Module: `modules/atomic-widgets/css-converter/`
- Factories: `converter-registry-factory.php`, `expander-registry-factory.php`
- Subdirs: `expanders/`, `converters/`
- Side longhands (e.g. `padding-top`) merge via `Object_Side_Merge_Converter` / `Object_Field_Merge_Converter` — not always top-level `covered_properties()` entries.

## See also

- [fundamentals/style-schema.md](../../../docs/atomic-builder/fundamentals/style-schema.md)
- [extend-prop-types-transformers](../extend-prop-types-transformers/SKILL.md) — style transformers after conversion
