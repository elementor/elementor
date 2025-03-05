<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Rest_Api extends Elementor_Test_Base {

	private $mock_global_classes = [
		'items' => [
			'g-4-123' => [
				'id' => 'g-4-123',
				'label' => 'pinky',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'pink',
							],
						],
					],
				],
			],
			'g-4-124' => [
				'id' => 'g-4-124',
				'label' => 'bluey',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'blue',
							],
						],
					],
				],
			],
		],
		'order' => [ 'g-4-123', 'g-4-124' ],
	];

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		parent::tearDown();

		Plugin::$instance->kits_manager->get_active_kit()->delete_meta( Global_Classes_Repository::META_KEY );
	}

	public function test_all__returns_all_global_classes() {
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( (object) $this->mock_global_classes['items'], $response->get_data()['data'] );
		$this->assertEquals( $this->mock_global_classes['order'], $response->get_data()['meta']['order'] );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_all__returns_empty_data_when_no_classes() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( (object) [], $response->get_data()['data'] );
		$this->assertEquals( [], $response->get_data()['meta']['order'] );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_all__returns_error_when_unauthorized() {
		// Arrange
		$this->act_as_subscriber();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_put__updates_classes() {
		// Arrange.
		$this->act_as_admin();

		$class_1 = $this->create_global_class( 'g-1' );
		$class_2 = $this->create_global_class( 'g-2' );

		$initial = [
			'items' => [
				'g-1' => $class_1,
				'g-2' => $class_2,
			],
			'order' => [ 'g-1', 'g-2' ],
		];

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $initial );

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class_3 = $this->create_global_class( 'g-3', '<b>should-be-sanitized</b>' );

		$updated = [
			'items' => [
				'g-1' => $class_1,
				'g-3' => $class_3,
			],
			'order' => [ 'g-3', 'g-1' ],
		];

		$request->set_body_params( $updated );

		$response = rest_do_request( $request );

		// Assert.
		$classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY );

		$this->assertSame( 204, $response->get_status() );
		$this->assertNull( $response->get_data() );

		$this->assertSame( [
			'items' => [
				'g-1' => $class_1,
				'g-3' => $this->create_global_class( 'g-3', 'should-be-sanitized' ),
			],
			'order' => [ 'g-3', 'g-1' ],
		], $classes );
	}

	public function test_put__fails_when_unauthorized() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( [
			'items' => [],
			'order' => [],
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 403, $response->get_status() );
	}

	public function test_put__fails_when_missing_required_param() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( [] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_missing_callback_param', $response->get_data()['code'] );
		$this->assertSame( [ 'items', 'order' ], $response->get_data()['data']['params'] );
	}

	public function test_put__fails_when_params_have_invalid_type() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( [
			'items' => 'not-an-object',
			'order' => fn () => null,
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertSame( [ 'items', 'order' ], array_keys( $response->get_data()['data']['params'] ) );
	}

	public function test_put__fails_when_order_contains_non_strings() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( [
			'items' => [],
			'order' => [ 'g-1', 123 ],
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertSame( [ 'order' ], array_keys( $response->get_data()['data']['params'] ) );
	}

	public function test_put__fails_when_items_contains_non_objects() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class = $this->create_global_class( 'g-1' );

		$request->set_body_params( [
			'items' => [ $class, 'not-a-class' ],
			'order' => [ 'g-1'],
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertSame( [ 'items' ], array_keys( $response->get_data()['data']['params'] ) );
	}

	public function test_put__fails_when_order_contains_non_existing_id() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class = $this->create_global_class( 'g-1' );

		$request->set_body_params( [
			'items' => [
				'g-1' => $class,
			],
			'order' => [ 'g-1', 'g-2' ],
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'invalid_order', $response->get_data()['code'] );
	}

	public function test_put__fails_when_order_is_missing_ids() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class_1 = $this->create_global_class( 'g-1' );
		$class_2 = $this->create_global_class( 'g-2' );

		$request->set_body_params( [
			'items' => [
				'g-1' => $class_1,
				'g-2' => $class_2,
			],
			'order' => [ 'g-1' ],
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'invalid_order', $response->get_data()['code'] );
	}

	public function test_put__skips_order_duplications() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class = $this->create_global_class( 'g-1' );

		$request->set_body_params( [
			'items' => [
				'g-1' => $class,
			],
			'order' => [ 'g-1', 'g-1' ],
		] );

		$response = rest_do_request( $request );

		// Assert.
		$classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY );

		$this->assertSame( 204, $response->get_status() );
		$this->assertNull( $response->get_data() );

		$this->assertSame( [
			'items' => [
				'g-1' => $class,
			],
			'order' => [ 'g-1' ],
		], $classes );
	}

	public function test_put__fails_when_items_has_item_with_wrong_id() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class_1 = $this->create_global_class( 'g-1' );
		$class_2 = $this->create_global_class( 'g-2' );

		$request->set_body_params( [
			'items' => [
				'g-1' => $class_1,
				'g-222' => $class_2,
			],
			'order' => [ 'g-1', 'g-222' ],
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'invalid_items', $response->get_data()['code'] );
		$this->assertStringNotContainsString( 'g-1', $response->get_data()['message'] );
		$this->assertStringContainsString( 'g-222', $response->get_data()['message'] );
	}

	public function test_put__does_not_fail_when_data_is_identical() {
		// Arrange.
		$this->act_as_admin();

		$class_1 = $this->create_global_class( 'g-1' );
		$class_2 = $this->create_global_class( 'g-2' );

		$initial = [
			'items' => [
				'g-1' => $class_1,
				'g-2' => $class_2,
			],
			'order' => [ 'g-1', 'g-2' ],
		];

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $initial );

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( $initial );

		$response = rest_do_request( $request );

		// Assert.
		$classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY );

		$this->assertSame( 204, $response->get_status() );
		$this->assertNull( $response->get_data() );
		$this->assertSame( $initial, $classes );
	}

	private function create_global_class( string $id, ?string $color = null ) {
		return [
			'id' => $id,
			'label' => "label-$id",
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => [
						'color' => [
							'$$type' => 'color',
							'value' => $color ?? 'red',
						],
					],
				],
			],
		];
	}
}
