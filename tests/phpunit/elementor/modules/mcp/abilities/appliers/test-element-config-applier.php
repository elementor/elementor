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
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Sensitivity;
use Elementor\Modules\Mcp\Abilities\Appliers\Element_Config_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
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

	const V3_CONTROLS = [
		'nav-menu' => [
			'menu' => [ 'type' => 'select', 'options' => [ 'primary' => 'Primary' ] ],
			'layout' => [ 'type' => 'select', 'options' => [ 'horizontal' => 'Horizontal', 'vertical' => 'Vertical' ] ],
		],
		'theme-post-title' => [
			'title' => [ 'type' => 'text' ],
			'header_size' => [ 'type' => 'select', 'options' => [ 'h1' => 'H1', 'h2' => 'H2' ] ],
			'link' => [
				'type' => 'url',
				'dynamic' => [ 'active' => true, 'categories' => [ 'url' ], 'property' => 'url' ],
			],
		],
	];

	protected function setUp(): void {
		parent::setUp();

		V3_Widget_Map_Registry::set_instance( $this->v3_map_registry() );
	}

	protected function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	private function v3_map_registry(): V3_Widget_Map_Registry {
		$nav_menu = V3_Widget_Map::make( 'nav-menu' )
			->description( 'Nav menu.' )
			->settings( [
				'menu' => V3_Setting::bind_to( 'menu' )->enum_from_control(),
				'layout' => V3_Setting::bind_to( 'layout' )->enum_from_control(),
			] )
			->default_target( Style_Target::make( 'menu' ) );

		$post_title = V3_Widget_Map::make( 'theme-post-title' )
			->description( 'Post title.' )
			->settings( [
				'title' => V3_Setting::bind_to( 'title' )->string(),
				'header_size' => V3_Setting::bind_to( 'header_size' )->enum_from_control(),
				'link' => V3_Setting::bind_to( 'link' )->link()->dynamic(),
			] )
			->default_target( Style_Target::make( 'title' ) );

		return new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler( [] ),
			static fn( string $widget_type ) => self::V3_CONTROLS[ $widget_type ] ?? null,
			[
				'nav-menu' => $nav_menu,
				'theme-post-title' => $post_title,
			],
			static fn() => false
		);
	}

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
		$this->assertSame( 'elementor_invalid_component_instance', $result['error']->get_error_code() );
		$this->assertStringContainsString( 'my-hero', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'Component 42 not found', $result['error']->get_error_message() );
		$this->assertSame( [], $e_component_node['settings'] );
	}

	public function test_apply__v3_map_setting_keys_merge_as_plain_settings() {
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
			[
				'nav-menu' => [
					'controls' => [
						'menu' => [ 'type' => 'select', 'options' => [ 'primary' => 'Primary' ] ],
						'layout' => [ 'type' => 'select', 'options' => [ 'horizontal' => 'Horizontal', 'vertical' => 'Vertical' ] ],
					],
				],
			]
		);

		// Assert
		$this->assertNull( $result['error'] );
		$this->assertSame( 'primary', $nav['settings']['menu'] );
		$this->assertSame( 'horizontal', $nav['settings']['layout'] );
	}

	public function test_apply__v3_rejects_settings_outside_the_map() {
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

	public function test_apply__v3_skips_array_value_on_scalar_slot_with_warning() {
		$applier = $this->make_applier();

		$node = [
			'elType' => 'widget',
			'widgetType' => 'theme-post-title',
			'settings' => [],
		];
		$index = [ 'title' => &$node ];

		$widget_configs = [
			'theme-post-title' => [
				'controls' => [
					'title' => [ 'type' => 'text' ],
				],
			],
		];

		$result = $applier->apply(
			$index,
			[
				'title' => [
					'title' => [ 'not' => 'a scalar' ],
				],
			],
			$widget_configs
		);

		$this->assertNull( $result['error'] );
		$this->assertSame( [ 'prop_value_invalid' ], array_column( $result['warnings']->all(), 'code' ) );
		$this->assertStringContainsString( '"title"', $result['warnings']->all()[0]['message'] );
		$this->assertArrayNotHasKey( 'title', $node['settings'] );
	}

	public function test_apply__v3_merges_valid_keys_and_warns_about_invalid_keys() {
		$applier = $this->make_applier();

		$node = [
			'elType' => 'widget',
			'widgetType' => 'theme-post-title',
			'settings' => [],
		];
		$index = [ 'title' => &$node ];

		$widget_configs = [
			'theme-post-title' => [
				'controls' => [
					'title' => [ 'type' => 'text' ],
					'header_size' => [
						'type' => 'select',
						'options' => [ 'h1' => 'H1', 'h2' => 'H2' ],
					],
				],
			],
		];

		$result = $applier->apply(
			$index,
			[
				'title' => [
					'title' => 'Hello world',
					'header_size' => 'h9',
				],
			],
			$widget_configs
		);

		$this->assertNull( $result['error'] );
		$this->assertSame( [ 'prop_value_invalid' ], array_column( $result['warnings']->all(), 'code' ) );
		$this->assertStringContainsString( '"header_size"', $result['warnings']->all()[0]['message'] );
		$this->assertSame( 'Hello world', $node['settings']['title'] );
		$this->assertArrayNotHasKey( 'header_size', $node['settings'] );
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
					'link' => [ 'name' => 'post-url', 'settings' => [] ],
				],
			],
			$widget_configs
		);

		$this->assertNull( $result['error'] );
		$this->assertArrayNotHasKey( 'link', $node['settings'] );
		$this->assertArrayHasKey( '__dynamic__', $node['settings'] );
		$this->assertStringContainsString( 'name="post-url"', $node['settings']['__dynamic__']['link'] );
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
		$this->assertStringContainsString( 'my-hero', $result['error']->get_error_message() );
		$warning = $result['warnings']->all()[0] ?? [];
		$this->assertSame( 'hero-title', $warning['config_id'] ?? null );
		$this->assertSame( 'prop_value_invalid', $warning['code'] ?? null );
	}

	public function test_apply__v4_stores_a_boolean_string_as_the_boolean_it_names() {
		// Arrange.
		$hero_title = [
			'widgetType' => 'mock-widget',
			'settings' => [],
		];
		$index = [ 'hero-title' => &$hero_title ];

		// Act.
		$this->apply_to_mock_widget( $index, [
			'title' => 'Hello',
			'visible' => 'false',
		] );

		// Assert.
		$this->assertSame(
			[
				'$$type' => 'boolean',
				'value' => false,
			],
			$hero_title['settings']['visible']
		);
	}

	public function test_apply__v4_still_converts_a_number_sent_for_a_string() {
		// Arrange.
		$hero_title = [
			'widgetType' => 'mock-widget',
			'settings' => [],
		];
		$index = [ 'hero-title' => &$hero_title ];

		// Act.
		$this->apply_to_mock_widget( $index, [ 'title' => 2 ] );

		// Assert.
		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => '2',
			],
			$hero_title['settings']['title']
		);
	}

	/**
	 * @dataProvider provide_v4_values_the_published_schema_rejects
	 */
	public function test_apply__v4_reports_the_reason_from_the_published_schema( string $key, $value, string $expected_reason ) {
		// Arrange.
		$hero_title = [
			'widgetType' => 'mock-widget',
			'settings' => [],
		];
		$index = [ 'hero-title' => &$hero_title ];

		// Act.
		$result = $this->apply_to_mock_widget( $index, [ $key => $value ] );

		// Assert.
		$warning = $result['warnings']->all()[0] ?? [];
		$this->assertSame( 'prop_value_invalid', $warning['code'] ?? null );
		$this->assertStringContainsString( $expected_reason, $warning['message'] ?? '' );
		$this->assertArrayNotHasKey( $key, $hero_title['settings'] );
	}

	public function provide_v4_values_the_published_schema_rejects(): array {
		return [
			'boolean word' => [ 'visible', 'no', 'visible is not of type boolean' ],
			'number text' => [ 'count', 'many', 'count is not of type number' ],
			'enum outside the list' => [ 'tag', 'p', 'tag is not one of h1 and h2' ],
		];
	}

	public function test_apply__v4_skips_sensitive_props_and_keeps_the_stored_value() {
		// Arrange.
		$stored_api_key = [
			'$$type' => 'string',
			'value' => 'stored-secret',
		];
		$form = [
			'widgetType' => 'sensitive-widget',
			'settings' => [ 'api_key' => $stored_api_key ],
		];
		$index = [ 'hero-title' => &$form ];

		// Act.
		$result = $this->make_applier()->apply(
			$index,
			[
				'hero-title' => [
					'title' => 'Hello',
					'api_key' => 'agent-secret',
				],
			],
			[
				'sensitive-widget' => [ 'class' => Sensitive_Settings_Widget::class ],
			]
		);

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( $stored_api_key, $form['settings']['api_key'] );
		$this->assertSame( 'Hello', $form['settings']['title']['value'] );

		$warning = $result['warnings']->all()[0] ?? [];
		$this->assertSame( 'prop_not_in_schema', $warning['code'] ?? null );
		$this->assertStringContainsString( '"api_key"', $warning['message'] ?? '' );
	}

	public function test_apply__v4_does_not_clear_sensitive_props() {
		// Arrange.
		$stored_api_key = [
			'$$type' => 'string',
			'value' => 'stored-secret',
		];
		$form = [
			'widgetType' => 'sensitive-widget',
			'settings' => [ 'api_key' => $stored_api_key ],
		];
		$index = [ 'hero-title' => &$form ];

		// Act.
		$result = $this->make_applier()->apply(
			$index,
			[ 'hero-title' => [ 'api_key' => null ] ],
			[
				'sensitive-widget' => [ 'class' => Sensitive_Settings_Widget::class ],
			]
		);

		// Assert.
		$this->assertSame( $stored_api_key, $form['settings']['api_key'] );
		$this->assertSame( 'prop_not_in_schema', $result['warnings']->all()[0]['code'] ?? null );
	}

	public function test_apply__v4_still_writes_props_that_are_only_not_exportable() {
		// Arrange.
		$form = [
			'widgetType' => 'sensitive-widget',
			'settings' => [],
		];
		$index = [ 'hero-title' => &$form ];

		// Act.
		$result = $this->make_applier()->apply(
			$index,
			[ 'hero-title' => [ 'list_id' => 'abc' ] ],
			[
				'sensitive-widget' => [ 'class' => Sensitive_Settings_Widget::class ],
			]
		);

		// Assert.
		$this->assertTrue( $result['warnings']->is_empty() );
		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'abc',
			],
			$form['settings']['list_id']
		);
	}

	private function apply_to_mock_widget( array &$index, array $settings ): array {
		return $this->make_applier()->apply(
			$index,
			[ 'hero-title' => $settings ],
			[
				'mock-widget' => [ 'class' => Plain_Settings_Widget::class ],
			]
		);
	}
}

class Plain_Settings_Widget {
	public static function get_props_schema(): array {
		return [
			'title' => String_Prop_Type::make()->required(),
			'count' => Number_Prop_Type::make(),
			'visible' => Boolean_Prop_Type::make(),
			'tag' => String_Prop_Type::make()->enum( [ 'h1', 'h2' ] ),
		];
	}
}

class Sensitive_Settings_Widget {
	public static function get_props_schema(): array {
		return [
			'title' => String_Prop_Type::make(),
			'api_key' => String_Prop_Type::make()->meta( Prop_Sensitivity::sensitive() ),
			'list_id' => String_Prop_Type::make()->meta( Prop_Sensitivity::not_exportable() ),
		];
	}
}
