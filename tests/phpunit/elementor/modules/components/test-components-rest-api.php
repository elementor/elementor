<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Testing\Modules\Components\Mocks\Component_Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/mocks/component-mocks.php';

class Test_Components_Rest_Api extends Elementor_Test_Base {

	private $mock_component_1_content;
	private $mock_component_2_content;
	private $mock_invalid_component_content;


	public function setUp(): void {
		parent::setUp();

		// Load mock component data
		$this->mock_component_1_content = Component_Mocks::get_component_1_data();
		$this->mock_component_2_content = Component_Mocks::get_component_2_data();
		$this->mock_invalid_component_content = Component_Mocks::get_invalid_component_data();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );

		// Register the component document type
		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		// Register post type for components
		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->clean_up_components();
	}

	private function clean_up_components() {
		// Clean up created components
		$components = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}
	}

	public function test_get_components__returns_empty_array_when_no_components() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [], $response->get_data()['data'] );
	}

	public function test_get_components__returns_all_components() {
		// Arrange
		$this->act_as_admin();
		$component_1_id = $this->create_test_component( 'Test Component 1', $this->mock_component_1_content );
		$component_2_id = $this->create_test_component( 'Test Component 2', $this->mock_component_2_content );
		$component_3_id = $this->create_test_component( 'Test Component 3', $this->mock_component_2_content, 'draft' );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];

		$this->assertCount( 3, $data );
		$this->assertArrayContainsObjects(
			[
				[
					'id' => $component_1_id,
					'name' => 'Test Component 1',
				],
				[
					'id' => $component_2_id,
					'name' => 'Test Component 2',
				],
				[
					'id' => $component_3_id,
					'name' => 'Test Component 3',
				],
			],
			$data,
			'Should return all components'
		);
	}

	public function test_get_styles__returns_empty_array_when_no_components() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/styles' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [], $response->get_data()['data'] );
	}

	public function test_get_styles__returns_extracted_styles() {
		// Arrange
		$this->act_as_admin();
		$component_1_id = $this->create_test_component( 'Test Component 1', $this->mock_component_1_content );
		$component_2_id = $this->create_test_component( 'Test Component 2', $this->mock_component_2_content );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/styles' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];



		// // Check styles for component 1
		$expected_styles_1 = Component_Mocks::get_component_1_expected_styles();

		$this->assertArrayHasKey( $component_1_id, $data, 'Component 1 should have styles in response' );
		$this->assertNotEmpty( $data[ $component_1_id ], 'Component 1 styles should not be empty' );

		$extracted_styles_1 = $data[ $component_1_id ];

		$this->assertArrayContainsObjects(
			array_values( $expected_styles_1 ),
			array_values( $extracted_styles_1 ),
			'Component 1 extracted styles should contain all expected styles'
		);

		// Check styles for component 2
		$expected_styles_2 = Component_Mocks::get_component_2_expected_styles();
		$extracted_styles_2 = $data[ $component_2_id ];

		$this->assertArrayContainsObjects(
			array_values( $expected_styles_2 ),
			array_values( $extracted_styles_2 ),
			'Component 2 extracted styles should contain all expected styles'
		);
	}

	public function post_create_components_data_provider() {
		return [
			'Success full creation with status publish' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 100,
							'title' => 'New Test Component 1',
							'elements' => Component_Mocks::get_component_1_data(),
						],
						[
							'temp_id' => 200,
							'title' => 'New Test Component 2',
							'elements' => Component_Mocks::get_component_2_data(),
						],
					]
				],
				'expected' => [
					100 => [
						'title' => 'New Test Component 1',
						'content' => Component_Mocks::get_component_1_data(),
						'status' => 'publish',
					],
					200 => [
						'title' => 'New Test Component 2',
						'content' => Component_Mocks::get_component_2_data(),
						'status' => 'publish',
					]
				]
			],
			'Success full creation with status draft' => [
				'input' => [
					'status' => 'draft',
					'items' => [
						[
							'temp_id' => 100,
							'title' => 'New Test Component 1',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					]
				],
				'expected' => [
					100 => [
						'title' => 'New Test Component 1',
						'content' => Component_Mocks::get_component_1_data(),
						'status' => 'draft',
					]
				]
			],
			'Success full creation with status autosave' => [
				'input' => [
					'status' => 'autosave',
					'items' => [
						[
							'temp_id' => 100,
							'title' => 'New Test Component 1',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					]
				],
				'expected' => [
					100 => [
						'title' => 'New Test Component 1',
						'content' => Component_Mocks::get_component_1_data(),
						'status' => 'draft',
					]
				]
			],
			'Sanitize the title' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 100,
							'title' => '  <script>alert(1)</script>Sanitized Component ',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					]
				],
				'expected' => [
					100 => [
						'title' => 'Sanitized Component',
						'content' => Component_Mocks::get_component_1_data(),
						'status' => 'publish',
					]
				]
			],
		];
	}

	/**
	 * @dataProvider post_create_components_data_provider
	 */
	public function test_post_create_components( $input, $expected ) {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( $input );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 201, $response->get_status() );

		$data = (array) $response->get_data()['data'];

		$this->assertCount( count( $expected ), $data );

		foreach ( $data as $key => $value ) {
			$document = Plugin::$instance->documents->get( $value );
			$current_expected = $expected[ $key ];

			$this->assertEquals( Component_Document::TYPE, $document->get_type() );
			$this->assertEquals( $current_expected['title'], $document->get_post()->post_title );
			$this->assertEquals( $current_expected['content'], $document->get_elements_data() );
			$this->assertEquals( $current_expected['status'], $document->get_post()->post_status );
		}
	}

	public function test_post_create_component__fails_when_unauthorized() {
		// Arrange
		$this->act_as_editor();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'temp_id' => 1,
					'title' => 'Test Component',
					'elements' => $this->mock_component_1_content,
				]
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}


	public function post_create_components_fails_data_provider() {
		return [
			'Missing title' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 1,
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "title is a required property of items[0]." ],
				],
			],
			'Title too short' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 1,
							'title' => 'A',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][title] must be at least 2 characters long." ],
				],
			],
			'Title too long' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 1,
							'title' => str_repeat( 'A', 201 ),
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][title] must be at most 200 characters long." ],
				],
			],
			'Title is invalid' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 1,
							'title' => [ 'not', 'a', 'string' ],
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][title] is not of type string." ],
				],
			],
			'Missing elements' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 1,
							'title' => 'Test Component',
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "elements is a required property of items[0]." ],
				],
			],
			'Elements not an array of object' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 1,
							'title' => 'Test Component',
							'elements' => 'not-an-array',
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][elements][0] is not of type object." ],
				],
			],
			'Elements is invalid' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 1,
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_invalid_component_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 500,
					'code' => 'unexpected_error',
				],
			],
			'Temp ID is missing' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "temp_id is a required property of items[0]." ],
				],
			],
			'Temp ID not a number' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'temp_id' => 'not-a-number',
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][temp_id] is not of type number." ],
				],
			],
			'Status is missing' => [
				'input' => [
					'items' => [
						[
							'temp_id' => 1,
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_missing_callback_param',
					'errors' => [ 'status' ],
				],
			],
			'Status invalid value' => [
				'input' => [
					'status' => 'invalid-status',
					'items' => [
						[
							'temp_id' => 1,
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'status' => "status is not one of publish, draft, and autosave." ],
				],
			],
		];
	}

	/**
	 * @dataProvider post_create_components_fails_data_provider
	 */
	public function test_post_create_components__fails( $input, $expected ) {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( $input );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( $expected['status_code'], $response->get_status() );
		$this->assertEquals( $expected['code'], $response->get_data()['code'] );

		if ( isset( $expected['errors'] ) ) {
			$this->assertEquals( $expected['errors'], $response->get_data()['data']['params'] );
		}
	}

	public function test_post_create_component__fails_when_name_is_duplicated() {
		// Arrange
		$this->create_test_component( 'Test Component', $this->mock_component_1_content );
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'temp_id' => 1,
					'title' => 'Test Component',
					'elements' => $this->mock_component_1_content,
				]
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'components_validation_failed', $response->get_data()['code'] );
		$this->assertEquals( 'Validation failed: Component name &#039;Test Component&#039; is duplicated.', $response->get_data()['message'] );
	}

	public function test_register_routes__endpoints_exist() {
		// Arrange
		global $wp_rest_server;
		$routes = $wp_rest_server->get_routes();

		// Assert
		$this->assertArrayHasKey( '/elementor/v1/components', $routes );
		$this->assertArrayHasKey( '/elementor/v1/components/styles', $routes );

		// Check GET method for components
		$components_route = $routes['/elementor/v1/components'];
		$get_methods = array_filter( $components_route, fn( $route ) => in_array( 'GET', $route['methods'] ) );
		$this->assertNotEmpty( $get_methods );

		// Check POST method for components
		$post_methods = array_filter( $components_route, fn( $route ) => in_array( 'POST', $route['methods'] ) );
		$this->assertNotEmpty( $post_methods );

		// Check GET method for styles
		$styles_route = $routes['/elementor/v1/components/styles'];
		$styles_get_methods = array_filter( $styles_route, fn( $route ) => in_array( 'GET', $route['methods'] ) );
		$this->assertNotEmpty( $styles_get_methods );
	}

	public function test_get_components__fails_when_unauthenticated() {
		// Act - no authentication
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 401, $response->get_status() );
	}

	public function test_get_styles__fails_when_unauthenticated() {
		// Act - no authentication
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/styles' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 401, $response->get_status() );
	}

	// Helpers
	private function create_test_component( string $name, array $content, string $status = 'publish' ): int {
		$this->act_as_admin();
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => $name,
				'post_status' => $status,
			]
		);

		$document->save( [
			'elements' => $content,
		] );

		return $document->get_main_id();
	}
	private function assertArrayContainsObjects( array $expected_objects, array $actual_array, string $message = '' ): void {
		foreach ( $expected_objects as $expected_object ) {
			$found = false;
			foreach ( $actual_array as $actual_item ) {
				if ( $this->objectsMatch( $expected_object, $actual_item ) ) {
					$found = true;
					break;
				}
			}
			$this->assertTrue( $found, $message ?: "Expected object not found in array: " . json_encode( $expected_object ) );
		}
	}

	private function objectsMatch( $expected, $actual ): bool {
		// If both are arrays, compare recursively
		if ( is_array( $expected ) && is_array( $actual ) ) {
			return $this->arraysMatch( $expected, $actual );
		}

		// For scalar values, use strict comparison
		return $expected === $actual;
	}
	private function arraysMatch( array $expected, array $actual ): bool {
		// Check if all expected keys exist and values match
		foreach ( $expected as $key => $expected_value ) {
			if ( ! array_key_exists( $key, $actual ) ) {
				return false;
			}

			if ( ! $this->objectsMatch( $expected_value, $actual[$key] ) ) {
				return false;
			}
		}

		return true;
	}
}
