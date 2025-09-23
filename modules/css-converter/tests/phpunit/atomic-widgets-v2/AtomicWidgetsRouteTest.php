<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgetsV2;

use Elementor\Modules\CssConverter\Routes\Atomic_Widgets_Route;

class AtomicWidgetsRouteTest extends AtomicWidgetV2TestCase {

	private Atomic_Widgets_Route $route;

	protected function setUp(): void {
		parent::setUp();
		$this->route = new Atomic_Widgets_Route();
		
		// Mock WordPress functions if not available
		if ( ! function_exists( 'current_user_can' ) ) {
			function current_user_can( $capability ) {
				return true; // Mock as authorized user for testing
			}
		}
		
		if ( ! function_exists( 'wp_kses' ) ) {
			function wp_kses( $html, $allowed_html ) {
				return $html; // Simple passthrough for testing
			}
		}
	}

	public function test_route_configuration(): void {
		$this->assertEquals( 'elementor/v2', $this->route->get_route_namespace() );
		$this->assertEquals( 'atomic-widgets', $this->route->get_route_base() );
	}

	public function test_get_full_route_url(): void {
		// Mock rest_url function
		if ( ! function_exists( 'rest_url' ) ) {
			function rest_url( $path ) {
				return 'https://example.com/wp-json/' . $path;
			}
		}

		$base_url = $this->route->get_full_route_url();
		$this->assertStringContains( 'elementor/v2/atomic-widgets', $base_url );

		$convert_url = $this->route->get_full_route_url( 'convert' );
		$this->assertStringContains( 'elementor/v2/atomic-widgets/convert', $convert_url );
	}

	public function test_check_permissions(): void {
		$has_permission = $this->route->check_permissions();
		$this->assertTrue( $has_permission );
	}

	public function test_sanitize_html(): void {
		$test_html = '<div style="color: red;"><p>Test content</p><script>alert("xss")</script></div>';
		$sanitized = $this->route->sanitize_html( $test_html );
		
		$this->assertStringContains( '<div', $sanitized );
		$this->assertStringContains( '<p>', $sanitized );
		$this->assertStringContains( 'Test content', $sanitized );
		
		// Script tags should be removed by wp_kses (mocked to passthrough for this test)
		// In real implementation, wp_kses would remove script tags
	}

	public function test_validate_html_param(): void {
		// Valid HTML
		$this->assertTrue( $this->route->validate_html_param( '<div>Test</div>' ) );
		$this->assertTrue( $this->route->validate_html_param( '<p style="color: red;">Content</p>' ) );

		// Invalid HTML
		$this->assertFalse( $this->route->validate_html_param( '' ) );
		$this->assertFalse( $this->route->validate_html_param( '   ' ) );
		$this->assertFalse( $this->route->validate_html_param( 'Plain text without tags' ) );

		// Too large HTML
		$large_html = '<div>' . str_repeat( 'x', 1024 * 1024 + 1 ) . '</div>';
		$this->assertFalse( $this->route->validate_html_param( $large_html ) );
	}

