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

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];

		$this->assertCount( 2, $data );
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
			],
			$data,
			'Should return all components'
		);
	}

	public function test_get_components__only_returns_published_components() {
		// Arrange
		$this->act_as_admin();
		$published_id = $this->create_test_component( 'Published Component', $this->mock_component_1_content );
		$this->create_test_component( 'Draft Component', $this->mock_component_2_content, 'draft' );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];

		$this->assertCount( 1, $data );
		$this->assertTrue(
			$this->objectsMatch(
				[
					'id' => $published_id,
					'name' => 'Published Component',
				],
				$data[0]
			),
			'Should return only published components'
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

	public function test_post_create_component__creates_component_successfully() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'New Test Component',
			'content' => $this->mock_component_1_content,
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 201, $response->get_status() );
		$component_id = $response->get_data()['data']['component_id'];
		$this->assertIsInt( $component_id );

		// Verify component was created
		$post = get_post( $component_id );
		$this->assertEquals( 'New Test Component', $post->post_title );
		$this->assertEquals( Component_Document::TYPE, $post->post_type );
		$this->assertEquals( 'publish', $post->post_status );

		// Verify content was saved
		$document = Plugin::$instance->documents->get( $component_id );
		$saved_content = $document->get_elements_data();
		$this->assertTrue(
			$this->objectsMatch(
				$this->mock_component_1_content,
				$saved_content
			),
			'Should save component content'
		);
	}

	public function test_post_create_component__sanitizes_component_name() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => '  <script>alert("xss")</script>Sanitized Component  ',
			'content' => $this->mock_component_1_content,
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 201, $response->get_status() );
		$component_id = $response->get_data()['data']['component_id'];

		$post = get_post( $component_id );
		$this->assertEquals( 'Sanitized Component', $post->post_title );
	}

	public function test_post_create_component__fails_when_unauthorized() {
		// Arrange
		$this->act_as_editor();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'Test Component',
			'content' => [ $this->mock_component_1_content ],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_post_create_component__fails_when_name_is_missing() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'content' => [ $this->mock_component_2_content ],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_missing_callback_param', $response->get_data()['code'] );
		$this->assertContains( 'name', $response->get_data()['data']['params'] );
	}

	public function test_post_create_component__fails_when_content_is_missing() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'Test Component',
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_missing_callback_param', $response->get_data()['code'] );
		$this->assertContains( 'content', $response->get_data()['data']['params'] );
	}

	public function test_post_create_component__fails_when_max_components_limit_is_reached() {
		// Arrange
		for ( $i = 0; $i < 49; $i++ ) {
			$this->create_test_component( 'Test Component ' . $i, $this->mock_component_1_content );
		}
		
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'Test Component 50',
			'content' => $this->mock_component_1_content,
		] );

		// Act - create the 50th component
		$response = rest_do_request( $request );

		// Assert - should create the 50th component successfully
		$this->assertEquals( 201, $response->get_status() );
		$component_id = $response->get_data()['data']['component_id'];

		$post = get_post( $component_id );
		$this->assertEquals( 'Test Component 50', $post->post_title );

		// Act - create the 51st component
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'Test Component 51',
			'content' => $this->mock_component_1_content,
		] );

		$response = rest_do_request( $request );

		// Assert - should fail on the 51st component
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'components_limit_exceeded', $response->get_data()['code'] );
		$this->assertEquals( 'Components limit exceeded. Maximum allowed: 50', $response->get_data()['message'] );
	}

	public function test_post_create_component__fails_when_name_is_too_short() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'a  ',
			'content' => [ $this->mock_component_1_content ],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'invalid_name', $response->get_data()['code'] );
		$this->assertEquals( 'Invalid component name: name: component_name_too_short_min_2', $response->get_data()['message'] );
	}

	public function test_post_create_component__fails_when_name_is_too_long() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'a'.str_repeat('a', 51),
			'content' => [ $this->mock_component_1_content ],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'invalid_name', $response->get_data()['code'] );
		$this->assertEquals( 'Invalid component name: name: component_name_too_long_max_50', $response->get_data()['message'] );
	}

	public function test_post_create_component__fails_when_name_is_duplicated() {
		// Arrange
		$this->create_test_component( 'Test Component', $this->mock_component_1_content );
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'Test Component',
			'content' => [ $this->mock_component_1_content ],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'invalid_name', $response->get_data()['code'] );
		$this->assertEquals( 'Invalid component name: name: duplicated_component_name', $response->get_data()['message'] );
	}

	public function test_post_create_component__fails_when_name_has_invalid_type() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 123,
			'content' => [ $this->mock_component_2_content ],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertArrayHasKey( 'name', $response->get_data()['data']['params'] );
	}

	public function test_post_create_component__fails_when_content_has_invalid_type() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'Test Component',
			'content' => 'not-an-array',
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertArrayHasKey( 'content', $response->get_data()['data']['params'] );
	}

	public function test_post_create_component__fails_when_content_has_invalid_structure() {
		// Arrange
		$this->act_as_admin();
		
		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'Invalid Test Component',
			'content' => $this->mock_invalid_component_content,
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'content_validation_failed', $response->get_data()['code'] );
		$this->assertEquals( 'Settings validation failed. link: invalid_value', $response->get_data()['message'] );
	}

	public function test_post_create_component__fails_when_reaching_max_components_limit() {
		// Arrange
		$this->act_as_admin();

		// Create 50 components
		for ( $i = 0; $i < 50; $i++ ) {
			$this->create_test_component( 'Test Component ' . $i, $this->mock_component_1_content );
		}

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'name' => 'Test Component',
			'content' => [ $this->mock_component_1_content ],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'components_limit_exceeded', $response->get_data()['code'] );
		$this->assertEquals( 'Components limit exceeded. Maximum allowed: 50', $response->get_data()['message'] );
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
