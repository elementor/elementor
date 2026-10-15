<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Compiled_V3_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Diagnostics;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use PHPUnit\Framework\TestCase;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Widget_Map_Compiler extends TestCase {

	const WIDGET_TYPE = 'heading';

	private V3_Map_Diagnostics $diagnostics;

	public function setUp(): void {
		parent::setUp();

		$this->diagnostics = new V3_Map_Diagnostics();
	}

	private function reason( WP_Error $error ): string {
		$data = $error->get_error_data( $error->get_error_code() );

		return is_array( $data ) ? (string) ( $data['reason'] ?? '' ) : '';
	}

	private function style_schema(): array {
		return [
			'color' => Color_Prop_Type::make(),
			'font-size' => Size_Prop_Type::make(),
			'padding' => Union_Prop_Type::make()
				->add_prop_type( Dimensions_Prop_Type::make() )
				->add_prop_type( Size_Prop_Type::make() ),
		];
	}

	private function compile( V3_Widget_Map $map, ?array $controls = null, string $expected_widget_type = self::WIDGET_TYPE ) {
		return ( new V3_Widget_Map_Compiler( $this->style_schema() ) )
			->compile( $map, $controls ?? $this->controls(), $this->diagnostics, $expected_widget_type );
	}

	private function map_with_target( Style_Target $target ): V3_Widget_Map {
		return V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Heading widget.' )
			->settings( [
				'title' => V3_Setting::bind_to( 'title' )->string(),
			] )
			->default_target( $target );
	}

	private function valid_map(): V3_Widget_Map {
		return $this->map_with_target(
			Style_Target::make( 'heading' )
				->label( 'Heading' )
				->bind( 'color', V3_Control::bind_to( 'title_color' ) )
		);
	}

	private function controls(): array {
		return [
			'title' => [ 'type' => 'text' ],
			'title_color' => [ 'type' => 'color' ],
			'title_hover_color' => [ 'type' => 'color' ],
			'title_size' => [ 'type' => 'number' ],
			'typography_typography' => [ 'type' => 'popover_toggle' ],
			'typography_font_size' => [
				'type' => 'slider',
				'is_responsive' => true,
			],
			'padding' => [ 'type' => 'dimensions' ],
			'padding_horizontal' => [ 'type' => 'slider' ],
			'padding_vertical' => [ 'type' => 'slider' ],
		];
	}

	private function compile_bindings( Style_Target $target, ?array $controls = null ): array {
		$compiled = $this->compile( $this->map_with_target( $target ), $controls );

		$this->assertInstanceOf( Compiled_V3_Map::class, $compiled );

		return $compiled->get_style_bindings();
	}

	private function dropped_reasons(): array {
		return array_column( $this->diagnostics->for_widget( self::WIDGET_TYPE ), 'reason', 'entry' );
	}

	public function test_compile__returns_compiled_map_on_valid_input() {
		// Act.
		$result = $this->compile( $this->valid_map() );

		// Assert.
		$this->assertInstanceOf( Compiled_V3_Map::class, $result );
		$this->assertSame( self::WIDGET_TYPE, $result->get_widget_type() );
		$this->assertSame( 'Heading widget.', $result->get_description() );
		$this->assertSame( 'heading', $result->get_default_target() );
		$this->assertSame( 'Heading', $result->get_targets()['heading']->get_label() );

		$binding = $result->get_style_bindings()[0];

		$this->assertSame( 'color', $binding->get_prop() );
		$this->assertSame( 'default', $binding->get_state() );
		$this->assertSame( 'title_color', $binding->get_setting() );
		$this->assertSame( 'color', $binding->get_control_type() );
		$this->assertFalse( $binding->is_responsive() );
		$this->assertNull( $binding->get_sides() );
		$this->assertSame( [], $binding->get_dependency_values() );
		$this->assertSame( 'color', $binding->get_read_type() );
		$this->assertTrue( $this->diagnostics->is_empty() );
	}

	public function test_compile__exposes_settings_with_control_key() {
		// Arrange.
		$map = $this->valid_map()->settings( [
			'heading_text' => V3_Setting::bind_to( 'title' )->string(),
		] );

		// Act.
		$result = $this->compile( $map );

		// Assert.
		$this->assertSame( 'title', $result->get_settings()['heading_text']->get_control_key() );
		$this->assertSame( [ 'heading_text' => [ 'type' => 'string' ] ], $result->get_setting_schemas() );
	}

	public function test_compile__drops_binding_when_control_is_missing() {
		// Arrange.
		$target = Style_Target::make( 'heading' )
			->bind( 'color', V3_Control::bind_to( 'nonexistent_color' ) )
			->bind( 'font-size', V3_Control::bind_to( 'typography_font_size' ) );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertCount( 1, $bindings );
		$this->assertSame( 'font-size', $bindings[0]->get_prop() );
		$this->assertSame( [ 'heading.color' => 'missing_control' ], $this->dropped_reasons() );
	}

	public function test_compile__drops_binding_when_prop_is_not_in_style_schema() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind( 'colour', V3_Control::bind_to( 'title_color' ) );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertSame( [], $bindings );
		$this->assertSame( [ 'heading.colour' => 'unknown_style_prop' ], $this->dropped_reasons() );
	}

	public function test_compile__drops_binding_when_no_adapter_connects_prop_and_control_type() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind( 'color', V3_Control::bind_to( 'title_size' ) );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertSame( [], $bindings );
		$this->assertSame( [ 'heading.color' => 'incompatible_control' ], $this->dropped_reasons() );
	}

	public function test_compile__picks_adapter_for_any_variant_of_a_union_prop() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind( 'padding', V3_Control::bind_to( 'padding' ) );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertSame( 'dimensions', $bindings[0]->get_read_type() );
	}

	public function test_compile__drops_responsive_binding_on_non_responsive_control() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind( 'color', V3_Control::bind_to( 'title_color' )->responsive() );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertSame( [], $bindings );
		$this->assertSame( [ 'heading.color' => 'incompatible_responsive_control' ], $this->dropped_reasons() );
	}

	public function test_compile__accepts_responsive_binding_against_duplicated_device_controls() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind( 'color', V3_Control::bind_to( 'title_color' )->responsive() );
		$controls = array_merge( $this->controls(), [ 'title_color_mobile' => [ 'type' => 'color' ] ] );

		// Act.
		$bindings = $this->compile_bindings( $target, $controls );

		// Assert.
		$this->assertTrue( $bindings[0]->is_responsive() );
	}

	public function test_compile__derives_requirements_from_positive_and_toggle_conditions() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind( 'font-size', V3_Control::bind_to( 'typography_font_size' )->responsive() );
		$controls = array_merge( $this->controls(), [
			'typography_typography' => [
				'type' => 'popover_toggle',
				'return_value' => 'custom',
			],
			'layout' => [ 'type' => 'select' ],
			'typography_font_size' => [
				'type' => 'slider',
				'is_responsive' => true,
				'condition' => [
					'typography_typography!' => '',
					'title_tag' => 'h2',
					'layout!' => 'dropdown',
				],
			],
			'title_tag' => [ 'type' => 'select' ],
		] );

		// Act.
		$bindings = $this->compile_bindings( $target, $controls );

		// Assert.
		$this->assertSame( [
			'typography_typography' => 'custom',
			'title_tag' => 'h2',
		], $bindings[0]->get_dependency_values() );
	}

	public function test_compile__prefers_explicit_requirements_over_the_control_condition() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind(
			'font-size',
			V3_Control::bind_to( 'typography_font_size' )->requires( [ 'typography_typography' => 'custom' ] )
		);
		$controls = array_merge( $this->controls(), [
			'typography_font_size' => [
				'type' => 'slider',
				'condition' => [ 'title_size' => '10' ],
			],
		] );

		// Act.
		$bindings = $this->compile_bindings( $target, $controls );

		// Assert.
		$this->assertSame( [ 'typography_typography' => 'custom' ], $bindings[0]->get_dependency_values() );
	}

	public function test_compile__drops_binding_when_explicit_requirement_targets_missing_control() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind(
			'font-size',
			V3_Control::bind_to( 'typography_font_size' )->requires( [ 'typography_typography' => 'custom' ] )
		);
		$controls = $this->controls();
		unset( $controls['typography_typography'] );

		// Act.
		$bindings = $this->compile_bindings( $target, $controls );

		// Assert.
		$this->assertSame( [], $bindings );
		$this->assertSame( [ 'heading.font-size' => 'invalid_requirement' ], $this->dropped_reasons() );
	}

	public function test_compile__accepts_non_overlapping_side_bindings_on_one_prop() {
		// Arrange.
		$target = Style_Target::make( 'heading' )
			->bind( 'padding', V3_Control::bind_to( 'padding_horizontal' )->sides( 'inline-start', 'inline-end' ) )
			->bind( 'padding', V3_Control::bind_to( 'padding_vertical' )->sides( 'block-start', 'block-end' ) );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertCount( 2, $bindings );
		$this->assertSame( [ 'inline-start', 'inline-end' ], $bindings[0]->get_sides() );
	}

	public function test_compile__drops_later_binding_that_overlaps_an_earlier_one() {
		// Arrange.
		$target = Style_Target::make( 'heading' )
			->bind( 'padding', V3_Control::bind_to( 'padding_horizontal' )->sides( 'inline-start', 'inline-end' ) )
			->bind( 'padding', V3_Control::bind_to( 'padding' ) );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertCount( 1, $bindings );
		$this->assertSame( 'padding_horizontal', $bindings[0]->get_setting() );
		$this->assertSame( [ 'heading.padding' => 'overlapping_bindings' ], $this->dropped_reasons() );
	}

	public function test_compile__drops_binding_when_side_name_is_unknown() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind( 'padding', V3_Control::bind_to( 'padding_horizontal' )->sides( 'left' ) );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertSame( [], $bindings );
		$this->assertSame( [ 'heading.padding' => 'invalid_sides' ], $this->dropped_reasons() );
	}

	public function test_compile__drops_binding_when_state_is_invalid() {
		// Arrange.
		$target = Style_Target::make( 'heading' )->bind( 'color', V3_Control::bind_to( 'title_color' ), 'focus' );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertSame( [], $bindings );
		$this->assertSame( [ 'heading.color:focus' => 'invalid_state_key' ], $this->dropped_reasons() );
	}

	public function test_compile__accepts_states_declared_by_the_target() {
		// Arrange.
		$target = Style_Target::make( 'heading' )
			->states( 'current' )
			->bind( 'color', V3_Control::bind_to( 'title_color' ) )
			->bind( 'color', V3_Control::bind_to( 'title_hover_color' ), 'current' );

		// Act.
		$compiled = $this->compile( $this->map_with_target( $target ) )->get_targets()['heading'];

		// Assert.
		$this->assertCount( 2, $compiled->get_bindings() );
		$this->assertSame( [ 'default', 'current' ], $compiled->get_states() );
		$this->assertSame( [], $this->dropped_reasons() );
	}

	public function test_compile__drops_declared_state_that_is_not_a_css_identifier() {
		// Arrange.
		$target = Style_Target::make( 'heading' )
			->states( 'Not A State' )
			->bind( 'color', V3_Control::bind_to( 'title_color' ), 'Not A State' );

		// Act.
		$bindings = $this->compile_bindings( $target );

		// Assert.
		$this->assertSame( [], $bindings );
		$this->assertSame( [ 'heading.color:Not A State' => 'invalid_state_key' ], $this->dropped_reasons() );
	}

	public function test_compile__fails_map_when_alias_is_invalid() {
		// Arrange.
		$map = $this->map_with_target( Style_Target::make( 'Invalid_Alias' ) );

		// Act.
		$result = $this->compile( $map );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_alias', $this->reason( $result ) );
		$this->assertSame( [ 'map' => 'invalid_alias' ], $this->dropped_reasons() );
	}

	public function test_compile__fails_map_when_alias_is_duplicated() {
		// Arrange.
		$map = $this->valid_map()->targets( Style_Target::make( 'heading' ) );

		// Act.
		$result = $this->compile( $map );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'duplicate_alias', $this->reason( $result ) );
	}

	public function test_compile__fails_map_without_default_target() {
		// Arrange.
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )->description( 'Heading widget.' );

		// Act.
		$result = $this->compile( $map );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_default_style_target', $this->reason( $result ) );
	}

	public function test_compile__fails_map_without_description() {
		// Arrange.
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )->default_target( Style_Target::make( 'heading' ) );

		// Act.
		$result = $this->compile( $map );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_field', $this->reason( $result ) );
	}

	public function test_compile__fails_map_when_widget_type_mismatch() {
		// Act.
		$result = $this->compile( $this->valid_map(), null, 'button' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'widget_type_mismatch', $this->reason( $result ) );
	}

	public function test_compile__compiles_secondary_targets_under_their_alias() {
		// Arrange.
		$map = $this->valid_map()->targets(
			Style_Target::make( 'title-link' )
				->label( 'Title link' )
				->bind( 'color', V3_Control::bind_to( 'title_color' ), 'hover' )
		);

		// Act.
		$result = $this->compile( $map );

		// Assert.
		$this->assertSame( [ 'heading', 'title-link' ], array_keys( $result->get_targets() ) );
		$this->assertSame( 'hover', $result->get_targets()['title-link']->get_bindings()[0]->get_state() );
	}

	public function test_compile__accepts_link_setting_against_url_control() {
		// Arrange.
		$map = $this->valid_map()->settings( [ 'link' => V3_Setting::bind_to( 'link' )->link() ] );
		$controls = array_merge( $this->controls(), [ 'link' => [ 'type' => 'url' ] ] );

		// Act.
		$result = $this->compile( $map, $controls );

		// Assert.
		$this->assertArrayHasKey( 'link', $result->get_settings() );
		$this->assertTrue( $this->diagnostics->is_empty() );
	}

	public function test_compile__drops_link_setting_on_non_url_control() {
		// Arrange.
		$map = $this->valid_map()->settings( [
			'title' => V3_Setting::bind_to( 'title' )->string(),
			'link' => V3_Setting::bind_to( 'link' )->link(),
		] );
		$controls = array_merge( $this->controls(), [ 'link' => [ 'type' => 'text' ] ] );

		// Act.
		$result = $this->compile( $map, $controls );

		// Assert.
		$this->assertSame( [ 'title' ], array_keys( $result->get_settings() ) );
		$this->assertSame( [ 'setting.link' => 'incompatible_setting_shape' ], $this->dropped_reasons() );
	}

	public function test_compile__drops_dynamic_setting_when_control_is_not_dynamic_capable() {
		// Arrange.
		$map = $this->valid_map()->settings( [ 'title' => V3_Setting::bind_to( 'title' )->string()->dynamic() ] );

		// Act.
		$result = $this->compile( $map );

		// Assert.
		$this->assertSame( [], $result->get_settings() );
		$this->assertSame( [ 'setting.title' => 'incompatible_dynamic_control' ], $this->dropped_reasons() );
	}

	public function test_compile__drops_settings_whose_adapter_does_not_support_the_control() {
		// Arrange.
		$map = $this->valid_map()->settings( [
			'title' => V3_Setting::bind_to( 'title' )->string(),
			'layout' => V3_Setting::bind_to( 'title' )->enum_from_control(),
			'stretch' => V3_Setting::bind_to( 'title' )->switcher(),
			'icon' => V3_Setting::bind_to( 'title' )->icons(),
		] );

		// Act.
		$result = $this->compile( $map );

		// Assert.
		$this->assertSame( [ 'title' ], array_keys( $result->get_settings() ) );
		$this->assertSame( [
			'setting.layout' => 'incompatible_setting_shape',
			'setting.stretch' => 'incompatible_setting_shape',
			'setting.icon' => 'incompatible_setting_shape',
		], $this->dropped_reasons() );
	}

	public function test_compile__builds_plain_schemas_from_control_options_and_conditions() {
		// Arrange.
		$map = $this->valid_map()->settings( [
			'layout' => V3_Setting::bind_to( 'layout' )->enum_from_control()->default( 'horizontal' ),
			'stretch' => V3_Setting::bind_to( 'stretch' )->switcher(),
		] );
		$controls = array_merge( $this->controls(), [
			'layout' => [
				'type' => 'select',
				'options' => [
					'horizontal' => 'Horizontal',
					'dropdown' => 'Dropdown',
				],
			],
			'stretch' => [
				'type' => 'switcher',
				'condition' => [ 'layout!' => 'dropdown' ],
			],
		] );

		// Act.
		$schemas = $this->compile( $map, $controls )->get_setting_schemas();

		// Assert.
		$this->assertSame( [
			'type' => 'string',
			'enum' => [ 'horizontal', 'dropdown' ],
			'default' => 'horizontal',
		], $schemas['layout'] );
		$this->assertSame( [
			'type' => 'boolean',
			'description' => "Only takes effect when layout is not 'dropdown'.",
		], $schemas['stretch'] );
	}

	public function test_compile__drops_setting_when_control_is_missing() {
		// Arrange.
		$map = $this->valid_map()->settings( [ 'subtitle' => V3_Setting::bind_to( 'subtitle' )->string() ] );

		// Act.
		$result = $this->compile( $map );

		// Assert.
		$this->assertSame( [], $result->get_settings() );
		$this->assertSame( [ 'setting.subtitle' => 'missing_control' ], $this->dropped_reasons() );
	}
}
