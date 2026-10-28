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
- **Skill fixture (boundary demo):** `tests/phpunit/elementor/modules/atomic-widgets/css-converter/test-skill-fixture-custom-registry.php` — private `Css_Converter` vs empty registry.

Read first: [css-converter/extension.md](../../../docs/atomic-builder/css-converter/extension.md), [pipeline.md](../../../docs/atomic-builder/css-converter/pipeline.md), [overview.md](../../../docs/atomic-builder/css-converter/overview.md). Example: [docs/atomic-builder/examples/internal-extend-css-converter.md](../../../docs/atomic-builder/examples/internal-extend-css-converter.md).

## Prerequisites

- Experiment `e_atomic_elements` — REST `POST /wp-json/elementor/v1/css-to-atomic` depends on atomic module state.
- New **style schema keys** from [extend-prop-types](../extend-prop-types/SKILL.md) need **both** schema work **and** converter + `covered_properties()` work here.

## Checklist (Internal-first)

1. **Confirm need** — converter maps legacy CSS longhands/shorthands → atomic `Style_Schema` PropValues; **not** the same as style transformers at render time.
2. **No public discovery hook** — Core factory registration **or** private `Css_Converter` with custom registries (not wired to core import UI).
3. **Shorthand → longhand** — subclass `Shorthand_Expander_Base`; register in `Expander_Registry_Factory::create()` — **order matters** (first match wins). Input rule: `['property' => string, 'value' => string|null]`. Each expanded rule must include `property`, `value`, and `declaration` (e.g. `'border-top-width: 1px'`) — see `shorthand-expander-base.php` / `border-shorthand-expander.php`.
4. **Longhand → PropValue** — subclass `Property_Converter_Base`; register in `Converter_Registry_Factory::real_converters()`. Return PropValues via the matching prop type's `::generate()` (e.g. `String_Prop_Type::generate()` for strings, not only `Size_Prop_Type::generate()`).
5. **Update coverage constants** — add property to family constant: `STRING_PROPERTIES`, `SIZE_PROPERTIES`, `UNITLESS_SIZE_PROPERTIES`, `OTHER_PROPERTIES`, etc.; `covered_properties()` merges them. CI: `test-css-converter-rest-api.php::test_coverage__every_style_schema_property_is_hardcoded_as_covered`.
6. **PHPUnit** — under `tests/phpunit/elementor/modules/atomic-widgets/css-converter/`. Fast loop: `tests/phpunit/run-unit.sh tests/phpunit/.../test-*.php`.
7. **Verify** — `POST /wp-json/elementor/v1/css-to-atomic` with sample CSS; full suite: `composer run test` with `--filter` as needed.

## External partial APIs (do not satisfy this skill)

- Filter `elementor/atomic-widgets/styles/schema` extends schema only — **does not register converters**. Without factory + coverage updates, declarations route to `customCss` or fail CI.
- Private `Css_Converter` in a plugin proves the pattern but does not integrate core import UI.

## External workaround (not integrated into Core import)

Third-party plugins **cannot** register via WordPress filter. Options:

- Open a **core PR** adding expander/converter to factory classes.
- Instantiate custom `Css_Converter` with privately built registries for plugin-internal migration tooling. Constructor requires a `Conversion_Failure_Reporter` — use `new Null_Failure_Reporter()` for tests/tooling (`css-converter.php`).

## Internal implementation path

- Module: `modules/atomic-widgets/css-converter/`
- Side longhands (`padding-top`, etc.) merge via `Object_Side_Merge_Converter` / `Object_Field_Merge_Converter` — not always top-level `covered_properties()` entries.
- Pipeline routing: `props` vs `customCss` vs `rejected` — [pipeline.md](../../../docs/atomic-builder/css-converter/pipeline.md).

## See also

- [fundamentals/style-schema.md](../../../docs/atomic-builder/fundamentals/style-schema.md)
- [extend-prop-types](../extend-prop-types/SKILL.md) — style transformers after conversion (External)
