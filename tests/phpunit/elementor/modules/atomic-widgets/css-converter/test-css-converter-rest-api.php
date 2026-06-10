<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter_REST_API;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
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

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Css_Converter_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertStringContainsString( 'transform:', $data['el-1']['customCss'] );
	}

	public function test_post__converts_transition_all_to_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'transition' => 'all 300ms ease' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert: easing dropped, property and duration preserved.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'transition: border-left 300ms;', $data['el-1']['customCss'] );
	}

	public function test_post__animation_property_is_rejected_not_in_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'animation' => 'spin 1s linear infinite' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: rejected, not leaked into customCss.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ], $data['el-1']['props'] );
		$this->assertSame( 'transform: matrix(1,0,0,1,0,0);', $data['el-1']['customCss'] );
		$this->assertSame( [ 'animation: spin 1s linear infinite;' ], $data['el-1']['rejected'] );
	}

	public function test_post__non_rejected_block_has_empty_rejected_array() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'color' => 'blue' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( [], $data['el-1']['rejected'] );
	}

	public function test_post__returns_empty_props_and_all_input_as_custom_css_with_only_noops() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'transform' => 'matrix(1,0,0,1,0,0)', 'stroke-width' => '2px' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [ 'font-weight' => [ '$$type' => 'string', 'value' => '700' ] ], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_invalid_font_weight_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'font-weight' => '950' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'font-weight: 950;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_enum_string_prop_and_declines_value_outside_enum() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'display' => 'flex', 'position' => 'nonsense' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [ 'display' => [ '$$type' => 'string', 'value' => 'flex' ] ], $data['el-1']['props'] );
		$this->assertSame( 'position: nonsense;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_free_string_prop_with_any_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'aspect-ratio' => '16 / 9' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [ 'aspect-ratio' => [ '$$type' => 'string', 'value' => '16 / 9' ] ], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_object_position_named_keyword_to_string_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'object-position' => 'center center' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [ 'object-position' => [ '$$type' => 'string', 'value' => 'center center' ] ],
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: physical properties map to logical inset equivalents (LTR).
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [ 'width' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ] ],
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [ 'line-height' => [ '$$type' => 'size', 'value' => [ 'size' => '1.1', 'unit' => 'custom' ] ] ],
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'width: banana;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_grid_span_into_a_canonical_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'grid-column' => 'span 2' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [ 'grid-column' => [ '$$type' => 'span', 'value' => 'span 2' ] ], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__converts_grid_template_as_string_passthrough() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'grid-template-columns' => 'repeat(3, 1fr)' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [ 'grid-template-columns' => [ '$$type' => 'string', 'value' => 'repeat(3, 1fr)' ] ],
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [ 'grid-auto-rows' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'fr' ] ] ],
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [ 'padding' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ] ],
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: top->block-start, right->inline-end, bottom->block-end, left->inline-start.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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

	public function test_post__routes_unrepresentable_padding_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'padding' => '10px 20px 30px 40px 50px' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'padding: 10px 20px 30px 40px 50px;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_shorthand_border_radius_into_logical_corners() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-radius' => '1px 2px 3px 4px' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: TL->start-start, TR->start-end, BR->end-end, BL->end-start.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [ 'border-radius' => [ '$$type' => 'size', 'value' => [ 'size' => 8, 'unit' => 'px' ] ] ],
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'border-radius: 10px / 20px;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_shorthand_border_width_into_logical_sides() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-width' => '1px 2px 3px 4px' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [ 'border-width' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ] ],
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: the shorthand is split into the three schema longhands; no `border` prop exists.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
				'border-width' => [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ],
				'border-style' => [ '$$type' => 'string', 'value' => 'solid' ],
				'border-color' => [ '$$type' => 'color', 'value' => 'red' ],
			],
			$data['el-1']['props']
		);
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__border_width_keyword_degrades_to_custom_css_per_side() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border' => 'thin solid red' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: style + color convert, the unparsable width falls to custom_css alone.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'border: 1px 2px;', $data['el-1']['customCss'] );
	}

	public function test_post__merges_per_side_width_longhands_into_border_width() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-top-width' => '2px', 'border-bottom-width' => '4px' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: both sides accumulate into one (partial) border-width object.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: the single seeds all sides, then top is overridden.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: only the width side is representable; per-side style/color fall to custom_css.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: left width (4px) wins over the seeded 1px; all-sides style/color stay props; the
		// per-side color has no representation and lands in custom_css.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: a single Color can't hold four sides, so the whole declaration is custom_css.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'border-color: red green blue yellow;', $data['el-1']['customCss'] );
	}

	public function test_post__per_side_style_and_color_are_routed_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'border-left-style' => 'dashed', 'border-left-color' => 'blue' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: no single-valued per-side representation exists for these.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'border-left-style: dashed; border-left-color: blue;', $data['el-1']['customCss'] );
	}

	public function test_post__converts_background_color_into_the_background_object() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background-color' => 'red' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert: both longhands accumulate into one background object that validates against the schema.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'background-clip: banana;', $data['el-1']['customCss'] );
	}

	public function test_post__background_shorthand_color_only_sets_background_color_field() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'background' => 'red' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert: expander splits shorthand -> background-color converter sets background.color.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert: expander emits background-image: ...; gradient converter creates overlay.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert: no image layer to attach to.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( 'backdrop-filter', $data['el-1']['props']['backdrop-filter']['$$type'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_unsupported_filter_function_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'filter' => 'opacity(50%)' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'filter: opacity(50%);', $data['el-1']['customCss'] );
	}

	public function test_post__converts_number_prop_into_a_canonical_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'z-index' => '5' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [ 'z-index' => [ '$$type' => 'number', 'value' => 5 ] ], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
	}

	public function test_post__routes_non_numeric_number_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'z-index' => 'calc(1 + 1)' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'z-index: calc(1 + 1);', $data['el-1']['customCss'] );
	}

	public function test_post__converts_color_prop_including_named_colors_as_raw_passthrough() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'color' => 'whitesmoke', 'border-color' => '#2d2a26' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertArrayHasKey( 'default', $data );
		$this->assertArrayHasKey( 'hover', $data );
		$this->assertEquals( 'flex', $data['default']['props']->display['value'] );
		$this->assertEquals( 'red', $data['hover']['props']->color['value'] );
		$this->assertSame( '', $data['default']['customCss'] );
		$this->assertSame( '', $data['hover']['customCss'] );
	}

	public function test_post__null_value_is_emitted_as_a_null_reset_prop() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'font-weight' => null ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [ 'font-weight' => null ], $data['el-1']['props'] );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
				'color' => [
					'$$type' => Color_Variable_Prop_Type::get_key(),
					'value' => 'e-gv-1',
				],
			],
			$data['el-1']['props']
		);
		$this->assertTrue( Style_Schema::get()['color']->validate( (array) $data['el-1']['props']['color'] ) );

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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			(object) [
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			[
				'$$type' => Color_Variable_Prop_Type::get_key(),
				'value' => 'e-gv-border',
			],
			(array) $data['el-1']['props']['border-color']
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
					'type' => Size_Variable_Prop_Type::get_key(),
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
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals(
			[
				'$$type' => Size_Variable_Prop_Type::get_key(),
				'value' => 'e-gv-offset',
			],
			(array) $data['el-1']['props']['inset-block-start']
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'background: var(--external-var);', $data['el-1']['customCss'] );
		$this->assertSame( [], $data['el-1']['rejected'] );
	}

	public function test_post__unknown_var_goes_to_custom_css() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'color' => 'var(--external-var)' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
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
		$response = rest_get_server()->dispatch( $request );
		$data = $this->decoded_data( $response )['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( '', $data['el-1']['customCss'] );
		$this->assertSame( [ 'font-size: var(--heading-font);' ], $data['el-1']['rejected'] );

		$kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );
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
}
