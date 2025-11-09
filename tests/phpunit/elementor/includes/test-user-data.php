<?php
namespace Elementor\Testing\Includes;

use Elementor\User;
use Elementor\User_Data;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_User_Data extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );
	}

	public function test_get_current_user__returns_user_data_when_logged_in() {
		// Arrange
		$this->act_as_admin();
		$suppressed_messages = [ 'welcome_message', 'tutorial_tip' ];
		$this->setup_user_with_suppressed_messages( $suppressed_messages );

		// Act
		$response = $this->make_get_request();

		// Assert
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		
		$this->assertArrayHasKey( 'suppressedMessages', $data );
		$this->assertArrayHasKey( 'capabilities', $data );
		$this->assertSame( $suppressed_messages, $data['suppressedMessages'] );
		$this->assertIsArray( $data['capabilities'] );
		$this->assertContains( 'manage_options', $data['capabilities'] );
	}

	public function test_get_current_user__returns_empty_suppressed_messages_when_none_set() {
		// Arrange
		$this->act_as_admin();

		// Act
		$response = $this->make_get_request();

		// Assert
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		
		$this->assertSame( [], $data['suppressedMessages'] );
		$this->assertIsArray( $data['capabilities'] );
	}

	public function test_get_current_user__fails_when_not_logged_in() {
		// Arrange
		wp_set_current_user( 0 );

		// Act
		$response = $this->make_get_request();

		// Assert
		$this->assertSame( 401, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_update_current_user__updates_suppressed_messages() {
		// Arrange
		$this->act_as_admin();
		$initial_messages = [ 'old_message' ];
		$this->setup_user_with_suppressed_messages( $initial_messages );

		// Act
		$new_messages = [ 'new_message', 'another_message' ];
		$response = $this->make_patch_request( [ 'suppressedMessages' => $new_messages ] );

		// Assert
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		
		$this->assertSame( $new_messages, $data['suppressedMessages'] );
		
		// Verify the meta was actually updated
		$updated_meta = User::get_introduction_meta();
		$this->assertTrue( $updated_meta['new_message'] );
		$this->assertTrue( $updated_meta['another_message'] );
		$this->assertArrayNotHasKey( 'old_message', $updated_meta );
	}

	public function test_update_current_user__handles_empty_suppressed_messages() {
		// Arrange
		$this->act_as_admin();
		$this->setup_user_with_suppressed_messages( [ 'some_message' ] );

		// Act
		$response = $this->make_patch_request( [ 'suppressedMessages' => [] ] );

		// Assert
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		
		$this->assertSame( [], $data['suppressedMessages'] );
		
		// Verify the meta was cleared
		$updated_meta = User::get_introduction_meta();
		$this->assertEmpty( $updated_meta );
	}

	public function test_update_current_user__fails_with_invalid_suppressed_messages_param() {
		// Arrange
		$this->act_as_admin();
		$initial_messages = [ 'existing_message' ];
		$this->setup_user_with_suppressed_messages( $initial_messages );

		// Act
		$response = $this->make_patch_request( [ 'suppressedMessages' => 'not-an-array' ] );

		// Assert
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
		
		// Verify the meta was not changed
		$updated_meta = User::get_introduction_meta();
		$this->assertTrue( $updated_meta['existing_message'] );
	}

	public function test_update_current_user__fails_when_not_logged_in() {
		// Arrange
		wp_set_current_user( 0 );

		// Act
		$response = $this->make_patch_request( [ 'suppressedMessages' => [ 'test_message' ] ] );

		// Assert
		$this->assertSame( 401, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_register_routes__endpoint_exists() {
		// Arrange
		global $wp_rest_server;
		$routes = $wp_rest_server->get_routes();

		// Assert
		$this->assertArrayHasKey( '/elementor/v1/user-data/current-user', $routes );
		
		$route = $routes['/elementor/v1/user-data/current-user'];
		$this->assertCount( 2, $route ); // GET and PATCH methods
		
		// Check GET method
		$get_method = $route[0];
		$this->assertTrue( isset( $get_method['methods']['GET'] ) );
		$this->assertInstanceOf( \Closure::class, $get_method['callback'] );
		$this->assertInstanceOf( \Closure::class, $get_method['permission_callback'] );
		
		// Check PATCH method
		$patch_method = $route[1];
		$this->assertTrue( isset( $patch_method['methods']['PATCH'] ) );
		$this->assertInstanceOf( \Closure::class, $patch_method['callback'] );
		$this->assertInstanceOf( \Closure::class, $patch_method['permission_callback'] );
		
		// Check PATCH method args
		$this->assertArrayHasKey( 'suppressedMessages', $patch_method['args'] );
		$this->assertSame( 'array', $patch_method['args']['suppressedMessages']['type'] );
		$this->assertFalse( $patch_method['args']['suppressedMessages']['required'] );
	}

	public function test_constants_are_defined() {
		// Assert
		$this->assertSame( 'elementor/v1', User_Data::API_NAMESPACE );
		$this->assertSame( '/user-data/current-user', User_Data::API_BASE );
	}

	public function test_integration__full_workflow() {
		// Arrange
		$this->act_as_admin();

		// Act & Assert - Initial GET (empty data)
		$get_response = $this->make_get_request();
		
		$this->assertSame( 200, $get_response->get_status() );
		$initial_data = $get_response->get_data();
		$this->assertSame( [], $initial_data['suppressedMessages'] );

		// Act & Assert - UPDATE with new messages
		$messages = [ 'intro_dismissed', 'tooltip_hidden', 'banner_closed' ];
		$update_response = $this->make_patch_request( [ 'suppressedMessages' => $messages ] );
		
		$this->assertSame( 200, $update_response->get_status() );
		$updated_data = $update_response->get_data();
		$this->assertSame( $messages, $updated_data['suppressedMessages'] );

		// Act & Assert - GET again to verify persistence
		$final_get_response = $this->make_get_request();
		$this->assertSame( 200, $final_get_response->get_status() );
		$final_data = $final_get_response->get_data();
		$this->assertSame( $messages, $final_data['suppressedMessages'] );
	}

	private function setup_user_with_suppressed_messages( array $messages ) {
		$user_id = get_current_user_id();
		$introduction_meta = [];
		foreach ( $messages as $message ) {
			$introduction_meta[ $message ] = true;
		}
		update_user_meta( $user_id, User::INTRODUCTION_KEY, $introduction_meta );
	}

	private function make_get_request() {
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/user-data/current-user' );
		return rest_do_request( $request );
	}

	private function make_patch_request( array $params ) {
		$request = new \WP_REST_Request( 'PATCH', '/elementor/v1/user-data/current-user' );
		$request->set_body_params( $params );
		return rest_do_request( $request );
	}

	public function test_sanitize_suppressed_messages__sanitizes_array_properly() {
		// Arrange
		$input_array = [
			'clean_message',
			'<script>alert("xss")</script>',
			'message with spaces  ',
			123, // Non-string should be filtered out
			null, // Non-string should be filtered out
			'normal_message',
		];

		// Act
		$result = User_Data::sanitize_suppressed_messages( $input_array, new \WP_REST_Request(), 'suppressedMessages' );

		// Assert
		$expected = [
			'clean_message',
			// Script tags get completely removed by sanitize_text_field, resulting in empty string which is filtered out
			'message with spaces', // Trailing spaces should be trimmed
			'normal_message',
		];
		
		$this->assertSame( $expected, $result );
		$this->assertCount( 3, $result ); // Non-string items and empty strings after sanitization are filtered out
	}

	public function test_sanitize_suppressed_messages__returns_null_for_non_array() {
		// Arrange & Act
		$result1 = User_Data::sanitize_suppressed_messages( 'not-an-array', new \WP_REST_Request(), 'suppressedMessages' );
		$result2 = User_Data::sanitize_suppressed_messages( 123, new \WP_REST_Request(), 'suppressedMessages' );
		$result3 = User_Data::sanitize_suppressed_messages( null, new \WP_REST_Request(), 'suppressedMessages' );

		// Assert
		$this->assertNull( $result1 );
		$this->assertNull( $result2 );
		$this->assertNull( $result3 );
	}

	public function test_sanitize_suppressed_messages__handles_empty_array() {
		// Arrange & Act
		$result = User_Data::sanitize_suppressed_messages( [], new \WP_REST_Request(), 'suppressedMessages' );

		// Assert
		$this->assertSame( [], $result );
	}
} 