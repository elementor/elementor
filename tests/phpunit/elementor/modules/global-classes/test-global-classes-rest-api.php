<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Rest_Api extends Elementor_Test_Base {
	private $mock_global_class = [
		"label" => "flexy",
		"type" => "class",
		"variants" => [
			[
				"meta" => [
					"breakpoint" => "desktop",
					"state" => null
				],
				'props' => [
					'color' => [
						'$$type' => 'color',
						'value' => 'pink',
					],
				],
			]
		]
	];

	private $mock_unsanitized_class = [
		"label" => "flexy",
		"variants" => [
			[
				"meta" => [
					"breakpoint" => "desktop",
					"state" => null
				],
				'props' => [
					'color' => [
						'$$type' => 'color',
						'value' => '<b>pink</b>',
					],
				],
			]
		]
	];

	private $mock_unsanitized_existing_class_update = [
		'id' => 'g-4-123',
		'type' => 'class',
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
						'value' => '<b>blue</b>',
					],
				],
			],
		],
	];

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

	public function test_get__returns_single_class() {
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes/g-4-123' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( $this->mock_global_classes['items']['g-4-123'], $response->get_data()['data'] );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_get__returns_error_when_class_not_found() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes/g-4-123' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 404, $response->get_status() );
	}

	public function test_get__returns_error_when_unauthorized() {
		// Arrange
		$this->act_as_subscriber();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes/g-4-123' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_delete__removes_class() {
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'DELETE', '/elementor/v1/global-classes/g-4-123' );
		$response = rest_do_request( $request );

		// Assert
		$classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY );

		$this->assertEquals( 204, $response->get_status() );
		$this->assertArrayNotHasKey( 'g-4-123', $classes['items'] );
	}

	public function test_delete__returns_error_when_class_not_found() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'DELETE', '/elementor/v1/global-classes/g-4-123' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 404, $response->get_status() );
	}

	public function test_delete__returns_error_when_unauthorized() {
		// Arrange
		$this->act_as_subscriber();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'DELETE', '/elementor/v1/global-classes/g-4-123' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_put__updates_class() {
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes/g-4-123' );
		$updated_class = array_merge( $this->mock_global_class, [ 'label' => 'new label' ] );
		$request->set_body_params( $updated_class );
		$response = rest_do_request( $request );

		// Assert
		$classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY );

		$expected_class = array_merge( $updated_class, [ 'id' => 'g-4-123' ] );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( $expected_class, $classes['items']['g-4-123'] );
	}
	public function test_put__doesnt_throw_when_data_is_identical() {
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes/g-4-123' );
		$request->set_body_params( $this->mock_global_class );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
	}


	public function test_put__returns_error_when_class_not_found(){
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes/g-4-123' );
		$request->set_body_params( $this->mock_global_class );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 404, $response->get_status() );
	}

	public function test_put__returns_error_when_data_invalid() {
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes/g-4-123' );
		$request->set_body_params( [] );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_put__returns_error_when_unauthorized() {
		// Arrange
		$this->act_as_subscriber();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes/g-4-123' );
		$request->set_body_params( $this->mock_global_class );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_post__creates_new_class() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/global-classes' );
		$request->set_body_params( $this->mock_global_class );
		$response = rest_do_request( $request );

		// Assert
		$classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY );
		$id = $response->get_data()['data']->id;

		$this->assertEquals( 201, $response->get_status() );
		$this->assertArrayHasKey( 'items', $classes );
		$this->assertArrayHasKey( 'order', $classes );
		$this->assertArrayHasKey( $id, $classes['items'] );
	}

	public function test_post__returns_error_when_data_invalid() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/global-classes' );
		$request->set_body_params( [] );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_post__create_sanitized_style() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/global-classes' );
		$request->set_body_params( $this->mock_unsanitized_class );
		$response = rest_do_request( $request );

		// Assert
		$classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY );
		$id = $response->get_data()['data']->id;
		$class =  $classes['items'][ $id ];

		$this->assertEquals( 201, $response->get_status() );
		$this->assertTrue( [
				'color' => [
					'$$type' => 'color',
					'value' => 'pink',
				]
			] == $class['variants'][0]['props'] );
	}

	public function test_post__update_sanitized_style() {
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes/g-4-123' );
		$request->set_body_params( $this->mock_unsanitized_existing_class_update );
		$response = rest_do_request( $request );

		// Assert
		$classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY );
		$class =  $classes['items'][ 'g-4-123' ];

		$this->assertEquals( 200, $response->get_status() );
		$this->assertTrue( [
				'color' => [
					'$$type' => 'color',
					'value' => 'blue',
				]
			] == $class['variants'][0]['props'] );
	}

	public function test_post__returns_error_when_unauthorized() {
		// Arrange
		$this->act_as_subscriber();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/global-classes' );
		$request->set_body_params( $this->mock_global_class );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_arrange__updates_order() {
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes-order' );
		$request->set_body_params( [ 'g-4-124', 'g-4-123' ] );
		$response = rest_do_request( $request );

		// Assert
		$classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ 'g-4-124', 'g-4-123' ], $classes['order'] );
	}

	public function test_arrange__doesnt_throw_when_order_is_identical(){
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes-order' );
		$request->set_body_params( $this->mock_global_classes['order'] );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_arrange__returns_error_when_class_not_exists_in_data(){
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes-order' );
		$request->set_body_params( [ 'g-4-124' ] );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_arrange__returns_error_when_class_not_exists_in_updated_order(){
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes-order' );
		$request->set_body_params( [] );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_arrange__returns_error_when_order_does_not_match(){
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes-order' );
		$request->set_body_params( [ 'not-exist', 'g-4-124' ] );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_arrange__returns_error_when_unauthorized(){
		// Arrange
		$this->act_as_subscriber();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes-order' );
		$request->set_body_params( [ 'g-4-124', 'g-4-123' ] );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}
}
