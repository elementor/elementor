---
name: internal-extend-css-converter
description: "Internal: Extend the atomic CSS converter in a Core fork and submit a Core PR. Shorthand_Expander_Base, Property_Converter_Base, no public discovery hook."
---

# Extend CSS converter

> **Scope: Internal** — there is **no public registration hook**. The full documented outcome requires a PR against Elementor Core (`Converter_Registry_Factory` / `Expander_Registry_Factory`), or a private `Css_Converter` instance not integrated into core import. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Implementation location

- **Fork/clone** [elementor/elementor](https://github.com/elementor/elementor).
- Implement in `modules/atomic-widgets/css-converter/`:
  - `converter-registry-factory.php`, `expander-registry-factory.php`
  - `expanders/`, `converters/`
- Add PHPUnit under `tests/phpunit/elementor/modules/atomic-widgets/css-converter/`.
- **Submit PR against Core.** Third-party plugins cannot wire converters into the core import pipeline.

Read first: [css-converter/extension.md](../../../docs/atomic-builder/css-converter/extension.md). Example: [docs/atomic-builder/examples/internal-extend-css-converter.md](../../../docs/atomic-builder/examples/internal-extend-css-converter.md). Pipeline: [pipeline.md](../../../docs/atomic-builder/css-converter/pipeline.md), [overview.md](../../../docs/atomic-builder/css-converter/overview.md).

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
5. **Update coverage constants** — add property to family constant (`STRING_PROPERTIES`, `OTHER_PROPERTIES`, etc.); `covered_properties()` merges them. CI: `test-css-converter-rest-api.php::test_coverage__every_style_schema_property_is_hardcoded_as_covered`.
6. **PHPUnit** — add tests under `tests/phpunit/elementor/modules/atomic-widgets/css-converter/`.

## External workaround (not integrated into Core import)

Third-party plugins **cannot** register via WordPress filter. Options:

- Open a **core PR** adding expander/converter to `Expander_Registry_Factory` / `Converter_Registry_Factory`.
- Instantiate custom `Css_Converter` with privately built registries for plugin-internal migration tooling (not wired into core import UI unless integrated upstream).

## Internal implementation path

- Module: `modules/atomic-widgets/css-converter/`
- Factories: `converter-registry-factory.php`, `expander-registry-factory.php`
- Subdirs: `expanders/`, `converters/`
- Side longhands (e.g. `padding-top`) merge via `Object_Side_Merge_Converter` / `Object_Field_Merge_Converter` — not always top-level `covered_properties()` entries.

## See also

- [fundamentals/style-schema.md](../../../docs/atomic-builder/fundamentals/style-schema.md)
- [extend-prop-types](../extend-prop-types/SKILL.md) — style transformers after conversion
