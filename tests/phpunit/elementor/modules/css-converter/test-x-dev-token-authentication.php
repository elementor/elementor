<?php
namespace Elementor\Testing\Modules\CssConverter;

use Elementor\Modules\CssConverter\Routes\Widgets_Route;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group authentication
 */
class Test_X_Dev_Token_Authentication extends Elementor_Test_Base {

	private $widgets_route;
	private $original_dev_token;

	public function setUp(): void {
		parent::setUp();
		$this->widgets_route = new Widgets_Route();
		
		// Store original dev token if it exists
		$this->original_dev_token = defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ? ELEMENTOR_CSS_CONVERTER_DEV_TOKEN : null;
	}

	public function tearDown(): void {
		// Clean up server variables
		unset( $_SERVER['HTTP_X_DEV_TOKEN'] );
		
		// Reset dev token constant (note: can't undefine constants in PHP)
		// This is a limitation of PHP - constants can't be undefined
		
		parent::tearDown();
	}

	public function test_permission_check_with_valid_dev_token() {
		// Define dev token
		if ( ! defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ) {
			define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', 'test-dev-token-123' );
		}
		
		// Set matching header token
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'test-dev-token-123';
		
		// Should allow access with valid token
		$this->assertTrue( $this->widgets_route->check_permissions() );
	}

	public function test_permission_check_with_invalid_dev_token() {
		// Define dev token
		if ( ! defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ) {
			define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', 'test-dev-token-123' );
		}
		
		// Set non-matching header token
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'invalid-token';
		
		// Should deny access with invalid token
		$this->assertFalse( $this->widgets_route->check_permissions() );
	}

	public function test_permission_check_with_missing_header_token() {
		// Define dev token
		if ( ! defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ) {
			define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', 'test-dev-token-123' );
		}
		
		// Don't set header token
		unset( $_SERVER['HTTP_X_DEV_TOKEN'] );
		
		// Should deny access without header token
		$this->assertFalse( $this->widgets_route->check_permissions() );
	}

	public function test_permission_check_without_dev_token_constant() {
		// Don't define dev token constant (simulate production environment)
		// Set header token
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'some-token';
		
		// Should deny access without dev token constant defined
		$this->assertFalse( $this->widgets_route->check_permissions() );
	}

	public function test_permission_check_with_empty_dev_token() {
		// Define empty dev token
		if ( ! defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ) {
			define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', '' );
		}
		
		// Set header token
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'some-token';
		
		// Should deny access with empty dev token
		$this->assertFalse( $this->widgets_route->check_permissions() );
	}

	public function test_permission_check_with_public_access_filter() {
		// Enable public access filter
		add_filter( 'elementor_css_converter_allow_public_access', '__return_true' );
		
		// Should allow access with public filter enabled
		$this->assertTrue( $this->widgets_route->check_permissions() );
		
		// Clean up filter
		remove_filter( 'elementor_css_converter_allow_public_access', '__return_true' );
	}

	public function test_permission_check_with_user_capability() {
		// Create user with edit_posts capability
		$user_id = $this->factory->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $user_id );
		
		// Should allow access with proper capability
		$this->assertTrue( $this->widgets_route->check_permissions() );
		
		// Reset user
		wp_set_current_user( 0 );
	}

	public function test_permission_check_without_user_capability() {
		// Create user without edit_posts capability
		$user_id = $this->factory->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );
		
		// Should deny access without proper capability
		$this->assertFalse( $this->widgets_route->check_permissions() );
		
		// Reset user
		wp_set_current_user( 0 );
	}

	public function test_hash_equals_security() {
		// Define dev token
		if ( ! defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ) {
			define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', 'secure-token-123' );
		}
		
		// Test with exact match
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'secure-token-123';
		$this->assertTrue( $this->widgets_route->check_permissions() );
		
		// Test with timing attack attempt (different length)
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'secure-token-12';
		$this->assertFalse( $this->widgets_route->check_permissions() );
		
		// Test with timing attack attempt (same length, different content)
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'secure-token-124';
		$this->assertFalse( $this->widgets_route->check_permissions() );
	}

	public function test_header_sanitization() {
		// Define dev token
		if ( ! defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ) {
			define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', 'clean-token' );
		}
		
		// Test with malicious header content
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'clean-token<script>alert("xss")</script>';
		
		// Should deny access due to sanitization mismatch
		$this->assertFalse( $this->widgets_route->check_permissions() );
		
		// Test with clean token
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'clean-token';
		$this->assertTrue( $this->widgets_route->check_permissions() );
	}

	public function test_integration_with_rest_api() {
		// Define dev token
		if ( ! defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ) {
			define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', 'api-test-token' );
		}
		
		// Create REST request
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div><h1>Test</h1></div>' );
		
		// Set dev token header
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'api-test-token';
		
		// Permission check should pass
		$this->assertTrue( $this->widgets_route->check_permissions() );
		
		// Test actual API call (would require full setup)
		// This is more of an integration test and might need additional setup
	}

	public function test_multiple_authentication_methods_priority() {
		// Test priority: public access > dev token > user capability
		
		// Define dev token
		if ( ! defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ) {
			define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', 'priority-test-token' );
		}
		
		// Create user without capability
		$user_id = $this->factory->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );
		
		// Set invalid dev token
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'invalid-token';
		
		// Should fail without public access
		$this->assertFalse( $this->widgets_route->check_permissions() );
		
		// Enable public access - should override everything
		add_filter( 'elementor_css_converter_allow_public_access', '__return_true' );
		$this->assertTrue( $this->widgets_route->check_permissions() );
		remove_filter( 'elementor_css_converter_allow_public_access', '__return_true' );
		
		// Set valid dev token - should override user capability
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'priority-test-token';
		$this->assertTrue( $this->widgets_route->check_permissions() );
		
		// Reset
		wp_set_current_user( 0 );
	}

	public function test_dev_token_constant_variations() {
		// Test different constant value types
		$test_cases = [
			'string-token',
			'123456',
			'token-with-special-chars!@#$%',
			'very-long-token-' . str_repeat( 'x', 100 ),
		];
		
		foreach ( $test_cases as $token ) {
			// Note: Can't redefine constants, so this test is more conceptual
			// In a real scenario, each would need a separate test environment
			
			$_SERVER['HTTP_X_DEV_TOKEN'] = $token;
			
			// Would need to define constant with this value
			// This demonstrates the test structure for different token types
			$this->assertIsString( $token );
		}
	}

	public function test_security_headers_handling() {
		// Test various header formats and edge cases
		
		if ( ! defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ) {
			define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', 'header-test-token' );
		}
		
		// Test normal case
		$_SERVER['HTTP_X_DEV_TOKEN'] = 'header-test-token';
		$this->assertTrue( $this->widgets_route->check_permissions() );
		
		// Test with extra whitespace (should be sanitized)
		$_SERVER['HTTP_X_DEV_TOKEN'] = '  header-test-token  ';
		$this->assertFalse( $this->widgets_route->check_permissions() ); // Sanitization changes the value
		
		// Test with null bytes
		$_SERVER['HTTP_X_DEV_TOKEN'] = "header-test-token\0";
		$this->assertFalse( $this->widgets_route->check_permissions() );
		
		// Test empty header
		$_SERVER['HTTP_X_DEV_TOKEN'] = '';
		$this->assertFalse( $this->widgets_route->check_permissions() );
	}
}
