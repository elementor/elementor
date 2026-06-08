<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter_REST_API;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
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

	public function test_post__returns_empty_props_and_all_input_as_custom_css_with_only_noops() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'padding' => '10px', 'margin' => '5px' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertEquals( (object) [], $data['el-1']['props'] );
		$this->assertSame( 'padding: 10px; margin: 5px;', $data['el-1']['customCss'] );
	}

	public function test_post__returns_one_named_result_per_input_block() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [
			'el-1' => [ 'margin' => '8px' ],
			'el-2' => [ 'padding' => '4px' ],
		] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( [ 'el-1', 'el-2' ], array_keys( $data ) );
		$this->assertSame( 'margin: 8px;', $data['el-1']['customCss'] );
		$this->assertSame( 'padding: 4px;', $data['el-2']['customCss'] );
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
				'padding' => '10px',
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
		$this->assertSame( 'padding: 10px;', $data['el-1']['customCss'] );
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
