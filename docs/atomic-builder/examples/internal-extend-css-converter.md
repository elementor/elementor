# Example: Internal — extend CSS converter

> Skill: [internal-extend-css-converter](../../../.cursor/skills/internal-extend-css-converter/SKILL.md)
> Docs: [css-converter/extension.md](../css-converter/extension.md)
> Verdict: **Relevant for Core only** — no public WordPress discovery hook. Third parties need a core PR or a private `Css_Converter` instance.

## When to use

Maps legacy CSS declarations → atomic `Style_Schema` PropValues during import/migration. Not the same as styles transformers at render time.

## Property converter (reference: `Size_Property_Converter`)

```php
<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

class My_Property_Converter extends Property_Converter_Base {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$context->set_prop( $this->property, Size_Prop_Type::generate( [
			'size' => 10,
			'unit' => 'px',
		] ) );

		return true;
	}
}
```

Register in `Converter_Registry_Factory::real_converters()` (private method, same file).

## Shorthand expander

Subclass `Shorthand_Expander_Base`:

- `protected get_supported_properties(): array`
- `protected do_expand( array $rule ): array`
- Optional `expand_null()` for reset fan-out

Register in `Expander_Registry_Factory::create()` — **order matters** (first match wins for expanders).

## Coverage CI

Add properties to the matching family constant (`STRING_PROPERTIES`, `SIZE_PROPERTIES`, `OTHER_PROPERTIES`, etc.). `covered_properties()` merges them.

Test: `test-css-converter-rest-api.php::test_coverage__every_style_schema_property_is_hardcoded_as_covered` — every `Style_Schema` key must appear in coverage.

Side longhands (`padding-top`, etc.) use `Object_Side_Merge_Converter` / `Object_Field_Merge_Converter` and are not always top-level schema keys.

## Public path options

1. Core PR adding expander/converter to factory classes under `modules/atomic-widgets/css-converter/`.
2. Plugin-internal tooling with a hand-built `Css_Converter` and custom registries (not wired into core import UI).

## Related filter (not converter discovery)

`elementor/atomic-widgets/styles/schema` extends style schema only — it does not register converters.
