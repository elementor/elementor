<?php
namespace Elementor\Testing\Modules\CssConverter\Services;

use Elementor\Modules\CssConverter\Services\Request_Validator;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group request-validator
 */
class Test_Request_Validator extends Elementor_Test_Base {

	private $request_validator;

	public function setUp(): void {
		parent::setUp();
		$this->request_validator = new Request_Validator();
	}

	public function test_validates_required_parameters() {
		// Missing type parameter
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'content', '<div>Test</div>' );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'missing_required_parameter', $result->get_data()['error'] );
		$this->assertEquals( 'type', $result->get_data()['parameter'] );
	}

	public function test_validates_parameter_types() {
		// Invalid type enum value
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'invalid_type' );
		$request->set_param( 'content', '<div>Test</div>' );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'invalid_parameter_value', $result->get_data()['error'] );
		$this->assertEquals( 'type', $result->get_data()['parameter'] );
	}

	public function test_validates_content_size_limits() {
		// HTML content too large (over 10MB)
		$large_content = str_repeat( 'x', 11 * 1024 * 1024 ); // 11MB
		
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', $large_content );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 413, $result->get_status() );
		$this->assertEquals( 'content_too_large', $result->get_data()['error'] );
		$this->assertEquals( 'html', $result->get_data()['type'] );
	}

	public function test_validates_html_security_constraints() {
		// HTML with script tag
		$malicious_html = '<div><script>alert("xss")</script><h1>Title</h1></div>';
		
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', $malicious_html );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'security_violation', $result->get_data()['error'] );
		$this->assertNotEmpty( $result->get_data()['violations'] );
	}

	public function test_validates_css_security_constraints() {
		// CSS with javascript: URL
		$malicious_css = '.test { background: url("javascript:alert(1)"); }';
		
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'css' );
		$request->set_param( 'content', $malicious_css );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'security_violation', $result->get_data()['error'] );
		$this->assertNotEmpty( $result->get_data()['violations'] );
	}

	public function test_validates_url_format() {
		// Invalid URL format
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'url' );
		$request->set_param( 'content', 'not-a-valid-url' );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'invalid_url', $result->get_data()['error'] );
		$this->assertEquals( 'content', $result->get_data()['parameter'] );
	}

	public function test_validates_url_protocol() {
		// FTP URL (not allowed)
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'url' );
		$request->set_param( 'content', 'ftp://example.com/file.html' );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'invalid_url_scheme', $result->get_data()['error'] );
		$this->assertEquals( 'ftp', $result->get_data()['scheme'] );
	}

	public function test_validates_css_urls_array() {
		// Valid CSS URLs
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'cssUrls', [
			'https://example.com/style1.css',
			'https://example.com/style2.css',
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertNull( $result ); // Should pass validation
	}

	public function test_validates_invalid_css_urls() {
		// Invalid CSS URL in array
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'cssUrls', [
			'https://example.com/style1.css',
			'invalid-url',
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'invalid_url', $result->get_data()['error'] );
		$this->assertEquals( 'cssUrls[1]', $result->get_data()['parameter'] );
	}

	public function test_validates_nesting_depth() {
		// Create deeply nested HTML (over 20 levels)
		$nested_html = '<div>';
		for ( $i = 0; $i < 25; $i++ ) {
			$nested_html .= '<div>';
		}
		$nested_html .= 'Content';
		for ( $i = 0; $i < 25; $i++ ) {
			$nested_html .= '</div>';
		}
		$nested_html .= '</div>';
		
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', $nested_html );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'nesting_too_deep', $result->get_data()['error'] );
		$this->assertGreaterThan( 20, $result->get_data()['actual_depth'] );
	}

	public function test_validates_options_object() {
		// Valid options
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'options', [
			'postType' => 'page',
			'createGlobalClasses' => true,
			'timeout' => 30,
			'globalClassThreshold' => 1,
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertNull( $result ); // Should pass validation
	}

	public function test_validates_post_id_option() {
		// Create a test post
		$post_id = $this->factory->post->create();
		
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'options', [
			'postId' => $post_id,
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertNull( $result ); // Should pass validation
		
		// Clean up
		wp_delete_post( $post_id, true );
	}

	public function test_validates_invalid_post_id() {
		// Non-existent post ID
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'options', [
			'postId' => 999999, // Non-existent post
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 404, $result->get_status() );
		$this->assertEquals( 'post_not_found', $result->get_data()['error'] );
		$this->assertEquals( 999999, $result->get_data()['post_id'] );
	}

	public function test_validates_post_type_option() {
		// Invalid post type
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'options', [
			'postType' => 'non_existent_post_type',
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'invalid_post_type', $result->get_data()['error'] );
		$this->assertEquals( 'non_existent_post_type', $result->get_data()['post_type'] );
	}

	public function test_validates_timeout_option() {
		// Timeout too high
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'options', [
			'timeout' => 500, // Over 300 second limit
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'invalid_option_value', $result->get_data()['error'] );
		$this->assertEquals( 'timeout', $result->get_data()['option'] );
		$this->assertEquals( 1, $result->get_data()['min'] );
		$this->assertEquals( 300, $result->get_data()['max'] );
	}

	public function test_validates_threshold_option() {
		// Threshold too high
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'options', [
			'globalClassThreshold' => 150, // Over 100 limit
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'invalid_option_value', $result->get_data()['error'] );
		$this->assertEquals( 'globalClassThreshold', $result->get_data()['option'] );
		$this->assertEquals( 1, $result->get_data()['min'] );
		$this->assertEquals( 100, $result->get_data()['max'] );
	}

	public function test_validates_boolean_options() {
		// Invalid boolean value
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'options', [
			'createGlobalClasses' => 'yes', // Should be boolean
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'invalid_option_value', $result->get_data()['error'] );
		$this->assertEquals( 'createGlobalClasses', $result->get_data()['option'] );
	}

	public function test_passes_valid_request() {
		// Completely valid request
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div class="container"><h1>Hello World</h1><p>Test content</p></div>' );
		$request->set_param( 'cssUrls', [
			'https://example.com/styles.css',
		] );
		$request->set_param( 'followImports', true );
		$request->set_param( 'options', [
			'postType' => 'page',
			'preserveIds' => false,
			'createGlobalClasses' => true,
			'timeout' => 30,
			'globalClassThreshold' => 1,
		] );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertNull( $result ); // Should pass all validation
	}

	public function test_provides_validation_summary() {
		$summary = $this->request_validator->get_validation_summary();
		
		$this->assertIsArray( $summary );
		$this->assertArrayHasKey( 'validation_rules', $summary );
		$this->assertArrayHasKey( 'security_config', $summary );
		$this->assertArrayHasKey( 'supported_types', $summary );
		$this->assertArrayHasKey( 'size_limits', $summary );
		$this->assertArrayHasKey( 'max_nesting_depth', $summary );
		
		// Check supported types
		$this->assertEquals( [ 'url', 'html', 'css' ], $summary['supported_types'] );
		
		// Check size limits
		$this->assertEquals( 10 * 1024 * 1024, $summary['size_limits']['html'] );
		$this->assertEquals( 5 * 1024 * 1024, $summary['size_limits']['css'] );
		
		// Check max nesting depth
		$this->assertEquals( 20, $summary['max_nesting_depth'] );
	}

	public function test_handles_empty_content() {
		// Empty content
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '' );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( 'missing_required_parameter', $result->get_data()['error'] );
		$this->assertEquals( 'content', $result->get_data()['parameter'] );
	}

	public function test_handles_null_optional_parameters() {
		// Null optional parameters should be allowed
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div>Test</div>' );
		$request->set_param( 'cssUrls', null );
		$request->set_param( 'followImports', null );
		$request->set_param( 'options', null );
		
		$result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertNull( $result ); // Should pass validation
	}
}
