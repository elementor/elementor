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

	public function test_post__converts_filter_into_a_canonical_prop_value() {
		// Arrange.
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/css-to-atomic' );
		$request->set_param( 'blocks', [ 'el-1' => [ 'filter' => 'blur(5px) brightness(150%)' ] ] );

		// Act.
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data()['data'];

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
		$data = $response->get_data()['data'];

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
				'transform' => 'rotate(45deg)',
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
		$this->assertSame( 'transform: rotate(45deg);', $data['el-1']['customCss'] );
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
