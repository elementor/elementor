# Example: Author atomic widget

> Skill: [author-atomic-widget](../../.cursor/skills/author-atomic-widget/SKILL.md)  
> Docs: [atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md)  
> Verdict: **Relevant** — primary path for new v4 elements. Skill skeleton had wrong namespaces; this example is corrected.

## Minimal widget (PHP)

Adapted from `Atomic_Divider` in `modules/atomic-widgets/elements/atomic-divider/`.

```php
<?php

namespace MyPlugin\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

class My_Atomic_Greeting extends Atomic_Widget_Base {
	use Has_Template;

	public static function get_element_type(): string {
		return 'e-my-greeting';
	}

	public function get_title() {
		return esc_html__( 'Greeting', 'my-plugin' );
	}

	public function get_icon() {
		return 'eicon-heading';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'title' => String_Prop_Type::make()->default( 'Hello' ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'my-plugin' ) )
				->set_id( 'content' )
				->set_items( [
					Text_Control::bind_to( 'title' )
						->set_label( __( 'Title', 'my-plugin' ) ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			'base' => Style_Definition::make()
				->add_variant( Style_Variant::make() ),
		];
	}

	protected function get_templates(): array {
		return [
			'my-plugin/elements/my-greeting' => __DIR__ . '/my-greeting.html.twig',
		];
	}
}
```

## Twig template

```twig
{% set classes = settings.classes | merge( [ base_styles.base ] ) | join(' ') %}
<p class="{{ classes }}" data-interaction-id="{{ interaction_id }}" {{ settings.attributes | raw }}>
	{{ settings.title }}
</p>
```

## Registration

```php
add_action( 'elementor/widgets/register', function ( \Elementor\Widgets_Manager $manager ) {
	$manager->register( new \MyPlugin\AtomicWidgets\My_Atomic_Greeting() );
} );
```

## Test / MCP JSON builder

```php
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

$element = My_Atomic_Greeting::generate()
	->settings( [
		'title' => String_Prop_Type::generate( 'Hello, world!' ),
	] )
	->build();
```

## Container note

Containers extend `Atomic_Element_Base`, use `Has_Element_Template`, set `$this->meta( 'is_container', true )`, and register on `elementor/elements/elements_registered`. `Element_Builder::make()` uses `get_type()`, not `get_element_type()`.

## Skill gaps fixed here

- Base classes live under `Elements\Base\`, not `Elements\`.
- Controls use `Section::make()->set_items([ Text_Control::bind_to( 'key' ) ])`, not `add_control()`.
- Primitives live under `PropTypes\Primitives\`.
- `Has_Template` requires `get_templates()`.
- Requires experiment `e_atomic_elements`.
