<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use PHPUnit\Framework\TestCase;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Widget_Map_Compiler extends TestCase {

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

	private function compiler(): V3_Widget_Map_Compiler {
		return new V3_Widget_Map_Compiler( $this->style_schema() );
	}

	private function map_with_target( Style_Target $target ): array {
		return [
			'widget_type' => 'heading',
			'description' => 'Heading widget.',
			'catalog_visibility' => V3_Widget_Map_Compiler::CATALOG_VISIBILITY_V4_DISABLED,
			'settings' => [
				'title' => [ 'type' => 'string' ],
			],
			'default_style_target' => 'heading',
			'style_targets' => [
				'heading' => $target,
			],
		];
	}

	private function valid_map(): array {
		return $this->map_with_target(
			Style_Target::make( 'Heading' )->bind( 'color', V3_Control::bind_to( 'title_color' ) )
		);
	}

	private function controls(): array {
		return [
			'title' => [ 'type' => 'text' ],
			'title_color' => [ 'type' => 'color' ],
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

	private function custom_typography_dependency( string $operator = 'eq' ): array {
		return Dependency_Manager::make()
			->where( [
				'operator' => $operator,
				'path' => [ 'typography_typography' ],
				'value' => 'custom',
			] )
			->get();
	}

	public function test_compile__returns_compiled_bindings_on_valid_input() {
		// Arrange.
		$compiler = $this->compiler();

		// Act.
		$result = $compiler->compile( $this->valid_map(), $this->controls(), 'heading' );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame( 'Heading', $result['style_targets']['heading']['label'] );
		$this->assertSame( [
			[
				'prop' => 'color',
				'state' => 'default',
				'setting' => 'title_color',
				'control_type' => 'color',
				'responsive' => false,
				'sides' => null,
				'part' => null,
				'dependency_values' => [],
				'value_map' => null,
				'read_type' => 'color',
				'target' => 'heading',
			],
		], $result['style_targets']['heading']['bindings'] );
	}

	public function test_compile__errors_when_control_is_missing() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind( 'color', V3_Control::bind_to( 'nonexistent_color' ) )
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_control', $this->reason( $result ) );
	}

	public function test_compile__errors_when_prop_is_not_in_style_schema() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind( 'colour', V3_Control::bind_to( 'title_color' ) )
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'unknown_style_prop', $this->reason( $result ) );
	}

	public function test_compile__errors_when_no_adapter_connects_prop_and_control_type() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind( 'color', V3_Control::bind_to( 'title_size' ) )
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'incompatible_control', $this->reason( $result ) );
	}

	public function test_compile__picks_adapter_for_any_variant_of_a_union_prop() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind( 'padding', V3_Control::bind_to( 'padding' ) )
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame( 'dimensions', $result['style_targets']['heading']['bindings'][0]['read_type'] );
	}

	public function test_compile__errors_when_responsive_binding_targets_non_responsive_control() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind( 'color', V3_Control::bind_to( 'title_color' )->responsive() )
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'incompatible_responsive_control', $this->reason( $result ) );
	}

	public function test_compile__accepts_responsive_binding_against_duplicated_device_controls() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind( 'color', V3_Control::bind_to( 'title_color' )->responsive() )
		);
		$controls = array_merge( $this->controls(), [ 'title_color_mobile' => [ 'type' => 'color' ] ] );

		// Act.
		$result = $this->compiler()->compile( $map, $controls, 'heading' );

		// Assert.
		$this->assertIsArray( $result );
	}

	public function test_compile__resolves_eq_dependencies_to_settings_to_fill() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind(
				'font-size',
				V3_Control::bind_to( 'typography_font_size' )->responsive()->set_dependencies( $this->custom_typography_dependency() )
			)
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame(
			[
				'typography_typography' => [
					'value' => 'custom',
					'responsive' => false,
				],
			],
			$result['style_targets']['heading']['bindings'][0]['dependency_values']
		);
	}

	public function test_compile__errors_when_dependency_is_not_eq() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind(
				'font-size',
				V3_Control::bind_to( 'typography_font_size' )->set_dependencies( $this->custom_typography_dependency( 'ne' ) )
			)
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_dependency', $this->reason( $result ) );
	}

	public function test_compile__errors_when_dependency_targets_missing_control() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind(
				'font-size',
				V3_Control::bind_to( 'typography_font_size' )->set_dependencies( $this->custom_typography_dependency() )
			)
		);
		$controls = $this->controls();
		unset( $controls['typography_typography'] );

		// Act.
		$result = $this->compiler()->compile( $map, $controls, 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_dependency', $this->reason( $result ) );
	}

	public function test_compile__accepts_non_overlapping_side_bindings_on_one_prop() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )
				->bind( 'padding', V3_Control::bind_to( 'padding_horizontal' )->sides( 'inline-start', 'inline-end' ) )
				->bind( 'padding', V3_Control::bind_to( 'padding_vertical' )->sides( 'block-start', 'block-end' ) )
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame( [ 'inline-start', 'inline-end' ], $result['style_targets']['heading']['bindings'][0]['sides'] );
	}

	public function test_compile__errors_when_side_bindings_overlap() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )
				->bind( 'padding', V3_Control::bind_to( 'padding_horizontal' )->sides( 'inline-start', 'inline-end' ) )
				->bind( 'padding', V3_Control::bind_to( 'padding' ) )
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'overlapping_bindings', $this->reason( $result ) );
	}

	public function test_compile__errors_when_side_name_is_unknown() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind( 'padding', V3_Control::bind_to( 'padding_horizontal' )->sides( 'left' ) )
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_sides', $this->reason( $result ) );
	}

	public function test_compile__errors_when_state_is_invalid() {
		// Arrange.
		$map = $this->map_with_target(
			Style_Target::make( 'Heading' )->bind( 'color', V3_Control::bind_to( 'title_color' ), 'focus' )
		);

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_state_key', $this->reason( $result ) );
	}

	public function test_compile__errors_when_target_is_not_a_style_target() {
		// Arrange.
		$map = $this->valid_map();
		$map['style_targets']['heading'] = [ 'label' => 'Heading' ];

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_style_target', $this->reason( $result ) );
	}

	public function test_compile__errors_when_alias_is_invalid() {
		// Arrange.
		$map = $this->valid_map();
		$map['style_targets']['Invalid_Alias'] = $map['style_targets']['heading'];
		unset( $map['style_targets']['heading'] );
		$map['default_style_target'] = 'Invalid_Alias';

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_alias', $this->reason( $result ) );
	}

	public function test_compile__errors_when_widget_type_mismatch() {
		// Arrange.
		$compiler = $this->compiler();

		// Act.
		$result = $compiler->compile( $this->valid_map(), $this->controls(), 'button' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'widget_type_mismatch', $this->reason( $result ) );
	}

	public function test_compile__accepts_link_schema_against_url_control() {
		// Arrange.
		$map = $this->valid_map();
		$map['settings']['link'] = Setting_Schemas::link();
		$controls = array_merge( $this->controls(), [ 'link' => [ 'type' => 'url' ] ] );

		// Act.
		$result = $this->compiler()->compile( $map, $controls, 'heading' );

		// Assert.
		$this->assertIsArray( $result );
	}

	public function test_compile__errors_when_link_schema_targets_non_url_control() {
		// Arrange.
		$map = $this->valid_map();
		$map['settings']['link'] = Setting_Schemas::link();
		$controls = array_merge( $this->controls(), [ 'link' => [ 'type' => 'text' ] ] );

		// Act.
		$result = $this->compiler()->compile( $map, $controls, 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'incompatible_setting_shape', $this->reason( $result ) );
	}

	public function test_compile__dynamic_string_schema_errors_when_control_not_dynamic_capable() {
		// Arrange.
		$map = $this->valid_map();
		$map['settings']['title'] = Setting_Schemas::string( true );

		// Act.
		$result = $this->compiler()->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'incompatible_dynamic_control', $this->reason( $result ) );
	}
}
