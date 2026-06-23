<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter_REST_API;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Constants as Variables_Constants;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Css_Converter_Rest_Api extends Elementor_Test_Base {

	private string $original_atomic_widgets_experiment_state;

	private string $original_variables_experiment_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_atomic_widgets_experiment_state = Plugin::$instance->experiments
			->get_features( Atomic_Widgets_Module::EXPERIMENT_NAME )['default'];
		$this->original_variables_experiment_state = Plugin::$instance->experiments
			->get_features( Variables_Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
		Plugin::$instance->experiments->set_feature_default_state(
			Variables_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Css_Converter_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			$this->original_atomic_widgets_experiment_state
		);
		Plugin::$instance->experiments->set_feature_default_state(
			Variables_Module::EXPERIMENT_NAME,
			$this->original_variables_experiment_state
		);

		global $wp_rest_server;

		$wp_rest_server = null;

		parent::tearDown();
	}

	private function decoded_data( \WP_REST_Response $response ): array {
		return json_decode( wp_json_encode( $response->get_data() ), true );
	}

	public function test_post__converts_box_shadow_into_array_of_shadow_props() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'box-shadow' => 'inset 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px black',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$prop = $data['el-1']['props']['box-shadow'];
		$this->assertSame( 'box-shadow', $prop['$$type'] );
		$this->assertCount( 2, $prop['value'] );

		$first = $prop['value'][0]['value'];
		$this->assertSame( 'inset', $first['position']['value'] );
		$this->assertEquals( 4, $first['vOffset']['value']['size'] );
		$this->assertEquals( -1, $first['spread']['value']['size'] );
		$this->assertSame( 'rgba(0,0,0,0.1)', $first['color']['value'] );

		$second = $prop['value'][1]['value'];
		$this->assertArrayNotHasKey( 'position', $second );
		$this->assertSame( 'black', $second['color']['value'] );

		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_transform_translate_to_move_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'transform' => 'translateX(50%) rotate(45deg)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$prop = $data['el-1']['props']['transform'];
		$this->assertSame( 'transform', $prop['$$type'] );
		$functions = $prop['value']['transform-functions']['value'];
		$this->assertCount( 2, $functions );
		$this->assertSame( 'transform-move', $functions[0]['$$type'] );
		$this->assertSame( 'transform-rotate', $functions[1]['$$type'] );
		$this->assertEquals( 45, $functions[1]['value']['z']['value']['size'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__transform_origin_merges_with_transform_functions() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'transform'        => 'scale(1.5)',
			'transform-origin' => 'left top',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$transform = $data['el-1']['props']['transform'];
		$this->assertSame( 'transform', $transform['$$type'] );
		$this->assertArrayHasKey( 'transform-functions', $transform['value'] );
		$origin = $transform['value']['transform-origin']['value'];
		$this->assertSame( 0, $origin['x']['value']['size'] );
		$this->assertSame( 0, $origin['y']['value']['size'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__transform_with_unsupported_function_routes_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'transform' => 'matrix(1,0,0,1,10,20)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertStringContainsString( 'transform:', $data['el-1']['customCss'] );
	}

	public function test_post__converts_transition_all_to_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'transition' => 'all 300ms ease' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: easing dropped, property and duration preserved.
		$prop = $data['el-1']['props']['transition'];
		$this->assertSame( 'transition', $prop['$$type'] );
		$this->assertCount( 1, $prop['value'] );
		$this->assertSame( 'all', $prop['value'][0]['value']['selection']['value']['value']['value'] );
		$this->assertEquals( 300, $prop['value'][0]['value']['size']['value']['size'] );
		$this->assertSame( 'ms', $prop['value'][0]['value']['size']['value']['unit'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__transition_with_unsupported_property_routes_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'transition' => 'border-left 300ms' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'transition: border-left 300ms;', $data['el-1']['customCss'] );
	}

	public function test_post__animation_property_is_rejected_not_in_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'animation' => 'spin 1s linear infinite' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: rejected, not leaked into customCss.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
		$this->assertSame( [ 'animation: spin 1s linear infinite;' ], $data['el-1']['rejected'] );
	}

	public function test_post__animation_longhands_are_rejected() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'animation-name'     => 'slide',
			'animation-duration' => '0.5s',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertCount( 2, $data['el-1']['rejected'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__rejected_and_converted_props_coexist_in_one_block() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'color'     => 'red',
			'animation' => 'spin 1s linear infinite',
			'transform' => 'matrix(1,0,0,1,0,0)',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals( [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ], $data['el-1']['props'] );
		$this->assertSame( 'transform: matrix(1,0,0,1,0,0);', $data['el-1']['customCss'] );
		$this->assertSame( [ 'animation: spin 1s linear infinite;' ], $data['el-1']['rejected'] );
	}

	public function test_post__non_rejected_block_has_empty_rejected_array() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'color' => 'blue' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertSame( [], $data['el-1']['rejected'] );
	}

	public function test_post__returns_empty_props_and_all_input_as_custom_css_with_only_noops() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'transform' => 'matrix(1,0,0,1,0,0)', 'stroke-width' => '2px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'transform: matrix(1,0,0,1,0,0); stroke-width: 2px;', $data['el-1']['customCss'] );
	}

	public function test_post__returns_one_named_result_per_input_block() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => [ 'transform' => 'matrix(1,0,0,1,0,0)' ],
			'el-2' => [ 'stroke-width' => '2px' ],
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertSame( [ 'el-1', 'el-2' ], array_keys( $data ) );
		$this->assertSame( 'transform: matrix(1,0,0,1,0,0);', $data['el-1']['customCss'] );
		$this->assertSame( 'stroke-width: 2px;', $data['el-2']['customCss'] );
	}

	public function test_post__converts_font_weight_into_a_canonical_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'font-weight' => '700' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals( [ 'font-weight' => [ '$$type' => 'string', 'value' => '700' ] ], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_invalid_font_weight_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'font-weight' => '950' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'font-weight: 950;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_enum_string_prop_and_declines_value_outside_enum() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'display' => 'flex', 'position' => 'nonsense' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals( [ 'display' => [ '$$type' => 'string', 'value' => 'flex' ] ], $data['el-1']['props'] );
		$this->assertSame( 'position: nonsense;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_free_string_prop_with_any_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'aspect-ratio' => '16 / 9' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals( [ 'aspect-ratio' => [ '$$type' => 'string', 'value' => '16 / 9' ] ], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_object_position_named_keyword_to_string_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'object-position' => 'center center' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[ 'object-position' => [ '$$type' => 'string', 'value' => 'center center' ] ],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_object_position_size_pair_to_position_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'object-position' => '50% 30%' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$prop = $data['el-1']['props']['object-position'];
		$this->assertSame( 'object-position', $prop['$$type'] );
		$this->assertSame( '%', $prop['value']['x']['value']['unit'] );
		$this->assertSame( '%', $prop['value']['y']['value']['unit'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_flex_none_to_flex_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'flex' => 'none' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$prop = $data['el-1']['props']['flex'];
		$this->assertSame( 'flex', $prop['$$type'] );
		$this->assertEquals( 0, $prop['value']['flexGrow']['value'] );
		$this->assertEquals( 1, $prop['value']['flexShrink']['value'] );
		$this->assertSame( 'auto', $prop['value']['flexBasis']['value']['size'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_flex_three_values_to_flex_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'flex' => '2 1 50%' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$prop = $data['el-1']['props']['flex'];
		$this->assertSame( 'flex', $prop['$$type'] );
		$this->assertEquals( 2, $prop['value']['flexGrow']['value'] );
		$this->assertEquals( 1, $prop['value']['flexShrink']['value'] );
		$this->assertEquals( 50, $prop['value']['flexBasis']['value']['size'] );
		$this->assertSame( '%', $prop['value']['flexBasis']['value']['unit'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_physical_inset_properties_to_logical_equivalents() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'top'    => '10px',
			'right'  => '20px',
			'bottom' => '30px',
			'left'   => '40px',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: physical properties map to logical inset equivalents (LTR).
		$this->assertEquals(
			[
				'inset-block-start'  => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
				'inset-inline-end'   => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
				'inset-block-end'    => [ '$$type' => 'size', 'value' => [ 'size' => 30, 'unit' => 'px' ] ],
				'inset-inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 40, 'unit' => 'px' ] ],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_size_prop_into_a_canonical_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'width' => '10px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[ 'width' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ] ],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_unitless_line_height_into_a_custom_size() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'line-height' => '1.1' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[ 'line-height' => [ '$$type' => 'size', 'value' => [ 'size' => '1.1', 'unit' => 'custom' ] ] ],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_unrepresentable_size_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'width' => 'banana' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'width: banana;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_grid_span_into_a_canonical_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'grid-column' => 'span 2' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals( [ 'grid-column' => [ '$$type' => 'span', 'value' => 'span 2' ] ], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_grid_template_as_string_passthrough() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'grid-template-columns' => 'repeat(3, 1fr)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[ 'grid-template-columns' => [ '$$type' => 'string', 'value' => 'repeat(3, 1fr)' ] ],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_grid_template_string_prop_value_validates_against_the_union_schema() {
		// Arrange.
		$schema = Style_Schema::get_style_schema();
		$prop_value = [ '$$type' => 'string', 'value' => 'repeat(3, 1fr)' ];

		// Act & Assert.
		$this->assertTrue( $schema['grid-template-columns']->validate( $prop_value ) );
		$this->assertTrue( $schema['grid-template-rows']->validate( $prop_value ) );
	}

	public function test_post__converts_grid_auto_track_fraction_into_a_size_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'grid-auto-rows' => '1fr' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[ 'grid-auto-rows' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'fr' ] ] ],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_single_value_padding_into_a_size_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'padding' => '10px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[ 'padding' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ] ],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_shorthand_margin_into_logical_dimensions() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'margin' => '1px 2px 3px 4px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: top->block-start, right->inline-end, bottom->block-end, left->inline-start.
		$this->assertEquals(
			[
				'margin' => [
					'$$type' => 'dimensions',
					'value' => [
						'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 3, 'unit' => 'px' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 4, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_padding_longhands_into_logical_sides_of_padding_dimensions() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'padding-top'    => '10px',
			'padding-right'  => '20px',
			'padding-bottom' => '1.5rem',
			'padding-left'   => '40px',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: physical longhands map to logical sides (top=block-start, right=inline-end, bottom=block-end, left=inline-start).
		$this->assertEquals(
			[
				'padding' => [
					'$$type' => 'dimensions',
					'value' => [
						'block-start'  => [ '$$type' => 'size', 'value' => [ 'size' => 10,  'unit' => 'px'  ] ],
						'inline-end'   => [ '$$type' => 'size', 'value' => [ 'size' => 20,  'unit' => 'px'  ] ],
						'block-end'    => [ '$$type' => 'size', 'value' => [ 'size' => 1.5, 'unit' => 'rem' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 40,  'unit' => 'px'  ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_margin_longhands_into_logical_sides_of_margin_dimensions() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'margin-top'    => '5px',
			'margin-right'  => '10px',
			'margin-bottom' => '15px',
			'margin-left'   => '20px',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'margin' => [
					'$$type' => 'dimensions',
					'value' => [
						'block-start'  => [ '$$type' => 'size', 'value' => [ 'size' => 5,  'unit' => 'px' ] ],
						'inline-end'   => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
						'block-end'    => [ '$$type' => 'size', 'value' => [ 'size' => 15, 'unit' => 'px' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_unrepresentable_padding_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'padding' => '10px 20px 30px 40px 50px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'padding: 10px 20px 30px 40px 50px;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_shorthand_border_radius_into_logical_corners() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-radius' => '1px 2px 3px 4px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: TL->start-start, TR->start-end, BR->end-end, BL->end-start.
		$this->assertEquals(
			[
				'border-radius' => [
					'$$type' => 'border-radius',
					'value' => [
						'start-start' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'start-end' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'end-end' => [ '$$type' => 'size', 'value' => [ 'size' => 3, 'unit' => 'px' ] ],
						'end-start' => [ '$$type' => 'size', 'value' => [ 'size' => 4, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_single_border_radius_into_a_size() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-radius' => '8px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[ 'border-radius' => [ '$$type' => 'size', 'value' => [ 'size' => 8, 'unit' => 'px' ] ] ],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_elliptical_border_radius_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-radius' => '10px / 20px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'border-radius: 10px / 20px;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_shorthand_border_width_into_logical_sides() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-width' => '1px 2px 3px 4px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'border-width' => [
					'$$type' => 'border-width',
					'value' => [
						'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 3, 'unit' => 'px' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 4, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_single_border_width_into_a_size() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-width' => '2px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[ 'border-width' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ] ],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__expands_border_shorthand_into_longhand_props() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border' => '1px solid red' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: the shorthand is split into the three schema longhands; no `border` prop exists.
		$this->assertEquals(
			[
				'border-width' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
				'border-style' => [ '$$type' => 'string', 'value' => 'solid' ],
				'border-color' => [ '$$type' => 'color', 'value' => 'red' ],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__border_null_expands_to_null_longhand_props() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border' => 'null' ], 'el-2' => [ 'border' => null ] ] );


		// Act.
		$data = $this->get_data( $request );

			// Assert: border null resets all border longhands.
		// border-width Dimensions collapses to null after cleanup (all sides were null).
		// border-style and border-color stay as top-level null props.
		foreach ( [ 'el-1', 'el-2' ] as $block ) {
			$props = (array) $data[ $block ]['props'];
			$this->assertNull( $props['border-style'] );
			$this->assertNull( $props['border-color'] );
			$this->assertNull( $props['border-width'] );
		}
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__border_side_null_expands_to_null_side_longhands() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-top' => null ], 'el-2' => [ 'border-top' => 'null' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: border-top null resets all three per-side longhands.
		// border-top-width aliases to border-width.block-start; since that is the only side set (to null),
		// cleanup collapses the whole Dimensions to null.
		// border-top-style / border-top-color are not schema props → go to customCss, not props.
		foreach ( [ 'el-1', 'el-2' ] as $block ) {
			$props = (array) $data[ $block ]['props'];
			$this->assertNull( $props['border-width'] );
			$this->assertArrayNotHasKey( 'border-top-style', $props );
			$this->assertArrayNotHasKey( 'border-top-color', $props );
		}
	}

	public function test_post__background_null_expands_to_null_longhand_props() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background' => null ], 'el-2' => [ 'background' => 'null' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: background null expands to all field-longhands null → aggregate merges → cleanup collapses to null.
		foreach ( [ 'el-1', 'el-2' ] as $block ) {
			$this->assertNull( $data[ $block ]['props']['background'] );
			$this->assertSame( '', $data[ $block ]['customCss'] );
		}
	}

	public function test_post__physical_position_null_expands_to_logical_null_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-top'    => [ 'top' => null ],
			'el-right'  => [ 'right' => 'null' ],
			'el-bottom' => [ 'bottom' => null ],
			'el-left'   => [ 'left' => 'null' ],
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: each physical property resets its logical equivalent (not the physical name).
		$this->assertEquals( [ 'inset-block-start'  => null ], $data['el-top']['props'] );
		$this->assertEquals( [ 'inset-inline-end'   => null ], $data['el-right']['props'] );
		$this->assertEquals( [ 'inset-block-end'    => null ], $data['el-bottom']['props'] );
		$this->assertEquals( [ 'inset-inline-start' => null ], $data['el-left']['props'] );
	}

	public function test_post__border_width_keyword_degrades_to_custom_css_per_side() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border' => 'thin solid red' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: style + color convert, the unparsable width falls to custom_css alone.
		$this->assertEquals(
			[
				'border-style' => [ '$$type' => 'string', 'value' => 'solid' ],
				'border-color' => [ '$$type' => 'color', 'value' => 'red' ],
			],
			$data['el-1']['props']
		);
		$this->assertSame( 'border-width: thin;', $data['el-1']['customCss'] );
	}

	public function test_post__ambiguous_border_shorthand_is_kept_as_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border' => '1px 2px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'border: 1px 2px;', $data['el-1']['customCss'] );
	}

	public function test_post__merges_per_side_width_longhands_into_border_width() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-top-width' => '2px', 'border-bottom-width' => '4px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: both sides accumulate into one (partial) border-width object.
		$this->assertEquals(
			[
				'border-width' => [
					'$$type' => 'border-width',
					'value' => [
						'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 4, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__per_side_width_seeds_from_prior_single_border_width() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-width' => '1px', 'border-top-width' => '2px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: the single seeds all sides, then top is overridden.
		$this->assertEquals(
			[
				'border-width' => [
					'$$type' => 'border-width',
					'value' => [
						'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__merges_per_corner_radius_into_border_radius() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-top-left-radius' => '10px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'border-radius' => [
					'$$type' => 'border-radius',
					'value' => [
						'start-start' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__per_side_shorthand_converts_width_and_routes_style_color_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-top' => '1px solid red' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: only the width side is representable; per-side style/color fall to custom_css.
		$this->assertEquals(
			[
				'border-width' => [
					'$$type' => 'border-width',
					'value' => [
						'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( 'border-top-style: solid; border-top-color: red;', $data['el-1']['customCss'] );
	}

	public function test_post__mixed_border_shorthands_resolve_last_wins() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border' => '1px solid blue', 'border-left' => '4px red' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: left width (4px) wins over the seeded 1px; all-sides style/color stay props; the
		// per-side color has no representation and lands in custom_css.
		$this->assertEquals(
			[
				'border-width' => [
					'$$type' => 'border-width',
					'value' => [
						'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 4, 'unit' => 'px' ] ],
					],
				],
				'border-style' => [ '$$type' => 'string', 'value' => 'solid' ],
				'border-color' => [ '$$type' => 'color', 'value' => 'blue' ],
			],
			$data['el-1']['props']
		);
		$this->assertSame( 'border-left-color: red;', $data['el-1']['customCss'] );
	}

	public function test_post__multi_value_border_color_is_routed_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-color' => 'red green blue yellow' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: a single Color can't hold four sides, so the whole declaration is custom_css.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'border-color: red green blue yellow;', $data['el-1']['customCss'] );
	}

	public function test_post__per_side_style_and_color_are_routed_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-left-style' => 'dashed', 'border-left-color' => 'blue' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: no single-valued per-side representation exists for these.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'border-left-style: dashed; border-left-color: blue;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_background_color_into_the_background_object() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-color' => 'red' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'background' => [
					'$$type' => 'background',
					'value' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__merges_background_color_and_clip_into_one_background_object() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-color' => 'red', 'background-clip' => 'text' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: both longhands accumulate into one background object that validates against the schema.

		$prop_value = $data['el-1']['props']['background'];

		$this->assertEquals(
			[
				'$$type' => 'background',
				'value' => [
					'color' => [ '$$type' => 'color', 'value' => 'red' ],
					'clip' => [ '$$type' => 'string', 'value' => 'text' ],
				],
			],
			$prop_value
		);
		$this->assertTrue( Style_Schema::get_style_schema()['background']->validate( $prop_value ) );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_out_of_enum_background_clip_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-clip' => 'banana' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'background-clip: banana;', $data['el-1']['customCss'] );
	}

	public function test_post__background_shorthand_color_only_sets_background_color_field() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background' => 'red' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: expander splits shorthand -> background-color converter sets background.color.

		$bg = $data['el-1']['props']['background'];
		$this->assertSame( 'background', $bg['$$type'] );
		$this->assertSame( [ '$$type' => 'color', 'value' => 'red' ], $bg['value']['color'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_shorthand_url_and_repeat_sets_image_layer_and_repeat() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background' => 'url(https://example.com/img.jpg) no-repeat' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$bg = $data['el-1']['props']['background'];
		$layer = $bg['value']['background-overlay']['value'][0];

		$this->assertSame( 'background-image-overlay', $layer['$$type'] );
		$this->assertSame( 'https://example.com/img.jpg', $layer['value']['image']['value']['src']['value']['url']['value'] );
		$this->assertSame( 'no-repeat', $layer['value']['repeat']['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_shorthand_with_position_and_size() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background' => 'url(https://example.com/img.jpg) center center / cover' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$layer = $data['el-1']['props']['background']['value']['background-overlay']['value'][0];

		$this->assertSame( 'center center', $layer['value']['position']['value'] );
		$this->assertSame( 'cover', $layer['value']['size']['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_shorthand_gradient_image_creates_gradient_overlay() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background' => 'linear-gradient(135deg, #fff 0%, #000 100%)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: expander emits background-image: ...; gradient converter creates overlay.

		$overlay = $data['el-1']['props']['background']['value']['background-overlay']['value'][0];
		$this->assertSame( 'background-gradient-overlay', $overlay['$$type'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_background_image_url_into_image_overlay_layer() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-image' => 'url(https://example.com/foo.jpg)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$bg = $data['el-1']['props']['background'];

		$this->assertSame( 'background', $bg['$$type'] );
		$this->assertCount( 1, $bg['value']['background-overlay']['value'] );

		$layer = $bg['value']['background-overlay']['value'][0];

		$this->assertSame( 'background-image-overlay', $layer['$$type'] );
		$this->assertSame( 'https://example.com/foo.jpg', $layer['value']['image']['value']['src']['value']['url']['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_image_with_repeat_and_size_populates_layer_fields() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => [
				'background-image' => 'url(https://example.com/foo.jpg)',
				'background-repeat' => 'no-repeat',
				'background-size' => 'cover',
			],
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$layer = $data['el-1']['props']['background']['value']['background-overlay']['value'][0];

		$this->assertSame( 'no-repeat', $layer['value']['repeat']['value'] );
		$this->assertSame( 'cover', $layer['value']['size']['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__multiple_background_image_layers_with_per_layer_repeat() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => [
				'background-image' => 'url(https://example.com/a.jpg), url(https://example.com/b.jpg)',
				'background-repeat' => 'no-repeat, repeat-x',
			],
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$layers = $data['el-1']['props']['background']['value']['background-overlay']['value'];

		$this->assertCount( 2, $layers );
		$this->assertSame( 'no-repeat', $layers[0]['value']['repeat']['value'] );
		$this->assertSame( 'repeat-x', $layers[1]['value']['repeat']['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_image_none_creates_no_layers() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-image' => 'none' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$overlay = $data['el-1']['props']['background']['value']['background-overlay'];
		$this->assertCount( 0, $overlay['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_image_linear_gradient_creates_gradient_overlay() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-image' => 'linear-gradient(135deg, #ffffff 0%, #00FFD5 50%, #FF3CAC 100%)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$overlay = $data['el-1']['props']['background']['value']['background-overlay']['value'][0];

		$this->assertSame( 'background-gradient-overlay', $overlay['$$type'] );
		$this->assertSame( 'linear', $overlay['value']['type']['value'] );
		$this->assertEquals( 135, $overlay['value']['angle']['value'] );
		$this->assertCount( 3, $overlay['value']['stops']['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_image_radial_gradient_with_percentage_position_creates_gradient_overlay() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-image' => 'radial-gradient(circle at 20% 30%, rgba(0, 255, 213, 0.3) 0%, transparent 50%)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$overlay = $data['el-1']['props']['background']['value']['background-overlay']['value'][0];

		$this->assertSame( 'background-gradient-overlay', $overlay['$$type'] );
		$this->assertSame( 'radial', $overlay['value']['type']['value'] );
		$this->assertSame( '20% 30%', $overlay['value']['positions']['value'] );
		$this->assertCount( 2, $overlay['value']['stops']['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_repeat_without_image_routes_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-repeat' => 'no-repeat' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: no image layer to attach to.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'background-repeat: no-repeat;', $data['el-1']['customCss'] );
	}

	public function test_post__background_size_pair_creates_scale_object() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => [
				'background-image' => 'url(https://example.com/foo.jpg)',
				'background-size' => '50% 100%',
			],
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$size = $data['el-1']['props']['background']['value']['background-overlay']['value'][0]['value']['size'];

		$this->assertSame( 'background-image-size-scale', $size['$$type'] );
		$this->assertSame( 50, $size['value']['width']['value']['size'] );
		$this->assertSame( 100, $size['value']['height']['value']['size'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_position_offset_creates_offset_object() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => [
				'background-image' => 'url(https://example.com/foo.jpg)',
				'background-position' => '10px 20px',
			],
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.

		$pos = $data['el-1']['props']['background']['value']['background-overlay']['value'][0]['value']['position'];

		$this->assertSame( 'background-image-position-offset', $pos['$$type'] );
		$this->assertSame( 10, $pos['value']['x']['value']['size'] );
		$this->assertSame( 20, $pos['value']['y']['value']['size'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_filter_into_a_canonical_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'filter' => 'blur(5px) brightness(150%)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertSame( 'filter', $data['el-1']['props']['filter']['$$type'] );
		$this->assertCount( 2, $data['el-1']['props']['filter']['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_backdrop_filter_into_a_canonical_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'backdrop-filter' => 'drop-shadow(2px 4px 6px black)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertSame( 'backdrop-filter', $data['el-1']['props']['backdrop-filter']['$$type'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_unsupported_filter_function_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'filter' => 'opacity(50%)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'filter: opacity(50%);', $data['el-1']['customCss'] );
	}

	public function null_values(): array {
		return [ 'php null' => [ null ], 'string null' => [ 'null' ] ];
	}

	/**
	 * @dataProvider null_values
	 */
	public function test_post__dimensions_shorthand_null_resets_all_sides( $null ) {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'padding' => $null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: all four sides were null → cleanup collapses Dimensions to null.
		$this->assertNull( $data['el-1']['props']['padding'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	/**
	 * @dataProvider null_values
	 */
	public function test_post__border_radius_null_resets_all_corners( $null ) {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-radius' => $null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: all four corners were null → cleanup collapses Border_Radius to null.
		$this->assertNull( $data['el-1']['props']['border-radius'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	/**
	 * @dataProvider null_values
	 */
	public function test_post__dimensions_side_longhand_null_resets_one_side( $null ) {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'padding-top' => $null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: only block-start was set (to null) → cleanup collapses to null at prop level.
		$this->assertNull( $data['el-1']['props']['padding'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	/**
	 * @dataProvider null_values
	 */
	public function test_post__physical_inset_null_expands_to_logical_null_prop( $null ) {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'top' => $null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: physical top is renamed to its logical equivalent and reset to null.
		$this->assertArrayNotHasKey( 'top', $data['el-1']['props'] );
		$this->assertNull( $data['el-1']['props']['inset-block-start'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_number_prop_into_a_canonical_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'z-index' => '5' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals( [ 'z-index' => [ '$$type' => 'number', 'value' => 5 ] ], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_non_numeric_number_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'z-index' => 'calc(1 + 1)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( 'z-index: calc(1 + 1);', $data['el-1']['customCss'] );
	}

	public function test_post__converts_color_prop_including_named_colors_as_raw_passthrough() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'color' => 'whitesmoke', 'border-color' => '#2d2a26' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'color' => [ '$$type' => 'color', 'value' => 'whitesmoke' ],
				'border-color' => [ '$$type' => 'color', 'value' => '#2d2a26' ],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_plaintext_css_text_blocks_in_bulk() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'default' => 'display: flex;',
			'hover' => 'color: red;',
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertArrayHasKey( 'default', $data );
		$this->assertArrayHasKey( 'hover', $data );
		$this->assertEquals( 'flex', $data['default']['props']['display']['value'] );
		$this->assertEquals( 'red', $data['hover']['props']['color']['value'] );
		$this->assertSame( '', $data['default']['customCss'] );
		$this->assertSame( '', $data['hover']['customCss'] );
	}

	public function test_post__null_value_is_emitted_as_a_null_reset_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'font-weight' => null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals( [ 'font-weight' => null ], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__null_reset_coexists_with_converted_and_custom_css_declarations() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => [
				'font-weight' => '700',
				'color' => null,
				'transform' => 'matrix(1,0,0,1,0,0)',
			],
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'font-weight' => [ '$$type' => 'string', 'value' => '700' ],
				'color' => null,
			],
			$data['el-1']['props']
		);
		$this->assertSame( 'transform: matrix(1,0,0,1,0,0);', $data['el-1']['customCss'] );
	}

	public function test_post__requires_authentication() {
		// Arrange.
		wp_set_current_user( 0 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'color' => 'red' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );

		// Assert.
		$this->assertSame( 401, $response->get_status() );
	}

	public function test_post__blocked_declarations_never_reach_props_or_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'behavior' => 'url(x.htc)', 'color' => 'expression(alert(1))' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__promotes_known_color_var_to_global_color_variable_prop() {
		// Arrange.
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, [
			'data' => [
				'e-gv-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'primary-text',
					'value' => '#111111',
				],
			],
			'watermark' => 1,
			'version' => 1,
		] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'color' => 'var(--primary-text)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'color' => [
					'$$type' => Color_Variable_Prop_Type::get_key(),
					'value' => 'e-gv-1',
				],
			],
			$data['el-1']['props']
		);
		$this->assertTrue( Style_Schema::get()['color']->validate( $data['el-1']['props']['color'] ) );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
	}

	public function test_post__background_color_var_shorthand_promotes_to_background_prop() {
		// Arrange.
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, [
			'data' => [
				'e-gv-f32253d' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'var-id',
					'value' => '#112233',
				],
			],
			'watermark' => 1,
			'version' => 1,
		] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background' => 'var(--var-id)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'background' => [
					'$$type' => 'background',
					'value' => [
						'color' => [
							'$$type' => Color_Variable_Prop_Type::get_key(),
							'value' => 'e-gv-f32253d',
						],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
		$this->assertSame( [], $data['el-1']['rejected'] );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
	}

	public function test_post__border_color_var_shorthand_promotes_to_border_color_prop() {
		// Arrange.
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, [
			'data' => [
				'e-gv-border' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'primary-border',
					'value' => '#112233',
				],
			],
			'watermark' => 1,
			'version' => 1,
		] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border' => '1px solid var(--primary-border)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'$$type' => Color_Variable_Prop_Type::get_key(),
				'value' => 'e-gv-border',
			],
			$data['el-1']['props']['border-color']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
	}

	public function test_post__top_size_var_promotes_to_inset_block_start_prop() {
		// Arrange.
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, [
			'data' => [
				'e-gv-offset' => [
					'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
					'label' => 'offset-md',
					'value' => '16px',
				],
			],
			'watermark' => 1,
			'version' => 1,
		] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'top' => 'var(--offset-md)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'$$type' => Size_Variable_Prop_Type::get_key(),
				'value' => 'e-gv-offset',
			],
			$data['el-1']['props']['inset-block-start']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
	}

	public function test_post__background_unknown_var_stays_in_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background' => 'var(--external-var)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertSame( [], $data['el-1']['props'] );
		$this->assertSame( 'background: var(--external-var);', $data['el-1']['customCss'] );
		$this->assertSame( [], $data['el-1']['rejected'] );
	}

	public function test_post__unknown_var_goes_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'color' => 'var(--external-var)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertSame( [], $data['el-1']['props'] );
		$this->assertSame( 'color: var(--external-var);', $data['el-1']['customCss'] );
		$this->assertSame( [], $data['el-1']['rejected'] );
	}

	public function test_post__wrong_variable_type_is_rejected() {
		// Arrange.
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, [
			'data' => [
				'e-gv-3' => [
					'type' => Font_Variable_Prop_Type::get_key(),
					'label' => 'heading-font',
					'value' => 'Roboto',
				],
			],
			'watermark' => 1,
			'version' => 1,
		] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'font-size' => 'var(--heading-font)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertSame( [], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
		$this->assertSame( [ 'font-size: var(--heading-font);' ], $data['el-1']['rejected'] );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
	}

	public function test_post__padding_shorthand_then_logical_var_and_physical_override_with_invalid() {
		// Arrange.
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, [
			'data' => [
				'e-gv-spacing' => [
					'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
					'label' => 'existing-size-var',
					'value' => '1rem',
				],
			],
			'watermark' => 1,
			'version' => 1,
		] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'padding'              => '2rem',
			'padding-inline-start' => 'var(--existing-size-var)',
			'padding-right'        => '1rem',
			'padding-left'         => 'banana',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: shorthand seeds all 4 sides; logical inline-start overrides with promoted var;
		// physical inline-end (right) overrides with 1rem; invalid left goes to customCss.
		$this->assertEquals(
			[
				'padding' => [
					'$$type' => 'dimensions',
					'value'  => [
						'block-start'  => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'rem' ] ],
						'inline-end'   => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'rem' ] ],
						'block-end'    => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'rem' ] ],
						'inline-start' => [ '$$type' => Size_Variable_Prop_Type::get_key(), 'value' => 'e-gv-spacing' ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( 'padding-left: banana;', $data['el-1']['customCss'] );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
	}

	public function test_post__conflicting_physical_logical_and_var_last_wins_on_same_side() {
		// Arrange.
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, [
			'data' => [
				'e-gv-bottom' => [
					'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
					'label' => 'existing',
					'value' => '8px',
				],
			],
			'watermark' => 1,
			'version' => 1,
		] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => 'padding-bottom: invalid; padding-block-end: 1rem; padding-bottom: var(--existing);',
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: invalid is superseded by the later var (dedupe, last wins) so never reaches customCss.
		// Only block-end survives — dimensions with one variable side.
		$this->assertEquals(
			[
				'$$type' => 'dimensions',
				'value'  => [
					'block-end' => [ '$$type' => Size_Variable_Prop_Type::get_key(), 'value' => 'e-gv-bottom' ],
				],
			],
			$data['el-1']['props']['padding']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
	}

	public function test_post__invalid_last_leaves_prior_converted_side_intact_and_adds_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => 'padding-block-end: 1rem; padding-bottom: invalid;',
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: invalid is declined (Size parser returns null), so the prior converted side
		// remains in props; the invalid declaration still lands in customCss.
		//
		// INTENTIONAL BY DESIGN: a declined declaration never clears an already-converted prop.
		// This means a single logical property can appear in both props (from a prior valid rule)
		// and customCss (from a later invalid rule) simultaneously. Consumers should apply props
		// first and customCss on top — the browser will ignore the invalid customCss value anyway.
		$this->assertEquals(
			[
				'padding' => [
					'$$type' => 'dimensions',
					'value'  => [
						'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'rem' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( 'padding-bottom: invalid;', $data['el-1']['customCss'] );
	}

	public function test_post__plain_size_after_var_wins_on_same_side() {
		// Arrange.
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, [
			'data' => [
				'e-gv-bottom' => [
					'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
					'label' => 'existing',
					'value' => '8px',
				],
			],
			'watermark' => 1,
			'version' => 1,
		] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => 'padding-bottom: invalid; padding-bottom: var(--existing); padding-block-end: 1rem;',
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: plain size (3rd) wins over the var (2nd); invalid (1st) is superseded by dedupe — not in customCss.
		$this->assertEquals(
			[
				'$$type' => 'dimensions',
				'value'  => [
					'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'rem' ] ],
				],
			],
			$data['el-1']['props']['padding']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
	}

	public function test_post__padding_shorthand_after_longhand_collapses_to_single_size() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'padding-bottom' => '5px',
			'padding'        => '10px',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: shorthand wins, collapsing the accumulated dimensions back to a single Size.
		$this->assertEquals(
			[ 'padding' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ] ],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__padding_longhand_after_multi_value_shorthand_overrides_one_side() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'padding'      => '10px 20px',
			'padding-left' => '99px',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: shorthand expands to 4 sides (10 10 10 20 by CSS 2-value rule), then left overrides inline-start.
		$prop = $data['el-1']['props']['padding'];
		$this->assertSame( 'dimensions', $prop['$$type'] );
		$this->assertEquals( 10,  $prop['value']['block-start']['value']['size'] );
		$this->assertEquals( 20,  $prop['value']['inline-end']['value']['size'] );
		$this->assertEquals( 10,  $prop['value']['block-end']['value']['size'] );
		$this->assertEquals( 99,  $prop['value']['inline-start']['value']['size'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__single_padding_shorthand_seeds_all_sides_when_longhand_follows() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'padding'       => '2rem',
			'padding-right' => '1rem',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: 2rem seeds all 4 sides, then inline-end is overridden to 1rem.
		$prop = $data['el-1']['props']['padding'];
		$this->assertSame( 'dimensions', $prop['$$type'] );
		$this->assertEquals( 2, $prop['value']['block-start']['value']['size'] );
		$this->assertEquals( 1, $prop['value']['inline-end']['value']['size'] );
		$this->assertEquals( 2, $prop['value']['block-end']['value']['size'] );
		$this->assertEquals( 2, $prop['value']['inline-start']['value']['size'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__lone_margin_longhand_produces_partial_dimensions_with_one_side() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'margin-bottom' => '5px' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: partial dimensions with only block-end; other sides absent (not seeded).
		$this->assertEquals(
			[
				'margin' => [
					'$$type' => 'dimensions',
					'value'  => [
						'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 5, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__padding_and_margin_longhands_produce_independent_props() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'padding-bottom' => '5px',
			'margin-bottom'  => '10px',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: two independent props — padding only has block-end, margin only has block-end; no mixing.
		$this->assertSame( 'dimensions', $data['el-1']['props']['padding']['$$type'] );
		$this->assertSame( 'dimensions', $data['el-1']['props']['margin']['$$type'] );
		$this->assertEquals( 5,  $data['el-1']['props']['padding']['value']['block-end']['value']['size'] );
		$this->assertEquals( 10, $data['el-1']['props']['margin']['value']['block-end']['value']['size'] );
		$this->assertArrayNotHasKey( 'block-start', $data['el-1']['props']['padding']['value'] );
		$this->assertArrayNotHasKey( 'block-start', $data['el-1']['props']['margin']['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__unresolved_var_on_dimension_side_routes_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'padding-bottom' => 'var(--unknown)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: unknown var is stored as a raw custom size; the transformer then ejects the
		// whole padding prop back to customCss because the var cannot be resolved.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertStringContainsString( 'padding-bottom:', $data['el-1']['customCss'] );
	}

	public function test_post__wrong_type_var_on_dimension_side_routes_to_rejected() {
		// Arrange.
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Variables_Constants::VARIABLES_META_KEY, [
			'data' => [
				'e-gv-color' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'my-color',
					'value' => '#ff0000',
				],
			],
			'watermark' => 1,
			'version' => 1,
		] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'padding-bottom' => 'var(--my-color)' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: color variable used where a size is expected — prop is ejected to `rejected` (not customCss)
		// because the variable is known but the type is wrong. The client uses `rejected` to surface type errors.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
		$this->assertContains( 'padding-bottom: var(--my-color);', $data['el-1']['rejected'] );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
	}

	public function test_post__logical_and_physical_alias_on_same_side_last_wins() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'padding-inline-start' => '10px',
			'padding-left'         => '20px',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: padding-left (physical, last) overrides padding-inline-start (logical, first).
		$prop = $data['el-1']['props']['padding'];
		$this->assertSame( 'dimensions', $prop['$$type'] );
		$this->assertEquals( 20, $prop['value']['inline-start']['value']['size'] );
		$this->assertCount( 1, $prop['value'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__all_logical_padding_longhands_map_to_correct_sides() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'padding-block-start'  => '1px',
			'padding-block-end'    => '2px',
			'padding-inline-start' => '3px',
			'padding-inline-end'   => '4px',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'padding' => [
					'$$type' => 'dimensions',
					'value'  => [
						'block-start'  => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'block-end'    => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 3, 'unit' => 'px' ] ],
						'inline-end'   => [ '$$type' => 'size', 'value' => [ 'size' => 4, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__all_logical_margin_longhands_map_to_correct_sides() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [
			'margin-block-start'  => '1px',
			'margin-block-end'    => '2px',
			'margin-inline-start' => '3px',
			'margin-inline-end'   => '4px',
		] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		$this->assertEquals(
			[
				'margin' => [
					'$$type' => 'dimensions',
					'value'  => [
						'block-start'  => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
						'block-end'    => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 3, 'unit' => 'px' ] ],
						'inline-end'   => [ '$$type' => 'size', 'value' => [ 'size' => 4, 'unit' => 'px' ] ],
					],
				],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_coverage__every_style_schema_property_is_hardcoded_as_covered() {
		// Arrange.
		$schema_properties = array_keys( Style_Schema::get_style_schema() );

		// Act.
		$uncovered = array_values( array_diff( $schema_properties, Converter_Registry_Factory::covered_properties() ) );

		// Assert.
		$this->assertSame(
			[],
			$uncovered,
			'Style_Schema properties without converter coverage: ' . implode( ', ', $uncovered )
		);
	}

	// -------------------------------------------------------------------------
	// Shorthand null / multi-rule last-wins coverage
	// -------------------------------------------------------------------------

	/**
	 * @dataProvider null_values
	 */
	public function test_post__margin_null_resets_all_sides( $null ) {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'margin' => $null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert.
		// Assert: all four sides were null → cleanup collapses Dimensions to null.
		$this->assertNull( $data['el-1']['props']['margin'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__padding_shorthand_value_then_null_last_wins() {
		// Arrange.
		$this->act_as_admin();

		// padding: 10px sets all 4 sides, then padding-top: null resets only block-start.
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'padding' => '10px', 'padding-top' => null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: block-start is null; other three sides retain the 10px value.
		$prop = $data['el-1']['props']['padding'];
		$this->assertSame( 'dimensions', $prop['$$type'] );
		$this->assertNull( $prop['value']['block-start'] );
		$this->assertSame( '$$type', array_keys( $prop['value']['inline-end'] )[0] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__margin_shorthand_value_then_null_last_wins() {
		// Arrange.
		$this->act_as_admin();

		// margin: 10px 20px sets all 4 sides, then margin: null resets all back to null.
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'margin' => '10px 20px', 'margin-bottom' => null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: block-end is null; other three sides retain expanded values.
		$prop = $data['el-1']['props']['margin'];
		$this->assertSame( 'dimensions', $prop['$$type'] );
		$this->assertNull( $prop['value']['block-end'] );
		$this->assertSame( '$$type', array_keys( $prop['value']['block-start'] )[0] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__border_width_then_border_null_last_wins() {
		// Arrange.
		$this->act_as_admin();

		// border-width: 1px sets the width Dimensions, then border: null expands to nulls
		// for all border longhands — border-width gets reset to all-null Dimensions.
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-width' => '1px', 'border' => null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: border-width Dimensions had all sides null → cleanup collapses to null.
		$props = (array) $data['el-1']['props'];
		$this->assertNull( $props['border-width'] );
		$this->assertNull( $props['border-style'] );
		$this->assertNull( $props['border-color'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__background_value_then_null_last_wins() {
		// Arrange.
		$this->act_as_admin();

		// background-color: red sets a color prop, then background: null resets all background longhands.
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-color' => 'red', 'background' => null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: background-color sets background.color; background: null then merges all fields null
		// → cleanup collapses the whole background aggregate to null (last wins).
		$this->assertNull( $data['el-1']['props']['background'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	/**
	 * @dataProvider null_values
	 */
	public function test_post__outline_null_expands_to_all_supported_longhands( $null ) {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'outline' => $null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: all four supported outline-* props are null; the shorthand prop itself is not emitted.
		$props = (array) $data['el-1']['props'];
		$this->assertArrayNotHasKey( 'outline', $props );
		$this->assertNull( $props['outline-width'] );
		$this->assertNull( $props['outline-style'] );
		$this->assertNull( $props['outline-color'] );
		$this->assertNull( $props['outline-offset'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__outline_shorthand_value_expands_to_longhands() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'outline' => '2px solid blue' ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: width, style, color are emitted; outline-offset is absent (not in the shorthand syntax).
		$props = (array) $data['el-1']['props'];
		$this->assertArrayNotHasKey( 'outline', $props );
		$this->assertArrayHasKey( 'outline-width', $props );
		$this->assertArrayHasKey( 'outline-style', $props );
		$this->assertArrayHasKey( 'outline-color', $props );
		$this->assertArrayNotHasKey( 'outline-offset', $props );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__outline_longhand_then_outline_null_last_wins() {
		// Arrange.
		$this->act_as_admin();

		// outline-color sets a color prop; outline: null then expands to reset all 4 longhands.
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'outline-color' => 'blue', 'outline' => null ] ] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: outline-color value is overwritten by the null expansion (last wins).
		$props = (array) $data['el-1']['props'];
		$this->assertNull( $props['outline-color'] );
		$this->assertNull( $props['outline-width'] );
		$this->assertNull( $props['outline-style'] );
		$this->assertNull( $props['outline-offset'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__mixed_null_and_unknown_properties_realistic_payload() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'default' => [
				'padding'    => null,
				'margin'     => null,
				'border'     => null,
				'outline'    => null,
				'background' => null,
				'kuku'       => '2px',
				'pepe'       => null,
			],
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: all known shorthands collapse to null; unknowns go to customCss.
		$props = (array) $data['default']['props'];
		$this->assertNull( $props['padding'] );
		$this->assertNull( $props['margin'] );
		$this->assertNull( $props['border-width'] );
		$this->assertNull( $props['border-style'] );
		$this->assertNull( $props['border-color'] );
		$this->assertNull( $props['outline-width'] );
		$this->assertNull( $props['outline-style'] );
		$this->assertNull( $props['outline-color'] );
		$this->assertNull( $props['outline-offset'] );
		$this->assertNull( $props['background'] );
		$this->assertArrayNotHasKey( 'kuku', $props );
		$this->assertArrayNotHasKey( 'pepe', $props );
		$this->assertStringContainsString( 'kuku', $data['default']['customCss'] );
		$this->assertStringContainsString( 'pepe', $data['default']['customCss'] );
	}

	public function test_post__unknown_properties_with_null_and_non_null_all_route_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => [
				'invalid-a' => null,
				'invalid-b' => 'null',
				'invalid-c' => 'red',
			],
		] );

		// Act.
		$data = $this->get_data( $request );

		// Assert: no unknown props leak into the atomic props object; all go to customCss.
		$this->assertEmpty( $data['el-1']['props'] );
		$this->assertStringContainsString( 'invalid-a', $data['el-1']['customCss'] );
		$this->assertStringContainsString( 'invalid-b', $data['el-1']['customCss'] );
		$this->assertStringContainsString( 'invalid-c', $data['el-1']['customCss'] );
	}

	// -------------------------------------------------------------------------
	// Test helpers
	// -------------------------------------------------------------------------

	/**
	 * Dispatches the request, asserts a 200 status, asserts that every key in every block's `props`
	 * object exists in the Style_Schema (no unknown keys may leak), and returns the response data array.
	 *
	 * @return array{string: array{props: object, customCss: string, rejected: array}}
	 */
	private function get_data( \WP_REST_Request $request ): array {
		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );

		$data   = $this->decoded_data( $response )['data'];
		$schema = array_keys( Style_Schema::get_style_schema() );

		foreach ( $data as $block_id => $block ) {
			$prop_keys = array_keys( (array) $block['props'] );
			$unknown   = array_diff( $prop_keys, $schema );

			$this->assertEmpty(
				$unknown,
				"Block '{$block_id}' props contain keys not present in Style_Schema: " . implode( ', ', $unknown )
			);
		}

		return $data;
	}
}