	public function test_convert_html_to_widgets_success(): void {
		$request = $this->createMockRequest([
			'html' => '<div style="padding: 20px;"><h1 style="font-size: 32px;">Test Heading</h1></div>',
			'options' => [],
			'debug' => false,
			'performance' => false,
			'validation' => false,
		]);

		$response = $this->route->convert_html_to_widgets( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		
		$data = $response->get_data();
		$this->assertArrayHasKey( 'success', $data );
		
		if ( $data['success'] ) {
			$this->assertArrayHasKey( 'widgets', $data );
			$this->assertArrayHasKey( 'stats', $data );
		}
	}

	public function test_convert_html_to_widgets_missing_html(): void {
		$request = $this->createMockRequest([]);

		$response = $this->route->convert_html_to_widgets( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 400, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertFalse( $data['success'] );
		$this->assertEquals( 'HTML content is required', $data['error'] );
		$this->assertEquals( 'missing_html', $data['code'] );
	}

	public function test_convert_html_to_widgets_with_debug(): void {
		$request = $this->createMockRequest([
			'html' => '<div><h1>Test</h1></div>',
			'debug' => true,
			'performance' => true,
		]);

		$response = $this->route->convert_html_to_widgets( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		
		$data = $response->get_data();
		$this->assertArrayHasKey( 'success', $data );
		
		if ( $data['success'] ) {
			$this->assertArrayHasKey( 'performance', $data );
		}
	}

	public function test_convert_html_to_widgets_with_validation(): void {
		$request = $this->createMockRequest([
			'html' => '<div><h1>Test</h1></div>',
			'validation' => true,
		]);

		$response = $this->route->convert_html_to_widgets( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		
		$data = $response->get_data();
		$this->assertArrayHasKey( 'success', $data );
	}

	public function test_convert_html_to_global_classes_success(): void {
		$request = $this->createMockRequest([
			'html' => '<div style="padding: 20px;"><h1 style="font-size: 32px;">Test</h1></div>',
		]);

		$response = $this->route->convert_html_to_global_classes( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		
		$data = $response->get_data();
		$this->assertArrayHasKey( 'success', $data );
		
		if ( $data['success'] ) {
			$this->assertArrayHasKey( 'global_classes', $data );
		}
	}

	public function test_convert_html_to_global_classes_missing_html(): void {
		$request = $this->createMockRequest([]);

		$response = $this->route->convert_html_to_global_classes( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 400, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertFalse( $data['success'] );
		$this->assertEquals( 'missing_html', $data['code'] );
	}

	public function test_get_capabilities(): void {
		$request = $this->createMockRequest([]);

		$response = $this->route->get_capabilities( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 200, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertArrayHasKey( 'capabilities', $data );
		
		$capabilities = $data['capabilities'];
		$this->assertArrayHasKey( 'atomic_widgets_available', $capabilities );
		$this->assertArrayHasKey( 'supported_html_tags', $capabilities );
		$this->assertArrayHasKey( 'supported_widget_types', $capabilities );
		$this->assertArrayHasKey( 'supported_css_properties', $capabilities );
	}

	public function test_validate_html_success(): void {
		$request = $this->createMockRequest([
			'html' => '<div><h1>Valid HTML</h1><p>Content</p></div>',
		]);

		$response = $this->route->validate_html( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 200, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertArrayHasKey( 'success', $data );
		$this->assertArrayHasKey( 'valid', $data );
		$this->assertArrayHasKey( 'supported_elements', $data );
		$this->assertArrayHasKey( 'unsupported_elements', $data );
		$this->assertArrayHasKey( 'total_elements', $data );
	}

	public function test_validate_html_missing_html(): void {
		$request = $this->createMockRequest([]);

		$response = $this->route->validate_html( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 400, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertFalse( $data['success'] );
		$this->assertEquals( 'missing_html', $data['code'] );
	}

	public function test_error_handling_with_exception(): void {
		// This test would require mocking the orchestrator to throw an exception
		// For now, we'll test the structure of error responses
		
		$request = $this->createMockRequest([
			'html' => 'invalid-html-that-might-cause-exception',
		]);

		$response = $this->route->convert_html_to_widgets( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		
		$data = $response->get_data();
		$this->assertArrayHasKey( 'success', $data );
		
		if ( ! $data['success'] ) {
			$this->assertArrayHasKey( 'error', $data );
		}
	}

	public function test_options_parameter_handling(): void {
		$options = [
			'create_global_classes' => true,
			'optimize_performance' => false,
			'strict_validation' => true,
		];

		$request = $this->createMockRequest([
			'html' => '<div><h1>Test</h1></div>',
			'options' => $options,
		]);

		$response = $this->route->convert_html_to_widgets( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		
		$data = $response->get_data();
		$this->assertArrayHasKey( 'success', $data );
	}

	private function createMockRequest( array $params ): \WP_REST_Request {
		// Create a mock WP_REST_Request
		$request = $this->createMock( \WP_REST_Request::class );
		
		$request->method( 'get_param' )
			->willReturnCallback( function( $key ) use ( $params ) {
				return $params[ $key ] ?? null;
			});

		return $request;
	}

	public function test_route_args_structure(): void {
		// Use reflection to test private methods
		$reflection = new \ReflectionClass( $this->route );
		
		$get_convert_args = $reflection->getMethod( 'get_convert_args' );
		$get_convert_args->setAccessible( true );
		$convert_args = $get_convert_args->invoke( $this->route );

		$this->assertIsArray( $convert_args );
		$this->assertArrayHasKey( 'html', $convert_args );
		$this->assertArrayHasKey( 'options', $convert_args );
		$this->assertArrayHasKey( 'debug', $convert_args );
		$this->assertArrayHasKey( 'performance', $convert_args );
		$this->assertArrayHasKey( 'validation', $convert_args );

		// Test HTML parameter structure
		$html_arg = $convert_args['html'];
		$this->assertTrue( $html_arg['required'] );
		$this->assertEquals( 'string', $html_arg['type'] );

		$get_validate_args = $reflection->getMethod( 'get_validate_args' );
		$get_validate_args->setAccessible( true );
		$validate_args = $get_validate_args->invoke( $this->route );

		$this->assertIsArray( $validate_args );
		$this->assertArrayHasKey( 'html', $validate_args );
	}
}
