<?php

namespace Elementor\Testing\Modules\Mcp\Build_Composition;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Boolean_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Passthrough_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Number_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\String_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\Element_Config_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Hoister;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Stub_Dynamic_Tags_Manager;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/v3/stub-dynamic-tags-manager.php';

class Test_Element_Config_Applier extends TestCase {

	private function make_plain_values_resolver(): Plain_Values_Resolver {
		$registry = new Plain_Resolvers_Registry();
		$registry->register_fallback( new Passthrough_Plain_Resolver() );
		$registry->register( String_Prop_Type::get_key(), new String_Plain_Resolver() );
		$registry->register( Number_Prop_Type::get_key(), new Number_Plain_Resolver() );
		$registry->register( Boolean_Prop_Type::get_key(), new Boolean_Plain_Resolver() );

		return new Plain_Values_Resolver( $registry );
	}

	private function make_applier( ?V3_Dynamic_Hoister $hoister = null ): Element_Config_Applier {
		return new Element_Config_Applier(
			new Widget_Type_Resolver( new Xml_Parser() ),
			$this->make_plain_values_resolver(),
			$hoister ?? new V3_Dynamic_Hoister( new Stub_Dynamic_Tags_Manager() )
		);
	}

	public function test_apply__resolves_plain_scalar_settings_to_envelopes() {
		$applier = $this->make_applier();

		$hero_title = [
			'widgetType' => 'mock-widget',
			'settings' => [],
		];

		$index = [
			'hero-title' => &$hero_title,
		];

		$widget_configs = [
			'mock-widget' => [
				'class' => Plain_Settings_Widget::class,
			],
		];

		$result = $applier->apply(
			$index,
			[
				'hero-title' => [
					'title' => 'Hello world',
					'count' => 3,
					'visible' => true,
				],
			],
			$widget_configs
		);

		$this->assertNull( $result['error'] );
		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'Hello world',
			],
			$hero_title['settings']['title']
		);
		$this->assertSame(
			[
				'$$type' => 'number',
				'value' => 3,
			],
			$hero_title['settings']['count']
		);
		$this->assertSame(
			[
				'$$type' => 'boolean',
				'value' => true,
			],
			$hero_title['settings']['visible']
		);
	}

	public function test_apply__errors_when_e_component_entry_has_no_document_context() {
		// Arrange
		$applier = $this->make_applier();

		$e_component_node = [
			'elType' => 'widget',
			'widgetType' => 'e-component',
			'settings' => [],
		];

		$index = [ 'my-hero' => &$e_component_node ];

		// Act
		$result = $applier->apply(
			$index,
			[
				'my-hero' => [
					'component_id' => 42,
					'overrides' => [ 'title' => 'Welcome' ],
				],
			],
			[]
		);

		// Assert
		$this->assertNotNull( $result['error'] );
		$this->assertSame( 'elementor_invalid_settings', $result['error']->get_error_code() );
		$this->assertStringContainsString( 'my-hero', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'document context', $result['error']->get_error_message() );
		$this->assertSame( [], $e_component_node['settings'] );
	}

	public function test_apply__v3_allowlisted_keys_merge_as_plain_settings() {
		// Arrange
		$applier = $this->make_applier();

		$nav = [
			'elType' => 'widget',
			'widgetType' => 'nav-menu',
			'settings' => [],
		];
		$index = [ 'main-nav' => &$nav ];

		// Act
		$result = $applier->apply(
			$index,
			[
				'main-nav' => [
					'menu' => 'primary',
					'layout' => 'horizontal',
				],
			],
			[]
		);

		// Assert
		$this->assertNull( $result['error'] );
		$this->assertSame( 'primary', $nav['settings']['menu'] );
		$this->assertSame( 'horizontal', $nav['settings']['layout'] );
	}

	public function test_apply__v3_rejects_non_allowlisted_settings() {
		// Arrange
		$applier = $this->make_applier();

		$nav = [
			'elType' => 'widget',
			'widgetType' => 'nav-menu',
			'settings' => [],
		];
		$index = [ 'main-nav' => &$nav ];

		// Act
		$result = $applier->apply(
			$index,
			[
				'main-nav' => [
					'menu' => 'primary',
					'color_menu_item' => '#ff0000',
				],
			],
			[]
		);

		// Assert
		$this->assertNotNull( $result['error'] );
		$this->assertSame( 'elementor_invalid_settings', $result['error']->get_error_code() );
		$this->assertStringContainsString( 'color_menu_item', $result['error']->get_error_message() );
		$this->assertArrayNotHasKey( 'menu', $nav['settings'] );
	}

	public function test_apply__v3_dynamic_tag_on_url_control_is_hoisted_into__dynamic__() {
		$manager = new Stub_Dynamic_Tags_Manager();
		$manager->add_stub_tag( 'post-url', [ 'url' ] );
		$hoister = new V3_Dynamic_Hoister( $manager );
		$applier = $this->make_applier( $hoister );

		$node = [
			'elType' => 'widget',
			'widgetType' => 'theme-post-title',
			'settings' => [],
		];
		$index = [ 'title' => &$node ];

		$widget_configs = [
			'theme-post-title' => [
				'controls' => [
					'link' => [
						'type' => 'url',
						'dynamic' => [ 'active' => true, 'categories' => [ 'url' ], 'property' => 'url' ],
					],
				],
			],
		];

		$result = $applier->apply(
			$index,
			[
				'title' => [
					'link' => [ 'url' => [ 'name' => 'post-url', 'settings' => [] ] ],
				],
			],
			$widget_configs
		);

		$this->assertNull( $result['error'] );
		$this->assertArrayNotHasKey( 'link', $node['settings'] );
		$this->assertArrayHasKey( '__dynamic__', $node['settings'] );
		$this->assertStringContainsString( 'name="post-url"', $node['settings']['__dynamic__']['link'] );
	}

	public function test_apply__v3_dynamic_on_url_control_keeps_sibling_primitive_fields() {
		$manager = new Stub_Dynamic_Tags_Manager();
		$manager->add_stub_tag( 'post-url', [ 'url' ] );
		$hoister = new V3_Dynamic_Hoister( $manager );
		$applier = $this->make_applier( $hoister );

		$node = [
			'elType' => 'widget',
			'widgetType' => 'theme-post-title',
			'settings' => [],
		];
		$index = [ 'title' => &$node ];

		$widget_configs = [
			'theme-post-title' => [
				'controls' => [
					'link' => [
						'type' => 'url',
						'dynamic' => [ 'active' => true, 'categories' => [ 'url' ], 'property' => 'url' ],
					],
				],
			],
		];

		$result = $applier->apply(
			$index,
			[
				'title' => [
					'link' => [
						'url' => [ 'name' => 'post-url', 'settings' => [] ],
						'is_external' => 'on',
					],
				],
			],
			$widget_configs
		);

		$this->assertNull( $result['error'] );
		$this->assertSame( 'on', $node['settings']['link']['is_external'] );
		$this->assertStringContainsString( 'name="post-url"', $node['settings']['__dynamic__']['link'] );
	}

	public function test_apply__v4_unknown_property_warning_includes_legacy_key_hint() {
		$applier = $this->make_applier();

		$hero_section = [
			'widgetType' => 'e-flexbox',
			'settings' => [],
		];
		$index = [ 'hero-section' => &$hero_section ];

		$result = $applier->apply(
			$index,
			[
				'hero-section' => [
					'flex_direction' => 'column',
				],
			],
			[
				'e-flexbox' => [ 'class' => Optional_Settings_Widget::class ],
			]
		);

		$this->assertNull( $result['error'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertStringContainsString( 'flex_direction', $result['warnings'][0] );
		$this->assertStringContainsString( 'flex-direction', $result['warnings'][0] );
		$this->assertStringContainsString( 'style', $result['warnings'][0] );
	}

	public function test_apply__v4_button_size_warning_includes_style_hint() {
		$applier = $this->make_applier();

		$hero_cta = [
			'widgetType' => 'e-button',
			'settings' => [],
		];
		$index = [ 'hero-cta' => &$hero_cta ];

		$result = $applier->apply(
			$index,
			[
				'hero-cta' => [
					'size' => 'lg',
				],
			],
			[
				'e-button' => [ 'class' => Optional_Settings_Widget::class ],
			]
		);

		$this->assertNull( $result['error'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertStringContainsString( 'size', $result['warnings'][0] );
		$this->assertStringContainsString( 'padding and font-size', $result['warnings'][0] );
		$this->assertStringContainsString( 'style', $result['warnings'][0] );
	}

	public function test_apply__v4_unknown_property_warning_stays_terse() {
		$applier = $this->make_applier();

		$hero_title = [
			'widgetType' => 'mock-widget',
			'settings' => [],
		];
		$index = [ 'hero-title' => &$hero_title ];

		$result = $applier->apply(
			$index,
			[
				'hero-title' => [
					'xyz_foo' => 'bar',
				],
			],
			[
				'mock-widget' => [ 'class' => Optional_Settings_Widget::class ],
			]
		);

		$this->assertNull( $result['error'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertSame(
			'[hero-title] Property "xyz_foo" is not supported on element type "mock-widget" and was skipped.',
			$result['warnings'][0]
		);
	}

	public function test_apply__reports_settings_and_component_errors_together() {
		// Arrange
		$applier = $this->make_applier();

		$hero_title = [
			'widgetType' => 'mock-widget',
			'settings' => [],
		];
		$e_component_node = [
			'elType' => 'widget',
			'widgetType' => 'e-component',
			'settings' => [],
		];

		$index = [
			'hero-title' => &$hero_title,
			'my-hero' => &$e_component_node,
		];

		// Act
		$result = $applier->apply(
			$index,
			[
				'hero-title' => [ 'title' => [ 'not' => 'a scalar' ] ],
				'my-hero' => [ 'component_id' => 42 ],
			],
			[
				'mock-widget' => [ 'class' => Plain_Settings_Widget::class ],
			]
		);

		// Assert
		$this->assertNotNull( $result['error'] );
		$this->assertStringContainsString( 'hero-title', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'my-hero', $result['error']->get_error_message() );
	}

}

class Plain_Settings_Widget {
	public static function get_props_schema(): array {
		return [
			'title' => String_Prop_Type::make()->required(),
			'count' => Number_Prop_Type::make(),
			'visible' => Boolean_Prop_Type::make(),
		];
	}
}

class Optional_Settings_Widget {
	public static function get_props_schema(): array {
		return [
			'count' => Number_Prop_Type::make(),
		];
	}
}
