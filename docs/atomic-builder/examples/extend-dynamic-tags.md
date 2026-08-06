# Example: Extend dynamic tags (atomic bridge)

> Skill: [extend-dynamic-tags](../../.cursor/skills/extend-dynamic-tags/SKILL.md)  
> Docs: [dynamic-tags/extending.md](../dynamic-tags/extending.md)  
> Verdict: **Relevant** — required bridge for WordPress data in v4 props. Auto-mapping is category-based, not free-form schema intersection.

## Register tag + group

```php
<?php

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module as DynamicTagsModule;

add_action( 'elementor/dynamic_tags/register', function ( $manager ) {
	\Elementor\Plugin::$instance->dynamic_tags->register_group( 'my-plugin', [
		'title' => 'My Plugin',
	] );

	$manager->register( new \MyPlugin\Tags\Store_Hours() );
} );

class Store_Hours extends Tag {
	public function get_name() {
		return 'store-hours';
	}

	public function get_title() {
		return esc_html__( 'Store Hours', 'my-plugin' );
	}

	public function get_group() {
		return 'my-plugin';
	}

	public function get_categories() {
		return [ DynamicTagsModule::TEXT_CATEGORY ];
	}

	protected function register_controls() {
		$this->add_control( 'field', [
			'type' => 'select',
			'label' => 'Field',
			'section' => 'content',
			'default' => 'hours',
			'options' => [
				'hours' => 'Hours',
				'phone' => 'Phone',
			],
		] );
	}

	public function render() {
		echo esc_html( $this->get_settings( 'field' ) );
	}
}
```

Convertible control types include: `text`, `textarea`, `select`, `number`, `switcher`, `choose`, `query`, `date_time`, `media`.

## Force atomic conversion for non-standard controls

```php
public function get_editor_config() {
	return array_merge( parent::get_editor_config(), [
		'force_convert_to_atomic' => true,
	] );
}
```

Unsupported controls are skipped instead of excluding the whole tag.

## Dynamic select options (atomic picker)

```php
add_filter( 'elementor/atomic/dynamic-tags/select_control_options', function ( $options, $control, $tag ) {
	if ( 'store-hours' === ( $tag['name'] ?? '' ) ) {
		$options['custom:key'] = 'Custom label';
	}
	return $options;
}, 10, 3 );
```

## Auto-mapping behavior

`Dynamic_Prop_Types_Mapping` maps prop **types** to tag categories (e.g. `String_Prop_Type` → `TEXT_CATEGORY`), then unions `Dynamic_Prop_Type` and sets `allowed_tag_names`.

- Widget props: `elementor/atomic-widgets/props-schema`
- Style colors only: `elementor/atomic-widgets/styles/schema`
- Opt out: `->meta( Dynamic_Prop_Type::ignore() )`

Render uses `Dynamic_Transformer` on:

- `elementor/atomic-widgets/settings/transformers/register`
- `elementor/atomic-widgets/styles/transformers/register`

Import/export uses `ImportExport\Dynamic_Transformer` on import/export transformer hooks.

## Saved binding shape

```json
{
  "$$type": "dynamic",
  "value": {
    "name": "store-hours",
    "group": "my-plugin",
    "settings": { "field": "hours" }
  }
}
```
