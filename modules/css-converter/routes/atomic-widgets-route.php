<?php
namespace Elementor\Modules\CssConverter\Routes;

use Elementor\Modules\CssConverter\Services\AtomicWidgetsV2\Atomic_Widgets_Orchestrator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widgets_Route {

	private const ROUTE_NAMESPACE = 'elementor/v2';
	private const ROUTE_BASE = 'atomic-widgets';

	public function register_routes(): void {
		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/' . self::ROUTE_BASE . '/convert',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => [ $this, 'convert_html_to_widgets' ],
				'permission_callback' => [ $this, 'check_permissions' ],
				'args' => $this->get_convert_args(),
			]
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/' . self::ROUTE_BASE . '/global-classes',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => [ $this, 'convert_html_to_global_classes' ],
				'permission_callback' => [ $this, 'check_permissions' ],
				'args' => $this->get_convert_args(),
			]
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/' . self::ROUTE_BASE . '/capabilities',
			[
				'methods' => \WP_REST_Server::READABLE,
				'callback' => [ $this, 'get_capabilities' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::ROUTE_NAMESPACE,
			'/' . self::ROUTE_BASE . '/validate',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => [ $this, 'validate_html' ],
				'permission_callback' => [ $this, 'check_permissions' ],
				'args' => $this->get_validate_args(),
			]
		);
	}

	public function convert_html_to_widgets( \WP_REST_Request $request ): \WP_REST_Response {
		error_log('🔵 LEVEL 1 - ENDPOINT: Request received');
		$html = $request->get_param( 'html' );
		error_log('🔵 LEVEL 1 - ENDPOINT: HTML = ' . substr($html, 0, 200));
		$options = $request->get_param( 'options' ) ?: [];
		$debug_mode = $request->get_param( 'debug' ) ?: false;
		$performance_monitoring = $request->get_param( 'performance' ) ?: false;
		$validation = $request->get_param( 'validation' ) ?: false;

		if ( empty( $html ) ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'HTML content is required',
					'code' => 'missing_html',
				],
				400
			);
		}

		try {
			$orchestrator = new Atomic_Widgets_Orchestrator( $debug_mode, $performance_monitoring );
			
			if ( $validation ) {
				$result = $orchestrator->convert_with_validation( $html, $options );
			} else {
				$result = $orchestrator->convert_html_to_atomic_widgets( $html, $options );
			}

			$status_code = $result['success'] ? 200 : 422;

			return new \WP_REST_Response( $result, $status_code );

		} catch ( \Exception $e ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'Internal conversion error',
					'message' => $debug_mode ? $e->getMessage() : 'An error occurred during conversion',
					'code' => 'conversion_error',
				],
				500
			);
		}
	}

	public function convert_html_to_global_classes( \WP_REST_Request $request ): \WP_REST_Response {
		$html = $request->get_param( 'html' );
		$options = $request->get_param( 'options' ) ?: [];
		$debug_mode = $request->get_param( 'debug' ) ?: false;
		$performance_monitoring = $request->get_param( 'performance' ) ?: false;

		if ( empty( $html ) ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'HTML content is required',
					'code' => 'missing_html',
				],
				400
			);
		}

		try {
			$orchestrator = new Atomic_Widgets_Orchestrator( $debug_mode, $performance_monitoring );
			$result = $orchestrator->convert_html_to_global_classes( $html, $options );

			$status_code = $result['success'] ? 200 : 422;

			return new \WP_REST_Response( $result, $status_code );

		} catch ( \Exception $e ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'Internal conversion error',
					'message' => $debug_mode ? $e->getMessage() : 'An error occurred during conversion',
					'code' => 'conversion_error',
				],
				500
			);
		}
	}

	public function get_capabilities( \WP_REST_Request $request ): \WP_REST_Response {
		try {
			$orchestrator = new Atomic_Widgets_Orchestrator();
			$capabilities = $orchestrator->get_conversion_capabilities();

			return new \WP_REST_Response(
				[
					'success' => true,
					'capabilities' => $capabilities,
				],
				200
			);

		} catch ( \Exception $e ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'Failed to get capabilities',
					'message' => $e->getMessage(),
					'code' => 'capabilities_error',
				],
				500
			);
		}
	}

	public function validate_html( \WP_REST_Request $request ): \WP_REST_Response {
		$html = $request->get_param( 'html' );

		if ( empty( $html ) ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'HTML content is required',
					'code' => 'missing_html',
				],
				400
			);
		}

		try {
			$orchestrator = new Atomic_Widgets_Orchestrator( true, false );
			$result = $orchestrator->convert_with_validation( $html );

			// Return validation-specific response
			$validation_response = [
				'success' => $result['success'],
				'valid' => $result['success'] && empty( $result['validation_errors'] ?? [] ),
				'supported_elements' => $result['stats']['supported_elements'] ?? 0,
				'unsupported_elements' => $result['stats']['unsupported_elements'] ?? 0,
				'total_elements' => $result['stats']['total_elements_parsed'] ?? 0,
			];

			if ( ! empty( $result['validation_errors'] ) ) {
				$validation_response['validation_errors'] = $result['validation_errors'];
			}

			if ( ! empty( $result['warnings'] ) ) {
				$validation_response['warnings'] = $result['warnings'];
			}

			return new \WP_REST_Response( $validation_response, 200 );

		} catch ( \Exception $e ) {
			return new \WP_REST_Response(
				[
					'success' => false,
					'error' => 'Validation error',
					'message' => $e->getMessage(),
					'code' => 'validation_error',
				],
				500
			);
		}
	}

	public function check_permissions(): bool {
		// Check if user can edit posts (basic capability for content conversion)
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		// Additional security checks can be added here
		return true;
	}

	private function get_convert_args(): array {
		return [
			'html' => [
				'required' => true,
				'type' => 'string',
				'description' => 'HTML content to convert to atomic widgets',
				'sanitize_callback' => [ $this, 'sanitize_html' ],
				'validate_callback' => [ $this, 'validate_html_param' ],
			],
			'options' => [
				'required' => false,
				'type' => 'object',
				'description' => 'Conversion options',
				'default' => [],
				'properties' => [
					'create_global_classes' => [
						'type' => 'boolean',
						'description' => 'Whether to create global classes',
						'default' => false,
					],
					'optimize_performance' => [
						'type' => 'boolean',
						'description' => 'Whether to optimize for performance',
						'default' => true,
					],
					'strict_validation' => [
						'type' => 'boolean',
						'description' => 'Whether to use strict validation',
						'default' => false,
					],
				],
			],
			'debug' => [
				'required' => false,
				'type' => 'boolean',
				'description' => 'Enable debug mode',
				'default' => false,
			],
			'performance' => [
				'required' => false,
				'type' => 'boolean',
				'description' => 'Enable performance monitoring',
				'default' => false,
			],
			'validation' => [
				'required' => false,
				'type' => 'boolean',
				'description' => 'Enable additional validation',
				'default' => false,
			],
		];
	}

	private function get_validate_args(): array {
		return [
			'html' => [
				'required' => true,
				'type' => 'string',
				'description' => 'HTML content to validate',
				'sanitize_callback' => [ $this, 'sanitize_html' ],
				'validate_callback' => [ $this, 'validate_html_param' ],
			],
		];
	}

	public function sanitize_html( string $html ): string {
		// Basic HTML sanitization - remove dangerous elements but preserve structure
		$allowed_tags = [
			'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			'a', 'button', 'img', 'section', 'article', 'header', 'footer',
			'main', 'aside', 'nav', 'ul', 'ol', 'li', 'blockquote',
			'strong', 'em', 'b', 'i', 'u', 'small', 'mark', 'del', 'ins',
			'sub', 'sup', 'code', 'pre',
		];

		$allowed_attributes = [
			'style', 'class', 'id', 'href', 'target', 'src', 'alt',
			'width', 'height', 'title', 'data-*',
		];

		// Use wp_kses for sanitization
		$allowed_html = [];
		foreach ( $allowed_tags as $tag ) {
			$allowed_html[ $tag ] = [];
			foreach ( $allowed_attributes as $attr ) {
				$allowed_html[ $tag ][ $attr ] = true;
			}
		}

		return wp_kses( $html, $allowed_html );
	}

	public function validate_html_param( string $html ): bool {
		// Basic validation
		if ( empty( trim( $html ) ) ) {
			return false;
		}

		// Check for maximum length (prevent abuse)
		if ( strlen( $html ) > 1024 * 1024 ) { // 1MB limit
			return false;
		}

		// Check for basic HTML structure
		if ( ! preg_match( '/<[^>]+>/', $html ) ) {
			return false;
		}

		return true;
	}

	public function get_route_namespace(): string {
		return self::ROUTE_NAMESPACE;
	}

	public function get_route_base(): string {
		return self::ROUTE_BASE;
	}

	public function get_full_route_url( string $endpoint = '' ): string {
		$base_url = rest_url( self::ROUTE_NAMESPACE . '/' . self::ROUTE_BASE );
		
		if ( ! empty( $endpoint ) ) {
			$base_url .= '/' . ltrim( $endpoint, '/' );
		}

		return $base_url;
	}
}
